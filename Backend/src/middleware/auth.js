const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { AdminUser, User } = require("../models");

/**
 * Verifies the Bearer token, loads the admin user fresh from the DB (so a
 * deactivated account is rejected immediately, not just at next login),
 * and attaches it to req.admin. Never trusts the token payload alone for
 * anything beyond identifying who to look up.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Missing or malformed Authorization header");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch (err) {
    throw err; // normalized by errorHandler (JsonWebTokenError / TokenExpiredError)
  }

  const admin = await AdminUser.findByPk(payload.sub);
  if (!admin || !admin.is_active) {
    throw ApiError.unauthorized("Account not found or deactivated");
  }

  req.admin = admin;
  next();
}

/**
 * Usage: requireRole("superadmin") or requireRole("superadmin", "admin")
 * Must run after requireAuth.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) throw ApiError.unauthorized();
    if (!allowedRoles.includes(req.admin.role)) {
      throw ApiError.forbidden("Your role does not have access to this action");
    }
    next();
  };
}

/**
 * Verifies customer Bearer token and attaches User instance to req.user.
 */
async function requireCustomerAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Please sign in to proceed");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch (err) {
    throw err;
  }

  const user = await User.findByPk(payload.sub);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized("Customer account not found or deactivated");
  }

  req.user = user;
  next();
}

/**
 * Optionally extracts customer Bearer token if present.
 * If missing or invalid, proceeds without error with req.user = null.
 */
async function optionalCustomerAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  req.user = null;

  if (scheme === "Bearer" && token) {
    try {
      const payload = jwt.verify(token, env.jwt.secret);
      const user = await User.findByPk(payload.sub);
      if (user && user.is_active) {
        req.user = user;
      }
    } catch {
      // Ignored for guest checkout
    }
  }

  next();
}

module.exports = { requireAuth, requireRole, requireCustomerAuth, optionalCustomerAuth };
