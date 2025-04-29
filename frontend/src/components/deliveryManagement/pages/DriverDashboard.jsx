// // src/components/deliveryManagement/pages/DriverDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const DriverDashboard = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [codAmount, setCodAmount] = useState('');
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [activeTab, setActiveTab] = useState('active');
//   const [driverInfo, setDriverInfo] = useState(null);
  
//   // New states for driver selection
//   const [availableDrivers, setAvailableDrivers] = useState([]);
//   const [driverId, setDriverId] = useState(null);
//   const [showDriverSelector, setShowDriverSelector] = useState(false);

//   // Define base URL
//   const API_BASE_URL = 'http://localhost:5000';

//   // On first load, check if we have a stored driver ID
//   useEffect(() => {
//     const storedDriverId = localStorage.getItem('selectedDriverId');
//     if (storedDriverId) {
//       setDriverId(storedDriverId);
//     } else {
//       // If no stored driver, fetch available drivers and show selector
//       fetchAvailableDrivers();
//       setShowDriverSelector(true);
//     }
//   }, []);

//   // Fetch all available drivers
//   const fetchAvailableDrivers = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/drivers`);
//       if (response.data?.drivers && Array.isArray(response.data.drivers)) {
//         setAvailableDrivers(response.data.drivers);
//         if (response.data.drivers.length === 0) {
//           setError("No drivers available in the system. Please add a driver first.");
//         }
//       } else {
//         setError("Couldn't retrieve driver list. Unexpected data format.");
//       }
//     } catch (err) {
//       console.error('Error fetching drivers:', err);
//       setError('Failed to load available drivers. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // When driver ID changes, fetch that driver's data
//   useEffect(() => {
//     if (driverId) {
//       fetchDriverData();
//     }
//   }, [driverId]);

//   const fetchDriverData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log(`Fetching driver data for ID: ${driverId}`);
      
//       // Fetch driver information
//       const driverResponse = await axios.get(`${API_BASE_URL}/drivers/${driverId}`);
//       console.log('Driver API Response:', driverResponse.data);
      
//       // Safely set driver info
//       if (driverResponse.data?.driver) {
//         setDriverInfo(driverResponse.data.driver);
//         // Save the selected driver ID
//         localStorage.setItem('selectedDriverId', driverId);
//       } else {
//         console.warn('Driver data not in expected format:', driverResponse.data);
//         setDriverInfo(null);
//         setError("Couldn't retrieve driver information. Try selecting a different driver.");
//       }
      
//       // Fetch all deliveries for this driver
//       const deliveriesResponse = await axios.get(`${API_BASE_URL}/deliveries/driver/${driverId}`);
//       console.log('Deliveries API Response:', deliveriesResponse.data);
      
//       // Safely handle different response formats
//       if (Array.isArray(deliveriesResponse.data)) {
//         setDeliveries(deliveriesResponse.data);
//       } else if (deliveriesResponse.data?.deliveries && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else if (deliveriesResponse.data?.success && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else {
//         console.warn('Deliveries not in expected format:', deliveriesResponse.data);
//         setDeliveries([]); 
//       }
//     } catch (err) {
//       console.error('Error details:', err.response || err);
//       if (err.response?.status === 404) {
//         setError(`Driver with ID ${driverId} not found. Please select a different driver.`);
//       } else {
//         setError('Failed to fetch data. Please try again later.');
//       }
//       setDeliveries([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle driver selection
//   const handleSelectDriver = (id) => {
//     setDriverId(id);
//     setShowDriverSelector(false);
//   };

//   // Clear selected driver and show selector again
//   const handleChangeDriver = () => {
//     localStorage.removeItem('selectedDriverId');
//     setDriverId(null);
//     setDriverInfo(null);
//     setDeliveries([]);
//     fetchAvailableDrivers();
//     setShowDriverSelector(true);
//   };

//   const updateDeliveryStatus = async (orderId, status) => {
//     try {
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${orderId}/status`, {
//         deliveryStatus: status
//       });
      
//       console.log('Update status response:', response.data);
      
//       if (response.data?.success) {
//         toast.success(`Delivery status updated to ${status}`);
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === orderId ? { ...delivery, deliveryStatus: status } : delivery
//         ));
        
//         // If delivery is marked as delivered, show COD payment form if applicable
//         if (status === 'Delivered') {
//           const delivery = deliveries.find(d => d.orderId === orderId);
//           if (delivery && delivery.paymentMethod === 'Cash On Delivery' && !delivery.codPaid) {
//             setSelectedDelivery(delivery);
//           }
//         }
//       }
//     } catch (err) {
//       console.error('Error updating delivery status:', err.response || err);
//       toast.error('Failed to update delivery status');
//     }
//   };

//   const handleCODPayment = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/cod`, {
//         amountReceived: parseFloat(codAmount)
//       });
      
//       console.log('COD payment response:', response.data);
      
//       if (response.data?.success) {
//         toast.success('Payment recorded successfully');
        
//         // Update the local state
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === selectedDelivery.orderId ? 
//             { ...delivery, codPaid: true, amountReceived: parseFloat(codAmount) } : 
//             delivery
//         ));
        
//         // Reset the form
//         setCodAmount('');
//         setSelectedDelivery(null);
//       }
//     } catch (err) {
//       console.error('Error processing COD payment:', err.response || err);
//       toast.error('Failed to process COD payment');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Show driver selector if needed
//   if (showDriverSelector) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <h1 className="text-2xl font-bold mb-4 text-gray-800">Driver Selection</h1>
          
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <p>{error}</p>
//             </div>
//           )}
          
//           {availableDrivers.length > 0 ? (
//             <div>
//               <p className="mb-4">Please select a driver to continue:</p>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {availableDrivers.map(driver => (
//                   <button
//                     key={driver._id}
//                     onClick={() => handleSelectDriver(driver._id)}
//                     className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
//                   >
//                     <h3 className="font-medium text-lg text-gray-800">{driver.name}</h3>
//                     <p className="text-gray-600">{driver.email}</p>
//                     <p className="text-sm text-gray-500">License: {driver.licenseNumber}</p>
//                     <p className="mt-2 text-xs font-medium text-blue-600">
//                       {driver.availability ? 'Available' : 'Unavailable'}
//                     </p>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : !error ? (
//             <p className="text-center py-4 text-gray-500">Loading drivers...</p>
//           ) : null}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//           <button 
//             onClick={handleChangeDriver}
//             className="mt-3 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
//           >
//             Select Different Driver
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Safely filter deliveries with null checks
//   const pendingDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus !== 'Delivered' && delivery?.deliveryStatus !== 'Delivery Failed'
//     ) : [];
  
//   const completedDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus === 'Delivered' || delivery?.deliveryStatus === 'Delivery Failed'
//     ) : [];

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold mb-2 text-gray-800">Driver Dashboard</h1>
//             {driverInfo && (
//               <div>
//                 <p className="text-lg"><span className="font-medium">Name:</span> {driverInfo.name}</p>
//                 <p className="text-green-600 font-medium">
//                   Total Completed Deliveries: {driverInfo.completedDeliveries || 0}
//                 </p>
//               </div>
//             )}
//           </div>
          
//           <button 
//             onClick={handleChangeDriver}
//             className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
//           >
//             Change Driver
//           </button>
//         </div>
//       </div>
      
//       {/* Rest of the component remains the same */}
//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-200 mb-6">
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'active' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('active')}
//         >
//           Active Deliveries
//         </button>
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'completed' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('completed')}
//         >
//           Completed Deliveries
//         </button>
//       </div>
      
//       {/* Active Deliveries Section */}
//       {activeTab === 'active' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             Active Deliveries ({pendingDeliveries.length})
//           </h2>
          
//           {pendingDeliveries.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No active deliveries at the moment.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {pendingDeliveries.map(delivery => (
//                 <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
//                   <div className="flex justify-between items-start mb-4">
//                     <h3 className="font-bold">Order #{delivery.orderId}</h3>
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       delivery.deliveryStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                       delivery.deliveryStatus === 'Assigned' ? 'bg-purple-100 text-purple-800' :
//                       'bg-blue-100 text-blue-800'
//                     }`}>
//                       {delivery.deliveryStatus}
//                     </span>
//                   </div>
                  
//                   <div className="space-y-2 mb-4">
//                     <p><span className="font-medium">Customer:</span> {delivery.customerName}</p>
//                     <p><span className="font-medium">Address:</span> {delivery.address}</p>
//                     <p><span className="font-medium">Phone:</span> {delivery.phone}</p>
//                     <p><span className="font-medium">Delivery Date:</span> {formatDate(delivery.deliveryDate)}</p>
//                     <p><span className="font-medium">Payment:</span> {delivery.paymentMethod}</p>
//                   </div>
                  
