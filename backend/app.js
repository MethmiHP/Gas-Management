// // Importing required modules
// const express = require("express"); // A web framework for handling HTTP requests and setting up routes
// const mongoose = require("mongoose"); // A library for interacting with MongoDB
// const cors = require("cors"); // Middleware to handle cross-origin resource sharing

// // Creating an instance of an express application
// const app = express();

// // Importing route definitions
// //const userRoutes = require("./routes/userRoute");
// const driverRoutes = require("./routes/driverRoutes");
// const deliveryRoutes = require("./routes/deliveryRoutes");

// // Root route
// app.get("/", (req, res) => {
//     res.send("Welcome to the Delivery Management API!");
//   });


//   // Middleware
// app.use(express.json()); // Enables parsing of incoming JSON data in request bodies
// app.use(cors()); 

// // Route configurations
// //app.use("/users", userRoutes);
// app.use("/drivers", driverRoutes);
// app.use("/deliveries", deliveryRoutes);

//   mongoose
//   .connect("mongodb+srv://admin:sGPUhAWdhvk0TVkY@cluster0.lmqpi.mongodb.net/")
//   .then(() => {
//     console.log("Connected to MongoDB");
//     app.listen(5000, () => {
//       console.log("Server running on port 5000");
//     });
//   })
//   .catch((err) => console.log("MongoDB connection error:", err));

// // Importing required modules
// // require("dotenv").config(); // Load environment variables
// // const express = require("express");
// // const mongoose = require("mongoose");
// // const cors = require("cors");


// // // Creating an instance of an Express application
// // const app = express();

// // // Middleware
// // app.use(express.json()); // Enables parsing of incoming JSON data in request bodies
// // app.use(cors()); // Enable CORS for specific origin

// // // Routes
// // app.get("/", (req, res) => {
// //   res.send("Welcome to the Delivery Management API!");
// // });


// // // Error-handling middleware
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(500).json({ message: "Something went wrong!" });
// // });

// // // MongoDB connection
// // mongoose
// //     .connect(process.env.MONGODB_URI)
// //     .then(() => {
// //         console.log("Connected to MongoDB");

// //         // Start the server after successfully connecting to MongoDB
// //         const PORT = process.env.PORT || 5000; // Use environment variable for port
// //         app.listen(PORT, () => {
// //             console.log('Server running on port ' + PORT);
// //         });
// //     })
// //     .catch((err) => {
// //         console.error("MongoDB connection error:", err);
// //     });

// Importing required modules
const express = require("express"); // A web framework for handling HTTP requests and setting up routes
const mongoose = require("mongoose"); // A library for interacting with MongoDB
const cors = require("cors"); // Middleware to handle cross-origin resource sharing

// Importing route definitions
//const userRoutes = require("./routes/userRoute");
const driverRoutes = require("./routes/driverRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");

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

// Alternative function to connect to MongoDB using async/await
// const connectDB = async () => {
//     try {
//         await mongoose.connect("mongodb+srv://admin:I2fa57FcNAAdausy@cluster0.fekig.mongodb.net/");
//         console.log("Connected to MongoDB");
//         app.listen(5000, () => console.log("Server running on port 5000"));
//     } catch (err) {
//         console.log("MongoDB connection error:", err);
//     }
// };

// Call the function to establish the connection
// connectDB();

