// models/orderModel.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // You'll need to install this package: npm install uuid

// Define an items sub-schema to hold order items
const OrderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: String,
        required: false
    }
});

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
    items: [OrderItemSchema], // Add this if missing
    amount: {
        type: Number,
        default: 0
    },
    discount: { 
        type: Number, 
        default: 0 
    },
    paymentMethod: { 
        type: String, 
        enum: ["Credit Card", "Cash on Delivery", "Pending"], 
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