//                   <div className="flex flex-wrap gap-2 mt-4">
//                     {delivery.deliveryStatus === 'Assigned' && (
//                       <button 
//                         onClick={() => updateDeliveryStatus(delivery.orderId, 'Out For Delivery')}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Start Delivery
//                       </button>
//                     )}
                    
//                     {delivery.deliveryStatus === 'Out For Delivery' && (
//                       <>
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivered')}
//                           className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
//                         >
//                           Mark Delivered
//                         </button>
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivery Failed')}
//                           className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
//                         >
//                           Mark Failed
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
          
//           {/* COD Payment Modal */}
//           {selectedDelivery && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//                 <h3 className="text-lg font-bold mb-4">Cash on Delivery Payment</h3>
//                 <p className="mb-4">Please enter the amount received from customer for Order #{selectedDelivery.orderId}</p>
                
//                 <form onSubmit={handleCODPayment}>
//                   <div className="mb-4">
//                     <label htmlFor="codAmount" className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount Received
//                     </label>
//                     <input
//                       type="number"
//                       id="codAmount"
//                       value={codAmount}
//                       onChange={(e) => setCodAmount(e.target.value)}
//                       className="w-full p-2 border border-gray-300 rounded"
//                       step="0.01"
//                       min="0"
//                       required
//                     />
//                   </div>
                  
//                   <div className="flex justify-end gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setSelectedDelivery(null)}
//                       className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
//                     >
//                       Confirm Payment
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Completed Deliveries Section */}
//       {activeTab === 'completed' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             Completed Deliveries ({completedDeliveries.length})
//           </h2>
          
//           {completedDeliveries.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No completed deliveries yet.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="py-3 px-4 text-left">Order ID</th>
//                     <th className="py-3 px-4 text-left">Customer</th>
//                     <th className="py-3 px-4 text-left">Address</th>
//                     <th className="py-3 px-4 text-left">Status</th>
//                     <th className="py-3 px-4 text-left">Payment</th>
//                     <th className="py-3 px-4 text-left">Delivery Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {completedDeliveries.map(delivery => (
//                     <tr key={delivery._id} className="hover:bg-gray-50">
//                       <td className="py-3 px-4">{delivery.orderId}</td>
//                       <td className="py-3 px-4">{delivery.customerName}</td>
//                       <td className="py-3 px-4">
//                         <span className="truncate block max-w-xs">{delivery.address}</span>
//                       </td>
//                       <td className="py-3 px-4">
//                         <span className={`px-2 py-1 text-xs rounded-full ${
//                           delivery.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {delivery.deliveryStatus}
//                         </span>
//                       </td>
//                       <td className="py-3 px-4">
//                         {delivery.paymentMethod}
//                         {delivery.paymentMethod === 'Cash On Delivery' && (
//                           <span className={`ml-2 text-xs ${delivery.codPaid ? 'text-green-600' : 'text-red-600'}`}>
//                             {delivery.codPaid ? `(Paid: $${delivery.amountReceived})` : '(Unpaid)'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4">{formatDate(delivery.deliveredAt || delivery.deliveryDate)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverDashboard;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const DriverDashboard = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [codAmount, setCodAmount] = useState('');
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [activeTab, setActiveTab] = useState('active');
//   const [driverInfo, setDriverInfo] = useState(null);
//   const [emptyCollected, setEmptyCollected] = useState(false);
  
//   // States for driver selection
//   const [availableDrivers, setAvailableDrivers] = useState([]);
//   const [driverId, setDriverId] = useState(null);
//   const [showDriverSelector, setShowDriverSelector] = useState(false);

//   // Define base URL
//   const API_BASE_URL = 'http://localhost:5000';

//   // On first load, check if we have a stored driver ID
//   useEffect(() => {
//     const storedDriverId = localStorage.getItem('selectedDriverId');
//     if (storedDriverId) {
//       setDriverId(storedDriverId);
//     } else {
//       // If no stored driver, fetch available drivers and show selector
//       fetchAvailableDrivers();
//       setShowDriverSelector(true);
//     }
//   }, []);

//   // Fetch all available drivers
//   const fetchAvailableDrivers = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/drivers`);
//       if (response.data?.drivers && Array.isArray(response.data.drivers)) {
//         setAvailableDrivers(response.data.drivers);
//         if (response.data.drivers.length === 0) {
//           setError("No drivers available in the system. Please add a driver first.");
//         }
//       } else {
//         setError("Couldn't retrieve driver list. Unexpected data format.");
//       }
//     } catch (err) {
//       console.error('Error fetching drivers:', err);
//       setError('Failed to load available drivers. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // When driver ID changes, fetch that driver's data
//   useEffect(() => {
//     if (driverId) {
//       fetchDriverData();
//     }
//   }, [driverId]);

//   const fetchDriverData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log(`Fetching driver data for ID: ${driverId}`);
      
//       // Fetch driver information
//       const driverResponse = await axios.get(`${API_BASE_URL}/drivers/${driverId}`);
//       console.log('Driver API Response:', driverResponse.data);
      
//       // Safely set driver info
//       if (driverResponse.data?.driver) {
//         setDriverInfo(driverResponse.data.driver);
//         // Save the selected driver ID
//         localStorage.setItem('selectedDriverId', driverId);
//       } else {
//         console.warn('Driver data not in expected format:', driverResponse.data);
//         setDriverInfo(null);
//         setError("Couldn't retrieve driver information. Try selecting a different driver.");
//       }
      
//       // Fetch all deliveries for this driver
//       const deliveriesResponse = await axios.get(`${API_BASE_URL}/deliveries/driver/${driverId}`);
//       console.log('Deliveries API Response:', deliveriesResponse.data);
      
//       // Safely handle different response formats
//       if (Array.isArray(deliveriesResponse.data)) {
//         setDeliveries(deliveriesResponse.data);
//       } else if (deliveriesResponse.data?.deliveries && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else if (deliveriesResponse.data?.success && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else {
//         console.warn('Deliveries not in expected format:', deliveriesResponse.data);
//         setDeliveries([]); 
//       }
//     } catch (err) {
//       console.error('Error details:', err.response || err);
//       if (err.response?.status === 404) {
//         setError(`Driver with ID ${driverId} not found. Please select a different driver.`);
//       } else {
//         setError('Failed to fetch data. Please try again later.');
//       }
//       setDeliveries([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle driver selection
//   const handleSelectDriver = (id) => {
//     setDriverId(id);
//     setShowDriverSelector(false);
//   };

//   // Clear selected driver and show selector again
//   const handleChangeDriver = () => {
//     localStorage.removeItem('selectedDriverId');
//     setDriverId(null);
//     setDriverInfo(null);
//     setDeliveries([]);
//     fetchAvailableDrivers();
//     setShowDriverSelector(true);
//   };

