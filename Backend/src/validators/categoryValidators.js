const { body, param } = require("express-validator");

const create = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug may only contain lowercase letters, numbers and hyphens"),
  body("description").optional({ nullable: true }).isString(),
  body("image_url").optional({ nullable: true }).isString(),
  body("sort_order").optional().isInt(),
  body("is_active").optional().isBoolean()
];

const update = [
  param("id").isInt().withMessage("Invalid category id"),
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug may only contain lowercase letters, numbers and hyphens"),
  body("description").optional({ nullable: true }).isString(),
  body("image_url").optional({ nullable: true }).isString(),
  body("sort_order").optional().isInt(),
  body("is_active").optional().isBoolean()
];

const idParam = [param("id").isInt().withMessage("Invalid category id")];

module.exports = { create, update, idParam };
