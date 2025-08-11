import React from 'react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  // Get user info from localStorage (should be improved with context in a real app)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const role = user?.role || 'player';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={role} />
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-6">Welcome to QuickCourt Dashboard!</h2>
          <p className="mb-4">You are logged in as <span className="font-semibold text-blue-700">{role.replace('_', ' ')}</span>.</p>
          {/* Add more dashboard features here */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
