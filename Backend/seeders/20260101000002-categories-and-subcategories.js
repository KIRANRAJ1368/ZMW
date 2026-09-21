"use strict";
const fs = require("fs");
const path = require("path");

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "catalog.json"), "utf8"));

module.exports = {
  up: async (queryInterface) => {
    const [existing] = await queryInterface.sequelize.query("SELECT id FROM categories LIMIT 1");
    if (existing.length > 0) {
      console.log("Categories already seeded — skipping.");
      return;
    }

    const now = new Date();

    for (const cat of catalog.categories) {
      await queryInterface.bulkInsert("categories", [
        {
          name: cat.name,
          slug: cat.slug,
          sort_order: cat.sort_order,
          is_active: true,
          created_at: now,
          updated_at: now
        }
      ]);

      const [[{ id: categoryId }]] = await queryInterface.sequelize.query(
        "SELECT id FROM categories WHERE slug = ? LIMIT 1",
        { replacements: [cat.slug] }
      );

      if (cat.subcategories.length > 0) {
        await queryInterface.bulkInsert(
          "subcategories",
          cat.subcategories.map((sc) => ({
            category_id: categoryId,
            name: sc.name,
            slug: sc.slug,
            sort_order: sc.sort_order,
            is_active: true,
            created_at: now,
            updated_at: now
          }))
        );
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("subcategories", null);
    await queryInterface.bulkDelete("categories", null);
  }
};
