const express = require("express");
const { 
  register, 
  login, 
  getMe, 
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
  updateProfile,
  changePassword
} = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.post("/change-password", protect, changePassword);

// Admin only routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/users/:id", protect, authorize("admin"), getUserById);
router.put("/users/:id", protect, authorize("admin"), updateUserById);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// Role-specific routes examples
router.get("/customer-dashboard", protect, authorize("customer"), (req, res) => {
  res.status(200).json({ success: true, message: "Customer dashboard" });
});

router.get("/driver-dashboard", protect, authorize("driver"), (req, res) => {
  res.status(200).json({ success: true, message: "Driver dashboard" });
});

router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
  res.status(200).json({ success: true, message: "Admin dashboard" });
});

module.exports = router;
