// API Configuration for consistent endpoints across the application

const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL: 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    // Product-related endpoints
    PRODUCTS: '/api/products',
    
    // Cart-related endpoints
    CARTS: '/api/carts',
    
    // Auth-related endpoints
    AUTH: '/api/auth',
    
    // Order-related endpoints
    ORDERS: '/api/orders'
  },
  
  // Helper function to get full URL
  getUrl: function(endpoint) {
    return `${this.BASE_URL}${endpoint}`;
  }
};

export default API_CONFIG;
