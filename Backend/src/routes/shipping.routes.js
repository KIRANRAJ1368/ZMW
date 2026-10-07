const express = require("express");
const shippingController = require("../controllers/shippingController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public: Calculate shipping charge based on destination PIN code and items
router.post("/calculate", shippingController.calculateRate);
router.post("/rate", shippingController.calculateRate);

// Admin: Shipments management
router.get("/shipments", requireAuth, shippingController.listShipments);
router.get("/shipments/:id", requireAuth, shippingController.getShipmentById);
router.post("/shipments/:id/generate-awb", requireAuth, shippingController.generateAwb);
router.post("/shipments/:id/sync", requireAuth, shippingController.syncTracking);
router.patch("/shipments/:id/status", requireAuth, shippingController.updateShippingStatus);

// Shiprocket automated webhook for live tracking callbacks
router.post("/webhook", shippingController.handleWebhook);

module.exports = router;
