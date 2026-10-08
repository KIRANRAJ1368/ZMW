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
    order: [["sort_order", "ASC"]]
  });

  const [categories, banners] = await Promise.all([
    Category.findAll({
      where: { is_active: true },
      order: [
        ["sort_order", "ASC"],
        [{ model: Subcategory, as: "subcategories" }, "sort_order", "ASC"]
      ],
      include: [{ model: Subcategory, as: "subcategories", where: { is_active: true }, required: false }]
    }),
    Banner.findAll({ where: { is_active: true }, order: [["sort_order", "ASC"], ["updated_at", "DESC"]] })
  ]);

  const bannersByPlacement = {};
  banners.forEach((b) => {
    const placement = b.placement === "home_hero" ? "hero" : b.placement;
    if (!bannersByPlacement[placement]) bannersByPlacement[placement] = [];
    bannersByPlacement[placement].push(b);
  });

  // Alias placements so queries by 'men' or 'mens', 'women' or 'womens' always resolve
  if (bannersByPlacement["mens"] && !bannersByPlacement["men"]) {
    bannersByPlacement["men"] = bannersByPlacement["mens"];
  } else if (bannersByPlacement["men"] && !bannersByPlacement["mens"]) {
    bannersByPlacement["mens"] = bannersByPlacement["men"];
  }
  if (bannersByPlacement["women"] && !bannersByPlacement["womens"]) {
    bannersByPlacement["womens"] = bannersByPlacement["women"];
  } else if (bannersByPlacement["womens"] && !bannersByPlacement["women"]) {
    bannersByPlacement["women"] = bannersByPlacement["womens"];
  }

  const newArrivalsSection = sections.find((s) => s.section_key === "new_arrivals");
  const bestSellersSection = sections.find((s) => s.section_key === "best_sellers");

  const newArrivalsLimit = Math.max(1, Number(newArrivalsSection?.config?.limit) || 12);
  let newArrivalsPromise;
  if (
    newArrivalsSection?.config?.mode === "manual" &&
    Array.isArray(newArrivalsSection.config.product_ids) &&
    newArrivalsSection.config.product_ids.length > 0
  ) {
    newArrivalsPromise = Product.findAll({
      where: { id: newArrivalsSection.config.product_ids, is_active: true },
      include: PRODUCT_INCLUDES,
      limit: newArrivalsLimit
    });
  } else {
    newArrivalsPromise = Product.findAll({
      where: { is_active: true, is_new_arrival: true },
      include: PRODUCT_INCLUDES,
      order: [["created_at", "DESC"]],
      limit: newArrivalsLimit
    }).then(async (items) => {
      if (items.length > 0) return items;
      // Fallback to latest products if none explicitly marked as new arrival
      return Product.findAll({
        where: { is_active: true },
        include: PRODUCT_INCLUDES,
        order: [["created_at", "DESC"]],
        limit: newArrivalsLimit
      });
    });
  }

  const bestSellersLimit = Math.max(1, Number(bestSellersSection?.config?.limit) || 12);
  let bestSellersPromise;
  if (
    bestSellersSection?.config?.mode === "manual" &&
    Array.isArray(bestSellersSection.config.product_ids) &&
    bestSellersSection.config.product_ids.length > 0
  ) {
    bestSellersPromise = Product.findAll({
      where: { id: bestSellersSection.config.product_ids, is_active: true },
      include: PRODUCT_INCLUDES,
      limit: bestSellersLimit
    });
  } else {
    bestSellersPromise = Product.findAll({
      where: { is_active: true, is_best_seller: true },
      include: PRODUCT_INCLUDES,
      order: [["review_count", "DESC"]],
      limit: bestSellersLimit
    }).then(async (items) => {
      if (items.length > 0) return items;
      // Fallback to top reviewed products
      return Product.findAll({
        where: { is_active: true },
        include: PRODUCT_INCLUDES,
        order: [["review_count", "DESC"], ["rating", "DESC"]],
        limit: bestSellersLimit
      });
    });
  }

  const [newArrivals, bestSellers] = await Promise.all([newArrivalsPromise, bestSellersPromise]);

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

const SECTION_TO_CATEGORY_SLUG_MAP = {
  mens_categories: "mens",
  womens_categories: "women",
  boys_categories: "boys",
  girls_categories: "girls",
  babies_categories: "babies"
};

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

  if (req.body.is_active !== undefined) {
    const catSlug = SECTION_TO_CATEGORY_SLUG_MAP[req.params.key];
    if (catSlug) {
      await Category.update(
        { show_on_homepage: Boolean(req.body.is_active) },
        { where: { slug: catSlug } }
      );
    }
  }

  return sendSuccess(res, { data: section });
}

module.exports = { getHomePayload, listSections, updateSection };
