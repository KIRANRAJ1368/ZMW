const express = require("express");
const categoryController = require("../controllers/categoryController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/categoryValidators");

const router = express.Router();

router.get("/", categoryController.list);
router.get("/:slug", categoryController.getBySlug);

router.post("/", requireAuth, v.create, validate, categoryController.create);
router.put("/:id", requireAuth, v.update, validate, categoryController.update);
router.delete("/:id", requireAuth, v.idParam, validate, categoryController.remove);

module.exports = router;
