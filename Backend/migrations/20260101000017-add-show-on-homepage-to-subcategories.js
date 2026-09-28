"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("subcategories");
    if (!tableInfo.show_on_homepage) {
      await queryInterface.addColumn("subcategories", "show_on_homepage", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("subcategories");
    if (tableInfo.show_on_homepage) {
      await queryInterface.removeColumn("subcategories", "show_on_homepage");
    }
  }
};
