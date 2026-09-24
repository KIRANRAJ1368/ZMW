const express = require("express");
const orderController = require("../controllers/orderController");
const { requireAuth, requireCustomerAuth, optionalCustomerAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/orderValidators");

const router = express.Router();

// Order Tracking (Public - guest or customer)
router.get("/track", orderController.trackOrder);

// Customer Order History
router.get("/my-orders", requireCustomerAuth, orderController.getMyOrders);

// Customer Order Cancellation
router.post("/:id/cancel", requireCustomerAuth, v.idParam, validate, orderController.cancelOrder);

// Storefront checkout (Guest or Authenticated Customer)
router.post("/", optionalCustomerAuth, v.create, validate, orderController.create);

// Order Invoice (Customer or Admin)
router.get("/:id/invoice", optionalCustomerAuth, v.idParam, validate, orderController.getById);

// Admin
router.get("/", requireAuth, orderController.list);
router.get("/:id", requireAuth, v.idParam, validate, orderController.getById);
router.patch("/:id/status", requireAuth, v.updateStatus, validate, orderController.updateStatus);

module.exports = router;
