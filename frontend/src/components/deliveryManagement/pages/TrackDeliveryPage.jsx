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
//       const response = await axios.get(`/track-delivery?orderId=${trackingData.orderId}&phone=${trackingData.phone}`);
      
//       // Ensure the response has the required fields
//       const formattedResult = {
//         status: response.data.deliveryStatus || 'Unknown',
//         estimatedDelivery: response.data.deliveryDate 
//           ? new Date(response.data.deliveryDate).toLocaleDateString() 
//           : 'Not specified',
//         currentLocation: response.data.address || 'Not available',
//         lastUpdated: response.data.updatedAt 
//           ? new Date(response.data.updatedAt).toLocaleString() 
//           : 'Not available',
//         trackingHistory: response.data.trackingHistory || []
//       };

//       setTrackingResult(formattedResult);
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

//             {trackingResult.trackingHistory && trackingResult.trackingHistory.length > 0 && (
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
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DeliveryProgressTracker from './DeliveryProgressTracker';
import { TruckIcon, PhoneIcon, MapPinIcon, CalendarIcon, CreditCardIcon, UserIcon, CheckCircleIcon, XCircleIcon, SearchIcon } from 'lucide-react';

const TrackDeliveryPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define validation schema for the form
  const validationSchema = Yup.object({
    orderId: Yup.string().required('Order ID is required'),
    phone: Yup.string().required('Phone number is required')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      orderId: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setOrderData(null);
      
      try {
        // Use the full API URL - change this to match your backend server port (likely 3000 or 5000)
        const response = await axios.get(`http://localhost:5000/deliveries/track?orderId=${values.orderId}&phone=${values.phone}`);
        console.log('API Response:', response.data); // Debug log
        
        if (response.data && response.data.order) {
          setOrderData(response.data.order);
        } else {
          setError('No order data found');
        }
      } catch (err) {
        console.error('Error tracking order:', err);
        setError(err.response?.data?.message || 'Failed to track order');
      } finally {
        setLoading(false);
      }
    },
  });

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-200 text-yellow-800';
      case 'Assigned': return 'bg-blue-200 text-blue-800';
      case 'Out For Delivery': return 'bg-indigo-200 text-indigo-800';
      case 'Delivered': return 'bg-green-200 text-green-800';
      case 'Delivery Failed': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-full">
      {/* Hero Section with Background */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Track Your Gas Delivery</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Enter your order details below to get real-time updates on your delivery status
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10 transform -mt-16 relative z-10">
          <div className="md:flex">
            {/* Form Section */}
            <div className="md:w-3/5 p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <SearchIcon className="mr-2 h-6 w-6 text-blue-600" />
                Find Your Order
              </h2>
              
              <form onSubmit={formik.handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="orderId" className="block text-gray-700 font-medium mb-2">
                    Order ID
                  </label>
                  <div className="relative">
                    <input
                      id="orderId"
                      name="orderId"
                      type="text"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Enter your order ID"
                      value={formik.values.orderId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.orderId && formik.errors.orderId && (
                    <div className="text-red-600 mt-1 text-sm">{formik.errors.orderId}</div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Enter your phone number"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-red-600 mt-1 text-sm">{formik.errors.phone}</div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 flex items-center justify-center shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Tracking Order...
                    </>
                  ) : (
                    <>
                      <TruckIcon className="mr-2 h-5 w-5" />
                      Track Order
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Illustration or Info Section */}
            <div className="md:w-2/5 bg-blue-50 p-6 md:p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <TruckIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Track in Real-Time</h3>
                <p className="text-gray-600">
                  Get instant updates on your gas delivery status. Know exactly when your order will arrive.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-8 shadow-sm">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Order Data Display */}
        {orderData && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* Order Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-5">
              <div className="flex flex-wrap items-center justify-between">
                <h2 className="text-2xl font-bold">Order #{orderData.orderId}</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold mt-2 md:mt-0 ${getStatusColor(orderData.deliveryStatus)}`}>
                  {orderData.deliveryStatus}
                </span>
              </div>
            </div>
            
            {/* Delivery Progress */}
            <div className="p-6 bg-blue-50">  
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Delivery Progress</h3>
              <DeliveryProgressTracker status={orderData.deliveryStatus} />
            </div>
            
            {/* Order Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Details */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <UserIcon className="mr-2 h-5 w-5 text-blue-600" />
                    Customer Details
                  </h3>
                  <div className="space-y-3">
                    <p className="flex items-start">
                      <span className="font-medium w-24">Name:</span> 
                      <span className="text-gray-700">{orderData.customerName}</span>
                    </p>
                    <p className="flex items-start">
                      <span className="font-medium w-24">Phone:</span> 
                      <span className="text-gray-700">{orderData.phone}</span>
                    </p>
                    <p className="flex items-start">
                      <span className="font-medium w-24">Address:</span>
                      <span className="text-gray-700">{orderData.address}</span>
                    </p>
                  </div>
                </div>
                
                {/* Delivery Information */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <TruckIcon className="mr-2 h-5 w-5 text-blue-600" />
                    Delivery Information
                  </h3>
                  <div className="space-y-3">
                    <p className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium mr-2">Expected:</span> 
                      <span className="text-gray-700">{new Date(orderData.deliveryDate).toLocaleDateString()}</span>
                    </p>
                    <p className="flex items-center">
                      <CreditCardIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium mr-2">Payment:</span> 
                      <span className="text-gray-700">{orderData.paymentMethod}</span>
                    </p>
                    {orderData.deliveryStatus === "Delivered" && orderData.deliveredAt && (
                      <p className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="font-medium mr-2">Delivered:</span> 
                        <span className="text-gray-700">{new Date(orderData.deliveredAt).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Driver Information */}
              {orderData.driver && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <PhoneIcon className="mr-2 h-5 w-5 text-blue-600" />
                    Driver Information
                  </h3>
                  <div className="bg-blue-50 p-5 rounded-lg md:w-1/2">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{orderData.driver.name}</p>
                        <p className="text-sm text-gray-600">{orderData.driver.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Status for COD */}
              {orderData.paymentMethod === "Cash On Delivery" && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <CreditCardIcon className="mr-2 h-5 w-5 text-blue-600" />
                    Payment Status
                  </h3>
                  <div className="bg-gray-50 p-5 rounded-lg md:w-1/2">
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Status:</span>
                      {orderData.codPaid ? (
                        <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Payment Pending
                        </span>
                      )}
                    </p>
                    {orderData.codPaid && (
                      <p className="mt-3 flex items-center">
                        <span className="font-medium mr-2">Amount Received:</span>
                        <span className="text-gray-700 font-semibold">${orderData.amountReceived}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Help Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Need Help With Your Delivery?</h3>
              <p className="text-gray-600 mb-4">
                Our customer service team is available 24/7 to assist you with any questions 
                or concerns about your gas delivery.
              </p>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Call us: </span>
                <a href="tel:+1800123456" className="ml-2 text-blue-600 hover:text-blue-800">
                  1-800-123-456
                </a>
              </div>
            </div>
            <div className="bg-blue-50 p-6 md:w-1/3 flex items-center justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDeliveryPage;