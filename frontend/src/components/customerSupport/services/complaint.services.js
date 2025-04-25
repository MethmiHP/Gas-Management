// complaint.services.js

const API_URL = 'http://localhost:5000/api/complaints';  // Updated to the correct URL

// Service functions for handling complaint API operations
export const ComplaintService = {
  // Add a new complaint
  addComplaint: async (complaintData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData.error || { error: `Request failed with status ${response.status}` };
      }
      
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error || { error: 'Failed to submit complaint' };
    }
  },
  
  // Get all complaints (could be used for an admin view or for a user to see their complaints)
  getAllComplaints: async () => {
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData.error || { error: `Request failed with status ${response.status}` };
      }
      
      return await response.json();
    } catch (error) {
      throw error || { error: 'Failed to fetch complaints' };
    }
  },
  
  // Get a single complaint by ID
  getComplaintById: async (complaintId) => {
    try {
      const response = await fetch(`${API_URL}/${complaintId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData.error || { error: `Request failed with status ${response.status}` };
      }
      
      return await response.json();
    } catch (error) {
      throw error || { error: 'Failed to fetch complaint details' };
    }
  },
  
  // Track a complaint by ID (public method that might not require authentication)
  trackComplaint: async (complaintId) => {
    try {
      const response = await fetch(`${API_URL}/track/${complaintId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData.error || { error: `Request failed with status ${response.status}` };
      }
      
      return await response.json();
    } catch (error) {
      throw error || { error: 'Failed to track complaint' };
    }
  }
};

export default ComplaintService;