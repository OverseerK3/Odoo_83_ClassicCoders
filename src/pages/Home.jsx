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
    <div className="min-h-screen bg-gray-100">
      {/* HERO SECTION */}
      <section className="max-w-4xl md:max-w-5xl mx-auto mt-4 md:mt-8 px-2 md:px-0">
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
            alt="Sports Court"
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-4 md:p-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">Book Local Sports Courts in Seconds</h1>
            <p className="text-base md:text-lg text-gray-200 mb-4">Real-time availability for badminton, turf, tennis and more. Create or join matches near you.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/venues" className="px-5 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition text-center">Find a Venue</a>
              <a href="/my-bookings" className="px-5 py-2 bg-white bg-opacity-80 text-gray-900 rounded font-semibold hover:bg-gray-100 transition text-center">View My Bookings</a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-4xl md:max-w-5xl mx-auto mt-8 md:mt-10 px-2 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="bg-white rounded-lg shadow p-4 md:p-5 flex flex-col items-start">
              <span className="text-base md:text-lg font-bold text-blue-700 mb-1">{cat.name}</span>
              <span className="text-xs text-gray-500 mb-2">{cat.venues} venues</span>
              <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 font-semibold">Popular</span>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR VENUES */}
      <section className="max-w-4xl md:max-w-5xl mx-auto mt-10 md:mt-12 px-2 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2 md:gap-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Popular Venues</h2>
          <a href="/venues" className="text-blue-600 font-semibold hover:underline">View all</a>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="text-center text-gray-500">No venues available.</div>
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
