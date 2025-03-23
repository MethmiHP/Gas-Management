// product.services.js
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Service for handling product-related API calls
 */
export const ProductService = {
  /**
   * Create a new product
   * @param {Object} product - The product data
   * @returns {Promise} - The API response
   */
  createProduct: async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(Array.isArray(data.error) ? data.error.join(', ') : data.error || 'Failed to create product');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get all products
   * @returns {Promise} - The API response
   */
  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get a product by ID
   * @param {string} id - The product ID
   * @returns {Promise} - The API response
   */
  getProductById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update a product
   * @param {string} id - The product ID
   * @param {Object} product - The updated product data
   * @returns {Promise} - The API response
   */
  updateProduct: async (id, product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(Array.isArray(data.error) ? data.error.join(', ') : data.error || 'Failed to update product');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Delete a product
   * @param {string} id - The product ID
   * @returns {Promise} - The API response
   */
  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update product quantity
   * @param {string} id - The product ID
   * @param {Object} quantityData - The quantity data { quantity: number }
   * @returns {Promise} - The API response
   */
  updateQuantity: async (id, quantityData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quantityData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update quantity');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update cylinder capacity
   * @param {string} id - The product ID
   * @param {Object} capacityData - The capacity data { capacity: string }
   * @returns {Promise} - The API response
   */
  updateCapacity: async (id, capacityData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/capacity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(capacityData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update capacity');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default ProductService;