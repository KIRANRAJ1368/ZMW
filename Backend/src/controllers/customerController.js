const { Op } = require("sequelize");
const { User, Order, sequelize } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildMeta } = require("../utils/pagination");

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};

  if (req.query.search) {
    const q = `%${req.query.search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: q } },
      { email: { [Op.like]: q } },
      { phone: { [Op.like]: q } }
    ];
  }

  const count = await User.count({ where });

  const rows = await User.findAll({
    where,
    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "is_active",
      "created_at",
      "updated_at",
      [sequelize.literal("(SELECT COUNT(*) FROM orders WHERE orders.user_id = User.id)"), "order_count"],
      [sequelize.literal("(SELECT COALESCE(SUM(total), 0) FROM orders WHERE orders.user_id = User.id)"), "total_spent"]
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset
  });

  return sendSuccess(res, {
    data: rows,
    meta: buildMeta({ page, limit, count })
  });
}

async function getById(req, res) {
  const user = await User.findByPk(req.params.id, {
    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "is_active",
      "created_at",
      "updated_at",
      [sequelize.literal("(SELECT COUNT(*) FROM orders WHERE orders.user_id = User.id)"), "order_count"],
      [sequelize.literal("(SELECT COALESCE(SUM(total), 0) FROM orders WHERE orders.user_id = User.id)"), "total_spent"]
    ],
    include: [
      {
        model: Order,
        as: "orders",
        attributes: ["id", "order_number", "status", "payment_method", "total", "created_at"]
      }
    ],
    order: [[{ model: Order, as: "orders" }, "created_at", "DESC"]]
  });

  if (!user) {
    throw ApiError.notFound("Customer not found");
  }

  return sendSuccess(res, { data: user });
}

module.exports = { list, getById };
