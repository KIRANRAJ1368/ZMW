const { body, param } = require("express-validator");

const create = [
  body("category_id").isInt().withMessage("category_id is required"),
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("slug")
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug may only contain lowercase letters, numbers and hyphens"),
  body("image_url").optional({ nullable: true }).isString(),
  body("sort_order").optional().isInt(),
  body("is_active").optional().isBoolean()
];

const update = [
  param("id").isInt(),
  body("category_id").optional().isInt(),
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug may only contain lowercase letters, numbers and hyphens"),
  body("image_url").optional({ nullable: true }).isString(),
  body("sort_order").optional().isInt(),
  body("is_active").optional().isBoolean()
];

const idParam = [param("id").isInt()];

module.exports = { create, update, idParam };
