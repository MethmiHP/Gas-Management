const express = require('express');
const cors = require('cors');

// Import routes
const orderRoute = require('./routes/orderRoute');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes'); // Import cart routes
// Import test route for debugging
const testOrderRoute = require('./routes/testOrderRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route for API testing
app.get('/', (req, res) => {
  res.send('Gas Delivery API Server is running');
});

// Mount routes with /api prefix
app.use('/api/orders', orderRoute);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes); // Mount cart routes with /api prefix for consistency

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});