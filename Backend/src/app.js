require("express-async-errors");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const env = require("./config/env");
const apiRoutes = require("./routes");
const { generalLimiter } = require("./middleware/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { UPLOAD_ROOT } = require("./middleware/upload");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    // Uploaded images are served cross-origin to the frontend/admin panel.
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, server-to-server, no Origin header).
      if (!origin) return callback(null, true);
      if (env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(compression());
if (env.env !== "test") {
  app.use(morgan(env.env === "development" ? "dev" : "combined"));
}

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(generalLimiter);

// Uploaded images — publicUrlFor() in middleware/upload.js builds URLs
// that point here.
app.use("/uploads", express.static(UPLOAD_ROOT));

app.get("/health", (req, res) => res.json({ success: true, data: { status: "ok", env: env.env } }));

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