//   const updateDeliveryStatus = async (orderId, status) => {
//     try {
//       // If status is Delivered, show the collection modal instead of immediately updating
//       if (status === 'Delivered') {
//         const delivery = deliveries.find(d => d.orderId === orderId);
//         setSelectedDelivery(delivery);
//         return;
//       }
      
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${orderId}/status`, {
//         deliveryStatus: status
//       });
      
//       console.log('Update status response:', response.data);
      
//       if (response.data?.success) {
//         toast.success(`Delivery status updated to ${status}`);
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === orderId ? { ...delivery, deliveryStatus: status } : delivery
//         ));
//       }
//     } catch (err) {
//       console.error('Error updating delivery status:', err.response || err);
//       toast.error('Failed to update delivery status');
//     }
//   };

//   const completeDelivery = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       // Mark as delivered and update empty cylinder collection status
//       const statusResponse = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/status`, {
//         deliveryStatus: 'Delivered',
//         emptyCollected: emptyCollected
//       });
      
//       console.log('Delivery completion response:', statusResponse.data);
      
//       if (statusResponse.data?.success) {
//         toast.success('Delivery marked as complete');
        
//         // If this is a COD delivery and needs payment collection
//         if (selectedDelivery.paymentMethod === 'Cash On Delivery' && !selectedDelivery.codPaid) {
//           // Keep the modal open for payment collection
//           // The status is already updated to Delivered, so we'll proceed with payment
//         } else {
//           // Otherwise, just update the state and close the modal
//           setDeliveries(deliveries.map(delivery => 
//             delivery.orderId === selectedDelivery.orderId ? 
//               { ...delivery, deliveryStatus: 'Delivered', emptyCollected } : 
//               delivery
//           ));
          
//           setEmptyCollected(false);
//           setSelectedDelivery(null);
//         }
//       }
//     } catch (err) {
//       console.error('Error completing delivery:', err.response || err);
//       toast.error('Failed to complete delivery');
//     }
//   };

//   const handleCODPayment = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/cod`, {
//         amountReceived: parseFloat(codAmount),
//         emptyCollected: emptyCollected
//       });
      
//       console.log('COD payment response:', response.data);
      
//       if (response.data?.success) {
//         toast.success('Payment recorded successfully');
        
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === selectedDelivery.orderId ? 
//             { 
//               ...delivery, 
//               codPaid: true, 
//               amountReceived: parseFloat(codAmount),
//               emptyCollected: emptyCollected,
//               deliveryStatus: 'Delivered'
//             } : 
//             delivery
//         ));
        
//         setCodAmount('');
//         setEmptyCollected(false);
//         setSelectedDelivery(null);
//       }
//     } catch (err) {
//       console.error('Error processing COD payment:', err.response || err);
//       toast.error('Failed to process COD payment');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Show driver selector if needed
//   if (showDriverSelector) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <h1 className="text-2xl font-bold mb-4 text-gray-800">Driver Selection</h1>
          
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <p>{error}</p>
//             </div>
//           )}
          
//           {availableDrivers.length > 0 ? (
//             <div>
//               <p className="mb-4">Please select a driver to continue:</p>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {availableDrivers.map(driver => (
//                   <button
//                     key={driver._id}
//                     onClick={() => handleSelectDriver(driver._id)}
//                     className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
//                   >
//                     <h3 className="font-medium text-lg text-gray-800">{driver.name}</h3>
//                     <p className="text-gray-600">{driver.email}</p>
//                     <p className="text-sm text-gray-500">License: {driver.licenseNumber}</p>
//                     <p className="mt-2 text-xs font-medium text-blue-600">
//                       {driver.availability ? 'Available' : 'Unavailable'}
//                     </p>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : !error ? (
//             <p className="text-center py-4 text-gray-500">Loading drivers...</p>
//           ) : null}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//           <button 
//             onClick={handleChangeDriver}
//             className="mt-3 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
//           >
//             Select Different Driver
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Safely filter deliveries with null checks
//   const pendingDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus !== 'Delivered' && delivery?.deliveryStatus !== 'Delivery Failed'
//     ) : [];
  
//   const completedDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus === 'Delivered' || delivery?.deliveryStatus === 'Delivery Failed'
//     ) : [];

//   // Determine if we're in COD payment mode (delivery already marked as delivered)
//   const isInCODMode = selectedDelivery && 
//     selectedDelivery.paymentMethod === 'Cash On Delivery' &&
//     !selectedDelivery.codPaid && 
//     selectedDelivery.deliveryStatus === 'Delivered';

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold mb-2 text-gray-800">Driver Dashboard</h1>
//             {driverInfo && (
//               <div>
//                 <p className="text-lg"><span className="font-medium">Name:</span> {driverInfo.name}</p>
//                 <p className="text-green-600 font-medium">
//                   Total Completed Deliveries: {driverInfo.completedDeliveries || 0}
//                 </p>
//               </div>
//             )}
//           </div>
          
//           <button 
//             onClick={handleChangeDriver}
//             className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
//           >
//             Change Driver
//           </button>
//         </div>
//       </div>
      
//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-200 mb-6">
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'active' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('active')}
//         >
//           Active Deliveries
//         </button>
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'completed' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('completed')}
//         >
//           Completed Deliveries
//         </button>
//       </div>
      
//       {/* Active Deliveries Section */}
//       {activeTab === 'active' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             Active Deliveries ({pendingDeliveries.length})
//           </h2>
          
//           {pendingDeliveries.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No active deliveries at the moment.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {pendingDeliveries.map(delivery => (
//                 <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
//                   <div className="flex justify-between items-start mb-4">
//                     <h3 className="font-bold">Order #{delivery.orderId}</h3>
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       delivery.deliveryStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                       delivery.deliveryStatus === 'Assigned' ? 'bg-purple-100 text-purple-800' :
//                       'bg-blue-100 text-blue-800'
//                     }`}>
//                       {delivery.deliveryStatus}
//                     </span>
//                   </div>
                  
//                   <div className="space-y-2 mb-4">
//                     <p><span className="font-medium">Customer:</span> {delivery.customerName}</p>
//                     <p><span className="font-medium">Address:</span> {delivery.address}</p>
//                     <p><span className="font-medium">Phone:</span> {delivery.phone}</p>
//                     <p><span className="font-medium">Delivery Date:</span> {formatDate(delivery.deliveryDate)}</p>
//                     <p><span className="font-medium">Payment:</span> {delivery.paymentMethod}</p>
//                   </div>
                  
//                   <div className="flex flex-wrap gap-2 mt-4">
//                     {delivery.deliveryStatus === 'Assigned' && (
//                       <button 
//                         onClick={() => updateDeliveryStatus(delivery.orderId, 'Out For Delivery')}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Start Delivery
//                       </button>
//                     )}
                    
//                     {delivery.deliveryStatus === 'Out For Delivery' && (
//                       <>
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivered')}
//                           className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
//                         >
//                           Mark Delivered
//                         </button>
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivery Failed')}
//                           className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
//                         >
//                           Mark Failed
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
          
//           {/* Delivery Completion / Empty Cylinder Collection Modal */}
//           {selectedDelivery && !isInCODMode && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//                 <h3 className="text-lg font-bold mb-4">Complete Delivery</h3>
//                 <p className="mb-4">Please confirm delivery completion for Order #{selectedDelivery.orderId}</p>
                
//                 <form onSubmit={completeDelivery}>
//                   <div className="mb-4">
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={emptyCollected}
//                         onChange={(e) => setEmptyCollected(e.target.checked)}
//                         className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
//                       />
//                       <span className="text-gray-700">Empty cylinders collected</span>
//                     </label>
//                   </div>
                  
//                   <div className="flex justify-end gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setSelectedDelivery(null)}
//                       className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
//                     >
//                       Confirm Delivery
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
          
//           {/* COD Payment Modal */}
//           {selectedDelivery && isInCODMode && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//                 <h3 className="text-lg font-bold mb-4">Cash on Delivery Payment</h3>
//                 <p className="mb-4">Please enter the amount received from customer for Order #{selectedDelivery.orderId}</p>
                
//                 <form onSubmit={handleCODPayment}>
//                   <div className="mb-4">
//                     <label htmlFor="codAmount" className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount Received
//                     </label>
//                     <input
//                       type="number"
//                       id="codAmount"
//                       value={codAmount}
//                       onChange={(e) => setCodAmount(e.target.value)}
//                       className="w-full p-2 border border-gray-300 rounded"
//                       step="0.01"
//                       min="0"
//                       required
//                     />
//                   </div>
                  
//                   <div className="mb-4">
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={emptyCollected}
//                         onChange={(e) => setEmptyCollected(e.target.checked)}
//                         className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
//                       />
//                       <span className="text-gray-700">Empty cylinders collected</span>
//                     </label>
//                   </div>
                  
//                   <div className="flex justify-end gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setSelectedDelivery(null)}
//                       className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
//                     >
//                       Confirm Payment
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Completed Deliveries Section */}
//       {activeTab === 'completed' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             Completed Deliveries ({completedDeliveries.length})
//           </h2>
          
//           {completedDeliveries.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No completed deliveries yet.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="py-3 px-4 text-left">Order ID</th>
//                     <th className="py-3 px-4 text-left">Customer</th>
//                     <th className="py-3 px-4 text-left">Address</th>
//                     <th className="py-3 px-4 text-left">Status</th>
//                     <th className="py-3 px-4 text-left">Payment</th>
//                     <th className="py-3 px-4 text-left">Empty Cylinders</th>
//                     <th className="py-3 px-4 text-left">Delivery Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {completedDeliveries.map(delivery => (
//                     <tr key={delivery._id} className="hover:bg-gray-50">
//                       <td className="py-3 px-4">{delivery.orderId}</td>
//                       <td className="py-3 px-4">{delivery.customerName}</td>
//                       <td className="py-3 px-4">
//                         <span className="truncate block max-w-xs">{delivery.address}</span>
//                       </td>
//                       <td className="py-3 px-4">
//                         <span className={`px-2 py-1 text-xs rounded-full ${
//                           delivery.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {delivery.deliveryStatus}
//                         </span>
//                       </td>
//                       <td className="py-3 px-4">
//                         {delivery.paymentMethod}
//                         {delivery.paymentMethod === 'Cash On Delivery' && (
//                           <span className={`ml-2 text-xs ${delivery.codPaid ? 'text-green-600' : 'text-red-600'}`}>
//                             {delivery.codPaid ? `(Paid: $${delivery.amountReceived})` : '(Unpaid)'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4">
//                         {delivery.emptyCollected ? (
//                           <span className="text-green-600">Collected</span>
//                         ) : (
//                           <span className="text-red-600">Not Collected</span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4">{formatDate(delivery.deliveredAt || delivery.deliveryDate)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverDashboard;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const DriverDashboard = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [codAmount, setCodAmount] = useState('');
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [activeTab, setActiveTab] = useState('active');
//   const [driverInfo, setDriverInfo] = useState(null);
//   const [emptyCollected, setEmptyCollected] = useState(false);
  
