const express = require("express");
const reportController = require("../controllers/reportController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Admin Reports
router.get("/sales", requireAuth, reportController.salesReport);
router.get("/products", requireAuth, reportController.productsReport);
router.get("/orders", requireAuth, reportController.ordersReport);

module.exports = router;
