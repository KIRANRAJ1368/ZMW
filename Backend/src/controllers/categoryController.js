const { Category, Subcategory, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");

const DEFAULT_CATEGORY_IMAGES = {
  mens: "/images/dept-mens.jpg",
  men: "/images/dept-mens.jpg",
  women: "/images/dept-womens.jpg",
  womens: "/images/dept-womens.jpg",
  boys: "/images/dept-boys.jpg",
  girls: "/images/dept-girls.jpg",
  babies: "/images/dept-babies.jpg",
  kids: "/images/dept-boys.jpg"
};

function attachDefaultImage(categoryJson) {
  if (!categoryJson) return categoryJson;
  if (!categoryJson.image_url) {
    const slug = (categoryJson.slug || "").toLowerCase();
    const name = (categoryJson.name || "").toLowerCase();
    categoryJson.image_url =
      DEFAULT_CATEGORY_IMAGES[slug] || DEFAULT_CATEGORY_IMAGES[name] || "/images/dept-family-banner.jpg";
  }
  return categoryJson;
}

async function list(req, res) {
  const where = req.query.includeInactive === "true" ? {} : { is_active: true };
  const categories = await Category.findAll({
    where,
    order: [["sort_order", "ASC"]],
    include: [{ model: Subcategory, as: "subcategories", where: { is_active: true }, required: false }]
  });
  const data = categories.map((c) => attachDefaultImage(c.toJSON()));
  return sendSuccess(res, { data });
}

async function getBySlug(req, res) {
  const category = await Category.findOne({
    where: { slug: req.params.slug },
    include: [{ model: Subcategory, as: "subcategories", where: { is_active: true }, required: false }]
  });
  if (!category) throw ApiError.notFound("Category not found");
  return sendSuccess(res, { data: attachDefaultImage(category.toJSON()) });
}

async function create(req, res) {
  const existing = await Category.findOne({ where: { slug: req.body.slug } });
  if (existing) throw ApiError.conflict("A category with this slug already exists");

  const category = await Category.create({
    name: req.body.name,
    slug: req.body.slug,
    description: req.body.description || null,
    image_url: req.body.image_url || null,
    sort_order: req.body.sort_order ?? 0,
    is_active: req.body.is_active ?? true
  });
  return sendSuccess(res, { statusCode: 201, data: attachDefaultImage(category.toJSON()) });
}

async function update(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  if (req.body.slug && req.body.slug !== category.slug) {
    const clash = await Category.findOne({ where: { slug: req.body.slug } });
    if (clash) throw ApiError.conflict("A category with this slug already exists");
  }

  const fields = ["name", "slug", "description", "image_url", "sort_order", "is_active"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  await category.save();
  return sendSuccess(res, { data: attachDefaultImage(category.toJSON()) });
}

async function remove(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  const productCount = await Product.count({ where: { category_id: category.id } });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete — ${productCount} product(s) still belong to this category. Reassign or delete them first.`
    );
  }

  await category.destroy();
  return sendSuccess(res, { message: "Category deleted" });
}

module.exports = { list, getBySlug, create, update, remove };
