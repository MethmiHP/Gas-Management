import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductService } from '../inventoryManagement/services/product.services';
import { FiShoppingCart, FiFilter, FiRefreshCw, FiPackage, FiX, FiMinus, FiPlus, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import Header from '../layout/Header';
import API_CONFIG from '../../utils/apiConfig';

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
        const response = await axios.post(`${API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.CARTS)}`, {
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
    if (!localStorage.getItem('token') && !localStorage.getItem('tempCart')) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!cartId) {
      await createCart();
    }
    
    try {
      setAddingToCart(true);
      
      try {
        const response = await axios.post(`${API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.CARTS)}/${cartId}/items`, {
          productId: product._id,
          quantity: qty
        });
        
        if (response.data.success) {
          setCartSuccess(true);
          setTimeout(() => setCartSuccess(false), 3000);
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
      } catch (apiError) {
        console.warn('Server unavailable, using local storage for cart:', apiError.message);
        
        // If server is unavailable, update the cart in local storage
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '{"items":[], "totalAmount":0}');
        
        // Find if item exists
        const existingItemIndex = tempCart.items.findIndex(item => item.productId === product._id);
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          tempCart.items[existingItemIndex].quantity += qty;
        } else {
          // Add new item
          tempCart.items.push({
            productId: product._id,
            productName: product.name,
            price: product.price || 0,
            quantity: qty,
            category: product.type,
            cartItemId: 'item-' + Date.now()
          });
        }
        
        // Update total amount
        tempCart.totalAmount = tempCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save back to local storage
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
        
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl mb-10 p-8 shadow-xl">
          <h1 className="text-4xl font-bold mb-3">Our Products</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Browse our selection of high-quality gas products and accessories for all your needs.
          </p>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-blue-500" />
              <select 
                value={filterType}
                onChange={(e) => handleFilterTypeChange(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="Gas Cylinder">Gas Cylinders</option>
                <option value="Accessory">Accessories</option>
              </select>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>
            
            <button 
              onClick={fetchProducts}
              className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center"
            >
              <FiRefreshCw size={20} className="mr-1" /> Refresh
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-blue-500 mx-auto mb-4">
              <FiPackage size={64} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* ...existing code for product cards... */}
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                onClick={() => openProductModal(product)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
              >
                {/* Product image */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100">
                      <FiPackage size={64} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Capacity badge */}
                  {product.type === 'Gas Cylinder' && product.capacity && (
                    <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                      product.capacity === 'Filled' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {product.capacity}
                    </span>
                  )}
                </div>
                
                {/* Product details */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">
                      {product.type}
                      {product.gasType ? ` - ${product.gasType}` : ''}
                      {product.size ? ` (${product.size})` : ''}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.quantity > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.quantity > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-gray-900">
                      ${(product.price !== undefined && product.price !== null) ? product.price.toFixed(2) : '0.00'}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.quantity <= 0 || addingToCart}
                      className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <FiShoppingCart className="mr-2" />
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* ...existing modal code... */}
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
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                      selectedProduct.type === 'Gas Cylinder' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedProduct.type}
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                    
                    <div className="flex items-center mt-1 mb-4">
                      {selectedProduct.type === 'Gas Cylinder' && selectedProduct.capacity && (
                        <span className={`mr-3 px-2 py-1 text-xs font-bold rounded-full ${
                          selectedProduct.capacity === 'Filled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedProduct.capacity}
                        </span>
                      )}
                      
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedProduct.quantity > 10 
                          ? 'bg-green-100 text-green-800' 
                          : selectedProduct.quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.quantity > 0 ? `In Stock (${selectedProduct.quantity})` : 'Out of Stock'}
                      </span>
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
