import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon,
  CurrencyRupeeIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useToast } from './ToastProvider';

const VenueCard = ({ venue }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleViewDetails = () => {
    setShowVenueModal(true);
  };

  const handleBookNow = () => {
    if (venue.isStatic) {
      toast.info('This is a demo venue. Please select from available venues to book.');
      return;
    }

    if (!token) {
      toast.warning('Please login to book a venue', 'Login Required');
      // Redirect to login page
      window.location.href = '/login';
      return;
    }

    // Redirect to venue details page
    navigate(`/venue/${venue._id}`);
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
      toast.success('Link copied to clipboard!');
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
    <>
      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-100 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={venue.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
            alt={venue.name}
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
              {(venue.pricing?.hourlyRate || venue.pricePerHour) && (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <CurrencyRupeeIcon className="w-4 h-4" />
                  <span className="text-sm">{venue.pricing?.hourlyRate || venue.pricePerHour}/hr</span>
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
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleViewDetails}
                className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg border-2 border-slate-200 text-slate-700 font-medium hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
              >
                <EyeIcon className="w-4 h-4" />
                Details
              </button>
              <button 
                onClick={handleBookNow}
                className={`py-2 px-3 rounded-lg font-medium transition-all duration-300 ${
                  venue.isStatic 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                }`}
              >
                {venue.isStatic ? 'Demo' : 'Book'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Details Modal */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{venue.name}</h2>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{venue.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-600">🏟️ {venue.sport}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowVenueModal(false)}
                  className="text-slate-500 hover:text-slate-700 p-2"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Images & Details */}
                <div>
                  <div className="mb-6">
                    <img
                      src={venue.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                      alt={venue.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>

                  {venue.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">About This Venue</h3>
                      <p className="text-slate-600 leading-relaxed">{venue.description}</p>
                    </div>
                  )}

                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {venue.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2 text-slate-600">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Booking & Info */}
                <div>
                  {/* Pricing */}
                  {venue.pricing?.hourlyRate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Price per hour:</span>
                        <span className="text-2xl font-bold text-blue-600">₹{venue.pricing.hourlyRate}</span>
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {venue.operatingHours && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Operating Hours</h3>
                      <div className="flex items-center gap-2 text-slate-600">
                        <ClockIcon className="w-5 h-5" />
                        <span>{venue.operatingHours.open} - {venue.operatingHours.close}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {(venue.contactInfo?.phone || venue.contactInfo?.email || venue.owner || venue.manager) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        {venue.contactInfo?.phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <PhoneIcon className="w-4 h-4" />
                            <span>{venue.contactInfo.phone}</span>
                          </div>
                        )}
                        {venue.contactInfo?.email && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <EnvelopeIcon className="w-4 h-4" />
                            <span>{venue.contactInfo.email}</span>
                          </div>
                        )}
                        {venue.owner && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <UserIcon className="w-4 h-4" />
                            <span>Owner: {venue.owner.username || venue.owner.email}</span>
                          </div>
                        )}
                        {venue.manager && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <span>Manager: {venue.manager.username || venue.manager.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Capacity */}
                  {venue.capacity && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">Capacity</h3>
                      <p className="text-slate-600">{venue.capacity} players</p>
                    </div>
                  )}

                  {/* Sports Supported */}
                  {venue.sportsSupported && venue.sportsSupported.length > 1 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Sports Supported</h3>
                      <div className="flex flex-wrap gap-2">
                        {venue.sportsSupported.map((sport, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {sport}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!venue.isStatic && (
                      <button
                        onClick={() => {
                          setShowVenueModal(false);
                          handleBookNow();
                        }}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Book This Venue
                      </button>
                    )}
                    <button
                      onClick={() => setShowVenueModal(false)}
                      className="w-full py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VenueCard;
