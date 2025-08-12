import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  CalendarIcon, 
  UserGroupIcon,
  BuildingOffice2Icon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import FacilityManagerRequests from '../components/player/FacilityManagerRequests';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingRequests, setPendingRequests] = useState(0);
  
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const role = user?.role || 'player';

  // Fetch pending facility manager requests count
  useEffect(() => {
    if (role === 'player') {
      fetchPendingRequestsCount();
    }
  }, [role]);

  const fetchPendingRequestsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/facility-requests/received?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const tabs = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: <TrophyIcon className="w-5 h-5" /> 
    },
    { 
      id: 'facility-requests', 
      label: 'Facility Manager Requests', 
      icon: <BellIcon className="w-5 h-5" />,
      badge: pendingRequests > 0 ? pendingRequests : null
    }
  ];

  const Overview = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username || 'Player'}!</h2>
            <p className="text-blue-100">You are logged in as {role.replace('_', ' ')}</p>
          </div>
          <TrophyIcon className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teams Joined</p>
              <p className="text-2xl font-bold text-green-600">3</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Venues Visited</p>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
            <BuildingOffice2Icon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Facility Manager Request Notification */}
      {pendingRequests > 0 && (
        <div className="card p-4 border-l-4 border-yellow-500 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">
                  {pendingRequests} Facility Manager Request{pendingRequests > 1 ? 's' : ''} Pending
                </h3>
                <p className="text-sm text-yellow-700">
                  You have invitation{pendingRequests > 1 ? 's' : ''} to become a facility manager
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('facility-requests')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
            >
              View Request{pendingRequests > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Booked Basketball Court</p>
              <p className="text-xs text-gray-500">Sports Complex A • 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <UserGroupIcon className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Joined Team Warriors</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <TrophyIcon className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Completed 5 bookings milestone</p>
              <p className="text-xs text-gray-500">Earned scratch card reward • 3 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/venues'}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Book Venue</span>
          </button>
          <button 
            onClick={() => window.location.href = '/my-bookings'}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ClockIcon className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-800">My Bookings</span>
          </button>
          <button 
            onClick={() => window.location.href = '/my-team'}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <UserGroupIcon className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">My Teams</span>
          </button>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <TrophyIcon className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">My Rewards</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Player Dashboard</h1>
        <p className="text-slate-600">Manage your bookings, teams, and facility manager requests</p>
      </div>

      {/* Navigation Tabs (only show if player role) */}
      {role === 'player' && (
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Active Component */}
      <div className="min-h-[600px]">
        {role !== 'player' ? (
          <div className="flex flex-col items-center justify-center p-4 md:p-8 min-h-[400px]">
            <div className="card p-6 md:p-8 w-full max-w-md text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-slate-800">
                Welcome to QuickCourt Dashboard!
              </h2>
              <p className="mb-2 md:mb-4">
                You are logged in as <span className="font-semibold text-[var(--color-primary)]">{role.replace('_', ' ')}</span>.
              </p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          <Overview />
        ) : activeTab === 'facility-requests' ? (
          <FacilityManagerRequests />
        ) : (
          <Overview />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
