import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const icons = {
  home: <HomeIcon className="w-5 h-5 mr-2" />,
  venues: <BuildingOffice2Icon className="w-5 h-5 mr-2" />,
  bookings: <CalendarDaysIcon className="w-5 h-5 mr-2" />,
  profile: <UserCircleIcon className="w-5 h-5 mr-2" />,
  owner: <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />,
  admin: <ShieldCheckIcon className="w-5 h-5 mr-2" />,
  dashboard: <ChartBarIcon className="w-5 h-5 mr-2" />,
  logout: <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />,
  bell: <BellIcon className="w-6 h-6" />,
  users: <UsersIcon className="w-5 h-5 mr-2" />,
};

const API_BASE = 'http://localhost:5000/api/teams';

const navs = [
  { to: '/', label: 'Home', icon: icons.home, roles: ['player', 'facility_manager', 'admin'] },
  { to: '/venues', label: 'Venues', icon: icons.venues, roles: ['player', 'facility_manager', 'admin'] },
  { to: '/my-bookings', label: 'My Bookings', icon: icons.bookings, roles: ['player'] },
  { to: '/profile', label: 'Profile', icon: icons.profile, roles: ['player', 'facility_manager', 'admin'] },
  { to: '/owner', label: 'Facility Owner', icon: icons.owner, roles: ['facility_manager'] },
  { to: '/admin', label: 'Admin Panel', icon: icons.admin, roles: ['admin'] },
];

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch { user = null; }
  const username = user?.username || user?.name || 'User';
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=2563eb&color=fff`;

  // Filter navigation links based on user role
  let navLinks = navs.filter(nav => nav.roles.includes(user?.role || 'player'));
  
  // Add team management for players
  if (user?.role === 'player') {
    const teamNav = { to: '/my-team', label: 'My Team', icon: icons.users };
    navLinks.splice(3, 0, teamNav); // Insert after venues
  }

  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

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
    } catch (e) { setNotifError(e.message); }
  };

  useEffect(() => {
    refreshInvites();
    const id = setInterval(refreshInvites, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respondInvite = async (inviteId, action) => {
    try {
      const res = await fetch(`${API_BASE}/invites/${inviteId}/respond`, {
        method: 'POST', headers, body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to respond');
      await refreshInvites();
      if (action === 'accept') navigate('/my-team');
    } catch (e) { setNotifError(e.message); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="relative flex flex-col h-full w-60 sm:w-64 bg-white border border-slate-100 rounded-xl shadow-md">
      <div className="mb-6 flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src="/logo192.png" alt="logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 border border-blue-200" onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=Q+C&background=2563eb&color=fff'}} />
          <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-primary)] tracking-tight">QuickCourt</span>
        </div>
        {user?.role === 'player' && (
          <button
            className="relative mr-1 text-[var(--color-primary)] hover:text-blue-900 focus:outline-none"
            onClick={() => { setNotifOpen(o => !o); if (!notifOpen) refreshInvites(); }}
            aria-label="Team invites"
            title="Team invites"
          >
            {icons.bell}
            {invites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-secondary)] text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {invites.length}
              </span>
            )}
          </button>
        )}
      </div>

      {notifOpen && user?.role === 'player' && (
        <div className="absolute top-16 right-3 left-3 bg-white rounded-xl shadow-lg border border-slate-100 z-20 p-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-700">Team Invites</span>
            <button className="text-sm text-[var(--color-primary)] hover:underline" onClick={refreshInvites}>Refresh</button>
          </div>
          {notifError && <div className="text-[var(--color-secondary)] text-sm mb-2">{notifError}</div>}
          {invites.length === 0 ? (
            <div className="text-slate-400 text-sm">No pending invites.</div>
          ) : invites.map(inv => (
            <div key={inv._id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">{(inv.from?.username || 'U')[0]}</div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800 text-sm">{inv.from?.username}</span>
                  <span className="text-xs text-slate-500">{inv.from?.email}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200" onClick={() => respondInvite(inv._id, 'accept')}>Accept</button>
                <button className="px-2 py-1 rounded bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-semibold hover:bg-[var(--color-secondary)]/20" onClick={() => respondInvite(inv._id, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1 mt-2 px-2">
        {navLinks.map(nav => (
          <NavLink
            key={nav.to}
            to={nav.to}
            className={({ isActive }) =>
              `flex items-center px-3 sm:px-4 py-2 rounded-lg transition mb-1 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-300 ${isActive ? 'bg-blue-50 text-[var(--color-primary)] font-bold shadow' : 'text-slate-700 hover:bg-blue-50 hover:text-[var(--color-primary)]'}`
            }
          >
            {nav.icon}{nav.label}
          </NavLink>
        ))}
      </nav>
      <div className="pt-4 px-2">
        <button
          onClick={handleLogout}
          className="flex items-center px-3 sm:px-4 py-2 rounded-lg transition font-semibold text-base focus:outline-none focus:ring-2 focus:ring-red-300 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 w-full"
        >
          {icons.logout}Logout
        </button>
      </div>
      <div className="mt-auto pt-4 pb-4 px-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-white transition border border-slate-200 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <img
            src={avatar}
            alt="Profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-blue-200 object-cover"
            onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=User&background=2563eb&color=fff'}}
          />
          <span className="font-semibold text-slate-800 text-base sm:text-lg truncate">{username}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
