import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../ToastProvider';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Admin Booking Management - Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('http://localhost:5000/api/bookings/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Admin Booking Management - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin Booking Management - Data received:', data);
        setBookings(data.bookings || []);
      } else {
        const errorData = await response.text();
        console.error('Admin Booking Management - Error response:', errorData);
        toast.error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Admin Booking Management - Error fetching bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const triggerAutoComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/admin/auto-complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Auto-completed ${result.completedBookings} bookings. ${result.rewardsEarned} new rewards earned!`);
        fetchAllBookings(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to auto-complete bookings');
      }
    } catch (error) {
      console.error('Error triggering auto-complete:', error);
      toast.error('Error triggering auto-complete');
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = newStatus === 'completed' ? 'complete' : 'cancel';
      
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Booking ${newStatus} successfully`);
        
        // Show loyalty update message if applicable
        if (result.loyaltyUpdate?.hasNewCard) {
          toast.success(`🎉 Player earned a new ${result.loyaltyUpdate.newCard.discountPercentage}% discount card!`);
        }
        
        fetchAllBookings(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${newStatus} booking`);
      }
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      toast.error(`Error updating booking status`);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/admin/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Booking deleted successfully');
        fetchAllBookings();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Error deleting booking');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = searchTerm === '' || 
      booking.venue?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === '' || booking.date === dateFilter;
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const BookingModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Booking Details</h3>
            <button onClick={onClose}>
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
                <div className="text-sm text-gray-900">{booking._id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
                <div className="text-sm text-gray-900">{booking.user?.username || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{booking.user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <div className="text-sm text-gray-900">{booking.venue?.name || 'Unknown Venue'}</div>
                <div className="text-xs text-gray-500">{booking.venue?.location}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="text-sm text-gray-900">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="text-sm text-gray-900">{booking.startTime} - {booking.endTime}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="text-sm text-gray-900 font-medium">₹{booking.totalAmount || 0}</div>
              </div>
            </div>

            {booking.courtName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
                <div className="text-sm text-gray-900">{booking.courtName}</div>
              </div>
            )}

            {booking.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{booking.notes}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <div className="text-sm text-gray-900">
                  {new Date(booking.createdAt).toLocaleString()}
                </div>
              </div>
              {booking.updatedAt !== booking.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <div className="text-sm text-gray-900">
                    {new Date(booking.updatedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {booking.status === 'booked' && (
                <>
                  <button
                    onClick={() => {
                      updateBookingStatus(booking._id, 'completed');
                      onClose();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => {
                      updateBookingStatus(booking._id, 'cancelled');
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  deleteBooking(booking._id);
                  onClose();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Management</h2>
          <p className="text-slate-600">Monitor and manage all platform bookings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerAutoComplete}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            Auto-Complete Past Bookings
          </button>
          <button
            onClick={fetchAllBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'booked').length}
          </div>
          <div className="text-sm text-gray-600">Active Bookings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {bookings.filter(b => b.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">
            ₹{bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="booked">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by venue, player..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setSearchTerm('');
                setDateFilter('');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 
                "No bookings have been made yet." : 
                `No ${filter} bookings found.`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player & Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user?.username || 'Unknown Player'}
                        </div>
                        <div className="text-sm text-gray-500">{booking.user?.email}</div>
                        <div className="text-sm font-medium text-blue-600 mt-1">
                          {booking.venue?.name || 'Unknown Venue'}
                        </div>
                        <div className="text-xs text-gray-500">{booking.venue?.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{booking.totalAmount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {booking.status === 'booked' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                              title="Mark Complete"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel Booking"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteBooking(booking._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Booking"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <BookingModal 
          booking={selectedBooking} 
          onClose={() => {
            setShowModal(false);
            setSelectedBooking(null);
          }} 
        />
      )}
    </div>
  );
};

export default BookingManagement;
