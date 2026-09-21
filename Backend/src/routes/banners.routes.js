const express = require("express");
const bannerController = require("../controllers/bannerController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/bannerValidators");

const router = express.Router();

router.get("/", bannerController.list);

router.post("/", requireAuth, v.create, validate, bannerController.create);
router.put("/:id", requireAuth, v.update, validate, bannerController.update);
router.delete("/:id", requireAuth, v.idParam, validate, bannerController.remove);

module.exports = router;
