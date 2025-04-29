const express = require("express"); // Import Express.js
const router = express.Router(); // Create a new router object

// Import Driver model
const Driver = require("../models/Driver");

// Import Driver controller
const DriverController = require("../controllers/driverCtrl");

router.get("/", DriverController.getAllDrivers);
router.post("/", DriverController.addDriver);
router.get("/:id", DriverController.getDriverById);
router.get("/email/:email", DriverController.getDriverByEmail);
router.put("/:id", DriverController.updateDriver);
router.delete("/:id", DriverController.deleteDriver);

// Export the router
module.exports = router;