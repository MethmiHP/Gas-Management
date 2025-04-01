import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Get token from local storage with better error handling
const getToken = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) {
      console.log("No user data in localStorage");
      return null;
    }
    
    const user = JSON.parse(userString);
    if (!user?.token) {
      console.log("User data exists but no token found");
      return null;
    }
    
    // Log first few chars of token for debugging
    console.log("Token found:", user.token.substring(0, 20) + "...");
    return user.token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Configure axios with auth header
const authHeader = () => {
  const token = getToken();
  if (token) {
    console.log("Adding auth header with token");
    return { Authorization: `Bearer ${token}` };
  } else {
    console.log("No token available for auth header");
    return {};
  }
};

// Create a custom axios instance with authentication
const authAxios = axios.create();

// Add request interceptor to the custom instance
authAxios.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for debugging
authAxios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log("API error status:", error.response.status);
      console.log("API error data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export const UserService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log("User data saved to localStorage");
      }
      return response.data;
    } catch (error) {
      console.error("Login API error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log("User data saved to localStorage after registration");
      }
      return response.data;
    } catch (error) {
      console.error("Register API error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    console.log("User logged out, localStorage cleared");
  },

  // Get current user profile - with improved error handling
  getCurrentUser: async () => {
    try {
      console.log("Getting current user profile");
      const response = await authAxios.get(`${API_URL}/me`);
      console.log("User profile retrieved successfully");
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      // Get current user from localStorage for update purposes
      const userString = localStorage.getItem('user');
      console.log("Raw user data from localStorage:", userString);
      
      if (!userString) {
        throw new Error('No user data found. Please login again.');
      }
      
      const currentUser = JSON.parse(userString);
      console.log("Parsed user data:", currentUser);
      
      // REMOVE THIS MOCK IMPLEMENTATION AND UNCOMMENT THE CODE BELOW
      // ONCE THE BACKEND ENDPOINT IS AVAILABLE
      /* 
      console.log("⚠️ MOCK UPDATE: No backend endpoint available. Using mock implementation.");
      console.log("Mock update profile with data:", userData);
      
      // Create mock response that mimics what we expect from the server
      const mockResponse = {
        success: true,
        data: {
          ...currentUser.user,
          ...userData
        },
        message: "Profile updated successfully (mock)"
      };
      
      // Update localStorage with new user data
      let updatedUser = {...currentUser};
      if (currentUser.user) {
        updatedUser.user = {
          ...currentUser.user,
          ...userData
        };
      } else {
        // User data is at the root level
        updatedUser = {
          ...currentUser,
          ...userData
        };
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log("Updated user data in localStorage (mock update)");
      
      // Return mock response after a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockResponse;
      */
      
      // UNCOMMENT THIS SECTION when backend endpoint is available
      console.log("Attempting to update profile with data:", userData);
      const response = await authAxios.put(`${API_URL}/me`, userData);
      console.log("Profile update response:", response.data);
      
      // Update localStorage with new user data if successful
      if (response.data && (response.data.success || response.data.data)) {
        let updatedUser = {...currentUser};
        
        if (currentUser.user) {
          updatedUser.user = {
            ...currentUser.user,
            ...userData
          };
        } else {
          updatedUser = {
            ...currentUser,
            ...userData
          };
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("Updated user data in localStorage");
      }
      
      return response.data;
      
    } catch (error) {
      console.error("Update profile error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },

  // Change user password
  changePassword: async (passwordData) => {
    try {
      console.log("Attempting to change password");
      const response = await authAxios.post(`${API_URL}/change-password`, passwordData);
      console.log("Password change response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Change password error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async () => {
    return authAxios.get(`${API_URL}/orders`)
      .then(response => response.data)
      .catch(error => {
        console.error("Get orders error:", error);
        throw error;
      });
  },

  // Get user complaints
  getUserComplaints: async () => {
    return authAxios.get(`${API_URL}/complaints`)
      .then(response => response.data)
      .catch(error => {
        console.error("Get complaints error:", error);
        throw error;
      });
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return getToken() !== null;
  },
  
  // Get logged in user role
  getUserRole: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Check different possible locations of the role in the user object
      if (user?.role) {
        return user.role;
      } else if (user?.user?.role) {
        return user.user.role;
      } else if (user?.data?.role) {
        return user.data.role;
      }
      
      return 'customer'; // Default role if not specified
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  },

  // Get all users - admin only
  getAllUsers: async () => {
    try {
      console.log("Getting all users");
      const response = await authAxios.get(`${API_URL}/users`);
      console.log("Users retrieved successfully");
      return response.data;
    } catch (error) {
      console.error("Get all users error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },
  
  // Add new user - admin only
  addUser: async (userData) => {
    try {
      console.log("Adding new user:", userData);
      // Use the register endpoint instead of users endpoint
      const response = await authAxios.post(`${API_URL}/register`, userData);
      console.log("User creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Add user error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },
  
  // Update user - admin only
  updateUser: async (userId, userData) => {
    try {
      console.log("Updating user with ID:", userId);
      const response = await authAxios.put(`${API_URL}/users/${userId}`, userData);
      console.log("User update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Update user error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },
  
  // Delete user - admin only
  deleteUser: async (userId) => {
    try {
      console.log("Deleting user with ID:", userId);
      const response = await authAxios.delete(`${API_URL}/users/${userId}`);
      console.log("User deletion response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Delete user error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  }
};
