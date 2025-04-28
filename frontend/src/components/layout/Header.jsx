import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../userManagement/context/AuthContext';
import { isLocalCart, getLocalCart } from '../utils/cartUtils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is logged in and get user role
  useEffect(() => {
    // Get cart count
    fetchCartCount();
    
    // Setup event listener for cart updates
    window.addEventListener('cartUpdated', fetchCartCount);
    
    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);
  
  // Fetch cart count
  const fetchCartCount = async () => {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) return;
    
    // If it's a local cart, get count from localStorage
    if (isLocalCart(cartId)) {
      const localCart = getLocalCart();
      setCartCount(localCart.items.length);
      return;
    }
    
    // Otherwise use the API
    try {
      const response = await axios.get(`http://localhost:5000/cart/carts/${cartId}`);
      if (response.data.success) {
        const itemCount = response.data.data.cart.items.length;
        setCartCount(itemCount);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      
      // If API fails, try to get count from localStorage as fallback
      try {
        const localCart = getLocalCart();
        setCartCount(localCart.items.length);
      } catch (e) {
        console.error('Failed to get cart count from localStorage:', e);
      }
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navigateToUserDashboard = () => {
    // Redirect based on user role
    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'driver') {
      navigate('/driver/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl md:text-2xl">Nelson Enterprises</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-blue-300 transition duration-300">Home</Link>
            
            {/* Products Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center hover:text-blue-300 transition duration-300"
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
              >
                Products <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {isProductsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 text-gray-800">
                  <Link to="/products?type=Gas%20Cylinder" className="block px-4 py-2 hover:bg-blue-100">Gas Cylinders</Link>
                  <Link to="/products?type=Accessory" className="block px-4 py-2 hover:bg-blue-100">Accessories</Link>
                  <Link to="/products" className="block px-4 py-2 hover:bg-blue-100">All Products</Link>
                </div>
              )}
            </div>
            
            <Link to="/about" className="hover:text-blue-300 transition duration-300">About Us</Link>
            <Link to="/contact" className="hover:text-blue-300 transition duration-300">Contact</Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="hover:text-blue-300 transition duration-300 relative">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                <button onClick={navigateToUserDashboard} className="hover:text-blue-300 transition duration-300">Dashboard</button>
                <button onClick={handleLogout} className="hover:text-blue-300 transition duration-300">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-300 transition duration-300">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="hover:text-blue-300 transition duration-300 relative mr-4">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-800 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link to="/" className="py-2 block hover:bg-blue-700 px-3 rounded">Home</Link>
            
            <div className="relative">
              <button
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                className="w-full text-left flex items-center justify-between py-2 hover:bg-blue-700 px-3 rounded"
              >
                Products <ChevronDown className="h-4 w-4" />
              </button>
              
              {isProductsDropdownOpen && (
                <div className="bg-blue-700 mt-1 py-2 px-4 rounded">
                  <Link to="/products?type=Gas%20Cylinder" className="block py-2 hover:bg-blue-600 px-2 rounded">Gas Cylinders</Link>
                  <Link to="/products?type=Accessory" className="block py-2 hover:bg-blue-600 px-2 rounded">Accessories</Link>
                  <Link to="/products" className="block py-2 hover:bg-blue-600 px-2 rounded">All Products</Link>
                </div>
              )}
            </div>
            
            <Link to="/about" className="py-2 block hover:bg-blue-700 px-3 rounded">About Us</Link>
            <Link to="/contact" className="py-2 block hover:bg-blue-700 px-3 rounded">Contact</Link>
            
            {isAuthenticated ? (
              <>
                <button 
                  onClick={navigateToUserDashboard} 
                  className="py-2 block hover:bg-blue-700 px-3 rounded text-left"
                >
                  My Dashboard
                </button>
                <Link to="/orders" className="py-2 block hover:bg-blue-700 px-3 rounded">My Orders</Link>
                <Link to="/profile" className="py-2 block hover:bg-blue-700 px-3 rounded">Edit Profile</Link>
                <button 
                  onClick={handleLogout}
                  className="py-2 block hover:bg-blue-700 px-3 rounded text-left text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 block hover:bg-blue-700 px-3 rounded">Login</Link>
                <Link to="/register" className="py-2 block bg-blue-600 hover:bg-blue-700 px-3 rounded">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
