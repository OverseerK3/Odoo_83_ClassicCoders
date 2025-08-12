import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ToastProvider';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Error cancelling booking');
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
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage your court bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'booked', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 
                "You haven't made any bookings yet." : 
                `No ${filter} bookings found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        {booking.venue?.images?.[0] ? (
                          <img 
                            src={booking.venue.images[0]} 
                            alt={booking.venue.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <MapPinIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.venue?.name || 'Unknown Venue'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{booking.venue?.location || 'Unknown Location'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{booking.venue?.sport || 'Sport'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Date</div>
                          <div className="text-sm text-gray-600">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Time</div>
                          <div className="text-sm text-gray-600">
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CurrencyRupeeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Amount</div>
                          <div className="text-sm text-gray-600">
                            ₹{booking.totalAmount || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.courtName && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Court: </span>
                        <span className="text-sm font-medium text-gray-900">{booking.courtName}</span>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Notes: </span>
                        <span className="text-sm text-gray-700">{booking.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    {booking.status === 'booked' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this booking?')) {
                            cancelBooking(booking._id);
                          }
                        }}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  Booked on: {new Date(booking.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
