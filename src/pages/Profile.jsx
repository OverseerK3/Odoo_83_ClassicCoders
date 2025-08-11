import React, { useState } from 'react';

const userData = {
  name: 'Mitchell Admin',
  phone: '9999999999',
  email: 'mitchelladmin247@gmail.com',
  avatar: '',
};

const bookingsData = [
  {
    id: 1,
    venue: 'Skyline Badminton Court (Badminton)',
    date: '18 June 2025',
    time: '5:30 PM - 6:00 PM',
    location: 'Rajkot, Gujarat',
    status: 'Confirmed',
    cancelled: false,
  },
  {
    id: 2,
    venue: 'Skyline Badminton Court (Badminton)',
    date: '18 June 2024',
    time: '5:30 PM - 6:00 PM',
    location: 'Rajkot, Gujarat',
    status: 'Confirmed',
    cancelled: false,
  },
  {
    id: 3,
    venue: 'Skyline Badminton Court (Badminton)',
    date: '10 May 2024',
    time: '6:00 PM - 6:30 PM',
    location: 'Rajkot, Gujarat',
    status: 'Cancelled',
    cancelled: true,
  },
];

const Profile = () => {
  const [tab, setTab] = useState('bookings'); // 'bookings' or 'edit'
  const [bookingsTab, setBookingsTab] = useState('all');
  const [form, setForm] = useState({
    name: userData.name,
    email: userData.email,
    oldPassword: '',
    newPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const filteredBookings = bookingsData.filter(b => (bookingsTab === 'all' ? !b.cancelled : b.cancelled));

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormReset = () => {
    setForm({
      name: userData.name,
      email: userData.email,
      oldPassword: '',
      newPassword: '',
    });
    setFormMessage('');
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    // Simulate save
    setFormMessage('Profile updated successfully!');
    setTimeout(() => setFormMessage(''), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto py-8">
      {/* Sidebar */}
      <aside className="w-full md:w-1/3 bg-white rounded-xl shadow p-6 flex flex-col items-center gap-4">
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-5xl text-gray-400 mb-2 overflow-hidden">
          {userData.avatar ? (
            <img src={userData.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
          ) : (
            <span>{userData.name[0]}</span>
          )}
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 mb-1">{userData.name}</div>
          <div className="text-sm text-gray-500">{userData.phone}</div>
          <div className="text-sm text-gray-500">{userData.email}</div>
        </div>
        <button
          className={`w-full mt-2 py-2 rounded font-semibold transition ${tab === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700 hover:bg-blue-50'}`}
          onClick={() => setTab('edit')}
        >
          Edit Profile
        </button>
        <button
          className={`w-full py-2 rounded font-semibold transition ${tab === 'bookings' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700 hover:bg-blue-50'}`}
          onClick={() => setTab('bookings')}
        >
          All Bookings
        </button>
      </aside>
      {/* Main Content */}
      <section className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        {tab === 'bookings' ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-t font-semibold border-b-2 transition ${bookingsTab === 'all' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 bg-gray-50 hover:bg-blue-50'}`}
                onClick={() => setBookingsTab('all')}
              >
                All Bookings
              </button>
              <button
                className={`px-4 py-2 rounded-t font-semibold border-b-2 transition ${bookingsTab === 'cancelled' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 bg-gray-50 hover:bg-blue-50'}`}
                onClick={() => setBookingsTab('cancelled')}
              >
                Cancelled
              </button>
            </div>
            {/* Bookings List */}
            <div className="flex flex-col gap-4">
              {filteredBookings.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No bookings found.</div>
              ) : (
                filteredBookings.map(b => (
                  <div key={b.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-50">
                    <div>
                      <div className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <span className="text-blue-600">🏸</span> {b.venue}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{b.date} &bull; {b.time}</div>
                      <div className="text-sm text-gray-500 mb-1">{b.location}</div>
                      <div className="text-sm">
                        Status: {b.cancelled ? <span className="text-red-600 font-semibold">Cancelled</span> : <span className="text-green-600 font-semibold">Confirmed</span>}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-end">
                      {!b.cancelled && (
                        <button className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition text-sm">Cancel Booking</button>
                      )}
                      <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-sm">Write Review</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <form className="max-w-lg mx-auto flex flex-col gap-6" onSubmit={handleFormSubmit}>
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-5xl text-gray-400 mx-auto mb-2 overflow-hidden">
              {userData.avatar ? (
                <img src={userData.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{userData.name[0]}</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-medium text-gray-700">Full Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </label>
              <label className="font-medium text-gray-700">Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </label>
              <label className="font-medium text-gray-700">Old Password
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    name="oldPassword"
                    value={form.oldPassword}
                    onChange={handleFormChange}
                    className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowOldPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showOldPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 6.75 9.75 6.75c1.772 0 3.432-.37 4.89-1.027M6.228 6.228A10.45 10.45 0 0112 5.25c6 0 9.75 6.75 9.75 6.75a17.317 17.317 0 01-2.978 4.043M6.228 6.228L3 3m3.228 3.228l12.544 12.544" /></svg>
                    )}
                  </button>
                </div>
              </label>
              <label className="font-medium text-gray-700">New Password
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleFormChange}
                    className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowNewPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 6.75 9.75 6.75c1.772 0 3.432-.37 4.89-1.027M6.228 6.228A10.45 10.45 0 0112 5.25c6 0 9.75 6.75 9.75 6.75a17.317 17.317 0 01-2.978 4.043M6.228 6.228L3 3m3.228 3.228l12.544 12.544" /></svg>
                    )}
                  </button>
                </div>
              </label>
            </div>
            <div className="flex gap-4 justify-center mt-4">
              <button type="button" onClick={handleFormReset} className="px-6 py-2 rounded bg-gray-100 text-blue-700 font-semibold hover:bg-blue-50 transition">Reset</button>
              <button type="submit" className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition">Save</button>
            </div>
            {formMessage && <div className="text-green-600 text-center font-medium mt-2">{formMessage}</div>}
          </form>
        )}
      </section>
    </div>
  );
};

export default Profile;
