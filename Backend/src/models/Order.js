module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      customer_name: { type: DataTypes.STRING(150), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: false, validate: { isEmail: true } },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      shipping_address: { type: DataTypes.TEXT, allowNull: false },
      city: { type: DataTypes.STRING(100), allowNull: true },
      state: { type: DataTypes.STRING(100), allowNull: true },
      pincode: { type: DataTypes.STRING(10), allowNull: true },
      payment_method: { type: DataTypes.ENUM("COD", "PREPAID"), allowNull: false, defaultValue: "COD" },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"),
        allowNull: false,
        defaultValue: "pending"
      },
      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      shipping_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      notes: { type: DataTypes.TEXT, allowNull: true },
      shipping_status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "pending_dispatch" },
      tracking_number: { type: DataTypes.STRING(100), allowNull: true },
      courier_name: { type: DataTypes.STRING(100), allowNull: true },
      shiprocket_order_id: { type: DataTypes.STRING(100), allowNull: true },
      shipment_id: { type: DataTypes.STRING(100), allowNull: true },
      awb_code: { type: DataTypes.STRING(100), allowNull: true },
      shipping_label_url: { type: DataTypes.TEXT, allowNull: true },
      estimated_delivery: { type: DataTypes.STRING(100), allowNull: true },
      user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      is_guest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    {
      tableName: "orders",
      indexes: [
        { fields: ["status"] },
        { fields: ["shipping_status"] },
        { fields: ["tracking_number"] },
        { fields: ["email"] },
        { fields: ["user_id"] },
        { fields: ["is_guest"] }
      ]
    }
  );

  Order.associate = (db) => {
    Order.hasMany(db.OrderItem, { foreignKey: "order_id", as: "items", onDelete: "CASCADE" });
    Order.belongsTo(db.User, { foreignKey: "user_id", as: "user", onDelete: "SET NULL" });
  };

  return Order;
};
