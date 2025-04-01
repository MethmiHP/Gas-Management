import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, ChevronDown, Check, X, Edit, Trash2 } from 'lucide-react';

const OrderController = () => {
  // State for orders and form data
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    orderType: 'Gases',
    discount: 0,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Pending'
  });
  
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formAnimation, setFormAnimation] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [tableAnimation, setTableAnimation] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Update to use the correct API endpoint
        const response = await axios.get('http://localhost:5000/users');
        setUsers(response.data.data || response.data); // Handle different response structures
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      }
    };
    
    fetchUsers();
  }, []);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/orders');
        
        // Set animation delay
        setTimeout(() => {
          // Handle both response structures (with or without .data property)
          const orderData = response.data.data || response.data;
          setOrders(orderData);
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If the userName is selected, find the corresponding userId
    if (name === 'userName') {
      const user = users.find(u => u.name === value);
      setFormData({
        ...formData,
        userName: value,
        userId: user ? user.id : ''
      });
    } else if (name === 'discount') {
      // Convert discount from string to number
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing order with API
        const updatedOrder = {
          ...formData,
          orderId: editingId
        };
        
        // Fix: Use proper content type header for JSON data
        const response = await axios.put(
          `http://localhost:5000/orders/${editingId}`, 
          updatedOrder,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Get the updated order from response, handle different response structures
        const responseData = response.data.data || response.data;
        
        // Update local state
        const updatedOrders = orders.map(order => {
          if (order.orderId === editingId) {
            return responseData;
          }
          return order;
        });
        
        // Trigger table animation
        setTableAnimation(false);
        setTimeout(() => {
          setOrders(updatedOrders);
          setTableAnimation(true);
        }, 300);
        
        setEditingId(null);
      } else {
        // Create new order with API
        const newOrder = {
          userId: formData.userId,
          userName: formData.userName,
          orderType: formData.orderType,
          discount: formData.discount,
          paymentMethod: formData.paymentMethod,
          paymentStatus: formData.paymentStatus,
          timestamp: new Date().toISOString()
        };
        
        // Fix: Send to API with proper content type header
        const response = await axios.post(
          'http://localhost:5000/orders', 
          newOrder,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Handle different response structures
        const savedOrder = response.data.data || response.data;
        
        // Add with animation effect
        setTableAnimation(false);
        setTimeout(() => {
          setOrders([...orders, savedOrder]);
          setTableAnimation(true);
        }, 300);
      }
      
      // Reset form
      setFormData({
        userId: '',
        userName: '',
        orderType: 'Gases',
        discount: 0,
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending'
      });
      
      // Hide form with animation
      setFormAnimation('animate-fade-out');
      setTimeout(() => {
        setShowForm(false);
        setFormAnimation('');
      }, 300);
    } catch (err) {
      console.error('Error saving order:', err);
      setError(`Failed to save order: ${err.message || 'Please try again.'}`);
    }
  };

  // Handle edit button click
  const handleEdit = (order) => {
    setFormData({
      userId: order.userId,
      userName: order.userName,
      orderType: order.orderType,
      discount: order.discount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus
    });
    setEditingId(order.orderId);
    setShowForm(true);
    setFormAnimation('animate-fade-in');
  };

  // Handle delete button click with API integration
  const handleDelete = async (orderId) => {
    try {
      // Delete from API
      await axios.delete(`http://localhost:5000/orders/${orderId}`);
      
      // Delete with animation
      setTableAnimation(false);
      setTimeout(() => {
        const updatedOrders = orders.filter(order => order.orderId !== orderId);
        setOrders(updatedOrders);
        setTableAnimation(true);
      }, 300);
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  // Handle add new order button click
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      userId: '',
      userName: '',
      orderType: 'Gases',
      discount: 0,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Pending'
    });
    setShowForm(true);
    setFormAnimation('animate-fade-in');
  };

  // Handle cancel button click
  const handleCancel = () => {
    setFormAnimation('animate-fade-out');
    setTimeout(() => {
      setShowForm(false);
      setEditingId(null);
      setFormAnimation('');
    }, 300);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 relative inline-block">
          Order Management System
          <span className="absolute bottom-0 left-0 w-0 h-1 bg-blue-600 transition-all duration-500 group-hover:w-full"></span>
        </h1>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-2">
            <X className="text-red-500" size={20} />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Add New Order Button */}
        <div className="mb-6">
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all duration-300 
                     transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
            style={{
              background: "linear-gradient(45deg, #4F46E5, #60A5FA)",
              boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.39)"
            }}
          >
            <PlusCircle size={20} />
            <span>Add New Order</span>
          </button>
        </div>
        
        {/* Order Form */}
        {showForm && (
          <div 
            className={`bg-gray-100 rounded-lg p-6 mb-6 border-l-4 border-blue-600 
                      transition-all duration-500 transform ${formAnimation === 'animate-fade-in' ? 'scale-100 opacity-100' : 
                      formAnimation === 'animate-fade-out' ? 'scale-95 opacity-0' : ''}`}
            style={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {editingId ? 
                <><Edit className="mr-2 text-blue-600" size={20} /> Edit Order</> : 
                <><PlusCircle className="mr-2 text-green-600" size={20} /> Add New Order</>
              }
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="transition-all duration-300 transform hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                  <div className="relative">
                    <select
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-black appearance-none transition-all duration-300 hover:border-blue-500 pr-10"
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 pointer-events-none text-gray-500" size={16} />
                  </div>
                </div>
                <div className="transition-all duration-300 transform hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                  <div className="relative">
                    <select
                      name="orderType"
                      value={formData.orderType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-black appearance-none transition-all duration-300 hover:border-blue-500 pr-10"
                    >
                      <option value="Gases">Gases</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 pointer-events-none text-gray-500" size={16} />
                  </div>
                </div>
                <div className="transition-all duration-300 transform hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <div className="relative">
                    <select
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-black appearance-none transition-all duration-300 hover:border-blue-500 pr-10"
                    >
                      <option value="0">0%</option>
                      <option value="25">25%</option>
                      <option value="50">50%</option>
                      <option value="60">60%</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 pointer-events-none text-gray-500" size={16} />
                  </div>
                </div>
                <div className="transition-all duration-300 transform hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <div className="relative">
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-black appearance-none transition-all duration-300 hover:border-blue-500 pr-10"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 pointer-events-none text-gray-500" size={16} />
                  </div>
                </div>
                <div className="transition-all duration-300 transform hover:scale-105">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <div className="relative">
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-black appearance-none transition-all duration-300 hover:border-blue-500 pr-10"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 pointer-events-none text-gray-500" size={16} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all duration-300 
                           transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  style={{
                    background: "linear-gradient(45deg, #10B981, #34D399)",
                    boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)"
                  }}
                >
                  <Check size={20} />
                  {editingId ? 'Update Order' : 'Save Order'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-all duration-300 
                           transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Orders Table */}
        {!loading && (
          <div 
            className={`overflow-x-auto rounded-lg transition-all duration-500 
                      ${tableAnimation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}
            style={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
          >
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  {/* Rearranged columns with Order ID first */}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr 
                    key={order.orderId} 
                    className={`transition-all duration-300 ${hoveredRow === order.orderId ? 'bg-blue-50 scale-100 shadow-md' : 
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    onMouseEnter={() => setHoveredRow(order.orderId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      transform: `translateY(${index * 0.05}s)`,
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Rearranged columns with Order ID first */}
                    <td className="px-4 py-3 text-sm font-mono text-blue-700 font-medium">{order.orderId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.userId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{order.userName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderType === 'Accessories' ? 'bg-purple-100 text-purple-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.discount === 0 ? 'bg-gray-100 text-gray-800' :
                        order.discount === 25 ? 'bg-green-100 text-green-800' : 
                        order.discount === 50 ? 'bg-orange-100 text-orange-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.discount}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        order.paymentStatus === 'Completed' ? 
                        'bg-green-100 text-green-800 border border-green-300' : 
                        order.paymentStatus === 'Failed' ?
                        'bg-red-100 text-red-800 border border-red-300' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(order.timestamp)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.orderId)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                      No orders found. Add a new order to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
        
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
};

export default OrderController;