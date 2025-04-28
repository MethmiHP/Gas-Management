import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { DialogFooter } from '../../ui/dialog';

// Define the EditProductDialog component
const EditProductDialog = ({ product, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    gasType: null,
    size: null,
    quantity: 0,
    price: 0,
    imageUrl: ''
  });

  // Effect to initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        type: product.type || '',
        gasType: product.gasType === undefined ? null : product.gasType, // Handle undefined
        size: product.size === undefined ? null : product.size, // Handle undefined
        quantity: product.quantity || 0,
        price: product.price || 0,
        imageUrl: product.imageUrl || ''
      });
    }
  }, [product]);


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle number fields
    if (name === 'quantity' || name === 'price') {
      processedValue = parseFloat(value) || 0;
    } else if (value === '' && (name === 'gasType' || name === 'size')) {
      // Allow unsetting enum fields back to null
      processedValue = null;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Reset dependent fields on type change
    if (name === 'type') {
      if (value === 'Accessory') {
        setFormData(prev => ({ ...prev, type: value, gasType: null, size: null }));
      }
    }
    
    // Reset size if gasType changes from LPG
    if (name === 'gasType') {
       if (value !== 'LPG') {
         setFormData(prev => ({ ...prev, gasType: value, size: null }));
       } else {
         setFormData(prev => ({ ...prev, gasType: value })); // Keep size if switching back to LPG
       }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product?._id) {
       onSubmit(product._id, formData);
    } else {
        console.error("Product ID is missing for submission.");
    }
  };

  // Render nothing if no product is provided initially
  if (!product) return null;

  return (
    <form onSubmit={handleSubmit}>
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
              value={formData.gasType || ''} // Handle null value for select
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={formData.type === 'Gas Cylinder'} // Required only if type is Gas Cylinder
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
        {formData.type === 'Gas Cylinder' && formData.gasType === 'LPG' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <select
              name="size"
              value={formData.size || ''} // Handle null value for select
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={formData.gasType === 'LPG'} // Required only if gasType is LPG
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
            Image URL (Optional)
          </label>
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Form Actions */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? 'Saving...' : 'Update Product'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default EditProductDialog; 