const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deliverySchema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true, // Ensures each order has a unique ID
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver", // References the Driver model
        required: false,  // Make it optional
        default: null,  // Default to null if no driver is assigned
    },
    customerName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    deliveryStatus: {
        type: String,
        enum: ["Pending", "Assigned", "Out For Delivery", "Delivered", "Delivery Failed"],
        default: "Pending",
    },
    deliveryDate: {
        type: Date,
        required: true, // Expected delivery date
    },
    deliveredAt: {
        type: Date, // Stores actual delivery completion date
        required: function () {
            return this.deliveryStatus === "Delivered"; // Only required if delivered
        },
    },
    paymentMethod: {
        type: String,
        enum: ["Prepaid", "Cash On Delivery"],
        required: true,
    },
    codPaid: {
        type: Boolean,
        default: false, // For Cash on Delivery, updates when payment is received
    },
    amountReceived: {
        type: Number,
        default: 0, // Amount received for COD payments
        validate: {
            validator: function (value) {
                return this.paymentMethod === "Cash On Delivery" ? value >= 0 : value === 0;
            },
            message: "Amount received should be 0 for prepaid payments.",
        },
    },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model("Delivery", deliverySchema);

