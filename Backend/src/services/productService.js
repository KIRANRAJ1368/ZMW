const { Op, fn, col, where: sequelizeWhere } = require("sequelize");
const { randomBytes } = require("crypto");
const { Product, Category, Subcategory, ProductImage, ProductColor, ProductSize, ProductVariant, sequelize } = require("../models");
const ApiError = require("../utils/ApiError");
const { getPagination, buildMeta } = require("../utils/pagination");

const PRODUCT_INCLUDES = [
  { model: Category, as: "category", attributes: ["id", "name", "slug"] },
  { model: Subcategory, as: "subcategory", attributes: ["id", "name", "slug"] },
  { model: ProductImage, as: "images" },
  { model: ProductColor, as: "colors" },
  { model: ProductSize, as: "sizes" },
  {
    model: ProductVariant,
    as: "variants",
    include: [
      { model: ProductSize, as: "size", attributes: ["id", "label"] },
      { model: ProductColor, as: "color", attributes: ["id", "name", "hex_code"] }
    ]
  }
];

function assertPriceRange(price, originalPrice) {
  const selling = Number(price);
  const original = Number(originalPrice);
  if (!Number.isFinite(selling) || selling < 500) {
    throw ApiError.badRequest("Selling price must be at least ₹500");
  }
  if (!Number.isFinite(original) || original <= selling) {
    throw ApiError.badRequest("Original price must be higher than selling price");
  }
}

function assertVariantPriceOverride(priceOverride, originalPrice) {
  const selling = Number(priceOverride);
  if (!Number.isFinite(selling) || selling < 500) {
    throw ApiError.badRequest("Variant price override must be at least ₹500");
  }
  if (originalPrice !== null && originalPrice !== undefined) {
    const original = Number(originalPrice);
    if (Number.isFinite(original) && original > 0 && original <= selling) {
      throw ApiError.badRequest("Original price must be higher than variant price override");
    }
  }
}

