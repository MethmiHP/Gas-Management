// // src/components/deliveryManagement/pages/DriverDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const DriverDashboard = () => {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [codAmount, setCodAmount] = useState('');
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

//   // Simulating login - in a real app, you would get this from authentication context
//   //const driverId = localStorage.getItem('driverId') || '65f8a12c3e4d5f6a7b8c9d0e'; // Example ID

//   // Replace this with a valid driver ID from your database
//   const driverId = '67d5aff09a5beda101bf3b02';
//   const [driverInfo, setDriverInfo] = useState(null);

//   useEffect(() => {
//     const fetchDriverData = async () => {
//       try {
//         setLoading(true);
//         // Fetch driver information
//         const driverResponse = await axios.get(`/drivers/${driverId}`);
//         setDriverInfo(driverResponse.data.driver);
        
//         // Fetch all deliveries for this driver
//         const deliveriesResponse = await axios.get(`/deliveries/driver/${driverId}`);
//         if (deliveriesResponse.data.success) {
//           setDeliveries(deliveriesResponse.data.deliveries);
//         }
//       } catch (err) {
//         setError('Failed to fetch data');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDriverData();
//   }, [driverId]);

//   const updateDeliveryStatus = async (orderId, status) => {
//     try {
//       const response = await axios.put(`/deliveries/${orderId}/status`, {
//         deliveryStatus: status
//       });
      
//       if (response.data.success) {
//         // Update the local state
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
//       setError('Failed to update delivery status');
//       console.error(err);
//     }
//   };

//   const handleCODPayment = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDelivery) return;
    
//     try {
//       const response = await axios.put(`/deliveries/${selectedDelivery.orderId}/cod`, {
//         amountReceived: parseFloat(codAmount)
//       });
      
//       if (response.data.success) {
//         // Update the local state
//         setDeliveries(deliveries.map(delivery => 
//           delivery.orderId === selectedDelivery.orderId ? { ...delivery, codPaid: true, amountReceived: parseFloat(codAmount) } : delivery
//         ));
        
//         // Reset the form
//         setCodAmount('');
//         setSelectedDelivery(null);
//       }
//     } catch (err) {
//       setError('Failed to process COD payment');
//       console.error(err);
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

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 my-4">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   const pendingDeliveries = deliveries.filter(delivery => 
//     delivery.deliveryStatus !== 'Delivered' && delivery.deliveryStatus !== 'Delivery Failed'
//   );
  
//   const completedDeliveries = deliveries.filter(delivery => 
//     delivery.deliveryStatus === 'Delivered' || delivery.deliveryStatus === 'Delivery Failed'
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
//         <h1 className="text-2xl font-bold mb-2 text-gray-800">Driver Dashboard</h1>
//         {driverInfo && (
//           <div className="mb-4">
//             <p className="text-lg"><span className="font-medium">Name:</span> {driverInfo.name}</p>
//             <p className="text-green-600 font-medium">
//               Total Completed Deliveries: {driverInfo.completedDeliveries}
//             </p>
//           </div>
//         )}
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


// src/components/deliveryManagement/pages/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DriverDashboard = () => {
  const [deliveries, setDeliveries] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codAmount, setCodAmount] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  // Replace this with a valid driver ID from your database for testing
  //const driverId = '67d66def9a5beda101bf3b97';
//   const driverId = '67ddc1c6ac74709b1951c61d'; 

