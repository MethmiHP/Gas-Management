import React, { useState, useEffect } from 'react';
import { ProductService } from '../services/product.services';
import { FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiPackage } from 'react-icons/fi';

const ProductPage = () => {
    // Form state
    const [formData, setFormData] = useState({
      name: '',
      type: '',
      gasType: null,
      size: null,
      capacity: '',
      quantity: 0,
      price: 0,
      imageUrl: ''
    });
    
    // Products state for displaying existing products
    const [products, setProducts] = useState([]);
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Fetch products on component mount
    useEffect(() => {
      fetchProducts();
    }, []);
    
    // Fetch all products
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
    
    // Handle form input changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      
      // Convert quantity and price to number
      if (name === 'quantity' || name === 'price') {
        setFormData({
          ...formData,
          [name]: parseFloat(value) || 0
        });
      } else {
        // For other fields, handle nullability properly
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
            size: null,
            capacity: 'N/A'
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            type: value,
            capacity: ''
          }));
        }
      }
      
      // Handle gasType change - reset size if not LPG
      if (name === 'gasType' && value !== 'LPG') {
        setFormData(prev => ({
          ...prev,
          gasType: value,
          size: null
        }));
      }
    };
    
    // Submit form - handles both create and update
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      
      try {
        setLoading(true);
        
        if (isEditing && editId) {
          // Update existing product
          const response = await ProductService.updateProduct(editId, formData);
          setSuccess('Product updated successfully!');
        } else {
          // Create new product
          const response = await ProductService.createProduct(formData);
          setSuccess('Product created successfully!');
        }
        
        // Reset form
        setFormData({
          name: '',
          type: '',
          gasType: null,
          size: null,
          capacity: '',
          quantity: 0,
          price: 0,
          imageUrl: ''
        });
        
        // Reset editing state
        setIsEditing(false);
        setEditId(null);
        
        // Refresh products list
        fetchProducts();
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    // Handle edit button click
    const handleEdit = (product) => {
      setIsEditing(true);
      setEditId(product._id);
      
      // Populate form with product data
      setFormData({
        name: product.name,
        type: product.type,
        gasType: product.gasType,
        size: product.size,
        capacity: product.capacity,
        quantity: product.quantity,
        price: product.price || 0,
        imageUrl: product.imageUrl || ''
      });
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Handle cancel edit
    const handleCancelEdit = () => {
      setIsEditing(false);
      setEditId(null);
      setFormData({
        name: '',
        type: '',
        gasType: null,
        size: null,
        capacity: '',
        quantity: 0,
        price: 0,
        imageUrl: ''
      });
    };
    
    // Handle delete button click
    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this product?')) {
        return;
      }
      
      try {
        setLoading(true);
        await ProductService.deleteProduct(id);
        
        // If we're editing the product that's being deleted, reset the form
        if (editId === id) {
          handleCancelEdit();
        }
        
        // Show success message
        setSuccess('Product deleted successfully!');
        
        // Refresh products list
        fetchProducts();
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    // Handle quick capacity update (for Gas Cylinders)
    const handleCapacityUpdate = async (id, newCapacity) => {
      try {
        setLoading(true);
        await ProductService.updateCapacity(id, { capacity: newCapacity });
        
        // Refresh products list
        fetchProducts();
        setSuccess(`Capacity updated to ${newCapacity} successfully!`);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    // Handle quick price update
    const handlePriceUpdate = async (id, newPrice) => {
      try {
        setLoading(true);
        await ProductService.updatePrice(id, { price: newPrice });
        
        // Refresh products list
        fetchProducts();
        setSuccess(`Price updated successfully!`);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    // Handle image URL update
    const handleImageUpdate = async (id, newImageUrl) => {
      try {
        setLoading(true);
        await ProductService.updateImageUrl(id, { imageUrl: newImageUrl });
        
        // Refresh products list
        fetchProducts();
        setSuccess('Image URL updated successfully!');
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <button 
            onClick={fetchProducts}
            className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            title="Refresh products"
          >
            <FiRefreshCw size={20} />
          </button>
        </div>
        
        {/* Form for adding/editing products */}
        <div className="bg-white shadow-md rounded p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          {/* Success message */}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              {success}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              {/* Product Type */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                  Product Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Gas Cylinder">Gas Cylinder</option>
                  <option value="Accessory">Accessory</option>
                </select>
              </div>
              
              {/* Gas Type - Only show for Gas Cylinders */}
              {formData.type === 'Gas Cylinder' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gasType">
                    Gas Type
                  </label>
                  <select
                    id="gasType"
                    name="gasType"
                    value={formData.gasType || ''}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required={formData.type === 'Gas Cylinder'}
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
              
              {/* Size - Only show for LPG */}
              {formData.gasType === 'LPG' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="size">
                    Size
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size || ''}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required={formData.gasType === 'LPG'}
                  >
                    <option value="">Select Size</option>
                    <option value="2.3kg">2.3kg</option>
                    <option value="5kg">5kg</option>
                    <option value="12.5kg">12.5kg</option>
                    <option value="37.5kg">37.5kg</option>
                  </select>
                </div>
              )}
              
              {/* Capacity - Auto set for Accessories, dropdown for Gas Cylinders */}
              {formData.type === 'Gas Cylinder' ? (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
                    Capacity
                  </label>
                  <select
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Capacity</option>
                    <option value="Filled">Filled</option>
                    <option value="Empty">Empty</option>
                  </select>
                </div>
              ) : null}
              
              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              {/* Price */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              {/* Image URL */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Processing...' : isEditing ? 'Update Product' : 'Add Product'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Products List */}
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Products List</h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-blue-500 mx-auto mb-4">
                <FiPackage size={48} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6">
                Add your first product to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-amber-600 hover:text-amber-900 p-1"
                          title="Edit product"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete product"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
};

export default ProductPage;