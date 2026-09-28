"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const tableInfo = await queryInterface.describeTable("categories");
    if (!tableInfo.show_on_homepage) {
      await queryInterface.addColumn("categories", "show_on_homepage", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("categories");
    if (tableInfo.show_on_homepage) {
      await queryInterface.removeColumn("categories", "show_on_homepage");
    }
  }
};