async function generateUniqueSku(name, transaction) {
  const nameToken = String(name || "PRODUCT")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "PRODUCT";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sku = `ZMW-${nameToken}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const existing = await Product.findOne({ where: { sku }, transaction });
    if (!existing) return sku;
  }

  throw ApiError.conflict("Could not generate a unique SKU. Please try again.");
}
const SORT_MAP = {
  "price-asc": [["price", "ASC"]],
  "price-desc": [["price", "DESC"]],
  newest: [["created_at", "DESC"]],
  rating: [["rating", "DESC"]],
  popularity: [
    ["is_best_seller", "DESC"],
    ["review_count", "DESC"]
  ]
};

/**
 * Builds the same filters Collection.jsx already applies client-side:
 * category (department slug), type (fuzzy match against product_type or
 * subcategory name), collection (best-sellers / new-arrivals), color,
 * size, availability, min/max price.
 */
async function listProducts(query) {
  const { page, limit, offset } = getPagination(query);
  const where = { is_active: true };
  const include = PRODUCT_INCLUDES.map((inc) => ({ ...inc }));

  if (query.category && query.category !== "all") {
    const category = await Category.findOne({ where: { slug: query.category } });
    where.category_id = category ? category.id : -1;
  }

  if (query.type && query.type !== "all") {
    const needle = `%${query.type.toLowerCase()}%`;
    where[Op.and] = [
      ...(where[Op.and] || []),
      sequelizeWhere(fn("LOWER", col("Product.product_type")), { [Op.like]: needle })
    ];
    // OR against the subcategory name too, matching the frontend's dual check.
    include.find((inc) => inc.as === "subcategory").required = false;
  }

  if (query.collection === "best-sellers") where.is_best_seller = true;
  if (query.collection === "new-arrivals") where.is_new_arrival = true;

  if (query.availability === "in-stock") {
    where.in_stock = true;
    where.stock_count = { [Op.gt]: 0 };
  }
  if (query.availability === "out-of-stock") {
    where[Op.or] = [{ in_stock: false }, { stock_count: 0 }];
  }
  if (query.availability === "low-stock") {
    where.in_stock = true;
    where.stock_count = { [Op.gt]: 0, [Op.lte]: 5 };
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price[Op.gte] = parseFloat(query.minPrice);
    if (query.maxPrice) where.price[Op.lte] = parseFloat(query.maxPrice);
  }

  if (query.color) {
    const colors = Array.isArray(query.color) ? query.color : [query.color];
    include.find((inc) => inc.as === "colors").where = { name: { [Op.in]: colors } };
    include.find((inc) => inc.as === "colors").required = true;
  }

  if (query.size) {
    const sizes = Array.isArray(query.size) ? query.size : [query.size];
    include.find((inc) => inc.as === "sizes").where = { label: { [Op.in]: sizes } };
    include.find((inc) => inc.as === "sizes").required = true;
  }

  const order = SORT_MAP[query.sort] || [["created_at", "DESC"]];

  const { rows, count } = await Product.findAndCountAll({
    where,
    include,
    order,
    limit,
    offset,
    distinct: true
  });

  return { rows, meta: buildMeta({ page, limit, count }) };
}

async function replaceNestedCollections(product, body, transaction) {
  if (Array.isArray(body.images) && body.images.length > 2) {
    throw ApiError.badRequest("Maximum 2 images are allowed.");
  }
  if (Array.isArray(body.variants) && body.variants.some((variant) => {
    const mainImageCount = variant.image_url || variant.imageUrl ? 1 : 0;
    const galleryCount = Array.isArray(variant.gallery_images)
      ? variant.gallery_images.length
      : Array.isArray(variant.galleryImages)
      ? variant.galleryImages.length
      : 0;
    return mainImageCount + galleryCount > 2;
  })) {
    throw ApiError.badRequest("Maximum 2 images are allowed.");
  }
  if (Array.isArray(body.images)) {
    await ProductImage.destroy({ where: { product_id: product.id }, transaction });
    if (body.images.length > 0) {
      await ProductImage.bulkCreate(
        body.images.map((img, idx) => ({
          product_id: product.id,
          url: typeof img === "string" ? img : img.url,
          alt_text: typeof img === "object" ? img.alt_text || product.name : product.name,
          sort_order: idx
        })),
        { transaction }
      );
    }
  }

  let createdColors = [];
  if (Array.isArray(body.colors)) {
    await ProductColor.destroy({ where: { product_id: product.id }, transaction });
    if (body.colors.length > 0) {
      createdColors = await ProductColor.bulkCreate(
        body.colors.map((c, idx) => ({
          product_id: product.id,
          name: c.name,
          hex_code: c.hex || c.hex_code,
          sort_order: idx
        })),
        { transaction }
      );
    }
  } else {
    createdColors = await ProductColor.findAll({ where: { product_id: product.id }, transaction });
  }

  let createdSizes = [];
  if (Array.isArray(body.sizes)) {
    await ProductSize.destroy({ where: { product_id: product.id }, transaction });
    if (body.sizes.length > 0) {
      createdSizes = await ProductSize.bulkCreate(
        body.sizes.map((label, idx) => ({
          product_id: product.id,
          label: typeof label === "string" ? label : label?.label || String(label),
          sort_order: idx
        })),
        { transaction }
      );
    }
  } else {
    createdSizes = await ProductSize.findAll({ where: { product_id: product.id }, transaction });
  }

  if (Array.isArray(body.variants)) {
    await ProductVariant.destroy({ where: { product_id: product.id }, transaction });
    if (body.variants.length > 0) {
      const colorMap = new Map();
      createdColors.forEach((c) => {
        colorMap.set(String(c.name).toLowerCase(), c.id);
        colorMap.set(String(c.id), c.id);
      });

      const sizeMap = new Map();
      createdSizes.forEach((s) => {
        sizeMap.set(String(s.label).toLowerCase(), s.id);
        sizeMap.set(String(s.id), s.id);
      });

      // Automatically register any new sizes or colors specified in the variants
      for (const v of body.variants) {
        const sizeVal = (v.size || "").trim();
        if (sizeVal && !sizeMap.has(sizeVal.toLowerCase())) {
          const newSize = await ProductSize.create(
            { product_id: product.id, label: sizeVal, sort_order: sizeMap.size },
            { transaction }
          );
          sizeMap.set(sizeVal.toLowerCase(), newSize.id);
          sizeMap.set(String(newSize.id), newSize.id);
        }

        const colorVal = (v.color || "").trim();
        if (colorVal && !colorMap.has(colorVal.toLowerCase())) {
          const newColor = await ProductColor.create(
            {
              product_id: product.id,
              name: colorVal,
              hex_code: v.colorHex || v.color_hex || "#1E293B",
              sort_order: colorMap.size
            },
            { transaction }
          );
          colorMap.set(colorVal.toLowerCase(), newColor.id);
          colorMap.set(String(newColor.id), newColor.id);
        }
      }

      const variantRows = body.variants.map((v) => {
        const sizeVal = (v.size || "").trim();
        const colorVal = (v.color || "").trim();
        const sizeId = v.size_id || (sizeVal ? sizeMap.get(sizeVal.toLowerCase()) : null);
        const colorId = v.color_id || (colorVal ? colorMap.get(colorVal.toLowerCase()) : null);
        const priceOverride = v.price_override ?? v.priceOverride;
        if (priceOverride !== null && priceOverride !== undefined) {
          assertPriceRange(priceOverride, product.original_price);
        }
        return {
          product_id: product.id,
          size_id: sizeId || null,
          color_id: colorId || null,
          sku_suffix: v.sku_suffix || v.skuSuffix || null,
          stock_count: Math.max(0, Number(v.stock_count ?? v.stockCount ?? 0)),
          price_override: priceOverride !== null && priceOverride !== undefined ? parseFloat(priceOverride) : null,
          image_url: v.image_url || v.imageUrl || null,
          gallery_images: v.gallery_images || v.galleryImages || []
        };
      });

      await ProductVariant.bulkCreate(variantRows, { transaction });

      // Synchronize overall stock count and in_stock from variants
      const totalStock = variantRows.reduce((sum, v) => sum + (Number(v.stock_count) || 0), 0);
      product.stock_count = totalStock;
      product.in_stock = totalStock > 0;
      await product.save({ transaction });
    } else {
      product.in_stock = Number(product.stock_count || 0) > 0;
      await product.save({ transaction });
    }
  }
}

async function createProduct(body) {
  assertPriceRange(body.price, body.original_price);
  return sequelize.transaction(async (transaction) => {
    const sku = await generateUniqueSku(body.name, transaction);
    const existingSlug = await Product.findOne({ where: { slug: body.slug }, transaction });
    if (existingSlug) throw ApiError.conflict("A product with this slug already exists");

    const product = await Product.create(
      {
        name: body.name,
        slug: body.slug,
        sku,
        category_id: body.category_id,
        subcategory_id: body.subcategory_id || null,
        product_type: body.product_type || null,
        description: body.description || null,
        price: body.price,
        original_price: body.original_price || null,
        stock_count: body.stock_count ?? 0,
        in_stock: body.in_stock ?? (body.stock_count ? body.stock_count > 0 : true),
        is_best_seller: body.is_best_seller ?? false,
        is_new_arrival: body.is_new_arrival ?? false,
        is_sale: body.is_sale ?? false,
        badge_label: body.badge_label || null,
        badge_type: body.badge_type || null,
        is_active: body.is_active ?? true
      },
      { transaction }
    );

    await replaceNestedCollections(product, body, transaction);
    return product;
  });
}

async function updateProduct(productOrId, body) {
  const product =
    typeof productOrId === "object" && productOrId?.save
      ? productOrId
      : await Product.findByPk(productOrId);
  if (!product) throw ApiError.notFound("Product not found");
  const nextOriginalPrice = Object.prototype.hasOwnProperty.call(body, "original_price")
    ? body.original_price
    : product.original_price;
  assertPriceRange(body.price ?? product.price, nextOriginalPrice);

  return sequelize.transaction(async (transaction) => {
    const nextSku = product.sku;
    if (body.slug && body.slug !== product.slug) {
      const clash = await Product.findOne({ where: { slug: body.slug }, transaction });
      if (clash) throw ApiError.conflict("A product with this slug already exists");
    }

    const fields = [
      "name",
      "slug",
      "category_id",
      "subcategory_id",
      "product_type",
      "description",
      "price",
      "original_price",
      "stock_count",
      "in_stock",
      "is_best_seller",
      "is_new_arrival",
      "is_sale",
      "badge_label",
      "badge_type",
      "is_active"
    ];
    product.sku = nextSku;
    fields.forEach((f) => {
      if (body[f] !== undefined) product[f] = body[f];
    });
    await product.save({ transaction });

    await replaceNestedCollections(product, body, transaction);
    return product;
  });
}

module.exports = { listProducts, createProduct, updateProduct, PRODUCT_INCLUDES, assertPriceRange, assertVariantPriceOverride };
