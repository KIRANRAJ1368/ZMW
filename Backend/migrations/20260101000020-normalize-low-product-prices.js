"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE products
      SET price = GREATEST(500, CEIL(price * 2 / 50) * 50)
      WHERE price < 500
    `);
    await queryInterface.sequelize.query(`
      UPDATE products p
      SET original_price = CEIL(GREATEST(p.price, COALESCE((
        SELECT MAX(v.price_override)
        FROM product_variants v
        WHERE v.product_id = p.id
      ), 0)) * 1.2 / 50) * 50
      WHERE p.original_price IS NULL OR p.original_price <= GREATEST(
        p.price, COALESCE((
          SELECT MAX(v.price_override)
          FROM product_variants v
          WHERE v.product_id = p.id
        ), 0)
      )
    `);
    await queryInterface.sequelize.query(`
      UPDATE product_variants
      SET price_override = GREATEST(500, CEIL(price_override * 2 / 50) * 50)
      WHERE price_override IS NOT NULL AND price_override < 500
    `);
    await queryInterface.sequelize.query(`
      UPDATE products p
      SET original_price = CEIL(
        GREATEST(p.price, COALESCE((
          SELECT MAX(v.price_override)
          FROM product_variants v
          WHERE v.product_id = p.id
        ), 0)) * 1.2 / 50
      ) * 50
      WHERE p.original_price IS NOT NULL AND p.original_price <= GREATEST(
        p.price, COALESCE((
          SELECT MAX(v.price_override)
          FROM product_variants v
          WHERE v.product_id = p.id
        ), 0)
      )
    `);
  },
  down: async () => {
    // Price normalization is a one-way data correction; previous selling
    // prices cannot be reconstructed safely after Admin edits.
  }
};