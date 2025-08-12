const express = require('express');
const jwt = require('jsonwebtoken');
const Venue = require('../models/Venue');
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const User = require('../models/User');

const router = express.Router();

// Auth middleware
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

// Facility manager middleware
function facilityManagerAuth(req, res, next) {
  // This would check if user is facility_manager or admin
  const user = req.user;
  if (!user || !['facility_manager', 'admin'].includes(user.role)) {
    return res.status(403).json({ message: 'Access denied. Facility manager required.' });
  }
  next();
}

// Dashboard Analytics
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    // Get user's venues (venues they own or manage)
    const venues = await Venue.find({
      $or: [
        { owner: req.userId },
        { manager: req.userId }
      ]
    });
    const venueIds = venues.map(v => v._id);

    if (venueIds.length === 0) {
      return res.json({
        totalBookings: 0,
        activeCourts: 0,
        totalEarnings: 0,
        activeVenues: 0,
        upcomingBookings: []
      });
    }

    // Total bookings for all user's venues
    const totalBookings = await Booking.countDocuments({ 
      venue: { $in: venueIds },
      status: { $ne: 'cancelled' }
    });

    // Active courts
    const activeCourts = await Court.countDocuments({ 
      venue: { $in: venueIds },
      isActive: true 
    });

    // Calculate earnings (simulated)
    const bookings = await Booking.find({ 
      venue: { $in: venueIds },
      status: 'completed'
    });
    const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    // Recent bookings for calendar
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingBookings = await Booking.find({
      venue: { $in: venueIds },
      date: { 
        $gte: today.toISOString().slice(0, 10),
        $lte: nextWeek.toISOString().slice(0, 10)
      },
      status: 'booked'
    }).populate('user', 'username email').populate('venue', 'name');

    res.json({
      totalBookings,
      activeCourts,
      totalEarnings,
      activeVenues: venues.length,
      upcomingBookings
    });
  } catch (e) {
    console.error('Dashboard stats error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Booking trends for charts
router.get('/dashboard/trends', auth, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const venues = await Venue.find({
      $or: [
        { owner: req.userId },
        { manager: req.userId }
      ]
    });
    const venueIds = venues.map(v => v._id);

    let dateRange;
    if (period === 'daily') {
      dateRange = 7; // Last 7 days
    } else if (period === 'weekly') {
      dateRange = 28; // Last 4 weeks
    } else {
      dateRange = 90; // Last 3 months
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const bookings = await Booking.aggregate([
      {
        $match: {
          venue: { $in: venueIds },
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%U',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          earnings: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(bookings);
  } catch (e) {
    console.error('Trends error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Peak hours analysis
router.get('/dashboard/peak-hours', auth, async (req, res) => {
  try {
    const venues = await Venue.find({
      $or: [
        { owner: req.userId },
        { manager: req.userId }
      ]
    });
    const venueIds = venues.map(v => v._id);

    const peakHours = await Booking.aggregate([
      {
        $match: {
          venue: { $in: venueIds },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$startTime',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(peakHours);
  } catch (e) {
    console.error('Peak hours error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owner's venues
router.get('/venues', auth, async (req, res) => {
  try {
    const venues = await Venue.find({ owner: req.userId });
    res.json(venues);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new venue
router.post('/venues', auth, async (req, res) => {
  try {
    const venueData = {
      ...req.body,
      owner: req.userId
    };
    const venue = new Venue(venueData);
    await venue.save();
    res.status(201).json(venue);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update venue
router.put('/venues/:id', auth, async (req, res) => {
  try {
    const venue = await Venue.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json(venue);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete venue
router.delete('/venues/:id', auth, async (req, res) => {
  try {
    const venue = await Venue.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.json({ message: 'Venue deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Court Management Routes
router.get('/venues/:venueId/courts', auth, async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.venueId, owner: req.userId });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    const courts = await Court.find({ venue: req.params.venueId });
    res.json(courts);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create court
router.post('/venues/:venueId/courts', auth, async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.venueId, owner: req.userId });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    const court = new Court({
      ...req.body,
      venue: req.params.venueId
    });
    await court.save();
    res.status(201).json(court);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update court
router.put('/courts/:id', auth, async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('venue');
    if (!court || court.venue.owner.toString() !== req.userId) {
      return res.status(404).json({ message: 'Court not found' });
    }

    Object.assign(court, req.body);
    await court.save();
    res.json(court);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete court
router.delete('/courts/:id', auth, async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('venue');
    if (!court || court.venue.owner.toString() !== req.userId) {
      return res.status(404).json({ message: 'Court not found' });
    }

    await Court.findByIdAndDelete(req.params.id);
    res.json({ message: 'Court deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Booking Overview
router.get('/bookings', auth, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const venues = await Venue.find({
      $or: [
        { owner: req.userId },
        { manager: req.userId }
      ]
    });
    const venueIds = venues.map(v => v._id);

    let query = { venue: { $in: venueIds } };
    if (status) query.status = status;
    if (date) query.date = date;

    const bookings = await Booking.find(query)
      .populate('user', 'username email')
      .populate('venue', 'name location')
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Time slot management
router.post('/time-slots/block', auth, async (req, res) => {
  try {
    const { courtId, date, startTime, endTime, reason } = req.body;
    
    const court = await Court.findById(courtId).populate('venue');
    if (!court || court.venue.owner.toString() !== req.userId) {
      return res.status(404).json({ message: 'Court not found' });
    }

    const timeSlot = new TimeSlot({
      court: courtId,
      date,
      startTime,
      endTime,
      isBlocked: true,
      blockReason: reason,
      isAvailable: false
    });

    await timeSlot.save();
    res.status(201).json(timeSlot);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blocked time slots
router.get('/courts/:courtId/blocked-slots', auth, async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId).populate('venue');
    if (!court || court.venue.owner.toString() !== req.userId) {
      return res.status(404).json({ message: 'Court not found' });
    }

    const blockedSlots = await TimeSlot.find({
      court: req.params.courtId,
      isBlocked: true
    });

    res.json(blockedSlots);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
