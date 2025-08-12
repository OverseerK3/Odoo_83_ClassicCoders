import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  BuildingOffice2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000/api/bookings';

const BookingOverview = () => {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    date: '',
    search: ''
  });

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchBookings();
    }
  }, [currentPage, filters, selectedVenue]);

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Facility BookingOverview - Token:', token ? 'Present' : 'Missing');
      
      const res = await fetch('http://localhost:5000/api/venues/my-venues', { headers });
      console.log('Facility BookingOverview - Venues response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Facility BookingOverview - Venues data:', data);
        setVenues(data);
        if (data.length > 0) {
          setSelectedVenue(data[0]._id);
        }
      } else {
        const errorText = await res.text();
        console.error('Facility BookingOverview - Venues error:', errorText);
        setError(`Failed to load venues: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('Facility BookingOverview - Venue fetch error:', err);
      setError('Failed to load venues');
    }
  };

  const fetchBookings = async () => {
    if (!selectedVenue) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters
      });

      console.log('Facility BookingOverview - Fetching bookings for venue:', selectedVenue);
      const res = await fetch(`${API_BASE}/venue/${selectedVenue}?${params}`, { headers });
      console.log('Facility BookingOverview - Bookings response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Facility BookingOverview - Bookings error:', errorText);
        throw new Error(`Failed to fetch bookings: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Facility BookingOverview - Bookings data:', data);
      setBookings(data.bookings || []);
      setTotalPages(data.totalPages || 1);
      setError('');
    } catch (err) {
      console.error('Facility BookingOverview - Fetch bookings error:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/${bookingId}/complete`, {
        method: 'PUT',
        headers
      });

      if (res.ok) {
        setSuccess('Booking marked as completed');
        fetchBookings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to complete booking');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const BookingDetailModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Booking Details</h3>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Booking ID</label>
                  <p className="text-slate-900 font-mono text-sm">{booking._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <p className="text-slate-900">{booking.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <p className="text-slate-900">{booking.startTime} - {booking.endTime}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-medium text-slate-800 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <p className="text-slate-900">{booking.user?.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <p className="text-slate-900">{booking.user?.email}</p>
                  </div>
                  {booking.user?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <p className="text-slate-900">{booking.user.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Venue Info */}
              <div>
                <h4 className="text-lg font-medium text-slate-800 mb-3">Venue Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Venue Name</label>
                    <p className="text-slate-900">{booking.venue?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <p className="text-slate-900">{booking.venue?.location}</p>
                  </div>
                  {booking.courtName && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Court</label>
                      <p className="text-slate-900">{booking.courtName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="text-lg font-medium text-slate-800 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount</label>
                    <p className="text-slate-900 text-lg font-semibold">₹{booking.totalAmount || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {booking.notes && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{booking.notes}</p>
                </div>
              )}

              {/* Actions */}
              {booking.status === 'booked' && (
                <div className="border-t pt-4">
                  <button
                    onClick={() => {
                      handleCompleteBooking(booking._id);
                      onClose();
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Mark as Completed
                  </button>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <label className="block font-medium mb-1">Created At</label>
                    <p>{formatDate(booking.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Updated At</label>
                    <p>{formatDate(booking.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Overview</h2>
        <p className="text-slate-600">View and manage all bookings for your facilities</p>
      </div>

      {/* Venue Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Venue</label>
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {venues.map(venue => (
            <option key={venue._id} value={venue._id}>
              {venue.name} - {venue.location}
            </option>
          ))}
        </select>
      </div>

      {/* Filters */}
      {selectedVenue && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search customer..."
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ status: '', date: '', search: '' });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      {selectedVenue && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-slate-800 font-medium">{booking.date}</p>
                              <p className="text-slate-600 text-sm">{booking.startTime} - {booking.endTime}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-slate-800 font-medium">{booking.user?.username}</p>
                              <p className="text-slate-600 text-sm">{booking.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-800 font-medium">₹{booking.totalAmount || 0}</p>
                          <p className="text-slate-600 text-xs">{booking.paymentStatus || 'pending'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {booking.status === 'booked' && (
                              <button
                                onClick={() => handleCompleteBooking(booking._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Mark as Completed"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No bookings found</h3>
                  <p className="text-slate-500">
                    {filters.status || filters.date || filters.search 
                      ? 'Try adjusting your filters' 
                      : 'Bookings will appear here once customers start booking'
                    }
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200">
                  <div className="text-sm text-slate-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* No venues message */}
      {venues.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingOffice2Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No venues found</h3>
          <p className="text-slate-500">You need to have venues assigned to view bookings</p>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default BookingOverview;
