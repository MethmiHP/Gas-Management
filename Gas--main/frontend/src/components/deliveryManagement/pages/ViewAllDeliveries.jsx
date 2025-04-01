import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiSearch, FiFilter, FiPlus, FiRefreshCw, FiEdit, 
  FiTrash2, FiEye, FiTruck, FiChevronLeft, FiArrowDown, FiArrowUp 
} from 'react-icons/fi';

const ViewAllDeliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('deliveryDate');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/deliveries');
      console.log('API Response:', response.data); // Debug the response structure
      
      // Handle different possible response formats
      let deliveriesArray = [];
      if (Array.isArray(response.data)) {
        // If the response is directly an array
        deliveriesArray = response.data;
      } else if (response.data?.deliveries && Array.isArray(response.data.deliveries)) {
        // If the response has a deliveries property that's an array
        deliveriesArray = response.data.deliveries;
      } else if (typeof response.data === 'object') {
        // If it's some other object structure, try to extract meaningful data
        console.warn('Unexpected API response format:', response.data);
        deliveriesArray = [];
      }
      
      console.log('Extracted deliveries array:', deliveriesArray);
      setDeliveries(deliveriesArray);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError('Failed to load deliveries. Please try again.');
      setDeliveries([]); // Ensure we have an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await axios.delete(`http://localhost:5000/deliveries/${id}`);
        toast.success('Delivery deleted successfully!');
        setDeliveries(deliveries.filter(delivery => delivery._id !== id));
      } catch (error) {
        console.error('Error deleting delivery:', error);
        toast.error(error.response?.data?.message || 'Failed to delete delivery');
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/delivery/${id}`);
  };

  const handleAddNewDelivery = () => {
    navigate('/add-delivery');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort direction if clicking on the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAssignDriver = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:5000/deliveries/${orderId}/assign-driver`, {});
      toast.success(response.data.message || 'Driver assigned successfully');
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error(error.response?.data?.message || 'Failed to assign driver');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await axios.put(`http://localhost:5000/deliveries/${orderId}/status`, { deliveryStatus: status });
      toast.success('Status updated successfully!');
      
      // Update the local state to avoid a full refresh
      setDeliveries(prevDeliveries => 
        prevDeliveries.map(delivery => 
          delivery.orderId === orderId ? { ...delivery, deliveryStatus: status } : delivery
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Get color class for status badge
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'Out For Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Delivery Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort deliveries - ensure it's an array before filtering
  const filteredDeliveries = Array.isArray(deliveries) ? 
    deliveries
      .filter(delivery => {
        // Apply status filter
        if (statusFilter !== 'all' && delivery.deliveryStatus !== statusFilter) {
          return false;
        }
        
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            (delivery.orderId && delivery.orderId.toLowerCase().includes(query)) ||
            (delivery.customerName && delivery.customerName.toLowerCase().includes(query)) ||
            (delivery.address && delivery.address.toLowerCase().includes(query)) ||
            (delivery.phone && delivery.phone.includes(query))
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected field
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Handle date fields
        if (sortField === 'deliveryDate' && aValue && bValue) {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        // Handle missing values
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        // Perform comparison
        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      })
    : []; // Return empty array if deliveries is not an array

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FiChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">All Deliveries</h1>
        </div>
        
        <button
          onClick={handleAddNewDelivery}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          New Delivery
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Delivery Failed">Delivery Failed</option>
              </select>
            </div>
            
            <button
              onClick={fetchDeliveries}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-md"
              title="Refresh deliveries"
            >
              <FiRefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          {filteredDeliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiTruck size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No deliveries found</h3>
              <p className="text-gray-500 mb-4">
                {statusFilter !== 'all' || searchQuery 
                  ? "Try adjusting your search or filter criteria" 
                  : "No deliveries have been created yet"}
              </p>
              <button
                onClick={handleAddNewDelivery}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <FiPlus className="mr-2" />
                Create New Delivery
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('orderId')}
                      >
                        <div className="flex items-center">
                          Order ID
                          {sortField === 'orderId' && (
                            sortDirection === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('deliveryStatus')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortField === 'deliveryStatus' && (
                            sortDirection === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('deliveryDate')}
                      >
                        <div className="flex items-center">
                          Delivery Date
                          {sortField === 'deliveryDate' && (
                            sortDirection === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDeliveries.map((delivery) => (
                      <tr key={delivery._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{delivery.orderId}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{delivery.customerName}</div>
                          <div className="text-sm text-gray-500">{delivery.phone}</div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">{delivery.address}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(delivery.deliveryStatus)}`}>
                            {delivery.deliveryStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {delivery.driver ? (
                            <span className="font-medium text-gray-700">{delivery.driver.name}</span>
                          ) : (
                            <button
                              onClick={() => handleAssignDriver(delivery.orderId)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Assign Driver
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(delivery.deliveryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{delivery.paymentMethod}</div>
                          {delivery.paymentMethod === 'Cash On Delivery' && (
                            <div className="mt-1 text-xs">
                              {delivery.codPaid ? (
                                <span className="text-green-600">Paid (${delivery.amountReceived})</span>
                              ) : (
                                <span className="text-yellow-600">Payment Pending</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleViewDetails(delivery._id)} 
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FiEye size={18} />
                          </button>
                          {delivery.deliveryStatus === 'Pending' && (
                            <>
                              <button 
                                onClick={() => navigate(`/add-delivery?edit=${delivery._id}`)} 
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Delivery"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteDelivery(delivery._id)} 
                                className="text-red-600 hover:text-red-900"
                                title="Delete Delivery"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewAllDeliveries;
