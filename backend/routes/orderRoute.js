const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

// Define routes - note the order matters for wildcard routes
router.get('/user/:userId', OrderController.getOrdersByUserId); // This must come before /:orderId
router.get('/:orderId', OrderController.getOrderById);
router.get('/', OrderController.getAllOrders);
router.post('/', OrderController.createOrder);
router.put('/:orderId', OrderController.updateOrder);
router.delete('/:orderId', OrderController.deleteOrder);

module.exports = router;