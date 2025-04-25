// // cartController.js
// const Cart = require('../models/cartModel');
// // const product = require('../models/productModel');


// // Generate a simple ID
// const generateId = () => {
//   return `cart_${Date.now()}${Math.floor(Math.random() * 1000)}`;
// };

// // Create a new cart
// const createCart = async (req, res) => {
//   try {
//     const cartId = generateId();
//     const newCart = new Cart({
//       cartId,
//       items: [],
//       userId: req.body.userId || null, // Optional, for logged-in users
//       totalAmount: 0 // Initialize total amount
//     });
    
//     await newCart.save();
    
//     res.status(201).json({
//       success: true,
//       data: {
//         cartId,
//         cart: newCart,
//         totalAmount: 0,
//         message: 'Cart created successfully'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create cart'
//     });
//   }
// };

// // Get cart by ID
// const getCart = async (req, res) => {
//   try {
//     const { cartId } = req.params;
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     // Calculate total amount
//     const totalAmount = calculateTotalAmount(cart);
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart,
//         totalAmount
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to retrieve cart'
//     });
//   }
// };

// // Add item to cart
// const addItemToCart = async (req, res) => {
//   try {
//     const { cartId } = req.params;
//     const { productId, quantity = 1 } = req.body;
    
//     // Input validation
//     if (!productId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Product ID is required'
//       });
//     }
    
//     if (quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Quantity must be greater than zero'
//       });
//     }
    
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     // Find product from database
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }
    
//     // Use the addItem method defined in the schema
//     await cart.addItem(product, parseInt(quantity, 10));
    
//     // Reload cart to get updated values
//     const updatedCart = await Cart.findOne({ cartId });
    
//     // Calculate total amount
//     const totalAmount = calculateTotalAmount(updatedCart);
    
//     // Update total amount in the cart
//     updatedCart.totalAmount = totalAmount;
//     await updatedCart.save();
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart: updatedCart,
//         totalAmount,
//         message: 'Item added to cart successfully'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to add item to cart'
//     });
//   }
// };

// // Update cart item
// const updateCartItem = async (req, res) => {
//   try {
//     const { cartId, cartItemId } = req.params;
//     const { quantity, productId } = req.body;
    
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     const itemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
    
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart item not found'
//       });
//     }
    
//     // If productId is provided, update the product
//     if (productId && productId !== cart.items[itemIndex].productId) {
//       const product = await Product.findById(productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           error: 'Product not found'
//         });
//       }
      
//       cart.items[itemIndex].productId = product._id;
//       cart.items[itemIndex].productName = product.name;
//       cart.items[itemIndex].price = product.price;
//       cart.items[itemIndex].category = product.category;
//     }
    
//     // Update quantity if provided
//     if (quantity !== undefined) {
//       if (parseInt(quantity, 10) <= 0) {
//         // Remove item if quantity is zero or less
//         await cart.removeItem(cartItemId);
//       } else {
//         cart.items[itemIndex].quantity = parseInt(quantity, 10);
//         await cart.save();
//       }
//     } else {
//       await cart.save();
//     }
    
//     // Reload cart to get updated values
//     const updatedCart = await Cart.findOne({ cartId });
    
//     // Calculate total amount
//     const totalAmount = calculateTotalAmount(updatedCart);
    
//     // Update total amount in the cart
//     updatedCart.totalAmount = totalAmount;
//     await updatedCart.save();
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart: updatedCart,
//         totalAmount,
//         message: 'Cart item updated successfully'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update cart item'
//     });
//   }
// };

// // Remove item from cart
// const removeCartItem = async (req, res) => {
//   try {
//     const { cartId, cartItemId } = req.params;
    
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     await cart.removeItem(cartItemId);
    
//     // Reload cart to get updated values
//     const updatedCart = await Cart.findOne({ cartId });
    
//     // Calculate total amount
//     const totalAmount = calculateTotalAmount(updatedCart);
    
//     // Update total amount in the cart
//     updatedCart.totalAmount = totalAmount;
//     await updatedCart.save();
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart: updatedCart,
//         totalAmount,
//         message: 'Item removed from cart successfully'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to remove item from cart'
//     });
//   }
// };

// // Update item quantity
// const updateItemQuantity = async (req, res) => {
//   try {
//     const { cartId, cartItemId } = req.params;
//     const { change } = req.body;
    
