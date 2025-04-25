const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['Gas Cylinder', 'Accessory'],
    trim: true
  },
  gasType: {
    type: String,
    enum: ['LPG', 'Oxygen', 'Acetylene', 'Argon', 'CO2', 'N2', null],
    default: null,
    validate: {
      validator: function(value) {
        // gasType should be provided only when type is "Gas Cylinder"
        if (this.type === 'Gas Cylinder') {
          return value != null;
        }
        return true; // for accessories, we don't care about this field
      },
      message: 'Gas type is required for gas cylinders'
    }
  },
  size: {
    type: String,
    enum: ['2.3kg', '5kg', '12.5kg', '37.5kg', null],
    default: null,
    validate: {
      validator: function(value) {
        // size should be provided when gasType is LPG
        if (this.gasType === 'LPG') {
          return ['2.3kg', '5kg', '12.5kg', '37.5kg'].includes(value);
        }
        return true; // not relevant for other gas types or accessories
      },
      message: 'Size is required for LPG gas cylinders and must be one of the valid sizes'
    }
  },
  capacity: {
    type: String,
    required: [true, 'Capacity is required'],
    validate: {
      validator: function(value) {
        if (this.type === 'Gas Cylinder') {
          return ['Filled', 'Empty'].includes(value);
        } else {
          return value === 'N/A';
        }
      },
      message: 'Capacity must be "Filled" or "Empty" for gas cylinders, and "N/A" for accessories'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a pre-save hook to set default capacity for accessories
productSchema.pre('save', function(next) {
  if (this.type === 'Accessory') {
    this.gasType = null;
    this.size = null;
    this.capacity = 'N/A';
  }
  next();
});

// Create an index for faster queries
productSchema.index({ type: 1, gasType: 1 });

// Create the model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;