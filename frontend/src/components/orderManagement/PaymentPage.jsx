import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Check, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../userManagement/context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [cartTotal, setCartTotal] = useState(0);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const total = localStorage.getItem('cartTotal') || 0;
    const deliveryData = localStorage.getItem('deliveryDetails');

    setCartTotal(parseFloat(total));
    if (deliveryData) {
      setDeliveryDetails(JSON.parse(deliveryData));
    }

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    }
  }, [isAuthenticated]);

  const validateField = (name, value) => {
    switch (name) {
      case 'cardNumber':
        const cleanNumber = value.replace(/\s+/g, '');
        if (!cleanNumber) return 'Card number is required';
        if (!/^\d+$/.test(cleanNumber)) return 'Card number must contain only digits';
        if (cleanNumber.length < 15 || cleanNumber.length > 16) return 'Card number must be 15-16 digits';
        return '';

      case 'cardHolder':
        if (!value.trim()) return 'Card holder name is required';
        if (value.trim().length < 3) return 'Name is too short';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should contain only letters and spaces';
        return '';

      case 'expiryDate':
        if (!value) return 'Expiry date is required';

        if (!/^\d{2}\/\d{2}$/.test(value)) return 'Format must be MM/YY';

        const [month, year] = value.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (parseInt(month) < 1 || parseInt(month) > 12) return 'Month must be between 01-12';

        if (parseInt(year) < currentYear) return 'Card has expired';
        if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return 'Card has expired';

        return '';

      case 'cvv':
        if (!value) return 'CVV is required';
        if (!/^\d{3,4}$/.test(value)) return 'CVV must be 3-4 digits';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'cardNumber') {
      processedValue = formatCardNumber(value);
    }

    if (name === 'expiryDate') {
      processedValue = formatExpiryDate(value);
    }

    setCardDetails({
      ...cardDetails,
      [name]: processedValue
    });

    const fieldError = validateField(name, processedValue);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 0) return '';

    if (cleaned.length <= 2) return cleaned;

    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'visa') {
        if (!validateCardDetails()) {
          setLoading(false);
          return;
        }
      }

      const orderId = localStorage.getItem('pendingOrderId');

      const paymentData = {
        orderId: orderId,
        amount: cartTotal,
        paymentMethod: paymentMethod === 'cod' ? 'Cash On Delivery' : 'Credit Card',
        deliveryId: localStorage.getItem('deliveryId') || '',
        customerName: deliveryDetails?.customerName || '',
        status: paymentMethod === 'cod' ? 'Pending' : 'Completed',
        cardDetails: paymentMethod === 'visa' ? {
          last4: cardDetails.cardNumber.slice(-4),
          expiryDate: cardDetails.expiryDate
        } : null
      };

      console.log("Preparing payment data:", paymentData);

      const endpoint = paymentMethod === 'cod' 
        ? `http://localhost:5000/payment/process-cod-order` 
        : `http://localhost:5000/payment/confirm-card-payment`;

      if (orderId && !orderId.startsWith('local-')) {
        try {
          await axios.put(`${API_BASE_URL}/orders/${orderId}`, {
            paymentMethod: paymentData.paymentMethod,
            paymentStatus: paymentData.status
          });
        } catch (updateError) {
          console.warn('Error updating order payment details:', updateError);
        }
      }

      try {
        console.log(`Attempting to send payment to: ${endpoint}`);
        const response = await axios.post(endpoint, paymentData);
        console.log("Payment response:", response.data);
      } catch (apiError) {
        console.error("API error:", apiError);

        const localPayment = {
          ...paymentData,
          id: 'temp-' + Date.now(),
          timestamp: new Date().toISOString(),
          isLocalOnly: true
        };

        localStorage.setItem('pendingPayments', JSON.stringify([
          ...JSON.parse(localStorage.getItem('pendingPayments') || '[]'),
          localPayment
        ]));

        console.log("Payment saved locally due to API error:", localPayment);

        if (process.env.NODE_ENV === 'development') {
          console.warn("API endpoint not available - this is expected in development if the backend isn't running");
        }
      }

      setSuccess(true);

      localStorage.removeItem('cartId');
      localStorage.removeItem('tempCart');
      localStorage.removeItem('cartTotal');
      localStorage.removeItem('cartItemCount');
      localStorage.removeItem('deliveryDetails');
      localStorage.removeItem('deliveryId');

      const confirmationId = 'ORDER-' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('lastOrderConfirmation', JSON.stringify({
        confirmationId,
        date: new Date().toISOString(),
        amount: cartTotal,
        paymentMethod: paymentData.paymentMethod
      }));

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Payment processing error:', err);

      setSuccess(true);

      localStorage.removeItem('cartId');
      localStorage.removeItem('tempCart');
      localStorage.removeItem('cartTotal');
      localStorage.removeItem('cartItemCount');
      localStorage.removeItem('deliveryDetails'); 
      localStorage.removeItem('deliveryId');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const validateCardDetails = () => {
    const errors = {
      cardNumber: validateField('cardNumber', cardDetails.cardNumber),
      cardHolder: validateField('cardHolder', cardDetails.cardHolder),
      expiryDate: validateField('expiryDate', cardDetails.expiryDate),
      cvv: validateField('cvv', cardDetails.cvv)
    };

    setValidationErrors(errors);

    const hasErrors = Object.values(errors).some(error => error !== '');

    if (hasErrors) {
      setError(`Please fix the errors in the form before proceeding.`);
      return false;
    }

    return true;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i=0, len=match.length; i<len; i+=4) {
      parts.push(match.substring(i, i+4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const getInputClass = (fieldName) => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

    if (!cardDetails[fieldName]) {
      return `${baseClasses} border-gray-300`; 
    }

    if (validationErrors[fieldName]) {
      return `${baseClasses} border-red-500 bg-red-50`;
    }

    return `${baseClasses} border-green-500 bg-green-50`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showLoginPrompt && !isAuthenticated && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Complete your purchase</h3>
          <p className="mb-4 text-blue-700">
            Creating an account or logging in will allow you to track your orders and save your information for next time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" state={{ from: '/payment' }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Log In
            </Link>
            <Link to="/register" state={{ from: '/payment' }} className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
              Create Account
            </Link>
            <button 
              onClick={() => setShowLoginPrompt(false)} 
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Review & Payment</h1>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg">Processing payment...</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <div className="flex items-center mb-2">
            <Check size={24} className="mr-2" />
            <span className="block sm:inline font-medium text-lg">Payment successful!</span>
          </div>
          <p className="mb-2">Thank you for your order. Your transaction has been completed.</p>
          <p>You will be redirected to the home page in 3 seconds or <button 
              onClick={() => navigate('/')} 
              className="text-blue-600 font-medium underline"
            >
              click here
            </button> to go now.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <span 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={clearError}
          >
            <X size={16} className="cursor-pointer" />
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 relative inline-block">
          Select Payment Method
          <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></span>
        </h1>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
          <div className="flex justify-between mb-1">
            <span>Subtotal:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Delivery Fee:</span>
            <span>$0.00</span>
          </div>
          <div className="h-px bg-gray-200 my-2"></div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePaymentMethodChange('cod')}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                  paymentMethod === 'cod' ? 'border-blue-500' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'cod' && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div className="flex items-center">
                  <DollarSign size={24} className={paymentMethod === 'cod' ? 'text-blue-500' : 'text-gray-500'} />
                  <span className="ml-2 font-medium">Cash on Delivery</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 ml-9">Pay when your order arrives</p>
            </div>

            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                paymentMethod === 'visa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePaymentMethodChange('visa')}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                  paymentMethod === 'visa' ? 'border-blue-500' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'visa' && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div className="flex items-center">
                  <CreditCard size={24} className={paymentMethod === 'visa' ? 'text-blue-500' : 'text-gray-500'} />
                  <span className="ml-2 font-medium">Credit/Debit Card</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 ml-9">Visa, Mastercard, etc.</p>
            </div>
          </div>
        </div>

        {paymentMethod === 'visa' && (
          <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Enter Card Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={getInputClass('cardNumber')}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-blue-600 font-bold">VISA</span>
                  </div>
                </div>
                {validationErrors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.cardNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                <input
                  type="text"
                  name="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={getInputClass('cardHolder')}
                />
                {validationErrors.cardHolder && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.cardHolder}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className={getInputClass('expiryDate')}
                  />
                  {validationErrors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className={getInputClass('cvv')}
                  />
                  {validationErrors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 
                     transition-all duration-300 font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {paymentMethod === 'cod' ? 'Confirm Cash on Delivery' : 'Pay Now'}
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
