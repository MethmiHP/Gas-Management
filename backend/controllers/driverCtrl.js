const Driver = require("../models/Driver");

// Get all drivers
const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        if (!drivers || drivers.length === 0) {
            return res.status(404).json({ message: "No drivers found" });
        }
        return res.status(200).json({ drivers });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching drivers", error });
    }
};

// Add a new driver
const addDriver = async (req, res) => {
    const { name, email, phone, licenseNumber } = req.body;

    try {
        // Check if email or license number already exists
        const existingDriver = await Driver.findOne({ $or: [{ email }, { licenseNumber }] });
        if (existingDriver) {
            return res.status(400).json({ message: "Email or license number already exists" });
        }

        const driver = new Driver({ name, email, phone, licenseNumber });
        await driver.save();
        return res.status(201).json({ success: true, message: "Driver added successfully", driver });
    } catch (error) {
        return res.status(500).json({ message: "Error adding driver", error });
    }
};

// Get driver by ID
const getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }
        return res.status(200).json({ driver });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching driver", error });
    }
};

// Update driver details
const updateDriver = async (req, res) => {
    try {
        const { name, email, phone, licenseNumber, availability } = req.body;

        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, licenseNumber, availability },
            { new: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        return res.json({ success: true, message: "Driver details updated successfully", driver: updatedDriver });
    } catch (error) {
        return res.status(500).json({ message: "Error updating driver details", error });
    }
};

// Delete a driver
const deleteDriver = async (req, res) => {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);

        if (!deletedDriver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        return res.status(200).json({ success: true, message: "Driver deleted successfully", deletedDriver });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting driver", error });
    }
};

module.exports = {
    getAllDrivers,
    addDriver,
    getDriverById,
    updateDriver,
    deleteDriver,
};
