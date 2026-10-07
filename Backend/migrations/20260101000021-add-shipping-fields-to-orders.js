"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("orders");

    if (!tableInfo.shipping_status) {
      await queryInterface.addColumn("orders", "shipping_status", {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "pending_dispatch"
      });
    }

    if (!tableInfo.tracking_number) {
      await queryInterface.addColumn("orders", "tracking_number", {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!tableInfo.courier_name) {
      await queryInterface.addColumn("orders", "courier_name", {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!tableInfo.shipment_id) {
      await queryInterface.addColumn("orders", "shipment_id", {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!tableInfo.awb_code) {
      await queryInterface.addColumn("orders", "awb_code", {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!tableInfo.shipping_label_url) {
      await queryInterface.addColumn("orders", "shipping_label_url", {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo.estimated_delivery) {
      await queryInterface.addColumn("orders", "estimated_delivery", {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("orders", "estimated_delivery");
    await queryInterface.removeColumn("orders", "shipping_label_url");
    await queryInterface.removeColumn("orders", "awb_code");
    await queryInterface.removeColumn("orders", "shipment_id");
    await queryInterface.removeColumn("orders", "courier_name");
    await queryInterface.removeColumn("orders", "tracking_number");
    await queryInterface.removeColumn("orders", "shipping_status");
  }
};
