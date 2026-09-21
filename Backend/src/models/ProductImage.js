module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    "ProductImage",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      url: { type: DataTypes.STRING(500), allowNull: false },
      alt_text: { type: DataTypes.STRING(200), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    },
    { tableName: "product_images" }
  );

  ProductImage.associate = (db) => {
    ProductImage.belongsTo(db.Product, { foreignKey: "product_id", as: "product" });
  };

  return ProductImage;
};
