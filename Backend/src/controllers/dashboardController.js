const { Product, Category, Subcategory, Banner, Order, ContactSubmission, User } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");
const { Op } = require("sequelize");

const SALES_EXCLUDED_STATUSES = ["cancelled", "returned"];

async function summary(req, res) {
  const { from, to } = req.query;

  const parseDate = (value, endOfDay) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return d;
  };
  const fromDate = parseDate(from, false);
  const toDate = parseDate(to, true);

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + 1);

  const salesWhere = (extra = {}) => ({ status: { [Op.notIn]: SALES_EXCLUDED_STATUSES }, ...extra });

  const [
    productCount,
    activeProductCount,
    outOfStockCount,
    lowStockCount,
    categoryCount,
    activeCategoryCount,
    subcategoryCount,
    activeSubcategoryCount,
    bannerCount,
    activeBannerCount,
    orderCount,
    pendingOrders,
    confirmedOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    returnedOrders,
    customerCount,
    guestOrderCount,
    registeredOrderCount,
    totalSales,
    todaySales,
    rangeSales,
    newContactCount
  ] = await Promise.all([
    Product.count(),
    Product.count({ where: { is_active: true } }),
    Product.count({
      where: {
        [Op.or]: [{ in_stock: false }, { stock_count: 0 }]
      }
    }),
    Product.count({ where: { in_stock: true, stock_count: { [Op.lte]: 5 } } }),
    Category.count(),
    Category.count({ where: { is_active: true } }),
    Subcategory.count(),
    Subcategory.count({ where: { is_active: true } }),
    Banner.count(),
    Banner.count({ where: { is_active: true } }),
    Order.count(),
    Order.count({ where: { status: "pending" } }),
    Order.count({ where: { status: "confirmed" } }),
    Order.count({ where: { status: "packed" } }),
    Order.count({ where: { status: "shipped" } }),
    Order.count({ where: { status: "delivered" } }),
    Order.count({ where: { status: "cancelled" } }),
    Order.count({ where: { status: "returned" } }),
    User.count(),
    Order.count({ where: { is_guest: true } }),
    Order.count({ where: { is_guest: false } }),
    Order.sum("total", { where: salesWhere() }),
    Order.sum("total", { where: salesWhere({ createdAt: { [Op.gte]: dayStart, [Op.lt]: dayEnd } }) }),
    fromDate && toDate
      ? Order.sum("total", { where: salesWhere({ createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } }) })
      : null,
    ContactSubmission.count({ where: { status: "new" } })
  ]);

  return sendSuccess(res, {
    data: {
      productCount,
      activeProductCount,
      outOfStockCount,
      lowStockCount,
      categoryCount,
      activeCategoryCount,
      subcategoryCount,
      activeSubcategoryCount,
      bannerCount,
      activeBannerCount,
      orderCount,
      pendingOrders,
      confirmedOrders,
      packedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      customerCount,
      guestOrderCount,
      registeredOrderCount,
      totalSales: Number(totalSales) || 0,
      todaySales: Number(todaySales) || 0,
      rangeSales: rangeSales === null ? null : Number(rangeSales) || 0,
      newContactCount
    }
  });
}

module.exports = { summary };