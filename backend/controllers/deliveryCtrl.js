const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");

// Get all deliveries
const getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find().populate("driver"); // Fetch all deliveries with driver details
        if (!deliveries || deliveries.length === 0) {
            return res.status(404).json({ message: "No deliveries found" });
        }
        return res.status(200).json({ deliveries });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching deliveries", error });
    }
};

// Get deliveries assigned to a driver
const getDeliveriesByDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const deliveries = await Delivery.find({ driver: driverId });

        if (!deliveries.length) {
            return res.status(404).json({ success: false, message: "No deliveries found for this driver." });
        }

        res.json({ success: true, deliveries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching deliveries for this driver", error });
    }
};



// Add a new delivery
// const addDelivery = async (req, res) => {
//     const { orderId, driver, customerName, address, phone, deliveryDate, paymentMethod } = req.body;

//     try {
//         const delivery = new Delivery({
//             orderId,
//             driver,
//             customerName,
//             address,
//             phone,
//             deliveryDate,
//             paymentMethod
//         });

//         await delivery.save();
//         return res.status(201).json({ success: true, message: "Delivery added successfully", delivery });
//     } catch (error) {
//         return res.status(500).json({ message: "Error adding delivery", error });
//     }
// };

// const mongoose = require("mongoose");

// const addDelivery = async (req, res) => {
//     const { orderId, driver, customerName, address, phone, deliveryDate, paymentMethod } = req.body;

//     try {
//         const driverObjectId = driver ? new mongoose.Types.ObjectId(driver) : null;

//         // Normalize paymentMethod to match enum values
//         const validPaymentMethods = ["Prepaid", "Cash On Delivery"];
//         const formattedPaymentMethod = validPaymentMethods.find(
//             method => method.toLowerCase() === paymentMethod.toLowerCase()
//         );

//         if (!formattedPaymentMethod) {
//             return res.status(400).json({ message: "Invalid payment method." });
//         }

//         const delivery = new Delivery({
//             orderId,
//             driver: driverObjectId,
//             customerName,
//             address,
//             phone,
//             deliveryDate,
//             paymentMethod: formattedPaymentMethod // Ensure correct format
//         });

//         await delivery.save();
//         return res.status(201).json({ success: true, message: "Delivery added successfully", delivery });
//     } catch (error) {
//         return res.status(500).json({ message: "Error adding delivery", error });
//     }
// };

//right//
const addDelivery = async (req, res) => {
    const { orderId, driver, customerName, address, phone, deliveryDate, paymentMethod } = req.body;

    try {
        // If no driver provided, set driver to null
        const driverObjectId = driver ? new mongoose.Types.ObjectId(driver) : null;

        // Normalize paymentMethod to match enum values
        const validPaymentMethods = ["Prepaid", "Cash On Delivery"];
        const formattedPaymentMethod = validPaymentMethods.find(
            method => method.toLowerCase() === paymentMethod.toLowerCase()
        );

        if (!formattedPaymentMethod) {
            return res.status(400).json({ message: "Invalid payment method." });
        }

        const delivery = new Delivery({
            orderId,
            driver: driverObjectId, // driver can be null here
            customerName,
            address,
            phone,
            deliveryDate,
            paymentMethod: formattedPaymentMethod // Ensure correct format
        });

        await delivery.save();
        return res.status(201).json({ success: true, message: "Delivery added successfully", delivery });
    } catch (error) {
        return res.status(500).json({ message: "Error adding delivery", error });
    }
};



// Get delivery by ID
const getDeliveryById = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id).populate("driver");
        if (!delivery) {
            return res.status(404).json({ message: "Delivery not found" });
        }
        return res.status(200).json({ delivery });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching delivery", error });
    }
};

// Assign a driver automatically
const assignDriver = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find an available driver
        const driver = await Driver.findOne({ availability: true }).sort("completedDeliveries");

        if (!driver) {
            return res.status(400).json({ message: "No available drivers at the moment." });
        }

        // Assign the driver to the delivery
        const updatedDelivery = await Delivery.findOneAndUpdate(
            { orderId },
            { driver: driver._id, deliveryStatus: "Assigned" },
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update driver availability
        await Driver.findByIdAndUpdate(driver._id, { availability: false });

        return res.json({ success: true, message: `Driver ${driver.name} assigned.`, delivery: updatedDelivery });
    } catch (error) {
        return res.status(500).json({ message: "Error assigning driver.", error });
    }
};

// // Update delivery status
// const updateDeliveryStatus = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const { deliveryStatus } = req.body;

//         const updatedDelivery = await Delivery.findOneAndUpdate(
//             { orderId },
//             { deliveryStatus },
//             { new: true }
//         );

//         if (!updatedDelivery) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // If delivered, mark driver as available and increment completed deliveries
//         if (deliveryStatus === "Delivered") {
//             await Driver.findByIdAndUpdate(updatedDelivery.driver, {
//                 availability: true,
//                 $inc: { completedDeliveries: 1 },
//             });
//         }

//         return res.json({ success: true, message: "Order status updated.", delivery: updatedDelivery });
//     } catch (error) {
//         return res.status(500).json({ message: "Error updating order status.", error });
//     }
// };

// const updateDeliveryStatus = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const { deliveryStatus } = req.body;

//         const updatedDelivery = await Delivery.findOneAndUpdate(
//             { orderId },
//             { deliveryStatus },
//             { new: true }
//         );

//         if (!updatedDelivery) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // If delivered, mark driver as available and increment completed deliveries
//         if (deliveryStatus === "Delivered" && updatedDelivery.driver) {
//             await Driver.findByIdAndUpdate(updatedDelivery.driver, {
//                 availability: true,
//                 $inc: { completedDeliveries: 1 }, // Increment completedDeliveries by 1
//             });
//         }

//         return res.json({ success: true, message: "Order status updated.", delivery: updatedDelivery });
//     } catch (error) {
//         return res.status(500).json({ message: "Error updating order status.", error });
//     }
// };

// // Handle Cash on Delivery (COD) payment
// const handleCODPayment = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const { amountReceived } = req.body;

//         const updatedDelivery = await Delivery.findOneAndUpdate(
//             { orderId },
//             { codPaid: true, amountReceived },
//             { new: true }
//         );

//         if (!updatedDelivery) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         return res.json({ success: true, message: "COD Payment received.", delivery: updatedDelivery });
//     } catch (error) {
//         return res.status(500).json({ message: "Error processing COD payment.", error });
//     }
// };

// Delete a delivery
const deleteDelivery = async (req, res) => {
    try {
        const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);

        if (!deletedDelivery) {
            return res.status(404).json({ message: "Delivery not found" });
        }

        return res.status(200).json({ success: true, message: "Delivery deleted successfully", deletedDelivery });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting delivery", error });
    }
};

// const getDriverPerformanceReport = async (req, res) => {
//     try {
//         const { month, year, incrementRate } = req.query;

//         // Validate required query parameters
//         if (!month || !year || !incrementRate) {
//             return res.status(400).json({ message: "Month, year, and increment rate are required." });
//         }

//         // Parse month and year to create date range
//         const startDate = new Date(year, month - 1, 1); // Start of the month
//         const endDate = new Date(year, month, 0); // End of the month

//         // Fetch deliveries marked as "Delivered" within the specified month and year
//         const deliveries = await Delivery.find({
//             deliveryStatus: "Delivered",
//             deliveryDate: { $gte: startDate, $lte: endDate }
//         }).populate("driver");

//         // Calculate completed deliveries and salary increment for each driver
//         const driverStats = {};
//         deliveries.forEach(delivery => {
//             if (delivery.driver) {
//                 const driverId = delivery.driver._id.toString();

//                 // Initialize driver stats if not already present
//                 if (!driverStats[driverId]) {
//                     driverStats[driverId] = {
//                         driver: delivery.driver,
//                         completedDeliveries: delivery.driver.completedDeliveries, // Use the completedDeliveries from the Driver model
//                     };
//                 }
//             }
//         });

//         // Generate the report
//         const report = Object.values(driverStats).map(entry => {
//             return {
//                 driver: entry.driver,
//                 completedDeliveries: entry.completedDeliveries,
//                 salaryIncrement: entry.completedDeliveries * parseFloat(incrementRate),
//             };
//         });

//         return res.status(200).json({ success: true, report });
//     } catch (error) {
//         return res.status(500).json({ message: "Error generating driver performance report", error });
//     }
// };

const getDriverPerformanceReport = async (req, res) => {
    try {
        const { month, year, incrementRate } = req.query;

        // Validate required query parameters
        if (!month || !year || !incrementRate) {
            return res.status(400).json({ message: "Month, year, and increment rate are required." });
        }

        // Convert parameters to integers
        const parsedMonth = parseInt(month, 10);
        const parsedYear = parseInt(year, 10);
        const parsedIncrementRate = parseFloat(incrementRate);

        if (isNaN(parsedMonth) || isNaN(parsedYear) || isNaN(parsedIncrementRate)) {
            return res.status(400).json({ message: "Invalid month, year, or increment rate." });
        }

        // Construct the start and end date for the selected month
        const startDate = new Date(parsedYear, parsedMonth - 1, 1); // Start of the month
        const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59); // End of the month

        // Fetch delivered orders for the given month and year
        const deliveries = await Delivery.find({
            deliveryStatus: "Delivered",
            deliveryDate: { $gte: startDate, $lte: endDate }
        }).populate("driver"); // Populate driver details

        // Group deliveries by driver and count completed ones
        const driverStats = {};

        deliveries.forEach(delivery => {
            if (delivery.driver) {
                const driverId = delivery.driver._id.toString();

                if (!driverStats[driverId]) {
                    driverStats[driverId] = {
                        driver: delivery.driver,
                        completedDeliveries: 0
                    };
                }

                driverStats[driverId].completedDeliveries += 1;
            }
        });

        // Fetch driver records to get completed deliveries count
        const drivers = await Driver.find({ _id: { $in: Object.keys(driverStats) } });

        drivers.forEach(driver => {
            const driverId = driver._id.toString();
            if (driverStats[driverId]) {
                driverStats[driverId].completedDeliveries = driver.completedDeliveries; // Update from driver model
            }
        });

        // Generate the performance report
        const report = Object.values(driverStats).map(entry => ({
            driver: entry.driver,
            completedDeliveries: entry.completedDeliveries,
            salaryIncrement: entry.completedDeliveries * parsedIncrementRate,
        }));

        return res.status(200).json({ success: true, report });
    } catch (error) {
        return res.status(500).json({ message: "Error generating driver performance report", error });
    }
};

// exports.getAssignedDelivery = async (req, res) => {
//     try {
//       const { driverId } = req.params;
//       const assignedDelivery = await Delivery.findOne({
//         driverId,
//         status: { $ne: "Delivered" }, // Fetch only if delivery is not completed
//       });
  
//       if (!assignedDelivery) {
//         return res.status(404).json({ message: "No assigned delivery found" });
//       }
  
//       res.json(assignedDelivery);
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//     }
//   };

// Controller function for tracking an order
// 

const trackOrder = async (req, res) => {
    try {
        const { orderId, phone } = req.query;

        // Debug what's being received
        console.log("Track order request:", { orderId, phone });

        // Validate that both parameters are provided
        if (!orderId || !phone) {
            return res.status(400).json({ message: "Order ID and phone number are required" });
        }

        // Try to find the order with more flexible query
        let order = null;
        
        try {
            // First try with orderId as string
            order = await Delivery.findOne({ 
                orderId: orderId, 
                phone 
            }).populate("driver");
            
            // If not found, try with orderId as number
            if (!order && !isNaN(orderId)) {
                order = await Delivery.findOne({ 
                    orderId: Number(orderId), 
                    phone 
                }).populate("driver");
            }
        } catch (queryError) {
            console.error("Query error:", queryError);
        }

        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }

        // Log success
        console.log("Order found:", order._id);
        
        res.json({ order });
    } catch (error) {
        console.error("Error tracking order:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryStatus, emptyCollected } = req.body;

        // Create an update object with the required fields
        const updateData = { deliveryStatus };
        
        // Only add emptyCollected to the update if it's provided
        if (emptyCollected !== undefined) {
            updateData.emptyCollected = emptyCollected;
        }
        
        // Add deliveredAt timestamp if status is Delivered
        if (deliveryStatus === "Delivered") {
            updateData.deliveredAt = new Date();
        }

        const updatedDelivery = await Delivery.findOneAndUpdate(
            { orderId },
            updateData,
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: "Order not found" });
        }

        // If delivered, mark driver as available and increment completed deliveries
        if (deliveryStatus === "Delivered" && updatedDelivery.driver) {
            await Driver.findByIdAndUpdate(updatedDelivery.driver, {
                availability: true,
                $inc: { completedDeliveries: 1 },
            });
        }

        return res.json({ success: true, message: "Order status updated.", delivery: updatedDelivery });
    } catch (error) {
        return res.status(500).json({ message: "Error updating order status.", error });
    }
};

const handleCODPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { amountReceived, emptyCollected } = req.body;

        // Create an update object with the required fields
        const updateData = { 
            codPaid: true, 
            amountReceived 
        };
        
        // Only add emptyCollected to the update if it's provided
        if (emptyCollected !== undefined) {
            updateData.emptyCollected = emptyCollected;
        }

        const updatedDelivery = await Delivery.findOneAndUpdate(
            { orderId },
            updateData,
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json({ success: true, message: "COD Payment received.", delivery: updatedDelivery });
    } catch (error) {
        return res.status(500).json({ message: "Error processing COD payment.", error });
    }
};






module.exports = {
    getAllDeliveries,   
    getDeliveriesByDriver,
    addDelivery,
    getDeliveryById,
    assignDriver,
    updateDeliveryStatus,
    handleCODPayment,
    deleteDelivery,
    trackOrder,
    getDriverPerformanceReport,
};


 