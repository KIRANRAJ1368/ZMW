const express = require("express");
const contactController = require("../controllers/contactController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/contactValidators");

const router = express.Router();

// Public — the Contact Us page form submits here.
router.post("/", v.create, validate, contactController.create);

// Admin.
router.get("/", requireAuth, contactController.list);
router.get("/:id", requireAuth, v.idParam, validate, contactController.getById);
router.patch("/:id/status", requireAuth, v.updateStatus, validate, contactController.updateStatus);
router.delete("/:id", requireAuth, v.idParam, validate, contactController.remove);

module.exports = router;
