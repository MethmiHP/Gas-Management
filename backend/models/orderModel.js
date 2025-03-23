// models/orderModel.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // You'll need to install this package: npm install uuid

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        default: () => uuidv4(),
        unique: true, // Ensure uniqueness
        immutable: true // Prevent modification after creation
    },
    userName: { 
        type: String, 
        required: true 
    },
    orderType: { 
        type: String, 
        enum: ["Gases", "Accessories"], 
        required: true 
    },
    discount: { 
        type: Number, 
        default: 0 
    },
    paymentMethod: { 
        type: String, 
        enum: ["Credit Card", "Cash on Delivery"], 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ["Pending", "Completed", "Failed"], 
        required: true 
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", OrderSchema);