const { Product, Category, Order, ContactSubmission } = require("../models");
const { sendSuccess } = require("../utils/apiResponse");

async function summary(req, res) {
  const [productCount, activeProductCount, categoryCount, pendingOrders, newContactCount, lowStockCount] =
    await Promise.all([
      Product.count(),
      Product.count({ where: { is_active: true } }),
      Category.count({ where: { is_active: true } }),
      Order.count({ where: { status: "pending" } }),
      ContactSubmission.count({ where: { status: "new" } }),
      Product.count({ where: { in_stock: true, stock_count: { [require("sequelize").Op.lte]: 5 } } })
    ]);

  return sendSuccess(res, {
    data: { productCount, activeProductCount, categoryCount, pendingOrders, newContactCount, lowStockCount }
  });
}

module.exports = { summary };
