const { body, param } = require("express-validator");

const create = [
  body("customer_name").trim().notEmpty().withMessage("Name is required").isLength({ max: 150 }),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required").isLength({ min: 6, max: 20 }),
  body("shipping_address").trim().notEmpty().withMessage("Shipping address is required"),
  body("city").optional({ nullable: true }).isString(),
  body("state").optional({ nullable: true }).isString(),
  body("pincode").optional({ nullable: true }).isString().isLength({ max: 10 }),
  body("payment_method").optional().isIn(["COD", "PREPAID"]),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.product_id").isInt().withMessage("Each item needs a valid product_id"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Each item needs a quantity of at least 1"),
  body("items.*.size").optional({ nullable: true }).isString(),
  body("items.*.color").optional({ nullable: true }).isString(),
  body("notes").optional({ nullable: true }).isString()
];

const updateStatus = [
  param("id").isInt(),
  body("status").isIn(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"])
];

const idParam = [param("id").isInt()];

module.exports = { create, updateStatus, idParam };
