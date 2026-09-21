const { Order, OrderItem, Product, sequelize } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildMeta } = require("../utils/pagination");

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ZMW-${stamp}-${rand}`;
}

async function create(req, res) {
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
        notes: req.body.notes || null
      },
      { transaction }
    );

    await OrderItem.bulkCreate(
      itemRows.map((row) => ({ ...row, order_id: order.id })),
      { transaction }
    );

    return order;
  });

  const full = await Order.findByPk(result.id, { include: [{ model: OrderItem, as: "items" }] });
  return sendSuccess(res, { statusCode: 201, data: full });
}

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset
  });

  return sendSuccess(res, { data: rows, meta: buildMeta({ page, limit, count }) });
}

async function getById(req, res) {
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: "items" }] });
  if (!order) throw ApiError.notFound("Order not found");
  return sendSuccess(res, { data: order });
}

async function updateStatus(req, res) {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw ApiError.notFound("Order not found");
  order.status = req.body.status;
  await order.save();
  return sendSuccess(res, { data: order });
}

module.exports = { create, list, getById, updateStatus };
