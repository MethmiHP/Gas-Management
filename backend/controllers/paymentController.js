// const stripe = require('stripe')('process.env.sk_test_51R4f2SP4ZdNvaffvJ7ZCQXjDd2FDd1aDTR1VGhjtNLKxAIDBarLvrK8b88qoAahwaKFAtMKFSuNXV0cK8073FygL00BHYb9OmB');
// const Order = require('../models/paymentOrder');


// /**
//  * Payment Controller for handling Stripe payments
//  */
// class PaymentController {
//   /**
//    * Create a payment intent with Stripe
//    * @param {Object} req - Express request object
//    * @param {Object} res - Express response object
//    */
//   async createPaymentIntent(req, res) {
//     try {
//       const { amount, currency = 'inr', paymentMethodType = 'card', metadata = {} } = req.body;

//       // Validate amount
//       if (!amount || isNaN(amount) || amount <= 0) {
//         return res.status(400).json({ error: 'Invalid amount provided' });
//       }

//       // Create a payment intent
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
//         currency,
//         payment_method_types: [paymentMethodType],
//         metadata
//       });

//       // Return client secret to frontend
//       res.status(200).json({
//         clientSecret: paymentIntent.client_secret
//       });
//     } catch (error) {
//       console.error('Payment intent creation error:', error);
//       res.status(500).json({ error: 'Failed to create payment intent' });
//     }
//   }

//   /**
//    * Process a Cash on Delivery order (no payment processing needed)
//    * @param {Object} req - Express request object
//    * @param {Object} res - Express response object
//    */
//   async processCODOrder(req, res) {
//     try {
//       const { items, total, address } = req.body;
      
//       // Create order record for COD
//       const order = await Order.create({
//         items,
//         total,
//         paymentMethod: 'COD',
//         paymentStatus: 'pending',
//         address,
//         orderStatus: 'confirmed'
//       });

//       res.status(200).json({
//         success: true,
//         order
//       });
//     } catch (error) {
//       console.error('COD order processing error:', error);
//       res.status(500).json({ error: 'Failed to process COD order' });
//     }
//   }

//   /**
//    * Confirm a card payment after it's completed
//    * @param {Object} req - Express request object
//    * @param {Object} res - Express response object
//    */
//   async confirmCardPayment(req, res) {
//     try {
//       const { paymentIntentId, items, total, address } = req.body;
      
//       // Verify payment status with Stripe
//       const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
//       if (paymentIntent.status !== 'succeeded') {
//         return res.status(400).json({ 
//           error: 'Payment not successful',
//           status: paymentIntent.status
//         });
//       }
      
//       // Create order record for completed card payment
//       const order = await Order.create({
//         items,
//         total,
//         paymentMethod: 'Card',
//         paymentStatus: 'paid',
//         paymentDetails: {
//           paymentIntentId,
//           amount: paymentIntent.amount / 100, // Convert from paise to rupees
//           currency: paymentIntent.currency,
//           paymentDate: new Date()
//         },
//         address,
//         orderStatus: 'confirmed'
//       });
      
//       res.status(200).json({
//         success: true,
//         order
//       });
//     } catch (error) {
//       console.error('Payment confirmation error:', error);
//       res.status(500).json({ error: 'Failed to confirm payment' });
//     }
//   }

//   /**
//    * Handle Stripe webhook events
//    * @param {Object} req - Express request object
//    * @param {Object} res - Express response object
//    */
//   async handleWebhook(req, res) {
//     const signature = req.headers['stripe-signature'];
//     let event;

//     try {
//       // Verify webhook signature
//       event = stripe.webhooks.constructEvent(
//         req.rawBody, // Ensure your body-parser is configured to provide this
//         signature,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.error('Webhook signature verification failed:', err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle specific events
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object;
//         console.log('PaymentIntent succeeded:', paymentIntent.id);
//         // Update order status if needed
//         break;
        
//       case 'payment_intent.payment_failed':
//         const failedPayment = event.data.object;
//         console.log('Payment failed:', failedPayment.id, failedPayment.last_payment_error?.message);
//         // Handle failed payment - notify customer, update order status
//         break;
        
//       case 'charge.refunded':
//         const refund = event.data.object;
//         console.log('Charge refunded:', refund.id);
//         // Handle refund - update order status
//         break;
        
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     res.status(200).json({ received: true });
//   }

//   /**
//    * Process refund for an order
//    * @param {Object} req - Express request object
//    * @param {Object} res - Express response object
//    */
//   async processRefund(req, res) {
//     try {
//       const { orderId, amount, reason } = req.body;
      
//       // Get order details
//       const order = await Order.findById(orderId);
      
//       if (!order) {
//         return res.status(404).json({ error: 'Order not found' });
//       }
      
//       if (order.paymentMethod !== 'Card' || !order.paymentDetails?.paymentIntentId) {
//         return res.status(400).json({ error: 'This order cannot be refunded' });
//       }
      
//       // Process refund through Stripe
//       const refund = await stripe.refunds.create({
//         payment_intent: order.paymentDetails.paymentIntentId,
//         amount: amount ? Math.round(amount * 100) : undefined, // Convert to paise if partial refund
//         reason: reason || 'requested_by_customer'
//       });
      
