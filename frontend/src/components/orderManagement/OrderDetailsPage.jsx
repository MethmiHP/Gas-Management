import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, FiDownload, FiClock, FiDollarSign, FiCreditCard, 
  FiTruck, FiPackage, FiUser, FiCalendar, FiFileText
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        
        if (response.data && response.data.success) {
          setOrder(response.data.data);
        } else {
          throw new Error('Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Unable to load order details. Please try again later.');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102); // Dark blue color
      doc.text("Nelson Gas Enterprises", 105, 20, { align: "center" });
      
      doc.setFontSize(16);
      doc.text("Order Receipt", 105, 30, { align: "center" });
      
      // Add order metadata
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Order ID: #${order.orderId}`, 20, 50);
      doc.text(`Date: ${formatDate(order.timestamp || order.createdAt)}`, 20, 60);
      doc.text(`Customer: ${order.userName}`, 20, 70);
      doc.text(`Order Type: ${order.orderType}`, 20, 80);
      doc.text(`Payment Method: ${order.paymentMethod}`, 20, 90);
      doc.text(`Payment Status: ${order.paymentStatus}`, 20, 100);
      
      // Add items table if present
      if (order.items && order.items.length > 0) {
        doc.text("Order Items:", 20, 120);
        
        const tableColumn = ["Item", "Quantity", "Price", "Subtotal"];
        const tableRows = order.items.map(item => [
          item.productName,
          item.quantity,
          formatCurrency(item.price),
          formatCurrency(item.price * item.quantity)
        ]);
        
        doc.autoTable({
          startY: 130,
          head: [tableColumn],
          body: tableRows,
          theme: 'striped',
          headStyles: { fillColor: [0, 51, 102] }
        });
      }
      
      // Add subtotal and totals at the bottom
      const totalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 150;
      if (order.discount && order.discount > 0) {
        doc.text(`Discount: ${order.discount}%`, 140, totalY);
      }
      doc.text(`Total Amount: ${formatCurrency(order.amount || calculateTotal())}`, 140, totalY + 10);
      
      // Add footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Nelson Gas Enterprises - Thank you for your business!", 105, pageHeight - 10, { align: "center" });
      
      // Save the PDF
      doc.save(`Order_${order.orderId}.pdf`);
      toast.success('Order receipt generated successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate receipt');
    }
  };

  const calculateTotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    
    const subtotal = order.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    if (order.discount && order.discount > 0) {
      return subtotal * (1 - (order.discount / 100));
    }
    
    return subtotal;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error || 'Order not found'}</p>
              <button 
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
                onClick={() => navigate(-1)}
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        </div>
        
        <button
          onClick={generatePDF}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <FiDownload className="mr-2" />
          Download Receipt
        </button>
      </div>
      
      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiFileText className="mr-2 text-blue-500" />
              Order Summary
            </h2>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-3">
                <FiClock className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Order ID:</span>
                <span className="ml-2 font-medium">#{order.orderId}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <FiCalendar className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Date:</span>
                <span className="ml-2">{formatDate(order.timestamp || order.createdAt)}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <FiUser className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Customer:</span>
                <span className="ml-2">{order.userName}</span>
              </div>
              
              <div className="flex items-center">
                <FiPackage className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Order Type:</span>
                <span className="ml-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${order.orderType === 'Accessories' ? 'bg-purple-100 text-purple-800' : 
                    'bg-blue-100 text-blue-800'}`}>
                    {order.orderType}
                  </span>
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-3">
                <FiCreditCard className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Payment Method:</span>
                <span className="ml-2">{order.paymentMethod}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <FiDollarSign className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Payment Status:</span>
                <span className="ml-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border 
                    ${getStatusBadgeClass(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-500">Discount:</span>
                  <span className="ml-2">{order.discount}%</span>
                </div>
              )}
              
              {order.deliveryStatus && (
                <div className="flex items-center">
                  <FiTruck className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-500">Delivery Status:</span>
                  <span className="ml-2">{order.deliveryStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
          </div>
        </div>
        
        <div className="px-6 py-4">
          {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatCurrency(item.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(item.price * item.quantity)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No items data available for this order.</p>
            </div>
          )}
          
          {/* Order Totals */}
          {order.items && Array.isArray(order.items) && order.items.length > 0 && (
            <div className="mt-6 flex justify-end">
              <div className="bg-gray-50 rounded-lg p-4 w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                </div>
                
                {order.discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({order.discount}%):</span>
                    <span>-{formatCurrency(calculateTotal() * (order.discount / 100))}</span>
                  </div>
                )}
                
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(order.amount || 
                      (order.discount ? calculateTotal() * (1 - order.discount/100) : calculateTotal()))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
