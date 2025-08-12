import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import VenueCard from '../components/VenueCard';
import { useToast } from '../components/ToastProvider';

const API_BASE = 'http://localhost:5000/api/venues';

const Sports = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [sports, setSports] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  const toast = useToast();

  // Sports data with icons and descriptions
  const sportsData = [
    {
      id: 'badminton',
      name: 'Badminton',
      icon: '🏸',
      description: 'Fast-paced racquet sport played with shuttlecocks',
      color: 'bg-blue-500'
    },
    {
      id: 'football',
      name: 'Football',
      icon: '⚽',
      description: 'The world\'s most popular team sport',
      color: 'bg-green-500'
    },
    {
      id: 'cricket',
      name: 'Cricket',
      icon: '🏏',
      description: 'Strategic bat-and-ball game with wickets',
      color: 'bg-orange-500'
    },
    {
      id: 'tennis',
      name: 'Tennis',
      icon: '🎾',
      description: 'Classic racquet sport on courts',
      color: 'bg-red-500'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      icon: '🏀',
      description: 'High-energy game with hoops and teamwork',
      color: 'bg-purple-500'
    },
    {
      id: 'swimming',
      name: 'Swimming',
      icon: '🏊',
      description: 'Water sport for fitness and competition',
      color: 'bg-cyan-500'
    },
    {
      id: 'table tennis',
      name: 'Table Tennis',
      icon: '🏓',
      description: 'Fast indoor racquet sport on tables',
      color: 'bg-yellow-500'
    },
    {
      id: 'volleyball',
      name: 'Volleyball',
      icon: '🏐',
      description: 'Team sport played over a net',
      color: 'bg-indigo-500'
    }
  ];

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [venues, selectedSport, selectedLocation, searchQuery, sortBy, priceRange]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      
      const data = await response.json();
      const venueList = data.venues || data || [];
      
      setVenues(venueList);
      
      // Extract unique sports and locations
      const uniqueSports = [...new Set(venueList.map(v => v.sport?.toLowerCase()).filter(Boolean))];
      const uniqueLocations = [...new Set(venueList.map(v => v.location).filter(Boolean))];
      
      setSports(uniqueSports);
      setLocations(uniqueLocations);
      
    } catch (error) {
      console.error('Fetch venues error:', error);
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const filterVenues = () => {
    let filtered = [...venues];

    // Filter by sport
    if (selectedSport !== 'all') {
      filtered = filtered.filter(venue => 
        venue.sport?.toLowerCase() === selectedSport.toLowerCase() ||
        venue.sportsSupported?.some(sport => 
          sport.toLowerCase() === selectedSport.toLowerCase()
        )
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(venue => 
        venue.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(venue =>
        venue.name?.toLowerCase().includes(query) ||
        venue.description?.toLowerCase().includes(query) ||
        venue.location?.toLowerCase().includes(query) ||
        venue.amenities?.some(amenity => amenity.toLowerCase().includes(query))
      );
    }

    // Filter by price range
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(venue => {
        const price = venue.pricing?.hourlyRate || venue.pricePerHour || 0;
        const min = priceRange.min ? parseInt(priceRange.min) : 0;
        const max = priceRange.max ? parseInt(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Sort venues
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price-low':
          return (a.pricing?.hourlyRate || 0) - (b.pricing?.hourlyRate || 0);
        case 'price-high':
          return (b.pricing?.hourlyRate || 0) - (a.pricing?.hourlyRate || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredVenues(filtered);
  };

  const clearFilters = () => {
    setSelectedSport('all');
    setSelectedLocation('all');
    setSearchQuery('');
    setSortBy('name');
    setPriceRange({ min: '', max: '' });
  };

  const getSportData = (sportName) => {
    return sportsData.find(sport => 
      sport.id.toLowerCase() === sportName?.toLowerCase()
    ) || {
      id: sportName,
      name: sportName,
      icon: '🏟️',
      description: 'Sport venue',
      color: 'bg-gray-500'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500">Loading sports venues...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Sports & Venues
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover amazing sports venues across different categories. Find the perfect place for your next game!
          </p>
        </div>

        {/* Sports Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Browse by Sport</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <button
              onClick={() => setSelectedSport('all')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedSport === 'all'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="text-3xl mb-2">🏟️</div>
              <div className="text-sm font-semibold">All Sports</div>
            </button>
            
            {sportsData.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedSport === sport.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">{sport.icon}</div>
                <div className="text-sm font-semibold">{sport.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price Range (₹/hour)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              {selectedSport === 'all' ? 'All Venues' : `${getSportData(selectedSport).name} Venues`}
            </h3>
            <p className="text-slate-600">
              {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No venues found</h3>
            <p className="text-slate-500 mb-4">
              Try adjusting your filters or search for different criteria
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue._id || venue.id} venue={venue} />
            ))}
          </div>
        )}

        {/* Load More (if pagination needed) */}
        {filteredVenues.length > 0 && filteredVenues.length % 12 === 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Load More Venues
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sports;
