"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(220), allowNull: false, unique: true },
      sku: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      subcategory_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "subcategories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      product_type: { type: Sequelize.STRING(60), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      original_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      rating: { type: Sequelize.DECIMAL(2, 1), allowNull: false, defaultValue: 0 },
      review_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      in_stock: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      stock_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      is_best_seller: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_new_arrival: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_sale: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      badge_label: { type: Sequelize.STRING(40), allowNull: true },
      badge_type: { type: Sequelize.ENUM("hot", "new", "sale"), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
    await queryInterface.addIndex("products", ["category_id"]);
    await queryInterface.addIndex("products", ["subcategory_id"]);
    await queryInterface.addIndex("products", ["is_best_seller"]);
    await queryInterface.addIndex("products", ["is_new_arrival"]);
    await queryInterface.addIndex("products", ["is_active"]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("products");
  }
};
