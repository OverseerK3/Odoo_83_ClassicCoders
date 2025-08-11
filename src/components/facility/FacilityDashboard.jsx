import React, { useState, useEffect } from 'react';
import { 
  BuildingOffice2Icon, 
  CalendarIcon, 
  CurrencyRupeeIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000/api/facility';

const FacilityDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeCourts: 0,
    totalEarnings: 0,
    activeVenues: 0,
    upcomingBookings: []
  });
  const [trends, setTrends] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const [statsRes, trendsRes, peakRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/dashboard/trends?period=weekly`, { headers }),
        fetch(`${API_BASE}/dashboard/peak-hours`, { headers })
      ]);

      if (!statsRes.ok || !trendsRes.ok || !peakRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, trendsData, peakData] = await Promise.all([
        statsRes.json(),
        trendsRes.json(),
        peakRes.json()
      ]);

      setStats(statsData);
      setTrends(trendsData);
      setPeakHours(peakData);
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, change, changeType }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
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

      {/* Welcome Message */}
      <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard!</h2>
        <p className="text-blue-100">Here's an overview of your facility performance and recent activity.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={<CalendarIcon className="w-6 h-6 text-blue-600" />}
          change="12"
          changeType="increase"
        />
        <StatCard
          title="Active Courts"
          value={stats.activeCourts}
          icon={<BuildingOffice2Icon className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
          icon={<CurrencyRupeeIcon className="w-6 h-6 text-blue-600" />}
          change="8"
          changeType="increase"
        />
        <StatCard
          title="Active Venues"
          value={stats.activeVenues}
          icon={<ChartBarIcon className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Trends Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Booking Trends</h3>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            {trends.length > 0 ? (
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">
                  {trends.length} data points available
                  <br />
                  <span className="text-xs">Chart visualization would go here</span>
                </p>
              </div>
            ) : (
              <div className="text-slate-400 text-center">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2" />
                <p>No booking data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Peak Booking Hours</h3>
          <div className="h-64 bg-slate-50 rounded-lg">
            {peakHours.length > 0 ? (
              <div className="p-4 space-y-2">
                <p className="text-sm text-slate-600 mb-3">Top booking hours:</p>
                {peakHours.slice(0, 5).map((hour, index) => (
                  <div key={hour._id} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{hour._id}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-${Math.min(20, hour.count * 2)} h-2 bg-blue-500 rounded`}></div>
                      <span className="text-sm text-slate-600">{hour.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No peak hour data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Calendar */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Bookings</h3>
        {stats.upcomingBookings && stats.upcomingBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Venue</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-800">{booking.date}</td>
                    <td className="py-3 px-4 text-slate-600">{booking.startTime} - {booking.endTime}</td>
                    <td className="py-3 px-4 text-slate-800">{booking.venue?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{booking.user?.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No upcoming bookings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityDashboard;