//     if (isNaN(parseInt(change, 10))) {
//       return res.status(400).json({
//         success: false,
//         error: 'Change value must be a number'
//       });
//     }
    
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     const itemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
    
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart item not found'
//       });
//     }
    
//     // Calculate new quantity
//     const currentQuantity = cart.items[itemIndex].quantity;
//     const newQuantity = Math.max(1, currentQuantity + parseInt(change, 10));
    
//     // Use the updateItemQuantity method defined in the schema
//     await cart.updateItemQuantity(cartItemId, newQuantity);
    
//     // Reload cart to get updated values
//     const updatedCart = await Cart.findOne({ cartId });
    
//     // Calculate total amount
//     const totalAmount = calculateTotalAmount(updatedCart);
    
//     // Update total amount in the cart
//     updatedCart.totalAmount = totalAmount;
//     await updatedCart.save();
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart: updatedCart,
//         totalAmount,
//         message: 'Item quantity updated successfully'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update item quantity'
//     });
//   }
// };

// // Clear cart
// const clearCart = async (req, res) => {
//   try {
//     const { cartId } = req.params;
    
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     await cart.clearCart();
    
//     // Reload cart to get updated values
//     const updatedCart = await Cart.findOne({ cartId });
    
//     // Reset total amount to zero
//     updatedCart.totalAmount = 0;
//     await updatedCart.save();
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart: updatedCart,
//         totalAmount: 0,
//         message: 'Cart cleared successfully'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to clear cart'
//     });
//   }
// };

// // Get all products
// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
    
//     res.status(200).json({
//       success: true,
//       data: {
//         products
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch products'
//     });
//   }
// };

// // Mark cart as abandoned
// const markCartAbandoned = async (req, res) => {
//   try {
//     const { cartId } = req.params;
    
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     cart.status = 'abandoned';
//     await cart.save();
    
//     // Calculate total amount
//     const totalAmount = calculateTotalAmount(cart);
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart,
//         totalAmount,
//         message: 'Cart marked as abandoned'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to mark cart as abandoned'
//     });
//   }
// };

// // Mark cart as converted
// const markCartConverted = async (req, res) => {
//   try {
//     const { cartId } = req.params;
    
//     const cart = await Cart.findOne({ cartId });
    
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         error: 'Cart not found'
//       });
//     }
    
//     cart.status = 'converted';
//     await cart.save();
    
//     // Calculate total amount
//     const totalAmount = calculateTotalAmount(cart);
    
//     res.status(200).json({
//       success: true,
//       data: {
//         cart,
//         totalAmount,
//         message: 'Cart marked as converted'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Failed to mark cart as converted'
//     });
//   }
// };

// // Helper function to calculate total amount
// const calculateTotalAmount = (cart) => {
//   if (!cart || !cart.items || !Array.isArray(cart.items)) {
//     return 0;
//   }
  
//   return cart.items.reduce((total, item) => {
//     return total + (item.price * item.quantity);
//   }, 0);
// };

// module.exports = {
//   createCart,
//   getCart,
//   addItemToCart,
//   updateCartItem,
//   removeCartItem,
//   updateItemQuantity,
//   clearCart,
//   getAllProducts,
//   markCartAbandoned,
//   markCartConverted
// };




// cartController.js
const Cart = require('../models/cartModel');
const Product = require('../models/productModel'); // Added missing Product model import

