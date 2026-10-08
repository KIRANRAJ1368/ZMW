"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("reviews")) {
      await queryInterface.createTable("reviews", {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: "products", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        },
        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: { model: "users", key: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE"
        },
        customer_name: {
          type: Sequelize.STRING(120),
          allowNull: false
        },
        customer_email: {
          type: Sequelize.STRING(190),
          allowNull: true
        },
        rating: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 5
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        verified_purchase: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        is_approved: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW")
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW")
        }
      });

      await queryInterface.addIndex("reviews", ["product_id"]);
      await queryInterface.addIndex("reviews", ["rating"]);
      await queryInterface.addIndex("reviews", ["is_approved"]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("reviews");
  }
};