//   // States for driver selection
//   const [availableDrivers, setAvailableDrivers] = useState([]);
//   const [driverId, setDriverId] = useState(null);
//   const [showDriverSelector, setShowDriverSelector] = useState(false);
  
//   // New state to track which modal to show
//   const [modalType, setModalType] = useState(null); // 'delivery' or 'payment'

//   // Define base URL
//   const API_BASE_URL = 'http://localhost:5000';

//   // On first load, check if we have a stored driver ID
//   useEffect(() => {
//     const storedDriverId = localStorage.getItem('selectedDriverId');
//     if (storedDriverId) {
//       setDriverId(storedDriverId);
//     } else {
//       // If no stored driver, fetch available drivers and show selector
//       fetchAvailableDrivers();
//       setShowDriverSelector(true);
//     }
//   }, []);

//   // Fetch all available drivers
//   const fetchAvailableDrivers = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/drivers`);
//       if (response.data?.drivers && Array.isArray(response.data.drivers)) {
//         setAvailableDrivers(response.data.drivers);
//         if (response.data.drivers.length === 0) {
//           setError("No drivers available in the system. Please add a driver first.");
//         }
//       } else {
//         setError("Couldn't retrieve driver list. Unexpected data format.");
//       }
//     } catch (err) {
//       console.error('Error fetching drivers:', err);
//       setError('Failed to load available drivers. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // When driver ID changes, fetch that driver's data
//   useEffect(() => {
//     if (driverId) {
//       fetchDriverData();
//     }
//   }, [driverId]);

//   const fetchDriverData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log(`Fetching driver data for ID: ${driverId}`);
      
//       // Fetch driver information
//       const driverResponse = await axios.get(`${API_BASE_URL}/drivers/${driverId}`);
//       console.log('Driver API Response:', driverResponse.data);
      
//       // Safely set driver info
//       if (driverResponse.data?.driver) {
//         setDriverInfo(driverResponse.data.driver);
//         // Save the selected driver ID
//         localStorage.setItem('selectedDriverId', driverId);
//       } else {
//         console.warn('Driver data not in expected format:', driverResponse.data);
//         setDriverInfo(null);
//         setError("Couldn't retrieve driver information. Try selecting a different driver.");
//       }
      
//       // Fetch all deliveries for this driver
//       const deliveriesResponse = await axios.get(`${API_BASE_URL}/deliveries/driver/${driverId}`);
//       console.log('Deliveries API Response:', deliveriesResponse.data);
      
//       // Safely handle different response formats
//       if (Array.isArray(deliveriesResponse.data)) {
//         setDeliveries(deliveriesResponse.data);
//       } else if (deliveriesResponse.data?.deliveries && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else if (deliveriesResponse.data?.success && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else {
//         console.warn('Deliveries not in expected format:', deliveriesResponse.data);
//         setDeliveries([]); 
//       }
//     } catch (err) {
//       console.error('Error details:', err.response || err);
//       if (err.response?.status === 404) {
//         setError(`Driver with ID ${driverId} not found. Please select a different driver.`);
//       } else {
//         setError('Failed to fetch data. Please try again later.');
//       }
//       setDeliveries([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle driver selection
//   const handleSelectDriver = (id) => {
//     setDriverId(id);
//     setShowDriverSelector(false);
//   };

//   // Clear selected driver and show selector again
//   const handleChangeDriver = () => {
//     localStorage.removeItem('selectedDriverId');
//     setDriverId(null);
//     setDriverInfo(null);
//     setDeliveries([]);
//     fetchAvailableDrivers();
//     setShowDriverSelector(true);
//   };

//   const updateDeliveryStatus = async (orderId, status) => {
//     try {
//       // If status is Delivered, show the delivery completion modal first
//       if (status === 'Delivered') {
//         const delivery = deliveries.find(d => d.orderId === orderId);
//         setSelectedDelivery(delivery);
//         setModalType('delivery');
//         return;
//       }
      
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${orderId}/status`, {
//         deliveryStatus: status
//       });
      
//       console.log('Update status response:', response.data);
      
//       if (response.data?.success) {
//         toast.success(`Delivery status updated to ${status}`);
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === orderId ? { ...delivery, deliveryStatus: status } : delivery
//         ));
//       }
//     } catch (err) {
//       console.error('Error updating delivery status:', err.response || err);
//       toast.error('Failed to update delivery status');
//     }
//   };

//   const completeDelivery = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       // Mark as delivered and update empty cylinder collection status
//       const statusResponse = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/status`, {
//         deliveryStatus: 'Delivered',
//         emptyCollected: emptyCollected
//       });
      
//       console.log('Delivery completion response:', statusResponse.data);
      
//       if (statusResponse.data?.success) {
//         // If this is a COD delivery, transition to the payment modal
//         if (selectedDelivery.paymentMethod === 'Cash On Delivery' && !selectedDelivery.codPaid) {
//           toast.success('Delivery marked as complete. Please collect payment.');
//           setModalType('payment');
//         } else {
//           // Otherwise, just update the state and close the modal
//           toast.success('Delivery completed successfully');
//           setDeliveries(deliveries.map(delivery => 
//             delivery.orderId === selectedDelivery.orderId ? 
//               { ...delivery, deliveryStatus: 'Delivered', emptyCollected } : 
//               delivery
//           ));
          
//           setEmptyCollected(false);
//           setSelectedDelivery(null);
//           setModalType(null);
//         }
//       }
//     } catch (err) {
//       console.error('Error completing delivery:', err.response || err);
//       toast.error('Failed to complete delivery');
//     }
//   };

//   const handleCODPayment = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/cod`, {
//         amountReceived: parseFloat(codAmount),
//         emptyCollected: emptyCollected
//       });
      
//       console.log('COD payment response:', response.data);
      
//       if (response.data?.success) {
//         toast.success('Payment recorded successfully');
        
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === selectedDelivery.orderId ? 
//             { 
//               ...delivery, 
//               codPaid: true, 
//               amountReceived: parseFloat(codAmount),
//               emptyCollected: emptyCollected,
//               deliveryStatus: 'Delivered'
//             } : 
//             delivery
//         ));
        
//         // Reset form and close modal
//         setCodAmount('');
//         setEmptyCollected(false);
//         setSelectedDelivery(null);
//         setModalType(null);
//       }
//     } catch (err) {
//       console.error('Error processing COD payment:', err.response || err);
//       toast.error('Failed to process COD payment');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const closeModal = () => {
//     setSelectedDelivery(null);
//     setEmptyCollected(false);
//     setCodAmount('');
//     setModalType(null);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Show driver selector if needed
//   if (showDriverSelector) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <h1 className="text-2xl font-bold mb-4 text-gray-800">Driver Selection</h1>
          
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <p>{error}</p>
//             </div>
//           )}
          
//           {availableDrivers.length > 0 ? (
//             <div>
//               <p className="mb-4">Please select a driver to continue:</p>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {availableDrivers.map(driver => (
//                   <button
//                     key={driver._id}
//                     onClick={() => handleSelectDriver(driver._id)}
//                     className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
//                   >
//                     <h3 className="font-medium text-lg text-gray-800">{driver.name}</h3>
//                     <p className="text-gray-600">{driver.email}</p>
//                     <p className="text-sm text-gray-500">License: {driver.licenseNumber}</p>
//                     <p className="mt-2 text-xs font-medium text-blue-600">
//                       {driver.availability ? 'Available' : 'Unavailable'}
//                     </p>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : !error ? (
//             <p className="text-center py-4 text-gray-500">Loading drivers...</p>
//           ) : null}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//           <button 
//             onClick={handleChangeDriver}
//             className="mt-3 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
//           >
//             Select Different Driver
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Safely filter deliveries with null checks
//   const pendingDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus !== 'Delivered' && delivery?.deliveryStatus !== 'Delivery Failed'
//     ) : [];
  
//   const completedDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus === 'Delivered' || delivery?.deliveryStatus === 'Delivery Failed'
//     ) : [];

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold mb-2 text-gray-800">Driver Dashboard</h1>
//             {driverInfo && (
//               <div>
//                 <p className="text-lg"><span className="font-medium">Name:</span> {driverInfo.name}</p>
//                 <p className="text-green-600 font-medium">
//                   Total Completed Deliveries: {driverInfo.completedDeliveries || 0}
//                 </p>
//               </div>
//             )}
//           </div>
          
//           <button 
//             onClick={handleChangeDriver}
//             className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
//           >
//             Change Driver
//           </button>
//         </div>
//       </div>
      
//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-200 mb-6">
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'active' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('active')}
//         >
//           Active Deliveries
//         </button>
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'completed' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('completed')}
//         >
//           Completed Deliveries
//         </button>
//       </div>
      