//const driverId = '67df776a55b9af39945c94a6'; 
const driverId = '67e15f3f2afc7fff85d4e6e2'; 

  const [driverInfo, setDriverInfo] = useState(null);

  // Define base URL - adjust this to match your backend
  // Remove this line if you're using a proxy in package.json
  const API_BASE_URL = 'http://localhost:5000'; // Adjust to your backend URL

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching driver data for ID: ${driverId}`);
        
        // Fetch driver information - adjust URL based on your backend structure
        const driverResponse = await axios.get(`${API_BASE_URL}/drivers/${driverId}`);
        console.log('Driver API Response:', driverResponse.data);
        
        // Safely set driver info
        if (driverResponse.data?.driver) {
          setDriverInfo(driverResponse.data.driver);
        } else {
          console.warn('Driver data not in expected format:', driverResponse.data);
          setDriverInfo(null);
        }
        
        // Fetch all deliveries for this driver
        const deliveriesResponse = await axios.get(`${API_BASE_URL}/deliveries/driver/${driverId}`);
        console.log('Deliveries API Response:', deliveriesResponse.data);
        
        // Safely handle different response formats
        if (Array.isArray(deliveriesResponse.data)) {
          // If API returns array directly
          setDeliveries(deliveriesResponse.data);
        } else if (deliveriesResponse.data?.deliveries && Array.isArray(deliveriesResponse.data.deliveries)) {
          // If API returns { deliveries: [...] }
          setDeliveries(deliveriesResponse.data.deliveries);
        } else if (deliveriesResponse.data?.success && Array.isArray(deliveriesResponse.data.deliveries)) {
          // If API returns { success: true, deliveries: [...] }
          setDeliveries(deliveriesResponse.data.deliveries);
        } else {
          console.warn('Deliveries not in expected format:', deliveriesResponse.data);
          setDeliveries([]); // Set to empty array as fallback
        }
      } catch (err) {
        console.error('Error details:', err.response || err);
        setError('Failed to fetch data');
        setDeliveries([]); // Ensure deliveries is an array even on error
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId, API_BASE_URL]);

  const updateDeliveryStatus = async (orderId, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/deliveries/${orderId}/status`, {
        deliveryStatus: status
      });
      
      console.log('Update status response:', response.data);
      
      if (response.data?.success) {
        // Update the local state
        setDeliveries(deliveries.map(delivery => 
          delivery.orderId === orderId ? { ...delivery, deliveryStatus: status } : delivery
        ));
        
        // If delivery is marked as delivered, show COD payment form if applicable
        if (status === 'Delivered') {
          const delivery = deliveries.find(d => d.orderId === orderId);
          if (delivery && delivery.paymentMethod === 'Cash On Delivery' && !delivery.codPaid) {
            setSelectedDelivery(delivery);
          }
        }
      }
    } catch (err) {
      console.error('Error updating delivery status:', err.response || err);
      setError('Failed to update delivery status');
    }
  };

  const handleCODPayment = async (e) => {
    e.preventDefault();
    
    if (!selectedDelivery) return;
    
    try {
      const response = await axios.put(`${API_BASE_URL}/deliveries/${selectedDelivery.orderId}/cod`, {
        amountReceived: parseFloat(codAmount)
      });
      
      console.log('COD payment response:', response.data);
      
      if (response.data?.success) {
        // Update the local state
        setDeliveries(deliveries.map(delivery => 
          delivery.orderId === selectedDelivery.orderId ? 
            { ...delivery, codPaid: true, amountReceived: parseFloat(codAmount) } : 
            delivery
        ));
        
        // Reset the form
        setCodAmount('');
        setSelectedDelivery(null);
      }
    } catch (err) {
      console.error('Error processing COD payment:', err.response || err);
      setError('Failed to process COD payment');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 my-4">
        <p>{error}</p>
      </div>
    );
  }

  // Safely filter deliveries with null checks
  const pendingDeliveries = Array.isArray(deliveries) ? 
    deliveries.filter(delivery => 
      delivery?.deliveryStatus !== 'Delivered' && delivery?.deliveryStatus !== 'Delivery Failed'
    ) : [];
  
  const completedDeliveries = Array.isArray(deliveries) ? 
    deliveries.filter(delivery => 
      delivery?.deliveryStatus === 'Delivered' || delivery?.deliveryStatus === 'Delivery Failed'
    ) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Driver Dashboard</h1>
        {driverInfo && (
          <div className="mb-4">
            <p className="text-lg"><span className="font-medium">Name:</span> {driverInfo.name}</p>
            <p className="text-green-600 font-medium">
              Total Completed Deliveries: {driverInfo.completedDeliveries}
            </p>
          </div>
        )}
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Active Deliveries ({pendingDeliveries.length})
          </h2>
          
          {pendingDeliveries.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active deliveries at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingDeliveries.map(delivery => (
                <div key={delivery._id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">Order #{delivery.orderId}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      delivery.deliveryStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      delivery.deliveryStatus === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
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
                    {delivery.deliveryStatus === 'Assigned' && (
                      <button 
                        onClick={() => updateDeliveryStatus(delivery.orderId, 'Out For Delivery')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Start Delivery
                      </button>
                    )}
                    
                    {delivery.deliveryStatus === 'Out For Delivery' && (
                      <>
                        <button 
                          onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivered')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Mark Delivered
                        </button>
                        <button 
                          onClick={() => updateDeliveryStatus(delivery.orderId, 'Delivery Failed')}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Mark Failed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* COD Payment Modal */}
          {selectedDelivery && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Cash on Delivery Payment</h3>
                <p className="mb-4">Please enter the amount received from customer for Order #{selectedDelivery.orderId}</p>
                
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
                      onClick={() => setSelectedDelivery(null)}
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

