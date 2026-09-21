module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    "Banner",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      // Where this banner is used, e.g. "hero", "category_mens",
      // "category_women", "category_boys", "category_girls",
      // "category_babies", "category_kids", "best_sellers",
      // "new_arrivals", "default". Free-text so new placements don't need
      // a migration.
      placement: { type: DataTypes.STRING(60), allowNull: false },
      tag: { type: DataTypes.STRING(120), allowNull: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      subtitle: { type: DataTypes.STRING(300), allowNull: true },
      badge_promo: { type: DataTypes.STRING(120), allowNull: true },
      image_url: { type: DataTypes.STRING(500), allowNull: false },
      image_position: { type: DataTypes.STRING(40), allowNull: true },
      primary_cta_text: { type: DataTypes.STRING(60), allowNull: true },
      primary_cta_link: { type: DataTypes.STRING(300), allowNull: true },
      secondary_cta_text: { type: DataTypes.STRING(60), allowNull: true },
      secondary_cta_link: { type: DataTypes.STRING(300), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    {
      tableName: "banners",
      indexes: [{ fields: ["placement"] }]
    }
  );

  return Banner;
};
