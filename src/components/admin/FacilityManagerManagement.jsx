import React, { useState, useEffect } from 'react';
import { 
  UserPlusIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../ToastProvider';

const FacilityManagerManagement = () => {
  const [activeTab, setActiveTab] = useState('send-request');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('You have been invited to become a facility manager for QuickCourt. This will give you access to manage all bookings and venues.');
  
  const toast = useToast();
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    if (activeTab === 'send-request') {
      fetchUsers();
    } else if (activeTab === 'manage-requests') {
      fetchRequests();
    }
    fetchStats();
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:5000/api/facility-requests/users?${params}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`http://localhost:5000/api/facility-requests/sent?${params}`, { headers });
      
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

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/facility-requests/stats', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendRequest = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('http://localhost:5000/api/facility-requests/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: selectedUser._id,
          message: requestMessage,
          permissions: {
            canManageAllBookings: true,
            canManageAllVenues: true,
            canViewReports: true
          }
        })
      });

      if (response.ok) {
        toast.success(`Facility manager request sent to ${selectedUser.username}`);
        setShowRequestModal(false);
        setSelectedUser(null);
        setRequestMessage('You have been invited to become a facility manager for QuickCourt. This will give you access to manage all bookings and venues.');
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Error sending request');
    }
  };

  const deleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/facility-requests/${requestId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        toast.success('Request deleted successfully');
        fetchRequests();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Error deleting request');
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

  const RequestModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Send Facility Manager Request</h3>
          <button onClick={() => setShowRequestModal(false)}>
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">{selectedUser.username}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
              <p className="text-xs text-gray-500">Current role: {selectedUser.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a custom message for the user..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={sendRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Send Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Facility Manager Management</h2>
        <p className="text-slate-600">Send requests to users to become facility managers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.facilityManagers || 0}</div>
          <div className="text-sm text-gray-600">Total Facility Managers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.stats?.find(s => s._id === 'pending')?.count || 0}
          </div>
          <div className="text-sm text-gray-600">Pending Requests</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {stats.stats?.find(s => s._id === 'accepted')?.count || 0}
          </div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">
            {stats.stats?.find(s => s._id === 'rejected')?.count || 0}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('send-request')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send-request'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserPlusIcon className="w-5 h-5 inline mr-2" />
            Send Request
          </button>
          <button
            onClick={() => setActiveTab('manage-requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage-requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserGroupIcon className="w-5 h-5 inline mr-2" />
            Manage Requests
          </button>
        </nav>
      </div>

      {/* Send Request Tab */}
      {activeTab === 'send-request' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'facility_manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'facility_manager' ? 'Facility Manager' : 'Player'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.location || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === 'facility_manager' ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Already Manager
                            </span>
                          ) : user.hasRequest ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Request Pending
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role !== 'facility_manager' && !user.hasRequest && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRequestModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <PaperAirplaneIcon className="w-4 h-4" />
                              Send Request
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Requests Tab */}
      {activeTab === 'manage-requests' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <PaperAirplaneIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">Send some facility manager requests to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent Date
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
                            <div className="text-sm font-medium text-gray-900">{request.user.username}</div>
                            <div className="text-sm text-gray-500">{request.user.email}</div>
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
                            onClick={() => deleteRequest(request._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Request"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showRequestModal && <RequestModal />}
    </div>
  );
};

export default FacilityManagerManagement;
