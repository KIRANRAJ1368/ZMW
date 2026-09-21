module.exports = (sequelize, DataTypes) => {
  const ContactSubmission = sequelize.define(
    "ContactSubmission",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: false, validate: { isEmail: true } },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      subject: { type: DataTypes.STRING(200), allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM("new", "read", "responded"),
        allowNull: false,
        defaultValue: "new"
      }
    },
    { tableName: "contact_submissions" }
  );

  return ContactSubmission;
};
