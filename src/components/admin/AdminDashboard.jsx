import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  BuildingOffice2Icon, 
  CalendarIcon, 
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TrophyIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    facilityOwners: 0,
    totalBookings: 0,
    activeCourts: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    recentActivity: [],
    bookingTrends: [],
    userGrowth: [],
    facilityApprovals: [],
    sportsPopularity: [],
    revenueProjection: []
  });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: '',
    location: '',
    sport: '',
    pricePerHour: '',
    capacity: '',
    facilities: [],
    images: [],
    description: '',
    ownerId: '',
    status: 'pending'
  });
  const [feedback, setFeedback] = useState('');

  // Dynamic data fetching
  const fetchStats = async () => {
    try {
      setLoading(true);
      // Simulate API call with dynamic data
      const response = await new Promise(resolve => {
        setTimeout(() => {
          const currentTime = new Date();
          const dynamicStats = {
            totalUsers: Math.floor(Math.random() * 500) + 1200,
            facilityOwners: Math.floor(Math.random() * 20) + 80,
            totalBookings: Math.floor(Math.random() * 1000) + 3000,
            activeCourts: Math.floor(Math.random() * 50) + 150,
            totalRevenue: Math.floor(Math.random() * 100000) + 200000,
            pendingApprovals: Math.floor(Math.random() * 15) + 5,
            recentActivity: generateRecentActivity(),
            bookingTrends: generateBookingTrends(),
            userGrowth: generateUserGrowth(),
            facilityApprovals: generateFacilityApprovals(),
            sportsPopularity: generateSportsPopularity(),
            revenueProjection: generateRevenueProjection()
          };
          resolve(dynamicStats);
        }, 1000);
      });
      setStats(response);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      // Simulate fetching venues
      const venueData = [
        {
          id: 1,
          name: 'Sports Complex A',
          location: 'Downtown',
          sport: 'Basketball',
          pricePerHour: 800,
          capacity: 20,
          status: 'approved',
          owner: 'John Manager',
          bookings: 45
        },
        {
          id: 2,
          name: 'Tennis Court B',
          location: 'Uptown',
          sport: 'Tennis',
          pricePerHour: 600,
          capacity: 4,
          status: 'pending',
          owner: 'Alice Owner',
          bookings: 23
        }
      ];
      setVenues(venueData);
    } catch (err) {
      setError('Failed to fetch venues');
    }
  };

  // Generate dynamic data functions
  const generateRecentActivity = () => {
    const activities = [
      { type: 'booking_created', user: 'John Doe', venue: 'Sports Complex A', sport: 'Basketball', amount: Math.floor(Math.random() * 500) + 500 },
      { type: 'user_signup', user: 'Alice Smith', userType: 'player' },
      { type: 'venue_added', user: 'Bob Manager', venue: 'Tennis Court B', sport: 'Tennis' },
      { type: 'booking_cancelled', user: 'Carol Brown', venue: 'Football Field', refund: Math.floor(Math.random() * 800) + 400 },
      { type: 'facility_approved', venue: 'Badminton Arena', owner: 'Mike Wilson' }
    ];
    
    return activities.map((activity, index) => ({
      ...activity,
      time: `${Math.floor(Math.random() * 60) + 1} mins ago`,
      id: Date.now() + index
    }));
  };

  const generateBookingTrends = () => {
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        bookings: Math.floor(Math.random() * 50) + 30,
        revenue: Math.floor(Math.random() * 20000) + 15000
      });
    }
    return trends;
  };

  const generateUserGrowth = () => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      users: 900 + (index * 80) + Math.floor(Math.random() * 50),
      owners: 45 + (index * 10) + Math.floor(Math.random() * 5)
    }));
  };

  const generateFacilityApprovals = () => {
    return ['W1', 'W2', 'W3', 'W4'].map(week => ({
      week,
      pending: Math.floor(Math.random() * 10) + 5,
      approved: Math.floor(Math.random() * 8) + 3,
      rejected: Math.floor(Math.random() * 3) + 1
    }));
  };

  const generateSportsPopularity = () => {
    const sports = ['Cricket', 'Basketball', 'Badminton', 'Tennis', 'Football'];
    return sports.map((sport, index) => {
      const bookings = Math.floor(Math.random() * 400) + (800 - index * 150);
      return {
        sport,
        bookings,
        percentage: Math.floor((bookings / 2500) * 100),
        revenue: bookings * (Math.floor(Math.random() * 50) + 80)
      };
    });
  };

  const generateRevenueProjection = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr'];
    return months.map((month, index) => ({
      month,
      projected: 280000 + (index * 40000),
      actual: index === 0 ? 245000 : null
    }));
  };

  // Venue management functions
  const handleAddVenue = () => {
    setEditingVenue(null);
    setVenueForm({
      name: '',
      location: '',
      sport: '',
      pricePerHour: '',
      capacity: '',
      facilities: [],
      images: [],
      description: '',
      ownerId: '',
      status: 'pending'
    });
    setShowVenueModal(true);
  };

  const handleEditVenue = (venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name,
      location: venue.location,
      sport: venue.sport,
      pricePerHour: venue.pricePerHour.toString(),
      capacity: venue.capacity.toString(),
      facilities: venue.facilities || [],
      images: venue.images || [],
      description: venue.description || '',
      ownerId: venue.owner,
      status: venue.status
    });
    setShowVenueModal(true);
  };

  const handleSaveVenue = async () => {
    try {
      const venueData = {
        ...venueForm,
        pricePerHour: parseInt(venueForm.pricePerHour),
        capacity: parseInt(venueForm.capacity),
        id: editingVenue ? editingVenue.id : Date.now()
      };

      if (editingVenue) {
        // Update existing venue
        setVenues(prev => prev.map(v => v.id === editingVenue.id ? { ...v, ...venueData } : v));
      } else {
        // Add new venue
        setVenues(prev => [...prev, { ...venueData, bookings: 0, owner: venueForm.ownerId }]);
      }

      setShowVenueModal(false);
      // Refresh stats after venue change
      fetchStats();
    } catch (err) {
      setError('Failed to save venue');
    }
  };

  const handleApproveVenue = async (venueId) => {
    setVenues(prev => prev.map(v => 
      v.id === venueId ? { ...v, status: 'approved' } : v
    ));
    fetchStats(); // Refresh stats
  };

  const handleRejectVenue = async (venueId) => {
    setVenues(prev => prev.map(v => 
      v.id === venueId ? { ...v, status: 'rejected' } : v
    ));
    fetchStats(); // Refresh stats
  };

  const handleDeleteVenue = async (venueId) => {
    if (confirm('Are you sure you want to delete this venue?')) {
      setVenues(prev => prev.filter(v => v.id !== venueId));
      fetchStats(); // Refresh stats
    }
  };

  // Venue booking simulation (admin demo)
  const handleBookVenue = (venueId) => {
    setVenues(prev =>
      prev.map(v =>
        v.id === venueId ? { ...v, bookings: v.bookings + 1 } : v
      )
    );
    setFeedback('Venue booked successfully!');
    setTimeout(() => setFeedback(''), 2000);
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
    fetchVenues();
  }, [selectedTimeframe]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, change, changeType, color = 'blue', onClick }) => (
    <div className={`card p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? 
              <ArrowTrendingUpIcon className="w-4 h-4" /> : 
              <ArrowTrendingDownIcon className="w-4 h-4" />
            }
            {change}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
        <p className="text-slate-600 text-sm">{title}</p>
      </div>
    </div>
  );

  const SimpleChart = ({ data, type, title, color = 'blue' }) => {
    const maxValue = Math.max(...data.map(d => d.bookings || d.users || d.approved || d.revenue || 0));
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700">{title}</h4>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-sm text-slate-600 text-right">
                {item.date?.split('-')[2] || item.month || item.week || item.sport}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                <div 
                  className={`h-full bg-${color}-500 rounded-full transition-all duration-500`}
                  style={{ 
                    width: `${((item.bookings || item.users || item.approved || item.revenue || 0) / maxValue) * 100}%` 
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                  {item.bookings || item.users || item.approved || item.revenue || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_signup':
        return <UserGroupIcon className="w-4 h-4 text-green-600" />;
      case 'booking_created':
        return <CalendarIcon className="w-4 h-4 text-blue-600" />;
      case 'venue_added':
        return <BuildingOffice2Icon className="w-4 h-4 text-purple-600" />;
      case 'booking_cancelled':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'facility_approved':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      default:
        return <ChartBarIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'user_signup':
        return `${activity.user} signed up as ${activity.userType}`;
      case 'booking_created':
        return `${activity.user} booked ${activity.venue} for ${activity.sport} (₹${activity.amount})`;
      case 'venue_added':
        return `${activity.user} added ${activity.venue} for ${activity.sport}`;
      case 'booking_cancelled':
        return `${activity.user} cancelled booking (₹${activity.refund} refunded)`;
      case 'facility_approved':
        return `${activity.venue} approved for ${activity.owner}`;
      default:
        return 'Unknown activity';
    }
  };

  const VenueModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {editingVenue ? 'Edit Venue' : 'Add New Venue'}
          </h3>
          <button onClick={() => setShowVenueModal(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={venueForm.name}
                onChange={(e) => setVenueForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter venue name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={venueForm.location}
                onChange={(e) => setVenueForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport Type
              </label>
              <select
                value={venueForm.sport}
                onChange={(e) => setVenueForm(prev => ({ ...prev, sport: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select sport</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Football">Football</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Hour (₹)
              </label>
              <input
                type="number"
                value={venueForm.pricePerHour}
                onChange={(e) => setVenueForm(prev => ({ ...prev, pricePerHour: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={venueForm.capacity}
                onChange={(e) => setVenueForm(prev => ({ ...prev, capacity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter capacity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <input
                type="text"
                value={venueForm.ownerId}
                onChange={(e) => setVenueForm(prev => ({ ...prev, ownerId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter owner name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={venueForm.description}
              onChange={(e) => setVenueForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter venue description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facilities (comma separated)
              </label>
              <input
                type="text"
                value={venueForm.facilities.join(', ')}
                onChange={e => setVenueForm(prev => ({
                  ...prev,
                  facilities: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Parking, Changing Room, Floodlights"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (URLs, comma separated)
              </label>
              <input
                type="text"
                value={venueForm.images.join(', ')}
                onChange={e => setVenueForm(prev => ({
                  ...prev,
                  images: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. https://img1.jpg, https://img2.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowVenueModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVenue}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingVenue ? 'Update' : 'Add'} Venue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-2">
          {feedback}
        </div>
      )}

      {/* Welcome Section with Timeframe Selector and Add Venue Button */}
      <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-purple-100">Comprehensive platform analytics and booking management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddVenue}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Venue
            </button>
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white text-slate-800 px-3 py-2 rounded-lg text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<UserGroupIcon />}
          change="12"
          changeType="increase"
          color="blue"
        />
        <StatCard
          title="Facility Owners"
          value={stats.facilityOwners}
          icon={<BuildingOffice2Icon />}
          change="8"
          changeType="increase"
          color="green"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={<CalendarIcon />}
          change="15"
          changeType="increase"
          color="purple"
        />
        <StatCard
          title="Active Courts"
          value={stats.activeCourts}
          icon={<TrophyIcon />}
          change="5"
          changeType="increase"
          color="yellow"
        />
      </div>

      {/* Revenue and Approval Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Platform Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<CurrencyRupeeIcon />}
          change="22"
          changeType="increase"
          color="emerald"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<ClockIcon />}
          color="orange"
          onClick={() => console.log('Navigate to approvals')}
        />
        <StatCard
          title="Avg. Daily Bookings"
          value="47"
          icon={<ChartBarIcon />}
          change="9"
          changeType="increase"
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Trends */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Booking Trends</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              View Details
            </button>
          </div>
          <SimpleChart 
            data={stats.bookingTrends} 
            type="bookings" 
            title="Daily Bookings" 
            color="blue" 
          />
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Peak day:</strong> 83 bookings generated ₹33,200 revenue
            </p>
          </div>
        </div>

        {/* User Growth */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">User Growth</h3>
            <button className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
              <PencilIcon className="w-4 h-4" />
              Manage Users
            </button>
          </div>
          <SimpleChart 
            data={stats.userGrowth} 
            type="users" 
            title="Monthly User Registration" 
            color="green" 
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{stats.facilityOwners}</div>
              <div className="text-xs text-green-700">Facility Owners</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">{stats.totalUsers - stats.facilityOwners}</div>
              <div className="text-xs text-blue-700">Regular Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sports Popularity and Revenue Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sports Popularity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Sports Popularity</h3>
          <div className="space-y-4">
            {stats.sportsPopularity.map((sport, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{sport.sport}</div>
                    <div className="text-sm text-slate-600">{sport.bookings} bookings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">₹{sport.revenue.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">{sport.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Revenue Projection</h3>
          <div className="space-y-4">
            {stats.revenueProjection.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{item.month} 2024</span>
                  <span className="text-sm text-slate-600">
                    ₹{item.projected.toLocaleString()} projected
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-100 rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: item.actual ? `${(item.actual / item.projected) * 100}%` : '0%' }}
                    >
                      {item.actual && (
                        <span className="text-xs text-white font-medium">
                          ₹{item.actual.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {!item.actual && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-slate-500">Projected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Q1 Target:</strong> ₹1.02M (Current: ₹245K)
            </p>
          </div>
        </div>
      </div>

      {/* Facility Approvals and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Facility Approval Rate */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Facility Approval Rate</h3>
          <SimpleChart 
            data={stats.facilityApprovals} 
            type="approved" 
            title="Weekly Approvals" 
            color="purple" 
          />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">25</div>
              <div className="text-xs text-green-700">Approved</div>
            </div>
            <div className="p-2 bg-orange-50 rounded">
              <div className="text-lg font-bold text-orange-600">12</div>
              <div className="text-xs text-orange-700">Pending</div>
            </div>
            <div className="p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">7</div>
              <div className="text-xs text-red-700">Rejected</div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">{getActivityText(activity)}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Activity
          </button>
        </div>
      </div>

      {/* Venue Management Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Venue Management</h3>
          <button
            onClick={fetchVenues}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Venue</th>
                <th className="text-left p-3">Sport</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Price/Hr</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Bookings</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map(venue => (
                <tr key={venue.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{venue.name}</div>
                      <div className="text-gray-500 text-xs">by {venue.owner}</div>
                    </div>
                  </td>
                  <td className="p-3">{venue.sport}</td>
                  <td className="p-3">{venue.location}</td>
                  <td className="p-3">₹{venue.pricePerHour}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      venue.status === 'approved' ? 'bg-green-100 text-green-600' :
                      venue.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {venue.status}
                    </span>
                  </td>
                  <td className="p-3">{venue.bookings}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVenue(venue)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {venue.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveVenue(venue.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectVenue(venue.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteVenue(venue.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBookVenue(venue.id)}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Book Venue"
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showVenueModal && <VenueModal />}
    </div>
  );
};

export default AdminDashboard;
