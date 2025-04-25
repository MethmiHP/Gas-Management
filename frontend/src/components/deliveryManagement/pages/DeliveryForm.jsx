import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeliveryForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  // Form data state
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    address: '',
    phone: '',
    deliveryDate: formatDate(new Date(Date.now() + 86400000)), // Default to tomorrow
    paymentMethod: 'Prepaid'
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    orderId: '',
    customerName: '',
    address: '',
    phone: '',
    deliveryDate: '',
    paymentMethod: ''
  });

  // Format date for the input field (YYYY-MM-DD)
  function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  // Validates a single field
  const validateField = (name, value) => {
    switch (name) {
      case 'orderId':
        if (!value.trim()) return 'Order ID is required';
        if (value.length < 3) return 'Order ID should be at least 3 characters';
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) return 'Order ID should contain only letters, numbers, hyphens, and underscores';
        return '';
      
      case 'customerName':
        if (!value.trim()) return 'Customer name is required';
        if (value.length < 3) return 'Name should be at least 3 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should contain only letters and spaces';
        return '';
      
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.length < 10) return 'Please enter a complete address (at least 10 characters)';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\d{10}$/.test(value)) return 'Phone number should be 10 digits';
        return '';
      
      case 'deliveryDate':
        if (!value) return 'Delivery date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Delivery date cannot be in the past';
        return '';
      
      case 'paymentMethod':
        if (!value) return 'Payment method is required';
        if (!['Prepaid', 'Cash On Delivery'].includes(value)) return 'Invalid payment method';
        return '';
      
      default:
        return '';
    }
  };

  // Validate all fields and return true if form is valid
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validate each field
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      newErrors[key] = error;
      if (error) isValid = false;
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate the field on change and update error state
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      setMessage({ 
        type: 'error', 
        content: 'Please fix the errors in the form before submitting' 
      });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      // Format the data for the API
      const deliveryData = {
        ...formData,
        deliveryStatus: 'Pending'
      };

      console.log("Sending delivery data:", deliveryData);

      // Send the data to your API - try using axios instead of fetch for better error handling
      const response = await fetch('http://localhost:5000/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData),
      });

      // Check if the response is ok before proceeding
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", response.status, errorData);
        
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      setMessage({ 
        type: 'success', 
        content: 'Delivery information submitted successfully!' 
      });
      
      // Store delivery data in localStorage for use in payment page
      localStorage.setItem('deliveryId', data?.data?._id || data?.data?.id || '');
      localStorage.setItem('deliveryDetails', JSON.stringify(deliveryData));
      
      // Reset form after successful submission
      setFormData({
        orderId: '',
        customerName: '',
        address: '',
        phone: '',
        deliveryDate: formatDate(new Date(Date.now() + 86400000)),
        paymentMethod: 'Prepaid'
      });
      
      // Reset errors
      setErrors({
        orderId: '',
        customerName: '',
        address: '',
        phone: '',
        deliveryDate: '',
        paymentMethod: ''
      });
      
      // Navigate to payment page after 2 seconds
      setTimeout(() => {
        navigate('/payment');
      }, 2000);
      
    } catch (err) {
      console.error("Delivery submission error:", err);
      
      // If server is unavailable, save data locally and proceed
      if (err.message.includes("Failed to fetch") || !window.navigator.onLine) {
        // Save to localStorage with a temporary ID
        const tempDeliveryData = {
          ...formData,
          id: 'temp-' + Date.now(),
          deliveryStatus: 'Pending',
          isLocalOnly: true
        };
        
        localStorage.setItem('deliveryDetails', JSON.stringify(tempDeliveryData));
        localStorage.setItem('pendingDeliveries', JSON.stringify([
          ...JSON.parse(localStorage.getItem('pendingDeliveries') || '[]'),
          tempDeliveryData
        ]));
        
        setMessage({ 
          type: 'warning', 
          content: 'Server unavailable. Delivery saved locally and will sync when connection is restored.' 
        });
        
        // Still navigate to payment after warning user
        setTimeout(() => {
          navigate('/payment');
        }, 2000);
        
        setIsLoading(false);
        return;
      }
      
      let errorMessage = err.message;
      
      // Handle duplicate orderId error
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        setErrors({
          ...errors,
          orderId: 'This Order ID already exists in the system'
        });
        errorMessage = 'Order ID already exists. Please use a unique Order ID.';
      }
      
      setMessage({ 
        type: 'error', 
        content: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to apply input styles based on validation state
  const getInputClasses = (fieldName) => {
    return `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[fieldName] 
        ? 'border-red-500 bg-red-50' 
        : formData[fieldName] 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-300'
    }`;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white">
            <h2 className="text-xl font-semibold">Add Delivery Information</h2>
            <p className="text-blue-100">Enter customer delivery details</p>
          </div>
          
          {/* Form Container */}
          <div className="p-6">
            {message.content && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 
                message.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {message.content}
              </div>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID*
                  </label>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('orderId')}
                    required
                    placeholder="Enter unique order ID"
                  />
                  {errors.orderId && (
                    <p className="mt-1 text-sm text-red-600">{errors.orderId}</p>
                  )}
                </div>
                
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name*
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('customerName')}
                    required
                    placeholder="Enter customer's full name"
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                  )}
                </div>
                
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('phone')}
                    required
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                
                {/* Delivery Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date*
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('deliveryDate')}
                    required
                    min={formatDate(new Date())}
                  />
                  {errors.deliveryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
                  )}
                </div>
                
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method*
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('paymentMethod')}
                    required
                  >
                    <option value="Prepaid">Prepaid</option>
                    <option value="Cash On Delivery">Cash On Delivery</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                  )}
                </div>
              </div>
              
              {/* Address - Full Width */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address*
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses('address')}
                  rows="3"
                  required
                  placeholder="Enter complete delivery address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 transition duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Create Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

