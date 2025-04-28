import React, { useState, useEffect, useRef } from 'react';
import { ProductService } from '../services/product.services';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiRefreshCw, 
  FiPackage, 
  FiAlertCircle, 
  FiFilter,
  FiSearch,
  FiPlusCircle,
  FiMinusCircle,
  FiFileText,
  FiX,
  FiPieChart,
  FiDollarSign,
  FiTrendingUp
} from 'react-icons/fi';
import ProductAnalyticsReport from '../reports/ProductAnalyticsReport';
import EditProductDialog from '../components/EditProductDialog';

// Import our UI components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../ui/dialog';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

const AdminProductManagement = () => {
  // State for products
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  // State for product form
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    gasType: null,
    size: null,
    quantity: 0,
    price: 0,
    imageUrl: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lowStock', 'gasCylinders', 'accessories'
  const [stockThreshold, setStockThreshold] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGasType, setFilterGasType] = useState('all');
  
  // Add state for inventory stats
  const [inventoryStats, setInventoryStats] = useState({
    byType: [],
    byGasType: [],
    bySize: []
  });
  
  // Add state for report dialog
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
    fetchInventoryStats();
  }, []);
  
  // Apply filters when products or search/filter options change
  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, filterType, filterGasType]);
  
  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts();
      if (response && response.data) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      }
    } catch (error) {
      setError(error.message || 'Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch low stock products
  const fetchLowStockProducts = async () => {
    try {
      const response = await ProductService.getLowInventory(stockThreshold);
      if (response && response.data) {
        setLowStockProducts(response.data.all || []);
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };
  
  // Fetch inventory statistics
  const fetchInventoryStats = async () => {
    try {
      const response = await ProductService.getInventoryStats();
      if (response?.data?.data) {
        setInventoryStats(response.data.data);
      } else {
        console.warn('/stats/inventory response structure might be unexpected:', response);
        setInventoryStats({ byType: [], byGasType: [], bySize: [] });
      }
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    }
  };
  
  // Apply search and filters to products
  const applyFilters = () => {
    let result = [...products];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.gasType && product.gasType.toLowerCase().includes(query)) ||
        (product.size && product.size.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(product => product.type === filterType);
    }
    
    // Apply gas type filter
    if (filterGasType !== 'all') {
      result = result.filter(product => product.gasType === filterGasType);
    }
    
    setFilteredProducts(result);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterGasType('all');
  };
  
  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetFilters();
    
    if (tab === 'lowStock') {
      fetchLowStockProducts();
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle number fields
    if (name === 'quantity' || name === 'price') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      // Handle other fields
      let processedValue = value;
      if (value === '' && (name === 'gasType' || name === 'size')) {
        processedValue = null;
      }
      
      setFormData({
        ...formData,
        [name]: processedValue
      });
    }
    
    // Handle type change - reset related fields
    if (name === 'type') {
      if (value === 'Accessory') {
        setFormData(prev => ({
          ...prev,
          type: value,
          gasType: null,
          size: null
        }));
      } else if (value === 'Gas Cylinder') {
        setFormData(prev => ({
          ...prev,
          type: value
        }));
      }
    }
    
    // Handle gas type change - reset size if not LPG
    if (name === 'gasType' && value !== 'LPG') {
      setFormData(prev => ({
        ...prev,
        gasType: value,
        size: null
      }));
    }
  };
  
  // Handle add new product form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      
      // Create a copy of the form data
      const productData = { ...formData };
      
      await ProductService.createProduct(productData);
      toast.success('Product created successfully!');
      setSuccess('Product created successfully!');
      
      // Reset form and close dialog
      setFormData({
        name: '',
        type: '',
        gasType: null,
        size: null,
        quantity: 0,
        price: 0,
        imageUrl: ''
      });
      setIsAddDialogOpen(false);
      
      // Refresh products
      fetchProducts();
      if (activeTab === 'lowStock') {
        fetchLowStockProducts();
      }
    } catch (error) {
      setError(error.message || 'Failed to create product');
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit product form submission
  const handleEditSubmit = async (id, updatedData) => {
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      
      await ProductService.updateProduct(id, updatedData);
      toast.success('Product updated successfully!');
      setSuccess('Product updated successfully!');
      
      // Reset state and close dialog
      setSelectedProduct(null);
      setIsEditDialogOpen(false);
      
      // Refresh products
      fetchProducts();
      if (activeTab === 'lowStock') {
        fetchLowStockProducts();
      }
    } catch (error) {
      setError(error.message || 'Failed to update product');
      toast.error(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };
  
  // Open edit dialog for a product
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };
  
  // Cancel editing and close dialog
  const handleCancelEdit = () => {
    setSelectedProduct(null);
    setIsEditDialogOpen(false);
  };
  
  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      await ProductService.deleteProduct(id);
      toast.success('Product deleted successfully!');
      
      // Refresh products
      fetchProducts();
      if (activeTab === 'lowStock') {
        fetchLowStockProducts();
      }
    } catch (error) {
      setError(error.message || 'Failed to delete product');
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };
  
  // Update product quantity
  const handleQuantityUpdate = async (id, newQuantity) => {
    try {
      setLoading(true);
      await ProductService.updateQuantity(id, { quantity: newQuantity });
      
      // Refresh products
      fetchProducts();
      if (activeTab === 'lowStock') {
        fetchLowStockProducts();
      }
      
      toast.success('Quantity updated successfully!');
    } catch (error) {
      setError(error.message || 'Failed to update quantity');
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Inventory Management</h1>
        
        {/* Right-aligned primary action button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
             {/* Primary Button Styling */}
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <FiPlus size={18} /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Gas Cylinder">Gas Cylinder</option>
                    <option value="Accessory">Accessory</option>
                  </select>
                </div>
                
                {/* Gas Type - Only for Gas Cylinders */}
                {formData.type === 'Gas Cylinder' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gas Type
                    </label>
                    <select
                      name="gasType"
                      value={formData.gasType || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Gas Type</option>
                      <option value="LPG">LPG</option>
                      <option value="Oxygen">Oxygen</option>
                      <option value="Acetylene">Acetylene</option>
                      <option value="Argon">Argon</option>
                      <option value="CO2">CO2</option>
                      <option value="N2">N2</option>
                    </select>
                  </div>
                )}
                
                {/* Size - Only for LPG */}
                {formData.gasType === 'LPG' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      name="size"
                      value={formData.size || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Size</option>
                      <option value="2.3kg">2.3kg</option>
                      <option value="5kg">5kg</option>
                      <option value="12.5kg">12.5kg</option>
                      <option value="37.5kg">37.5kg</option>
                    </select>
                  </div>
                )}
                
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Form Actions */}
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Add Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Action buttons & Filters Bar */}
      <div className="flex flex-col md:flex-row flex-wrap justify-between items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Left side: Utility Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} className="flex items-center gap-1.5 text-gray-700 border-gray-300 hover:bg-gray-50">
            <FiRefreshCw size={14}/> Refresh List
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsReportOpen(true)} 
            className="flex items-center gap-1.5 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <FiFileText size={14}/> View Report
          </Button>
        </div>
        
        {/* Right side: Search and Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="Gas Cylinder">Gas Cylinders</option>
            <option value="Accessory">Accessories</option>
          </select>
          
          {filterType === 'Gas Cylinder' && (
            <select
              value={filterGasType}
              onChange={(e) => setFilterGasType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="all">All Gas Types</option>
              <option value="LPG">LPG</option>
              <option value="Oxygen">Oxygen</option>
              <option value="Acetylene">Acetylene</option>
              <option value="Argon">Argon</option>
              <option value="CO2">CO2</option>
              <option value="N2">N2</option>
            </select>
          )}
          
          <Button variant="ghost" size="icon" onClick={resetFilters} className="p-1.5 text-gray-500 hover:bg-gray-100" title="Reset filters">
            <FiFilter size={16}/>
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => handleTabChange('all')}
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Products
          </button>
          
          <button
            onClick={() => handleTabChange('lowStock')}
            className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'lowStock'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiAlertCircle className="mr-2" /> Low Stock
          </button>
          
          <button
            onClick={() => handleTabChange('gasCylinders')}
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'gasCylinders'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gas Cylinders
          </button>
          
          <button
            onClick={() => handleTabChange('accessories')}
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'accessories'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Accessories
          </button>
        </nav>
      </div>
      
      {/* Alert messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Edit Product Dialog */}
      {selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <EditProductDialog 
              product={selectedProduct}
              onSubmit={handleEditSubmit}
              onCancel={handleCancelEdit}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Products Grid Display */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* No products message */}
        {!loading && activeTab === 'all' && filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <FiPackage className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No products found. Add some products to get started!</p>
          </div>
        )}
        
        {!loading && activeTab === 'lowStock' && lowStockProducts.length === 0 && (
          <div className="py-12 text-center">
            <FiAlertCircle className="mx-auto text-green-500 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No products with low stock. Everything is well stocked!</p>
          </div>
        )}
        
        {/* Display products based on active tab as grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(activeTab === 'all' ? filteredProducts : 
              activeTab === 'lowStock' ? lowStockProducts : 
              activeTab === 'gasCylinders' ? filteredProducts.filter(p => p.type === 'Gas Cylinder') : 
              filteredProducts.filter(p => p.type === 'Accessory')
            ).map(product => (
              <Card key={product._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white border-0 group">
                {/* Product image with overlay */}
                <div className="h-40 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="text-gray-400 text-5xl opacity-50" />
                    </div>
                  )}
                  
                  {/* Product type badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`px-2.5 py-1 text-xs font-medium rounded-full shadow-sm ${
                      product.type === 'Gas Cylinder' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {product.type}
                    </div>
                  </div>
                  
                  {/* Stock indicator */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full shadow-sm ${
                    product.quantity > 20 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : product.quantity > stockThreshold
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : product.quantity > 0
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {product.quantity} in stock
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col p-4">
                  {/* Product title and low stock indicator */}
                  <div className="mb-2 flex items-start">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                      {product.quantity < 10 && (
                        <span className="inline-flex ml-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" 
                             title="Low stock alert"></span>
                      )}
                    </h3>
                  </div>
                
                  {/* Product details */}
                  <div className="flex-grow mb-3">
                    {product.type === 'Gas Cylinder' && (
                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <div className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-1">
                          <span className="font-medium text-gray-700">{product.gasType || 'N/A'}</span>
                        </div>
                        {product.size && (
                          <div className="inline-block bg-gray-100 px-2 py-0.5 rounded">
                            <span className="font-medium text-gray-700">{product.size}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-lg font-bold text-gray-900">
                      ${product.price ? product.price.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="space-y-2">
                    <div className="flex justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      >
                        <FiEdit2 className="mr-1.5" size={14} /> Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 bg-white hover:bg-red-50 border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 transition-colors"
                      >
                        <FiTrash2 className="mr-1.5" size={14} /> Delete
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleQuantityUpdate(product._id, Math.max(0, product.quantity - 10))}
                        className="h-7 px-2 hover:bg-white hover:shadow-sm text-gray-600"
                      >
                        <FiMinusCircle className="mr-1" size={14} /> 10
                      </Button>
                      
                      <div className="font-medium text-sm text-gray-700">
                        Quantity
                      </div>
                      
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityUpdate(product._id, product.quantity + 10)}
                        className="h-7 px-2 hover:bg-white hover:shadow-sm text-gray-600"
                      >
                        <FiPlusCircle className="mr-1" size={14} /> 10
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Product Analytics Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-5xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FiFileText className="text-blue-600" /> Product Analytics Report
            </DialogTitle>
            <button 
              onClick={() => setIsReportOpen(false)} 
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
            >
              <FiX />
            </button>
          </DialogHeader>
          <ProductAnalyticsReport />
          <DialogFooter>
            <Button onClick={() => setIsReportOpen(false)} variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductManagement; 