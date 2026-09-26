const { Order, OrderItem, Product, ProductImage, User, sequelize } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildMeta } = require("../utils/pagination");
const mailer = require("../utils/mailer");

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ZMW-${stamp}-${rand}`;
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
      if (product.in_stock === false || product.stock_count < item.quantity) {
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

      product.stock_count -= item.quantity;
      if (product.stock_count <= 0) {
        product.stock_count = 0;
        product.in_stock = false;
      }
      await product.save({ transaction });
    }

    const discountAmount = req.body.discount_amount || 0;
    const shippingFee = req.body.shipping_fee || 0;
    const total = subtotal - discountAmount + shippingFee;

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
        subtotal,
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
        if (item.product_id) {
          const product = await Product.findByPk(item.product_id, { transaction });
          if (product) {
            product.stock_count += item.quantity;
            if (product.stock_count > 0) {
              product.in_stock = true;
            }
            await product.save({ transaction });
          }
        }
      }
    }
    // If transitioning from cancelled back to active, decrement inventory
    else if (
      (prevStatus === "cancelled" || prevStatus === "returned") &&
      newStatus !== "cancelled" &&
      newStatus !== "returned"
    ) {
      for (const item of order.items) {
        if (item.product_id) {
          const product = await Product.findByPk(item.product_id, { transaction });
          if (product) {
            product.stock_count = Math.max(0, product.stock_count - item.quantity);
            if (product.stock_count <= 0) {
              product.in_stock = false;
            }
            await product.save({ transaction });
          }
        }
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
      if (item.product_id) {
        const product = await Product.findByPk(item.product_id, { transaction });
        if (product) {
          product.stock_count += item.quantity;
          if (product.stock_count > 0) {
            product.in_stock = true;
          }
          await product.save({ transaction });
        }
      }
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

  return sendSuccess(res, {
    data: {
      orderId: order.order_number,
      status: order.status,
      isCancelled,
      isReturned,
      carrier: "BlueDart Express Global",
      origin: "ZMW Dispatch Hub, 123, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu, India",
      destination: `${order.shipping_address}, ${order.city || ""}, ${order.state || ""} - ${order.pincode || ""}`.trim(),
      customerName: order.customer_name,
      total: order.total,
      paymentMethod: order.payment_method,
      items: order.items,
      timeline
    }
  });
}

module.exports = { create, list, getById, getMyOrders, updateStatus, cancelOrder, trackOrder };
