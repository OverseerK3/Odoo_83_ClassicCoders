import React, { useState, useEffect } from 'react';
import ScratchCard from './ScratchCard';
import { 
  TrophyIcon, 
  GiftIcon, 
  SparklesIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { ToastProvider, useToast } from './ToastProvider';

const LoyaltyDashboard = ({ venueId, venueName }) => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scratchingCard, setScratchingCard] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (venueId) {
      fetchLoyaltyStatus();
    }
  }, [venueId]);

  const fetchLoyaltyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/loyalty/status/${venueId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyData(data);
        
        console.log('Loyalty Status Debug:', data.debug);
        
        if (data.hasNewCard) {
          showToast('🎉 Congratulations! You earned a new discount card!', 'success');
        }
      }
    } catch (error) {
      console.error('Error fetching loyalty status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test function to manually trigger reward generation
  const testRewardGeneration = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/loyalty/test-reward/${venueId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingCount: 5 })
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Test reward generated!', 'success');
        console.log('Test reward result:', data);
        fetchLoyaltyStatus(); // Refresh data
      }
    } catch (error) {
      console.error('Error generating test reward:', error);
    }
  };

  // Test function to simulate bookings
  const simulateBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/test-simulate/${venueId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count: 5 })
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`Simulated ${data.simulatedBookings} bookings! Check for new rewards.`, 'success');
        console.log('Simulation result:', data);
        setTimeout(() => fetchLoyaltyStatus(), 1000); // Refresh data after simulation
      }
    } catch (error) {
      console.error('Error simulating bookings:', error);
      showToast('Error simulating bookings', 'error');
    }
  };

  const handleScratchCard = async (card) => {
    try {
      setScratchingCard(card.cardId);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/loyalty/scratch/${card.cardId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`🎊 You revealed a ${data.revealedDiscount}% discount!`, 'success');
        
        // Update local state
        setLoyaltyData(prev => ({
          ...prev,
          availableCards: prev.availableCards.filter(c => c.cardId !== card.cardId),
          scratchedCards: [...prev.scratchedCards, { ...card, isScratched: true, discountPercentage: data.revealedDiscount }]
        }));
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to scratch card', 'error');
      }
    } catch (error) {
      console.error('Error scratching card:', error);
      showToast('Failed to scratch card', 'error');
    } finally {
      setScratchingCard(null);
    }
  };

  const getProgressColor = (current, total) => {
    const percentage = (current / total) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  const { loyalty, availableCards, scratchedCards, progressToNext, nextMilestone } = loyaltyData;
  const progressPercentage = ((loyalty.bookingCount % 5) / 5) * 100;

  return (
    <div className="space-y-6">
      {/* Loyalty Progress Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Loyalty Progress</h3>
              <p className="text-blue-100">at {venueName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{loyalty.bookingCount}</div>
            <div className="text-sm text-blue-100">Bookings</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progress to next reward</span>
            <span>{progressToNext} more bookings</span>
          </div>
          
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <FireIcon className="w-4 h-4 text-orange-300" />
              <span>Next card at {nextMilestone} bookings!</span>
            </div>
            
            {/* Test buttons - remove in production */}
            <div className="flex gap-2">
              <button
                onClick={simulateBookings}
                className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded"
                title="Simulate 5 Bookings"
              >
                🎮 Simulate
              </button>
              <button
                onClick={testRewardGeneration}
                className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded"
                title="Test Reward Generation"
              >
                🧪 Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Scratch Cards */}
      {availableCards.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <GiftIcon className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Scratch Your Rewards!</h3>
            <SparklesIcon className="w-5 h-5 text-yellow-500" />
          </div>
          
          <p className="text-gray-600 mb-6">
            You have {availableCards.length} discount card{availableCards.length > 1 ? 's' : ''} to scratch!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCards.map((card) => (
              <div key={card.cardId} className="relative">
                <ScratchCard
                  card={card}
                  onScratch={handleScratchCard}
                  className={scratchingCard === card.cardId ? 'opacity-75' : ''}
                />
                {scratchingCard === card.cardId && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                      Scratching...
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revealed Cards (Ready to Use) */}
      {scratchedCards.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrophyIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Ready to Use</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            These discount cards are ready to be applied to your next booking!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scratchedCards.map((card) => (
              <div key={card.cardId} className="relative">
                <div className={`rounded-xl p-4 text-white bg-gradient-to-br ${
                  card.discountPercentage >= 55 ? 'from-purple-500 to-pink-500' :
                  card.discountPercentage >= 45 ? 'from-blue-500 to-indigo-500' :
                  'from-green-500 to-emerald-500'
                }`}>
                  <div className="text-center">
                    <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                    <div className="text-2xl font-bold">
                      {card.discountPercentage}% OFF
                    </div>
                    <div className="text-sm opacity-90 mt-1">
                      Your Next Booking
                    </div>
                    <div className="flex items-center justify-center space-x-1 text-xs opacity-75 mt-2">
                      <ClockIcon className="w-3 h-3" />
                      <span>Expires: {new Date(card.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Ready!
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {availableCards.length === 0 && scratchedCards.length === 0 && loyalty.bookingCount < 5 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GiftIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Yet</h3>
          <p className="text-gray-600 mb-4">
            Complete {5 - loyalty.bookingCount} more booking{5 - loyalty.bookingCount > 1 ? 's' : ''} at this venue to earn your first discount card!
          </p>
          <div className="text-sm text-blue-600 font-medium">
            🎯 Every 5th booking = Discount Card!
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper with ToastProvider
const LoyaltyDashboardWithToast = (props) => {
  return (
    <ToastProvider>
      <LoyaltyDashboard {...props} />
    </ToastProvider>
  );
};

export default LoyaltyDashboardWithToast;
