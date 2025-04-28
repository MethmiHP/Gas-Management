/**
 * Utility functions for cart management
 */

// Check if a cart ID is for a local/temporary cart
export const isLocalCart = (id) => {
  return id && id.toString().startsWith('temp-');
};

// Get cart data from localStorage
export const getLocalCart = () => {
  const cartData = localStorage.getItem('tempCart');
  return cartData ? JSON.parse(cartData) : { items: [], totalAmount: 0 };
};

// Save cart data to localStorage
export const saveLocalCart = (cart) => {
  localStorage.setItem('tempCart', JSON.stringify(cart));
};

// Update cart item quantity in local cart
export const updateLocalCartItemQty = (cartItemId, newQty) => {
  const localCart = getLocalCart();
  const itemIndex = localCart.items.findIndex(item => item.cartItemId === cartItemId);
  
  if (itemIndex !== -1) {
    if (newQty <= 0) {
      // Remove item if quantity is 0 or less
      localCart.items = localCart.items.filter(item => item.cartItemId !== cartItemId);
    } else {
      // Update quantity
      localCart.items[itemIndex].quantity = newQty;
    }
    
    // Update total
    localCart.totalAmount = calculateLocalCartTotal(localCart);
    saveLocalCart(localCart);
  }
  
  return localCart;
};

// Calculate cart total
export const calculateLocalCartTotal = (cart) => {
  if (!cart || !cart.items || !Array.isArray(cart.items)) {
    return 0;
  }
  
  return cart.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Add item to local cart
export const addItemToLocalCart = (product, qty = 1) => {
  const localCart = getLocalCart();
  const cartItemId = 'local-item-' + Date.now();
  
  // Check if product already exists
  const existingItemIndex = localCart.items.findIndex(item => item.productId === product._id);
  
  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    localCart.items[existingItemIndex].quantity += qty;
  } else {
    // Add new item to cart
    localCart.items.push({
      cartItemId,
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: qty,
      category: product.type || product.category || 'Gases',
      timestamp: new Date().toISOString()
    });
  }
  
  // Update total
  localCart.totalAmount = calculateLocalCartTotal(localCart);
  saveLocalCart(localCart);
  
  // Notify listeners that cart was updated
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  return localCart;
};

export default {
  isLocalCart,
  getLocalCart,
  saveLocalCart,
  updateLocalCartItemQty,
  calculateLocalCartTotal,
  addItemToLocalCart
};
