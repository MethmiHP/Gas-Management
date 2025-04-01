// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// const Layout = ({ children }) => {
//   const location = useLocation();
  
//   // Check which path is active
//   const isActive = (path) => {
//     return location.pathname === path ? 
//       'bg-blue-700 text-white' : 
//       'text-blue-100 hover:bg-blue-600 hover:text-white';
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-blue-800 text-white flex flex-col">
//         <div className="p-4 border-b border-blue-700">
//           <h1 className="text-2xl font-bold">Gas Management</h1>
//           <p className="text-sm text-blue-200">Delivery System</p>
//         </div>
        
//         <nav className="flex-1 p-4">
//           <ul className="space-y-2">
//             <li>
//               <Link 
//                 to="/" 
//                 className={`block px-4 py-2 rounded-md transition ${isActive('/')}`}
//               >
//                 Dashboard
//               </Link>
//             </li>
//             <li>
//               <Link 
//                 to="/deliveries" 
//                 className={`block px-4 py-2 rounded-md transition ${isActive('/deliveries')}`}
//               >
//                 Deliveries
//               </Link>
//             </li>
//             <li>
//               <Link 
//                 to="/drivers" 
//                 className={`block px-4 py-2 rounded-md transition ${isActive('/drivers')}`}
//               >
//                 Drivers
//               </Link>
//             </li>
//             <li>
//               <Link 
//                 to="/driver-performance-report" 
//                 className={`block px-4 py-2 rounded-md transition ${isActive('/driver-performance-report')}`}
//               >
//                 Driver Performance Report
//               </Link>
//             </li>
//           </ul>
//         </nav>
        
//         <div className="p-4 border-t border-blue-700">
//           <p className="text-sm text-blue-300">
//             © {new Date().getFullYear()} Gas Management
//           </p>
//         </div>
//       </div>
      
//       {/* Main Content */}
//       <div className="flex-1 overflow-auto">
//         <header className="bg-white shadow-sm">
//           <div className="px-4 py-3 flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-800">
//               {location.pathname === '/' && 'Dashboard'}
//               {location.pathname === '/deliveries' && 'Deliveries Management'}
//               {location.pathname === '/drivers' && 'Drivers Management'}
//             </h2>
            
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   className="px-4 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Admin</span>
//                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
//                   A
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>
        
//         <main className="p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Truck, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  BellRing, 
  Menu, 
  X, 
  ChevronDown,
  BarChart3
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Check which path is active
  const isActive = (path) => {
    return location.pathname === path ?
      'bg-blue-700 text-white' :
      'text-blue-100 hover:bg-blue-600 hover:text-white';
  };
  
  // Get page title based on current path
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/':
        return 'Dashboard';
      case '/deliveries':
        return 'Deliveries Management';
      case '/drivers':
        return 'Drivers Management';
      case '/driver-performance-report':
        return 'Driver Performance Report';
      case '/settings':
        return 'System Settings';
      default:
        return 'Nelson Enterprises';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-800 to-blue-900 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-blue-700">
            <div>
              <h1 className="text-xl font-bold text-white">Nelson Enterprises</h1>
              <p className="text-xs text-blue-200">Gas Management System</p>
            </div>
            <button 
              className="lg:hidden text-blue-100 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <Link
              to="/deliverydashboard"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/')}`}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            
            <Link
              to="/deliveries"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/deliveries')}`}
            >
              <Truck className="mr-3 h-5 w-5" />
              Deliveries
            </Link>
            
            <Link
              to="/drivers"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/drivers')}`}
            >
              <Users className="mr-3 h-5 w-5" />
              Drivers
            </Link>
            
            <Link
              to="/driver-performance-report"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver-performance-report')}`}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Performance Reports
            </Link>
            
            <div className="border-t border-blue-700 my-2"></div>
            
            <Link
              to="/add-driver"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/settings')}`}
            >
              <Settings className="mr-3 h-5 w-5" />
             Add Driver
            </Link>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  A
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-blue-300">admin@nelsongas.com</p>
              </div>
              <button className="ml-auto text-blue-300 hover:text-white">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              >
                <Menu size={24} />
              </button>
              
              <h2 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-800">
                {getPageTitle()}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 lg:w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  className="relative p-1 text-gray-600 hover:text-blue-600 focus:outline-none"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <BellRing size={20} />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                
                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-2 px-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="py-2 px-3 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">New delivery request received</p>
                        <p className="text-xs text-gray-500">10 minutes ago</p>
                      </div>
                      <div className="py-2 px-3 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">Driver #103 completed delivery</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                      <div className="py-2 px-3 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">Monthly report is ready</p>
                        <p className="text-xs text-gray-500">3 hours ago</p>
                      </div>
                    </div>
                    <div className="py-2 px-3 border-t border-gray-200 text-center">
                      <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-800">View all notifications</a>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Admin</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* User dropdown */}
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;