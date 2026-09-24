module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        set(val) {
          this.setDataValue("code", (val || "").trim().toUpperCase());
        }
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      discount_type: {
        type: DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
        defaultValue: "percentage"
      },
      discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 10.0
      },
      min_spend: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
      },
      max_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      times_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: "coupons",
      underscored: true
    }
  );

  return Coupon;
};
