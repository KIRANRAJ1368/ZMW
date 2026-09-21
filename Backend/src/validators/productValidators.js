const { body, param } = require("express-validator");

const create = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 200 }),
  body("slug")
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug may only contain lowercase letters, numbers and hyphens"),
  body("sku").trim().notEmpty().withMessage("SKU is required").isLength({ max: 60 }),
  body("category_id").isInt().withMessage("category_id is required"),
  body("subcategory_id").optional({ nullable: true }).isInt(),
  body("product_type").optional({ nullable: true }).isString().isLength({ max: 60 }),
  body("description").optional({ nullable: true }).isString(),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("original_price").optional({ nullable: true }).isFloat({ min: 0 }),
  body("stock_count").optional().isInt({ min: 0 }),
  body("in_stock").optional().isBoolean(),
  body("is_best_seller").optional().isBoolean(),
  body("is_new_arrival").optional().isBoolean(),
  body("is_sale").optional().isBoolean(),
  body("badge_label").optional({ nullable: true }).isString().isLength({ max: 40 }),
  body("badge_type").optional({ nullable: true }).isIn(["hot", "new", "sale"]),
  body("images").optional().isArray(),
  body("images.*.url").optional().isString().notEmpty(),
  body("colors").optional().isArray(),
  body("colors.*.name").optional().isString().notEmpty(),
  body("colors.*.hex").optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body("sizes").optional().isArray(),
  body("sizes.*").optional().isString().notEmpty()
];

const update = [param("id").isInt(), ...create.map((rule) => rule.optional())];

const idParam = [param("id").isInt().withMessage("Invalid product id")];

module.exports = { create, update, idParam };
