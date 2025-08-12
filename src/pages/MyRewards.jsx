import React, { useState, useEffect } from 'react';
import ScratchCard from '../components/ScratchCard';
import { 
  TrophyIcon, 
  GiftIcon, 
  SparklesIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { ToastProvider, useToast } from '../components/ToastProvider';

const MyRewards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unscratched');
  const [scratchingCard, setScratchingCard] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPlayerCards();
  }, []);

  const fetchPlayerCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/loyalty/cards', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards);
      }
    } catch (error) {
      console.error('Error fetching player cards:', error);
      showToast('Failed to load your rewards', 'error');
    } finally {
      setLoading(false);
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
        setCards(prev => prev.map(c => 
          c.cardId === card.cardId 
            ? { ...c, isScratched: true, discountPercentage: data.revealedDiscount }
            : c
        ));
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

  const unscatchedCards = cards.filter(card => !card.isScratched);
  const scratchedCards = cards.filter(card => card.isScratched && !card.isUsed);
  const expiredCards = cards.filter(card => new Date() > new Date(card.expiryDate));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <TrophyIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Rewards</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your discount cards earned from loyal bookings across all venues
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('unscratched')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'unscratched'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GiftIcon className="w-4 h-4" />
                <span>Scratch Cards ({unscatchedCards.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ready')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ready'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4" />
                <span>Ready to Use ({scratchedCards.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'expired'
                  ? 'bg-white text-gray-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>Expired ({expiredCards.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'unscratched' && (
          <div className="space-y-6">
            {unscatchedCards.length > 0 ? (
              <>
                <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎉 You have {unscatchedCards.length} cards to scratch!
                  </h3>
                  <p className="text-gray-600">
                    Scratch to reveal your discount percentage. Each card contains 35%, 45%, or 55% off!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unscatchedCards.map((card) => (
                    <div key={card.cardId} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center space-x-2 mb-4">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <h4 className="font-medium text-gray-900">{card.venue.name}</h4>
                      </div>
                      
                      <div className="relative">
                        <ScratchCard
                          card={card}
                          onScratch={handleScratchCard}
                          size="normal"
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

                      <div className="mt-4 text-sm text-gray-500 text-center">
                        Earned: {new Date(card.earnedDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Cards to Scratch</h3>
                <p className="text-gray-600">
                  Complete 5 bookings at any venue to earn your first discount card!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ready' && (
          <div className="space-y-6">
            {scratchedCards.length > 0 ? (
              <>
                <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    ✨ Ready to Save Money!
                  </h3>
                  <p className="text-green-700">
                    These discounts can be applied to your next bookings at their respective venues.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scratchedCards.map((card) => (
                    <div key={card.cardId} className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-5 h-5 text-gray-400" />
                          <h4 className="font-medium text-gray-900">{card.venue.name}</h4>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Ready
                        </div>
                      </div>
                      
                      <div className={`rounded-xl p-6 text-white bg-gradient-to-br ${
                        card.discountPercentage >= 55 ? 'from-purple-500 to-pink-500' :
                        card.discountPercentage >= 45 ? 'from-blue-500 to-indigo-500' :
                        'from-green-500 to-emerald-500'
                      }`}>
                        <div className="text-center">
                          <TrophyIcon className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
                          <div className="text-3xl font-bold mb-1">
                            {card.discountPercentage}% OFF
                          </div>
                          <div className="text-sm opacity-90">
                            Your Next Booking
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div>Scratched: {new Date(card.scratchedDate).toLocaleDateString()}</div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>Expires: {new Date(card.expiryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Ready Cards</h3>
                <p className="text-gray-600">
                  Scratch your cards to reveal discounts that are ready to use!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'expired' && (
          <div className="space-y-6">
            {expiredCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredCards.map((card) => (
                  <div key={card.cardId} className="bg-gray-50 rounded-xl p-6 shadow-sm opacity-60">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <h4 className="font-medium text-gray-700">{card.venue.name}</h4>
                      </div>
                      <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Expired
                      </div>
                    </div>
                    
                    <div className="bg-gray-400 rounded-xl p-6 text-white">
                      <div className="text-center">
                        <ClockIcon className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                        <div className="text-2xl font-bold mb-1">
                          {card.discountPercentage}% OFF
                        </div>
                        <div className="text-sm opacity-75">
                          Expired Card
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500 text-center">
                      Expired: {new Date(card.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Expired Cards</h3>
                <p className="text-gray-600">
                  Your discount cards are all fresh and ready to use!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper with ToastProvider
const MyRewardsWithToast = () => {
  return (
    <ToastProvider>
      <MyRewards />
    </ToastProvider>
  );
};

export default MyRewardsWithToast;
