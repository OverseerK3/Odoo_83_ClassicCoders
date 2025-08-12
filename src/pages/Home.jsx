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
import authService from '../utils/auth';

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
      
      // Fetch all home page data in parallel - these endpoints don't require auth
      const [randomRes, featuredRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/random`),
        fetch(`${API_BASE}/featured`),
        fetch(`${API_BASE}/stats`)
      ]);

      // Check if responses are ok
      if (!randomRes.ok || !featuredRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [randomData, featuredData, statsData] = await Promise.all([
        randomRes.json(),
        featuredRes.json(),
        statsRes.json()
      ]);

      // Ensure data is arrays
      setVenues(Array.isArray(randomData) ? randomData : []);
      setFeaturedVenues(Array.isArray(featuredData) ? featuredData : []);
      setStats(statsData || {});
      setError('');
    } catch (err) {
      console.error('Fetch home data error:', err);
      setError('Failed to load content');
      // Set empty arrays on error
      setVenues([]);
      setFeaturedVenues([]);
      setStats({});
    } finally {
      setLoading(false);
    }
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
                  href="/sports" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                >
                  Browse Sports
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
              <div className="text-2xl font-bold text-green-600">{stats.totalSports || 0}</div>
              <div className="text-sm text-slate-600">Sports Available</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 text-center">
              <div className="text-3xl mb-2">📍</div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalLocations || 0}</div>
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

      {/* QUICK ACCESS SECTION */}
      <section className="max-w-6xl mx-auto mt-16 px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Quick Access
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Jump right into what you need - browse sports, find venues, or manage your bookings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a 
            href="/sports"
            className="group bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 rounded-2xl p-8 shadow-lg border border-slate-100 hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:animate-bounce">🏆</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Browse Sports</h3>
              <p className="text-slate-600 leading-relaxed">
                Explore different sports categories and find venues that match your interests
              </p>
              <div className="mt-4 inline-flex items-center text-blue-600 font-semibold">
                View Sports →
              </div>
            </div>
          </a>

          <a 
            href="/venues"
            className="group bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 rounded-2xl p-8 shadow-lg border border-slate-100 hover:border-green-200 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:animate-bounce">🏟️</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Find Venues</h3>
              <p className="text-slate-600 leading-relaxed">
                Search and filter through our extensive collection of sports venues
              </p>
              <div className="mt-4 inline-flex items-center text-green-600 font-semibold">
                Browse Venues →
              </div>
            </div>
          </a>

          <a 
            href="/my-bookings"
            className="group bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 rounded-2xl p-8 shadow-lg border border-slate-100 hover:border-purple-200 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:animate-bounce">📅</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">My Bookings</h3>
              <p className="text-slate-600 leading-relaxed">
                Manage your upcoming bookings and view your booking history
              </p>
              <div className="mt-4 inline-flex items-center text-purple-600 font-semibold">
                View Bookings →
              </div>
            </div>
          </a>
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
