const { Category, Subcategory, Product, HomepageSection, Banner } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");

const CATEGORY_SECTION_KEY_MAP = {
  mens: "mens_categories",
  men: "mens_categories",
  women: "womens_categories",
  womens: "womens_categories",
  boys: "boys_categories",
  girls: "girls_categories",
  babies: "babies_categories"
};

async function list(req, res) {
  const where = req.query.includeInactive === "true" ? {} : { is_active: true };
  const categories = await Category.findAll({
    where,
    order: [["sort_order", "ASC"]],
    include: [{ model: Subcategory, as: "subcategories", where: { is_active: true }, required: false }]
  });
  const data = categories.map((c) => c.toJSON());
  return sendSuccess(res, { data });
}

async function getBySlug(req, res) {
  const category = await Category.findOne({
    where: { slug: req.params.slug },
    include: [{ model: Subcategory, as: "subcategories", where: { is_active: true }, required: false }]
  });
  if (!category) throw ApiError.notFound("Category not found");
  return sendSuccess(res, { data: category.toJSON() });
}

async function create(req, res) {
  const name = (req.body.name || "").trim();
  const slug = (req.body.slug || "")
    .trim()
    .toLowerCase() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const existing = await Category.findOne({ where: { slug } });
  if (existing) throw ApiError.conflict("A category with this slug already exists");

  const category = await Category.create({
    name,
    slug,
    description: req.body.description || null,
    sort_order: req.body.sort_order ?? 0,
    is_active: req.body.is_active ?? true,
    show_on_homepage: req.body.show_on_homepage ?? true
  });

  const sectionKey = CATEGORY_SECTION_KEY_MAP[category.slug];
  if (sectionKey) {
    await HomepageSection.update(
      { is_active: category.show_on_homepage },
      { where: { section_key: sectionKey } }
    );
  }

  // Automatically create a default banner for this category in the banners table
  try {
    const existingBanner = await Banner.findOne({ where: { placement: category.slug } });
    if (!existingBanner) {
      await Banner.create({
        title: `${category.name.toUpperCase()} COLLECTION`,
        subtitle: category.description || `Explore our premium ${category.name.toLowerCase()} essentials crafted for everyday comfort and modern style.`,
        placement: category.slug,
        tag: category.name,
        badge_promo: "New Collection",
        image_url: "/images/dept-family-banner.jpg",
        image_position: "75% 25%",
        primary_cta_text: "Shop Now",
        primary_cta_link: `/collection?category=${encodeURIComponent(category.slug)}`,
        secondary_cta_text: "",
        is_active: true,
        sort_order: 0
      });
    }
  } catch (bannerErr) {
    console.error("Failed to auto-create category banner:", bannerErr);
  }

  return sendSuccess(res, { statusCode: 201, data: category.toJSON() });
}

async function update(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");

  const oldSlug = category.slug;
  if (req.body.slug && req.body.slug !== category.slug) {
    const clash = await Category.findOne({ where: { slug: req.body.slug } });
    if (clash) throw ApiError.conflict("A category with this slug already exists");
  }

  const fields = ["name", "slug", "description", "sort_order", "is_active", "show_on_homepage"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  await category.save();

  // If slug changed, update corresponding banner placement
  if (req.body.slug && req.body.slug !== oldSlug) {
    try {
      await Banner.update(
        { placement: req.body.slug, tag: category.name },
        { where: { placement: oldSlug } }
      );
    } catch (bannerErr) {
      console.error("Failed to sync banner placement:", bannerErr);
    }
  }

  if (req.body.show_on_homepage !== undefined) {
    const sectionKey = CATEGORY_SECTION_KEY_MAP[category.slug];
    if (sectionKey) {
      await HomepageSection.update(
        { is_active: Boolean(category.show_on_homepage) },
        { where: { section_key: sectionKey } }
      );
    }
  }

  return sendSuccess(res, { data: category.toJSON() });
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

  // Remove corresponding category banner if any
  try {
    await Banner.destroy({ where: { placement: category.slug } });
  } catch (bannerErr) {
    console.error("Failed to delete category banner:", bannerErr);
  }

  await category.destroy();
  return sendSuccess(res, { message: "Category deleted" });
}

module.exports = { list, getBySlug, create, update, remove };
