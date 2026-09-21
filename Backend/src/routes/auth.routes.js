const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiters");
const validate = require("../middleware/validate");
const { login } = require("../validators/authValidators");

const router = express.Router();

router.post("/login", authLimiter, login, validate, authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;
