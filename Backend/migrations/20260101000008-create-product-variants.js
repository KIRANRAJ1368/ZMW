"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_variants", {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "products", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      size_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "product_sizes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      color_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "product_colors", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      sku_suffix: { type: Sequelize.STRING(30), allowNull: true },
      stock_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      price_override: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
    await queryInterface.addIndex("product_variants", ["product_id", "size_id", "color_id"], {
      unique: true,
      name: "product_variants_unique_combo"
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("product_variants");
  }
};
