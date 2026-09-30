"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("product_variants", "image_url", {
      type: Sequelize.STRING(2048),
      allowNull: true
    });
    await queryInterface.addColumn("product_variants", "gallery_images", {
      type: Sequelize.JSON,
      allowNull: true
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("product_variants", "gallery_images");
    await queryInterface.removeColumn("product_variants", "image_url");
  }
};