import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DriverPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    availability: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [driverDeliveries, setDriverDeliveries] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // Fetch all drivers when component mounts
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Fetch all drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/drivers');
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch deliveries for a specific driver
  const fetchDriverDeliveries = async (driverId) => {
    try {
      const response = await axios.get(`http://localhost:5000/deliveries/driver/${driverId}`);
      setDriverDeliveries(response.data.deliveries || []);
      setSelectedDriverId(driverId);
    } catch (error) {
      console.error('Error fetching driver deliveries:', error);
      toast.error('Failed to fetch deliveries for this driver');
      setDriverDeliveries([]);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add a new driver
  const addDriver = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/drivers', formData);
      toast.success('Driver added successfully!');
      setDrivers([...drivers, response.data.driver]);
      resetForm();
    } catch (error) {
      console.error('Error adding driver:', error);
      toast.error(error.response?.data?.message || 'Failed to add driver');
    }
  };

  // Update a driver
  const updateDriver = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/drivers/${currentDriverId}`, formData);
      toast.success('Driver updated successfully!');
      setDrivers(drivers.map(driver => 
        driver._id === currentDriverId ? response.data.driver : driver
      ));
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error(error.response?.data?.message || 'Failed to update driver');
    }
  };

  // Delete a driver
  const deleteDriver = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await axios.delete(`http://localhost:5000/drivers/${id}`);
        toast.success('Driver deleted successfully!');
        setDrivers(drivers.filter(driver => driver._id !== id));
        if (selectedDriverId === id) {
          setSelectedDriverId(null);
          setDriverDeliveries([]);
        }
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast.error(error.response?.data?.message || 'Failed to delete driver');
      }
    }
  };

  // Toggle driver availability
  const toggleAvailability = async (driver) => {
    try {
      const newAvailability = !driver.availability;
      const response = await axios.put(`http://localhost:5000/drivers/${driver._id}`, {
        ...driver,
        availability: newAvailability
      });
      toast.success(`Driver marked as ${newAvailability ? 'available' : 'unavailable'}`);
      setDrivers(drivers.map(d => 
        d._id === driver._id ? response.data.driver : d
      ));
    } catch (error) {
      console.error('Error updating driver availability:', error);
      toast.error('Failed to update driver availability');
    }
  };

  // Set form data for editing
  const editDriver = (driver) => {
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      availability: driver.availability
    });
    setCurrentDriverId(driver._id);
    setIsEditing(true);
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      availability: true
    });
    setCurrentDriverId(null);
    setIsEditing(false);
  };

  // Get status badge color
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
      <h1 className="text-3xl font-bold text-center mb-8">Driver Management</h1>
      
      {/* Add/Edit Driver Form */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Driver' : 'Add New Driver'}</h2>
        <form onSubmit={isEditing ? updateDriver : addDriver} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Driver Name"
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="License Number"
              className="w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Available for deliveries</span>
            </label>
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
              {isEditing ? 'Update Driver' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Drivers Table */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">All Drivers</h2>
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : drivers.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {driver.name}
                  </td>
                  <td className="px-6 py-4">
                    <div>{driver.email}</div>
                    <div className="text-sm text-gray-500">{driver.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {driver.licenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(driver)}
                      className={`${
                        driver.availability
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } px-3 py-1 rounded-full text-sm font-medium transition`}
                    >
                      {driver.availability ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{driver.completedDeliveries}</span>
                      <button
                        onClick={() => fetchDriverDeliveries(driver._id)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editDriver(driver)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDriver(driver._id)}
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
          <p className="text-center py-4 text-gray-500">No drivers found</p>
        )}
      </div>
      
      {/* Driver Deliveries */}
      {selectedDriverId && (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Deliveries for {drivers.find(d => d._id === selectedDriverId)?.name || 'Driver'}
            </h2>
            <button
              onClick={() => {
                setSelectedDriverId(null);
                setDriverDeliveries([]);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          
          {driverDeliveries.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driverDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{delivery.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{delivery.customerName}</div>
                      <div className="text-sm text-gray-500">{delivery.phone}</div>
                      <div className="text-xs text-gray-500 mt-1">{delivery.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusBadgeColor(delivery.deliveryStatus)} px-2 py-1 rounded-full text-sm`}>
                        {delivery.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(delivery.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{delivery.paymentMethod}</div>
                      {delivery.paymentMethod === 'Cash On Delivery' && (
                        <div className="mt-1 text-sm">
                          {delivery.codPaid ? (
                            <span className="text-green-600">Paid (${delivery.amountReceived})</span>
                          ) : (
                            <span className="text-yellow-600">Payment Pending</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-4 text-gray-500">No deliveries found for this driver</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverPage;