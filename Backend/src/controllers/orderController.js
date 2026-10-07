const { Op } = require("sequelize");
const { Order, OrderItem, Product, ProductImage, ProductVariant, ProductSize, ProductColor, User, Coupon, sequelize } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildMeta } = require("../utils/pagination");
const mailer = require("../utils/mailer");
const razorpayService = require("../services/razorpayService");
const shiprocketService = require("../services/shiprocketService");
const env = require("../config/env");

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ZMW-${stamp}-${rand}`;
}

async function adjustItemStock(item, qtyChange, transaction) {
  if (!item.product_id) return;
  const product = await Product.findByPk(item.product_id, { transaction });
  if (!product) return;

  const variants = await ProductVariant.findAll({
    where: { product_id: product.id },
    include: [
      { model: ProductSize, as: "size" },
      { model: ProductColor, as: "color" }
    ],
    transaction
  });

  if (variants.length > 0) {
    const match = variants.find((v) => {
      const matchSize = !v.size || !item.size || v.size.label.toLowerCase() === String(item.size).toLowerCase();
      const matchColor = !v.color || !item.color || v.color.name.toLowerCase() === String(item.color).toLowerCase();
      return matchSize && matchColor;
    });
    if (match) {
      match.stock_count = Math.max(0, match.stock_count + qtyChange);
      await match.save({ transaction });
    }
  }

  product.stock_count = Math.max(0, product.stock_count + qtyChange);
  product.in_stock = product.stock_count > 0;
  await product.save({ transaction });
}

async function create(req, res) {
  const isGuest = !req.user;
  const userId = req.user ? req.user.id : null;

  const result = await sequelize.transaction(async (transaction) => {
    const productIds = req.body.items.map((i) => i.product_id);
    const products = await Product.findAll({ where: { id: productIds }, transaction });
    const productById = Object.fromEntries(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemRows = [];

    for (const item of req.body.items) {
      const product = productById[item.product_id];
      if (!product) throw ApiError.badRequest(`Product ${item.product_id} does not exist`);
      if (!product.is_active) throw ApiError.badRequest(`"${product.name}" is no longer available`);

      // Check variant-level stock if product has variants
      const variants = await ProductVariant.findAll({
        where: { product_id: product.id },
        include: [
          { model: ProductSize, as: "size" },
          { model: ProductColor, as: "color" }
        ],
        transaction
      });

      let matchingVariant = null;
      if (variants.length > 0) {
        matchingVariant = variants.find((v) => {
          const matchSize = item.size
            ? (v.size && v.size.label.toLowerCase() === String(item.size).toLowerCase())
            : (!v.size || v.stock_count >= item.quantity);
          const matchColor = item.color
            ? (v.color && v.color.name.toLowerCase() === String(item.color).toLowerCase())
            : (!v.color || v.stock_count >= item.quantity);
          return matchSize && matchColor;
        });

        if (matchingVariant) {
          if (matchingVariant.stock_count < item.quantity) {
            throw ApiError.badRequest(
              `"${product.name} (${item.size || ''} ${item.color || ''})" only has ${matchingVariant.stock_count} units left in stock`
            );
          }
        } else if (product.stock_count < item.quantity || product.in_stock === false) {
          throw ApiError.badRequest(`"${product.name}" does not have enough stock`);
        }
      } else if (product.in_stock === false || product.stock_count < item.quantity) {
        throw ApiError.badRequest(`"${product.name}" does not have enough stock`);
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      itemRows.push({
        product_id: product.id,
        product_name_snapshot: product.name,
        sku_snapshot: product.sku,
        size: item.size || null,
        color: item.color || null,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: lineTotal
      });

      // Deduct variant stock
      if (matchingVariant) {
        matchingVariant.stock_count = Math.max(0, matchingVariant.stock_count - item.quantity);
        await matchingVariant.save({ transaction });
      }

      // Deduct product overall stock
      product.stock_count = Math.max(0, product.stock_count - item.quantity);
      if (product.stock_count <= 0) {
        product.stock_count = 0;
        product.in_stock = false;
      }
      await product.save({ transaction });
    }

    const discountAmount = Number(req.body.discount_amount) || 0;
    let shippingFee = 60;
    let courierName = req.body.courier_name || "Shiprocket Express";
    let estimatedDelivery = req.body.estimated_delivery || "3–5 Business Days";

    if (req.body.pincode) {
      const pinRate = await shiprocketService.calculateShippingRate({
        deliveryPincode: req.body.pincode
      });
      if (pinRate.is_serviceable && pinRate.shipping_fee !== null) {
        shippingFee = pinRate.shipping_fee;
        if (pinRate.courier_name) courierName = pinRate.courier_name;
        if (pinRate.estimated_delivery) estimatedDelivery = pinRate.estimated_delivery;
      } else {
        throw ApiError.badRequest(pinRate.message || "Delivery PIN code is not serviceable by Shiprocket.");
      }
    } else if (req.body.shipping_fee !== undefined && req.body.shipping_fee !== null) {
      shippingFee = Number(req.body.shipping_fee);
    }

    const total = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

    const order = await Order.create(
      {
        order_number: generateOrderNumber(),
        customer_name: req.body.customer_name,
        email: req.body.email,
        phone: req.body.phone,
        shipping_address: req.body.shipping_address,
        city: req.body.city || null,
        state: req.body.state || null,
        pincode: req.body.pincode || null,
        payment_method: req.body.payment_method || "COD",
        status: "pending",
        shipping_status: "pending_dispatch",
        courier_name: courierName,
        estimated_delivery: estimatedDelivery,
        subtotal: Math.round(subtotal * 100) / 100,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total,
        notes: req.body.notes || null,
        user_id: userId,
        is_guest: isGuest
      },
      { transaction }
    );

    await OrderItem.bulkCreate(
      itemRows.map((row) => ({ ...row, order_id: order.id })),
      { transaction }
    );

    return order;
  });

  const full = await Order.findByPk(result.id, {
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
    ]
  });

  // After DB order is created, create corresponding shipment in Shiprocket
  try {
    const shipmentResult = await shiprocketService.createShipment(full);
    if (shipmentResult && (shipmentResult.shiprocket_order_id || shipmentResult.order_id || shipmentResult.shipment_id)) {
      full.shiprocket_order_id = String(shipmentResult.shiprocket_order_id || shipmentResult.order_id || "");
      full.shipment_id = String(shipmentResult.shipment_id || "");
      if (shipmentResult.awb_code) {
        full.awb_code = shipmentResult.awb_code;
        full.tracking_number = shipmentResult.awb_code;
      }
      if (shipmentResult.courier_name) full.courier_name = shipmentResult.courier_name;
      full.shipping_status = shipmentResult.shipping_status || "manifested";
      await full.save();
    }
  } catch (shipErr) {
    console.warn("[SHIPROCKET CREATE SHIPMENT (COD)] Notice:", shipErr.message);
  }

  // Asynchronously dispatch luxury order confirmation email without blocking API response
  if (full && full.email) {
    mailer.sendOrderConfirmationEmail(full.email, full).catch((err) => {
      console.error("[ZMW NODEMAILER] Failed to send order confirmation email:", err.message);
    });
  }

  return sendSuccess(res, { statusCode: 201, data: full });
}

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  if (req.query.is_guest !== undefined && req.query.is_guest !== "") {
    if (req.query.is_guest === "true" || req.query.is_guest === true) {
      where.is_guest = true;
    } else if (req.query.is_guest === "false" || req.query.is_guest === false) {
      where.is_guest = false;
    }
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset
  });

  return sendSuccess(res, { data: rows, meta: buildMeta({ page, limit, count }) });
}

async function getById(req, res) {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone", "created_at"] }
    ]
  });
  if (!order) throw ApiError.notFound("Order not found");
  return sendSuccess(res, { data: order });
}

async function getMyOrders(req, res) {
  const userId = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const { rows, count } = await Order.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "slug", "price"],
            include: [
              {
                model: ProductImage,
                as: "images",
                attributes: ["url", "alt_text"]
              }
            ]
          }
        ]
      }
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset
  });

  return sendSuccess(res, { data: rows, meta: buildMeta({ page, limit, count }) });
}

async function updateStatus(req, res) {
  const newStatus = req.body.status;
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: "items" }]
  });
  if (!order) throw ApiError.notFound("Order not found");

  const prevStatus = order.status;
  if (prevStatus === newStatus) {
    return sendSuccess(res, { data: order });
  }

  await sequelize.transaction(async (transaction) => {
    // If transitioning to cancelled / returned from an active state, restore inventory
    if (
      (newStatus === "cancelled" || newStatus === "returned") &&
      prevStatus !== "cancelled" &&
      prevStatus !== "returned"
    ) {
      for (const item of order.items) {
        await adjustItemStock(item, item.quantity, transaction);
      }
    }
    // If transitioning from cancelled back to active, decrement inventory
    else if (
      (prevStatus === "cancelled" || prevStatus === "returned") &&
      newStatus !== "cancelled" &&
      newStatus !== "returned"
    ) {
      for (const item of order.items) {
        await adjustItemStock(item, -item.quantity, transaction);
      }
    }

    order.status = newStatus;
    await order.save({ transaction });
  });

  return sendSuccess(res, { data: order });
}

async function cancelOrder(req, res) {
  const userId = req.user ? req.user.id : null;
  const orderId = req.params.id;

  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: "items" }]
  });
  if (!order) throw ApiError.notFound("Order not found");

  // Check ownership unless admin
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    if (!userId || order.user_id !== userId) {
      throw ApiError.forbidden("You do not have permission to cancel this order.");
    }
  }

  // Only allowed if in pending or confirmed status
  if (order.status !== "pending" && order.status !== "confirmed") {
    throw ApiError.badRequest(
      `Cannot cancel order because it is already "${order.status}". Please contact customer care for returns assistance.`
    );
  }

  const reason = req.body.reason || "Cancelled by customer";

  await sequelize.transaction(async (transaction) => {
    // Restore stock for all line items
    for (const item of order.items) {
      await adjustItemStock(item, item.quantity, transaction);
    }

    order.status = "cancelled";
    order.notes = order.notes ? `${order.notes} | Cancellation: ${reason}` : `Cancellation: ${reason}`;
    await order.save({ transaction });
  });

  return sendSuccess(res, {
    message: "Your order has been cancelled successfully. Any payment made will be refunded within 3-5 business days.",
    data: order
  });
}

async function trackOrder(req, res) {
  const { orderNumber, email, phone } = req.query;

  if (!orderNumber) {
    throw ApiError.badRequest("Order number is required for tracking.");
  }

  const cleanOrderNumber = orderNumber.trim();
  const where = { order_number: cleanOrderNumber };

  const order = await Order.findOne({
    where,
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "slug"],
            include: [
              {
                model: ProductImage,
                as: "images",
                attributes: ["url"]
              }
            ]
          }
        ]
      }
    ]
  });

  if (!order) {
    throw ApiError.notFound(`No order found matching "${cleanOrderNumber}". Please verify your order number.`);
  }

  // If email or phone is provided, verify match for privacy
  if (email && email.trim()) {
    if (order.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      throw ApiError.badRequest("The email address provided does not match the records for this order.");
    }
  } else if (phone && phone.trim()) {
    const cleanPhone = phone.replace(/\D/g, "");
    const orderPhone = (order.phone || "").replace(/\D/g, "");
    if (!orderPhone.includes(cleanPhone) && !cleanPhone.includes(orderPhone)) {
      throw ApiError.badRequest("The phone number provided does not match the records for this order.");
    }
  }

  const createdAt = new Date(order.created_at || order.createdAt);
  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const isConfirmed = ["confirmed", "packed", "shipped", "delivered"].includes(order.status);
  const isPacked = ["packed", "shipped", "delivered"].includes(order.status);
  const isShipped = ["shipped", "delivered"].includes(order.status);
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const isReturned = order.status === "returned";

  const timeline = [
    {
      step: "Order Placed",
      label: "Order Placed & Acknowledged",
      date: formatDate(createdAt),
      done: true,
      active: order.status === "pending"
    },
    {
      step: "Payment Verified",
      label: order.payment_method === "COD" ? "Cash on Delivery Acknowledged" : "Payment Verified via Gateway",
      date: isConfirmed ? formatDate(new Date(createdAt.getTime() + 15 * 60 * 1000)) : "Pending confirmation",
      done: isConfirmed,
      active: order.status === "confirmed"
    },
    {
      step: "Packed",
      label: "Quality Inspected & Packed in Premium Box",
      date: isPacked ? formatDate(new Date(createdAt.getTime() + 6 * 3600 * 1000)) : "Pending packing",
      done: isPacked,
      active: order.status === "packed"
    },
    {
      step: "Dispatched",
      label: "Dispatched via Express Courier (BlueDart / Delhivery)",
      date: isShipped ? formatDate(new Date(createdAt.getTime() + 24 * 3600 * 1000)) : "Pending dispatch",
      done: isShipped,
      active: order.status === "shipped"
    },
    {
      step: "Delivered",
      label: "Delivered to Doorstep",
      date: isDelivered ? formatDate(new Date(createdAt.getTime() + 72 * 3600 * 1000)) : "Estimated 3-5 business days",
      done: isDelivered,
      active: order.status === "delivered"
    }
  ];

  const estimatedDelivery = new Date(createdAt.getTime() + 72 * 3600 * 1000);

  return sendSuccess(res, {
    data: {
      orderId: order.order_number,
      orderNumber: order.order_number,
      status: order.status,
      isCancelled,
      isReturned,
      carrier: "BlueDart Express Global",
      trackingCarrier: "BlueDart Express Global",
      trackingNumber: `BD-${order.order_number.replace(/^ZMW-/, "")}`,
      estimatedDelivery,
      origin: "ZMW Dispatch Hub, 123, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu, India",
      destination: `${order.shipping_address}, ${order.city || ""}, ${order.state || ""} - ${order.pincode || ""}`.trim(),
      customerName: order.customer_name,
      total: order.total,
      paymentMethod: order.payment_method,
      items: order.items,
      timeline,
      steps: timeline
    }
  });
}

async function calculateOrderFinancials({ items, couponCode, pincode, isCod = false, shippingFeeOverride, transaction }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest("At least one item is required");
  }

  const productIds = items.map((i) => i.product_id || i.productId);
  const products = await Product.findAll({ where: { id: productIds }, transaction });
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const itemRows = [];

  for (const item of items) {
    const pId = item.product_id || item.productId;
    const product = productById[pId];
    if (!product) throw ApiError.badRequest(`Product ${pId} does not exist`);
    if (!product.is_active) throw ApiError.badRequest(`"${product.name}" is no longer available`);

    const qty = parseInt(item.quantity, 10);
    if (!qty || qty < 1) throw ApiError.badRequest("Item quantity must be at least 1");

    const variants = await ProductVariant.findAll({
      where: { product_id: product.id },
      include: [
        { model: ProductSize, as: "size" },
        { model: ProductColor, as: "color" }
      ],
      transaction
    });

    let matchingVariant = null;
    if (variants.length > 0) {
      // 1. Try exact match on size and color
      matchingVariant = variants.find((v) => {
        const matchSize = item.size
          ? (v.size && v.size.label.toLowerCase() === String(item.size).toLowerCase())
          : true;
        const matchColor = item.color
          ? (v.color && v.color.name.toLowerCase() === String(item.color).toLowerCase())
          : true;
        return matchSize && matchColor && v.stock_count >= qty;
      });

      // 2. Fallback to matching size with any in-stock color variant
      if (!matchingVariant && item.size) {
        matchingVariant = variants.find((v) => {
          const matchSize = v.size && v.size.label.toLowerCase() === String(item.size).toLowerCase();
          return matchSize && v.stock_count >= qty;
        });
      }

      // 3. Fallback to any available variant with sufficient stock
      if (!matchingVariant) {
        matchingVariant = variants.find((v) => v.stock_count >= qty);
      }

      if (matchingVariant) {
        if (matchingVariant.stock_count < qty) {
          throw ApiError.badRequest(
            `"${product.name} (${item.size || ''} ${item.color || ''})" only has ${matchingVariant.stock_count} units left in stock`
          );
        }
      } else if (product.stock_count < qty || product.in_stock === false) {
        throw ApiError.badRequest(`"${product.name}" is currently out of stock`);
      }
    } else if (product.in_stock === false || product.stock_count < qty) {
      throw ApiError.badRequest(`"${product.name}" does not have enough stock`);
    }

    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    itemRows.push({
      product_id: product.id,
      product_name_snapshot: product.name,
      sku_snapshot: product.sku,
      size: item.size || null,
      color: item.color || null,
      unit_price: unitPrice,
      quantity: qty,
      line_total: lineTotal,
      matchingVariant,
      product
    });
  }

  let discountAmount = 0;
  let coupon = null;
  if (couponCode) {
    const cleanCode = String(couponCode).trim().toUpperCase();
    coupon = await Coupon.findOne({ where: { code: cleanCode, is_active: true }, transaction });
    if (coupon) {
      const isExpired = coupon.expires_at && new Date() > new Date(coupon.expires_at);
      const isLimitReached = coupon.usage_limit && coupon.times_used >= coupon.usage_limit;
      const minSpend = Number(coupon.min_spend) || 0;
      if (!isExpired && !isLimitReached && subtotal >= minSpend) {
        const discountVal = Number(coupon.discount_value);
        if (coupon.discount_type === "percentage") {
          discountAmount = (subtotal * discountVal) / 100;
          if (coupon.max_discount && Number(coupon.max_discount) > 0) {
            discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
          }
        } else {
          discountAmount = Math.min(subtotal, discountVal);
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
      }
    }
  }

  let shippingFee = 60;
  let courierName = "Shiprocket Express";
  let estimatedDelivery = "3–5 Business Days";

  if (pincode) {
    const pinRate = await shiprocketService.calculateShippingRate({
      deliveryPincode: pincode
    });
    if (pinRate.is_serviceable && pinRate.shipping_fee !== null) {
      shippingFee = pinRate.shipping_fee;
      if (pinRate.courier_name) courierName = pinRate.courier_name;
      if (pinRate.estimated_delivery) estimatedDelivery = pinRate.estimated_delivery;
    } else {
      throw ApiError.badRequest(pinRate.message || "Delivery PIN code is not serviceable by Shiprocket.");
    }
  } else if (shippingFeeOverride !== undefined && shippingFeeOverride !== null) {
    shippingFee = Number(shippingFeeOverride);
  }

  const total = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    shippingFee,
    courierName,
    estimatedDelivery,
    total,
    itemRows,
    coupon
  };
}

async function createRazorpayOrder(req, res) {
  const items = req.body.items;
  if (!items || !items.length) {
    throw ApiError.badRequest("At least one item is required");
  }

  const pincode = req.body.pincode || req.body.postalCode || req.body.postal_code;
  const shippingFeeOverride = req.body.shipping_fee !== undefined ? req.body.shipping_fee : req.body.shippingFee;

  const financials = await calculateOrderFinancials({
    items,
    couponCode: req.body.coupon_code || req.body.couponCode,
    pincode,
    isCod: false,
    shippingFeeOverride
  });

  const amountInPaise = Math.round(financials.total * 100);
  if (amountInPaise <= 0) {
    throw ApiError.badRequest("Order total must be greater than zero for online payment");
  }

  const receipt = generateOrderNumber();
  const rzpOrder = await razorpayService.createOrder({
    amountInPaise,
    currency: "INR",
    receipt,
    notes: {
      customer_name: (req.body.customer_name || "").slice(0, 40),
      email: (req.body.email || "").slice(0, 40),
      phone: (req.body.phone || "").slice(0, 30),
      receipt
    }
  });

  return sendSuccess(res, {
    data: {
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: razorpayService.getKeyId(),
      calculated_total: financials.total,
      subtotal: financials.subtotal,
      discount_amount: financials.discountAmount,
      shipping_fee: financials.shippingFee
    }
  });
}

async function verifyRazorpayPayment(req, res) {
  const razorpay_order_id = req.body.razorpay_order_id || req.body.razorpayOrderId;
  const razorpay_payment_id = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
  const razorpay_signature = req.body.razorpay_signature || req.body.razorpaySignature;
  const order_data = req.body.order_data || req.body.orderData || req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw ApiError.badRequest("Missing required Razorpay payment verification parameters.");
  }
  if (!order_data || !Array.isArray(order_data.items) || order_data.items.length === 0) {
    throw ApiError.badRequest("Missing required order data items.");
  }

  // 1. Verify HMAC signature securely
  const isValid = razorpayService.verifySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature
  });

  if (!isValid) {
    throw ApiError.badRequest("Payment signature verification failed. Untrusted or tampered transaction.");
  }

  // 2. Idempotency check: prevent duplicate order creation on network retries
  const existingOrder = await Order.findOne({
    where: {
      notes: { [Op.like]: `%${razorpay_payment_id}%` }
    },
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
    ]
  });
  if (existingOrder) {
    return sendSuccess(res, { statusCode: 200, data: existingOrder });
  }

  const isGuest = !req.user;
  const userId = req.user ? req.user.id : null;

  // 3. Database transaction to create order, deduct stock, increment coupon
  const result = await sequelize.transaction(async (transaction) => {
    const financials = await calculateOrderFinancials({
      items: order_data.items,
      couponCode: order_data.coupon_code || order_data.couponCode,
      pincode: order_data.pincode,
      isCod: false,
      shippingFeeOverride: order_data.shipping_fee,
      transaction
    });

    for (const row of financials.itemRows) {
      if (row.matchingVariant) {
        row.matchingVariant.stock_count = Math.max(0, row.matchingVariant.stock_count - row.quantity);
        await row.matchingVariant.save({ transaction });
      }

      row.product.stock_count = Math.max(0, row.product.stock_count - row.quantity);
      if (row.product.stock_count <= 0) {
        row.product.stock_count = 0;
        row.product.in_stock = false;
      }
      await row.product.save({ transaction });
    }

    if (financials.coupon) {
      financials.coupon.times_used = (financials.coupon.times_used || 0) + 1;
      await financials.coupon.save({ transaction });
    }

    const orderNumber = generateOrderNumber();
    const orderNotes = [
      `Razorpay Payment Verified`,
      `Payment ID: ${razorpay_payment_id}`,
      `Order ID: ${razorpay_order_id}`,
      order_data.notes ? `Customer Note: ${order_data.notes}` : null
    ]
      .filter(Boolean)
      .join(" | ");

    const order = await Order.create(
      {
        order_number: orderNumber,
        customer_name: order_data.customer_name,
        email: order_data.email,
        phone: order_data.phone,
        shipping_address: order_data.shipping_address,
        city: order_data.city || null,
        state: order_data.state || null,
        pincode: order_data.pincode || null,
        payment_method: "PREPAID",
        status: "confirmed",
        shipping_status: "pending_dispatch",
        courier_name: order_data.courier_name || financials.courierName || "Shiprocket Express",
        estimated_delivery: order_data.estimated_delivery || financials.estimatedDelivery || "3–5 Business Days",
        subtotal: financials.subtotal,
        discount_amount: financials.discountAmount,
        shipping_fee: financials.shippingFee,
        total: financials.total,
        notes: orderNotes,
        user_id: userId,
        is_guest: isGuest
      },
      { transaction }
    );

    await OrderItem.bulkCreate(
      financials.itemRows.map((row) => ({
        order_id: order.id,
        product_id: row.product_id,
        product_name_snapshot: row.product_name_snapshot,
        sku_snapshot: row.sku_snapshot,
        size: row.size,
        color: row.color,
        unit_price: row.unit_price,
        quantity: row.quantity,
        line_total: row.line_total
      })),
      { transaction }
    );

    return order;
  });

  const full = await Order.findByPk(result.id, {
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
    ]
  });

  // After DB order is created, create corresponding shipment in Shiprocket
  try {
    const shipmentResult = await shiprocketService.createShipment(full);
    if (shipmentResult && (shipmentResult.shiprocket_order_id || shipmentResult.order_id || shipmentResult.shipment_id)) {
      full.shiprocket_order_id = String(shipmentResult.shiprocket_order_id || shipmentResult.order_id || "");
      full.shipment_id = String(shipmentResult.shipment_id || "");
      if (shipmentResult.awb_code) {
        full.awb_code = shipmentResult.awb_code;
        full.tracking_number = shipmentResult.awb_code;
      }
      if (shipmentResult.courier_name) full.courier_name = shipmentResult.courier_name;
      full.shipping_status = shipmentResult.shipping_status || "manifested";
      await full.save();
    }
  } catch (shipErr) {
    console.warn("[SHIPROCKET CREATE SHIPMENT (PREPAID)] Notice:", shipErr.message);
  }

  // Asynchronously dispatch luxury order confirmation email
  if (full && full.email) {
    mailer.sendOrderConfirmationEmail(full.email, full).catch((err) => {
      console.error("[ZMW NODEMAILER] Failed to send order confirmation email:", err.message);
    });
  }

  return sendSuccess(res, { statusCode: 201, data: full });
}

module.exports = {
  create,
  list,
  getById,
  getMyOrders,
  updateStatus,
  cancelOrder,
  trackOrder,
  createRazorpayOrder,
  verifyRazorpayPayment
};
