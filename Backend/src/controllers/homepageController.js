const { HomepageSection, Category, Subcategory, Banner, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { serializeProduct } = require("../services/productSerializer");
const { PRODUCT_INCLUDES } = require("../services/productService");

/**
 * One call that gives the customer frontend everything the homepage
 * currently hardcodes: active sections (with their admin-configured
 * title/subtitle/order), categories+subcategories, all active banners
 * grouped by placement, and ready-to-render best-seller / new-arrival
 * product lists. Inactive/toggled-off sections are simply left out so
 * the frontend can render `sections.map(...)` without extra branching.
 */
async function getHomePayload(req, res) {
  const sections = await HomepageSection.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"]]
  });

  const [categories, banners] = await Promise.all([
    Category.findAll({
      where: { is_active: true },
      order: [["sort_order", "ASC"]],
      include: [{ model: Subcategory, as: "subcategories", where: { is_active: true }, required: false }]
    }),
    Banner.findAll({ where: { is_active: true }, order: [["sort_order", "ASC"]] })
  ]);

  const bannersByPlacement = {};
  banners.forEach((b) => {
    if (!bannersByPlacement[b.placement]) bannersByPlacement[b.placement] = [];
    bannersByPlacement[b.placement].push(b);
  });

  const newArrivalsSection = sections.find((s) => s.section_key === "new_arrivals");
  const bestSellersSection = sections.find((s) => s.section_key === "best_sellers");

  const [newArrivals, bestSellers] = await Promise.all([
    Product.findAll({
      where: { is_active: true, is_new_arrival: true },
      include: PRODUCT_INCLUDES,
      order: [["created_at", "DESC"]],
      limit: newArrivalsSection?.config?.limit || 8
    }),
    Product.findAll({
      where: { is_active: true, is_best_seller: true },
      include: PRODUCT_INCLUDES,
      order: [["review_count", "DESC"]],
      limit: bestSellersSection?.config?.limit || 8
    })
  ]);

  return sendSuccess(res, {
    data: {
      sections,
      categories,
      banners: bannersByPlacement,
      newArrivals: newArrivals.map(serializeProduct),
      bestSellers: bestSellers.map(serializeProduct)
    }
  });
}

// ── Admin: homepage section registry management ─────────────────────────

async function listSections(req, res) {
  const sections = await HomepageSection.findAll({ order: [["sort_order", "ASC"]] });
  return sendSuccess(res, { data: sections });
}

async function updateSection(req, res) {
  const section = await HomepageSection.findOne({ where: { section_key: req.params.key } });
  if (!section) throw ApiError.notFound("Homepage section not found");

  const fields = ["title", "subtitle", "is_active", "sort_order", "config"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) section[f] = req.body[f];
  });
  await section.save();
  return sendSuccess(res, { data: section });
}

module.exports = { getHomePayload, listSections, updateSection };
