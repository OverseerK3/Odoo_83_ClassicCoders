import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon,
  CurrencyRupeeIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useToast } from '../components/ToastProvider';
import LoyaltyDashboard from '../components/LoyaltyDashboard';

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    courtName: '',
    notes: ''
  });
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Fetch venue details
  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/venues/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setVenue(data);
        } else {
          toast.error('Failed to load venue details');
          navigate('/venues');
        }
      } catch (error) {
        console.error('Error fetching venue:', error);
        toast.error('Error loading venue details');
        navigate('/venues');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenueDetails();
      fetchAvailableCards();
    }
  }, [id, navigate, toast]);

  // Fetch available discount cards for this venue
  const fetchAvailableCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/loyalty/status/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Get scratched but unused cards
        const usableCards = data.scratchedCards || [];
        setAvailableCards(usableCards);
      }
    } catch (error) {
      console.error('Error fetching discount cards:', error);
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

  const checkAvailability = async () => {
    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      toast.warning('Please fill in date and time details');
      return;
    }

    try {
      // Mock availability check - you can replace with actual API call
      toast.success('Time slot is available!');
      setAvailabilityChecked(true);
    } catch (error) {
      toast.error('Error checking availability');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!availabilityChecked) {
      toast.warning('Please check availability first');
      return;
    }

    setIsBooking(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          venueId: venue._id,
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          courtName: bookingData.courtName,
          notes: bookingData.notes,
          discountCardId: selectedCard?.cardId || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        let successMessage = 'Booking confirmed successfully!';
        if (result.discountApplied) {
          successMessage += ` You saved ₹${result.discountApplied.discountAmount} with your ${result.discountApplied.discountPercentage}% discount!`;
        }
        
        toast.success(successMessage);
        setShowBookingModal(false);
        setBookingData({
          date: '',
          startTime: '',
          endTime: '',
          courtName: '',
          notes: ''
        });
        setSelectedCard(null);
        setAvailabilityChecked(false);
        
        // Refresh available cards after using one
        fetchAvailableCards();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error creating booking');
    } finally {
      setIsBooking(false);
    }
  };

  const calculateDuration = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;
    const start = new Date(`2000-01-01T${bookingData.startTime}`);
    const end = new Date(`2000-01-01T${bookingData.endTime}`);
    return Math.max(0, (end - start) / (1000 * 60 * 60)); // hours
  };

  const calculateTotalPrice = () => {
    const duration = calculateDuration();
    const hourlyRate = venue?.pricing?.hourlyRate || venue?.pricePerHour || 0;
    const originalPrice = duration * hourlyRate;
    
    if (selectedCard) {
      const discountAmount = (originalPrice * selectedCard.discountPercentage) / 100;
      return {
        original: originalPrice,
        discount: discountAmount,
        final: originalPrice - discountAmount,
        percentage: selectedCard.discountPercentage
      };
    }
    
    return {
      original: originalPrice,
      discount: 0,
      final: originalPrice,
      percentage: 0
    };
  };

  const nextImage = () => {
    if (venue?.images && venue.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
    }
  };

  const prevImage = () => {
    if (venue?.images && venue.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue not found</h2>
          <button 
            onClick={() => navigate('/venues')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  const images = venue.images || [
    venue.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  ];

  // Mock reviews data (you can replace with actual API data)
  const reviews = [
    {
      id: 1,
      user: 'Priyanka Addra',
      rating: 5,
      comment: 'Nice venue, well maintained',
      date: '10 June 2024, 6:16 PM'
    },
    {
      id: 2,
      user: 'Priyanka Addra',
      rating: 5,
      comment: 'Nice venue, well maintained',
      date: '10 June 2024, 6:16 PM'
    },
    {
      id: 3,
      user: 'Priyanka Addra',
      rating: 5,
      comment: 'Nice venue, well maintained',
      date: '10 June 2024, 6:16 PM'
    },
    {
      id: 4,
      user: 'Priyanka Addra',
      rating: 5,
      comment: 'Nice venue, well maintained',
      date: '10 June 2024, 6:16 PM'
    },
    {
      id: 5,
      user: 'Priyanka Addra',
      rating: 5,
      comment: 'Nice venue, well maintained',
      date: '10 June 2024, 6:16 PM'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/venues')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
                <div className="flex items-center gap-4 text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{venue.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(venue.rating || 4.5)}
                    <span className="ml-1">{venue.rating || '4.5'} ({venue.reviews || 4})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <HeartIcon className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <ShareIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-96">
                <img
                  src={images[currentImageIndex]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="text-center text-gray-500 text-sm">
                  Images / Videos
                </div>
              </div>
            </div>

            {/* Sports Available */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sports Available</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🏸</span>
                  </div>
                  <span className="text-sm text-gray-600">Badminton</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🏓</span>
                  </div>
                  <span className="text-sm text-gray-600">Table Tennis</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🏐</span>
                  </div>
                  <span className="text-sm text-gray-600">Box Cricket</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(venue.amenities || ['Parking', 'Restroom', 'Refreshment', 'WiFi', 'AC', 'Locker']).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About Venue */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Venue</h3>
              <p className="text-gray-600 leading-relaxed">
                {venue.description || 'For more than a decade we are Serving Players with our Outstanding Service within the area of Ahemdabad Badminton Players and serve better'}
              </p>
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Map</h3>
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>Interactive map would be displayed here</p>
                </div>
              </div>
            </div>

            {/* Player Reviews & Ratings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Player Reviews & Ratings</h3>
              
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{review.user}</h4>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Load more reviews
                </button>
              </div>
            </div>

            {/* Loyalty Dashboard */}
            <LoyaltyDashboard venueId={venue._id} venueName={venue.name} />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              {/* Book This Venue Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-6"
              >
                Book This Venue
              </button>

              {/* Operating Hours */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Operating Hours
                </h4>
                <div className="text-gray-600">
                  {venue.operatingHours ? (
                    <span>{venue.operatingHours.open} - {venue.operatingHours.close}</span>
                  ) : (
                    <span>7:00AM - 11:00PM</span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  Address
                </h4>
                <p className="text-gray-600 text-sm">
                  {venue.address || `${venue.location}, Satellite, RadhePur Village, Ahmedabad, Gujarat`}
                </p>
              </div>

              {/* Contact */}
              {(venue.contactInfo?.phone || venue.contactInfo?.email) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                  <div className="space-y-2">
                    {venue.contactInfo?.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <PhoneIcon className="w-4 h-4" />
                        <span className="text-sm">{venue.contactInfo.phone}</span>
                      </div>
                    )}
                    {venue.contactInfo?.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span className="text-sm">{venue.contactInfo.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Book {venue.name}</h3>
                  <p className="text-gray-600 mt-1">Fill in your booking details</p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setAvailabilityChecked(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => {
                        setBookingData(prev => ({ ...prev, date: e.target.value }));
                        setAvailabilityChecked(false);
                      }}
                      min={new Date().toISOString().slice(0, 10)}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={bookingData.startTime}
                      onChange={(e) => {
                        setBookingData(prev => ({ ...prev, startTime: e.target.value }));
                        setAvailabilityChecked(false);
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={bookingData.endTime}
                      onChange={(e) => {
                        setBookingData(prev => ({ ...prev, endTime: e.target.value }));
                        setAvailabilityChecked(false);
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Court Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookingData.courtName}
                    onChange={(e) => setBookingData(prev => ({ ...prev, courtName: e.target.value }))}
                    placeholder="e.g., Court 1, Main Court"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requirements..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Discount Card Selection */}
                {availableCards.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎁 Apply Discount Card (Optional)
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="no-discount"
                          name="discount"
                          checked={!selectedCard}
                          onChange={() => setSelectedCard(null)}
                          className="mr-2"
                        />
                        <label htmlFor="no-discount" className="text-sm text-gray-600">No discount</label>
                      </div>
                      
                      {availableCards.map((card) => (
                        <div key={card.cardId} className="flex items-center">
                          <input
                            type="radio"
                            id={card.cardId}
                            name="discount"
                            checked={selectedCard?.cardId === card.cardId}
                            onChange={() => setSelectedCard(card)}
                            className="mr-2"
                          />
                          <label htmlFor={card.cardId} className={`flex-1 p-3 rounded-lg border cursor-pointer ${
                            selectedCard?.cardId === card.cardId 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <GiftIcon className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-gray-900">
                                  {card.discountPercentage}% OFF
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                Expires: {new Date(card.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Status */}
                {availabilityChecked && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-medium">Time slot is available!</span>
                    </div>
                  </div>
                )}

                {/* Price Calculation */}
                {(venue.pricing?.hourlyRate || venue.pricePerHour) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Duration:</span>
                        <span className="text-blue-800 font-medium">{calculateDuration()} hour(s)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Rate:</span>
                        <span className="text-blue-800">₹{venue.pricing?.hourlyRate || venue.pricePerHour}/hour</span>
                      </div>
                      
                      {(() => {
                        const priceInfo = calculateTotalPrice();
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">Subtotal:</span>
                              <span className="text-blue-800">₹{priceInfo.original}</span>
                            </div>
                            
                            {selectedCard && (
                              <div className="flex justify-between text-sm text-green-700">
                                <span>Discount ({priceInfo.percentage}%):</span>
                                <span>-₹{priceInfo.discount}</span>
                              </div>
                            )}
                            
                            <div className="border-t border-blue-200 pt-2 flex justify-between">
                              <span className="text-blue-700 font-medium">Total:</span>
                              <div className="text-right">
                                {selectedCard && (
                                  <div className="text-sm text-gray-500 line-through">₹{priceInfo.original}</div>
                                )}
                                <span className={`text-lg font-bold ${selectedCard ? 'text-green-600' : 'text-blue-800'}`}>
                                  ₹{priceInfo.final}
                                </span>
                              </div>
                            </div>
                            
                            {selectedCard && (
                              <div className="text-center text-sm text-green-600 font-medium">
                                🎉 You save ₹{priceInfo.discount}!
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setAvailabilityChecked(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  {!availabilityChecked ? (
                    <button
                      type="button"
                      onClick={checkAvailability}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Book Now
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isBooking}
                      className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                        isBooking ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueDetails;
