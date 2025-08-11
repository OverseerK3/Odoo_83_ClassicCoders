import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

const BookingManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Management</h2>
        <p className="text-slate-600">Monitor and manage all platform bookings</p>
      </div>

      <div className="text-center py-12">
        <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">Booking Management</h3>
        <p className="text-slate-500">This component will show all bookings with admin controls</p>
      </div>
    </div>
  );
};

export default BookingManagement;
