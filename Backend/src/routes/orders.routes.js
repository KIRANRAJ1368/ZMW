const express = require("express");
const orderController = require("../controllers/orderController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/orderValidators");

const router = express.Router();

// Public — customer checkout (guest checkout, no account system requested).
router.post("/", v.create, validate, orderController.create);

// Admin.
router.get("/", requireAuth, orderController.list);
router.get("/:id", requireAuth, v.idParam, validate, orderController.getById);
router.patch("/:id/status", requireAuth, v.updateStatus, validate, orderController.updateStatus);

module.exports = router;
