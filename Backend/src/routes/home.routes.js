const express = require("express");
const homepageController = require("../controllers/homepageController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/homepageSectionValidators");

const router = express.Router();

// Public — single call the customer homepage fetches everything from.
router.get("/", homepageController.getHomePayload);

// Admin — manage section visibility/order/config.
router.get("/admin/sections", requireAuth, homepageController.listSections);
router.put("/admin/sections/:key", requireAuth, v.update, validate, homepageController.updateSection);

module.exports = router;
