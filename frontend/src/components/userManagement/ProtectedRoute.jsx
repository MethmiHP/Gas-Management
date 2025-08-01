import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from './context/AuthContext';

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Optionally checks for specific roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} [props.roles] - Optional array of roles allowed to access the route
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!isAuthenticated) {
    // Show toast notification only if we're not already on the login page
    if (location.pathname !== '/login') {
      toast.info('Please log in to continue');
    }
    
    // Redirect to login page, save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If roles are specified, check if the user has one of the required roles
  if (roles && roles.length > 0) {
    const userRole = user?.role || user?.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      toast.error('You do not have permission to access this page');
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
