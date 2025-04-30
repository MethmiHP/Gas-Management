import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeliveryPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    driver: '',
    customerName: '',
    address: '',
    phone: '',
    deliveryDate: '',
    paymentMethod: 'Prepaid'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentDeliveryId, setCurrentDeliveryId] = useState(null);
  const [trackingData, setTrackingData] = useState({ orderId: '', phone: '' });
  const [trackingResult, setTrackingResult] = useState(null);

  // Fetch all deliveries and drivers when component mounts
  useEffect(() => {
    fetchDeliveries();
    fetchDrivers();
  }, []);

 

  // Fetch all deliveries
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/deliveries');
      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all drivers for dropdown
  const fetchDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/drivers');
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to fetch drivers');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tracking form input
  const handleTrackingChange = (e) => {
    const { name, value } = e.target;
    setTrackingData(prev => ({ ...prev, [name]: value }));
  };

  // Track an order
  const trackOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:5000/deliveries/track-order?orderId=${trackingData.orderId}&phone=${trackingData.phone}`
      );
      setTrackingResult(response.data.order);
      toast.success('Order found!');
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Order not found or tracking failed');
      setTrackingResult(null);
    }
  };

  // Add a new delivery
  const addDelivery = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/deliveries', formData);
      toast.success('Delivery added successfully!');
      setDeliveries([...deliveries, response.data.delivery]);
      resetForm();
    } catch (error) {
      console.error('Error adding delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to add delivery');
    }
  };

  // Update a delivery
  const updateDelivery = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/deliveries/${currentDeliveryId}`, formData);
      toast.success('Delivery updated successfully!');
      setDeliveries(deliveries.map(delivery => 
        delivery._id === currentDeliveryId ? response.data.delivery : delivery
      ));
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to update delivery');
    }
  };

  // Delete a delivery
  const deleteDelivery = async (id) => {
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

  // Set form data for editing
  const editDelivery = (delivery) => {
    setFormData({
      orderId: delivery.orderId,
      driver: delivery.driver?._id || '',
      customerName: delivery.customerName,
      address: delivery.address,
      phone: delivery.phone,
      deliveryDate: new Date(delivery.deliveryDate).toISOString().split('T')[0],
      paymentMethod: delivery.paymentMethod
    });
    setCurrentDeliveryId(delivery._id);
    setIsEditing(true);
  };

  // Assign a driver to a delivery
  const assignDriver = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:5000/deliveries/${orderId}/assign-driver`, {});
      toast.success(response.data.message);
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error(error.response?.data?.message || 'Failed to assign driver');
    }
  };

  // Update delivery status
  const updateStatus = async (orderId, deliveryStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/deliveries/${orderId}/status`, { deliveryStatus });
      toast.success('Status updated successfully!');
      setDeliveries(deliveries.map(delivery => 
        delivery.orderId === orderId ? { ...delivery, deliveryStatus } : delivery
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle COD payment
  const handleCODPayment = async (orderId) => {
    const amount = prompt('Enter the amount received:');
    if (!amount) return;
    
    try {
      const response = await axios.put(`http://localhost:5000/deliveries/${orderId}/cod`, { 
        amountReceived: parseFloat(amount) 
      });
      toast.success('COD payment recorded successfully!');
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      console.error('Error handling COD payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      orderId: '',
      driver: '',
      customerName: '',
      address: '',
      phone: '',
      deliveryDate: '',
      paymentMethod: 'Prepaid'
    });
    setCurrentDeliveryId(null);
    setIsEditing(false);
  };

  // Status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-200 text-yellow-800';
      case 'Assigned': return 'bg-blue-200 text-blue-800';
      case 'Out For Delivery': return 'bg-purple-200 text-purple-800';
      case 'Delivered': return 'bg-green-200 text-green-800';
      case 'Delivery Failed': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Delivery Management</h1>
      
      {/* Tracking Section */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Track Delivery</h2>
        <form onSubmit={trackOrder} className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            name="orderId"
            value={trackingData.orderId}
            onChange={handleTrackingChange}
            placeholder="Order ID"
            className="rounded-md border-gray-300 shadow-sm px-4 py-2 flex-1"
            required
          />
          <input
            type="text"
            name="phone"
            value={trackingData.phone}
            onChange={handleTrackingChange}
            placeholder="Phone Number"
            className="rounded-md border-gray-300 shadow-sm px-4 py-2 flex-1"
            required
          />
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
          >
            Track Order
          </button>
        </form>
        
        {trackingResult && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Tracking Result:</h3>
            <p><span className="font-medium">Order ID:</span> {trackingResult.orderId}</p>
            <p><span className="font-medium">Customer:</span> {trackingResult.customerName}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`${getStatusBadgeColor(trackingResult.deliveryStatus)} px-2 py-1 rounded-full text-sm ml-2`}>
                {trackingResult.deliveryStatus}
              </span>
            </p>
            <p><span className="font-medium">Delivery Date:</span> {new Date(trackingResult.deliveryDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Driver:</span> {trackingResult.driver?.name || 'Not assigned'}</p>
            <p><span className="font-medium">Payment Method:</span> {trackingResult.paymentMethod}</p>
            {trackingResult.paymentMethod === 'Cash On Delivery' && (
              <p><span className="font-medium">Payment Status:</span> {trackingResult.codPaid ? 'Paid' : 'Pending'}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Add/Edit Delivery Form */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Delivery' : 'Add New Delivery'}</h2>
        <form onSubmit={isEditing ? updateDelivery : addDelivery} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              placeholder="Order ID"
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              required
              disabled={isEditing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              name="driver"
              value={formData.driver}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} ({driver.availability ? 'Available' : 'Busy'})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Customer Name"
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Delivery Address"
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              rows="2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              required
            >
              <option value="Prepaid">Prepaid</option>
              <option value="Cash On Delivery">Cash On Delivery</option>
            </select>
          </div>
          
          <div className="md:col-span-2 flex gap-2 justify-end mt-4">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition"
            >
              {isEditing ? 'Update Delivery' : 'Add Delivery'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Deliveries Table */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">All Deliveries</h2>
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : deliveries.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{delivery.orderId}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{delivery.customerName}</div>
                    <div className="text-sm text-gray-500">{delivery.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {delivery.driver ? (
                      <span>{delivery.driver.name}</span>
                    ) : (
                      <button
                        onClick={() => assignDriver(delivery.orderId)}
                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition"
                      >
                        Assign Driver
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={delivery.deliveryStatus}
                      onChange={(e) => updateStatus(delivery.orderId, e.target.value)}
                      className={`${getStatusBadgeColor(delivery.deliveryStatus)} px-2 py-1 rounded-full text-sm`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Delivery Failed">Delivery Failed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(delivery.deliveryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div>{delivery.paymentMethod}</div>
                    {delivery.paymentMethod === 'Cash On Delivery' && (
                      <div className="mt-1">
                        {delivery.codPaid ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            Paid (LKR{delivery.amountReceived})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCODPayment(delivery.orderId)}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full text-xs transition"
                          >
                            Record Payment
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editDelivery(delivery)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                       <button
      onClick={() => navigate(`/delivery/${delivery._id}`)}
      className="text-indigo-600 hover:text-indigo-900"
    >
      View
    </button>
         
                      <button
                        onClick={() => deleteDelivery(delivery._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-4 text-gray-500">No deliveries found</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;