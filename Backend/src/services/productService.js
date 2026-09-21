const { Op, fn, col, where: sequelizeWhere } = require("sequelize");
const { Product, Category, Subcategory, ProductImage, ProductColor, ProductSize, sequelize } = require("../models");
const ApiError = require("../utils/ApiError");
const { getPagination, buildMeta } = require("../utils/pagination");

const PRODUCT_INCLUDES = [
  { model: Category, as: "category", attributes: ["id", "name", "slug"] },
  { model: Subcategory, as: "subcategory", attributes: ["id", "name", "slug"] },
  { model: ProductImage, as: "images" },
  { model: ProductColor, as: "colors" },
  { model: ProductSize, as: "sizes" }
];

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

  if (query.availability === "in-stock") where.in_stock = true;
  if (query.availability === "out-of-stock") where.in_stock = false;

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

  if (Array.isArray(body.colors)) {
    await ProductColor.destroy({ where: { product_id: product.id }, transaction });
    if (body.colors.length > 0) {
      await ProductColor.bulkCreate(
        body.colors.map((c, idx) => ({
          product_id: product.id,
          name: c.name,
          hex_code: c.hex,
          sort_order: idx
        })),
        { transaction }
      );
    }
  }

  if (Array.isArray(body.sizes)) {
    await ProductSize.destroy({ where: { product_id: product.id }, transaction });
    if (body.sizes.length > 0) {
      await ProductSize.bulkCreate(
        body.sizes.map((label, idx) => ({ product_id: product.id, label, sort_order: idx })),
        { transaction }
      );
    }
  }
}

async function createProduct(body) {
  return sequelize.transaction(async (transaction) => {
    const existingSku = await Product.findOne({ where: { sku: body.sku }, transaction });
    if (existingSku) throw ApiError.conflict("A product with this SKU already exists");
    const existingSlug = await Product.findOne({ where: { slug: body.slug }, transaction });
    if (existingSlug) throw ApiError.conflict("A product with this slug already exists");

    const product = await Product.create(
      {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
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

async function updateProduct(product, body) {
  return sequelize.transaction(async (transaction) => {
    if (body.sku && body.sku !== product.sku) {
      const clash = await Product.findOne({ where: { sku: body.sku }, transaction });
      if (clash) throw ApiError.conflict("A product with this SKU already exists");
    }
    if (body.slug && body.slug !== product.slug) {
      const clash = await Product.findOne({ where: { slug: body.slug }, transaction });
      if (clash) throw ApiError.conflict("A product with this slug already exists");
    }

    const fields = [
      "name",
      "slug",
      "sku",
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
    fields.forEach((f) => {
      if (body[f] !== undefined) product[f] = body[f];
    });
    await product.save({ transaction });

    await replaceNestedCollections(product, body, transaction);
    return product;
  });
}

module.exports = { listProducts, createProduct, updateProduct, PRODUCT_INCLUDES };
