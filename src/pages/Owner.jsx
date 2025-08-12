import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  BuildingOffice2Icon, 
  CalendarIcon, 
  CurrencyRupeeIcon,
  UserGroupIcon,
  ClockIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import FacilityDashboard from '../components/facility/FacilityDashboard';
import FacilityManagement from '../components/facility/FacilityManagement';
import CourtManagement from '../components/facility/CourtManagement';
import BookingOverview from '../components/facility/BookingOverview';
import TimeSlotManagement from '../components/facility/TimeSlotManagement';
import FacilityBookingManagement from '../components/facility/FacilityBookingManagement';

const Owner = () => {
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

  // Check if user has access to facility management
  const hasAccess = user && (
    user.role === 'facility_manager' || 
    user.role === 'admin' || 
    user.role === 'player' // Allow players who might own venues
  );

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Access Denied</h2>
          <p className="text-slate-600">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      component: <FacilityDashboard />
    },
    { 
      id: 'facilities', 
      label: 'Facility Management', 
      icon: <BuildingOffice2Icon className="w-5 h-5" />,
      component: <FacilityManagement />
    },
    { 
      id: 'booking-management', 
      label: 'Booking Management', 
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      component: <FacilityBookingManagement />
    },
    { 
      id: 'courts', 
      label: 'Court Management', 
      icon: <UserGroupIcon className="w-5 h-5" />,
      component: <CourtManagement />
    },
    { 
      id: 'timeslots', 
      label: 'Time Slots', 
      icon: <ClockIcon className="w-5 h-5" />,
      component: <TimeSlotManagement />
    },
    { 
      id: 'bookings', 
      label: 'Booking Overview', 
      icon: <CalendarIcon className="w-5 h-5" />,
      component: <BookingOverview />
    }
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Facility Owner Dashboard</h1>
        <p className="text-slate-600">Manage your venues, courts, and bookings efficiently</p>
        {user && (
          <div className="mt-2 text-sm text-slate-500">
            Welcome, {user.username} ({user.role})
          </div>
        )}
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

export default Owner;
