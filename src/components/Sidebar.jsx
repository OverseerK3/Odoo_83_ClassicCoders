import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

const API_BASE = 'http://localhost:5000/api/teams';

const navs = [
  { to: '/', label: 'Home', icon: icons.home },
  { to: '/venues', label: 'Venues', icon: icons.venues },
  { to: '/my-bookings', label: 'My Bookings', icon: icons.bookings },
  { to: '/profile', label: 'Profile', icon: icons.profile },
  { to: '/owner', label: 'facility Owner', icon: icons.owner },
  { to: '/admin', label: 'Admin', icon: icons.admin },
];

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const username = user?.username || user?.name || 'User';
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=2563eb&color=fff`;

  // Insert My Team link for player role
  const navLinks = [...navs];
  if (user?.role === 'player') {
    navLinks.splice(3, 0, { to: '/my-team', label: 'My Team', icon: <span className="mr-2">👥</span> });
  }

  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Notifications (pending invites)
  const [invites, setInvites] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifError, setNotifError] = useState('');

  const refreshInvites = async () => {
    if (!user || user.role !== 'player') return;
    try {
      const res = await fetch(`${API_BASE}/invites`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load invites');
      setInvites(data || []);
    } catch (e) {
      setNotifError(e.message);
    }
  };

  useEffect(() => {
    refreshInvites();
    // Optional: periodic refresh
    const id = setInterval(refreshInvites, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respondInvite = async (inviteId, action) => {
    try {
      const res = await fetch(`${API_BASE}/invites/${inviteId}/respond`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to respond');
      await refreshInvites();
      if (action === 'accept') {
        navigate('/my-team');
      }
    } catch (e) {
      setNotifError(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="relative flex flex-col h-full w-60 sm:w-64 bg-gradient-to-b from-blue-50 via-white to-blue-100 rounded-xl shadow-xl px-3 sm:px-6 py-4 sm:py-6 border border-gray-100">
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <img src="/logo192.png" alt="logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 border border-blue-200" onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=Q+C&background=2563eb&color=fff'}} />
          <span className="text-xl sm:text-2xl font-extrabold text-blue-700 tracking-tight">QuickCourt</span>
        </div>
        {user?.role === 'player' && (
          <button
            className="relative mr-1 text-blue-700 hover:text-blue-900 focus:outline-none"
            onClick={() => { setNotifOpen(o => !o); if (!notifOpen) refreshInvites(); }}
            aria-label="Team invites"
            title="Team invites"
          >
            <span className="text-2xl">🔔</span>
            {invites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {invites.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Notification Dropdown */}
      {notifOpen && user?.role === 'player' && (
        <div className="absolute top-16 right-3 left-3 bg-white rounded-xl shadow-lg border border-gray-100 z-20 p-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">Team Invites</span>
            <button className="text-sm text-blue-600 hover:underline" onClick={refreshInvites}>Refresh</button>
          </div>
          {notifError && <div className="text-red-600 text-sm mb-2">{notifError}</div>}
          {invites.length === 0 ? (
            <div className="text-gray-400 text-sm">No pending invites.</div>
          ) : invites.map(inv => (
            <div key={inv._id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">{(inv.from?.username || 'U')[0]}</div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 text-sm">{inv.from?.username}</span>
                  <span className="text-xs text-gray-500">{inv.from?.email}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200" onClick={() => respondInvite(inv._id, 'accept')}>Accept</button>
                <button className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200" onClick={() => respondInvite(inv._id, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1 mt-2">
        {navLinks.map(nav => (
          <NavLink
            key={nav.to}
            to={nav.to}
            className={({ isActive }) =>
              `flex items-center px-3 sm:px-4 py-2 rounded-lg transition mb-1 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-300 ${isActive ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`
            }
          >
            {nav.icon}{nav.label}
          </NavLink>
        ))}
      </nav>
      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center px-3 sm:px-4 py-2 rounded-lg transition font-semibold text-base focus:outline-none focus:ring-2 focus:ring-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
        >
          {icons.logout}Logout
        </button>
      </div>
      <div className="mt-auto pt-6 pb-2 px-2">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-white/80 hover:bg-blue-50 transition border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <img
            src={avatar}
            alt="Profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-blue-200 object-cover"
            onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=User&background=2563eb&color=fff'}}
          />
          <span className="font-semibold text-gray-800 text-base sm:text-lg truncate">{username}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
