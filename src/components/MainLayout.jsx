import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const role = user?.role || 'player';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="fixed top-0 left-0 w-64 h-full">
            <Sidebar role={role} />
          </div>
        </div>
        
        {/* Desktop Main Content */}
        <div className="flex-1">
          <main className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <img 
                src="/logo192.png" 
                alt="logo" 
                className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200" 
                onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=Q+C&background=2563eb&color=fff'}} 
              />
              <span className="text-xl font-bold text-gray-900">QuickCourt</span>
            </div>
            
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="absolute left-0 top-0 w-80 h-full bg-white shadow-xl transform transition-transform">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/logo192.png" 
                    alt="logo" 
                    className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200" 
                    onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=Q+C&background=2563eb&color=fff'}} 
                  />
                  <span className="text-xl font-bold text-gray-900">QuickCourt</span>
                </div>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="h-full overflow-y-auto">
                <Sidebar role={role} isMobile={false} onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Main Content */}
        <main className="px-4 py-6 pb-20"> {/* pb-20 for bottom nav space */}
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <Sidebar role={role} isMobile={true} />
      </div>
    </div>
  );
};

export default MainLayout;