//       {/* Active Deliveries Section */}
//       {activeTab === 'active' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             Active Deliveries ({pendingDeliveries.length})
//           </h2>
          
//           {pendingDeliveries.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No active deliveries at the moment.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {pendingDeliveries.map(delivery => (
//                 <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
//                   <div className="flex justify-between items-start mb-4">
//                     <h3 className="font-bold">Order #{delivery.orderId}</h3>
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       delivery.deliveryStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                       delivery.deliveryStatus === 'Assigned' ? 'bg-purple-100 text-purple-800' :
//                       'bg-blue-100 text-blue-800'
//                     }`}>
//                       {delivery.deliveryStatus}
//                     </span>
//                   </div>
                  
//                   <div className="space-y-2 mb-4">
//                     <p><span className="font-medium">Customer:</span> {delivery.customerName}</p>
//                     <p><span className="font-medium">Address:</span> {delivery.address}</p>
//                     <p><span className="font-medium">Phone:</span> {delivery.phone}</p>
//                     <p><span className="font-medium">Delivery Date:</span> {formatDate(delivery.deliveryDate)}</p>
//                     <p><span className="font-medium">Payment:</span> {delivery.paymentMethod}</p>
//                   </div>
                  
//                   <div className="flex flex-wrap gap-2 mt-4">
//                     {delivery.deliveryStatus === 'Assigned' && (
//                       <button 
//                         onClick={() => updateDeliveryStatus(delivery.orderId, 'Out For Delivery')}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Start Delivery
//                       </button>
//                     )}
                    
//                     {delivery.deliveryStatus === 'Out For Delivery' && (
//                       <>
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivered')}
//                           className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
//                         >
//                           Mark Delivered
//                         </button>
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivery Failed')}
//                           className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
//                         >
//                           Mark Failed
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
          
//           {/* Delivery Completion Modal */}
//           {selectedDelivery && modalType === 'delivery' && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//                 <h3 className="text-lg font-bold mb-4">Complete Delivery</h3>
//                 <p className="mb-4">Please confirm delivery completion for Order #{selectedDelivery.orderId}</p>
                
//                 <form onSubmit={completeDelivery}>
//                   <div className="mb-4">
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={emptyCollected}
//                         onChange={(e) => setEmptyCollected(e.target.checked)}
//                         className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
//                       />
//                       <span className="text-gray-700">Empty cylinders collected</span>
//                     </label>
//                   </div>
                  
//                   <div className="flex justify-end gap-2">
//                     <button
//                       type="button"
//                       onClick={closeModal}
//                       className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
//                     >
//                       Confirm Delivery
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
          
//           {/* COD Payment Modal */}
//           {selectedDelivery && modalType === 'payment' && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//                 <h3 className="text-lg font-bold mb-4">Cash on Delivery Payment</h3>
//                 <p className="mb-4">Please enter the amount received from customer for Order #{selectedDelivery.orderId}</p>
                
//                 <form onSubmit={handleCODPayment}>
//                   <div className="mb-4">
//                     <label htmlFor="codAmount" className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount Received
//                     </label>
//                     <input
//                       type="number"
//                       id="codAmount"
//                       value={codAmount}
//                       onChange={(e) => setCodAmount(e.target.value)}
//                       className="w-full p-2 border border-gray-300 rounded"
//                       step="0.01"
//                       min="0"
//                       required
//                     />
//                   </div>
                  
//                   <div className="flex justify-end gap-2">
//                     <button
//                       type="button"
//                       onClick={closeModal}
//                       className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
//                     >
//                       Confirm Payment
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Completed Deliveries Section */}
//       {activeTab === 'completed' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             Completed Deliveries ({completedDeliveries.length})
//           </h2>
          
//           {completedDeliveries.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No completed deliveries yet.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="py-3 px-4 text-left">Order ID</th>
//                     <th className="py-3 px-4 text-left">Customer</th>
//                     <th className="py-3 px-4 text-left">Address</th>
//                     <th className="py-3 px-4 text-left">Status</th>
//                     <th className="py-3 px-4 text-left">Payment</th>
//                     <th className="py-3 px-4 text-left">Empty Cylinders</th>
//                     <th className="py-3 px-4 text-left">Delivery Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {completedDeliveries.map(delivery => (
//                     <tr key={delivery._id} className="hover:bg-gray-50">
//                       <td className="py-3 px-4">{delivery.orderId}</td>
//                       <td className="py-3 px-4">{delivery.customerName}</td>
//                       <td className="py-3 px-4">
//                         <span className="truncate block max-w-xs">{delivery.address}</span>
//                       </td>
//                       <td className="py-3 px-4">
//                         <span className={`px-2 py-1 text-xs rounded-full ${
//                           delivery.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {delivery.deliveryStatus}
//                         </span>
//                       </td>
//                       <td className="py-3 px-4">
//                         {delivery.paymentMethod}
//                         {delivery.paymentMethod === 'Cash On Delivery' && (
//                           <span className={`ml-2 text-xs ${delivery.codPaid ? 'text-green-600' : 'text-red-600'}`}>
//                             {delivery.codPaid ? `(Paid: $${delivery.amountReceived})` : '(Unpaid)'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4">
//                         {delivery.emptyCollected ? (
//                           <span className="text-green-600">Collected</span>
//                         ) : (
//                           <span className="text-red-600">Not Collected</span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4">{formatDate(delivery.deliveredAt || delivery.deliveryDate)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverDashboard;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const DriverDashboard = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [codAmount, setCodAmount] = useState('');
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [activeTab, setActiveTab] = useState('active');
//   const [driverInfo, setDriverInfo] = useState(null);
//   const [emptyCollected, setEmptyCollected] = useState(false);
  
//   // States for driver selection
//   const [availableDrivers, setAvailableDrivers] = useState([]);
//   const [driverId, setDriverId] = useState(null);
//   const [showDriverSelector, setShowDriverSelector] = useState(false);
  
//   // New state to track which modal to show
//   const [modalType, setModalType] = useState(null); // 'delivery' or 'payment'

//   // Define base URL
//   const API_BASE_URL = 'http://localhost:5000';

//   // On first load, check if we have a stored driver ID
//   useEffect(() => {
//     const storedDriverId = localStorage.getItem('selectedDriverId');
//     if (storedDriverId) {
//       setDriverId(storedDriverId);
//     } else {
//       // If no stored driver, fetch available drivers and show selector
//       fetchAvailableDrivers();
//       setShowDriverSelector(true);
//     }
//   }, []);

//   // Fetch all available drivers
//   const fetchAvailableDrivers = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/drivers`);
//       if (response.data?.drivers && Array.isArray(response.data.drivers)) {
//         setAvailableDrivers(response.data.drivers);
//         if (response.data.drivers.length === 0) {
//           setError("No drivers available in the system. Please add a driver first.");
//         }
//       } else {
//         setError("Couldn't retrieve driver list. Unexpected data format.");
//       }
//     } catch (err) {
//       console.error('Error fetching drivers:', err);
//       setError('Failed to load available drivers. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // When driver ID changes, fetch that driver's data
//   useEffect(() => {
//     if (driverId) {
//       fetchDriverData();
//     }
//   }, [driverId]);

//   const fetchDriverData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log(`Fetching driver data for ID: ${driverId}`);
      
//       // Fetch driver information
//       const driverResponse = await axios.get(`${API_BASE_URL}/drivers/${driverId}`);
//       console.log('Driver API Response:', driverResponse.data);
      
//       // Safely set driver info
//       if (driverResponse.data?.driver) {
//         setDriverInfo(driverResponse.data.driver);
//         // Save the selected driver ID
//         localStorage.setItem('selectedDriverId', driverId);
//       } else {
//         console.warn('Driver data not in expected format:', driverResponse.data);
//         setDriverInfo(null);
//         setError("Couldn't retrieve driver information. Try selecting a different driver.");
//       }
      
//       // Fetch all deliveries for this driver
//       const deliveriesResponse = await axios.get(`${API_BASE_URL}/deliveries/driver/${driverId}`);
//       console.log('Deliveries API Response:', deliveriesResponse.data);
      
