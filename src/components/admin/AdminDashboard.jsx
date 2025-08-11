import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  BuildingOffice2Icon, 
  CalendarIcon, 
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate fetching admin stats
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalVenues: 89,
        totalBookings: 3456,
        totalRevenue: 245000,
        activeUsers: 234,
        recentActivity: [
          { type: 'user_signup', user: 'John Doe', time: '2 mins ago' },
          { type: 'booking_created', user: 'Alice Smith', venue: 'Sports Complex A', time: '5 mins ago' },
          { type: 'venue_added', user: 'Bob Manager', venue: 'Tennis Court B', time: '1 hour ago' },
          { type: 'booking_cancelled', user: 'Carol Brown', venue: 'Football Field', time: '2 hours ago' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, change, changeType, color = 'blue' }) => (
    <div className="card p-6">
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_signup':
        return <UserGroupIcon className="w-4 h-4 text-green-600" />;
      case 'booking_created':
        return <CalendarIcon className="w-4 h-4 text-blue-600" />;
      case 'venue_added':
        return <BuildingOffice2Icon className="w-4 h-4 text-purple-600" />;
      case 'booking_cancelled':
        return <CalendarIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ChartBarIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'user_signup':
        return `${activity.user} signed up`;
      case 'booking_created':
        return `${activity.user} booked ${activity.venue}`;
      case 'venue_added':
        return `${activity.user} added ${activity.venue}`;
      case 'booking_cancelled':
        return `${activity.user} cancelled booking at ${activity.venue}`;
      default:
        return 'Unknown activity';
    }
  };

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

      {/* Welcome Section */}
      <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard!</h2>
        <p className="text-purple-100">Here's an overview of your platform's performance and activity.</p>
      </div>

      {/* Stats Grid */}
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
          title="Total Venues"
          value={stats.totalVenues}
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
          title="Platform Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<CurrencyRupeeIcon />}
          change="22"
          changeType="increase"
          color="yellow"
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Analytics */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Platform Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Active Users</span>
              <span className="font-semibold text-slate-800">{stats.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Avg. Bookings/Day</span>
              <span className="font-semibold text-slate-800">47</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Platform Uptime</span>
              <span className="font-semibold text-green-600">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Customer Satisfaction</span>
              <span className="font-semibold text-slate-800">4.8/5</span>
            </div>
          </div>
          
          {/* Placeholder for charts */}
          <div className="mt-6 h-48 bg-slate-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Analytics chart would go here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
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

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            Manage Users
          </button>
          <button className="btn-outline flex items-center justify-center gap-2">
            <BuildingOffice2Icon className="w-5 h-5" />
            Review Venues
          </button>
          <button className="btn-outline flex items-center justify-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            View Reports
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          </div>
          <h4 className="font-semibold text-slate-800 mb-2">Server Status</h4>
          <p className="text-sm text-green-600">Operational</p>
        </div>
        
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
          <h4 className="font-semibold text-slate-800 mb-2">Database</h4>
          <p className="text-sm text-blue-600">Connected</p>
        </div>
        
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
          </div>
          <h4 className="font-semibold text-slate-800 mb-2">API Status</h4>
          <p className="text-sm text-yellow-600">Normal Load</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
