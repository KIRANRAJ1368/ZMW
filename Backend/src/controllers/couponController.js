const { Coupon } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");

async function validate(req, res) {
  const { code, subtotal } = req.body;
  if (!code) {
    throw ApiError.badRequest("Coupon code is required");
  }

  const cleanCode = (code || "").trim().toUpperCase();
  const cartSubtotal = Number(subtotal) || 0;

  const coupon = await Coupon.findOne({ where: { code: cleanCode, is_active: true } });
  if (!coupon) {
    throw ApiError.badRequest("Invalid or expired coupon code");
  }

  if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
    throw ApiError.badRequest("This coupon code has expired");
  }

  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    throw ApiError.badRequest("This coupon code has reached its maximum usage limit");
  }

  const minSpend = Number(coupon.min_spend) || 0;
  if (cartSubtotal < minSpend) {
    throw ApiError.badRequest(
      `Minimum spend of ₹${minSpend.toLocaleString("en-IN")} required for coupon ${cleanCode}`
    );
  }

  let discountAmount = 0;
  const discountVal = Number(coupon.discount_value);

  if (coupon.discount_type === "percentage") {
    discountAmount = (cartSubtotal * discountVal) / 100;
    if (coupon.max_discount && Number(coupon.max_discount) > 0) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
    }
  } else {
    discountAmount = Math.min(cartSubtotal, discountVal);
  }

  return sendSuccess(res, {
    message: `Coupon ${cleanCode} applied successfully!`,
    data: {
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: discountVal,
      discount_amount: Math.round(discountAmount * 100) / 100
    }
  });
}

async function list(req, res) {
  const coupons = await Coupon.findAll({ order: [["created_at", "DESC"]] });
  return sendSuccess(res, { data: coupons });
}

async function create(req, res) {
  const {
    code,
    description,
    discount_type,
    discount_value,
    min_spend,
    max_discount,
    usage_limit,
    expires_at,
    is_active
  } = req.body;

  if (!code || !discount_value) {
    throw ApiError.badRequest("Coupon code and discount value are required");
  }

  const existing = await Coupon.findOne({ where: { code: code.trim().toUpperCase() } });
  if (existing) {
    throw ApiError.badRequest("A coupon with this code already exists");
  }

  const coupon = await Coupon.create({
    code,
    description: description || null,
    discount_type: discount_type || "percentage",
    discount_value: Number(discount_value),
    min_spend: Number(min_spend) || 0,
    max_discount: max_discount ? Number(max_discount) : null,
    usage_limit: usage_limit ? Number(usage_limit) : null,
    expires_at: expires_at || null,
    is_active: is_active !== undefined ? Boolean(is_active) : true
  });

  return sendSuccess(res, { statusCode: 201, data: coupon });
}

async function update(req, res) {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) throw ApiError.notFound("Coupon not found");

  const fields = [
    "description",
    "discount_type",
    "discount_value",
    "min_spend",
    "max_discount",
    "usage_limit",
    "expires_at",
    "is_active"
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  if (req.body.code) {
    coupon.code = req.body.code;
  }

  await coupon.save();
  return sendSuccess(res, { data: coupon });
}

async function remove(req, res) {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) throw ApiError.notFound("Coupon not found");
  await coupon.destroy();
  return sendSuccess(res, { message: "Coupon deleted successfully" });
}

module.exports = {
  validate,
  list,
  create,
  update,
  remove
};
