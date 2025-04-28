import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductService } from '../inventoryManagement/services/product.services';
import { FiShoppingCart, FiFilter, FiRefreshCw, FiPackage, FiX, FiMinus, FiPlus, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import Header from '../layout/Header';
import API_CONFIG from '../../config/apiConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../userManagement/context/AuthContext';
import { isLocalCart, getLocalCart, saveLocalCart, addItemToLocalCart } from '../utils/cartUtils';

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const typeFromUrl = queryParams.get('type');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState(typeFromUrl || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartId, setCartId] = useState(localStorage.getItem('cartId') || null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    fetchProducts();
    
    // Check for existing cart
    if (!cartId) {
      createCart();
    }

    // Update filter type if URL parameter changes
    if (typeFromUrl) {
      setFilterType(typeFromUrl);
    }
  }, [typeFromUrl]);
  
  // Create a new cart if needed
  const createCart = async () => {
    try {
      // First try to create cart using the API
      try {
        const response = await axios.post(`http://localhost:5000/cart/carts`, {
          userId: localStorage.getItem('userId') || null
        });
        
        if (response.data.success) {
          const newCartId = response.data.data.cartId;
          localStorage.setItem('cartId', newCartId);
          setCartId(newCartId);
        }
      } catch (apiError) {
        console.warn('Server connection failed when creating cart:', apiError.message);
        
        // If server is unavailable, create a temporary local cart
        const tempCartId = 'temp-' + Date.now();
        localStorage.setItem('cartId', tempCartId);
        localStorage.setItem('tempCart', JSON.stringify({ items: [], totalAmount: 0 }));
        setCartId(tempCartId);
      }
    } catch (err) {
      console.error('Error creating cart:', err);
    }
  };

  // Add to cart functionality
  const handleAddToCart = async (product, qty = 1) => {
    // Remove login requirement for adding to cart
    if (!cartId) {
      await createCart();
    }
    
    try {
      setAddingToCart(true);
      
      // Check if this is a local/temporary cart
      if (isLocalCart(cartId)) {
        // Use the shared utility function to add item to local cart
        addItemToLocalCart(product, qty);
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
        return;
      }
      
      // If not a local cart, proceed with API call
      try {
        const response = await axios.post(`http://localhost:5000/cart/carts/${cartId}/items`, {
          productId: product._id,
          quantity: qty
        });
        
        if (response.data.success) {
          setCartSuccess(true);
          setTimeout(() => setCartSuccess(false), 3000);
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
      } catch (apiError) {
        console.warn('Server unavailable, switching to local cart mode:', apiError.message);
        
        // Create a temporary local cart
        const tempCartId = 'temp-' + Date.now();
        localStorage.setItem('cartId', tempCartId);
        setCartId(tempCartId);
        
        // Initialize empty cart in localStorage
        saveLocalCart({ items: [], totalAmount: 0 });
        
        // Add item to local cart
        addItemToLocalCart(product, qty);
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ProductService.getProducts();
      if (response && response.data) {
        setProducts(response.data || []);
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Failed to load products');
      setLoading(false);
    }
  };
  
  // Filter products based on type and search query
  const filteredProducts = products.filter(product => {
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });
  
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.quantity) {
      setQuantity(quantity + 1);
    }
  };

  // Update URL when filter type changes
  const handleFilterTypeChange = (newType) => {
    setFilterType(newType);
    if (newType === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?type=${encodeURIComponent(newType)}`);
    }
  };
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Cart success notification */}
        {cartSuccess && (
          <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center">
            <FiCheckCircle className="mr-2" size={20} />
            Item added to cart successfully!
            <button 
              onClick={() => navigate('/cart')} 
              className="ml-4 px-3 py-1 bg-white text-green-600 rounded hover:bg-green-50"
            >
              View Cart
            </button>
          </div>
        )}
      
        {/* Hero section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl mb-10 p-10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div> {/* Subtle overlay */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">Discover Our Gas Solutions</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl relative z-10">
            Explore our curated selection of high-quality gas cylinders and essential accessories.
          </p>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8"> {/* Subtle border */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Filter Dropdown */}
            <div className="flex items-center flex-shrink-0">
              <FiFilter className="mr-2 text-gray-500" />
              <select 
                value={filterType}
                onChange={(e) => handleFilterTypeChange(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-700 bg-white hover:border-gray-400"
              >
                <option value="all">All Products</option>
                <option value="Gas Cylinder">Gas Cylinders</option>
                <option value="Accessory">Accessories</option>
              </select>
            </div>
            
            {/* Search Input */}
            <div className="flex-grow w-full md:w-auto">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input 
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={fetchProducts}
              className="p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-150 flex items-center flex-shrink-0"
              aria-label="Refresh products"
            >
              <FiRefreshCw size={18} />
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading state, Empty State, or Product Grid */}
        {
          loading ? (
            <div className="flex justify-center items-center h-64">
              {/* Enhanced Loading Spinner */}
              <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredProducts.length === 0 ? (
            // Enhanced Empty State
            <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-indigo-300 mx-auto mb-6">
                <FiPackage size={72} className="mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Products Match</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                We couldn't find any products matching your current filters or search. Try adjusting your criteria or check back later!
              </p>
              <button 
                onClick={() => { setFilterType('all'); setSearchQuery(''); navigate('/products'); fetchProducts(); }} 
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out flex items-center mx-auto"
              >
                <FiRefreshCw className="mr-2" size={18}/> Reset Filters
              </button>
            </div>
          ) : (
            // Product Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                // Enhanced Product Card
                <div 
                  key={product._id} 
                  onClick={() => openProductModal(product)}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-200 flex flex-col"
                >
                  {/* Product image */}
                  <div className="h-52 bg-gray-100 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-50">
                        <FiPackage size={64} className="text-gray-300" />
                      </div>
                    )}
                    
                    {/* Stock indicator */}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      product.quantity > 10 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : product.quantity > 0 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {/* Product details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-3 flex-grow">
                      <div className="flex justify-between items-center mb-1.5">
                        <h3 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200 truncate" title={product.name}>{product.name}</h3>
                        <span className={`flex-shrink-0 ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                          product.type === 'Gas Cylinder' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {product.type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-3 h-10 overflow-hidden">
                        {/* Simplified details display - Removed capacity */}
                        {product.gasType && <span>{product.gasType}</span>}
                        {product.size && <span className="ml-1">({product.size})</span>}
                        {/* Removed capacity display logic here */} 
                        {!product.gasType && !product.size && product.type !== 'Gas Cylinder' && <span className="italic">Accessory</span>}
                      </div>
                    </div>

                    {/* Price and Add to Cart */}                  
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                      <span className="text-lg font-bold text-gray-900">
                        ${(product.price !== undefined && product.price !== null) ? product.price.toFixed(2) : 'N/A'}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.quantity <= 0 || addingToCart}
                        className={`flex items-center justify-center text-white px-3 py-1.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${product.quantity > 0 ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-gray-400 cursor-not-allowed' } disabled:opacity-70 disabled:cursor-not-allowed`}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <FiShoppingCart size={18} />
                        {/* Text appears on larger screens or group hover if needed */} 
                        {/* <span className="ml-2 hidden sm:inline">Add</span> */}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        
        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="relative">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                >
                  <FiX size={24} />
                </button>
                
                <div className="flex flex-col md:flex-row">
                  {/* Product image */}
                  <div className="md:w-1/2 h-64 md:h-auto">
                    {selectedProduct.imageUrl ? (
                      <img 
                        src={selectedProduct.imageUrl} 
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-64 md:h-full bg-gray-100">
                        <FiPackage size={96} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product details */}
                  <div className="p-6 md:w-1/2">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedProduct.type === 'Gas Cylinder' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedProduct.type}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                        selectedProduct.quantity > 10 
                          ? 'bg-green-100 text-green-800' 
                          : selectedProduct.quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.quantity > 0 ? `${selectedProduct.quantity} in Stock` : 'Out of Stock'}
                      </div>
                    </div>
                    
                    <div className="text-3xl font-bold text-gray-900 mb-6">
                      ${(selectedProduct.price !== undefined && selectedProduct.price !== null) ? selectedProduct.price.toFixed(2) : '0.00'}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Details</h3>
                      <ul className="space-y-1 list-disc list-inside text-gray-600">
                        <li>Type: {selectedProduct.type}</li>
                        {selectedProduct.gasType && <li>Gas Type: {selectedProduct.gasType}</li>}
                        {selectedProduct.size && <li>Size: {selectedProduct.size}</li>}
                        {/* Removed capacity display from modal details list */} 
                      </ul>
                    </div>
                    
                    {selectedProduct.quantity > 0 ? (
                      <>
                        <div className="flex items-center mb-6">
                          <span className="mr-4 font-medium">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded">
                            <button 
                              onClick={decreaseQuantity} 
                              className="px-3 py-1 hover:bg-gray-100"
                              disabled={quantity <= 1}
                            >
                              <FiMinus size={16} />
                            </button>
                            <span className="px-4 py-1 border-l border-r border-gray-300">
                              {quantity}
                            </span>
                            <button 
                              onClick={increaseQuantity} 
                              className="px-3 py-1 hover:bg-gray-100"
                              disabled={quantity >= selectedProduct.quantity}
                            >
                              <FiPlus size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(selectedProduct, quantity)}
                          disabled={addingToCart}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
                        >
                          {addingToCart ? (
                            <span className="flex items-center">
                              <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                              Adding to Cart...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FiShoppingCart className="mr-2" />
                              Add to Cart
                            </span>
                          )}
                        </button>
                      </>
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;
