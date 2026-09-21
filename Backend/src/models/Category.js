module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(80), allowNull: false },
      // e.g. "mens", "women", "kids", "boys", "girls", "babies" — matches
      // the ?category= query param the existing frontend already sends.
      slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    { tableName: "categories" }
  );

  Category.associate = (db) => {
    Category.hasMany(db.Subcategory, { foreignKey: "category_id", as: "subcategories" });
    Category.hasMany(db.Product, { foreignKey: "category_id", as: "products" });
  };

  return Category;
};