// Generate a simple ID
const generateId = () => {
  return `cart_${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Create a new cart
const createCart = async (req, res) => {
  try {
    const cartId = generateId();
    const newCart = new Cart({
      cartId,
      items: [],
      userId: req.body.userId || null, // Optional, for logged-in users
      totalAmount: 0 // Initialize total amount
    });
    
    await newCart.save();
    
    res.status(201).json({
      success: true,
      data: {
        cartId,
        cart: newCart,
        totalAmount: 0,
        message: 'Cart created successfully'
      }
    });
  } catch (error) {
    console.error('Create cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create cart'
    });
  }
};

// Get cart by ID
const getCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        cart,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cart'
    });
  }
};

// Add item to cart
const addItemToCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity = 1 } = req.body;
    
    // Input validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than zero'
      });
    }
    
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    // Find product from database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Convert product to the format expected by addItem method
    const productData = {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      category: product.category
    };
    
    // Use the addItem method defined in the schema
    await cart.addItem(productData, parseInt(quantity, 10));
    
    // Reload cart to get updated values
    const updatedCart = await Cart.findOne({ cartId });
    
    res.status(200).json({
      success: true,
      data: {
        cart: updatedCart,
        totalAmount: updatedCart.totalAmount,
        message: 'Item added to cart successfully'
      }
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
      details: error.message
    });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { cartId, cartItemId } = req.params;
    const { quantity, productId } = req.body;
    
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    // If productId is provided, update the product
    if (productId && productId !== cart.items[itemIndex].productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      cart.items[itemIndex].productId = product._id.toString();
      cart.items[itemIndex].productName = product.name;
      cart.items[itemIndex].price = product.price;
      cart.items[itemIndex].category = product.category;
    }
    
    // Update quantity if provided
    if (quantity !== undefined) {
      if (parseInt(quantity, 10) <= 0) {
        // Remove item if quantity is zero or less
        await cart.removeItem(cartItemId);
      } else {
        cart.items[itemIndex].quantity = parseInt(quantity, 10);
        await cart.save();
      }
    } else {
      await cart.save();
    }
    
    // Reload cart to get updated values
    const updatedCart = await Cart.findOne({ cartId });
    
    res.status(200).json({
      success: true,
      data: {
        cart: updatedCart,
        totalAmount: updatedCart.totalAmount,
        message: 'Cart item updated successfully'
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
      details: error.message
    });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const { cartId, cartItemId } = req.params;
    
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    await cart.removeItem(cartItemId);
    
    // Reload cart to get updated values
    const updatedCart = await Cart.findOne({ cartId });
    
    res.status(200).json({
      success: true,
      data: {
        cart: updatedCart,
        totalAmount: updatedCart.totalAmount,
        message: 'Item removed from cart successfully'
      }
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart',
      details: error.message
    });
  }
};

// Update item quantity
const updateItemQuantity = async (req, res) => {
  try {
    const { cartId, cartItemId } = req.params;
    const { change } = req.body;
    
    if (isNaN(parseInt(change, 10))) {
      return res.status(400).json({
        success: false,
        error: 'Change value must be a number'
      });
    }
    
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    // Calculate new quantity
    const currentQuantity = cart.items[itemIndex].quantity;
    const newQuantity = Math.max(1, currentQuantity + parseInt(change, 10));
    
    // Use the updateItemQuantity method defined in the schema
    await cart.updateItemQuantity(cartItemId, newQuantity);
    
    // Reload cart to get updated values
    const updatedCart = await Cart.findOne({ cartId });
    
    res.status(200).json({
      success: true,
      data: {
        cart: updatedCart,
        totalAmount: updatedCart.totalAmount,
        message: 'Item quantity updated successfully'
      }
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update item quantity',
      details: error.message
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    await cart.clearCart();
    
    // Reload cart to get updated values
    const updatedCart = await Cart.findOne({ cartId });
    
    res.status(200).json({
      success: true,
      data: {
        cart: updatedCart,
        totalAmount: updatedCart.totalAmount,
        message: 'Cart cleared successfully'
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
      details: error.message
    });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    
    res.status(200).json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
};

// Mark cart as abandoned
const markCartAbandoned = async (req, res) => {
  try {
    const { cartId } = req.params;
    
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    cart.status = 'abandoned';
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: {
        cart,
        totalAmount: cart.totalAmount,
        message: 'Cart marked as abandoned'
      }
    });
  } catch (error) {
    console.error('Mark abandoned error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark cart as abandoned',
      details: error.message
    });
  }
};

// Mark cart as converted
const markCartConverted = async (req, res) => {
  try {
    const { cartId } = req.params;
    
    const cart = await Cart.findOne({ cartId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    cart.status = 'converted';
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: {
        cart,
        totalAmount: cart.totalAmount,
        message: 'Cart marked as converted'
      }
    });
  } catch (error) {
    console.error('Mark converted error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark cart as converted',
      details: error.message
    });
  }
};

module.exports = {
  createCart,
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  updateItemQuantity,
  clearCart,
  getAllProducts,
  markCartAbandoned,
  markCartConverted
};