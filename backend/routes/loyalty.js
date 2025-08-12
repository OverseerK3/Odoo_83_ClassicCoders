const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const PlayerLoyalty = require('../models/PlayerLoyalty');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Venue = require('../models/Venue');

// Authentication middleware
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Apply auth to all routes
router.use(auth);

// Get player's loyalty status for a specific venue
router.get('/status/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    const userId = req.user.id;

    // Get completed bookings count directly from database
    const completedBookings = await Booking.countDocuments({
      user: userId,
      venue: venueId,
      status: 'completed'
    });

    let loyalty = await PlayerLoyalty.findOne({ 
      player: userId, 
      venue: venueId 
    }).populate('venue', 'name');

    if (!loyalty) {
      // Create new loyalty record
      loyalty = new PlayerLoyalty({
        player: userId,
        venue: venueId,
        bookingCount: completedBookings,
        totalBookings: completedBookings
      });
    } else {
      // Update booking count
      loyalty.bookingCount = completedBookings;
      loyalty.totalBookings = Math.max(loyalty.totalBookings, completedBookings);
    }

    // Generate missing cards based on completed bookings
    const expectedCards = Math.floor(completedBookings / 5);
    const existingCards = loyalty.discountCards.length;
    let newCardsGenerated = 0;

    console.log(`Loyalty check: ${completedBookings} bookings, ${existingCards} existing cards, ${expectedCards} expected cards`);

    if (expectedCards > existingCards) {
      console.log(`Generating ${expectedCards - existingCards} missing reward cards`);
      
      for (let i = existingCards; i < expectedCards; i++) {
        const cardBookingCount = (i + 1) * 5; // 5, 10, 15, etc.
        loyalty.bookingCount = cardBookingCount; // Temporarily set for card generation
        
        const newCard = loyalty.generateDiscountCard();
        if (newCard) {
          newCardsGenerated++;
          console.log(`Generated card ${i + 1} for ${cardBookingCount} bookings: ${newCard.discountPercentage}% off`);
        }
      }
      
      loyalty.bookingCount = completedBookings; // Reset to actual count
    }

    await loyalty.save();

    const availableCards = loyalty.getAvailableCards();
    const scratchedCards = loyalty.getScratchedCards();
    const progressToNext = completedBookings % 5 === 0 ? 5 : 5 - (completedBookings % 5);
    const nextMilestone = Math.ceil(completedBookings / 5) * 5;
    if (nextMilestone <= completedBookings) {
      nextMilestone = completedBookings + (5 - (completedBookings % 5));
    }

    res.json({
      loyalty,
      availableCards,
      scratchedCards,
      hasNewCard: newCardsGenerated > 0,
      progressToNext: progressToNext === 5 ? 0 : progressToNext,
      nextMilestone,
      completedBookings,
      newCardsGenerated,
      debug: {
        completedBookings,
        loyaltyBookingCount: loyalty.bookingCount,
        expectedCards,
        existingCards: loyalty.discountCards.length,
        availableCards: availableCards.length,
        scratchedCards: scratchedCards.length
      }
    });

  } catch (error) {
    console.error('Error getting loyalty status:', error);
    res.status(500).json({ message: 'Failed to get loyalty status' });
  }
});

// Scratch a discount card
router.post('/scratch/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;

    const loyalty = await PlayerLoyalty.findOne({
      player: userId,
      'discountCards.cardId': cardId
    });

    if (!loyalty) {
      return res.status(404).json({ message: 'Discount card not found' });
    }

    const card = loyalty.discountCards.find(c => c.cardId === cardId);
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.isScratched) {
      return res.status(400).json({ message: 'Card already scratched' });
    }

    if (card.isUsed) {
      return res.status(400).json({ message: 'Card already used' });
    }

    if (new Date() > card.expiryDate) {
      return res.status(400).json({ message: 'Card has expired' });
    }

    // Scratch the card
    card.isScratched = true;
    card.scratchedDate = new Date();

    await loyalty.save();

    res.json({
      message: 'Card scratched successfully!',
      revealedDiscount: card.discountPercentage,
      card
    });

  } catch (error) {
    console.error('Error scratching card:', error);
    res.status(500).json({ message: 'Failed to scratch card' });
  }
});

