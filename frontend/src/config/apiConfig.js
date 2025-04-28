const API_BASE_URL = 'http://localhost:5000';

const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    CARTS: `${API_BASE_URL}/cart/carts`,
    PRODUCTS: `${API_BASE_URL}/api/products`,
    USERS: `${API_BASE_URL}/api/users`,
    ORDERS: `${API_BASE_URL}/orders`,
    DELIVERIES: `${API_BASE_URL}/deliveries`
  },
  getUrl: function(endpoint) {
    return endpoint;
  }
};

export default API_CONFIG;
