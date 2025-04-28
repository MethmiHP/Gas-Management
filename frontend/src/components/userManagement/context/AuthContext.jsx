import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserService } from '../services/userService';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component that wraps the app and makes auth available
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token by getting user data
          const userData = await UserService.getCurrentUser();
          if (userData && userData.success) {
            setIsAuthenticated(true);
            setUserRole(UserService.getUserRole());
            
            // Set user data from localStorage
            const savedUser = JSON.parse(localStorage.getItem('user'));
            setUser(savedUser);
          } else {
            // If API call fails, token is likely invalid
            UserService.logout();
            setIsAuthenticated(false);
            setUserRole(null);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const result = await UserService.login(email, password);
      setIsAuthenticated(true);
      setUserRole(UserService.getUserRole());
      
      // Set user data from result or localStorage
      const userData = result.user || JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    UserService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    toast.info('You have been logged out');
  };

  // Registration function
  const register = async (userData) => {
    try {
      const result = await UserService.register(userData);
      setIsAuthenticated(true);
      setUserRole(userData.role || 'customer');
      
      // Set user data from result or localStorage
      const savedUser = result.user || JSON.parse(localStorage.getItem('user'));
      setUser(savedUser);
      
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    userRole,
    user,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
