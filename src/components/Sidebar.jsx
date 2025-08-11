import React from 'react';
import { NavLink } from 'react-router-dom';
// You can swap these for real SVGs or icon libraries
const icons = {
  home: <span className="mr-2">🏠</span>,
  venues: <span className="mr-2">🏟️</span>,
  bookings: <span className="mr-2">📅</span>,
  profile: <span className="mr-2">👤</span>,
  owner: <span className="mr-2">🛠️</span>,
  admin: <span className="mr-2">🔑</span>,
  dashboard: <span className="mr-2">📊</span>,
  logout: <span className="mr-2">🚪</span>,
};

const navs = [
  { to: '/', label: 'Home', icon: icons.home },
  { to: '/venues', label: 'Venues', icon: icons.venues },
  { to: '/my-bookings', label: 'My Bookings', icon: icons.bookings },
  { to: '/profile', label: 'Profile', icon: icons.profile },
  { to: '/owner', label: 'Owner', icon: icons.owner },
  { to: '/admin', label: 'Admin', icon: icons.admin },
];

const Sidebar = ({ role }) => {
  return (
    <aside className="h-full w-64 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-2 border border-gray-100">
      <div className="mb-8 flex items-center gap-2">
        <img src="/logo192.png" alt="logo" className="w-8 h-8" />
        <span className="text-xl font-bold text-blue-700">QuickCourt</span>
      </div>
      {navs.map(nav => (
        <NavLink
          key={nav.to}
          to={nav.to}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition mb-1 font-medium ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`
          }
        >
          {nav.icon}{nav.label}
        </NavLink>
      ))}
      {/* Role-based links can be added here as before */}
      <div className="mt-auto pt-4">
        <NavLink
          to="/logout"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition font-semibold ${isActive ? 'bg-red-50 text-red-700' : 'text-red-600 hover:bg-red-50'}`
          }
        >
          {icons.logout}Logout
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
