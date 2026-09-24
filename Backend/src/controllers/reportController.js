const { Order, OrderItem, Product, Category, User, sequelize } = require("../models");
const { Op } = require("sequelize");
const { sendSuccess } = require("../utils/apiResponse");

async function salesReport(req, res) {
  const { startDate, endDate, status } = req.query;
  const where = {};

  if (startDate && endDate) {
    where.created_at = {
      [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)]
    };
  } else if (startDate) {
    where.created_at = { [Op.gte]: new Date(`${startDate}T00:00:00.000Z`) };
  } else if (endDate) {
    where.created_at = { [Op.lte]: new Date(`${endDate}T23:59:59.999Z`) };
  }

  if (status) {
    where.status = status;
  }

  const orders = await Order.findAll({
    where,
    order: [["created_at", "DESC"]]
  });

  const totalOrders = orders.length;
  const grossSales = orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
  const totalShipping = orders.reduce((sum, o) => sum + Number(o.shipping_fee || 0), 0);
  const netRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "returned")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const averageOrderValue = totalOrders > 0 ? Math.round(grossSales / totalOrders) : 0;

  // Group by date (YYYY-MM-DD)
  const byDateMap = new Map();
  orders.forEach((o) => {
    const d = new Date(o.created_at || o.createdAt).toISOString().split("T")[0];
    if (!byDateMap.has(d)) {
      byDateMap.set(d, {
        date: d,
        ordersCount: 0,
        subtotal: 0,
        discounts: 0,
        shipping: 0,
        total: 0
      });
    }
    const entry = byDateMap.get(d);
    entry.ordersCount += 1;
    entry.subtotal += Number(o.subtotal || 0);
    entry.discounts += Number(o.discount_amount || 0);
    entry.shipping += Number(o.shipping_fee || 0);
    entry.total += Number(o.total || 0);
  });

  const dailyTrend = Array.from(byDateMap.values()).sort((a, b) => b.date.localeCompare(a.date));

  return sendSuccess(res, {
    data: {
      summary: {
        totalOrders,
        grossSales,
        totalDiscounts,
        totalShipping,
        netRevenue,
        deliveredCount,
        cancelledCount,
        averageOrderValue
      },
      dailyTrend
    }
  });
}

async function productsReport(req, res) {
  // Aggregate sales by product from OrderItem
  const items = await OrderItem.findAll({
    attributes: [
      "product_id",
      "product_name_snapshot",
      "sku_snapshot",
      [sequelize.fn("SUM", sequelize.col("quantity")), "total_units_sold"],
      [sequelize.fn("SUM", sequelize.col("line_total")), "total_revenue"],
      [sequelize.fn("COUNT", sequelize.col("order_id")), "times_ordered"]
    ],
    group: ["product_id", "product_name_snapshot", "sku_snapshot"],
    order: [[sequelize.literal("total_units_sold"), "DESC"]]
  });

  // Fetch product stock and categories
  const products = await Product.findAll({
    attributes: ["id", "name", "price", "stock_count", "in_stock"],
    include: [{ model: Category, as: "category", attributes: ["name"] }]
  });
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  const rows = items.map((item) => {
    const raw = item.toJSON();
    const p = productById[raw.product_id] || {};
    return {
      productId: raw.product_id,
      productName: raw.product_name_snapshot,
      sku: raw.sku_snapshot,
      category: p.category?.name || "Uncategorized",
      currentStock: p.stock_count ?? "—",
      inStock: p.in_stock ?? false,
      unitsSold: Number(raw.total_units_sold) || 0,
      revenue: Number(raw.total_revenue) || 0,
      timesOrdered: Number(raw.times_ordered) || 0
    };
  });

  return sendSuccess(res, { data: rows });
}

async function ordersReport(req, res) {
  const { startDate, endDate, status } = req.query;
  const where = {};

  if (startDate && endDate) {
    where.created_at = {
      [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)]
    };
  } else if (startDate) {
    where.created_at = { [Op.gte]: new Date(`${startDate}T00:00:00.000Z`) };
  } else if (endDate) {
    where.created_at = { [Op.lte]: new Date(`${endDate}T23:59:59.999Z`) };
  }

  if (status) {
    where.status = status;
  }

  const orders = await Order.findAll({
    where,
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] }
    ],
    order: [["created_at", "DESC"]]
  });

  const rows = orders.map((o) => ({
    orderNumber: o.order_number,
    date: new Date(o.created_at || o.createdAt).toISOString().split("T")[0],
    customerName: o.customer_name,
    customerEmail: o.email,
    customerPhone: o.phone,
    itemCount: o.items?.length || 0,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount_amount),
    shipping: Number(o.shipping_fee),
    total: Number(o.total),
    paymentMethod: o.payment_method,
    status: o.status,
    city: o.city,
    pincode: o.pincode
  }));

  return sendSuccess(res, { data: rows });
}

module.exports = {
  salesReport,
  productsReport,
  ordersReport
};
