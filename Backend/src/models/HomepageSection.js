module.exports = (sequelize, DataTypes) => {
  const HomepageSection = sequelize.define(
    "HomepageSection",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      // Stable key the frontend/admin refer to, e.g. "hero",
      // "category_visuals", "new_arrivals", "mens_categories",
      // "womens_categories", "boys_categories", "girls_categories",
      // "babies_categories", "best_sellers", "newsletter",
      // "instagram_showcase".
      section_key: { type: DataTypes.STRING(60), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(200), allowNull: true },
      subtitle: { type: DataTypes.STRING(300), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      // Free-form per-section settings, e.g. { "limit": 8, "categorySlug": "mens" }.
      config: { type: DataTypes.JSON, allowNull: true }
    },
    { tableName: "homepage_sections" }
  );

  return HomepageSection;
};
