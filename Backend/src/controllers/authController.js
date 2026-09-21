const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const { AdminUser } = require("../models");

async function login(req, res) {
  const { email, password } = req.body;

  // Same error for "no such user" and "wrong password" — never reveal
  // which one it was.
  const admin = await AdminUser.scope("withPassword").findOne({ where: { email } });
  if (!admin || !admin.is_active) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  admin.last_login_at = new Date();
  await admin.save();

  const token = jwt.sign({ sub: admin.id, role: admin.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });

  return sendSuccess(res, {
    data: {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    }
  });
}

async function me(req, res) {
  return sendSuccess(res, { data: req.admin });
}

module.exports = { login, me };
