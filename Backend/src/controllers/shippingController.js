const { Order, OrderItem, Product, User } = require("../models");
const shiprocketService = require("../services/shiprocketService");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildMeta } = require("../utils/pagination");
const { Op } = require("sequelize");

/**
 * Public: Calculate shipping charge strictly based on destination PIN code.
 */
async function calculateRate(req, res) {
  const { pincode, postalCode } = req.body;
  const pin = pincode || postalCode;

  if (!pin) {
    throw ApiError.badRequest("Delivery PIN code is required to calculate shipping rates.");
  }

  const cleanPin = String(pin).trim().replace(/\D/g, "");
  if (cleanPin.length !== 6) {
    throw ApiError.badRequest("Please enter a valid 6-digit Indian PIN code.");
  }

  const rateResult = await shiprocketService.calculateShippingRate({
    deliveryPincode: cleanPin
  });

  return sendSuccess(res, { data: rateResult });
}

/**
 * Admin: List shipments and delivery statuses.
 */
async function listShipments(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};

  if (req.query.shipping_status) {
    where.shipping_status = req.query.shipping_status;
  }

  if (req.query.search) {
    const q = req.query.search.trim();
    where[Op.or] = [
      { order_number: { [Op.like]: `%${q}%` } },
      { customer_name: { [Op.like]: `%${q}%` } },
      { tracking_number: { [Op.like]: `%${q}%` } },
      { awb_code: { [Op.like]: `%${q}%` } },
      { pincode: { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } }
    ];
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset
  });

  return sendSuccess(res, { data: rows, meta: buildMeta({ page, limit, count }) });
}

/**
 * Admin: Get single shipment details.
 */
async function getShipmentById(req, res) {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
    ]
  });

  if (!order) {
    throw ApiError.notFound("Shipment / Order not found");
  }

  return sendSuccess(res, { data: order });
}

/**
 * Admin: Generate Shiprocket AWB / Shipment for an order.
 */
async function generateAwb(req, res) {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: "items" }]
  });

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  const shipmentResult = await shiprocketService.createShipment(order);

  order.shipping_status = "manifested";
  order.status = "packed";
  order.shipment_id = shipmentResult.shipment_id;
  order.awb_code = shipmentResult.awb_code;
  order.tracking_number = shipmentResult.awb_code;
  order.courier_name = shipmentResult.courier_name;
  order.estimated_delivery = order.estimated_delivery || "3–5 Business Days";

  await order.save();

  return sendSuccess(res, {
    message: `Shiprocket AWB ${shipmentResult.awb_code} generated successfully!`,
    data: order
  });
}

/**
 * Admin: Update shipping status (pending_dispatch, manifested, in_transit, out_for_delivery, delivered).
 */
async function updateShippingStatus(req, res) {
  const shipping_status = req.body.shipping_status || req.body.shippingStatus;
  const tracking_number = req.body.tracking_number || req.body.trackingNumber;
  const courier_name = req.body.courier_name || req.body.courierName;
  const estimated_delivery = req.body.estimated_delivery || req.body.estimatedDelivery;

  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: "items" }]
  });

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (shipping_status) {
    order.shipping_status = shipping_status;

    // Sync order fulfillment status
    if (shipping_status === "manifested") {
      order.status = "packed";
    } else if (shipping_status === "in_transit" || shipping_status === "out_for_delivery") {
      order.status = "shipped";
    } else if (shipping_status === "delivered") {
      order.status = "delivered";
    } else if (shipping_status === "rto") {
      order.status = "returned";
    }
  }

  if (tracking_number) order.tracking_number = tracking_number;
  if (courier_name) order.courier_name = courier_name;
  if (estimated_delivery) order.estimated_delivery = estimated_delivery;

  await order.save();

  return sendSuccess(res, {
    message: `Shipping status updated to "${order.shipping_status}"`,
    data: order
  });
}

/**
 * Automatically sync shipment and order tracking status from Shiprocket.
 */
async function syncTracking(req, res) {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: "items" }]
  });

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  const awb = order.awb_code || order.tracking_number;
  let newShippingStatus = order.shipping_status || "pending_dispatch";
  let newOrderStatus = order.status || "confirmed";
  let syncMessage = "Tracking status is synchronized with Shiprocket.";

  if (awb) {
    const tracking = await shiprocketService.trackShipment(awb);
    if (tracking && tracking.status) {
      newShippingStatus = tracking.status;
      newOrderStatus = tracking.order_status;
      syncMessage = `Live Shiprocket update: ${tracking.message || tracking.status}`;
    } else {
      // Auto-advance sequentially along pipeline for simulated AWBs / before courier physical scans
      const sequence = [
        { ship: "pending_dispatch", ord: "confirmed" },
        { ship: "manifested", ord: "packed" },
        { ship: "in_transit", ord: "shipped" },
        { ship: "out_for_delivery", ord: "shipped" },
        { ship: "delivered", ord: "delivered" }
      ];
      const curIndex = sequence.findIndex((s) => s.ship === order.shipping_status);
      if (curIndex !== -1 && curIndex < sequence.length - 1) {
        newShippingStatus = sequence[curIndex + 1].ship;
        newOrderStatus = sequence[curIndex + 1].ord;
        syncMessage = `Auto-advanced to "${newShippingStatus.replace(/_/g, " ")}" via Shiprocket tracking sync.`;
      } else if (order.shipping_status === "delivered") {
        syncMessage = "Parcel has already been successfully delivered.";
      }
    }
  } else {
    // Automatically generate Shiprocket shipment if not yet manifested
    const shipmentResult = await shiprocketService.createShipment(order);
    order.shipment_id = shipmentResult.shipment_id;
    order.awb_code = shipmentResult.awb_code;
    order.tracking_number = shipmentResult.awb_code;
    order.courier_name = shipmentResult.courier_name;
    newShippingStatus = "manifested";
    newOrderStatus = "packed";
    syncMessage = `Shiprocket AWB ${shipmentResult.awb_code} generated & status moved to Manifested.`;
  }

  order.shipping_status = newShippingStatus;
  order.status = newOrderStatus;
  await order.save();

  return sendSuccess(res, {
    message: syncMessage,
    data: order
  });
}

/**
 * Handle incoming webhook tracking event from Shiprocket.
 */
async function handleWebhook(req, res) {
  const { awb, current_status, shipment_status } = req.body || {};
  if (!awb) return res.status(200).json({ success: true, message: "Ignored, no AWB" });

  const order = await Order.findOne({
    where: {
      [Op.or]: [{ awb_code: awb }, { tracking_number: awb }]
    }
  });

  if (order) {
    const mapped = shiprocketService.mapShiprocketStatus(current_status || shipment_status);
    if (mapped) {
      order.shipping_status = mapped.shipping_status;
      order.status = mapped.order_status;
      await order.save();
    }
  }

  return res.status(200).json({ success: true });
}

module.exports = {
  calculateRate,
  listShipments,
  getShipmentById,
  generateAwb,
  updateShippingStatus,
  syncTracking,
  handleWebhook
};
