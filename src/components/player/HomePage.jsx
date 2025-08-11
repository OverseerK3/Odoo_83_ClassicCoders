import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  FireIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const HomePage = ({ onNavigateToVenues, onNavigateToVenue }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularVenues, setPopularVenues] = useState([]);
  const [trendingSports, setTrendingSports] = useState([]);
  const [loading, setLoading] = useState(true);

  const bannerSlides = [
    {
      id: 1,
      image: '/api/placeholder/1200/400',
      title: 'Find Your Perfect Court',
      subtitle: 'Book premium sports facilities across the city',
      cta: 'Explore Venues',
      overlay: 'bg-gradient-to-r from-blue-600/80 to-purple-600/80'
    },
    {
      id: 2,
      image: '/api/placeholder/1200/400',
      title: 'Play Your Favorite Sport',
      subtitle: 'Cricket, Basketball, Tennis & More Available',
      cta: 'View Sports',
      overlay: 'bg-gradient-to-r from-green-600/80 to-teal-600/80'
    },
    {
      id: 3,
      image: '/api/placeholder/1200/400',
      title: 'Book Instantly, Play Today',
      subtitle: 'Real-time availability and instant confirmations',
      cta: 'Book Now',
      overlay: 'bg-gradient-to-r from-orange-600/80 to-red-600/80'
    }
  ];

  useEffect(() => {
    // Simulate fetching popular data
    const fetchHomeData = async () => {
      setTimeout(() => {
        setPopularVenues([
          {
            id: 1,
            name: 'Elite Sports Complex',
            sports: ['Basketball', 'Badminton'],
            location: 'Downtown',
            price: 800,
            rating: 4.8,
            visits: 156,
            image: '/api/placeholder/300/200'
          },
          {
            id: 2,
            name: 'Victory Tennis Academy',
            sports: ['Tennis'],
            location: 'Sector 21',
            price: 600,
            rating: 4.6,
            visits: 142,
            image: '/api/placeholder/300/200'
          },
          {
            id: 3,
            name: 'Champions Cricket Ground',
            sports: ['Cricket'],
            location: 'Sports City',
            price: 1200,
            rating: 4.9,
            visits: 128,
            image: '/api/placeholder/300/200'
          }
        ]);

        setTrendingSports([
          {
            sport: 'Cricket',
            growth: '+25%',
            bookings: 856,
            venues: 23,
            icon: '🏏'
          },
          {
            sport: 'Basketball',
            growth: '+18%',
            bookings: 623,
            venues: 18,
            icon: '🏀'
          },
          {
            sport: 'Badminton',
            growth: '+15%',
            bookings: 445,
            venues: 15,
            icon: '🏸'
          },
          {
            sport: 'Tennis',
            growth: '+12%',
            bookings: 312,
            venues: 12,
            icon: '🎾'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchHomeData();
  }, []);

  // Auto-slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToVenues({ search: searchQuery });
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Slider */}
      <div className="relative h-96 overflow-hidden">
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className="relative h-full">
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 ${slide.overlay}`} />
              <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                <div className="max-w-2xl px-6">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    {slide.subtitle}
                  </p>
                  <button 
                    onClick={() => onNavigateToVenues()}
                    className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Find Your Perfect Sports Venue
            </h2>
            <p className="text-gray-600">
              Search from hundreds of premium facilities across the city
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues by name or location..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Most Visited Venues */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <FireIcon className="w-8 h-8 text-orange-500" />
                Most Visited Venues
              </h2>
              <p className="text-gray-600">Popular choices among players like you</p>
            </div>
            <button 
              onClick={() => onNavigateToVenues({ sortBy: 'popular' })}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularVenues.map((venue) => (
              <div 
                key={venue.id}
                onClick={() => onNavigateToVenue(venue.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative">
                  <img 
                    src={venue.image} 
                    alt={venue.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    {venue.visits} visits
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {venue.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-sm">{venue.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.sports.map((sport) => (
                      <span 
                        key={sport}
                        className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        i < Math.floor(venue.rating) ? 
                        <StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" /> :
                        <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        {venue.rating}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      ₹{venue.price}/hr
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Sports */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <TrendingUpIcon className="w-8 h-8 text-green-500" />
                Trending Sports
              </h2>
              <p className="text-gray-600">Sports with highest player activity this month</p>
            </div>
            <button 
              onClick={() => onNavigateToVenues()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Explore All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingSports.map((sport) => (
              <div 
                key={sport.sport}
                onClick={() => onNavigateToVenues({ sport: sport.sport })}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{sport.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {sport.sport}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-green-600 font-medium">{sport.growth}</span>
                    <TrendingUpIcon className="w-4 h-4 text-green-500" />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div>{sport.bookings} bookings this month</div>
                    <div>{sport.venues} venues available</div>
                  </div>

                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Find {sport.sport} Courts
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
