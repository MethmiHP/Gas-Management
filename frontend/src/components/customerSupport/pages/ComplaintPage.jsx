// ComplaintPage.jsx
import React, { useState } from 'react';
import ComplaintService from '../services/complaint.services';

const ComplaintPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    complain: ''
  });
  
  // Form errors state
  const [errors, setErrors] = useState({});
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.customerPhone.replace(/[^0-9]/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.complain.trim()) {
      newErrors.complain = 'Complaint details are required';
    } else if (formData.complain.trim().length < 10) {
      newErrors.complain = 'Please provide more details (minimum 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await ComplaintService.addComplaint(formData);
      setSubmittedComplaint(response.complaint);
      setIsSuccessModalOpen(true);
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        complain: ''
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setErrors({
        submission: error.error || 'Failed to submit your complaint. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close success modal
  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Complaint Ticket Submission</h1>
        
        {errors.submission && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors.submission}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-blue-900">
              Full Name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md p-2 border ${
                errors.customerName ? 'border-red-300' : 'border-gray-400'
              }`}
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-blue-900">
              Email Address
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md p-2 border ${
                errors.customerEmail ? 'border-red-300' : 'border-gray-400'
              }`}
              placeholder="e.g:abcd@gmail.com"
            />
            {errors.customerEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
            )}
            
          </div>
          
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-blue-900">
              Phone Number
            </label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md p-2 border ${
                errors.customerPhone ? 'border-red-300' : 'border-gray-400'
              }`}
              placeholder="Ensure number is active"
            />
            {errors.customerPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="complain" className="block text-sm font-medium text-blue-900">
              Complaint
            </label>
            <textarea
              id="complain"
              name="complain"
              rows={5}
              value={formData.complain}
              onChange={handleChange}
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md p-2 border ${
                errors.complain ? 'border-red-300' : 'border-gray-400'
              }`}
              placeholder="Please describe your issue in detail..."
            />
            {errors.complain && (
              <p className="mt-1 text-sm text-red-600">{errors.complain}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Success Modal using standard HTML instead of Headless UI */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Complaint Submitted Successfully
                </h3>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your complaint has been received and is being processed. Please save your complaint ID for future reference.
                  </p>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Complaint ID: <span className="font-bold">{submittedComplaint?.complaintID}</span></p>
                    <p className="text-sm text-gray-700 mt-1">Status: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {submittedComplaint?.status}
                    </span></p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={closeSuccessModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintPage;