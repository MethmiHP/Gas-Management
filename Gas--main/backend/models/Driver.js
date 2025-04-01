const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const driverSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure no duplicate emails
    },
    phone: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true, // Each driver has a unique license number
    },
    availability: {
        type: Boolean,
        default: true, // By default, a driver is available for assignment
    },
    completedDeliveries: {
        type: Number,
        default: 0, // Track the number of completed deliveries
    }
});

module.exports = mongoose.model("Driver", driverSchema);
//exports the Driver model based on the driverSchema. The 
//Driver model can now be imported and used in other files to 
//interact with the drivers collection in the MongoDB database.