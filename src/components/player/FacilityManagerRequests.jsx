import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../ToastProvider';

const FacilityManagerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  
  const toast = useToast();
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      const response = await fetch(`http://localhost:5000/api/facility-requests/received?${params}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error loading requests');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/facility-requests/${requestId}/respond`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status,
          message: responseMessage
        })
      });

      if (response.ok) {
        toast.success(`Request ${status} successfully`);
        setShowDetailModal(false);
        setSelectedRequest(null);
        setResponseMessage('');
        fetchRequests();
        
        // Refresh user data to update role if accepted
        if (status === 'accepted') {
          // You might want to trigger a global user data refresh here
          window.location.reload(); // Simple solution
        }
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${status} request`);
      }
    } catch (error) {
      console.error(`Error ${status} request:`, error);
      toast.error(`Error ${status} request`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const DetailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Facility Manager Request</h3>
          <button onClick={() => setShowDetailModal(false)}>
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {selectedRequest && (
          <div className="space-y-4">
            {/* Admin Information */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-2">From Admin</h4>
              <p className="text-sm text-gray-700">{selectedRequest.admin.username}</p>
              <p className="text-xs text-gray-500">{selectedRequest.admin.email}</p>
            </div>

            {/* Request Message */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Request Message</h4>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-700">{selectedRequest.message}</p>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Granted Permissions</h4>
              <div className="bg-blue-50 p-3 rounded">
                <ul className="text-sm text-blue-700 space-y-1">
                  {selectedRequest.permissions?.canManageAllBookings && (
                    <li>• Manage all venue bookings</li>
                  )}
                  {selectedRequest.permissions?.canManageAllVenues && (
                    <li>• Manage all venues and courts</li>
                  )}
                  {selectedRequest.permissions?.canViewReports && (
                    <li>• View reports and analytics</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                {getStatusIcon(selectedRequest.status)}
                <span className="ml-1">
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </span>
              </span>
            </div>

            {/* Request Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Requested At</h4>
                <p className="text-sm text-gray-600">
                  {new Date(selectedRequest.requestedAt).toLocaleString()}
                </p>
              </div>
              {selectedRequest.respondedAt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Responded At</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRequest.respondedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Response Actions (only for pending requests) */}
            {selectedRequest.status === 'pending' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Your Response</h4>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional: Add a response message..."
                />
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => respondToRequest(selectedRequest._id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => respondToRequest(selectedRequest._id, 'accepted')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Accept
                  </button>
                </div>
              </div>
            )}

            {/* Response Message (for responded requests) */}
            {selectedRequest.status !== 'pending' && selectedRequest.response && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Your Response</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-700">{selectedRequest.response}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const respondedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Facility Manager Requests</h2>
        <p className="text-slate-600">Manage your facility manager invitations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
          <div className="text-sm text-gray-600">Pending Requests</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {requests.filter(r => r.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">
            {requests.filter(r => r.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-yellow-50 px-6 py-3 border-b">
            <h3 className="text-lg font-medium text-yellow-800 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Pending Requests ({pendingRequests.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.admin.username}</div>
                        <div className="text-sm text-gray-500">{request.admin.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {request.message.length > 100 
                          ? `${request.message.substring(0, 100)}...` 
                          : request.message
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Requests Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-3 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            All Requests ({requests.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600">You'll see facility manager requests from admins here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.admin.username}</div>
                        <div className="text-sm text-gray-500">{request.admin.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.respondedAt ? new Date(request.respondedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetailModal && <DetailModal />}
    </div>
  );
};

export default FacilityManagerRequests;
