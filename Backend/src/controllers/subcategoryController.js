const { Subcategory, Category, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");

async function list(req, res) {
  const where = req.query.includeInactive === "true" ? {} : { is_active: true };

  if (req.query.category) {
    const category = await Category.findOne({ where: { slug: req.query.category } });
    if (!category) return sendSuccess(res, { data: [] });
    where.category_id = category.id;
  }

  const subcategories = await Subcategory.findAll({
    where,
    order: [["sort_order", "ASC"]],
    include: [{ model: Category, as: "category", attributes: ["id", "name", "slug"] }]
  });
  return sendSuccess(res, { data: subcategories });
}

async function create(req, res) {
  const category = await Category.findByPk(req.body.category_id);
  if (!category) throw ApiError.badRequest("category_id does not match an existing category");

  const existing = await Subcategory.findOne({
    where: { category_id: req.body.category_id, slug: req.body.slug }
  });
  if (existing) throw ApiError.conflict("A subcategory with this slug already exists in this category");

  const subcategory = await Subcategory.create({
    category_id: req.body.category_id,
    name: req.body.name,
    slug: req.body.slug,
    image_url: req.body.image_url || null,
    sort_order: req.body.sort_order ?? 0,
    is_active: req.body.is_active ?? true
  });
  return sendSuccess(res, { statusCode: 201, data: subcategory });
}

async function update(req, res) {
  const subcategory = await Subcategory.findByPk(req.params.id);
  if (!subcategory) throw ApiError.notFound("Subcategory not found");

  if (req.body.category_id) {
    const category = await Category.findByPk(req.body.category_id);
    if (!category) throw ApiError.badRequest("category_id does not match an existing category");
  }

  const fields = ["category_id", "name", "slug", "image_url", "sort_order", "is_active"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) subcategory[f] = req.body[f];
  });
  await subcategory.save();
  return sendSuccess(res, { data: subcategory });
}

async function remove(req, res) {
  const subcategory = await Subcategory.findByPk(req.params.id);
  if (!subcategory) throw ApiError.notFound("Subcategory not found");

  const productCount = await Product.count({ where: { subcategory_id: subcategory.id } });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete — ${productCount} product(s) still use this subcategory. Reassign or delete them first.`
    );
  }

  await subcategory.destroy();
  return sendSuccess(res, { message: "Subcategory deleted" });
}

module.exports = { list, create, update, remove };
