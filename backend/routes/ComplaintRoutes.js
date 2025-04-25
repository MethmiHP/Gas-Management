const express = require("express");
const {
    addComplaint,
    getAllComplaints,
    getComplaintByID,
    updateComplaintStatus,
    deleteComplaint
} = require("../controllers/ComplaintController");

const router = express.Router();

router.post("/", addComplaint); // Add Complaint
router.get("/", getAllComplaints); // Get All Complaints
router.get("/:id", getComplaintByID); // Get Complaint by ID
router.put("/:id", updateComplaintStatus); // Update Complaint Status & Reply
router.delete("/:id", deleteComplaint); // Delete Complaint

module.exports = router;