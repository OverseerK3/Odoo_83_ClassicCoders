import React from 'react';

const VenueCard = ({ venue }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <img
        src={venue.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
        alt={venue.name}
        className="h-40 w-full object-cover"
      />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-blue-700 mb-1">{venue.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{venue.location}</p>
        <p className="text-xs text-gray-500 mb-2">Sport: {venue.sport}</p>
        <p className="text-xs text-gray-700 mb-4 flex-1">{venue.description?.slice(0, 80) || 'No description.'}</p>
        <button className="mt-auto bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm font-semibold">Book Now</button>
      </div>
    </div>
  );
};

export default VenueCard;
