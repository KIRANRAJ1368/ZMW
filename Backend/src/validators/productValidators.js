const { body, param } = require("express-validator");

// Factory so the create and update chains never share chain objects.
// express-validator v7 chain methods (including .optional()) mutate the
// chain they run on and return the same instance, so mapping .optional()
// over `create` would silently overwrite create's own optional settings.
function productRules() {
  return [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 200 }),
    body("slug")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage("Slug may only contain lowercase letters, numbers and hyphens"),
    body("sku").optional({ values: "falsy" }).trim().isLength({ max: 60 }),
    body("category_id").isInt().withMessage("category_id is required"),
    body("subcategory_id").optional({ values: "null" }).isInt(),
    body("product_type").optional({ values: "null" }).isString().isLength({ max: 60 }),
    body("description").optional({ values: "null" }).isString(),
    body("price").isFloat({ min: 500 }).withMessage("Selling price must be at least ₹500"),
    body("original_price")
      .optional({ values: "null" })
      .isFloat({ min: 500 })
      .withMessage("Original / MRP price must be at least ₹500")
      .custom((value, { req }) =>
        req.body.price === undefined || req.body.price === null || req.body.price === "" || Number(value) > Number(req.body.price)
      )
      .withMessage("Original / MRP price must be higher than selling price"),
    body("stock_count").optional().isInt({ min: 0 }),
    body("in_stock").optional().isBoolean(),
    body("is_best_seller").optional().isBoolean(),
    body("is_new_arrival").optional().isBoolean(),
    body("is_sale").optional().isBoolean(),
    body("badge_label").optional({ values: "null" }).isString().isLength({ max: 40 }),
    body("badge_type").optional({ values: "null" }).isIn(["hot", "new", "sale"]),
    body("images")
      .isArray({ min: 2, max: 10 })
      .withMessage("At least 2 product images are required (1 Main product image + at least 1 gallery photo). Maximum 10 images allowed."),
    body("images.*")
      .custom((val) => {
        if (typeof val === "string" && val.trim().length > 0) return true;
        if (typeof val === "object" && val !== null && typeof val.url === "string" && val.url.trim().length > 0) return true;
        throw new Error("Invalid image entry");
      })
      .withMessage("Each image must have a valid URL"),
    body("colors").optional().isArray(),
    body("colors.*.name").optional().isString().notEmpty(),
    body("colors.*.hex").optional().isString(),
    body("colors.*.hex_code").optional().isString(),
    body("sizes").optional().isArray(),
    body("sizes.*").optional(),
    body("variants").optional().isArray(),
    body("variants.*.size").optional({ values: "null" }),
    body("variants.*.color").optional({ values: "null" }),
    body("variants.*.stock_count").optional().isInt({ min: 0 }),
    body("variants.*.sku_suffix").optional({ values: "null" }),
    body("variants.*.price_override").optional({ values: "null" })
  ];
}

const create = productRules();

const update = [param("id").isInt(), ...productRules().map((rule) => rule.optional({ values: "null" }))];

const idParam = [param("id").isInt().withMessage("Invalid product id")];

module.exports = { create, update, idParam };
