const mongoose = require("mongoose");

// Define the schema for cart items
const CartItemSchema = new mongoose.Schema({
  cartItemId: { 
    type: String, 
    required: true 
  },
  productId: { 
    type: String, 
    required: true 
  },
  productName: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1 
  },
  category: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Define the main cart schema
const CartSchema = new mongoose.Schema({
  userId: { 
    type: String,
    required: false // Can be null for guest carts
  },
  cartId: { 
    type: String, 
    required: true,
    unique: true 
  },
  items: [CartItemSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ["active", "abandoned", "converted"],
    default: "active"
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true }); // This automatically updates createdAt and updatedAt

// Define pre-save middleware to calculate total amount
CartSchema.pre('save', function(next) {
  // Calculate cart total based on items
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  
  // Update the updatedAt field
  this.updatedAt = new Date();
  
  next();
});

// Define a method for adding items to the cart
CartSchema.methods.addItem = function(productData, quantity = 1) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId === productData.id
  );
  
  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    const itemCount = this.items.length + 1;
    const cartItemId = `CART${itemCount.toString().padStart(3, '0')}`;
    
    this.items.push({
      cartItemId,
      productId: productData.id,
      productName: productData.name,
      price: productData.price,
      quantity: quantity,
      category: productData.category,
      timestamp: new Date()
    });
  }
  
  return this.save();
};

// Define a method for removing items from the cart
CartSchema.methods.removeItem = function(cartItemId) {
  const itemIndex = this.items.findIndex(
    item => item.cartItemId === cartItemId
  );
  
  if (itemIndex >= 0) {
    this.items.splice(itemIndex, 1);
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Define a method for updating item quantity
CartSchema.methods.updateItemQuantity = function(cartItemId, newQuantity) {
  const itemIndex = this.items.findIndex(
    item => item.cartItemId === cartItemId
  );
  
  if (itemIndex >= 0) {
    if (newQuantity <= 0) {
      // Remove the item if quantity is zero or negative
      return this.removeItem(cartItemId);
    } else {
      this.items[itemIndex].quantity = newQuantity;
      return this.save();
    }
  }
  
  return Promise.resolve(this);
};

// Define a method for clearing the cart
CartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model("Cart", CartSchema);