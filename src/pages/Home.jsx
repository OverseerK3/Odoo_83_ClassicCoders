import React, { useEffect, useState } from 'react';
import { 
  MapPinIcon, 
  ChartBarIcon, 
  ClockIcon,
  FireIcon,
  TrophyIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import VenueCard from '../components/VenueCard';

const API_BASE = 'http://localhost:5000/api/venues';

const Home = () => {
  const [venues, setVenues] = useState([]);
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch all home page data in parallel
      const [randomRes, featuredRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/random`),
        fetch(`${API_BASE}/featured`),
        fetch(`${API_BASE}/stats`)
      ]);

      const [randomData, featuredData, statsData] = await Promise.all([
        randomRes.json(),
        featuredRes.json(),
        statsRes.json()
      ]);

      setVenues(randomData || []);
      setFeaturedVenues(featuredData || []);
      setStats(statsData || null);
      setError('');
    } catch (err) {
      console.error('Fetch home data error:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getTopSports = () => {
    if (!stats?.sports) return [];
    return stats.sports.slice(0, 4);
  };

  const getSportIcon = (sport) => {
    const sportName = sport.toLowerCase();
    if (sportName.includes('badminton')) return '🏸';
    if (sportName.includes('football') || sportName.includes('soccer')) return '⚽';
    if (sportName.includes('cricket')) return '🏏';
    if (sportName.includes('tennis')) return '🎾';
    if (sportName.includes('basketball')) return '🏀';
    if (sportName.includes('swimming')) return '🏊';
    if (sportName.includes('table tennis') || sportName.includes('ping pong')) return '🏓';
    return '🏟️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto pt-6 md:pt-12 px-4 md:px-6">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium w-fit">
                <FireIcon className="w-4 h-4" />
                Find Your Perfect Match
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Connect, Play & 
                <span className="text-yellow-300"> Win Together</span>
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                Discover amazing sports venues and connect with like-minded players in your city. Your next game is just a click away!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/venues" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                >
                  Explore Venues
                </a>
                <a 
                  href="/my-bookings" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 text-center"
                >
                  My Bookings
                </a>
              </div>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="text-8xl">🏟️</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-800 p-3 rounded-full">
                  <TrophyIcon className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-400 text-green-800 p-3 rounded-full">
                  <UsersIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      {stats && (
        <section className="max-w-6xl mx-auto mt-12 px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 text-center">
              <div className="text-3xl mb-2">🏟️</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalVenues}</div>
              <div className="text-sm text-slate-600">Total Venues</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 text-center">
              <div className="text-3xl mb-2">🌟</div>
              <div className="text-2xl font-bold text-green-600">{stats.sports?.length || 0}</div>
              <div className="text-sm text-slate-600">Sports Available</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 text-center">
              <div className="text-3xl mb-2">📍</div>
              <div className="text-2xl font-bold text-purple-600">{stats.locations}</div>
              <div className="text-sm text-slate-600">Cities Covered</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-slate-600">Booking Support</div>
            </div>
          </div>
        </section>
      )}

      {/* POPULAR SPORTS */}
      <section className="max-w-6xl mx-auto mt-16 px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Popular Sports
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose from a wide variety of sports and find the perfect venue for your next game
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {getTopSports().map((sport, index) => (
            <div 
              key={sport._id} 
              className="group bg-white hover:bg-blue-50 rounded-2xl p-6 shadow-lg border border-slate-100 hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:animate-bounce">
                  {getSportIcon(sport._id)}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 capitalize">
                  {sport._id}
                </h3>
                <div className="text-blue-600 font-semibold text-lg mb-1">
                  {sport.count} venues
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-slate-500">
                  <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {sport.avgRating ? sport.avgRating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Avg: ₹{sport.avgPrice ? Math.round(sport.avgPrice) : 'N/A'}/hr
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED VENUES */}
      {featuredVenues.length > 0 && (
        <section className="max-w-6xl mx-auto mt-16 px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                Featured Venues
              </h2>
              <p className="text-lg text-slate-600">
                Hand-picked premium venues for the best experience
              </p>
            </div>
            <a 
              href="/venues" 
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline"
            >
              View All
              <ChartBarIcon className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredVenues.slice(0, 4).map(venue => (
              <div key={venue._id} className="transform hover:scale-105 transition-transform duration-300">
                <VenueCard venue={venue} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <a 
              href="/venues" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              View All Venues
              <ChartBarIcon className="w-5 h-5" />
            </a>
          </div>
        </section>
      )}

      {/* POPULAR VENUES */}
      <section className="max-w-6xl mx-auto mt-16 mb-16 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              Discover Venues
            </h2>
            <p className="text-lg text-slate-600">
              Explore top-rated venues in your area
            </p>
          </div>
          <a 
            href="/venues" 
            className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline"
          >
            Explore More
            <MapPinIcon className="w-5 h-5" />
          </a>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 mt-4">Discovering amazing venues...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button 
              onClick={fetchHomeData}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No venues available</h3>
            <p className="text-slate-500">Check back later for new venues in your area</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {venues.slice(0, 8).map(venue => (
                <div key={venue._id} className="transform hover:scale-105 transition-transform duration-300">
                  <VenueCard venue={venue} />
                </div>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <a 
                href="/venues" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Explore All Venues
                <MapPinIcon className="w-5 h-5" />
              </a>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
