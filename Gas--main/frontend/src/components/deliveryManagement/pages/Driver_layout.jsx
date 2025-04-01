import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileCheck, 
  Clock, 
  MapPin, 
  FileText, 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Calendar
} from 'lucide-react';

export default function DriverDashboardLayout({ children }) {
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
      case '/driver':
        return 'Driver Dashboard';
      case '/driver/deliveries':
        return 'My Deliveries';
      case '/driver/schedule':
        return 'Delivery Schedule';
      case '/driver/route':
        return 'Route Planning';
      case '/driver/history':
        return 'Delivery History';
      case '/driver/profile':
        return 'My Profile';
      default:
        return 'Nelson Enterprises - Driver Portal';
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
              <p className="text-xs text-blue-200">Driver Portal</p>
            </div>
            <button 
              className="lg:hidden text-blue-100 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Driver Card */}
          <div className="mx-3 mt-4 bg-blue-700 bg-opacity-30 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                  JD
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-blue-300">Driver ID: DRV-1023</p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <Link
              to="/driver"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver')}`}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            
            <Link
              to="/driver/deliveries"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver/deliveries')}`}
            >
              <FileCheck className="mr-3 h-5 w-5" />
              My Deliveries
            </Link>
            
            <Link
              to="/driver/schedule"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver/schedule')}`}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Delivery Schedule
            </Link>
            
            <Link
              to="/driver/route"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver/route')}`}
            >
              <MapPin className="mr-3 h-5 w-5" />
              Route Planning
            </Link>
            
            <Link
              to="/driver/history"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver/history')}`}
            >
              <Clock className="mr-3 h-5 w-5" />
              Delivery History
            </Link>
            
            <div className="border-t border-blue-700 my-2"></div>
            
            <Link
              to="/driver/profile"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver/profile')}`}
            >
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Link>
            
            <Link
              to="/driver/settings"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${isActive('/driver/settings')}`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>

          {/* Help & Support */}
          <div className="p-4 border-t border-blue-700">
            <div className="bg-blue-700 bg-opacity-30 rounded-lg p-3 text-center">
              <p className="text-sm text-white font-medium mb-1">Need Help?</p>
              <p className="text-xs text-blue-200 mb-2">Contact support team</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 px-3 rounded transition duration-200">
                Contact Support
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
              {/* Daily Stats */}
              <div className="hidden md:flex space-x-4 mr-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Today's Deliveries</p>
                  <p className="text-lg font-semibold text-blue-600">5/8</p>
                </div>
                <div className="border-r border-gray-300 h-10"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">On Time</p>
                  <p className="text-lg font-semibold text-green-600">100%</p>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  className="relative p-1 text-gray-600 hover:text-blue-600 focus:outline-none"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                
                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-2 px-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="py-2 px-3 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">New delivery assigned to you</p>
                        <p className="text-xs text-gray-500">10 minutes ago</p>
                      </div>
                      <div className="py-2 px-3 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">Schedule updated for tomorrow</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                      <div className="py-2 px-3 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">Performance review complete</p>
                        <p className="text-xs text-gray-500">Yesterday</p>
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
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Driver</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      JD
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* User dropdown */}
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Status Bar - Mobile View */}
          <div className="lg:hidden border-t border-gray-200 px-4 py-2 flex justify-around">
            <div className="text-center">
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-sm font-semibold text-blue-600">5/8</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">On Time</p>
              <p className="text-sm font-semibold text-green-600">100%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-green-600">Active</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Driver Dashboard Content */}
            {children}
            
            {/* Sample dashboard content if no children are provided */}
            {!children && (
              <div>
                {/* Today's Deliveries Overview */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Deliveries</h2>
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-500 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-blue-600">3</p>
                      </div>
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-500 mb-1">Completed</p>
                        <p className="text-3xl font-bold text-green-600">5</p>
                      </div>
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-500 mb-1">Total</p>
                        <p className="text-3xl font-bold text-gray-700">8</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Next Delivery */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Next Delivery</h2>
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden border-l-4 border-blue-600">
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">ABC Manufacturing Co.</h3>
                          <p className="text-gray-600 text-sm">123 Industrial Way, Business Park</p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Industrial Oxygen - 3 Cylinders
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-500">ETA</p>
                          <p className="text-lg font-bold text-gray-800">10:30 AM</p>
                          <p className="text-xs text-gray-500">25 min away</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                          View Map
                        </button>
                        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700">
                          Mark as Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Deliveries */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Deliveries</h2>
                    <Link to="/driver/history" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View All
                    </Link>
                  </div>
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">XYZ Industries</div>
                              <div className="text-sm text-gray-500">456 Business Ave</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Nitrogen - 2 Cylinders</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">9:15 AM</div>
                              <div className="text-xs text-gray-500">Today</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Delivered
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">123 Labs</div>
                              <div className="text-sm text-gray-500">789 Research Dr</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Helium - 1 Cylinder</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">8:30 AM</div>
                              <div className="text-xs text-gray-500">Today</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Delivered
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">MedSupply Corp</div>
                              <div className="text-sm text-gray-500">321 Health Blvd</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Medical Oxygen - 4 Cylinders</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">4:45 PM</div>
                              <div className="text-xs text-gray-500">Yesterday</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Delivered
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}