const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const env = require("./config/env");
const app = require("./app");
const { sequelize } = require("./models");

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log(`[db] Connected to ${env.db.dialect}://${env.db.host}:${env.db.port}/${env.db.name}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[db] Unable to connect to the database:", err.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] ZMW backend listening on port ${env.port} (${env.env})`);
  });

  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
    // Force-exit if close() hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start();
