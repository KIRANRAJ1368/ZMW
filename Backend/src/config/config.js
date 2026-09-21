require("dotenv").config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  dialect: process.env.DB_DIALECT || "mysql",
  define: {
    underscored: true,
    timestamps: true
  }
};

module.exports = {
  development: { ...base },
  test: { ...base, database: `${process.env.DB_NAME || "zmw_db"}_test`, logging: false },
  production: { ...base, logging: false }
};
