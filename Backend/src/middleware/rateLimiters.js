const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMin * 60 * 1000,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests, please slow down." } }
});

// Tighter limiter for login — the endpoint most worth protecting against
// brute-forcing.
const authLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMin * 60 * 1000,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many login attempts, please try again later." } }
});

module.exports = { generalLimiter, authLimiter };
