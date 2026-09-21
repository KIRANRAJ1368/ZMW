"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("contact_submissions", {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      email: { type: Sequelize.STRING(190), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      subject: { type: Sequelize.STRING(200), allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.ENUM("new", "read", "responded"), allowNull: false, defaultValue: "new" },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("contact_submissions");
  }
};
