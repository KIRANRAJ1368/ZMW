/* eslint-disable no-console */
// One-off conversion: reads the existing frontend's product catalog and
// writes seed-ready JSON for the new backend, so the database starts out
// with the real ZMW catalog instead of a handful of fake sample rows.
const fs = require("fs");
const path = require("path");
const data = require("./_products_source.js");

const DEPARTMENTS = [
  { slug: "mens", name: "Men", subcats: data.MEN_SUBCATEGORIES || [] },
  { slug: "women", name: "Women", subcats: data.WOMEN_SUBCATEGORIES || [] },
  { slug: "kids", name: "Kids", subcats: data.KIDS_SUBCATEGORIES || [] },
  { slug: "boys", name: "Boys", subcats: data.BOYS_SUBCATEGORIES || [] },
  { slug: "girls", name: "Girls", subcats: data.GIRLS_SUBCATEGORIES || [] },
  { slug: "babies", name: "Babies", subcats: data.BABIES_SUBCATEGORIES || [] }
];

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Make sure every subCategory actually present on a product is captured,
// even if it's missing from the department's canonical list.
const subcatsByDept = {};
DEPARTMENTS.forEach((d) => {
  subcatsByDept[d.slug] = new Set(d.subcats);
});
data.UNIFIED_PRODUCTS.forEach((p) => {
  if (!subcatsByDept[p.category]) subcatsByDept[p.category] = new Set();
  if (p.subCategory) subcatsByDept[p.category].add(p.subCategory);
});

const categories = DEPARTMENTS.map((d, i) => ({
  name: d.name,
  slug: d.slug,
  sort_order: i,
  subcategories: Array.from(subcatsByDept[d.slug] || []).map((name, j) => ({
    name,
    slug: slugify(name),
    sort_order: j
  }))
}));

const slugCounts = {};
function uniqueSlug(name, id) {
  let base = slugify(name);
  if (!base) base = "product";
  if (!slugCounts[base]) {
    slugCounts[base] = 1;
    return base;
  }
  slugCounts[base] += 1;
  return `${base}-${slugify(id)}`;
}

// The source catalog has a couple of accidental duplicate SKUs across
// unrelated products (a data-entry slip, not a real shared SKU) — keep
// every product but make the SKU column-unique.
const skuCounts = {};
function uniqueSku(sku) {
  if (!skuCounts[sku]) {
    skuCounts[sku] = 1;
    return sku;
  }
  skuCounts[sku] += 1;
  return `${sku}-${skuCounts[sku]}`;
}

const products = data.UNIFIED_PRODUCTS.map((p) => ({
  legacy_id: p.id,
  name: p.name,
  slug: uniqueSlug(p.name, p.id),
  sku: uniqueSku(p.sku),
  category_slug: p.category,
  subcategory_name: p.subCategory || null,
  product_type: p.productType || null,
  description: p.description || null,
  price: p.price,
  original_price: p.originalPrice || null,
  rating: p.rating || 0,
  review_count: p.reviewCount || 0,
  in_stock: !!p.inStock,
  stock_count: p.stockCount || 0,
  is_best_seller: !!p.isBestSeller,
  is_new_arrival: !!p.isNewArrival,
  is_sale: !!p.isSale,
  badge_label: p.badge || null,
  badge_type: ["hot", "new", "sale"].includes(p.badgeType) ? p.badgeType : null,
  images: Array.isArray(p.images) ? p.images : [],
  colors: Array.isArray(p.colors) ? p.colors.map((c) => ({ name: c.name, hex: c.hex })) : [],
  sizes: Array.isArray(p.sizes) ? p.sizes : []
}));

const out = { categories, products };
const outPath = path.join(__dirname, "..", "seeders", "data", "catalog.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

console.log(`Wrote ${products.length} products across ${categories.length} categories to ${outPath}`);
categories.forEach((c) => console.log(`  ${c.slug}: ${c.subcategories.length} subcategories`));
