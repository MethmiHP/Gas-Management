// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { FiHome, FiShoppingBag, FiUsers, FiMessageSquare, FiUser, FiSettings, 
//   FiBell, FiChevronDown, FiMenu, FiX, FiLogOut, FiSearch } from 'react-icons/fi';
// import { UserService } from '../services/userService';
// import { toast } from 'react-toastify';

// const CustomerDashboard = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [userData, setUserData] = useState({
//     name: '',
//     email: '',
//     username: '',
//     avatarUrl: '',
//     role: '',
//     createdAt: '',
//     id: ''
//   });
//   const [orders, setOrders] = useState([]);
//   const [complaints, setComplaints] = useState([]);
//   const [orderLoading, setOrderLoading] = useState(false);
//   const [complaintLoading, setComplaintLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setLoading(true);
//         // Check if user is logged in
//         if (!UserService.isLoggedIn()) {
//           toast.error('Please login to access dashboard');
//           navigate('/login');
//           return;
//         }
        
//         // Fetch user data
//         const response = await UserService.getCurrentUser();
//         if (response && response.data) {
//           const user = response.data;
//           setUserData({
//             id: user._id || user.id || '',
//             name: user.username || '',
//             email: user.email || '',
//             username: user.username || '',
//             role: user.role || 'customer',
//             avatarUrl: user.avatarUrl || '', 
//             createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 
//                       (user.created_at ? new Date(user.created_at).toLocaleDateString() : 
//                       new Date().toLocaleDateString())
//           });
          
//           // After getting user data, fetch orders and complaints
//           fetchOrders();
//           fetchComplaints(user._id || user.id);
//         } else {
//           toast.error('Failed to load user data');
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         toast.error('Error loading user information');
        
//         // Redirect to login if unauthorized
//         if (error.response && error.response.status === 401) {
//           UserService.logout();
//           navigate('/login');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);
  
//   // Function to fetch user orders
//   const fetchOrders = async () => {
//     try {
//       setOrderLoading(true);
//       const response = await UserService.getUserOrders(); // No need to pass userId anymore
      
//       // Make sure we're properly handling the response structure
//       if (response && response.data) {
//         // Ensure orders is always an array
//         if (Array.isArray(response.data)) {
//           setOrders(response.data);
//         } else if (response.data.data && Array.isArray(response.data.data)) {
//           // Handle nested data structure
//           setOrders(response.data.data);
//         } else {
//           // If response.data is not an array and doesn't contain a data array
//           console.error('Unexpected orders response format:', response.data);
//           setOrders([]);
//         }
//       } else {
//         setOrders([]);
//       }
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       setOrders([]);
//     } finally {
//       setOrderLoading(false);
//     }
//   };
  
//   // Function to fetch user complaints
//   const fetchComplaints = async (userId) => {
//     try {
//       setComplaintLoading(true);
//       const response = await UserService.getUserComplaints(userId);
//       if (response && response.data) {
//         setComplaints(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching complaints:', error);
//       // Don't show error toast as this is supplementary data
//     } finally {
//       setComplaintLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     UserService.logout();
//     toast.success('Logged out successfully');
//     navigate('/login');
//   };

//   const renderProfileTab = () => (
//     <div className="bg-white rounded-lg shadow-lg p-6">
//       <h3 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h3>
//       <div className="flex flex-col md:flex-row gap-8">
//         <div className="md:w-1/3">
//           <div className="flex flex-col items-center">
//             <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
//               <img
//                 src={userData.avatarUrl || "/assets/images/nelson-gas-logo.png"}
//                 alt="Profile"
//                 className="w-full h-full object-cover"
//               />
//             </div>
            
//             <h2 className="text-xl font-semibold mt-4">{userData.name}</h2>
//             <p className="text-gray-500">{userData.email}</p>
            
//             <div className="mt-6 w-full space-y-3">
//               <button 
//                 onClick={() => navigate('/profile')}
//                 className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 <FiUser size={18} />
//                 Edit Profile
//               </button>
//               <button 
//                 onClick={() => navigate('/change-password')}
//                 className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
//               >
//                 <FiSettings size={18} />
//                 Change Password
//               </button>
//             </div>
//           </div>
//         </div>
        
