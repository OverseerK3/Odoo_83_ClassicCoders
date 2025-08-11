import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserCircleIcon,
  CalendarIcon,
  XMarkIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const API_BASE_AUTH = 'http://localhost:5000/api/auth';
const API_BASE_BOOKINGS = 'http://localhost:5000/api/bookings';

const Profile = () => {
  const [tab, setTab] = useState('bookings');
  const [bookingsTab, setBookingsTab] = useState('all');
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [formLoading, setFormLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const locations = [
    'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 
    'Gandhinagar', 'Mehsana', 'Palanpur', 'Bhavnagar'
  ];

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchUserBookings();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_AUTH}/profile`, { headers });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setUserData(data);
      setProfileForm({
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        location: data.location || 'Ahmedabad'
      });
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_BOOKINGS}/my`, { headers });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_AUTH}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileForm)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await res.json();
      setUserData(updatedUser);
      setSuccess('Profile updated successfully!');
      
      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        username: updatedUser.username,
        email: updatedUser.email,
        location: updatedUser.location
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setFormLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_AUTH}/change-password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`${API_BASE_BOOKINGS}/${bookingId}/cancel`, {
        method: 'PUT',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      await fetchUserBookings(); // Refresh bookings
      setSuccess('Booking cancelled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getAvatarUrl = () => {
    if (userData?.avatar) return userData.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.username || 'User')}&background=2563eb&color=fff&size=150`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (bookingsTab === 'all') return booking.status !== 'cancelled';
    if (bookingsTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-slate-500">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-slate-500">Please login to view your profile</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto py-8">
      {/* Sidebar */}
      <aside className="w-full md:w-1/3 card p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center text-5xl text-slate-400 mb-2 overflow-hidden">
            <img 
              src={getAvatarUrl()} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.classList.remove('hidden');
                e.target.nextSibling.classList.add('flex');
              }}
            />
            <div className="w-full h-full bg-slate-100 hidden items-center justify-center text-5xl text-slate-400">
              <UserCircleIcon className="w-16 h-16" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition">
            <CameraIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-slate-800 mb-1">{userData.username}</div>
          <div className="text-sm text-slate-500 mb-1">{userData.email}</div>
          <div className="text-sm text-slate-500">{userData.location}</div>
          <div className="text-xs text-blue-600 mt-2 capitalize">{userData.role.replace('_', ' ')}</div>
        </div>

        <div className="w-full space-y-2">
          <button 
            className={`w-full py-2 rounded font-semibold transition ${
              tab === 'edit' ? 'btn-primary' : 'btn-outline'
            }`} 
            onClick={() => setTab('edit')}
          >
            Edit Profile
          </button>
          <button 
            className={`w-full py-2 rounded font-semibold transition ${
              tab === 'password' ? 'btn-primary' : 'btn-outline'
            }`} 
            onClick={() => setTab('password')}
          >
            Change Password
          </button>
          <button 
            className={`w-full py-2 rounded font-semibold transition ${
              tab === 'bookings' ? 'btn-primary' : 'btn-outline'
            }`} 
            onClick={() => setTab('bookings')}
          >
            My Bookings ({bookings.length})
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 card p-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex justify-between items-center">
            {error}
            <button onClick={() => setError('')}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded flex justify-between items-center">
            {success}
            <button onClick={() => setSuccess('')}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <>
            <div className="flex gap-2 mb-6">
              <button 
                className={`px-4 py-2 rounded-t font-semibold border-b-2 transition ${
                  bookingsTab === 'all' 
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-blue-50' 
                    : 'border-transparent text-slate-600 bg-slate-50 hover:bg-blue-50'
                }`} 
                onClick={() => setBookingsTab('all')}
              >
                Active Bookings ({bookings.filter(b => b.status !== 'cancelled').length})
              </button>
              <button 
                className={`px-4 py-2 rounded-t font-semibold border-b-2 transition ${
                  bookingsTab === 'cancelled' 
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-blue-50' 
                    : 'border-transparent text-slate-600 bg-slate-50 hover:bg-blue-50'
                }`} 
                onClick={() => setBookingsTab('cancelled')}
              >
                Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
              </button>
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No bookings found</h3>
                  <p className="text-slate-500">
                    {bookingsTab === 'cancelled' 
                      ? 'You have no cancelled bookings' 
                      : 'You haven\'t made any bookings yet'
                    }
                  </p>
                </div>
              ) : (
                filteredBookings.map(booking => (
                  <div key={booking._id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <span className="text-[var(--color-primary)]">🏟️</span> 
                        {booking.venue?.name} ({booking.venue?.sport})
                      </div>
                      <div className="text-sm text-slate-600 mb-1">
                        📅 {booking.date} • {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="text-sm text-slate-500 mb-2">
                        📍 {booking.venue?.location}
                      </div>
                      <div className="text-sm">
                        Status: <span className={`font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      {booking.totalAmount && (
                        <div className="text-sm text-slate-600 mt-1">
                          Amount: ₹{booking.totalAmount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {booking.status === 'booked' && (
                        <button 
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition text-sm"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-sm">
                          Write Review
                        </button>
                      )}
                      <button className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Edit Profile Tab */}
        {tab === 'edit' && (
          <form onSubmit={handleProfileSubmit} className="max-w-lg mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">Edit Profile</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.username}
                onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <select
                value={profileForm.location}
                onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button 
                type="button"
                onClick={() => fetchUserProfile()}
                className="btn-outline"
                disabled={formLoading}
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Change Password Tab */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="max-w-lg mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">Change Password</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPasswords.old ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPasswords.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPasswords.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button 
                type="button"
                onClick={() => setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })}
                className="btn-outline"
                disabled={formLoading}
              >
                Clear
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={formLoading}
              >
                {formLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default Profile;
