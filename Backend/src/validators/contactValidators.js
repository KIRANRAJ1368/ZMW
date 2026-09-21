const { body, param } = require("express-validator");

const create = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 150 }),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("phone").optional({ nullable: true }).isString().isLength({ max: 20 }),
  body("subject").optional({ nullable: true }).isString().isLength({ max: 200 }),
  body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 5000 })
];

const updateStatus = [param("id").isInt(), body("status").isIn(["new", "read", "responded"])];

const idParam = [param("id").isInt()];

module.exports = { create, updateStatus, idParam };