//       // Safely handle different response formats
//       if (Array.isArray(deliveriesResponse.data)) {
//         setDeliveries(deliveriesResponse.data);
//       } else if (deliveriesResponse.data?.deliveries && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else if (deliveriesResponse.data?.success && Array.isArray(deliveriesResponse.data.deliveries)) {
//         setDeliveries(deliveriesResponse.data.deliveries);
//       } else {
//         console.warn('Deliveries not in expected format:', deliveriesResponse.data);
//         setDeliveries([]); 
//       }
//     } catch (err) {
//       console.error('Error details:', err.response || err);
//       if (err.response?.status === 404) {
//         setError(`Driver with ID ${driverId} not found. Please select a different driver.`);
//       } else {
//         setError('Failed to fetch data. Please try again later.');
//       }
//       setDeliveries([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle driver selection
//   const handleSelectDriver = (id) => {
//     setDriverId(id);
//     setShowDriverSelector(false);
//   };

//   // Clear selected driver and show selector again
//   const handleChangeDriver = () => {
//     localStorage.removeItem('selectedDriverId');
//     setDriverId(null);
//     setDriverInfo(null);
//     setDeliveries([]);
//     fetchAvailableDrivers();
//     setShowDriverSelector(true);
//   };

//   const updateDeliveryStatus = async (orderId, status) => {
//     try {
//       // If status is Delivered, show the delivery completion modal first
//       if (status === 'Delivered') {
//         const delivery = deliveries.find(d => d.orderId === orderId);
//         setSelectedDelivery(delivery);
//         setModalType('delivery');
//         return;
//       }
      
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${orderId}/status`, {
//         deliveryStatus: status
//       });
      
//       console.log('Update status response:', response.data);
      
//       if (response.data?.success) {
//         toast.success(`Delivery status updated to ${status}`);
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === orderId ? { ...delivery, deliveryStatus: status } : delivery
//         ));
//       }
//     } catch (err) {
//       console.error('Error updating delivery status:', err.response || err);
//       toast.error('Failed to update delivery status');
//     }
//   };

//   const completeDelivery = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       // Mark as delivered and update empty cylinder collection status
//       const statusResponse = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/status`, {
//         deliveryStatus: 'Delivered',
//         emptyCollected: emptyCollected
//       });
      
//       console.log('Delivery completion response:', statusResponse.data);
      
//       if (statusResponse.data?.success) {
//         // If this is a COD delivery, transition to the payment modal
//         if (selectedDelivery.paymentMethod === 'Cash On Delivery' && !selectedDelivery.codPaid) {
//           toast.success('Delivery marked as complete. Please collect payment.');
//           setModalType('payment');
//         } else {
//           // Otherwise, just update the state and close the modal
//           toast.success('Delivery completed successfully');
//           setDeliveries(deliveries.map(delivery => 
//             delivery.orderId === selectedDelivery.orderId ? 
//               { ...delivery, deliveryStatus: 'Delivered', emptyCollected } : 
//               delivery
//           ));
          
//           setEmptyCollected(false);
//           setSelectedDelivery(null);
//           setModalType(null);
//         }
//       }
//     } catch (err) {
//       console.error('Error completing delivery:', err.response || err);
//       toast.error('Failed to complete delivery');
//     }
//   };

//   const handleCODPayment = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       const response = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/cod`, {
//         amountReceived: parseFloat(codAmount),
//         emptyCollected: emptyCollected
//       });
      
//       console.log('COD payment response:', response.data);
      
//       if (response.data?.success) {
//         toast.success('Payment recorded successfully');
        
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === selectedDelivery.orderId ? 
//             { 
//               ...delivery, 
//               codPaid: true, 
//               amountReceived: parseFloat(codAmount),
//               emptyCollected: emptyCollected,
//               deliveryStatus: 'Delivered'
//             } : 
//             delivery
//         ));
        
//         // Reset form and close modal
//         setCodAmount('');
//         setEmptyCollected(false);
//         setSelectedDelivery(null);
//         setModalType(null);
//       }
//     } catch (err) {
//       console.error('Error processing COD payment:', err.response || err);
//       toast.error('Failed to process COD payment');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const closeModal = () => {
//     setSelectedDelivery(null);
//     setEmptyCollected(false);
//     setCodAmount('');
//     setModalType(null);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Show driver selector if needed
//   if (showDriverSelector) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white shadow-lg rounded-lg p-6">
//           <h1 className="text-2xl font-bold mb-4 text-gray-800">Driver Selection</h1>
          
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <p>{error}</p>
//             </div>
//           )}
          
//           {availableDrivers.length > 0 ? (
//             <div>
//               <p className="mb-4">Please select a driver to continue:</p>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {availableDrivers.map(driver => (
//                   <button
//                     key={driver._id}
//                     onClick={() => handleSelectDriver(driver._id)}
//                     className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
//                   >
//                     <h3 className="font-medium text-lg text-gray-800">{driver.name}</h3>
//                     <p className="text-gray-600">{driver.email}</p>
//                     <p className="text-sm text-gray-500">License: {driver.licenseNumber}</p>
//                     <p className="mt-2 text-xs font-medium text-blue-600">
//                       {driver.availability ? 'Available' : 'Unavailable'}
//                     </p>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : !error ? (
//             <p className="text-center py-4 text-gray-500">Loading drivers...</p>
//           ) : null}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//           <button 
//             onClick={handleChangeDriver}
//             className="mt-3 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
//           >
//             Select Different Driver
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Safely filter deliveries with null checks and separated by status
//   const assignedDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => delivery?.deliveryStatus === 'Assigned') : [];
  
//   const activeDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus === 'Out For Delivery'
//     ) : [];
  
//   const completedDeliveries = Array.isArray(deliveries) ? 
//     deliveries.filter(delivery => 
//       delivery?.deliveryStatus === 'Delivered' || delivery?.deliveryStatus === 'Delivery Failed'
//     ) : [];

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold mb-2 text-gray-800">Driver Dashboard</h1>
//             {driverInfo && (
//               <div>
//                 <p className="text-lg"><span className="font-medium">Name:</span> {driverInfo.name}</p>
//                 <p className="text-green-600 font-medium">
//                   Total Completed Deliveries: {driverInfo.completedDeliveries || 0}
//                 </p>
//               </div>
//             )}
//           </div>
          
//           <button 
//             onClick={handleChangeDriver}
//             className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
//           >
//             Change Driver
//           </button>
//         </div>
//       </div>
      
//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-200 mb-6">
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'active' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('active')}
//         >
//           Active Deliveries
//         </button>
//         <button 
//           className={`px-4 py-2 font-medium ${activeTab === 'completed' 
//             ? 'text-blue-600 border-b-2 border-blue-600' 
//             : 'text-gray-500 hover:text-gray-700'}`}
//           onClick={() => setActiveTab('completed')}
//         >
//           Completed Deliveries
//         </button>
//       </div>
      
//       {/* Active Deliveries Section */}
//       {activeTab === 'active' && (
//         <div>
//           {/* Assigned Deliveries Section */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Assigned Deliveries ({assignedDeliveries.length})
//             </h2>
            
//             {assignedDeliveries.length === 0 ? (
//               <div className="text-center py-8 bg-gray-50 rounded-lg">
//                 <p className="text-gray-500">No assigned deliveries at the moment.</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {assignedDeliveries.map(delivery => (
//                   <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500">
//                     <div className="flex justify-between items-start mb-4">
//                       <h3 className="font-bold">Order #{delivery.orderId}</h3>
//                       <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
//                         {delivery.deliveryStatus}
//                       </span>
//                     </div>
                    
//                     <div className="space-y-2 mb-4">
//                       <p><span className="font-medium">Customer:</span> {delivery.customerName}</p>
//                       <p><span className="font-medium">Address:</span> {delivery.address}</p>
//                       <p><span className="font-medium">Phone:</span> {delivery.phone}</p>
//                       <p><span className="font-medium">Delivery Date:</span> {formatDate(delivery.deliveryDate)}</p>
//                       <p><span className="font-medium">Payment:</span> {delivery.paymentMethod}</p>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-2 mt-4">
//                       <button 
//                         onClick={() => updateDeliveryStatus(delivery.orderId, 'Out For Delivery')}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Start Delivery
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Active Deliveries Section (Out For Delivery) */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Out For Delivery ({activeDeliveries.length})
//             </h2>
            
//             {activeDeliveries.length === 0 ? (
//               <div className="text-center py-8 bg-gray-50 rounded-lg">
//                 <p className="text-gray-500">No active deliveries in progress.</p>
//               </div>
//             ) : (
//               <div className="flex justify-center">
//                 <div className="grid grid-cols-1 gap-6 max-w-xl">
//                   {activeDeliveries.map(delivery => (
//                     <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
//                       <div className="flex justify-between items-start mb-4">
//                         <h3 className="font-bold">Order #{delivery.orderId}</h3>
//                         <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
//                           {delivery.deliveryStatus}
//                         </span>
//                       </div>
                      
