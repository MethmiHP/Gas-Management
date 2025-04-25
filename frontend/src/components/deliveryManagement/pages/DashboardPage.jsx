// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const DashboardPage = () => {
//   const [stats, setStats] = useState({
//     totalDeliveries: 0,
//     pendingDeliveries: 0,
//     completedDeliveries: 0,
//     totalDrivers: 0,
//     availableDrivers: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [recentDeliveries, setRecentDeliveries] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       // Fetch all deliveries
//       const deliveriesResponse = await axios.get('http://localhost:5000/deliveries');
//       const deliveries = deliveriesResponse.data.deliveries || [];
      
//       // Fetch all drivers
//       const driversResponse = await axios.get('http://localhost:5000/drivers');
//       const drivers = driversResponse.data.drivers || [];
      
//       // Calculate stats
//       const pendingDeliveries = deliveries.filter(
//         d => d.deliveryStatus !== 'Delivered' && d.deliveryStatus !== 'Delivery Failed'
//       ).length;
      
//       const completedDeliveries = deliveries.filter(
//         d => d.deliveryStatus === 'Delivered'
//       ).length;
      
//       const availableDrivers = drivers.filter(d => d.availability).length;
      
//       setStats({
//         totalDeliveries: deliveries.length,
//         pendingDeliveries,
//         completedDeliveries,
//         totalDrivers: drivers.length,
//         availableDrivers
//       });
      
//       // Get recent deliveries (latest 5)
//       const sortedDeliveries = [...deliveries].sort((a, b) => 
//         new Date(b.deliveryDate) - new Date(a.deliveryDate)
//       ).slice(0, 5);
      
//       setRecentDeliveries(sortedDeliveries);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get status badge color
//   const getStatusBadgeColor = (status) => {
//     switch(status) {
//       case 'Pending': return 'bg-yellow-200 text-yellow-800';
//       case 'Assigned': return 'bg-blue-200 text-blue-800';
//       case 'Out For Delivery': return 'bg-purple-200 text-purple-800';
//       case 'Delivered': return 'bg-green-200 text-green-800';
//       case 'Delivery Failed': return 'bg-red-200 text-red-800';
//       default: return 'bg-gray-200 text-gray-800';
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-center mb-8">Delivery Management Dashboard</h1>
      
//       {loading ? (
//         <div className="text-center py-8">
//           <p className="text-gray-600">Loading dashboard data...</p>
//         </div>
//       ) : (
//         <>
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
//             <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
//               <span className="text-sm text-gray-500 mb-1">Total Deliveries</span>
//               <span className="text-3xl font-bold">{stats.totalDeliveries}</span>
//             </div>
            
//             <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
//               <span className="text-sm text-gray-500 mb-1">Pending Deliveries</span>
//               <span className="text-3xl font-bold text-yellow-600">{stats.pendingDeliveries}</span>
//             </div>
            
//             <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
//               <span className="text-sm text-gray-500 mb-1">Completed Deliveries</span>
//               <span className="text-3xl font-bold text-green-600">{stats.completedDeliveries}</span>
//             </div>
            
//             <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
//               <span className="text-sm text-gray-500 mb-1">Total Drivers</span>
//               <span className="text-3xl font-bold">{stats.totalDrivers}</span>
//             </div>
            
//             <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
//               <span className="text-sm text-gray-500 mb-1">Available Drivers</span>
//               <span className="text-3xl font-bold text-blue-600">{stats.availableDrivers}</span>
//             </div>
//           </div>
          
//           {/* Recent Deliveries */}
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
//             {recentDeliveries.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {recentDeliveries.map((delivery) => (
//                       <tr key={delivery._id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">{delivery.orderId}</td>
//                         <td className="px-6 py-4">
//                           <div className="font-medium text-gray-900">{delivery.customerName}</div>
//                           <div className="text-sm text-gray-500">{delivery.phone}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`${getStatusBadgeColor(delivery.deliveryStatus)} px-2 py-1 rounded-full text-sm`}>
//                             {delivery.deliveryStatus}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {new Date(delivery.deliveryDate).toLocaleDateString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div>{delivery.paymentMethod}</div>
//                           {delivery.paymentMethod === 'Cash On Delivery' && (
//                             <div className="mt-1 text-xs">
//                               {delivery.codPaid ? 'Paid' : 'Pending'}
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-center py-4 text-gray-500">No recent deliveries found</p>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default DashboardPage;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalDrivers: 0,
    availableDrivers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const deliveriesResponse = await axios.get('http://localhost:5000/deliveries');
      const deliveries = deliveriesResponse.data.deliveries || [];

      const driversResponse = await axios.get('http://localhost:5000/drivers');
      const drivers = driversResponse.data.drivers || [];

      const pendingDeliveries = deliveries.filter(
        d => d.deliveryStatus !== 'Delivered' && d.deliveryStatus !== 'Delivery Failed'
      ).length;

      const completedDeliveries = deliveries.filter(
        d => d.deliveryStatus === 'Delivered'
      ).length;

      const availableDrivers = drivers.filter(d => d.availability).length;

      setStats({
        totalDeliveries: deliveries.length,
        pendingDeliveries,
        completedDeliveries,
        totalDrivers: drivers.length,
        availableDrivers
      });

      const sortedDeliveries = [...deliveries].sort((a, b) => 
        new Date(b.deliveryDate) - new Date(a.deliveryDate)
      ).slice(0, 5);

      setRecentDeliveries(sortedDeliveries);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="text-3xl font-bold text-center mb-8">Delivery Management Dashboard</h1>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {[
              { label: "Total Deliveries", value: stats.totalDeliveries },
              { label: "Pending Deliveries", value: stats.pendingDeliveries, color: "text-yellow-600" },
              { label: "Completed Deliveries", value: stats.completedDeliveries, color: "text-green-600" },
              { label: "Total Drivers", value: stats.totalDrivers },
              { label: "Available Drivers", value: stats.availableDrivers, color: "text-blue-600" },
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                <span className="text-sm text-gray-500 mb-1">{stat.label}</span>
                <span className={`text-3xl font-bold ${stat.color || ''}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Navigate to Performance Report */}
          <div className="flex justify-center mb-10">
            <button
              onClick={() => navigate('/driver-performance-report')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300"
            >
              Generate Performance Report
            </button>
          </div>

          {/* Recent Deliveries */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
            {recentDeliveries.length > 0 ? (
              <div className="overflow-x-auto">
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
                    {recentDeliveries.map((delivery) => (
                      <tr key={delivery._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{delivery.orderId}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{delivery.customerName}</div>
                          <div className="text-sm text-gray-500">{delivery.phone}</div>
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
                            <div className="mt-1 text-xs">
                              {delivery.codPaid ? 'Paid' : 'Pending'}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No recent deliveries found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
