// import React, { useState } from 'react';
// import axios from 'axios';

// const TrackDeliveryPage = () => {
//   const [trackingData, setTrackingData] = useState({ orderId: '', phone: '' });
//   const [trackingResult, setTrackingResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setTrackingData(prevData => ({
//       ...prevData,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setTrackingResult(null);

//     try {
//       // Replace with your actual API endpoint
//       //const response = await axios.post('/api/track-delivery', trackingData);
//       const response = await axios.get(`/track-delivery?orderId=${trackingData.orderId}&phone=${trackingData.phone}`);
//       setTrackingResult(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'An error occurred while tracking your delivery');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold text-center mb-6">Track Your Delivery</h1>
      
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
//             Order ID
//           </label>
//           <input
//             type="text"
//             id="orderId"
//             name="orderId"
//             value={trackingData.orderId}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your order ID"
//             required
//           />
//         </div>

//         <div className="mb-6">
//           <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
//             Phone Number
//           </label>
//           <input
//             type="tel"
//             id="phone"
//             name="phone"
//             value={trackingData.phone}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter your phone number"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//         >
//           {loading ? 'Tracking...' : 'Track Delivery'}
//         </button>
//       </form>

//       {error && (
//         <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
//           <p>{error}</p>
//         </div>
//       )}

//       {trackingResult && (
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold mb-3">Delivery Status</h2>
//           <div className="bg-gray-100 p-4 rounded-md">
//             <div className="grid grid-cols-2 gap-2">
//               <div className="text-gray-600">Status:</div>
//               <div className="font-medium">{trackingResult.status}</div>
              
//               <div className="text-gray-600">Estimated Delivery:</div>
//               <div className="font-medium">{trackingResult.estimatedDelivery}</div>
              
//               <div className="text-gray-600">Current Location:</div>
//               <div className="font-medium">{trackingResult.currentLocation}</div>
              
//               <div className="text-gray-600">Last Updated:</div>
//               <div className="font-medium">{trackingResult.lastUpdated}</div>
//             </div>

//             {trackingResult.trackingHistory && (
//               <div className="mt-4">
//                 <h3 className="font-semibold mb-2">Tracking History</h3>
//                 <ul className="space-y-2">
//                   {trackingResult.trackingHistory.map((entry, index) => (
//                     <li key={index} className="flex items-start">
//                       <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
//                       <div>
//                         <div className="font-medium">{entry.date}</div>
//                         <div className="text-sm text-gray-600">{entry.description}</div>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TrackDeliveryPage;

import React, { useState } from 'react';
import axios from 'axios';

const TrackDeliveryPage = () => {
  const [trackingData, setTrackingData] = useState({ orderId: '', phone: '' });
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrackingData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingResult(null);

    try {
      const response = await axios.get(`/track-delivery?orderId=${trackingData.orderId}&phone=${trackingData.phone}`);
      
      // Ensure the response has the required fields
      const formattedResult = {
        status: response.data.deliveryStatus || 'Unknown',
        estimatedDelivery: response.data.deliveryDate 
          ? new Date(response.data.deliveryDate).toLocaleDateString() 
          : 'Not specified',
        currentLocation: response.data.address || 'Not available',
        lastUpdated: response.data.updatedAt 
          ? new Date(response.data.updatedAt).toLocaleString() 
          : 'Not available',
        trackingHistory: response.data.trackingHistory || []
      };

      setTrackingResult(formattedResult);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while tracking your delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Track Your Delivery</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
            Order ID
          </label>
          <input
            type="text"
            id="orderId"
            name="orderId"
            value={trackingData.orderId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your order ID"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={trackingData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {loading ? 'Tracking...' : 'Track Delivery'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {trackingResult && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Delivery Status</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Status:</div>
              <div className="font-medium">{trackingResult.status}</div>
              
              <div className="text-gray-600">Estimated Delivery:</div>
              <div className="font-medium">{trackingResult.estimatedDelivery}</div>
              
              <div className="text-gray-600">Current Location:</div>
              <div className="font-medium">{trackingResult.currentLocation}</div>
              
              <div className="text-gray-600">Last Updated:</div>
              <div className="font-medium">{trackingResult.lastUpdated}</div>
            </div>

            {trackingResult.trackingHistory && trackingResult.trackingHistory.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Tracking History</h3>
                <ul className="space-y-2">
                  {trackingResult.trackingHistory.map((entry, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium">{entry.date}</div>
                        <div className="text-sm text-gray-600">{entry.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackDeliveryPage;