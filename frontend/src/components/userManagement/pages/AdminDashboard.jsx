import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/userService';
import { toast } from 'react-toastify';
import axios from 'axios';
// Import ProductPage component for inventory management
import ProductPage from '../../inventoryManagement/pages/ProductPage';
// Import PDF libraries
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Import icons
import { 
  FiHome, FiShoppingBag, FiUsers, FiPackage, 
  FiLogOut, FiSettings, FiTruck, FiBell, FiSearch,
  FiPlus, FiChevronDown, FiMenu, FiX, FiMessageSquare,
  FiFilter, FiRefreshCw, FiEye, FiEdit, FiTrash2,
  FiMap, FiList, FiFileText, FiDollarSign
} from 'react-icons/fi';
// Import AdminProductManagement component for advanced inventory management
import AdminProductManagement from '../../inventoryManagement/pages/AdminProductManagement';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add these new states for order modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    userId: '',
    userName: '',
    orderType: 'Gases',
    discount: 0,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Pending'
  });

  // Stats for the dashboard
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentDeliveries: 0
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'customer'
  });

  useEffect(() => {
    // Fetch admin data and dashboard stats
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with setTimeout
        setTimeout(() => {
          setAdminData({
            name: 'Admin User',
            email: 'admin@example.com',
            avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Fetch all orders when the component mounts or when active tab changes
  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
    // No need to add any fetch for inventory tab as the ProductPage component 
    // will handle data fetching internally
  }, [activeTab]);

  // Fetch all orders from the API
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrderError(null);
      
      // Use the correct endpoint with /api prefix
      const response = await axios.get('http://localhost:5000/api/orders');
      
      if (response.data && response.data.success) {
        setOrders(response.data.data);
        
        // Update stats
        const pendingCount = response.data.data.filter(order => 
          order.paymentStatus === 'Pending' || order.status === 'Processing').length;
        
        const totalRev = response.data.data.reduce((sum, order) => 
          order.paymentStatus === 'Paid' ? sum + (order.amount || 0) : sum, 0);
        
        setStats({
          totalOrders: response.data.data.length,
          pendingOrders: pendingCount,
          totalRevenue: totalRev,
          recentDeliveries: response.data.data.filter(order => 
            order.status === 'Delivered' && 
            new Date(order.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrderError('Failed to load orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch all users from the API
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUserError(null);
      
      const response = await UserService.getAllUsers();
      
      if (response && response.success) {
        setUsers(response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUserError('Failed to load users. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter orders based on status and search query
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.paymentStatus === filterStatus;
    const matchesSearch = searchQuery === '' || 
      (order.orderId && order.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.userName && order.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Filter users based on role and search query
  const filteredUsers = users.filter(user => {
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesSearch = userSearchQuery === '' || 
      (user.username && user.username.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(userSearchQuery.toLowerCase()));
    
    return matchesRole && matchesSearch;
  });

  // View order details
  const handleViewOrder = (orderId) => {
    navigate(`/delivery/${orderId}`);
  };

  // Handle edit order - modified to open modal
  const handleEditOrder = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
      if (response.data && response.data.success) {
        const order = response.data.data;
        setOrderFormData({
          userId: order.userId || '',
          userName: order.userName || '',
          orderType: order.orderType || 'Gases',
          discount: order.discount || 0,
          paymentMethod: order.paymentMethod || 'Credit Card',
          paymentStatus: order.paymentStatus || 'Pending'
        });
        setEditingOrderId(orderId);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
        toast.success('Order deleted successfully');
        fetchOrders(); // Refresh the orders list
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  // Handle add new order
  const handleAddNewOrder = () => {
    setEditingOrderId(null);
    setOrderFormData({
      userId: '',
      userName: '',
      orderType: 'Gases',
      discount: 0,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Pending'
    });
    setShowOrderModal(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role
    });
    setShowUserModal(true);
  };

  // Handle add new user
  const handleAddNewUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',  // Add password field for new users
      role: 'customer'
    });
    setShowUserModal(true);
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await UserService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the users list
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  // Handle user form submission
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Use _id instead of id for MongoDB compatibility
        await UserService.updateUser(editingUser._id, formData);
        toast.success('User updated successfully');
      } else {
        // Add new user
        await UserService.addUser(formData);
        toast.success('User added successfully');
      }
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',  // Reset password field
        role: 'customer'
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Handle order form submission
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrderId) {
        // Update existing order - Add /api prefix
        await axios.put(`http://localhost:5000/api/orders/${editingOrderId}`, orderFormData);
        toast.success('Order updated successfully');
      } else {
        // Create new order - Add /api prefix
        await axios.post('http://localhost:5000/api/orders', orderFormData);
        toast.success('Order added successfully');
      }
      setShowOrderModal(false);
      setEditingOrderId(null);
      setOrderFormData({
        userId: '',
        userName: '',
        orderType: 'Gases',
        discount: 0,
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending'
      });
      fetchOrders(); // Refresh orders list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleLogout = () => {
    UserService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Add a function to navigate to the deliveries page
  const handleViewAllDeliveries = () => {
    navigate('/view-all-deliveries');
  };

  // Handle sidebar navigation for deliveries
  const navigateToDeliveries = () => {
    navigate('/dashboard');
  };

  // Handle navigation to Admin Product Management
  const navigateToProductManagement = () => {
    setActiveTab('products');
  };

  // Add PDF generation function for orders
  const handleGeneratePDF = (order) => {
    const doc = new jsPDF();
    
    // Add Nelson Enterprises header
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102); // Dark blue color
    doc.text("Nelson Enterprises", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Order Details", 105, 30, { align: "center" });
    
    // Add order metadata
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Order ID: #${order.orderId}`, 20, 50);
    doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 20, 60);
    doc.text(`Customer: ${order.userName}`, 20, 70);
    doc.text(`Type: ${order.orderType}`, 20, 80);
    doc.text(`Payment Method: ${order.paymentMethod}`, 20, 90);
    doc.text(`Payment Status: ${order.paymentStatus}`, 20, 100);
    doc.text(`Amount: LKR ${order.amount ? order.amount.toFixed(2) : '0.00'}`, 20, 110);
    
    // Add company footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Nelson Enterprises - Gas Management System", 105, pageHeight - 10, { align: "center" });
    
    // Generate and save the PDF
    doc.save(`Order_${order.orderId}.pdf`);
    toast.success('PDF generated successfully');
  };

  // Add PDF generation function for users
  const handleGenerateUserPDF = (user) => {
    const doc = new jsPDF();
    
    // Add Nelson Enterprises header
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102); // Dark blue color
    doc.text("Nelson Enterprises", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("User Details", 105, 30, { align: "center" });
    
    // Add user metadata
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`User ID: #${user._id}`, 20, 50);
    doc.text(`Username: ${user.username}`, 20, 60);
    doc.text(`Email: ${user.email}`, 20, 70);
    doc.text(`Role: ${user.role}`, 20, 80);
    doc.text(`Created: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}`, 20, 90);
    
    // Add company footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Nelson Enterprises - Gas Management System", 105, pageHeight - 10, { align: "center" });
    
    // Generate and save the PDF
    doc.save(`User_${user.username}.pdf`);
    toast.success('User PDF generated successfully');
  };

  const renderDashboardContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'orders':
        return renderOrdersTab();
      case 'users':
        return renderUsersTab();
      case 'inventory':
        // Return the ProductPage component for inventory management
        return <AdminProductManagement />;
      case 'products':
        // Return the AdminProductManagement component for product management
        return <AdminProductManagement />;
      default:
        return renderDashboardTab();
    }
  };

  const renderDashboardTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Stats cards */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Total Orders</p>
            <h3 className="text-3xl font-bold">{stats.totalOrders}</h3>
          </div>
          <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
            <FiShoppingBag size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs opacity-80">
          <span className="font-medium">All time orders</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Total Revenue</p>
            <h3 className="text-3xl font-bold">LKR {stats.totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
            <FiShoppingBag size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs opacity-80">
          <span className="font-medium">From completed orders</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Pending Orders</p>
            <h3 className="text-3xl font-bold">{stats.pendingOrders}</h3>
          </div>
          <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
            <FiTruck size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs opacity-80">
          <span className="font-medium text-purple-100">Need attention</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Recent Deliveries</p>
            <h3 className="text-3xl font-bold">{stats.recentDeliveries}</h3>
          </div>
          <div className="bg-amber-400 bg-opacity-30 p-3 rounded-full">
            <FiTruck size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs opacity-80">
          <span className="font-medium">Last 7 days</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('orders')}
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center justify-center text-blue-600 transition-colors"
          >
            <FiShoppingBag size={24} />
            <span className="mt-2 text-sm font-medium">View Orders</span>
          </button>
          <button 
            onClick={() => navigate('/add-delivery')}
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex flex-col items-center justify-center text-green-600 transition-colors"
          >
            <FiPlus size={24} />
            <span className="mt-2 text-sm font-medium">New Delivery</span>
          </button>
          <button 
            onClick={() => navigate('/profit')}
            className="bg-amber-50 hover:bg-amber-100 p-4 rounded-lg flex flex-col items-center justify-center text-amber-600 transition-colors"
          >
            <FiDollarSign size={24} />
            <span className="mt-2 text-sm font-medium">Revenue</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex flex-col items-center justify-center text-purple-600 transition-colors"
          >
            <FiUsers size={24} />
            <span className="mt-2 text-sm font-medium">Manage Users</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center w-full p-3 rounded-lg text-sm ${
              activeTab === 'inventory' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiPackage size={20} className={activeTab === 'inventory' ? '' : 'text-gray-500'} />
            <span className="ml-3 font-medium">Inventory</span>
          </button>
       
          {/* Add View All Deliveries Button */}
          <button
            onClick={handleViewAllDeliveries}
            className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center">
              <FiTruck className="h-6 w-6 mr-3" />
              <span className="font-medium">View All Deliveries</span>
            </div>
            <FiList className="h-5 w-5" />
          </button>

          {/* Add additional button for direct access to delivery form */}
          <button
            onClick={() => navigate('/add-delivery')}
            className="flex items-center justify-between p-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            <div className="flex items-center">
              <FiPlus className="h-6 w-6 mr-3" />
              <span className="font-medium">Create Delivery</span>
            </div>
            <FiTruck className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recent orders preview */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent Orders</h3>
          <button 
            onClick={() => setActiveTab('orders')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent orders found.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div 
                key={order.orderId} 
                className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => handleViewOrder(order.orderId)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Order #{order.orderId}</h4>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p className="text-sm">{order.userName}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full
                      ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-amber-100 text-amber-800'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-800">All Orders</h3>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Add Order Button */}
          <button
            onClick={handleAddNewOrder}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-1" /> Add Order
          </button>
          
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              type="text"
              placeholder="Search orders..."
            />
          </div>
          
          {/* Status filter */}
          <div className="flex">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <button 
              onClick={fetchOrders}
              className="ml-2 p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              title="Refresh orders"
            >
              <FiRefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {orderError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {orderError}
        </div>
      )}
      
      {ordersLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-blue-500 mx-auto mb-4">
            <FiShoppingBag size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Orders Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? "Try adjusting your search or filter criteria" 
              : "No orders have been placed yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-amber-100 text-amber-800'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    LKR {order.amount ? order.amount.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditOrder(order.orderId);
                      }}
                      className="text-amber-600 hover:text-amber-900 p-1"
                      title="Edit order"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(order.orderId);
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete order"
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGeneratePDF(order);
                      }}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="Generate PDF"
                    >
                      <FiFileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Add/Edit Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingOrderId ? 'Edit Order' : 'Add New Order'}
            </h2>
            <form onSubmit={handleOrderSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={orderFormData.userId}
                  onChange={(e) => setOrderFormData({...orderFormData, userId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={orderFormData.userName}
                  onChange={(e) => setOrderFormData({...orderFormData, userName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                <select
                  value={orderFormData.orderType}
                  onChange={(e) => setOrderFormData({...orderFormData, orderType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Gases">Gases</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={orderFormData.discount}
                  onChange={(e) => setOrderFormData({...orderFormData, discount: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={orderFormData.paymentMethod}
                  onChange={(e) => setOrderFormData({...orderFormData, paymentMethod: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={orderFormData.paymentStatus}
                  onChange={(e) => setOrderFormData({...orderFormData, paymentStatus: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderModal(false);
                    setEditingOrderId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsersTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-800">User Management</h3>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Add User Button */}
          <button
            onClick={handleAddNewUser}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-1" /> Add User
          </button>
          
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              type="text"
              placeholder="Search users..."
            />
          </div>
          
          {/* Role filter */}
          <div className="flex">
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
            </select>
            
            <button 
              onClick={fetchUsers}
              className="ml-2 p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
              title="Refresh users"
            >
              <FiRefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {userError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {userError}
        </div>
      )}
      
      {usersLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-blue-500 mx-auto mb-4">
            <FiUsers size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Users Found</h3>
          <p className="text-gray-500 mb-6">
            {userSearchQuery || userRoleFilter !== 'all' 
              ? "Try adjusting your search or filter criteria" 
              : "No users have been registered yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{user._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'driver' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-amber-600 hover:text-amber-900 p-1"
                      title="Edit user"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete user"
                    >
                      <FiTrash2 size={18} />
                    </button>
                    {/* Add PDF generation button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateUserPDF(user);
                      }}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="Generate PDF"
                    >
                      <FiFileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleUserSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Add password field when creating new user */}
              {!editingUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu backdrop */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-10 lg:hidden" 
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-700">Admin Panel</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiHome size={20} className={activeTab === 'dashboard' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'orders' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiShoppingBag size={20} className={activeTab === 'orders' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Orders</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'users' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUsers size={20} className={activeTab === 'users' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Users</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'inventory' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiPackage size={20} className={activeTab === 'inventory' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Inventory</span>
              </button>
            </li>
            
            {/* Add Deliveries Menu Item */}
            <li>
              <button
                onClick={() => navigate('/profit')}
                className="flex items-center w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiDollarSign size={20} className="text-gray-500" />
                <span className="ml-3 font-medium">Revenue</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/customer-support/complaints/supporter')}
                className={`flex items-center w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100`}
              >
                <FiMessageSquare size={20} className="text-gray-500" />
                <span className="ml-3 font-medium">Customer Support</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            <FiLogOut size={20} />
            <span className="ml-3 font-medium">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Mobile sidebar and header omitted for brevity - similar to CustomerDashboard */}

      <div className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button 
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <FiMenu size={24} />
              </button>
              <div className="hidden lg:flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">
                  {activeTab === 'dashboard' && 'Admin Dashboard'}
                  {activeTab === 'orders' && 'Order Management'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'inventory' && 'Inventory Management'}
                </h1>
              </div>
              {/* Profile section similar to CustomerDashboard */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
