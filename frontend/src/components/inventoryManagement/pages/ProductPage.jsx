import React, { useState, useEffect } from 'react';
import { ProductService } from '../services/product.services';

const ProductPage = () => {
    // Form state
    const [formData, setFormData] = useState({
      name: '',
      type: '',
      gasType: null,
      size: null,
      capacity: '',
      quantity: 0
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
        const response = await ProductService.getProducts();
        setProducts(response.data || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    // Handle form input changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      
      // Convert quantity to number
      if (name === 'quantity') {
        setFormData({
          ...formData,
          [name]: parseInt(value, 10) || 0
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
          quantity: 0
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
        quantity: product.quantity
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
        quantity: 0
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
    
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        
        {/* Form */}
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
              
              {/* Gas Type - Only show for Gas Cylinder */}
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
              
              {/* Size - Only show for LPG Gas */}
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
              
              {/* Capacity */}
              {formData.type === 'Gas Cylinder' && (
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
              )}
              
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
            </div>
            
            {/* Form Buttons */}
            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleCancelEdit}
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
          
          {loading && !success && !error ? (
            <p>Loading products...</p>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Gas Type
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="py-2 px-4 border-b border-gray-200">{product.name}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{product.type}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{product.gasType || 'N/A'}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{product.size || 'N/A'}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {product.capacity}
                        {product.type === 'Gas Cylinder' && (
                          <div className="mt-1 flex gap-1">
                            <button 
                              onClick={() => handleCapacityUpdate(product._id, 'Filled')}
                              disabled={product.capacity === 'Filled'}
                              className={`px-2 py-1 text-xs rounded ${product.capacity === 'Filled' ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            >
                              Set Filled
                            </button>
                            <button 
                              onClick={() => handleCapacityUpdate(product._id, 'Empty')}
                              disabled={product.capacity === 'Empty'}
                              className={`px-2 py-1 text-xs rounded ${product.capacity === 'Empty' ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                              Set Empty
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">{product.quantity}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No products found. Add some products using the form above.</p>
          )}
        </div>
      </div>
    );
  };

export default ProductPage;