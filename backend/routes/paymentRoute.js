const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

// Payment routes
router.post('/create-payment-intent', PaymentController.createPaymentIntent);
router.post('/process-cod-order', PaymentController.processCODOrder);
router.post('/confirm-card-payment', PaymentController.confirmCardPayment);
router.post('/webhook', PaymentController.handleWebhook);
router.post('/refund', PaymentController.processRefund);
router.get('/payment-methods/:customerId', PaymentController.getCustomerPaymentMethods);

module.exports = router;