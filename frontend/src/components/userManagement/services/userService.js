import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Get token from local storage with better error handling
const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No token in localStorage");
      return null;
    }
    
    // Log first few chars of token for debugging
    console.log("Token found:", token.substring(0, 20) + "...");
    return token;
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
        // Store token and user separately for easier access
        localStorage.setItem('token', response.data.token);
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
        localStorage.setItem('token', response.data.token);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartId'); // Also clear cart data
    console.log("User logged out, localStorage cleared");
  },

  // Get current user profile - with improved error handling
  getCurrentUser: async () => {
    try {
      console.log("Getting current user profile");
      const response = await authAxios.get(`${API_URL}/me`);
      console.log("User profile retrieved successfully");
      
      // Cache user data locally for quicker access
      if (response.data && response.data.success && response.data.data) {
        // Get existing stored user data
        const userString = localStorage.getItem('user');
        if (userString) {
          const currentUser = JSON.parse(userString);
          
          // Update the user data within the stored object
          // without overwriting the token
          if (currentUser.user) {
            currentUser.user = {
              ...currentUser.user,
              ...response.data.data
            };
          } else {
            // Preserve token and other fields
            currentUser.data = response.data.data;
          }
          
          localStorage.setItem('user', JSON.stringify(currentUser));
          console.log("Updated cached user data in localStorage");
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },

  // Upload profile photo
  uploadProfilePhoto: async (formData) => {
    try {
      console.log("Uploading profile photo");
      const response = await authAxios.post(`${API_URL}/me/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Profile photo upload response:", response.data);
      
      // Update localStorage with new user data if successful
      if (response.data && (response.data.success || response.data.data)) {
        const userString = localStorage.getItem('user');
        if (userString) {
          const currentUser = JSON.parse(userString);
          let updatedUser = {...currentUser};
          
          if (currentUser.user) {
            updatedUser.user = {
              ...currentUser.user,
              avatarUrl: response.data.data.avatarUrl
            };
          } else {
            updatedUser = {
              ...currentUser,
              avatarUrl: response.data.data.avatarUrl
            };
          }
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log("Updated user avatar in localStorage");
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Upload profile photo error:", error.response?.data || error.message);
      
      // If unauthorized (401), clear local storage to force login
      if (error.response && error.response.status === 401) {
        console.log("Token invalid or expired, clearing local storage");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const username = currentUser?.username || currentUser?.user?.username;
      
      if (!username) {
        console.error('No username found in local storage');
        return { success: false, data: [] };
      }
      
      // Use username instead of userId in the API request
      const response = await axios.get(`http://localhost:5000/api/orders/username/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle possible response formats
      if (response.data && Array.isArray(response.data)) {
        return { success: true, data: response.data };
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data };
      } else if (response.data && response.data.success) {
        return response.data;
      }
      
      console.warn('Unexpected response structure from orders API:', response.data);
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, data: [] };
    }
  },

  // Get user complaints
  getUserComplaints: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/complaints/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return { success: false, data: [] };
    }
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return localStorage.getItem('token') !== null;
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

  // Get logged in user's username
  getCurrentUsername: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Check different possible locations of the username in the user object
      if (user?.username) {
        return user.username;
      } else if (user?.user?.username) {
        return user.user.username;
      } else if (user?.data?.username) {
        return user.data.username;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting username:", error);
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      throw error;
    }
  }
};
