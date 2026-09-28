"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("coupons", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      discount_type: {
        type: Sequelize.ENUM("percentage", "fixed"),
        allowNull: false,
        defaultValue: "percentage"
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 10.0
      },
      min_spend: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
      },
      max_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      times_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("coupons");
  }
};
