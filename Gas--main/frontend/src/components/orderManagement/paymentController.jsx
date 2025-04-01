import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51R4f2SP4ZdNvaffvjcpt5GZf3EyNNBEd4FEv6vAaRJCyzJ4ZF9shvWg3rQyHVRTa6maRdyiLQgHOjUVVJZI5SC29005ZfUcM4G');

const PaymentForm = ({ total, onProceedToAddress }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({ 
    cardNumber: '', 
    expiry: '', 
    cvv: '',
    cardType: '' 
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    // Format based on card type
    if (cardDetails.cardType === 'amex') {
      // XXXX XXXXXX XXXXX for AMEX
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
    } else {
      // XXXX XXXX XXXX XXXX for other cards
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
    }

    return parts.length > 0 ? parts.join(' ') : value;
  };

  // Format expiry date as MM/YY
  const formatExpiry = (value) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    if (cleanValue.length >= 3) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
    } else if (cleanValue.length === 2) {
      return cleanValue + '/';
    }
    return cleanValue;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setErrors({});
    setStripeError(null);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formattedValue = formatCardNumber(value);
      setCardDetails({ ...cardDetails, [name]: formattedValue });
    } 
    else if (name === 'expiry') {
      // Format as MM/YY
      const formattedValue = formatExpiry(value);
      setCardDetails({ ...cardDetails, [name]: formattedValue });
    } 
    else if (name === 'cvv') {
      // Only allow numbers, limit to different lengths based on card type
      const maxLength = cardDetails.cardType === 'amex' ? 4 : 3;
      const sanitizedValue = value.replace(/\D/g, '').substring(0, maxLength);
      setCardDetails({ ...cardDetails, [name]: sanitizedValue });
    } 
    else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  // Detect card type based on first digits
  const detectCardType = (cardNumber) => {
    const visaPattern = /^4/;
    const mastercardPattern = /^(5[1-5]|2[2-7])/;
    const amexPattern = /^3[47]/;
    
    const number = cardNumber.replace(/\D/g, '');
    
    if (visaPattern.test(number)) return 'visa';
    if (mastercardPattern.test(number)) return 'mastercard';
    if (amexPattern.test(number)) return 'amex';
    return '';
  };

  // Auto-detect card type when number changes
  useEffect(() => {
    if (cardDetails.cardNumber.length >= 2) {
      const detectedType = detectCardType(cardDetails.cardNumber);
      if (detectedType && detectedType !== cardDetails.cardType) {
        setCardDetails({ ...cardDetails, cardType: detectedType });
      }
    }
  }, [cardDetails.cardNumber]);

  // Validate card number based on card type
  const validateCardNumber = (number, type) => {
    const cardNumberWithoutSpaces = number.replace(/\s/g, '');
    
    // Card type specific validation
    if (type === 'visa') {
      // Visa starts with 4 and has 13, 16, or 19 digits
      if (!/^4[0-9]{12}(?:[0-9]{3}(?:[0-9]{3})?)?$/.test(cardNumberWithoutSpaces)) {
        return false;
      }
    } else if (type === 'mastercard') {
      // Mastercard starts with 51-55 or 2221-2720 and has 16 digits
      if (!/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(cardNumberWithoutSpaces)) {
        return false;
      }
    } else if (type === 'amex') {
      // American Express starts with 34 or 37 and has 15 digits
      if (!/^3[47][0-9]{13}$/.test(cardNumberWithoutSpaces)) {
        return false;
      }
    } else {
      return false; // No card type selected
    }
    
    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cardNumberWithoutSpaces.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumberWithoutSpaces.charAt(i));

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
  };

  const validateExpiry = (expiry) => {
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) {
      return false;
    }
    
    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
    const today = new Date();
    
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    expiryDate.setDate(0);
    
    return expiryDate > today;
  };

  const validateCVV = (cvv, cardType) => {
    if (cardType === 'amex') {
      return /^\d{4}$/.test(cvv);
    }
    return /^\d{3}$/.test(cvv);
  };

  const handleManualCardSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Card type is automatically detected, but validate it exists
    if (!cardDetails.cardType) {
      newErrors.cardType = 'Card type could not be determined';
    }
    
    if (!cardDetails.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cardDetails.cardNumber, cardDetails.cardType)) {
      newErrors.cardNumber = `Invalid ${cardDetails.cardType === 'amex' ? 'American Express' : cardDetails.cardType === 'mastercard' ? 'Mastercard' : 'Visa'} card number`;
    }
    
    if (!cardDetails.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!validateExpiry(cardDetails.expiry)) {
      newErrors.expiry = 'Invalid or expired date';
    }
    
    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!validateCVV(cardDetails.cvv, cardDetails.cardType)) {
      newErrors.cvv = `CVV must be ${cardDetails.cardType === 'amex' ? '4' : '3'} digits`;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onProceedToAddress(paymentMethod, cardDetails);
  };

  const handleStripeSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    setStripeError(null);
    
    const cardElement = elements.getElement(CardElement);
    
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
    
    if (error) {
      setStripeError(error.message);
      setIsProcessing(false);
      return;
    }
    
    onProceedToAddress('Card', { 
      stripePaymentMethodId: paymentMethod.id,
      last4: paymentMethod.card.last4,
      brand: paymentMethod.card.brand
    });
    
    setIsProcessing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'COD') {
      onProceedToAddress(paymentMethod, {});
    } else if (paymentMethod === 'Card') {
      if (stripe && elements) {
        handleStripeSubmit(e);
      } else {
        handleManualCardSubmit(e);
      }
    }
  };

  // Get card type icon/logo
  const getCardTypeIcon = () => {
    if (!cardDetails.cardType) return null;
    
    switch(cardDetails.cardType) {
      case 'visa':
        return (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-600 font-bold">
            MC
          </div>
        );
      case 'amex':
        return (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-800 font-bold">
            AMEX
          </div>
        );
      default:
        return null;
    }
  };

  // Stripe card element styles
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Payment Portal</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-semibold">Select Payment Method:</label>
          <div className="flex gap-4">
            <div 
              onClick={() => handlePaymentMethodChange('Card')} 
              className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'} flex items-center justify-center`}>
                  {paymentMethod === 'Card' && <div className="w-3 h-3 rounded-full bg-white"></div>}
                </div>
                <span className="font-medium">Card Payment</span>
              </div>
            </div>
            
            <div 
              onClick={() => handlePaymentMethodChange('COD')} 
              className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'} flex items-center justify-center`}>
                  {paymentMethod === 'COD' && <div className="w-3 h-3 rounded-full bg-white"></div>}
                </div>
                <span className="font-medium">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {paymentMethod === 'Card' && stripe && elements ? (
          // Stripe Elements Card Form
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-semibold">Card Details:</label>
            <div className="p-4 border border-gray-300 rounded-lg mb-3">
              <CardElement options={cardElementOptions} />
            </div>
            {stripeError && <p className="text-red-500 text-sm mb-3">{stripeError}</p>}
          </div>
        ) : paymentMethod === 'Card' ? (
          // Custom card form with improved UI
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-semibold">Card Details:</label>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-1">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className={`w-full p-3 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:border-blue-500 focus:outline-none transition pr-14`}
                  value={cardDetails.cardNumber}
                  onChange={handleCardInputChange}
                  maxLength={cardDetails.cardType === 'amex' ? 17 : 19}
                />
                {getCardTypeIcon()}
              </div>
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Expiry Date</label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  className={`w-full p-3 border ${errors.expiry ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:border-blue-500 focus:outline-none transition`}
                  value={cardDetails.expiry}
                  onChange={handleCardInputChange}
                  maxLength={5}
                />
                {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-1">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  placeholder={cardDetails.cardType === 'amex' ? "4 digits" : "3 digits"}
                  className={`w-full p-3 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:border-blue-500 focus:outline-none transition`}
                  value={cardDetails.cvv}
                  onChange={handleCardInputChange}
                  maxLength={cardDetails.cardType === 'amex' ? 4 : 3}
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        ) : null}

        {paymentMethod && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full p-3 rounded-lg font-semibold transition-all ${paymentMethod ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          disabled={!paymentMethod || isProcessing}
        >
          {isProcessing ? 'Processing...' : paymentMethod === 'COD' ? 'Continue to Delivery Details' : 'Continue to Delivery Details'}
        </button>
      </form>
    </div>
  );
};

const AddressForm = ({ total, paymentMethod, onCompleteOrder }) => {
  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'zip') {
      // Only allow numbers and limit to 5 characters for ZIP
      const sanitizedValue = value.replace(/\D/g, '').substring(0, 5);
      setAddress({ ...address, [name]: sanitizedValue });
    } 
    else if (name === 'phone') {
      // Only allow numbers and limit to 10 digits for phone
      const sanitizedValue = value.replace(/\D/g, '').substring(0, 10);
      setAddress({ ...address, [name]: sanitizedValue });
    } 
    else {
      setAddress({ ...address, [name]: value });
    }
  };

  const validateAddress = () => {
    const newErrors = {};
    
    if (!address.fullName || address.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    
    if (!address.street || address.street.trim().length < 5) {
      newErrors.street = 'Street address must be at least 5 characters';
    }
    
    if (!address.city || address.city.trim().length < 2) {
      newErrors.city = 'City is required';
    }
    
    if (!address.state || address.state.trim().length < 2) {
      newErrors.state = 'State/Province is required';
    }
    
    if (!address.zip || address.zip.length < 5) {
      newErrors.zip = 'ZIP code must be 5 digits';
    }
    
    if (!address.phone || address.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateAddress();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onCompleteOrder(address);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              className={`w-full p-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
              value={address.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="street"
              className={`w-full p-3 border ${errors.street ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
              value={address.street}
              onChange={handleInputChange}
            />
            {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                className={`w-full p-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                value={address.city}
                onChange={handleInputChange}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-1">State/Province</label>
              <input
                type="text"
                name="state"
                className={`w-full p-3 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                value={address.state}
                onChange={handleInputChange}
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                name="zip"
                className={`w-full p-3 border ${errors.zip ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                value={address.zip}
                onChange={handleInputChange}
              />
              {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                value={address.phone}
                onChange={handleInputChange}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="flex justify-between mb-2">
            <span>Payment Method:</span>
            <span className="font-medium">{paymentMethod}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount:</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {paymentMethod === 'COD' ? 'Complete Order' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

const CheckoutFlow = () => {
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [cart, setCart] = useState({
    items: [
      { id: 1, name: 'Product 1', price: 5999, quantity: 1 },
      { id: 2, name: 'Product 2', price: 7999, quantity: 2 }
    ],
    total: 21997
  });

  const handleCheckoutClick = () => {
    setCheckoutStep('payment');
  };

  const handleProceedToAddress = (paymentMethod, cardDetails) => {
    setPaymentInfo({ method: paymentMethod, ...cardDetails });
    setCheckoutStep('address');
  };

  const handleCompleteOrder = async (address) => {
    // Here you would typically send the order to your backend
    console.log('Order completed with:', { 
      items: cart.items,
      total: cart.total,
      payment: paymentInfo,
      address: address
    });
    
    // If using Stripe, you would confirm the payment here
    if (paymentInfo.method === 'Card' && paymentInfo.stripePaymentMethodId) {
      // Simulate payment processing
      // In production, you would make an API call to your backend
    }
    
    setOrderPlaced(true);
    setCheckoutStep('confirmation');
  };

  return (
    <div className="p-4">
      {checkoutStep === 'cart' && (
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Cart</h2>
          <div className="space-y-3 mb-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <p>Total:</p>
            <p>Rs. {cart.total.toLocaleString()}</p>
          </div>
          <button
            onClick={handleCheckoutClick}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {checkoutStep === 'payment' && (
        <Elements stripe={stripePromise}>
          <PaymentForm 
            total={cart.total} 
            onProceedToAddress={handleProceedToAddress}
          />
        </Elements>
      )}

      {checkoutStep === 'address' && (
        <AddressForm 
          total={cart.total}
          paymentMethod={paymentInfo.method}
          onCompleteOrder={handleCompleteOrder}
        />
      )}

      {checkoutStep === 'confirmation' && (
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase. Your order confirmation has been sent to your email.</p>
          <button
            onClick={() => setCheckoutStep('cart')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Return to Shop
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutFlow;