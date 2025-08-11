import React, { useState } from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  // Get user info from localStorage (should be improved with context in a real app)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const role = user?.role || 'player';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex">
        <Sidebar role={role} />
      </div>
      {/* Sidebar drawer for mobile */}
      <div className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative w-64 h-full">
          <Sidebar role={role} />
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar for mobile */}
        <div className="md:hidden flex items-center justify-between bg-white shadow px-4 py-3 sticky top-0 z-30">
          <button
            className="text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 p-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <span className="text-xl font-bold text-blue-700">QuickCourt</span>
          <div className="w-8" /> {/* Spacer */}
        </div>
        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
