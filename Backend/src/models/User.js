module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      email: {
        type: DataTypes.STRING(190),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      password_hash: { type: DataTypes.STRING(200), allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    {
      tableName: "users",
      defaultScope: {
        attributes: { exclude: ["password_hash"] }
      },
      scopes: {
        withPassword: { attributes: {} }
      }
    }
  );

  User.associate = (db) => {
    User.hasMany(db.Order, { foreignKey: "user_id", as: "orders" });
  };

  return User;
};
