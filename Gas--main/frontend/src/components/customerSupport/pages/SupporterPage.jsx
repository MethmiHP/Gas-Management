import React, { useState, useEffect } from 'react';
import { ComplaintService } from '../services/complaint.services'; // Adjust the path as needed
import { FaCheck, FaTrash, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';

const SupporterPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('in progress');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);

  // Fetch all complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await ComplaintService.getAllComplaints();
      setComplaints(data);
      setError(null);
    } catch (err) {
      setError('Failed to load complaints. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setReply(complaint.reply || '');
    setStatus(complaint.status);
    setModalOpen(true);
  };

  const openDeleteModal = (complaint) => {
    setComplaintToDelete(complaint);
    setDeleteModalOpen(true);
  };

  const handleUpdateComplaint = async () => {
    if (!reply.trim()) {
      alert('Please provide a reply before updating the complaint');
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/complaints/${selectedComplaint.complaintID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reply }),
      });
      
      // Update the local state with the new data
      setComplaints(complaints.map(complaint => 
        complaint.complaintID === selectedComplaint.complaintID 
          ? { ...complaint, status, reply }
          : complaint
      ));
      
      setModalOpen(false);
      alert('Complaint updated successfully!');
    } catch (err) {
      console.error('Failed to update complaint:', err);
      alert('Failed to update complaint. Please try again.');
    }
  };

  const handleDeleteComplaint = async () => {
    try {
      await fetch(`http://localhost:5000/api/complaints/${complaintToDelete.complaintID}`, {
        method: 'DELETE',
      });
      
      // Remove the deleted complaint from the state
      setComplaints(complaints.filter(
        complaint => complaint.complaintID !== complaintToDelete.complaintID
      ));
      
      setDeleteModalOpen(false);
      alert('Complaint deleted successfully!');
    } catch (err) {
      console.error('Failed to delete complaint:', err);
      alert('Failed to delete complaint. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) return <div className="text-center p-8">Loading complaints...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-blue-900 font-bold mb-6">Complaint Dashboard</h1>
      
      {complaints.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          No complaints found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Complaint</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Reply</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.complaintID} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{complaint.complaintID}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{complaint.customerName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>{complaint.customerEmail}</div>
                    <div>{complaint.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {complaint.complain}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${complaint.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {complaint.reply || 'No reply yet'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => openUpdateModal(complaint)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Update"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(complaint)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update Complaint</h2>
            <div className="mb-4">
              <p className="font-medium">Complaint from: {selectedComplaint.customerName}</p>
              <p className="text-gray-700 mb-2">{selectedComplaint.complain}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Reply</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="w-full p-2 border rounded h-32"
                placeholder="Enter your reply to the customer..."
                required
              ></textarea>
              {!reply.trim() && (
                <p className="text-red-500 text-sm mt-1">Reply is required</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComplaint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                disabled={!reply.trim()}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this complaint from {complaintToDelete.customerName}? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComplaint}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupporterPage;