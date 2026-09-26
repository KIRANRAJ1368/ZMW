/**
 * ZMW Storefront & Admin Category & Subcategory Image Resolver
 * Provides reliable fallback to genuine high-fashion photography
 * whenever an admin has not uploaded a custom image.
 */

export const DEFAULT_CATEGORY_IMAGES = {
  mens: "/images/dept-mens.jpg",
  men: "/images/dept-mens.jpg",
  women: "/images/dept-womens.jpg",
  womens: "/images/dept-womens.jpg",
  boys: "/images/dept-boys.jpg",
  girls: "/images/dept-girls.jpg",
  babies: "/images/dept-babies.jpg",
  kids: "/images/dept-boys.jpg"
};

export const DEFAULT_SUBCATEGORY_IMAGES = {
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

/**
 * Returns the effective cover photo URL for a category.
 * If user uploaded a custom image, returns that.
 * Otherwise returns the designated department image.
 */
export function getCategoryImageUrl(category) {
  if (!category) return "";
  if (category.image_url && typeof category.image_url === "string" && category.image_url.trim()) {
    return category.image_url.trim();
  }
  const slug = (category.slug || "").toLowerCase().trim();
  const name = (category.name || "").toLowerCase().trim();
  return DEFAULT_CATEGORY_IMAGES[slug] || DEFAULT_CATEGORY_IMAGES[name] || "/images/dept-family-banner.jpg";
}

/**
 * Returns the effective thumbnail photo URL for a subcategory.
 * If user uploaded a custom image, returns that.
 * Otherwise returns the designated subcategory tile image.
 */
export function getSubcategoryImageUrl(subcategory) {
  if (!subcategory) return "";
  if (subcategory.image_url && typeof subcategory.image_url === "string" && subcategory.image_url.trim()) {
    return subcategory.image_url.trim();
  }

  const parentSlug = (subcategory.category?.slug || subcategory.parent_slug || subcategory.parentSlug || "").toLowerCase().trim();
  const subSlug = (subcategory.slug || "").toLowerCase().trim();
  const subName = (subcategory.name || "").toLowerCase().trim();

  // 1. Try parent:slug combo
  if (parentSlug && subSlug) {
    const key = `${parentSlug}:${subSlug}`;
    if (DEFAULT_SUBCATEGORY_IMAGES[key]) return DEFAULT_SUBCATEGORY_IMAGES[key];
  }

  // 2. Try direct subSlug match
  if (DEFAULT_SUBCATEGORY_IMAGES[subSlug]) {
    return DEFAULT_SUBCATEGORY_IMAGES[subSlug];
  }

  // 3. Try name-based match
  if (subName.includes("round neck") || subName.includes("t-shirt") || subName.includes("tee")) {
    if (parentSlug === "women" || parentSlug === "womens") return "/images/cat-women-round-neck.jpg";
    if (parentSlug === "boys") return "/images/cat-boys-round-neck.jpg";
    if (parentSlug === "girls") return "/images/cat-girls-round-neck.jpg";
    if (parentSlug === "babies") return "/images/cat-babies-tshirt.jpg";
    return "/images/cat-men-round-neck.jpg";
  }

  if (subName.includes("hoodie") || subName.includes("sweatshirt")) {
    if (parentSlug === "women" || parentSlug === "womens") return "/images/cat-women-hoodie.jpg";
    if (parentSlug === "girls") return "/images/cat-girls-round-neck.jpg";
    if (parentSlug === "boys") return "/images/cat-boys-hoodie.jpg";
    return "/images/cat-men-hoodie.jpg";
  }

  if (subName.includes("romper")) {
    return "/images/cat-babies-romper.jpg";
  }

  if (subName.includes("pyjama") || subName.includes("night")) {
    if (parentSlug === "girls") return "/images/cat-girls-nightwear.jpg";
    return "/images/cat-babies-pyjama.jpg";
  }

  // 4. Fallback to parent category department photo
  if (parentSlug && DEFAULT_CATEGORY_IMAGES[parentSlug]) {
    return DEFAULT_CATEGORY_IMAGES[parentSlug];
  }

  return "/images/cat-men-round-neck.jpg";
}
