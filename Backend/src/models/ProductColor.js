module.exports = (sequelize, DataTypes) => {
  const ProductColor = sequelize.define(
    "ProductColor",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      name: { type: DataTypes.STRING(60), allowNull: false },
      hex_code: { type: DataTypes.STRING(7), allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    },
    { tableName: "product_colors" }
  );

  ProductColor.associate = (db) => {
    ProductColor.belongsTo(db.Product, { foreignKey: "product_id", as: "product" });
    ProductColor.hasMany(db.ProductVariant, { foreignKey: "color_id", as: "variants" });
  };

  return ProductColor;
};
