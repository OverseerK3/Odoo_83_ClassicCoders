const express = require('express');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Invite = require('../models/Invite');
const User = require('../models/User');

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

// GET /api/bookings/my -> get current user's bookings
router.get('/my', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = { user: req.userId };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('venue', 'name location sport')
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

// POST /api/bookings -> create booking if slot free
router.post('/', auth, async (req, res) => {
  try {
    const { venueId, date, startTime, endTime } = req.body;
    if (!venueId || !date || !startTime || !endTime) return res.status(400).json({ message: 'Missing fields' });
    const overlapping = await Booking.findOne({
      venue: venueId,
      date,
      startTime,
      endTime,
      status: 'booked',
    });
    if (overlapping) return res.status(409).json({ message: 'Slot unavailable' });
    const booking = new Booking({ venue: venueId, user: req.userId, date, startTime, endTime });
    await booking.save();
    res.status(201).json(booking);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bookings/:id/cancel -> cancel a booking (user's own booking)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify waitlisted users (implement later if needed)
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (e) {
    console.error('Cancel booking error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bookings/waitlist -> add user to waitlist (by creating a pending interest via Invite-like record)
// For simplicity, we will reuse Invite collection with a special status 'waitlist:venueId@date@start-end'
router.post('/waitlist', auth, async (req, res) => {
  try {
    const { venueId, date, startTime, endTime } = req.body;
    if (!venueId || !date || !startTime || !endTime) return res.status(400).json({ message: 'Missing fields' });
    const key = `waitlist:${venueId}:${date}:${startTime}-${endTime}`;
    // Prevent duplicates
    const existing = await Invite.findOne({ from: req.userId, to: req.userId, status: key });
    if (existing) return res.status(200).json(existing);
    const wl = new Invite({ from: req.userId, to: req.userId, status: key });
    await wl.save();
    res.status(201).json(wl);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bookings/:id/cancel -> cancel booking and notify waitlisted users (smart cancellation)
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.userId) return res.status(403).json({ message: 'Not your booking' });
    booking.status = 'cancelled';
    await booking.save();

    // Find waitlisted users for the same slot
    const key = `waitlist:${booking.venue}:${booking.date}:${booking.startTime}-${booking.endTime}`;
    const waitlisted = await Invite.find({ status: key });

    // Turn them into notifications (simple: send list of users; client can poll /bookings/available)
    const users = await User.find({ _id: { $in: waitlisted.map(w => w.from) } }).select('username email');

    res.json({ message: 'Booking cancelled, waitlisted users notified', available: true, notifiedUsers: users });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