//         <div className="md:w-2/3">
//           <div className="bg-blue-50 rounded-lg p-6">
//             <h4 className="font-medium text-lg text-gray-800 mb-4">Account Information</h4>
            
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-500">Name</p>
//                   <p className="font-medium">{userData.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Email</p>
//                   <p className="font-medium">{userData.email}</p>
//                 </div>
//               </div>
              
//               <div>
//                 <p className="text-sm text-gray-500">Role</p>
//                 <p className="font-medium capitalize">{userData.role}</p>
//               </div>
              
//               <div>
//                 <p className="text-sm text-gray-500">Member Since</p>
//                 <p className="font-medium">{userData.createdAt}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderOrdersTab = () => (
//     <div className="bg-white rounded-lg shadow-lg p-6">
//       <h3 className="text-xl font-semibold text-gray-800 mb-6">My Orders</h3>
      
//       {orderLoading ? (
//         <div className="flex justify-center items-center py-8">
//           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : !Array.isArray(orders) || orders.length === 0 ? (
//         <div className="text-center py-8 bg-gray-50 rounded-lg">
//           <div className="text-blue-500 mb-3">
//             <FiShoppingBag size={40} className="mx-auto opacity-50" />
//           </div>
//           <p className="text-gray-500">You haven't placed any orders yet.</p>
//           <button 
//             onClick={() => navigate('/products')} 
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Browse Products
//           </button>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Order ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Items
//                 </th>
//                 {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th> */}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {orders.map((order) => (
//                 <tr key={order.orderId} className="hover:bg-blue-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
//                     #{order.orderId}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(order.timestamp || order.createdAt || Date.now()).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {order.items && Array.isArray(order.items) ? (
//                       <ul>
//                         {order.items.map((item, idx) => (
//                           <li key={idx}>
//                             {item.productName} × {item.quantity}
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <span className="text-gray-400">No items data</span>
//                     )}
//                   </td>
//                   {/* <td className="px-6 py-4 whitespace-nowrap">
//                     <button
//                       onClick={() => viewOrderDetails(order.orderId)}
//                       className="text-blue-600 hover:text-blue-900 mr-2"
//                     >
//                       View Details
//                     </button>
//                   </td> */}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const renderComplaintsTab = () => (
//     <div className="bg-white rounded-lg shadow-lg p-6">
//       <h3 className="text-xl font-semibold text-gray-800 mb-6">My Complaints</h3>
      
