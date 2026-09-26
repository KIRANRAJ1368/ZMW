const { Subcategory, Category, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");

const DEFAULT_SUBCATEGORY_IMAGES = {
  // Men
  "mens:round-neck-t-shirt": "/images/cat-men-round-neck.jpg",
  "mens:polo-t-shirt": "/images/cat-men-polo.jpg",
  "mens:mens-hoodies": "/images/cat-men-hoodie.jpg",
  "mens:hoodies": "/images/cat-men-hoodie.jpg",
  "mens:oversized-tees": "/images/hero-mens-oversized-tee.jpg",
  "men:round-neck-t-shirt": "/images/cat-men-round-neck.jpg",
  "men:polo-t-shirt": "/images/cat-men-polo.jpg",
  "men:mens-hoodies": "/images/cat-men-hoodie.jpg",
  "men:hoodies": "/images/cat-men-hoodie.jpg",
  "men:oversized-tees": "/images/hero-mens-oversized-tee.jpg",

  // Women
  "women:round-neck": "/images/cat-women-round-neck.jpg",
  "women:v-neck": "/images/cat-women-v-neck.jpg",
  "women:hoodies": "/images/cat-women-hoodie.jpg",
  "women:womens-tees": "/images/cat-women-tees.jpg",
  "women:round-neck-t-shirt": "/images/cat-women-round-neck.jpg",
  "womens:round-neck": "/images/cat-women-round-neck.jpg",
  "womens:v-neck": "/images/cat-women-v-neck.jpg",
  "womens:hoodies": "/images/cat-women-hoodie.jpg",
  "womens:womens-tees": "/images/cat-women-tees.jpg",
  "womens:round-neck-t-shirt": "/images/cat-women-round-neck.jpg",

  // Boys
  "boys:round-neck": "/images/cat-boys-round-neck.jpg",
  "boys:round-neck-t-shirt": "/images/cat-boys-round-neck.jpg",
  "boys:high-neck": "/images/cat-boys-high-neck.jpg",
  "boys:shorts": "/images/cat-boys-shorts.jpg",
  "boys:sweatshirts": "/images/cat-boys-hoodie.jpg",
  "boys:hoodies": "/images/cat-boys-hoodie.jpg",

  // Girls
  "girls:round-neck": "/images/cat-girls-round-neck.jpg",
  "girls:round-neck-t-shirt": "/images/cat-girls-round-neck.jpg",
  "girls:high-neck": "/images/cat-girls-high-neck.jpg",
  "girls:shorts": "/images/cat-boys-shorts.jpg",
  "girls:sweatshirts": "/images/cat-girls-high-neck.jpg",
  "girls:hoodies": "/images/cat-girls-round-neck.jpg",
  "girls:nightwear": "/images/cat-girls-nightwear.jpg",
  "girls:night-wear": "/images/cat-girls-nightwear.jpg",
  "girls:long-gown": "/images/cat-girls-long-gown.jpg",

  // Babies
  "babies:romper": "/images/cat-babies-romper.jpg",
  "babies:rompers": "/images/cat-babies-romper.jpg",
  "babies:t-shirt": "/images/cat-babies-tshirt.jpg",
  "babies:tshirt": "/images/cat-babies-tshirt.jpg",
  "babies:baby-tees": "/images/cat-babies-tshirt.jpg",
  "babies:pyjamas": "/images/cat-babies-pyjama.jpg",
  "babies:pyjama": "/images/cat-babies-pyjama.jpg",
  "babies:sweatshirts": "/images/cat-babies-romper.jpg",
  "babies:hoodies": "/images/cat-babies-romper.jpg",

  // General slug matching
  "round-neck-t-shirt": "/images/cat-men-round-neck.jpg",
  "round-neck": "/images/cat-women-round-neck.jpg",
  "polo-t-shirt": "/images/cat-men-polo.jpg",
  "v-neck": "/images/cat-women-v-neck.jpg",
  "high-neck": "/images/cat-boys-high-neck.jpg",
  "shorts": "/images/cat-boys-shorts.jpg",
  "hoodies": "/images/cat-men-hoodie.jpg",
  "mens-hoodies": "/images/cat-men-hoodie.jpg",
  "sweatshirts": "/images/cat-boys-hoodie.jpg",
  "nightwear": "/images/cat-girls-nightwear.jpg",
  "night-wear": "/images/cat-girls-nightwear.jpg",
  "long-gown": "/images/cat-girls-long-gown.jpg",
  "romper": "/images/cat-babies-romper.jpg",
  "pyjama": "/images/cat-babies-pyjama.jpg",
  "t-shirt": "/images/cat-babies-tshirt.jpg"
};

function attachDefaultImage(subJson) {
  if (!subJson) return subJson;
  if (!subJson.image_url) {
    const parentSlug = (subJson.category?.slug || "").toLowerCase();
    const subSlug = (subJson.slug || "").toLowerCase();
    const subName = (subJson.name || "").toLowerCase();
    const combo = `${parentSlug}:${subSlug}`;

    if (DEFAULT_SUBCATEGORY_IMAGES[combo]) {
      subJson.image_url = DEFAULT_SUBCATEGORY_IMAGES[combo];
    } else if (DEFAULT_SUBCATEGORY_IMAGES[subSlug]) {
      subJson.image_url = DEFAULT_SUBCATEGORY_IMAGES[subSlug];
    } else if (subName.includes("round neck") || subName.includes("tee")) {
      subJson.image_url = parentSlug === "women" ? "/images/cat-women-round-neck.jpg" : "/images/cat-men-round-neck.jpg";
    } else if (subName.includes("hoodie") || subName.includes("sweatshirt")) {
      subJson.image_url = parentSlug === "women" ? "/images/cat-women-hoodie.jpg" : "/images/cat-men-hoodie.jpg";
    } else if (subName.includes("romper")) {
      subJson.image_url = "/images/cat-babies-romper.jpg";
    } else if (subName.includes("pyjama") || subName.includes("night")) {
      subJson.image_url = "/images/cat-babies-pyjama.jpg";
    } else {
      subJson.image_url = "/images/cat-men-round-neck.jpg";
    }
  }
  return subJson;
}

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
  const data = subcategories.map((s) => attachDefaultImage(s.toJSON()));
  return sendSuccess(res, { data });
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
  return sendSuccess(res, { statusCode: 201, data: attachDefaultImage(subcategory.toJSON()) });
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
  return sendSuccess(res, { data: attachDefaultImage(subcategory.toJSON()) });
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
