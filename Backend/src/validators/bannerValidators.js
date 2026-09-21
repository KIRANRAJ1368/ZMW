const { body, param } = require("express-validator");

const create = [
  body("placement").trim().notEmpty().withMessage("Placement is required").isLength({ max: 60 }),
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("subtitle").optional({ nullable: true }).isString(),
  body("tag").optional({ nullable: true }).isString(),
  body("badge_promo").optional({ nullable: true }).isString(),
  body("image_url").trim().notEmpty().withMessage("Image URL is required"),
  body("image_position").optional({ nullable: true }).isString(),
  body("primary_cta_text").optional({ nullable: true }).isString(),
  body("primary_cta_link").optional({ nullable: true }).isString(),
  body("secondary_cta_text").optional({ nullable: true }).isString(),
  body("secondary_cta_link").optional({ nullable: true }).isString(),
  body("sort_order").optional().isInt(),
  body("is_active").optional().isBoolean()
];

const update = [param("id").isInt(), ...create.map((rule) => rule.optional())];

const idParam = [param("id").isInt()];

module.exports = { create, update, idParam };