// Apply discount card to a booking
router.post('/apply-discount', async (req, res) => {
  try {
    const { cardId, bookingData } = req.body;
    const userId = req.user.id;

    const loyalty = await PlayerLoyalty.findOne({
      player: userId,
      'discountCards.cardId': cardId
    });

    if (!loyalty) {
      return res.status(404).json({ message: 'Discount card not found' });
    }

    const card = loyalty.discountCards.find(c => c.cardId === cardId);
    
    if (!card || !card.isScratched || card.isUsed) {
      return res.status(400).json({ message: 'Invalid or already used card' });
    }

    if (new Date() > card.expiryDate) {
      return res.status(400).json({ message: 'Card has expired' });
    }

    // Calculate discounted amount
    const originalAmount = bookingData.totalAmount;
    const discountAmount = (originalAmount * card.discountPercentage) / 100;
    const finalAmount = originalAmount - discountAmount;

    // Mark card as used
    card.isUsed = true;
    card.usedDate = new Date();
    await loyalty.save();

    res.json({
      message: 'Discount applied successfully!',
      originalAmount,
      discountPercentage: card.discountPercentage,
      discountAmount,
      finalAmount,
      savings: discountAmount
    });

  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(500).json({ message: 'Failed to apply discount' });
  }
});

// Get all player's loyalty cards across venues
router.get('/cards', async (req, res) => {
  try {
    const userId = req.user.id;

    const loyalties = await PlayerLoyalty.find({ 
      player: userId 
    }).populate('venue', 'name images');

    const allCards = [];
    
    loyalties.forEach(loyalty => {
      loyalty.discountCards.forEach(card => {
        if (!card.isUsed && new Date() < card.expiryDate) {
          allCards.push({
            ...card.toObject(),
            venue: loyalty.venue,
            loyaltyId: loyalty._id
          });
        }
      });
    });

    // Sort by earned date (newest first)
    allCards.sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate));

    res.json({ cards: allCards });

  } catch (error) {
    console.error('Error getting player cards:', error);
    res.status(500).json({ message: 'Failed to get player cards' });
  }
});

// Update booking count after booking completion
router.post('/update-booking-count', async (req, res) => {
  try {
    const { venueId, bookingId } = req.body;
    const userId = req.user.id;

    // Verify the booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      venue: venueId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not completed' });
    }

    let loyalty = await PlayerLoyalty.findOne({ 
      player: userId, 
      venue: venueId 
    });

    if (!loyalty) {
      loyalty = new PlayerLoyalty({
        player: userId,
        venue: venueId,
        bookingCount: 1,
        totalBookings: 1,
        lastBookingDate: new Date()
      });
    } else {
      loyalty.bookingCount += 1;
      loyalty.totalBookings += 1;
      loyalty.lastBookingDate = new Date();
    }

    // Check if player earned a new discount card
    let newCard = null;
    if (loyalty.checkDiscountEligibility()) {
      newCard = loyalty.generateDiscountCard();
    }

    await loyalty.save();

    res.json({
      message: 'Booking count updated successfully',
      loyalty,
      newCard,
      hasNewCard: !!newCard
    });

  } catch (error) {
    console.error('Error updating booking count:', error);
    res.status(500).json({ message: 'Failed to update booking count' });
  }
});

// TEST ENDPOINT: Force generate rewards for testing (remove in production)
router.post('/test-reward/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    const userId = req.user.id;
    const { bookingCount } = req.body;

    let loyalty = await PlayerLoyalty.findOne({ 
      player: userId, 
      venue: venueId 
    });

    if (!loyalty) {
      loyalty = new PlayerLoyalty({
        player: userId,
        venue: venueId,
        bookingCount: 0,
        totalBookings: 0
      });
    }

    // Force set booking count for testing
    const testBookingCount = bookingCount || 5;
    loyalty.bookingCount = testBookingCount;
    loyalty.totalBookings = testBookingCount;
    loyalty.lastBookingDate = new Date();

    // Clear existing cards for clean test
    loyalty.discountCards = [];

    // Generate cards for the test booking count
    const expectedCards = Math.floor(testBookingCount / 5);
    let generatedCards = [];

    for (let i = 1; i <= expectedCards; i++) {
      loyalty.bookingCount = i * 5; // Set to milestone
      const newCard = loyalty.generateDiscountCard();
      if (newCard) {
        generatedCards.push(newCard);
      }
    }

    loyalty.bookingCount = testBookingCount; // Reset to test count
    await loyalty.save();

    res.json({
      message: `Test: Generated ${generatedCards.length} reward cards for ${testBookingCount} bookings`,
      loyalty,
      generatedCards,
      debug: {
        testBookingCount,
        expectedCards,
        actualCards: loyalty.discountCards.length,
        eligible: loyalty.checkDiscountEligibility()
      }
    });

  } catch (error) {
    console.error('Error generating test reward:', error);
    res.status(500).json({ message: 'Failed to generate test reward' });
  }
});

module.exports = router;
