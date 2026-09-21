/**
 * Shapes a Product (with its category/subcategory/images/colors/sizes
 * eager-loaded) into the same camelCase JSON shape the existing frontend's
 * UNIFIED_PRODUCTS already uses, so swapping the static import for a
 * fetch() call later is a drop-in change.
 */
function serializeProduct(product) {
  const p = product.toJSON ? product.toJSON() : product;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category ? p.category.slug : null,
    categoryId: p.category_id,
    subCategory: p.subcategory ? p.subcategory.name : null,
    subcategoryId: p.subcategory_id,
    productType: p.product_type,
    price: Number(p.price),
    originalPrice: p.original_price !== null && p.original_price !== undefined ? Number(p.original_price) : null,
    rating: Number(p.rating),
    reviewCount: p.review_count,
    inStock: p.in_stock,
    stockCount: p.stock_count,
    isBestSeller: p.is_best_seller,
    isNewArrival: p.is_new_arrival,
    isSale: p.is_sale,
    isNew: p.badge_type === "new",
    badge: p.badge_label,
    badgeType: p.badge_type,
    isActive: p.is_active,
    description: p.description,
    images: (p.images || []).sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url),
    colors: (p.colors || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ name: c.name, hex: c.hex_code })),
    sizes: (p.sizes || []).sort((a, b) => a.sort_order - b.sort_order).map((s) => s.label),
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
}

module.exports = { serializeProduct };
