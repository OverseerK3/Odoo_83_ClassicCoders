import React, { useState } from 'react';

const locations = ['Ahmedabad', 'Rajkot', 'Surat', 'Vadodara'];
const [defaultLocation] = locations;

const venues = [
  {
    id: 1,
    name: 'SBR Badminton',
    rating: 4.5,
    reviews: 6,
    location: 'Vaishnodevi Cir',
    tags: ['badminton', 'Outdoor', 'Top Rated', 'Budget'],
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: 'Skyline Sports',
    rating: 4.7,
    reviews: 12,
    location: 'Science City',
    tags: ['badminton', 'Indoor', 'Premium'],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: 'Arena Turf',
    rating: 4.2,
    reviews: 8,
    location: 'Prahladnagar',
    tags: ['football', 'Outdoor', 'Budget'],
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    name: 'Cricket Club',
    rating: 4.8,
    reviews: 15,
    location: 'Navrangpura',
    tags: ['cricket', 'Outdoor', 'Top Rated'],
    image: 'https://images.unsplash.com/photo-1505843271134-3f8d96295c1c?auto=format&fit=crop&w=400&q=80',
  },
];

const sports = [
  { name: 'Badminton', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Football', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { name: 'Cricket', image: 'https://images.unsplash.com/photo-1505843271134-3f8d96295c1c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Swimming', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tennis', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Table Tennis', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80' },
];

const Venues = () => {
  const [location, setLocation] = useState(defaultLocation);
  const [venueIndex, setVenueIndex] = useState(0);
  const visibleVenues = venues.slice(venueIndex, venueIndex + 4);

  const handlePrev = () => {
    setVenueIndex(i => Math.max(0, i - 1));
  };
  const handleNext = () => {
    setVenueIndex(i => Math.min(venues.length - 4, i + 1));
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-2 md:px-6 flex flex-col gap-10">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">📍</span>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="border rounded px-3 py-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">FIND PLAYERS & VENUES NEARBY</h1>
          <p className="text-gray-600 max-w-md">Seamlessly explore sports venues and play with sports enthusiasts just like you!</p>
        </div>
        <div className="flex-1 flex justify-center items-center min-h-[180px]">
          <div className="w-48 h-36 md:w-64 md:h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-2xl">IMAGE</div>
        </div>
      </div>

      {/* Book Venues Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">Book Venues</h2>
          <a href="#" className="text-blue-600 font-semibold hover:underline">See all venues &gt;...</a>
        </div>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {visibleVenues.map(venue => (
              <div key={venue.id} className="min-w-[260px] max-w-xs bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
                <div className="h-32 w-full rounded-lg bg-gray-200 mb-2 overflow-hidden flex items-center justify-center">
                  <img src={venue.image} alt={venue.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{venue.name}</span>
                  <span className="flex items-center gap-1 text-yellow-500 font-medium text-sm">
                    ★ {venue.rating} <span className="text-gray-500">({venue.reviews})</span>
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <span>📍</span>{venue.location}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {venue.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Carousel Controls */}
          <div className="flex justify-center gap-2 mt-2">
            <button onClick={handlePrev} disabled={venueIndex === 0} className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition disabled:opacity-50">
              &lt;
            </button>
            <button onClick={handleNext} disabled={venueIndex >= venues.length - 4} className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition disabled:opacity-50">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Popular Sports Section */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Popular Sports</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {sports.map(sport => (
            <div key={sport.name} className="min-w-[120px] max-w-[140px] flex flex-col items-center bg-gray-50 rounded-lg shadow hover:shadow-md transition p-2 cursor-pointer">
              <div className="w-24 h-20 rounded-md overflow-hidden mb-2 flex items-center justify-center bg-gray-200">
                <img src={sport.image} alt={sport.name} className="object-cover w-full h-full" />
              </div>
              <span className="font-semibold text-gray-700 text-sm text-center">{sport.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Venues;
