"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      email: { type: Sequelize.STRING(190), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      password_hash: { type: Sequelize.STRING(200), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.addIndex("users", ["email"]);

    await queryInterface.addColumn("orders", "user_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("orders", "is_guest", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.addIndex("orders", ["user_id"]);
    await queryInterface.addIndex("orders", ["is_guest"]);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex("orders", ["is_guest"]);
    await queryInterface.removeIndex("orders", ["user_id"]);
    await queryInterface.removeColumn("orders", "is_guest");
    await queryInterface.removeColumn("orders", "user_id");
    await queryInterface.dropTable("users");
  }
};
