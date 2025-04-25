// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";

// const DeliveryDetails = () => {
//   const { id } = useParams();
//   const [delivery, setDelivery] = useState(null);
//   const [status, setStatus] = useState("");
//   const [codPaid, setCodPaid] = useState(false);

//   useEffect(() => {
//     axios
//       .get(`http://localhost:5000/deliveries/${id}`)
//       .then((response) => {
//         setDelivery(response.data);
//         setStatus(response.data.status);
//         setCodPaid(response.data.codPaid);
//       })
//       .catch((error) => console.error("Error fetching delivery:", error));
//   }, [id]);

//   const updateDeliveryStatus = () => {
//     axios
//       .put(`http://localhost:5000/delivery/${id}/update-status`, { status })
//       .then(() => toast.success("Delivery status updated"))
//       .catch(() => toast.error("Error updating status"));
//   };

//   const handleCodPayment = () => {
//     axios
//       .put(`http://localhost:5000/delivery/${id}/cod-payment`, { codPaid: true })
//       .then(() => {
//         setCodPaid(true);
//         toast.success("COD payment marked as paid");
//       })
//       .catch(() => toast.error("Error updating COD payment"));
//   };

//   if (!delivery) return <p className="text-center text-gray-600">Loading...</p>;

//   return (
//     <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-center">Delivery Details</h2>
//       <div className="space-y-2">
//         <p><strong>Order ID:</strong> {delivery.orderId}</p>
//         <p><strong>Customer Name:</strong> {delivery.customerName}</p>
//         <p><strong>Address:</strong> {delivery.address}</p>
//         <p><strong>Current Status:</strong> <span className="font-semibold">{delivery.status}</span></p>
//       </div>
      
//       <h3 className="mt-6 text-lg font-semibold">Update Delivery Status:</h3>
//       <select 
//         className="w-full p-2 border rounded-md mt-2" 
//         value={status} 
//         onChange={(e) => setStatus(e.target.value)}
//       >
//         <option value="Out for Delivery">Out for Delivery</option>
//         <option value="Delivered">Delivered</option>
//         <option value="Delivery Failed">Delivery Failed</option>
//       </select>
//       <button 
//         onClick={updateDeliveryStatus} 
//         className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
//       >
//         Update Status
//       </button>

//       <h3 className="mt-6 text-lg font-semibold">Cash on Delivery Payment:</h3>
//       {codPaid ? (
//         <p className="text-green-600 font-semibold">Payment Received</p>
//       ) : (
//         <button 
//           onClick={handleCodPayment} 
//           className="mt-2 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
//         >
//           Mark as Paid
//         </button>
//       )}
//     </div>
//   );
// };

// export default DeliveryDetails;


// DeliveryDetails.jsx
import React from 'react';

const DeliveryDetails = ({ delivery }) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Info */}
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Order ID:</span>
            <span className="font-medium">{delivery.orderId}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Status:</span>
            <span className={`px-2 py-1 rounded text-white text-sm font-medium ${getStatusColor(delivery.deliveryStatus)}`}>
              {delivery.deliveryStatus}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Due Date:</span>
            <span>{new Date(delivery.deliveryDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Payment:</span>
            <span>{delivery.paymentMethod}</span>
          </div>
          {delivery.paymentMethod === 'Cash On Delivery' && (
            <div className="flex items-center">
              <span className="text-gray-500 w-32">Payment Status:</span>
              <span className={`${delivery.codPaid ? 'text-green-600' : 'text-red-600'}`}>
                {delivery.codPaid ? 'Paid' : 'Not Paid'}
              </span>
            </div>
          )}
          {delivery.codPaid && (
            <div className="flex items-center">
              <span className="text-gray-500 w-32">Amount Received:</span>
              <span>₹{delivery.amountReceived.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {/* Customer Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Customer Details</h3>
          <div className="flex items-start">
            <span className="text-gray-500 w-32">Name:</span>
            <span>{delivery.customerName}</span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 w-32">Address:</span>
            <span className="flex-1">{delivery.address}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Phone:</span>
            <div className="flex">
              <span>{delivery.phone}</span>
              <a 
                href={`tel:${delivery.phone}`} 
                className="ml-2 text-blue-500 hover:text-blue-700"
                title="Call customer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-gray-500';
    case 'Assigned':
      return 'bg-blue-500';
    case 'Out For Delivery':
      return 'bg-yellow-500';
    case 'Delivered':
      return 'bg-green-500';
    case 'Delivery Failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export default DeliveryDetails;
