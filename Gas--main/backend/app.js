// Load environment variables from .env file - THIS MUST BE FIRST
require('dotenv').config();
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES (secret key hidden)" : "NO (not found)");

// Importing required modules
const express = require("express"); // A web framework for handling HTTP requests and setting up routes
const mongoose = require("mongoose"); // A library for interacting with MongoDB
const cors = require("cors"); // Middleware to handle cross-origin resource sharing

// Importing route definitions
//const userRoutes = require("./routes/userRoute");
const driverRoutes = require("./routes/driverRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const productRoutes = require("./routes/productRoutes");
const complaintRoutes = require("./routes/ComplaintRoutes");
const authRoutes = require("./routes/authRoutes");

// Creating an instance of an express application
const app = express();

// Middleware
app.use(express.json()); // Enables parsing of incoming JSON data in request bodies
app.use(cors()); // Allows requests from http://localhost:3000

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the Delivery Management API!");
  });

// Route configurations
//app.use("/users", userRoutes);
app.use("/drivers", driverRoutes);
app.use("/deliveries", deliveryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/auth", authRoutes);

// Connecting to MongoDB
mongoose
  .connect("mongodb+srv://admin:sGPUhAWdhvk0TVkY@cluster0.lmqpi.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));

