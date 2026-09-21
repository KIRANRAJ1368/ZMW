"use strict";
const fs = require("fs");
const path = require("path");

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "catalog.json"), "utf8"));

module.exports = {
  up: async (queryInterface) => {
    const [existing] = await queryInterface.sequelize.query("SELECT id FROM products LIMIT 1");
    if (existing.length > 0) {
      console.log("Products already seeded — skipping.");
      return;
    }

    const [categoryRows] = await queryInterface.sequelize.query("SELECT id, slug FROM categories");
    const categoryIdBySlug = Object.fromEntries(categoryRows.map((c) => [c.slug, c.id]));

    const [subcatRows] = await queryInterface.sequelize.query(
      "SELECT id, category_id, name FROM subcategories"
    );
    const subcatIdByKey = Object.fromEntries(
      subcatRows.map((s) => [`${s.category_id}::${s.name}`, s.id])
    );

    const now = new Date();
    let inserted = 0;

    for (const p of catalog.products) {
      const categoryId = categoryIdBySlug[p.category_slug];
      if (!categoryId) {
        console.warn(`Skipping "${p.name}" — unknown category "${p.category_slug}"`);
        continue;
      }
      const subcategoryId = p.subcategory_name
        ? subcatIdByKey[`${categoryId}::${p.subcategory_name}`] || null
        : null;

      await queryInterface.bulkInsert("products", [
        {
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          product_type: p.product_type,
          description: p.description,
          price: p.price,
          original_price: p.original_price,
          rating: p.rating,
          review_count: p.review_count,
          in_stock: p.in_stock,
          stock_count: p.stock_count,
          is_best_seller: p.is_best_seller,
          is_new_arrival: p.is_new_arrival,
          is_sale: p.is_sale,
          badge_label: p.badge_label,
          badge_type: p.badge_type,
          is_active: true,
          created_at: now,
          updated_at: now
        }
      ]);

      const [[{ id: productId }]] = await queryInterface.sequelize.query("SELECT LAST_INSERT_ID() AS id");

      if (p.images.length > 0) {
        await queryInterface.bulkInsert(
          "product_images",
          p.images.map((url, idx) => ({
            product_id: productId,
            url,
            alt_text: p.name,
            sort_order: idx,
            created_at: now,
            updated_at: now
          }))
        );
      }

      if (p.colors.length > 0) {
        await queryInterface.bulkInsert(
          "product_colors",
          p.colors.map((c, idx) => ({
            product_id: productId,
            name: c.name,
            hex_code: c.hex,
            sort_order: idx,
            created_at: now,
            updated_at: now
          }))
        );
      }

      if (p.sizes.length > 0) {
        await queryInterface.bulkInsert(
          "product_sizes",
          p.sizes.map((label, idx) => ({
            product_id: productId,
            label,
            sort_order: idx,
            created_at: now,
            updated_at: now
          }))
        );
      }

      inserted += 1;
    }

    console.log(`Seeded ${inserted} products.`);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("products", null);
  }
};
