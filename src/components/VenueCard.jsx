import React, { useState } from 'react';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon,
  CurrencyRupeeIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const API_BASE = 'http://localhost:5000/api/bookings';

const VenueCard = ({ venue }) => {
  const [isBooking, setIsBooking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const startTime = '17:30';
  const endTime = '18:00';

  const bookNow = async () => {
    if (venue.isStatic) {
      alert('This is a demo venue. Please select from available venues to book.');
      return;
    }

    if (!token) {
      alert('Please login to book a venue');
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          venueId: venue._id || venue.id, 
          date: dateStr, 
          startTime, 
          endTime 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      
      alert('Booking confirmed successfully!');
    } catch (e) {
      alert(e.message);
    } finally {
      setIsBooking(false);
    }
  };

  const joinWaitlist = async () => {
    if (venue.isStatic) {
      alert('This is a demo venue. Please select from available venues.');
      return;
    }

    if (!token) {
      alert('Please login to join waitlist');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          venueId: venue._id || venue.id, 
          date: dateStr, 
          startTime, 
          endTime 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not join waitlist');
      
      alert('Added to waitlist for this slot');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: venue.name,
        text: `Check out ${venue.name} - ${venue.sport} venue in ${venue.location}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarSolid key={i} className="w-4 h-4 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="w-4 h-4 text-yellow-400" />);
    }
    
    return stars;
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `₹${price}/hr`;
  };

  const getBadgeColor = (tag) => {
    const tagLower = tag?.toLowerCase() || '';
    if (tagLower.includes('premium') || tagLower.includes('featured')) return 'bg-purple-100 text-purple-700';
    if (tagLower.includes('top rated') || tagLower.includes('popular')) return 'bg-green-100 text-green-700';
    if (tagLower.includes('budget') || tagLower.includes('affordable')) return 'bg-blue-100 text-blue-700';
    if (tagLower.includes('indoor')) return 'bg-indigo-100 text-indigo-700';
    if (tagLower.includes('outdoor')) return 'bg-orange-100 text-orange-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 h-full flex flex-col">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={venue.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
          alt={venue.name}
          className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition"
          >
            <HeartIcon className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition"
          >
            <ShareIcon className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Rating Badge */}
        {venue.rating && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
            <div className="flex items-center gap-1">
              {renderStars(venue.rating)}
            </div>
            <span className="text-sm font-semibold text-slate-800">{venue.rating}</span>
            {venue.reviews && (
              <span className="text-xs text-slate-500">({venue.reviews})</span>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
            {venue.name}
          </h3>
          
          <div className="flex items-center gap-1 text-slate-600 mb-2">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{venue.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-blue-600">
              <span className="text-sm font-medium">🏟️ {venue.sport}</span>
            </div>
            {venue.pricePerHour && (
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <CurrencyRupeeIcon className="w-4 h-4" />
                <span className="text-sm">{venue.pricePerHour}/hr</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {venue.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
            {venue.description}
          </p>
        )}

        {/* Tags */}
        {venue.tags && venue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {venue.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeColor(tag)}`}
              >
                {tag}
              </span>
            ))}
            {venue.tags.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                +{venue.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {venue.amenities.slice(0, 2).map((amenity, index) => (
                <span key={index} className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {venue.operatingHours && (
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
            <ClockIcon className="w-4 h-4" />
            <span>{venue.operatingHours.open} - {venue.operatingHours.close}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto grid gap-2">
          <button 
            onClick={bookNow} 
            disabled={isBooking}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
              venue.isStatic 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
            } ${isBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isBooking ? 'Booking...' : venue.isStatic ? 'Demo Venue' : 'Book Now'}
          </button>
          
          {!venue.isStatic && (
            <button 
              onClick={joinWaitlist} 
              className="w-full py-2 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
            >
              Join Waitlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
