import React from 'react';

const Dashboard = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const role = user?.role || 'player';

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 min-h-screen">
      <div className="bg-white p-6 md:p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Welcome to QuickCourt Dashboard!</h2>
        <p className="mb-2 md:mb-4">You are logged in as <span className="font-semibold text-blue-700">{role.replace('_', ' ')}</span>.</p>
        {/* Add more dashboard features here */}
      </div>
    </div>
  );
};

export default Dashboard;