//                       <div className="space-y-2 mb-4">
//                         <p><span className="font-medium">Customer:</span> {delivery.customerName}</p>
//                         <p><span className="font-medium">Address:</span> {delivery.address}</p>
//                         <p><span className="font-medium">Phone:</span> {delivery.phone}</p>
//                         <p><span className="font-medium">Delivery Date:</span> {formatDate(delivery.deliveryDate)}</p>
//                         <p><span className="font-medium">Payment:</span> {delivery.paymentMethod}</p>
//                       </div>
                      
//                       <div className="flex flex-wrap gap-2 mt-4 justify-center">
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivered')}
//                           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
//                         >
//                           Mark Delivered
//                         </button>
//                         <button 
//                           onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivery Failed')}
//                           className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//                         >
//                           Mark Failed
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Delivery Completion Modal */}
//           {selectedDelivery && modalType === 'delivery' && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//                 <h3 className="text-lg font-bold mb-4">Complete Delivery</h3>
//                 <p className="mb-4">Please confirm delivery completion for Order #{selectedDelivery.orderId}</p>
                
//                 <form onSubmit={completeDelivery}>
//                   <div className="mb-4">
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={emptyCollected}
//                         onChange={(e) => setEmptyCollected(e.target.checked)}
//                         className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
//                       />
//                       <span className="text-gray-700">Empty cylinders collected</span>
//                     </label>
//                   </div>
                  
//                   <div className="flex justify-end gap-2">
//                     <button
//                       type="button"
//                       onClick={closeModal}
//                       className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
//                     >
//                       Confirm Delivery
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
          
//           {/* COD Payment Modal */}
//           {selectedDelivery && modalType === 'payment' && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//                 <h3 className="text-lg font-bold mb-4">Cash on Delivery Payment</h3>
//                 <p className="mb-4">Please confirm the amount received from customer for Order #{selectedDelivery.orderId}</p>
                
//                 <form onSubmit={handleCODPayment}>
//                   <div className="mb-4">
//                     <label htmlFor="codAmount" className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount Received
//                     </label>
//                     <input
//                       type="number"
//                       id="codAmount"
//                       value={codAmount}
//                       onChange={(e) => setCodAmount(e.target.value)}
//                       className="w-full p-2 border border-gray-300 rounded"
//                       step="0.01"
//                       min="0"
//                       required
//                     />
//                   </div>
                  
//                   <div className="flex justify-end gap-2">
//                     <button
//                       type="button"
//                       onClick={closeModal}
//                       className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
//                     >
//                       Confirm Payment
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Completed Deliveries Section */}
//       {activeTab === 'completed' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">
//             Completed Deliveries ({completedDeliveries.length})
//           </h2>
          
//           {completedDeliveries.length === 0 ? (
//             <div className="text-center py-8 bg-gray-50 rounded-lg">
//               <p className="text-gray-500">No completed deliveries yet.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full bg-white">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="py-3 px-4 text-left">Order ID</th>
//                     <th className="py-3 px-4 text-left">Customer</th>
//                     <th className="py-3 px-4 text-left">Address</th>
//                     <th className="py-3 px-4 text-left">Status</th>
//                     <th className="py-3 px-4 text-left">Payment</th>
//                     <th className="py-3 px-4 text-left">Empty Cylinders</th>
//                     <th className="py-3 px-4 text-left">Delivery Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {completedDeliveries.map(delivery => (
//                     <tr key={delivery._id} className="hover:bg-gray-50">
//                       <td className="py-3 px-4">{delivery.orderId}</td>
//                       <td className="py-3 px-4">{delivery.customerName}</td>
//                       <td className="py-3 px-4">
//                         <span className="truncate block max-w-xs">{delivery.address}</span>
//                       </td>
//                       <td className="py-3 px-4">
//                         <span className={`px-2 py-1 text-xs rounded-full ${
//                           delivery.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {delivery.deliveryStatus}
//                         </span>
//                       </td>
//                       <td className="py-3 px-4">
//                         {delivery.paymentMethod}
//                         {delivery.paymentMethod === 'Cash On Delivery' && (
//                           <span className={`ml-2 text-xs ${delivery.codPaid ? 'text-green-600' : 'text-red-600'}`}>
//                             {delivery.codPaid ? `(Paid: $${delivery.amountReceived})` : '(Unpaid)'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4">
//                         {delivery.emptyCollected ? (
//                           <span className="text-green-600">Collected</span>
//                         ) : (
//                           <span className="text-red-600">Not Collected</span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4">{formatDate(delivery.deliveredAt || delivery.deliveryDate)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Place this outside the component
const UserService = {
  getCurrentUserId: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.user?.id || null;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  },
  getCurrentUsername: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.user?.username || null;
    } catch (error) {
      console.error("Error getting username:", error);
      return null;
    }
  },
  getUserEmail: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.user?.email || null;
    } catch (error) {
      console.error("Error getting email:", error);
      return null;
    }
  }
};

const DriverDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codAmount, setCodAmount] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [driverInfo, setDriverInfo] = useState(null);
  const [emptyCollected, setEmptyCollected] = useState(false);
  
  // States for driver selection
  const [driverId, setDriverId] = useState(null);
  
  // New state to track which modal to show
  const [modalType, setModalType] = useState(null); // 'delivery' or 'payment'

  // Define base URL
  const API_BASE_URL = 'http://localhost:5000';

  // On first load, check if we have a stored driver ID
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const email = UserService.getUserEmail();
        const driverResponse = await axios.get(`${API_BASE_URL}/drivers/email/${email}`);
        if (driverResponse.data?.driver) {
          setDriverId(driverResponse.data.driver._id);
          setDriverInfo(driverResponse.data.driver);
          localStorage.setItem('selectedDriverId', driverResponse.data.driver._id);
        }
      } catch (err) {
        console.error("Error fetching driver on load:", err);
      }
    };
    fetchDriver();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchDriverData();
    }
  }, [driverId]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching driver data for ID: ${driverId}`);
      const email = UserService.getUserEmail();
      // Fetch driver information
      const driverResponse = await axios.get(`${API_BASE_URL}/drivers/email/${email}`);
      console.log('Driver API Response:', driverResponse.data);
      
      // Safely set driver info
      if (driverResponse.data?.driver) {
        setDriverInfo(driverResponse.data.driver);
        // Save the selected driver ID
        localStorage.setItem('selectedDriverId', driverResponse.data?.driver?._id);
      } else {
        console.warn('Driver data not in expected format:', driverResponse.data);
        setDriverInfo(null);
        setError("Couldn't retrieve driver information. Try selecting a different driver.");
      }
      
      // Fetch all deliveries for this driver
      const deliveriesResponse = await axios.get(`${API_BASE_URL}/deliveries/driver/${driverId}`);
      console.log('Deliveries API Response:', deliveriesResponse.data);
      
      // Safely handle different response formats
      if (Array.isArray(deliveriesResponse.data)) {
        setDeliveries(deliveriesResponse.data);
      } else if (deliveriesResponse.data?.deliveries && Array.isArray(deliveriesResponse.data.deliveries)) {
        setDeliveries(deliveriesResponse.data.deliveries);
      } else if (deliveriesResponse.data?.success && Array.isArray(deliveriesResponse.data.deliveries)) {
        setDeliveries(deliveriesResponse.data.deliveries);
      } else {
        console.warn('Deliveries not in expected format:', deliveriesResponse.data);
        setDeliveries([]); 
      }
    } catch (err) {
      console.error('Error details:', err.response || err);
      if (err.response?.status === 404) {
        setError(`Driver with ID ${driverId} not found. Please select a different driver.`);
      } else {
        setError('Failed to fetch data. Please try again later.');
      }
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log("User logged out, localStorage cleared");
    window.location.href = '/login';
  }

  const updateDeliveryStatus = async (orderId, status) => {
    try {
      // If status is Delivered, show the delivery completion modal first
      if (status === 'Delivered') {
        const delivery = deliveries.find(d => d.orderId === orderId);
        setSelectedDelivery(delivery);
        setModalType('delivery');
        return;
      }
      
      const response = await axios.put(`${API_BASE_URL}/deliveries/${orderId}/status`, {
        deliveryStatus: status
      });
      
      console.log('Update status response:', response.data);
      
      if (response.data?.success) {
        toast.success(`Delivery status updated to ${status}`);
        setDeliveries(deliveries.map(delivery => 
          delivery.orderId === orderId ? { ...delivery, deliveryStatus: status } : delivery
        ));
      }
    } catch (err) {
      console.error('Error updating delivery status:', err.response || err);
      toast.error('Failed to update delivery status');
    }
  };

  const completeDelivery = async (e) => {
    e.preventDefault();
    
    if (!selectedDelivery) return;
    
    try {
      // Mark as delivered and update empty cylinder collection status
      const statusResponse = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/status`, {
        deliveryStatus: 'Delivered',
        emptyCollected: emptyCollected
      });
      
      console.log('Delivery completion response:', statusResponse.data);
      
      if (statusResponse.data?.success) {
        // If this is a COD delivery, transition to the payment modal
        if (selectedDelivery.paymentMethod === 'Cash On Delivery' && !selectedDelivery.codPaid) {
          toast.success('Delivery marked as complete. Please collect payment.');
          setModalType('payment');
        } else {
          // Otherwise, just update the state and close the modal
          toast.success('Delivery completed successfully');
          setDeliveries(deliveries.map(delivery => 
            delivery.orderId === selectedDelivery.orderId ? 
              { ...delivery, deliveryStatus: 'Delivered', emptyCollected } : 
              delivery
          ));
          
          setEmptyCollected(false);
          setSelectedDelivery(null);
          setModalType(null);
        }
      }
    } catch (err) {
      console.error('Error completing delivery:', err.response || err);
      toast.error('Failed to complete delivery');
    }
  };

  const handleChangeDriver = () => {
    localStorage.removeItem('selectedDriverId');
    setDriverId(null);
    setDriverInfo(null);
    toast.info("Driver deselected. Please refresh or re-login to choose a driver.");
  };

  const handleCODPayment = async (e) => {
    e.preventDefault();
    
    if (!selectedDelivery) return;
    
    try {
      const response = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/cod`, {
        amountReceived: parseFloat(codAmount),
        emptyCollected: emptyCollected
      });
      
      console.log('COD payment response:', response.data);
      
      if (response.data?.success) {
        toast.success('Payment recorded successfully');
        
        setDeliveries(deliveries.map(delivery => 
          delivery.orderId === selectedDelivery.orderId ? 
            { 
              ...delivery, 
              codPaid: true, 
              amountReceived: parseFloat(codAmount),
              emptyCollected: emptyCollected,
              deliveryStatus: 'Delivered'
            } : 
            delivery
        ));
        
        // Reset form and close modal
        setCodAmount('');
        setEmptyCollected(false);
        setSelectedDelivery(null);
        setModalType(null);
      }
    } catch (err) {
      console.error('Error processing COD payment:', err.response || err);
      toast.error('Failed to process COD payment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const closeModal = () => {
    setSelectedDelivery(null);
    setEmptyCollected(false);
    setCodAmount('');
    setModalType(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // // Show driver selector if needed
  // if (showDriverSelector) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="bg-white shadow-lg rounded-lg p-6">
  //         <h1 className="text-2xl font-bold mb-4 text-gray-800">Driver Selection</h1>
          
  //         {error && (
  //           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
  //             <p>{error}</p>
  //           </div>
  //         )}
          
  //         {availableDrivers.length > 0 ? (
  //           <div>
  //             <p className="mb-4">Please select a driver to continue:</p>
  //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //               {availableDrivers.map(driver => (
  //                 <button
  //                   key={driver._id}
  //                   onClick={() => handleSelectDriver(driver._id)}
  //                   className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
  //                 >
  //                   <h3 className="font-medium text-lg text-gray-800">{driver.name}</h3>
  //                   <p className="text-gray-600">{driver.email}</p>
  //                   <p className="text-sm text-gray-500">License: {driver.licenseNumber}</p>
  //                   <p className="mt-2 text-xs font-medium text-blue-600">
  //                     {driver.availability ? 'Available' : 'Unavailable'}
  //                   </p>
  //                 </button>
  //               ))}
  //             </div>
  //           </div>
  //         ) : !error ? (
  //           <p className="text-center py-4 text-gray-500">Loading drivers...</p>
  //         ) : null}
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
  //         <p>{error}</p>
  //         <button 
  //           onClick={handleChangeDriver}
  //           className="mt-3 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
  //         >
  //           Select Different Driver
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Safely filter deliveries with null checks and separated by status
  const assignedDeliveries = Array.isArray(deliveries) ? 
    deliveries.filter(delivery => delivery?.deliveryStatus === 'Assigned') : [];
  
  const activeDeliveries = Array.isArray(deliveries) ? 
    deliveries.filter(delivery => 
      delivery?.deliveryStatus === 'Out For Delivery'
    ) : [];
  
  const completedDeliveries = Array.isArray(deliveries) ? 
    deliveries.filter(delivery => 
      delivery?.deliveryStatus === 'Delivered' || delivery?.deliveryStatus === 'Delivery Failed'
    ) : [];


    
    

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-center w-full">
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Driver Dashboard</h1>
            {driverInfo && (
              <div className="text-center">
                <p className="text-lg"><span className="font-medium">Name:</span> {UserService.getCurrentUsername()}</p>
                <p className="text-green-600 font-medium">
                  Total Completed Deliveries: {completedDeliveries.length || 0}
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={logout}
            className="bg-red-700 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'active' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Deliveries
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'completed' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Deliveries
        </button>
      </div>
      
      {/* Active Deliveries Section */}
      {activeTab === 'active' && (
        <div>
          {/* Assigned Deliveries Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
              Assigned Deliveries ({assignedDeliveries.length})
            </h2>
            
            {assignedDeliveries.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No assigned deliveries at the moment.</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {assignedDeliveries.map(delivery => (
                    <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold">Order #{delivery.orderId}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {delivery.deliveryStatus}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p><span className="font-medium">Customer:</span> {delivery.customerName}</p>
                        <p><span className="font-medium">Address:</span> {delivery.address}</p>
                        <p><span className="font-medium">Phone:</span> {delivery.phone}</p>
                        <p><span className="font-medium">Delivery Date:</span> {formatDate(delivery.deliveryDate)}</p>
                        <p><span className="font-medium">Payment:</span> {delivery.paymentMethod}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button 
                          onClick={() => updateDeliveryStatus(delivery.orderId, 'Out For Delivery')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Start Delivery
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Deliveries Section (Out For Delivery) */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
              Out For Delivery ({activeDeliveries.length})
            </h2>
            
            {activeDeliveries.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No active deliveries in progress.</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-6 max-w-xl">
                  {activeDeliveries.map(delivery => (
                    <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold">Order #{delivery.orderId}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {delivery.deliveryStatus}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p><span className="font-medium">Customer:</span> {delivery.customerName}</p>
                        <p><span className="font-medium">Address:</span> {delivery.address}</p>
                        <p><span className="font-medium">Phone:</span> {delivery.phone}</p>
                        <p><span className="font-medium">Delivery Date:</span> {formatDate(delivery.deliveryDate)}</p>
                        <p><span className="font-medium">Payment:</span> {delivery.paymentMethod}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        <button 
                          onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivered')}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Mark Delivered
                        </button>
                        <button 
                          onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivery Failed')}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                          Mark Failed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Delivery Completion Modal */}
          {selectedDelivery && modalType === 'delivery' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Complete Delivery</h3>
                <p className="mb-4">Please confirm delivery completion for Order #{selectedDelivery.orderId}</p>
                
                <form onSubmit={completeDelivery}>
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={emptyCollected}
                        onChange={(e) => setEmptyCollected(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                      />
                      <span className="text-gray-700">Empty cylinders collected</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
                    >
                      Confirm Delivery
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* COD Payment Modal */}
          {selectedDelivery && modalType === 'payment' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Cash on Delivery Payment</h3>
                <p className="mb-4">Please confirm the amount received from customer for Order #{selectedDelivery.orderId}</p>
                
                <form onSubmit={handleCODPayment}>
                  <div className="mb-4">
                    <label htmlFor="codAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Received
                    </label>
                    <input
                      type="number"
                      id="codAmount"
                      value={codAmount}
                      onChange={(e) => setCodAmount(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Completed Deliveries Section */}
      {activeTab === 'completed' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Completed Deliveries ({completedDeliveries.length})
          </h2>
          
          {completedDeliveries.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No completed deliveries yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Address</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Payment</th>
                    <th className="py-3 px-4 text-left">Empty Cylinders</th>
                    <th className="py-3 px-4 text-left">Delivery Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedDeliveries.map(delivery => (
                    <tr key={delivery._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{delivery.orderId}</td>
                      <td className="py-3 px-4">{delivery.customerName}</td>
                      <td className="py-3 px-4">
                        <span className="truncate block max-w-xs">{delivery.address}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          delivery.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {delivery.deliveryStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {delivery.paymentMethod}
                        {delivery.paymentMethod === 'Cash On Delivery' && (
                          <span className={`ml-2 text-xs ${delivery.codPaid ? 'text-green-600' : 'text-red-600'}`}>
                            {delivery.codPaid ? `(Paid: $${delivery.amountReceived})` : '(Unpaid)'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {delivery.emptyCollected ? (
                          <span className="text-green-600">Collected</span>
                        ) : (
                          <span className="text-red-600">Not Collected</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{formatDate(delivery.deliveredAt || delivery.deliveryDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;