const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: env.db.dialect,
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  },
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /Deadlock/i,
      /SequelizeConnectionError/i,
      /SequelizeConnectionRefusedError/i,
      /SequelizeHostNotFoundError/i,
      /SequelizeHostNotReachableError/i,
      /SequelizeInvalidConnectionError/i,
      /SequelizeConnectionTimedOutError/i,
      /TimeoutError/i,
      /PROTOCOL_CONNECTION_LOST/i,
      /ECONNRESET/i
    ],
    max: 3
  }
});

module.exports = sequelize;