//       // Update order status
//       order.refundStatus = amount && amount < order.total ? 'partial' : 'full';
//       order.refundDetails = {
//         refundId: refund.id,
//         amount: refund.amount / 100, // Convert from paise to rupees
//         date: new Date(),
//         reason
//       };
      
//       await order.save();
      
//       res.status(200).json({
//         success: true,
//         refund: {
//           id: refund.id,
//           amount: refund.amount / 100,
//           status: refund.status
//         }
//       });
//     } catch (error) {
//       console.error('Refund processing error:', error);
//       res.status(500).json({ error: 'Failed to process refund' });
//     }
//   }

//   /**
//    * Get payment methods saved for a customer
//    * @param {Object} req - Express request object
//    * @param {Object} res - Express response object
//    */
//   async getCustomerPaymentMethods(req, res) {
//     try {
//       const { customerId } = req.params;
      
//       if (!customerId) {
//         return res.status(400).json({ error: 'Customer ID is required' });
//       }
      
//       // Get payment methods attached to the customer
//       const paymentMethods = await stripe.paymentMethods.list({
//         customer: customerId,
//         type: 'card'
//       });
      
//       res.status(200).json({
//         success: true,
//         paymentMethods: paymentMethods.data
//       });
//     } catch (error) {
//       console.error('Error retrieving payment methods:', error);
//       res.status(500).json({ error: 'Failed to retrieve payment methods' });
//     }
//   }
// }

// module.exports = new PaymentController();




const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51R4f2SP4ZdNvaffvJ7ZCQXjDd2FDd1aDTR1VGhjtNLKxAIDBarLvrK8b88qoAahwaKFAtMKFSuNXV0cK8073FygL00BHYb9OmB');
const Order = require('../models/paymentOrder');

/**
 * Payment Controller for handling Stripe payments
 */
class PaymentController {
  /**
   * Create a payment intent with Stripe
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'inr', paymentMethodType = 'card', metadata = {} } = req.body;

      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount provided' });
      }

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
        currency,
        payment_method_types: [paymentMethodType],
        metadata
      });

      // Return client secret to frontend
      res.status(200).json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  }

  /**
   * Process a Cash on Delivery order (no payment processing needed)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processCODOrder(req, res) {
    try {
      const { items, total, address } = req.body;
      
      // Create order record for COD
      const order = await Order.create({
        items,
        total,
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        address,
        orderStatus: 'confirmed'
      });

      res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      console.error('COD order processing error:', error);
      res.status(500).json({ error: 'Failed to process COD order' });
    }
  }

  /**
   * Confirm a card payment after it's completed
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async confirmCardPayment(req, res) {
    try {
      const { paymentIntentId, items, total, address } = req.body;
      
      // Verify payment status with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          error: 'Payment not successful',
          status: paymentIntent.status
        });
      }
      
      // Create order record for completed card payment
      const order = await Order.create({
        items,
        total,
        paymentMethod: 'Card',
        paymentStatus: 'paid',
        paymentDetails: {
          paymentIntentId,
          amount: paymentIntent.amount / 100, // Convert from paise to rupees
          currency: paymentIntent.currency,
          paymentDate: new Date()
        },
        address,
        orderStatus: 'confirmed'
      });
      
      res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }

  /**
   * Handle Stripe webhook events
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async handleWebhook(req, res) {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body, // Using raw body from the middleware
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here'
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // Update order status if needed
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id, failedPayment.last_payment_error?.message);
        // Handle failed payment - notify customer, update order status
        break;
        
      case 'charge.refunded':
        const refund = event.data.object;
        console.log('Charge refunded:', refund.id);
        // Handle refund - update order status
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  }

  /**
   * Process refund for an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processRefund(req, res) {
    try {
      const { orderId, amount, reason } = req.body;
      
      // Get order details
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      if (order.paymentMethod !== 'Card' || !order.paymentDetails?.paymentIntentId) {
        return res.status(400).json({ error: 'This order cannot be refunded' });
      }
      
      // Process refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.paymentDetails.paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to paise if partial refund
        reason: reason || 'requested_by_customer'
      });
      
      // Update order status
      order.refundStatus = amount && amount < order.total ? 'partial' : 'full';
      order.refundDetails = {
        refundId: refund.id,
        amount: refund.amount / 100, // Convert from paise to rupees
        date: new Date(),
        reason
      };
      
      await order.save();
      
      res.status(200).json({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        }
      });
    } catch (error) {
      console.error('Refund processing error:', error);
      res.status(500).json({ error: 'Failed to process refund' });
    }
  }

  /**
   * Get payment methods saved for a customer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCustomerPaymentMethods(req, res) {
    try {
      const { customerId } = req.params;
      
      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }
      
      // Get payment methods attached to the customer
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      
      res.status(200).json({
        success: true,
        paymentMethods: paymentMethods.data
      });
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      res.status(500).json({ error: 'Failed to retrieve payment methods' });
    }
  }
}

module.exports = new PaymentController();