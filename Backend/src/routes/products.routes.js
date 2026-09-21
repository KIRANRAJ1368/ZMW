const express = require("express");
const productController = require("../controllers/productController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/productValidators");

const router = express.Router();

router.get("/", productController.list);
// Admin edit forms need a database-ID lookup. Keep the public slug route
// separate so a numeric ID is never interpreted as a product slug.
router.get("/admin/:id", requireAuth, v.idParam, validate, productController.getById);
router.get("/:slug", productController.getBySlug);

router.post("/", requireAuth, v.create, validate, productController.create);
router.put("/:id", requireAuth, v.update, validate, productController.update);
router.delete("/:id", requireAuth, v.idParam, validate, productController.remove);

router.patch("/:id/best-seller", requireAuth, v.idParam, validate, productController.toggleBestSeller);
router.patch("/:id/new-arrival", requireAuth, v.idParam, validate, productController.toggleNewArrival);
router.patch("/:id/stock", requireAuth, v.idParam, validate, productController.updateStock);

router.get("/:id/variants", requireAuth, v.idParam, validate, productController.listVariants);
router.post("/:id/variants", requireAuth, v.idParam, validate, productController.createVariant);
router.put("/:id/variants/:variantId", requireAuth, v.idParam, validate, productController.updateVariant);
router.delete("/:id/variants/:variantId", requireAuth, v.idParam, validate, productController.deleteVariant);

module.exports = router;
