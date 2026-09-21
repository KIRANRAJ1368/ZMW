module.exports = (sequelize, DataTypes) => {
  const AdminUser = sequelize.define(
    "AdminUser",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: {
        type: DataTypes.STRING(190),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password_hash: { type: DataTypes.STRING(200), allowNull: false },
      role: {
        type: DataTypes.ENUM("superadmin", "admin"),
        allowNull: false,
        defaultValue: "admin"
      },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      last_login_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
      tableName: "admin_users",
      defaultScope: {
        attributes: { exclude: ["password_hash"] }
      },
      scopes: {
        withPassword: { attributes: {} }
      }
    }
  );

  return AdminUser;
};
