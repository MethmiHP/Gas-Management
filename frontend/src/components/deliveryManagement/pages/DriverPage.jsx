import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DriverPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driverDeliveries, setDriverDeliveries] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [licenseInputs, setLicenseInputs] = useState({});
  const [isFetchingDeliveries, setIsFetchingDeliveries] = useState(false);
  const [addingDriverId, setAddingDriverId] = useState(null);

  useEffect(() => {
    fetchDrivers();
    fetchAllRegisteredDrivers();
  }, []);

  const fetchAllRegisteredDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/alldriver');
      setAllDrivers(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching registered drivers:', error);
      toast.error('Failed to fetch registered drivers');
    }
  };

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

  const fetchDriverDeliveries = async (driverId) => {
    setIsFetchingDeliveries(true);
    try {
      const response = await axios.get(`http://localhost:5000/deliveries/driver/${driverId}`);
      setDriverDeliveries(response.data.deliveries || []);
      setSelectedDriverId(driverId);
    } catch (error) {
      console.error('Error fetching driver deliveries:', error);
      toast.error('Failed to fetch deliveries for this driver');
    } finally {
      setIsFetchingDeliveries(false);
    }
  };

  const handleLicenseInputChange = (driverId, value) => {
    setLicenseInputs((prev) => ({
      ...prev,
      [driverId]: value
    }));
  };

  const handleAddDriver = async (driver) => {
    const licenseNumber = licenseInputs[driver._id];
    if (!licenseNumber) {
      toast.error('Please enter a license number');
      return;
    }

    const alreadyExists = drivers.some(d => d.email === driver.email);
    if (alreadyExists) {
      toast.warning('Driver already exists');
      setLicenseInputs((prev) => ({ ...prev, [driver._id]: '' }));
      return;
    }

    setAddingDriverId(driver._id);
    try {
      const response = await axios.post('http://localhost:5000/drivers', {
        name: driver.username,
        email: driver.email,
        licenseNumber,
        availability: true
      });

      toast.success('Driver added successfully');
      setDrivers((prev) => [...prev, response.data.driver]);
      setLicenseInputs((prev) => ({ ...prev, [driver._id]: '' }));
    } catch (error) {
      console.error('Error adding driver:', error);
      toast.error(error.response?.data?.message || 'Failed to add driver');
    } finally {
      setAddingDriverId(null);
    }
  };

  const deleteDriver = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      await axios.delete(`http://localhost:5000/drivers/${id}`);
      setDrivers(drivers.filter(driver => driver._id !== id));
      toast.success('Driver deleted successfully');

      if (selectedDriverId === id) {
        setSelectedDriverId(null);
        setDriverDeliveries([]);
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error(error.response?.data?.message || 'Failed to delete driver');
    }
  };

  const toggleAvailability = async (driver) => {
    try {
      const response = await axios.put(`http://localhost:5000/drivers/${driver._id}`, {
        ...driver,
        availability: !driver.availability
      });

      setDrivers(drivers.map(d =>
        d._id === driver._id ? response.data.driver : d
      ));

      toast.success(`Driver marked as ${response.data.driver.availability ? 'Available' : 'Unavailable'}`);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
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

  {/* License Assignment */}
  <div className="bg-white p-6 rounded-lg shadow-md mb-10">
    <h2 className="text-xl font-semibold mb-4">Assign License Numbers</h2>

  <div className="space-y-4">
    {allDrivers
      .filter(driver =>
        !drivers.some(existing => existing.email === driver.email) && !driver.licenseNumber // Skip if already added or already has license
      )
      .map(driver => {
        const driverKey = driver._id || driver.id;
        return (
          <div key={driverKey} className="border p-4 rounded-md shadow-sm">
            <p className="font-medium">{driver.username}</p>
            <input
              type="text"
              placeholder="Enter License Number"
              value={licenseInputs[driverKey] || ''}
              onChange={(e) => handleLicenseInputChange(driverKey, e.target.value)}
              className="w-full mt-2 rounded-md border px-4 py-2"
            />
            <button
              onClick={() => handleAddDriver({ ...driver, _id: driverKey })}
              disabled={addingDriverId === driverKey}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md disabled:opacity-50"
            >
              {addingDriverId === driverKey ? 'Adding...' : 'Add'}
            </button>
          </div>
        );
      })}
  </div>
</div>


      {/* Driver Table */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto mb-10">
        <h2 className="text-xl font-semibold mb-4">All Drivers</h2>
        {loading ? (
          <p>Loading...</p>
        ) : drivers.length === 0 ? (
          <p>No drivers found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Contact</th>
                <th className="px-6 py-3 text-left">License</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Deliveries</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map(driver => (
                <tr key={driver._id}>
                  <td className="px-6 py-4">{driver.name}</td>
                  <td className="px-6 py-4">
                    <div>{driver.email}</div>
                    <div className="text-sm text-gray-500">{driver.phone}</div>
                  </td>
                  <td className="px-6 py-4">{driver.licenseNumber}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAvailability(driver)}
                      className={`${
                        driver.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      } px-3 py-1 rounded-full text-sm font-medium transition`}
                    >
                      {driver.availability ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span>{driver.completedDeliveries || 0}</span>{' '}
                    <button
                      onClick={() => fetchDriverDeliveries(driver._id)}
                      className="text-blue-600 text-sm ml-2"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteDriver(driver._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Deliveries View */}
      {selectedDriverId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
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

          {isFetchingDeliveries ? (
            <p>Loading deliveries...</p>
          ) : driverDeliveries.length === 0 ? (
            <p>No deliveries found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {driverDeliveries.map((delivery) => (
                  <tr key={delivery._id}>
                    <td className="px-6 py-4">{delivery.orderId}</td>
                    <td className="px-6 py-4">
                      <div>{delivery.customerName}</div>
                      <div className="text-sm text-gray-500">{delivery.phone}</div>
                      <div className="text-xs">{delivery.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${getStatusBadgeColor(delivery.deliveryStatus)} px-2 py-1 rounded-full text-sm`}>
                        {delivery.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(delivery.deliveryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div>{delivery.paymentMethod}</div>
                      {delivery.paymentMethod === 'Cash On Delivery' && (
                        <div className="text-sm mt-1">
                          {delivery.codPaid ? (
                            <span className="text-green-600">Paid (${delivery.amountReceived})</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverPage;
