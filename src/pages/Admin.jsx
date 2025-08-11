import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  BuildingOffice2Icon, 
  CalendarIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import VenueManagement from '../components/admin/VenueManagement';
import BookingManagement from '../components/admin/BookingManagement';
import SystemSettings from '../components/admin/SystemSettings';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Access Denied</h2>
          <p className="text-slate-600">You need administrator access to view this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      component: <AdminDashboard />
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: <UserGroupIcon className="w-5 h-5" />,
      component: <UserManagement />
    },
    { 
      id: 'venues', 
      label: 'Venue Management', 
      icon: <BuildingOffice2Icon className="w-5 h-5" />,
      component: <VenueManagement />
    },
    { 
      id: 'bookings', 
      label: 'Booking Management', 
      icon: <CalendarIcon className="w-5 h-5" />,
      component: <BookingManagement />
    },
    { 
      id: 'settings', 
      label: 'System Settings', 
      icon: <CogIcon className="w-5 h-5" />,
      component: <SystemSettings />
    }
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>
        <p className="text-slate-600">Manage users, venues, bookings, and system settings</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Active Component */}
      <div className="min-h-[600px]">
        {activeComponent}
      </div>
    </div>
  );
};

export default Admin;