//       {complaintLoading ? (
//         <div className="flex justify-center items-center py-8">
//           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : complaints.length === 0 ? (
//         <div className="text-center py-8 bg-gray-50 rounded-lg">
//           <div className="text-blue-500 mb-3">
//             <FiMessageSquare size={40} className="mx-auto opacity-50" />
//           </div>
//           <p className="text-gray-500">You haven't submitted any complaints yet.</p>
//           <button 
//             onClick={() => navigate('/customer-support/complaints')} 
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Submit a Complaint
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {complaints.map((complaint) => (
//             <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h4 className="font-medium text-gray-800">{complaint.subject}</h4>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {new Date(complaint.createdAt || Date.now()).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
//                   complaint.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
//                   'bg-yellow-100 text-yellow-800'
//                 }`}>
//                   {complaint.status || 'Pending'}
//                 </span>
//               </div>
//               <p className="mt-2 text-gray-600 text-sm line-clamp-2">{complaint.message}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   const viewOrderDetails = (orderId) => {
//     navigate(`/order/${orderId}`);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Mobile menu backdrop */}
//       {showMobileMenu && (
//         <div 
//           className="fixed inset-0 bg-gray-900 bg-opacity-50 z-10 lg:hidden" 
//           onClick={() => setShowMobileMenu(false)}
//         ></div>
//       )}

//       {/* Sidebar - Desktop */}
//       <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
//         <div className="p-5 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-blue-700">Nelson Gas</h2>
//         </div>
        
//         <div className="flex-1 overflow-y-auto py-4 px-3">
//           <ul className="space-y-2">
//             <li>
//               <button
//                 onClick={() => setActiveTab('dashboard')}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'dashboard' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiHome size={20} className={activeTab === 'dashboard' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Dashboard</span>
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveTab('orders')}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'orders' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiShoppingBag size={20} className={activeTab === 'orders' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Orders</span>
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveTab('complaints')}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'complaints' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiMessageSquare size={20} className={activeTab === 'complaints' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Complaints</span>
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => setActiveTab('profile')}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'profile' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiUser size={20} className={activeTab === 'profile' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Profile</span>
//               </button>
//             </li>
//             <li>
//               <Link
//                 to="/"
//                 className={`flex items-center w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100`}
//               >
//                 <FiHome size={20} className="text-gray-500" />
//                 <span className="ml-3 font-medium">Home</span>
//               </Link>
//             </li>
//           </ul>
//         </div>
        
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
//           >
//             <FiLogOut size={20} />
//             <span className="ml-3 font-medium">Logout</span>
//           </button>
//         </div>
//       </div>
      
//       {/* Sidebar - Mobile */}
//       <div 
//         className={`fixed inset-y-0 left-0 z-20 w-64 bg-white transform ${
//           showMobileMenu ? 'translate-x-0' : '-translate-x-full'
//         } transition-transform duration-300 ease-in-out lg:hidden`}
//       >
//         <div className="p-5 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-xl font-bold text-blue-700">Nelson Gas</h2>
//           <button 
//             className="text-gray-500 hover:text-gray-700"
//             onClick={() => setShowMobileMenu(false)}
//           >
//             <FiX size={24} />
//           </button>
//         </div>
        
//         <div className="flex-1 overflow-y-auto py-4 px-3">
//           <ul className="space-y-2">
//             <li>
//               <button
//                 onClick={() => {
//                   setActiveTab('dashboard');
//                   setShowMobileMenu(false);
//                 }}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'dashboard' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiHome size={20} className={activeTab === 'dashboard' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Dashboard</span>
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => {
//                   setActiveTab('orders');
//                   setShowMobileMenu(false);
//                 }}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'orders' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiShoppingBag size={20} className={activeTab === 'orders' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Orders</span>
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => {
//                   setActiveTab('complaints');
//                   setShowMobileMenu(false);
//                 }}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'complaints' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiMessageSquare size={20} className={activeTab === 'complaints' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Complaints</span>
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => {
//                   setActiveTab('profile');
//                   setShowMobileMenu(false);
//                 }}
//                 className={`flex items-center w-full p-3 rounded-lg text-sm ${
//                   activeTab === 'profile' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <FiUser size={20} className={activeTab === 'profile' ? '' : 'text-gray-500'} />
//                 <span className="ml-3 font-medium">Profile</span>
//               </button>
//             </li>
//             <li>
//               <Link
//                 to="/"
//                 className={`flex items-center w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100`}
//               >
//                 <FiHome size={20} className="text-gray-500" />
//                 <span className="ml-3 font-medium">Home</span>
//               </Link>
//             </li>
//           </ul>
//         </div>
        
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
//           >
//             <FiLogOut size={20} />
//             <span className="ml-3 font-medium">Logout</span>
//           </button>
//         </div>
//       </div>

//       <div className="flex-1">
//         {/* Top Navigation */}
//         <header className="bg-white shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex justify-between items-center h-16">
//               <div className="flex items-center lg:hidden">
//                 <button
//                   onClick={() => setShowMobileMenu(!showMobileMenu)}
//                   className="text-gray-500 hover:text-gray-700 focus:outline-none"
//                 >
//                   <FiMenu size={24} />
//                 </button>
//                 <h1 className="ml-4 text-lg font-semibold text-gray-800">
//                   {activeTab === 'dashboard' && 'Dashboard'}
//                   {activeTab === 'orders' && 'My Orders'}
//                   {activeTab === 'complaints' && 'My Complaints'}
//                   {activeTab === 'profile' && 'My Profile'}
//                 </h1>
//               </div>
              
//               <div className="hidden lg:flex items-center">
//                 <h1 className="text-xl font-semibold text-gray-800">
//                   {activeTab === 'dashboard' && 'Dashboard'}
//                   {activeTab === 'orders' && 'My Orders'}
//                   {activeTab === 'complaints' && 'My Complaints'}
//                   {activeTab === 'profile' && 'My Profile'}
//                 </h1>
//               </div>
              
//               <div className="flex items-center">
//                 {/* Search */}
//                 <div className="hidden md:block mr-4">
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FiSearch className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
//                       type="text"
//                       placeholder="Search..."
//                     />
//                   </div>
//                 </div>
                
//                 {/* Notifications */}
//                 <button className="p-2 text-gray-500 hover:text-gray-700 relative">
//                   <FiBell size={20} />
//                   <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
//                 </button>
                
//                 {/* Profile dropdown */}
//                 <div className="ml-3 relative">
//                   <div>
//                     <button
//                       onClick={() => setShowProfileMenu(!showProfileMenu)}
//                       className="flex items-center gap-2 bg-white rounded-full focus:outline-none"
//                     >
//                       <img
//                         className="h-8 w-8 rounded-full object-cover"
//                         src={userData.avatarUrl || "/assets/images/nelson-gas-logo.png"}
//                         alt="User avatar"
//                       />
//                       <div className="hidden md:block text-sm">
//                         <span className="text-gray-700 font-medium">{userData.name}</span>
//                         <FiChevronDown className="ml-1 h-4 w-4 inline" />
//                       </div>
//                     </button>
//                   </div>
                  
//                   {/* Dropdown panel */}
//                   {showProfileMenu && (
//                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
//                       <button
//                         onClick={() => {
//                           setActiveTab('profile');
//                           setShowProfileMenu(false);
//                         }}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Your Profile
//                       </button>
//                       <button
//                         onClick={() => {
//                           navigate('/profile');
//                           setShowProfileMenu(false);
//                         }}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Edit Profile
//                       </button>
//                       <button
//                         onClick={() => {
//                           navigate('/change-password');
//                           setShowProfileMenu(false);
//                         }}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Change Password
//                       </button>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {activeTab === 'dashboard' && renderProfileTab()}
//           {activeTab === 'orders' && renderOrdersTab()}
//           {activeTab === 'complaints' && renderComplaintsTab()}
//           {activeTab === 'profile' && renderProfileTab()}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default CustomerDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiUsers, FiMessageSquare, FiUser, FiSettings, 
  FiBell, FiChevronDown, FiMenu, FiX, FiLogOut, FiSearch, FiMap } from 'react-icons/fi';
import { UserService } from '../services/userService';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    username: '',
    avatarUrl: '',
    role: '',
    createdAt: '',
    id: ''
  });
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Check if user is logged in
        if (!UserService.isLoggedIn()) {
          toast.error('Please login to access dashboard');
          navigate('/login');
          return;
        }
        
        // Fetch user data
        const response = await UserService.getCurrentUser();
        if (response && response.data) {
          const user = response.data;
          setUserData({
            id: user._id || user.id || '',
            name: user.username || '',
            email: user.email || '',
            username: user.username || '',
            role: user.role || 'customer',
            avatarUrl: user.avatarUrl || '', 
            createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 
                      (user.created_at ? new Date(user.created_at).toLocaleDateString() : 
                      new Date().toLocaleDateString())
          });
          
          // After getting user data, fetch orders and complaints
          fetchOrders();
          fetchComplaints(user._id || user.id);
        } else {
          toast.error('Failed to load user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error loading user information');
        
        // Redirect to login if unauthorized
        if (error.response && error.response.status === 401) {
          UserService.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);
  
  // Function to fetch user orders
  const fetchOrders = async () => {
    try {
      setOrderLoading(true);
      const response = await UserService.getUserOrders(); // No need to pass userId anymore
      
      // Make sure we're properly handling the response structure
      if (response && response.data) {
        // Ensure orders is always an array
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Handle nested data structure
          setOrders(response.data.data);
        } else {
          // If response.data is not an array and doesn't contain a data array
          console.error('Unexpected orders response format:', response.data);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrderLoading(false);
    }
  };
  
  // Function to fetch user complaints
  const fetchComplaints = async (userId) => {
    try {
      setComplaintLoading(true);
      const response = await UserService.getUserComplaints(userId);
      if (response && response.data) {
        setComplaints(response.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      // Don't show error toast as this is supplementary data
    } finally {
      setComplaintLoading(false);
    }
  };

  const handleLogout = () => {
    UserService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Navigate to track delivery page
  const navigateToTrackDelivery = () => {
    navigate('/track');
    setShowMobileMenu(false);
  };

  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h3>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src={userData.avatarUrl || "/assets/images/nelson-gas-logo.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-xl font-semibold mt-4">{userData.name}</h2>
            <p className="text-gray-500">{userData.email}</p>
            
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
                  <p className="font-medium">{userData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{userData.role}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{userData.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">My Orders</h3>
      
      {orderLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !Array.isArray(orders) || orders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-blue-500 mb-3">
            <FiShoppingBag size={40} className="mx-auto opacity-50" />
          </div>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
          <button 
            onClick={() => navigate('/products')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                    #{order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.timestamp || order.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items && Array.isArray(order.items) ? (
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.productName} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">No items data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // const renderComplaintsTab = () => (
  //   <div className="bg-white rounded-lg shadow-lg p-6">
  //     <h3 className="text-xl font-semibold text-gray-800 mb-6">My Complaints</h3>
      
  //     {complaintLoading ? (
  //       <div className="flex justify-center items-center py-8">
  //         <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  //       </div>
  //     ) : complaints.length === 0 ? (
  //       <div className="text-center py-8 bg-gray-50 rounded-lg">
  //         <div className="text-blue-500 mb-3">
  //           <FiMessageSquare size={40} className="mx-auto opacity-50" />
  //         </div>
  //         <p className="text-gray-500">You haven't submitted any complaints yet.</p>
  //         <button 
  //           onClick={() => navigate('/customer-support/complaints')} 
  //           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  //         >
  //           Submit a Complaint
  //         </button>
  //       </div>
  //     ) : (
  //       <div className="space-y-4">
  //         {complaints.map((complaint) => (
  //           <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
  //             <div className="flex justify-between items-start">
  //               <div>
  //                 <h4 className="font-medium text-gray-800">{complaint.subject}</h4>
  //                 <p className="text-sm text-gray-500 mt-1">
  //                   {new Date(complaint.createdAt || Date.now()).toLocaleDateString()}
  //                 </p>
  //               </div>
  //               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  //                 complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
  //                 complaint.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
  //                 'bg-yellow-100 text-yellow-800'
  //               }`}>
  //                 {complaint.status || 'Pending'}
  //               </span>
  //             </div>
  //             <p className="mt-2 text-gray-600 text-sm line-clamp-2">{complaint.message}</p>
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );

  // const viewOrderDetails = (orderId) => {
  //   navigate(`/order/${orderId}`);
  // };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen bg-gray-50">
  //       <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
  //     </div>
  //   );
  // }

  const renderComplaintsTab = () => {
    // Dummy complaints data
    const complaints = [
      {
        _id: "c1001",
        subject: "Gas Leakage Issue",
        message: "There's a slight gas smell coming from the connection behind my stove. I need a technician to inspect this urgently.",
        status: "Processing",
        createdAt: "2025-04-01T10:30:00Z"
      },
      {
        _id: "c1002",
        subject: "Billing Discrepancy",
        message: "My March 2025 bill seems to be much higher than usual despite using the same amount of gas. Please review this and provide clarification.",
        status: "Pending",
        createdAt: "2025-04-03T14:15:00Z"
      },
      {
        _id: "c1003",
        subject: "Late Delivery",
        message: "My scheduled refill was supposed to arrive on April 15th but still hasn't been delivered. This has caused significant inconvenience.",
        status: "Resolved",
        createdAt: "2025-04-02T09:00:00Z"
      }
    ];
  
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">My Complaints</h3>
        
        
        {complaintLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-blue-500 mb-3">
              <FiMessageSquare size={40} className="mx-auto opacity-50" />
            </div>
            <p className="text-gray-500">You haven't submitted any complaints yet.</p>
            <button 
              onClick={() => navigate('/customer-support/complaints')} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit a Complaint
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{complaint.subject}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(complaint.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                    complaint.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {complaint.status || 'Pending'}
                  </span>
                </div>
                <p className="mt-2 text-gray-600 text-sm line-clamp-2">{complaint.message}</p>
              </div>
            ))}
            
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => navigate('/customer-support/complaints')} 
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Submit a Complaint
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

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
            {/* New Track Orders button */}
            <li>
              <button
                onClick={navigateToTrackDelivery}
                className="flex items-center w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiMap size={20} className="text-gray-500" />
                <span className="ml-3 font-medium">Track Orders</span>
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
            {/* New Track Orders button for mobile */}
            <li>
              <button
                onClick={navigateToTrackDelivery}
                className="flex items-center w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiMap size={20} className="text-gray-500" />
                <span className="ml-3 font-medium">Track Orders</span>
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
                        src={userData.avatarUrl || "/assets/images/nelson-gas-logo.png"}
                        alt="User avatar"
                      />
                      <div className="hidden md:block text-sm">
                        <span className="text-gray-700 font-medium">{userData.name}</span>
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
          {activeTab === 'dashboard' && renderProfileTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'complaints' && renderComplaintsTab()}
          {activeTab === 'profile' && renderProfileTab()}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;


