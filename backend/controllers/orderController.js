// controllers/orderController.js
const Order = require('../models/orderModel');
const Product = require('../models/productModels'); // Import Product model

// Controller functions
const OrderController = {
  // Get all orders
  getAllOrders: async (req, res) => {
    try {
      const allOrders = await Order.find();
      
      res.status(200).json({
        success: true,
        count: allOrders.length,
        data: allOrders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message
      });
    }
  },

  // Get single order by ID
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findOne({ orderId: req.params.orderId });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message
      });
    }
  },

  // Get orders by user ID
  getOrdersByUserId: async (req, res) => {
    try {
      const userOrders = await Order.find({ userId: req.params.userId });
      
      res.status(200).json({
        success: true,
        count: userOrders.length,
        data: userOrders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message
      });
    }
  },

  // Get orders by username
  getOrdersByUsername: async (req, res) => {
    try {
      const username = req.params.username;
      const userOrders = await Order.find({ userName: username });
      
      res.status(200).json({
        success: true,
        count: userOrders.length,
        data: userOrders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message
      });
    }
  },

  // Create new order
  createOrder: async (req, res) => {
    try {
      console.log('Received order data:', req.body);
      
      const {
        userId,
        userName,
        orderType,
        discount,
        paymentMethod,
        paymentStatus,
        items,
        amount,
        timestamp,
        isGuestCheckout
      } = req.body;
      
      // Validate request - allow guest checkout with minimal fields
      if (!userName || !orderType || !paymentMethod || !paymentStatus) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({
          success: false,
          error: 'Please provide all required fields'
        });
      }
      
      // Create the order document
      const newOrder = await Order.create({
        userId: userId || 'guest',
        userName,
        orderType,
        items: items || [],
        discount: discount || 0,
        amount: amount || 0,
        paymentMethod,
        paymentStatus,
        timestamp: timestamp || new Date(),
        isGuestCheckout: isGuestCheckout || false
      });
      
      console.log('Order created successfully:', newOrder);
      
      // Update product quantities based on order items
      if (items && items.length > 0) {
        try {
          for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (product) {
              // Calculate new quantity (ensure it doesn't go below 0)
              const newQuantity = Math.max(0, product.quantity - item.quantity);
              
              // Update product quantity
              product.quantity = newQuantity;
              await product.save();
              
              console.log(`Updated quantity for product ${product.name}, new quantity: ${newQuantity}`);
            } else {
              console.warn(`Product with ID ${item.productId} not found for inventory update`);
            }
          }
        } catch (inventoryError) {
          console.error('Error updating inventory:', inventoryError);
          // Continue with the order creation response even if inventory update fails
          // Consider adding a notification system for failed inventory updates
        }
      }
      
      res.status(201).json({
        success: true,
        data: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message
      });
    }
  },

  // Update order
  updateOrder: async (req, res) => {
    try {
      const { 
        userName, 
        userId,
        orderType, 
        discount, 
        paymentMethod, 
        paymentStatus 
      } = req.body;
      
      // Validate that there's something to update
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide at least one field to update'
        });
      }
      
      // Create update object with only the fields that were provided
      const updateFields = {};
      if (userName) updateFields.userName = userName;
      if (userId) updateFields.userId = userId;
      if (orderType) updateFields.orderType = orderType;
      if (discount !== undefined) updateFields.discount = discount;
      if (paymentMethod) updateFields.paymentMethod = paymentMethod;
      if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
      
      // Don't allow changing the orderId
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId: req.params.orderId },
        updateFields,
        { new: true, runValidators: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: updatedOrder
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message
      });
    }
  },

  // Delete order
  deleteOrder: async (req, res) => {
    try {
      const deletedOrder = await Order.findOneAndDelete({ orderId: req.params.orderId });
      
      if (!deletedOrder) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: deletedOrder
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error: ' + error.message
      });
    }
  }
};

module.exports = OrderController;