import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserService } from '../services/userService';
import { toast } from 'react-toastify';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("Starting to load user data");
        
        // Check if user is logged in
        if (!UserService.isLoggedIn()) {
          console.log("User not logged in, redirecting to login page");
          toast.error('Please log in to access your profile');
          navigate('/login');
          return;
        }
        
        // Load user data
        console.log("Fetching user profile data");
        const userData = await UserService.getCurrentUser();
        console.log("User data loaded successfully:", userData);
        
        if (!userData?.data) {
          console.error("Invalid user data format received");
          toast.error('Invalid profile data received. Please try again.');
          navigate('/login');
          return;
        }
        
        setFormData({
          username: userData.data.username || '',
          email: userData.data.email || '',
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        
        // Check if unauthorized error
        if (error.response && error.response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error('Failed to load profile information. Please try again later.');
          setTimeout(() => navigate('/login'), 2000); // Redirect after showing error
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      await UserService.updateProfile(formData);
      toast.success('Profile updated successfully!');
      
      // Redirect back to dashboard based on user role
      const role = UserService.getUserRole();
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    const role = UserService.getUserRole();
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <button
              onClick={handleCancel}
              className="text-blue-600 hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
          <p className="text-gray-600 mt-2">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {updating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/change-password" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
