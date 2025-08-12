import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  StarIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import VenueCard from '../components/VenueCard';

const API_BASE = 'http://localhost:5000/api/venues';

const locations = ['All Locations', 'Ahmedabad', 'Rajkot', 'Surat', 'Vadodara', 'Gandhinagar', 'Mehsana', 'Palanpur', 'Bhavnagar'];
const sports = ['All Sports', 'Badminton', 'Football', 'Cricket', 'Tennis', 'Table Tennis', 'Basketball', 'Swimming'];

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    location: 'All Locations',
    sport: 'All Sports',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVenues();
  }, [filters, currentPage]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (filters.location && filters.location !== 'All Locations') {
        params.append('location', filters.location);
      }
      if (filters.sport && filters.sport !== 'All Sports') {
        params.append('sport', filters.sport);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }

      const res = await fetch(`${API_BASE}?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setVenues(data.venues || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Fetch venues error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      location: 'All Locations',
      sport: 'All Sports',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 mb-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Find Your Perfect 
                <span className="text-yellow-300"> Sports Venue</span>
              </h1>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                Discover premium venues, connect with players, and book your next game in seconds!
              </p>
              <div className="flex items-center gap-2 text-blue-200">
                <MapPinIcon className="w-5 h-5" />
                <span className="text-lg">Available across Gujarat</span>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="text-8xl">🏟️</div>
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-800 p-3 rounded-full animate-bounce">
                  <StarIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search venues, sports, or locations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t border-slate-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sport</label>
                  <select
                    value={filters.sport}
                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Price (₹/hr)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Price (₹/hr)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700">Sort by:</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                    }}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt-desc">Latest First</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="pricePerHour-asc">Price: Low to High</option>
                    <option value="pricePerHour-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </div>

                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              {filters.search || filters.location !== 'All Locations' || filters.sport !== 'All Sports' 
                ? 'Search Results' 
                : 'All Venues'
              }
            </h2>
            {pagination && (
              <div className="text-slate-600">
                Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, pagination.totalVenues)} of {pagination.totalVenues} venues
              </div>
            )}
          </div>
        </div>

        {/* Venues Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 mt-4">Finding amazing venues...</p>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No venues found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or search terms</p>
            <button 
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {venues.map(venue => (
                <div 
                  key={venue._id} 
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <VenueCard venue={venue} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>

                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 || 
                    page === pagination.totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Venues;
