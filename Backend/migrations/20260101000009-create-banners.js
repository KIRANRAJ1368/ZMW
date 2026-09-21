"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("banners", {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      placement: { type: Sequelize.STRING(60), allowNull: false },
      tag: { type: Sequelize.STRING(120), allowNull: true },
      title: { type: Sequelize.STRING(200), allowNull: false },
      subtitle: { type: Sequelize.STRING(300), allowNull: true },
      badge_promo: { type: Sequelize.STRING(120), allowNull: true },
      image_url: { type: Sequelize.STRING(500), allowNull: false },
      image_position: { type: Sequelize.STRING(40), allowNull: true },
      primary_cta_text: { type: Sequelize.STRING(60), allowNull: true },
      primary_cta_link: { type: Sequelize.STRING(300), allowNull: true },
      secondary_cta_text: { type: Sequelize.STRING(60), allowNull: true },
      secondary_cta_link: { type: Sequelize.STRING(300), allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
    await queryInterface.addIndex("banners", ["placement"]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("banners");
  }
};
