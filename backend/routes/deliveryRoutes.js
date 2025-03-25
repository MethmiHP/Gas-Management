//new 
const express = require("express");
const router = express.Router();
const DeliveryController = require("../controllers/deliveryCtrl");

// Get driver performance report
router.get("/performance-report", DeliveryController.getDriverPerformanceReport);

// Get all deliveries
router.get("/", DeliveryController.getAllDeliveries);

// Get deliveries assigned to a driver
router.get("/driver/:driverId", DeliveryController.getDeliveriesByDriver);

// Add a new delivery
router.post("/", DeliveryController.addDelivery);

// Get delivery by ID
router.get("/:id", DeliveryController.getDeliveryById);

// Assign a driver automatically
router.put("/:orderId/assign-driver", DeliveryController.assignDriver);

// Update delivery status
router.put("/:orderId/status", DeliveryController.updateDeliveryStatus);

// Handle COD payment
router.put("/:orderId/cod", DeliveryController.handleCODPayment);

// Delete a delivery
router.delete("/:id", DeliveryController.deleteDelivery);

// Route for tracking an order
router.get("/track", DeliveryController.trackOrder);

module.exports = router;
