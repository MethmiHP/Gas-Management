const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.protect = async (req, res, next) => {
  let token;
  
  try {
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token ? "Yes (not showing full token)" : "No token");
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route - No token provided"
      });
    }
    
    try {
      // Verify token
      const secret = process.env.JWT_SECRET || "nelson_gas_super_secure_jwt_secret_key_2023";
      console.log("Using secret:", secret.substring(0, 5) + "..." + "(not showing full secret)");
      
      const decoded = jwt.verify(token, secret);
      console.log("Token decoded successfully, user ID:", decoded.id);
      
      // Find user with the ID from token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log("User not found for ID:", decoded.id);
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      console.log("User found:", user.username, "Role:", user.role);
      req.user = user;
      next();
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: `Authentication error: ${error.message}`
      });
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware"
    });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
