const express = require("express");
const customerController = require("../controllers/customerController");
const { requireAuth } = require("../middleware/auth");
const { param } = require("express-validator");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", requireAuth, customerController.list);
router.get("/:id", requireAuth, [param("id").isInt()], validate, customerController.getById);

module.exports = router;
