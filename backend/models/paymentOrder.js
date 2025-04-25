// const mongoose = require('mongoose');

// const OrderSchema = new mongoose.Schema({
//   items: [{
//     id: {
//       type: Number,
//       required: true
//     },
//     name: {
//       type: String,
//       required: true
//     },
//     price: {
//       type: Number,
//       required: true
//     },
//     quantity: {
//       type: Number,
//       required: true
//     }
//   }],
//   total: {
//     type: Number,
//     required: true
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['Card', 'COD'],
//     required: true
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'paid', 'failed', 'refunded'],
//     default: 'pending'
//   },
//   paymentDetails: {
//     paymentIntentId: String,
//     amount: Number,
//     currency: String,
//     paymentDate: Date
//   },
//   address: {
//     fullName: {
//       type: String,
//       required: true
//     },
//     street: {
//       type: String,
//       required: true
//     },
//     city: {
//       type: String,
//       required: true
//     },
//     state: {
//       type: String,
//       required: true
//     },
//     zip: {
//       type: String,
//       required: true
//     },
//     phone: {
//       type: String,
//       required: true
//     }
//   },
//   orderStatus: {
//     type: String,
//     enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
//     default: 'pending'
//   },
//   refundStatus: {
//     type: String,
//     enum: ['none', 'partial', 'full'],
//     default: 'none'
//   },
//   refundDetails: {
//     refundId: String,
//     amount: Number,
//     date: Date,
//     reason: String
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Orders', OrderSchema);