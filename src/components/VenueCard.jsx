import React from 'react';

const API_BASE = 'http://localhost:5000/api/bookings';

const VenueCard = ({ venue }) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const startTime = '17:30';
  const endTime = '18:00';

  const bookNow = async () => {
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ venueId: venue._id || venue.id, date: dateStr, startTime, endTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      alert('Booking confirmed');
    } catch (e) {
      alert(e.message);
    }
  };

  const joinWaitlist = async () => {
    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ venueId: venue._id || venue.id, date: dateStr, startTime, endTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not join waitlist');
      alert('Added to waitlist for this slot');
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      <img
        src={venue.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
        alt={venue.name}
        className="h-40 w-full object-cover"
      />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-[var(--color-primary)] mb-1">{venue.name}</h3>
        <p className="text-sm text-slate-600 mb-2">{venue.location}</p>
        <p className="text-xs text-slate-500 mb-2">Sport: {venue.sport}</p>
        <p className="text-xs text-slate-700 mb-4 flex-1">{venue.description?.slice(0, 80) || 'No description.'}</p>
        <div className="mt-auto grid grid-cols-1 gap-2">
          <button onClick={bookNow} className="btn-primary">Book Now</button>
          <button onClick={joinWaitlist} className="btn-outline">Join Waitlist</button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
