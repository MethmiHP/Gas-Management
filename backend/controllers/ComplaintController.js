// controllers/ComplaintController.js

const Complaint = require("../models/ComplaintModels");
const { v4: uuidv4 } = require("uuid");

// Add Complaint
exports.addComplaint = async (req, res) => {
    try {
        const { complain, customerName, customerEmail, customerPhone } = req.body;
        
        // Validate required fields
        if (!complain || !customerName || !customerEmail || !customerPhone) {
            return res.status(400).json({ 
                error: "Missing required fields. Please provide complain, customerName, customerEmail, and customerPhone" 
            });
        }

        const newComplaint = new Complaint({
            complaintID: uuidv4(), // Auto-generated complaint ID
            complain,
            status: "in progress",
            customerName,
            customerEmail,
            customerPhone
        });

        await newComplaint.save();
        res.status(201).json({ message: "Complaint added", complaint: newComplaint });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Complaints
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Complaint by ID
exports.getComplaintByID = async (req, res) => {
    try {
        console.log("Searching for complaint with ID:", req.params.id); // Debugging log
        const complaint = await Complaint.findOne({ complaintID: req.params.id }).lean();

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json(complaint);
    } catch (err) {
        console.error("Error fetching complaint by ID:", err); // Debugging log
        res.status(500).json({ error: err.message });
    }
};

// Update Complaint Status and Reply
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, reply } = req.body;
        const updatedComplaint = await Complaint.findOneAndUpdate(
            { complaintID: req.params.id },
            { status, reply },
            { new: true }
        ).lean();

        if (!updatedComplaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json({ message: "Complaint updated", complaint: updatedComplaint });
    } catch (err) {
        console.error("Error updating complaint:", err);
        res.status(500).json({ error: err.message });
    }
};

// Delete Complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const deletedComplaint = await Complaint.findOneAndDelete({ complaintID: req.params.id }).lean();

        if (!deletedComplaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json({ message: "Complaint deleted" });
    } catch (err) {
        console.error("Error deleting complaint:", err);
        res.status(500).json({ error: err.message });
    }
};