// product.services.js
import API_CONFIG from '../../../utils/apiConfig';

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
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PRODUCTS), {
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
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  /**
   * Get all products
   * @returns {Promise} - The API response
   */
  getProducts: async () => {
    try {
      // Add fallback to mock data if server is not available
      try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PRODUCTS));
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }
        
        return data;
      } catch (serverError) {
        console.warn('Server connection failed, using mock data:', serverError.message);
        // Return mock data as fallback
        return {
          data: mockProducts 
        };
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`));
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
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`), {
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
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`), {
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
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}/quantity`), {
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
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}/capacity`), {
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
  },

  /**
   * Update product price
   * @param {string} id - The product ID
   * @param {Object} priceData - The price data { price: number }
   * @returns {Promise} - The API response
   */
  updatePrice: async (id, priceData) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}/price`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update price');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update product image URL
   * @param {string} id - The product ID
   * @param {Object} imageData - The image data { imageUrl: string }
   * @returns {Promise} - The API response
   */
  updateImageUrl: async (id, imageData) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}/image`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update image URL');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get inventory statistics
   * @returns {Promise} - The API response
   */
  getInventoryStats: async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/stats/inventory`));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch inventory statistics');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get low inventory products
   * @param {number} threshold - The threshold for low inventory (default: 10)
   * @returns {Promise} - The API response
   */
  getLowInventory: async (threshold = 10) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/stats/low-inventory?threshold=${threshold}`));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch low inventory products');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk update product quantities
   * @param {Array} updates - Array of {id, quantity} objects
   * @returns {Promise} - The API response
   */
  bulkUpdateQuantity: async (updates) => {
    try {
      const promises = updates.map(update => 
        ProductService.updateQuantity(update.id, { quantity: update.quantity })
      );
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        success: true,
        data: {
          successful,
          failed,
          total: updates.length
        }
      };
    } catch (error) {
      throw error;
    }
  }
};

// Mock products for fallback when server is unavailable
const mockProducts = [
  {
    _id: 'mock1',
    name: 'Gas Cylinder 14kg',
    type: 'Gas Cylinder',
    gasType: 'LPG',
    size: '14kg',
    capacity: 'Filled',
    quantity: 25,
    price: 45.99,
    imageUrl: 'https://example.com/gas-cylinder.jpg'
  },
  {
    _id: 'mock2',
    name: 'Gas Regulator',
    type: 'Accessory',
    quantity: 40,
    price: 15.50,
    imageUrl: 'https://example.com/regulator.jpg'
  },
  {
    _id: 'mock3',
    name: 'Gas Hose',
    type: 'Accessory',
    quantity: 30,
    price: 8.75,
    imageUrl: 'https://example.com/hose.jpg'
  }
];

export default ProductService;