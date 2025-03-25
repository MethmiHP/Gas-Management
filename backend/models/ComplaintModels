// models/ComplaintModels.js

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Complaint Schema
const ComplaintSchema = new mongoose.Schema({
    complaintID: { type: String, unique: true, default: uuidv4 }, // Auto-generated complaint ID
    complain: { type: String, required: true },
    status: { type: String, enum: ["in progress", "resolved"], default: "in progress" },
    reply: { type: String, default: "" }, // Field for customer support reply
    // New customer information fields
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } // Adds createdAt and updatedAt fields
});

// Model
const Complaint = mongoose.model("Complaint", ComplaintSchema);

module.exports = Complaint;