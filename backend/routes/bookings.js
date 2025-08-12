const express = require('express');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const PlayerLoyalty = require('../models/PlayerLoyalty');

const router = express.Router();

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /api/bookings/admin/all -> get all bookings (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('venue', 'name location sport pricing operatingHours images')
      .populate('user', 'username email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (e) {
    console.error('Get all bookings error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/bookings/admin/:id -> delete booking (admin only)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (e) {
    console.error('Delete booking error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/my -> get current user's bookings
router.get('/my', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = { user: req.userId };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('venue', 'name location sport pricing operatingHours')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (e) {
    console.error('Get user bookings error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/venue/:venueId -> get all bookings for a venue (for facility managers)
router.get('/venue/:venueId', auth, async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Check if user is admin, venue owner, or manager
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && 
        venue.owner.toString() !== req.userId && 
        venue.manager?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, date, page = 1, limit = 50 } = req.query;
    
    let query = { venue: req.params.venueId };
    if (status) query.status = status;
    if (date) query.date = date;

    const bookings = await Booking.find(query)
      .populate('user', 'username email phone')
      .sort({ date: -1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      venue: {
        name: venue.name,
        location: venue.location
      }
    });
  } catch (e) {
    console.error('Get venue bookings error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/availability/:venueId -> check slot availability
router.get('/availability/:venueId', async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, startTime, and endTime are required' });
    }

    const overlapping = await Booking.findOne({
      venue: req.params.venueId,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ],
      status: 'booked',
    });

    res.json({
      available: !overlapping,
      conflictingBooking: overlapping ? {
        startTime: overlapping.startTime,
        endTime: overlapping.endTime,
        user: overlapping.user
      } : null
    });
  } catch (e) {
    console.error('Check availability error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bookings -> create booking if slot free
router.post('/', auth, async (req, res) => {
  try {
    const { venueId, date, startTime, endTime, courtName, notes, discountCardId } = req.body;
    
    if (!venueId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if venue exists and is active
    const venue = await Venue.findById(venueId);
    if (!venue || !venue.isActive) {
      return res.status(404).json({ message: 'Venue not found or inactive' });
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      venue: venueId,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ],
      status: 'booked',
    });

    if (overlapping) {
      return res.status(409).json({ 
        message: 'Slot unavailable',
        conflictingBooking: {
          startTime: overlapping.startTime,
          endTime: overlapping.endTime
        }
      });
    }

    // Calculate total amount based on venue pricing
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const duration = endHour - startHour;
    let totalAmount = (venue.pricing?.hourlyRate || venue.pricePerHour || 0) * duration;
    
    let discountInfo = null;
    
    // Apply discount card if provided
    if (discountCardId) {
      const loyalty = await PlayerLoyalty.findOne({
        player: req.userId,
        'discountCards.cardId': discountCardId
      });

      if (loyalty) {
        const card = loyalty.discountCards.find(c => c.cardId === discountCardId);
        
        if (card && card.isScratched && !card.isUsed && new Date() < card.expiryDate) {
          // Make sure this card is for the same venue
          if (loyalty.venue.toString() === venueId) {
            const discountAmount = (totalAmount * card.discountPercentage) / 100;
            const originalAmount = totalAmount;
            totalAmount = totalAmount - discountAmount;
            
            // Mark card as used
            card.isUsed = true;
            card.usedDate = new Date();
            await loyalty.save();
            
            discountInfo = {
              cardId: discountCardId,
              discountPercentage: card.discountPercentage,
              originalAmount: originalAmount,
              discountAmount: discountAmount,
              finalAmount: totalAmount
            };
          } else {
            return res.status(400).json({ message: 'Discount card is not valid for this venue' });
          }
        } else {
          return res.status(400).json({ message: 'Invalid or expired discount card' });
        }
      } else {
        return res.status(404).json({ message: 'Discount card not found' });
      }
    }

    const booking = new Booking({ 
      venue: venueId, 
      user: req.userId, 
      date, 
      startTime, 
      endTime,
      courtName,
      notes,
      totalAmount
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('venue', 'name location sport pricing')
      .populate('user', 'username email');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
      discountApplied: discountInfo
    });
  } catch (e) {
    console.error('Create booking error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bookings/:id/cancel -> cancel a booking (user's own booking)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.userId })
      .populate('venue', 'name location');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ 
      message: 'Booking cancelled successfully', 
      booking 
    });
  } catch (e) {
    console.error('Cancel booking error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bookings/:id/complete -> mark booking as completed (facility manager only)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is facility manager/owner/admin
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && 
        booking.venue.owner.toString() !== req.userId && 
        booking.venue.manager?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = 'completed';
    await booking.save();

    // Update player loyalty points
    try {
      let loyalty = await PlayerLoyalty.findOne({ 
        player: booking.user, 
        venue: booking.venue._id 
      });

      const currentCompletedBookings = await Booking.countDocuments({
        user: booking.user,
        venue: booking.venue._id,
        status: 'completed'
      });

      if (!loyalty) {
        loyalty = new PlayerLoyalty({
          player: booking.user,
          venue: booking.venue._id,
          bookingCount: currentCompletedBookings,
          totalBookings: currentCompletedBookings,
          lastBookingDate: new Date()
        });
      } else {
        loyalty.bookingCount = currentCompletedBookings;
        loyalty.totalBookings = Math.max(loyalty.totalBookings, currentCompletedBookings);
        loyalty.lastBookingDate = new Date();
      }

      // Check if player earned a new discount card (every 5th booking)
      let newCard = null;
      const shouldHaveCards = Math.floor(currentCompletedBookings / 5);
      const existingCards = loyalty.discountCards.length;
      
      console.log(`Manual completion: ${currentCompletedBookings} bookings, should have ${shouldHaveCards} cards, has ${existingCards} cards`);
      
      if (shouldHaveCards > existingCards) {
        // Generate the missing card for the latest milestone
        const milestoneBookingCount = shouldHaveCards * 5;
        loyalty.bookingCount = milestoneBookingCount; // Temporarily set for card generation
        newCard = loyalty.generateDiscountCard();
        loyalty.bookingCount = currentCompletedBookings; // Reset to actual count
        
        if (newCard) {
          console.log(`Manual completion: Generated ${newCard.discountPercentage}% discount card for reaching ${milestoneBookingCount} bookings`);
        }
      }

      await loyalty.save();

      res.json({ 
        message: 'Booking marked as completed', 
        booking,
        loyaltyUpdate: {
          newBookingCount: currentCompletedBookings,
          hasNewCard: !!newCard,
          newCard: newCard,
          progressToNext: currentCompletedBookings % 5 === 0 ? 5 : 5 - (currentCompletedBookings % 5)
        }
      });
    } catch (loyaltyError) {
      console.error('Loyalty update error:', loyaltyError);
      // Still return success for booking completion even if loyalty fails
      res.json({ 
        message: 'Booking marked as completed', 
        booking,
        loyaltyError: 'Failed to update loyalty points'
      });
    }
  } catch (e) {
    console.error('Complete booking error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/stats -> get booking statistics (admin/manager only)
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    let matchStage = {};
    
    // If admin, show all bookings; otherwise show only user's venue bookings
    if (user.role === 'admin') {
      matchStage = {}; // Admins see all bookings
    } else {
      // For regular users and facility managers, only show stats for their venues
      const venues = await Venue.find({
        $or: [{ owner: req.userId }, { manager: req.userId }]
      }).select('_id');
      
      if (venues.length === 0) {
        return res.json({
          stats: [],
          totalBookings: 0,
          todayBookings: 0
        });
      }
      
      matchStage.venue = { $in: venues.map(v => v._id) };
    }

    const stats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments(matchStage);
    const today = new Date().toISOString().slice(0, 10);
    const todayBookings = await Booking.countDocuments({ 
      ...matchStage, 
      date: today 
    });

    res.json({
      stats,
      totalBookings,
      todayBookings
    });
  } catch (e) {
    console.error('Get booking stats error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bookings/admin/auto-complete -> manually trigger auto-completion (admin only)
router.post('/admin/auto-complete', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    // Find bookings that should be completed (past their end time)
    const bookingsToComplete = await Booking.find({
      status: 'booked',
      $or: [
        { date: { $lt: today } }, // Past dates
        { 
          date: today,
          endTime: { $lt: currentTime } // Today but past end time
        }
      ]
    }).populate('venue').populate('user', 'username email');

    let completedCount = 0;
    let rewardsEarned = 0;

    for (const booking of bookingsToComplete) {
      booking.status = 'completed';
      await booking.save();
      completedCount++;

      // Update player loyalty points
      try {
        let loyalty = await PlayerLoyalty.findOne({ 
          player: booking.user._id, 
          venue: booking.venue._id 
        });

        if (!loyalty) {
          loyalty = new PlayerLoyalty({
            player: booking.user._id,
            venue: booking.venue._id,
            bookingCount: 1,
            totalBookings: 1,
            lastBookingDate: new Date()
          });
        } else {
          loyalty.bookingCount += 1;
          loyalty.totalBookings += 1;
          loyalty.lastBookingDate = new Date();
        }

        // Check if player earned a new discount card (every 5th booking)
        let cardGenerated = false;
        const currentBookingCount = loyalty.bookingCount;
        console.log(`Auto-completion: Checking loyalty for user ${booking.user.username}: ${currentBookingCount} bookings at venue ${booking.venue.name}`);
        
        if (loyalty.checkDiscountEligibility()) {
          console.log(`Auto-completion: User ${booking.user.username} qualifies for discount card at ${currentBookingCount} bookings`);
          const newCard = loyalty.generateDiscountCard();
          if (newCard) {
            console.log(`Auto-completion: Generated discount card: ${newCard.discountPercentage}% off`);
            rewardsEarned++;
            cardGenerated = true;
          }
        }

        await loyalty.save();
        
        if (cardGenerated) {
          console.log(`Auto-completion: Loyalty updated successfully for user ${booking.user.username}`);
        }
      } catch (loyaltyError) {
        console.error('Auto-completion loyalty update error:', loyaltyError);
      }
    }

    res.json({
      message: `Auto-completion completed successfully`,
      completedBookings: completedCount,
      rewardsEarned: rewardsEarned,
      details: bookingsToComplete.map(b => ({
        bookingId: b._id,
        user: b.user.username,
        venue: b.venue.name,
        date: b.date,
        time: `${b.startTime}-${b.endTime}`
      }))
    });
  } catch (e) {
    console.error('Manual auto-complete error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// TEST ENDPOINT: Simulate bookings and completion for testing
router.post('/test-simulate/:venueId', auth, async (req, res) => {
  try {
    const { venueId } = req.params;
    const { count = 5 } = req.body;
    const userId = req.userId;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    let simulatedBookings = [];
    let rewardsEarned = [];

    for (let i = 1; i <= count; i++) {
      // Create a completed booking
      const booking = new Booking({
        venue: venueId,
        user: userId,
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        status: 'completed',
        totalAmount: venue.pricePerHour || 500,
        courtName: `Test Court ${i}`
      });

      await booking.save();
      simulatedBookings.push(booking);

      console.log(`Simulated booking ${i} for venue ${venue.name}`);
    }

    // Now update loyalty based on total completed bookings
    const currentCompletedBookings = await Booking.countDocuments({
      user: userId,
      venue: venueId,
      status: 'completed'
    });

    let loyalty = await PlayerLoyalty.findOne({ 
      player: userId, 
      venue: venueId 
    });

    if (!loyalty) {
      loyalty = new PlayerLoyalty({
        player: userId,
        venue: venueId,
        bookingCount: currentCompletedBookings,
        totalBookings: currentCompletedBookings,
        lastBookingDate: new Date()
      });
    } else {
      loyalty.bookingCount = currentCompletedBookings;
      loyalty.totalBookings = Math.max(loyalty.totalBookings, currentCompletedBookings);
      loyalty.lastBookingDate = new Date();
    }

    // Generate missing cards
    const shouldHaveCards = Math.floor(currentCompletedBookings / 5);
    const existingCards = loyalty.discountCards.length;
    
    console.log(`Loyalty check: ${currentCompletedBookings} bookings, should have ${shouldHaveCards} cards, has ${existingCards} cards`);
    
    for (let cardIndex = existingCards; cardIndex < shouldHaveCards; cardIndex++) {
      const milestoneBookingCount = (cardIndex + 1) * 5;
      loyalty.bookingCount = milestoneBookingCount;
      const newCard = loyalty.generateDiscountCard();
      
      if (newCard) {
        rewardsEarned.push({
          cardNumber: cardIndex + 1,
          milestone: milestoneBookingCount,
          discount: newCard.discountPercentage
        });
        console.log(`Generated card ${cardIndex + 1}: ${newCard.discountPercentage}% off for ${milestoneBookingCount} bookings`);
      }
    }

    loyalty.bookingCount = currentCompletedBookings; // Reset to actual count
    await loyalty.save();

    res.json({
      message: `Simulated ${count} bookings and updated loyalty`,
      simulatedBookings: simulatedBookings.length,
      totalCompletedBookings: currentCompletedBookings,
      rewardsEarned,
      loyaltyInfo: {
        bookingCount: loyalty.bookingCount,
        totalCards: loyalty.discountCards.length,
        availableCards: loyalty.getAvailableCards().length
      }
    });

  } catch (error) {
    console.error('Error simulating bookings:', error);
    res.status(500).json({ message: 'Failed to simulate bookings' });
  }
});

// Auto-complete bookings that have passed their end time
const autoCompleteBookings = async () => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    // Find bookings that should be completed (past their end time)
    const bookingsToComplete = await Booking.find({
      status: 'booked',
      $or: [
        { date: { $lt: today } }, // Past dates
        { 
          date: today,
          endTime: { $lt: currentTime } // Today but past end time
        }
      ]
    }).populate('venue');

    for (const booking of bookingsToComplete) {
      booking.status = 'completed';
      await booking.save();

      // Update player loyalty points
      try {
        let loyalty = await PlayerLoyalty.findOne({ 
          player: booking.user, 
          venue: booking.venue._id 
        });

        if (!loyalty) {
          loyalty = new PlayerLoyalty({
            player: booking.user,
            venue: booking.venue._id,
            bookingCount: 1,
            totalBookings: 1,
            lastBookingDate: new Date()
          });
        } else {
          loyalty.bookingCount += 1;
          loyalty.totalBookings += 1;
          loyalty.lastBookingDate = new Date();
        }

        // Check if player earned a new discount card (every 5th booking)
        const currentBookingCount = loyalty.bookingCount;
        if (loyalty.checkDiscountEligibility()) {
          const newCard = loyalty.generateDiscountCard();
          if (newCard) {
            console.log(`Background auto-completion: Generated ${newCard.discountPercentage}% discount card for user ${booking.user} at ${currentBookingCount} bookings`);
          }
        }

        await loyalty.save();
        console.log(`Background auto-completion: Updated loyalty for user ${booking.user} - ${currentBookingCount} bookings`);
      } catch (loyaltyError) {
        console.error('Background loyalty update error for auto-completed booking:', loyaltyError);
      }
    }

    if (bookingsToComplete.length > 0) {
      console.log(`Auto-completed ${bookingsToComplete.length} bookings`);
    }
  } catch (error) {
    console.error('Auto-complete bookings error:', error);
  }
};

// Run auto-completion every 30 minutes
setInterval(autoCompleteBookings, 30 * 60 * 1000);

// Run once immediately when server starts
setTimeout(autoCompleteBookings, 5000);


