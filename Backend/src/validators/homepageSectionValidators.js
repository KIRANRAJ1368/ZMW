const { body, param } = require("express-validator");

const update = [
  param("key").trim().notEmpty(),
  body("title").optional({ nullable: true }).isString(),
  body("subtitle").optional({ nullable: true }).isString(),
  body("is_active").optional().isBoolean(),
  body("sort_order").optional().isInt(),
  body("config").optional({ nullable: true }).isObject()
];

module.exports = { update };
