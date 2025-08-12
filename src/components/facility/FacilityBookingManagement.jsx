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
  FunnelIcon,
  BuildingOffice2Icon,
  UserIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../ToastProvider';

const FacilityBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    booked: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });
  const toast = useToast();

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, filter, searchTerm, dateFilter, venueFilter]);

  const fetchVenues = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/venues/my-venues', { headers });
      if (response.ok) {
        const data = await response.json();
        console.log('Facility Booking Management - Venues:', data);
        setVenues(data);
      } else {
        console.error('Failed to fetch venues:', response.status);
        toast.error('Failed to load venues');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Error loading venues');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // If specific venue is selected, use venue-specific endpoint
      if (venueFilter !== 'all') {
        await fetchVenueBookings(venueFilter);
      } else {
        // Fetch bookings from all user's venues
        await fetchAllUserBookings();
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchVenueBookings = async (venueId) => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: 20
    });
    
    if (filter !== 'all') params.append('status', filter);
    if (dateFilter) params.append('date', dateFilter);

    const response = await fetch(`http://localhost:5000/api/bookings/venue/${venueId}?${params}`, { headers });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Facility Booking Management - Venue bookings:', data);
      
      let filteredBookings = data.bookings || [];
      
      // Apply search filter on frontend for venue-specific bookings
      if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking =>
          booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.courtName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setBookings(filteredBookings);
      setTotalPages(data.totalPages || 1);
      calculateStats(filteredBookings);
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      toast.error('Failed to fetch venue bookings');
    }
  };

  const fetchAllUserBookings = async () => {
    try {
      let allBookings = [];
      
      // Fetch bookings from each venue
      for (const venue of venues) {
        const params = new URLSearchParams({
          limit: 1000 // Get all bookings for stats
        });
        
        if (filter !== 'all') params.append('status', filter);
        if (dateFilter) params.append('date', dateFilter);

        const response = await fetch(`http://localhost:5000/api/bookings/venue/${venue._id}?${params}`, { headers });
        
        if (response.ok) {
          const data = await response.json();
          allBookings = [...allBookings, ...(data.bookings || [])];
        }
      }

      // Apply search filter
      if (searchTerm) {
        allBookings = allBookings.filter(booking =>
          booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.courtName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by creation date (newest first)
      allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Implement pagination
      const startIndex = (currentPage - 1) * 20;
      const endIndex = startIndex + 20;
      const paginatedBookings = allBookings.slice(startIndex, endIndex);

      setBookings(paginatedBookings);
      setTotalPages(Math.ceil(allBookings.length / 20));
      calculateStats(allBookings);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      toast.error('Error loading bookings');
    }
  };

  const calculateStats = (bookingsList) => {
    const stats = {
      total: bookingsList.length,
      booked: bookingsList.filter(b => b.status === 'booked').length,
      completed: bookingsList.filter(b => b.status === 'completed').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
      revenue: bookingsList
        .filter(b => b.status === 'completed')
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
    };
    setStats(stats);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const endpoint = newStatus === 'completed' ? 'complete' : 'cancel';
      
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/${endpoint}`, {
        method: 'PUT',
        headers
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Booking ${newStatus} successfully`);
        
        // Show loyalty update message if applicable
        if (result.loyaltyUpdate?.hasNewCard) {
          toast.success(`🎉 Player earned a new ${result.loyaltyUpdate.newCard.discountPercentage}% discount card!`);
        }
        
        fetchBookings(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${newStatus} booking`);
      }
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      toast.error(`Error updating booking status`);
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

  const filteredBookings = bookings;

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
                <div className="text-sm text-gray-900 font-mono">{booking._id}</div>
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
          <p className="text-slate-600">Manage all bookings across your venues</p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.booked}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">
            ₹{stats.revenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <select
              value={venueFilter}
              onChange={(e) => {
                setVenueFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Venues</option>
              {venues.map(venue => (
                <option key={venue._id} value={venue._id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by player, venue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setSearchTerm('');
                setDateFilter('');
                setVenueFilter('all');
                setCurrentPage(1);
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
              {venues.length === 0 ? 
                "No venues found. Create a venue first to see bookings." :
                filter === 'all' ? 
                "No bookings have been made yet." : 
                `No ${filter} bookings found.`
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player & Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue & Court
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
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user?.username || 'Unknown Player'}
                            </div>
                            <div className="text-sm text-gray-500">{booking.user?.email}</div>
                            {booking.user?.phone && (
                              <div className="text-xs text-gray-500">{booking.user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BuildingOffice2Icon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-blue-600">
                              {booking.venue?.name || 'Unknown Venue'}
                            </div>
                            <div className="text-xs text-gray-500">{booking.venue?.location}</div>
                            {booking.courtName && (
                              <div className="text-xs text-gray-600">Court: {booking.courtName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              <ClockIcon className="w-3 h-3 inline mr-1" />
                              {booking.startTime} - {booking.endTime}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyRupeeIcon className="w-4 h-4 text-gray-400 mr-1" />
                          <div className="text-sm font-medium text-gray-900">
                            {booking.totalAmount || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
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

export default FacilityBookingManagement;
