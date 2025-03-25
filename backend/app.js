const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const complaintRoutes = require("./routes/ComplaintRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api/complaints", complaintRoutes);

// MongoDB Connection
mongoose.connect("mongodb+srv://admin:sGPUhAWdhvk0TVkY@cluster0.lmqpi.mongodb.net/", {})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Dynamic port selection
const startServer = (port) => {
    try {
        const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

        // Handle errors after initial connection
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying ${port + 1}...`);
                server.close();
                startServer(port + 1);
            } else {
                console.error('Server error:', error);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start server with initial port
const initialPort = process.env.PORT || 5000;
startServer(initialPort);