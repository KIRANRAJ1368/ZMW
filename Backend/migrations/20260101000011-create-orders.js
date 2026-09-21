"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("orders", {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_number: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      customer_name: { type: Sequelize.STRING(150), allowNull: false },
      email: { type: Sequelize.STRING(190), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      shipping_address: { type: Sequelize.TEXT, allowNull: false },
      city: { type: Sequelize.STRING(100), allowNull: true },
      state: { type: Sequelize.STRING(100), allowNull: true },
      pincode: { type: Sequelize.STRING(10), allowNull: true },
      payment_method: { type: Sequelize.ENUM("COD", "PREPAID"), allowNull: false, defaultValue: "COD" },
      status: {
        type: Sequelize.ENUM("pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"),
        allowNull: false,
        defaultValue: "pending"
      },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      discount_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      shipping_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
    await queryInterface.addIndex("orders", ["status"]);
    await queryInterface.addIndex("orders", ["email"]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("orders");
  }
};
