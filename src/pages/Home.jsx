import React, { useEffect, useState } from 'react';
import VenueCard from '../components/VenueCard';

const CATEGORIES = [
  { name: 'Badminton', venues: 16 },
  { name: 'Football Turf', venues: 12 },
  { name: 'Tennis', venues: 9 },
  { name: 'Table Tennis', venues: 14 },
];

const Home = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/venues/random')
      .then(res => res.json())
      .then(data => {
        setVenues(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-4">
        <div className="relative rounded-2xl overflow-hidden shadow-md card">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
            alt="Sports Court"
            className="w-full h-56 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5 md:p-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">Find Players & Venues Nearby</h1>
            <p className="text-base md:text-lg text-white/90 mb-4 max-w-2xl">Seamlessly explore sports venues and play with sports enthusiasts just like you!</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/venues" className="btn-primary text-center">Find a Venue</a>
              <a href="/my-bookings" className="btn-outline text-center">View My Bookings</a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-5xl mx-auto mt-8 md:mt-12 px-3 md:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="card p-5 flex flex-col items-start">
              <span className="text-base md:text-lg font-bold text-[var(--color-primary)] mb-1">{cat.name}</span>
              <span className="text-xs text-slate-500 mb-2">{cat.venues} venues</span>
              <span className="badge-accent">Popular</span>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR VENUES */}
      <section className="max-w-5xl mx-auto mt-10 md:mt-14 px-3 md:px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2 md:gap-0">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Popular Venues</h2>
          <a href="/venues" className="text-[var(--color-primary)] font-semibold hover:underline">View all</a>
        </div>
        {loading ? (
          <div className="text-center text-slate-500">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="text-center text-slate-500">No venues available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {venues.map(venue => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
