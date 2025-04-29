import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Check, X, ChevronDown, ShoppingCart, MinusCircle, Plus, Minus, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../userManagement/context/AuthContext';
import { UserService } from '../userManagement/services/userService';
import { isLocalCart, getLocalCart, saveLocalCart, updateLocalCartItemQty } from '../utils/cartUtils';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000';

const CartController = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartId, setCartId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    price: 0,
    quantity: 1,
    category: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formAnimation, setFormAnimation] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [tableAnimation, setTableAnimation] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  // Check authentication when component mounts
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError('Please log in to view your cart');
    } else if (!authLoading && isAuthenticated) {
      // Only initialize cart if user is logged in
      initCart();
    }
  }, [isAuthenticated, authLoading]);

  // Initialize cart
  const initCart = () => {
    const existingCartId = localStorage.getItem('cartId');

    if (existingCartId) {
      setCartId(existingCartId);
      fetchCart(existingCartId);
    } else {
      createNewCart();
    }

    fetchProducts();
  };

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cartItems]);

  const createNewCart = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/cart/carts`, {
        userId: localStorage.getItem('userId') || null
      });

      if (response.data.success) {
        const newCartId = response.data.data.cartId;
        localStorage.setItem('cartId', newCartId);
        setCartId(newCartId);
        setCartItems([]);
      }
    } catch (err) {
      setError(`Failed to create cart: ${err.message}`);
      console.error('Error creating cart:', err);

      const tempCartId = 'temp-' + Date.now();
      localStorage.setItem('cartId', tempCartId);
      localStorage.setItem('tempCart', JSON.stringify({ items: [], totalAmount: 0 }));
      setCartId(tempCartId);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async (id) => {
    if (isLocalCart(id)) {
      const localCart = getLocalCart();
      setCartItems(localCart.items || []);
      setCartTotal(localCart.totalAmount || 0);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cart/carts/${id}`);

      if (response.data.success) {
        setCartItems(response.data.data.cart.items || []);
        setCartTotal(response.data.data.totalAmount || 0);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        localStorage.removeItem('cartId');
        createNewCart();
      } else {
        setError(`Failed to fetch cart: ${err.message}`);
        console.error('Error fetching cart:', err);

        const tempCartId = 'temp-' + Date.now();
        localStorage.setItem('cartId', tempCartId);
        localStorage.setItem('tempCart', JSON.stringify({ items: [], totalAmount: 0 }));
        setCartId(tempCartId);
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products`);

      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setProducts(response.data || []);
      }
    } catch (err) {
      setError(`Failed to fetch products: ${err.message}`);
      console.error('Error fetching products:', err);

      setProducts([
        { _id: '1', name: 'Gas Cylinder (Small)', price: 25.99, category: 'Gases' },
        { _id: '2', name: 'Gas Cylinder (Medium)', price: 45.99, category: 'Gases' },
        { _id: '3', name: 'Gas Cylinder (Large)', price: 75.99, category: 'Gases' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'productName') {
      const product = products.find(p => p.name === value);
      if (product) {
        setFormData({
          ...formData,
          productName: product.name,
          productId: product._id,
          price: product.price,
          category: product.category || product.type
        });
      } else {
        setFormData({
          ...formData,
          productName: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: name === 'quantity' ? parseInt(value, 10) : value
      });
    }
  };

  const handleQuantityChange = async (cartItemId, change) => {
    if (isLocalCart(cartId)) {
      try {
        setLoading(true);
        setTableAnimation(false);

        const localCart = getLocalCart();
        const itemIndex = localCart.items.findIndex(item => item.cartItemId === cartItemId);

        if (itemIndex !== -1) {
          const newQuantity = Math.max(1, localCart.items[itemIndex].quantity + change);
          const updatedCart = updateLocalCartItemQty(cartItemId, newQuantity);

          setTimeout(() => {
            setCartItems(updatedCart.items);
            setCartTotal(updatedCart.totalAmount);
            setTableAnimation(true);
          }, 300);
        }
      } catch (err) {
        setError(`Failed to update quantity: ${err.message}`);
        console.error('Error updating quantity in local cart:', err);
        setTableAnimation(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setTableAnimation(false);

      const response = await axios.patch(
        `${API_BASE_URL}/cart/carts/${cartId}/items/${cartItemId}/quantity`,
        { change }
      );

      if (response.data.success) {
        setTimeout(() => {
          setCartItems(response.data.data.cart.items);
          setCartTotal(response.data.data.totalAmount);
          setTableAnimation(true);
        }, 300);
      }
    } catch (err) {
      setError(`Failed to update quantity: ${err.message}`);
      console.error('Error updating quantity:', err);
      setTableAnimation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('Please log in to add items to your cart');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!formData.productId) {
      setError('Please select a valid product');
      return;
    }

    if (isLocalCart(cartId)) {
      try {
        setLoading(true);
        setTableAnimation(false);

        const localCart = getLocalCart();

        if (editingId) {
          const itemIndex = localCart.items.findIndex(item => item.cartItemId === editingId);

          if (itemIndex !== -1) {
            localCart.items[itemIndex] = {
              ...localCart.items[itemIndex],
              productId: formData.productId,
              productName: formData.productName,
              price: formData.price,
              quantity: formData.quantity,
              category: formData.category
            };
          }
        } else {
          const cartItemId = 'local-item-' + Date.now();
          localCart.items.push({
            cartItemId,
            productId: formData.productId,
            productName: formData.productName,
            price: formData.price,
            quantity: formData.quantity,
            category: formData.category,
            timestamp: new Date()
          });
        }

        localCart.totalAmount = localCart.items.reduce(
          (total, item) => total + (item.price * item.quantity), 0
        );

        saveLocalCart(localCart);

        setTimeout(() => {
          setCartItems(localCart.items);
          setCartTotal(localCart.totalAmount);
          setTableAnimation(true);

          setFormData({
            productId: '',
            productName: '',
            price: 0,
            quantity: 1,
            category: ''
          });

          setEditingId(null);

          setFormAnimation('animate-fade-out');
          setTimeout(() => {
            setShowForm(false);
            setFormAnimation('');
          }, 300);
        }, 300);
      } catch (err) {
        console.error('Error updating local cart:', err);
        setError(`Failed to save item: ${err.message}`);
        setTableAnimation(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        const response = await axios.put(
          `${API_BASE_URL}/cart/carts/${cartId}/items/${editingId}`,
          {
            productId: formData.productId,
            quantity: formData.quantity
          }
        );

        if (response.data.success) {
          setTableAnimation(false);
          setTimeout(() => {
            setCartItems(response.data.data.cart.items);
            setCartTotal(response.data.data.totalAmount);
            setTableAnimation(true);
          }, 300);

          setEditingId(null);
        }
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/cart/carts/${cartId}/items`,
          {
            productId: formData.productId,
            quantity: formData.quantity
          }
        );

        if (response.data.success) {
          setTableAnimation(false);
          setTimeout(() => {
            setCartItems(response.data.data.cart.items);
            setCartTotal(response.data.data.totalAmount);
            setTableAnimation(true);
          }, 300);
        }
      }

      setFormData({
        productId: '',
        productName: '',
        price: 0,
        quantity: 1,
        category: ''
      });

      setFormAnimation('animate-fade-out');
      setTimeout(() => {
        setShowForm(false);
        setFormAnimation('');
      }, 300);
    } catch (err) {
      console.error('Error saving item:', err);
      setError(`Failed to save item: ${err.message}`);

      if (err.response && err.response.status === 404) {
        const tempCartId = 'temp-' + Date.now();
        localStorage.setItem('cartId', tempCartId);
        setCartId(tempCartId);

        setTimeout(() => handleSubmit(e), 300);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cartItemId) => {
    if (isLocalCart(cartId)) {
      try {
        setLoading(true);
        setTableAnimation(false);

        const localCart = getLocalCart();
        localCart.items = localCart.items.filter(item => item.cartItemId !== cartItemId);

        localCart.totalAmount = localCart.items.reduce(
          (total, item) => total + (item.price * item.quantity), 0
        );

        saveLocalCart(localCart);

        setTimeout(() => {
          setCartItems(localCart.items);
          setCartTotal(localCart.totalAmount);
          setTableAnimation(true);
        }, 300);
      } catch (err) {
        setError('Failed to delete item. Please try again.');
        console.error('Error deleting item from local cart:', err);
        setTableAnimation(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);

      setTableAnimation(false);

      const response = await axios.delete(
        `${API_BASE_URL}/cart/carts/${cartId}/items/${cartItemId}`
      );

      if (response.data.success) {
        setTimeout(() => {
          setCartItems(response.data.data.cart.items);
          setCartTotal(response.data.data.totalAmount);
          setTableAnimation(true);
        }, 300);
      }
    } catch (err) {
      setError('Failed to delete item. Please try again.');
      console.error('Error deleting item:', err);
      setTableAnimation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;

    if (isLocalCart(cartId)) {
      try {
        setLoading(true);
        setTableAnimation(false);

        const emptyCart = { items: [], totalAmount: 0 };
        saveLocalCart(emptyCart);

        setTimeout(() => {
          setCartItems([]);
          setCartTotal(0);
          setTableAnimation(true);
        }, 300);
      } catch (err) {
        setError('Failed to clear cart. Please try again.');
        console.error('Error clearing local cart:', err);
        setTableAnimation(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);

      setTableAnimation(false);

      const response = await axios.delete(`${API_BASE_URL}/cart/carts/${cartId}`);

      if (response.data.success) {
        setTimeout(() => {
          setCartItems([]);
          setCartTotal(0);
          setTableAnimation(true);
        }, 300);
      }
    } catch (err) {
      setError('Failed to clear cart. Please try again.');
      console.error('Error clearing cart:', err);
      setTableAnimation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      productId: '',
      productName: '',
      price: 0,
      quantity: 1,
      category: ''
    });
    setShowForm(true);
    setFormAnimation('animate-fade-in');
  };

  const handleCancel = () => {
    setFormAnimation('animate-fade-out');
    setTimeout(() => {
      setShowForm(false);
      setEditingId(null);
      setFormAnimation('');
    }, 300);
  };

  const handleProceedToNext = async () => {
    if (cartItems.length === 0) {
      setError('Please add items to your cart before proceeding.');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate the total amount from cart items
      const calculatedTotal = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      // If the user is not authenticated, still allow proceeding but note it
      const isGuest = !isAuthenticated;
      
      // Create an order with either authenticated user data or as guest
      const orderData = {
        userId: localStorage.getItem('userId') || 'guest',
        userName: isGuest ? 'Guest User' : UserService.getCurrentUsername() || 'Customer',
        orderType: 'Gases',
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'Gases'
        })),
        amount: calculatedTotal,
        discount: 0,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending',
        isGuestCheckout: isGuest
      };

      console.log('Creating order with data:', orderData);
      
      // FIX: Define the API URL with the correct /api prefix
      const API_URL = 'http://localhost:5000/api';
      
      // Save the order to database with appropriate headers
      try {
        const response = await axios.post(
          `${API_URL}/orders`, 
          orderData,
          {
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        console.log('Order creation response:', response);
        
        if (response.data && response.data.success) {
          const savedOrder = response.data.data;
          console.log('Order saved successfully:', savedOrder);
          
          // Mark the cart as converted if using server cart
          if (!isLocalCart(cartId)) {
            try {
              await axios.patch(`${API_URL}/cart/carts/${cartId}/convert`);
              console.log('Cart marked as converted');
            } catch (conversionError) {
              console.warn('Error marking cart as converted:', conversionError);
            }
          }
          
          // Save order details to localStorage for the next steps
          localStorage.setItem('cartTotal', cartTotal);
          localStorage.setItem('cartItemCount', cartItems.length);
          localStorage.setItem('orderItems', JSON.stringify(cartItems));
          localStorage.setItem('pendingOrderId', savedOrder.orderId);
          
          // Navigate to delivery form
          navigate('/delivery-form');
        } else {
          throw new Error('Order creation response did not indicate success');
        }
      } catch (apiError) {
        console.error('API error details:', apiError.response?.data || apiError.message);
        setError(`Failed to save order: ${apiError.response?.data?.error || apiError.message}`);
        
        // Still proceed to next step in development/testing
        if (process.env.NODE_ENV === 'development') {
          const localOrderId = `local-${Date.now()}`;
          console.warn('In development - proceeding with local order ID:', localOrderId);
          
          localStorage.setItem('cartTotal', cartTotal);
          localStorage.setItem('cartItemCount', cartItems.length);
          localStorage.setItem('orderItems', JSON.stringify(cartItems));
          localStorage.setItem('pendingOrderId', localOrderId);
          
          navigate('/delivery-form');
        }
      }
    } catch (err) {
      setError(`Failed to process your order: ${err.message}`);
      console.error('Error proceeding with order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    const product = products.find(p => p._id === item.productId);

    if (product) {
      setFormData({
        productId: item.productId,
        productName: product.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      });
    } else {
      setFormData({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      });

      if (products.every(p => p._id !== item.productId)) {
        setProducts(prevProducts => [
          ...prevProducts,
          {
            _id: item.productId,
            name: item.productName,
            price: item.price,
            category: item.category
          }
        ]);
      }
    }

    setEditingId(item.cartItemId);
    setShowForm(true);
    setFormAnimation('animate-fade-in');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const debugCartAndProducts = () => {
    console.log('Current cartItems:', cartItems);
    console.log('Available products:', products);
    console.log('Current formData:', formData);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatPrice = (price) => {
    return `LKR ${price.toFixed(2)}`;
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={clearError}
          >
            <X size={16} className="cursor-pointer" />
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 relative inline-block">
          Shopping Cart
          <span className="absolute bottom-0 left-0 w-0 h-1 bg-blue-600 transition-all duration-500 group-hover:w-full"></span>
        </h1>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all duration-300 
                     transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
            style={{
              background: "linear-gradient(45deg, #4F46E5, #60A5FA)",
              boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.39)"
            }}
          >
            <PlusCircle size={20} />
            <span>Add Item to Cart</span>
          </button>

          <button
            onClick={handleClearCart}
            className={`bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-all duration-300 
                      transform hover:scale-105 hover:shadow-lg flex items-center gap-2 ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={cartItems.length === 0}
            style={{
              background: "linear-gradient(45deg, #DC2626, #EF4444)",
              boxShadow: "0 4px 14px 0 rgba(220, 38, 38, 0.39)"
            }}
          >
            <MinusCircle size={20} />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={24} />
            <span className="text-lg font-medium text-gray-700">Items in Cart: {cartItems.length}</span>
          </div>
          <div className="text-xl font-bold text-blue-700">
            Total: {formatPrice(cartTotal)}
          </div>
          {/* {process.env.NODE_ENV === 'development' && (
            <button
              onClick={debugCartAndProducts}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Debug
            </button> */}
          {/* )} */}
        </div>

        {showForm && (
          <div
            className={`bg-gray-100 rounded-lg p-6 mb-6 border-l-4 border-blue-600 
                      transition-all duration-500 transform ${formAnimation === 'animate-fade-in' ? 'scale-100 opacity-100' : 
                      formAnimation === 'animate-fade-out' ? 'scale-95 opacity-0' : ''}`}
            style={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {editingId ?
                <><Edit className="mr-2 text-blue-600" size={20} /> Edit Cart Item</> :
                <><PlusCircle className="mr-2 text-green-600" size={20} /> Add Item to Cart</>
              }
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="transition-all duration-300 transform hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <div className="relative">
                    <select
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-black appearance-none transition-all duration-300 hover:border-blue-500 pr-10"
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product.name}>
                          {product.name} - {formatPrice(product.price)}
                        </option>
                      ))}
                    </select>
                    {editingId && !products.some(p => p.name === formData.productName) && (
                      <div className="text-amber-600 text-xs mt-1">
                        Warning: Selected product may have been modified or removed
                      </div>
                    )}
                    <ChevronDown className="absolute right-3 top-3 pointer-events-none text-gray-500" size={16} />
                  </div>
                </div>
                <div className="transition-all duration-300 transform hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                            text-black transition-all duration-300 hover:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all duration-300 
                           transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  style={{
                    background: "linear-gradient(45deg, #10B981, #34D399)",
                    boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)"
                  }}
                >
                  <Check size={20} />
                  {editingId ? 'Update Item' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-all duration-300 
                           transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div
          className={`overflow-x-auto rounded-lg transition-all duration-500 
                    ${tableAnimation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}
          style={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
          }}
        >
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subtotal</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Added On</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr
                  key={item.cartItemId}
                  className={`transition-all duration-300 ${hoveredRow === item.cartItemId ? 'bg-blue-50 scale-100 shadow-md' :
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  onMouseEnter={() => setHoveredRow(item.cartItemId)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    transform: `translateY(${index * 0.05}s)`,
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{item.productId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.productName}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.category === 'Electronics' ? 'bg-purple-100 text-purple-800' :
                      item.category === 'Footwear' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'Home Appliances' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.cartItemId, -1)}
                        className="p-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.cartItemId, 1)}
                        className="p-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-700">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item.timestamp)}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.cartItemId)}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {cartItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                    Your cart is empty. Add items to start shopping.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
{/* 
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleProceedToNext}
            className={`bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 transition-all duration-300 
                      transform hover:scale-105 hover:shadow-lg flex items-center gap-2 ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={cartItems.length === 0}
            style={{
              background: "linear-gradient(45deg, #4F46E5, #818CF8)",
              boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.39)"
            }}
          >
            <span className="font-medium">Proceed</span>
            <ArrowRight size={20} />
          </button>
        </div> */}

        {cartItems.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleProceedToNext}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all duration-300 
                     transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
              style={{
                background: "linear-gradient(45deg, #4F46E5, #60A5FA)",
                boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)"
              }}
            >
              <ArrowRight size={20} />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }

        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
      ` }} />
    </div>
  );
};

export default CartController;