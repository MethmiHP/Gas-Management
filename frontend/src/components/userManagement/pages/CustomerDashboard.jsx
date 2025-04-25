import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserService } from '../services/userService';
import { toast } from 'react-toastify';
// Import icons
import { 
  FiHome, FiShoppingBag, FiMessageSquare, FiUser, 
  FiLogOut, FiSettings, FiTruck, FiBell, FiSearch,
  FiPlus, FiChevronDown, FiMenu, FiX 
} from 'react-icons/fi';

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    orders: [],
    complaints: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Mock stats for the dashboard
  const stats = {
    totalOrders: 18,
    pendingOrders: 2,
    totalSpent: 421.24,
    lastDelivery: '2023-09-15'
  };

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // using the JWT token for authentication
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls with setTimeout
        setTimeout(() => {
          setCustomerData({
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
            orders: [
              { id: 'ORD-001', date: '2023-05-15', status: 'Delivered', amount: 120.50, items: ['Gas Cylinder (14kg)', 'Delivery Fee'] },
              { id: 'ORD-002', date: '2023-06-20', status: 'Processing', amount: 89.99, items: ['Gas Cylinder (5kg)', 'Regulator', 'Delivery Fee'] },
              { id: 'ORD-003', date: '2023-07-05', status: 'Pending', amount: 210.75, items: ['Gas Cylinder (14kg)', 'Gas Cylinder (5kg)', 'Delivery Fee'] },
            ],
            complaints: [
              { id: 'COMP-001', date: '2023-05-20', status: 'Resolved', subject: 'Delivery Delay', description: 'My order was delivered 2 days late' },
              { id: 'COMP-002', date: '2023-07-10', status: 'In Progress', subject: 'Product Quality Issue', description: 'The gas regulator seems to be faulty' },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching customer data:', error);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const handleNewOrder = () => {
    navigate('/products');  // Navigate to products page to place a new order
  };

  const handleNewComplaint = () => {
    navigate('/customer-support/complaints');  // Navigate to complaint form
  };

  const handleOrderClick = (orderId) => {
    navigate(`/order-details/${orderId}`);  // Navigate to order details page
  };

  const handleComplaintClick = (complaintId) => {
    navigate(`/complaint-details/${complaintId}`);  // Navigate to complaint details page
  };

  const handleLogout = () => {
    UserService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderDashboardContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'orders':
        return renderOrdersTab();
      case 'complaints':
        return renderComplaintsTab();
      case 'profile':
        return renderProfileTab();
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
          <span className="font-medium">↗ 12%</span> from previous month
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Total Spent</p>
            <h3 className="text-3xl font-bold">${stats.totalSpent.toFixed(2)}</h3>
          </div>
          <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
            <FiUser size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs opacity-80">
          <span className="font-medium">↗ 5%</span> from previous month
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
          <span className="font-medium text-purple-100">Awaiting delivery</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Last Delivery</p>
            <h3 className="text-xl font-bold">{stats.lastDelivery}</h3>
          </div>
          <div className="bg-amber-400 bg-opacity-30 p-3 rounded-full">
            <FiTruck size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs opacity-80">
          <span className="font-medium">Successfully delivered</span>
        </div>
      </div>

      {/* Recent activity section */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent Orders</h3>
          <button 
            onClick={handleNewOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md transition-all duration-300 flex items-center gap-2"
          >
            <FiPlus size={16} />
            New Order
          </button>
        </div>
        
        {customerData.orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent orders found.</p>
        ) : (
          <div className="space-y-3">
            {customerData.orders.slice(0, 3).map(order => (
              <div 
                key={order.id} 
                className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{order.id}</h4>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-amber-100 text-amber-800'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>${order.amount.toFixed(2)}</p>
                  <p className="text-xs mt-1 text-gray-500">{order.items.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {customerData.orders.length > 3 && (
          <div className="mt-4 text-center">
            <button 
              onClick={() => setActiveTab('orders')} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Orders
            </button>
          </div>
        )}
      </div>

      {/* Recent complaints */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent Complaints</h3>
          <button 
            onClick={handleNewComplaint}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md transition-all duration-300 flex items-center gap-2"
          >
            <FiPlus size={16} />
            New Complaint
          </button>
        </div>
        
        {customerData.complaints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent complaints found.</p>
        ) : (
          <div className="space-y-3">
            {customerData.complaints.map(complaint => (
              <div 
                key={complaint.id} 
                className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => handleComplaintClick(complaint.id)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{complaint.subject}</h4>
                    <p className="text-sm text-gray-500">{complaint.date}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full
                    ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{complaint.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">My Orders</h3>
        <button 
          onClick={handleNewOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all duration-300 flex items-center gap-2"
        >
          <FiPlus size={16} />
          Place New Order
        </button>
      </div>
      
      {customerData.orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-blue-500 mx-auto mb-4">
            <FiShoppingBag size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Orders Yet</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <button 
            onClick={handleNewOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-all duration-300"
          >
            Place Your First Order
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customerData.orders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-amber-100 text-amber-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{order.items.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button 
                      onClick={() => handleOrderClick(order.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderComplaintsTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">My Complaints</h3>
        <button 
          onClick={handleNewComplaint}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all duration-300 flex items-center gap-2"
        >
          <FiPlus size={16} />
          Submit New Complaint
        </button>
      </div>
      
      {customerData.complaints.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-blue-500 mx-auto mb-4">
            <FiMessageSquare size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Complaints</h3>
          <p className="text-gray-500 mb-6">You haven't submitted any complaints yet.</p>
          <button 
            onClick={handleNewComplaint}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-all duration-300"
          >
            Submit a Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customerData.complaints.map((complaint) => (
            <div 
              key={complaint.id} 
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleComplaintClick(complaint.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium text-gray-800">{complaint.subject}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{complaint.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{complaint.date}</span>
                <span className="text-blue-600 hover:text-blue-800">View Details</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h3>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img 
                src={customerData.avatarUrl || "https://via.placeholder.com/150"}
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
              />
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <FiSettings size={16} />
              </button>
            </div>
            <h2 className="text-xl font-semibold mt-4">{customerData.name}</h2>
            <p className="text-gray-500">{customerData.email}</p>
            
            <div className="mt-6 w-full space-y-3">
              <button 
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiUser size={18} />
                Edit Profile
              </button>
              <button 
                onClick={() => navigate('/change-password')}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FiSettings size={18} />
                Change Password
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-medium text-lg text-gray-800 mb-4">Account Information</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{customerData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customerData.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="font-medium">{customerData.orders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">July 2023</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-green-50 rounded-lg p-6">
            <h4 className="font-medium text-lg text-gray-800 mb-4">Delivery Information</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Default Address</p>
                  <p className="font-medium">123 Main St, City</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            
            <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              <FiPlus size={14} /> Add New Address
            </button>
          </div>
        </div>
      </div>
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
          <h2 className="text-2xl font-bold text-blue-700">Nelson Gas</h2>
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
                onClick={() => setActiveTab('complaints')}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'complaints' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiMessageSquare size={20} className={activeTab === 'complaints' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Complaints</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'profile' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUser size={20} className={activeTab === 'profile' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Profile</span>
              </button>
            </li>
            <li>
              <Link
                to="/"
                className={`flex items-center w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100`}
              >
                <FiHome size={20} className="text-gray-500" />
                <span className="ml-3 font-medium">Home</span>
              </Link>
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
      
      {/* Sidebar - Mobile */}
      <div 
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white transform ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-700">Nelson Gas</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowMobileMenu(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setShowMobileMenu(false);
                }}
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
                onClick={() => {
                  setActiveTab('orders');
                  setShowMobileMenu(false);
                }}
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
                onClick={() => {
                  setActiveTab('complaints');
                  setShowMobileMenu(false);
                }}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'complaints' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiMessageSquare size={20} className={activeTab === 'complaints' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Complaints</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowMobileMenu(false);
                }}
                className={`flex items-center w-full p-3 rounded-lg text-sm ${
                  activeTab === 'profile' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiUser size={20} className={activeTab === 'profile' ? '' : 'text-gray-500'} />
                <span className="ml-3 font-medium">Profile</span>
              </button>
            </li>
            <li>
              <Link 
                to="/" 
                className="py-2 block hover:bg-blue-700 px-3 rounded flex items-center"
              >
                <FiHome size={20} className="mr-2" /> Home
              </Link>
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

      {/* Main content area */}
      <div className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FiMenu size={24} />
                </button>
                <h1 className="ml-4 text-lg font-semibold text-gray-800">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'orders' && 'My Orders'}
                  {activeTab === 'complaints' && 'My Complaints'}
                  {activeTab === 'profile' && 'My Profile'}
                </h1>
              </div>
              
              <div className="hidden lg:flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'orders' && 'My Orders'}
                  {activeTab === 'complaints' && 'My Complaints'}
                  {activeTab === 'profile' && 'My Profile'}
                </h1>
              </div>
              
              <div className="flex items-center">
                {/* Search */}
                <div className="hidden md:block mr-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      type="text"
                      placeholder="Search..."
                    />
                  </div>
                </div>
                
                {/* Notifications */}
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <FiBell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 bg-white rounded-full focus:outline-none"
                    >
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={customerData.avatarUrl || "https://via.placeholder.com/150"}
                        alt="User avatar"
                      />
                      <div className="hidden md:block text-sm">
                        <span className="text-gray-700 font-medium">{customerData.name}</span>
                        <FiChevronDown className="ml-1 h-4 w-4 inline" />
                      </div>
                    </button>
                  </div>
                  
                  {/* Dropdown panel */}
                  {showProfileMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/change-password');
                          setShowProfileMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

export default CustomerDashboard;
