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
  TrophyIcon,
  Bars3Icon,
  XMarkIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BuildingOffice2Icon as BuildingOffice2IconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  TrophyIcon as TrophyIconSolid,
  UsersIcon as UsersIconSolid,
  GiftIcon as GiftIconSolid,
} from '@heroicons/react/24/solid';
import authService from '../utils/auth';

const API_BASE = 'http://localhost:5000/api/teams';

const Sidebar = ({ role, isMobile = false, isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user')); } catch { user = null; }
  const username = user?.username || user?.name || 'User';
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=2563eb&color=fff`;

  const [invites, setInvites] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifError, setNotifError] = useState('');

  // Navigation configuration with both outline and solid icons
  const navConfig = [
    { 
      to: '/', 
      label: 'Home', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid,
      roles: ['player', 'facility_manager', 'admin'] 
    },
    { 
      to: '/sports', 
      label: 'Sports', 
      icon: TrophyIcon, 
      iconSolid: TrophyIconSolid,
      roles: ['player', 'facility_manager', 'admin'] 
    },
    { 
      to: '/venues', 
      label: 'Venues', 
      icon: BuildingOffice2Icon, 
      iconSolid: BuildingOffice2IconSolid,
      roles: ['player', 'facility_manager', 'admin'] 
    },
    { 
      to: '/my-bookings', 
      label: 'Bookings', 
      shortLabel: 'Bookings',
      icon: CalendarDaysIcon, 
      iconSolid: CalendarDaysIconSolid,
      roles: ['player'] 
    },
    { 
      to: '/my-team', 
      label: 'My Team', 
      shortLabel: 'Team',
      icon: UsersIcon, 
      iconSolid: UsersIconSolid,
      roles: ['player'] 
    },
    { 
      to: '/my-rewards', 
      label: 'My Rewards', 
      shortLabel: 'Rewards',
      icon: GiftIcon, 
      iconSolid: GiftIconSolid,
      roles: ['player'] 
    },
    { 
      to: '/profile', 
      label: 'Profile', 
      icon: UserCircleIcon, 
      iconSolid: UserCircleIconSolid,
      roles: ['player', 'facility_manager', 'admin'] 
    },
    { 
      to: '/owner', 
      label: 'Facility', 
      shortLabel: 'Facility',
      icon: WrenchScrewdriverIcon, 
      iconSolid: WrenchScrewdriverIconSolid,
      roles: ['facility_manager'] 
    },
    { 
      to: '/admin', 
      label: 'Admin', 
      icon: ShieldCheckIcon, 
      iconSolid: ShieldCheckIconSolid,
      roles: ['admin'] 
    },
  ];

  // Filter navigation links based on user role
  const navLinks = navConfig.filter(nav => nav.roles.includes(user?.role || 'player'));

  const token = useMemo(() => localStorage.getItem('token') || '', []);

  const refreshInvites = async () => {
    if (!user || user.role !== 'player') return;
    try {
      const response = await authService.apiCall(`${API_BASE}/invites`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load invites');
      setInvites(data || []);
      setNotifError('');
    } catch (e) { 
      console.error('Refresh invites error:', e);
      setNotifError(e.message); 
    }
  };

  useEffect(() => {
    refreshInvites();
    const id = setInterval(refreshInvites, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respondInvite = async (inviteId, action) => {
    try {
      const response = await authService.apiCall(`${API_BASE}/invites/${inviteId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to respond');
      await refreshInvites();
      if (action === 'accept') navigate('/my-team');
      setNotifError('');
    } catch (e) { 
      console.error('Respond invite error:', e);
      setNotifError(e.message); 
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <>
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
          <div className="grid grid-cols-5 h-16">
            {navLinks.slice(0, 4).map((nav) => {
              const IconComponent = nav.icon;
              const IconSolidComponent = nav.iconSolid;
              
              return (
                <NavLink
                  key={nav.to}
                  to={nav.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center px-2 py-1 transition-colors ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <IconSolidComponent className="w-5 h-5 mb-1" />
                      ) : (
                        <IconComponent className="w-5 h-5 mb-1" />
                      )}
                      <span className="text-xs font-medium truncate">
                        {nav.shortLabel || nav.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
            
            {/* More Menu Button */}
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="flex flex-col items-center justify-center px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors relative"
            >
              <Bars3Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">More</span>
              {user?.role === 'player' && invites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {invites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile More Menu Overlay */}
        {notifOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-96 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Additional Nav Items */}
                <div className="space-y-2 mb-4">
                  {navLinks.slice(4).map((nav) => {
                    const IconComponent = nav.icon;
                    return (
                      <NavLink
                        key={nav.to}
                        to={nav.to}
                        onClick={() => {
                          handleNavClick();
                          setNotifOpen(false);
                        }}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-blue-50 text-blue-600 font-semibold' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        <IconComponent className="w-5 h-5 mr-3" />
                        {nav.label}
                      </NavLink>
                    );
                  })}
                </div>

                {/* Team Invites for Players */}
                {user?.role === 'player' && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Team Invites</h4>
                      <button 
                        className="text-sm text-blue-600 hover:underline" 
                        onClick={refreshInvites}
                      >
                        Refresh
                      </button>
                    </div>
                    {notifError && (
                      <div className="text-red-600 text-sm mb-2">{notifError}</div>
                    )}
                    {invites.length === 0 ? (
                      <div className="text-gray-500 text-sm py-2">No pending invites.</div>
                    ) : (
                      <div className="space-y-2">
                        {invites.map(inv => (
                          <div key={inv._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                                {(inv.from?.username || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {inv.from?.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {inv.from?.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md hover:bg-green-200 transition-colors" 
                                onClick={() => respondInvite(inv._id, 'accept')}
                              >
                                Accept
                              </button>
                              <button 
                                className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200 transition-colors" 
                                onClick={() => respondInvite(inv._id, 'reject')}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* User Profile Section */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setNotifOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={avatar}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover"
                      onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=User&background=2563eb&color=fff'}}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{username}</div>
                      <div className="text-sm text-gray-500">{user?.role || 'Player'}</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 mt-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside className="relative flex flex-col h-full w-64 bg-white border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo192.png" 
            alt="logo" 
            className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200" 
            onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=Q+C&background=2563eb&color=fff'}} 
          />
          <span className="text-xl font-bold text-gray-900 tracking-tight">QuickCourt</span>
        </div>
        {user?.role === 'player' && (
          <button
            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={() => { setNotifOpen(o => !o); if (!notifOpen) refreshInvites(); }}
            aria-label="Team invites"
            title="Team invites"
          >
            <BellIcon className="w-5 h-5" />
            {invites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {invites.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Team Invites Dropdown */}
      {notifOpen && user?.role === 'player' && (
        <div className="absolute top-16 right-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Team Invites</span>
            <button className="text-sm text-blue-600 hover:underline" onClick={refreshInvites}>
              Refresh
            </button>
          </div>
          {notifError && <div className="text-red-600 text-sm mb-2">{notifError}</div>}
          {invites.length === 0 ? (
            <div className="text-gray-500 text-sm">No pending invites.</div>
          ) : (
            <div className="space-y-2">
              {invites.map(inv => (
                <div key={inv._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                      {(inv.from?.username || 'U')[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{inv.from?.username}</div>
                      <div className="text-xs text-gray-500">{inv.from?.email}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded hover:bg-green-200" 
                      onClick={() => respondInvite(inv._id, 'accept')}
                    >
                      Accept
                    </button>
                    <button 
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200" 
                      onClick={() => respondInvite(inv._id, 'reject')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navLinks.map(nav => {
          const IconComponent = nav.icon;
          const IconSolidComponent = nav.iconSolid;
          
          return (
            <NavLink
              key={nav.to}
              to={nav.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <IconSolidComponent className="w-5 h-5 mr-3" />
                  ) : (
                    <IconComponent className="w-5 h-5 mr-3" />
                  )}
                  {nav.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img
            src={avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover"
            onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=User&background=2563eb&color=fff'}}
          />
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900 truncate">{username}</div>
            <div className="text-sm text-gray-500 capitalize">{user?.role || 'Player'}</div>
          </div>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
