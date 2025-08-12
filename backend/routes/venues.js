const express = require('express');
const jwt = require('jsonwebtoken');
const Venue = require('../models/Venue');
const User = require('../models/User');

const router = express.Router();

// Authentication middleware
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

// Admin/Manager check middleware
async function adminOrManager(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'facility_manager')) {
      return res.status(403).json({ message: 'Access denied. Admin or Facility Manager required.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get all venues with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      location, 
      sport, 
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    
    // Location filter
    if (location && location !== 'all') {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Sport filter  
    if (sport && sport !== 'all') {
      filter.sportsSupported = { $in: [new RegExp(sport, 'i')] };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { amenities: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter['pricing.hourlyRate'] = {};
      if (minPrice) filter['pricing.hourlyRate'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.hourlyRate'].$lte = Number(maxPrice);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const venues = await Venue.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'username email')
      .populate('manager', 'username email');

    const total = await Venue.countDocuments(filter);
    
    res.json({
      venues,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalVenues: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Get venues error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new venue (Any authenticated user can create venues)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      location,
      sport,
      description,
      capacity,
      amenities,
      sportsSupported,
      hourlyRate,
      operatingHours,
      contactInfo,
      image,
      images
    } = req.body;

    if (!name || !location || !sport) {
      return res.status(400).json({ message: 'Name, location, and sport are required' });
    }

    // Get user info to determine role
    const user = await User.findById(req.userId);

    const venue = new Venue({
      name,
      location,
      sport,
      description,
      capacity,
      amenities: amenities || [],
      sportsSupported: sportsSupported || [sport],
      owner: req.userId, // Set current user as owner
      manager: user.role === 'facility_manager' ? req.userId : undefined,
      pricing: {
        hourlyRate: hourlyRate || 0,
        currency: 'INR'
      },
      operatingHours: operatingHours || { open: '06:00', close: '22:00' },
      contactInfo: contactInfo || {},
      image,
      images: images || []
    });

    await venue.save();
    
    const populatedVenue = await Venue.findById(venue._id)
      .populate('owner', 'username email')
      .populate('manager', 'username email');

    res.status(201).json({
      message: 'Venue created successfully',
      venue: populatedVenue
    });
  } catch (err) {
    console.error('Create venue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update venue (Admin or venue owner/manager only)
router.put('/:id', auth, async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const user = await User.findById(req.userId);
    
    // Check permissions
    if (user.role !== 'admin' && 
        venue.owner.toString() !== req.userId && 
        venue.manager?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    delete updates._id; // Prevent ID changes
    
    Object.assign(venue, updates);
    await venue.save();

    const updatedVenue = await Venue.findById(venue._id)
      .populate('owner', 'username email')
      .populate('manager', 'username email');

    res.json({
      message: 'Venue updated successfully',
      venue: updatedVenue
    });
  } catch (err) {
    console.error('Update venue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete venue (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin required.' });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Soft delete - just mark as inactive
    venue.isActive = false;
    await venue.save();

    res.json({ message: 'Venue deleted successfully' });
  } catch (err) {
    console.error('Delete venue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get venues managed by current facility manager or owned by user
router.get('/my-venues', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Allow admins to see all venues, facility managers and regular users to see their venues
    let filter;
    if (user.role === 'admin') {
      filter = {}; // Admins see all venues
    } else {
      filter = {
        $or: [
          { owner: req.userId },
          { manager: req.userId }
        ]
      };
    }

    const venues = await Venue.find(filter)
      .populate('owner', 'username email')
      .populate('manager', 'username email')
      .sort({ createdAt: -1 });

    res.json(venues);
  } catch (err) {
    console.error('Get my venues error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get random venues for homepage
router.get('/random', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 6;
    const venues = await Venue.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: count } },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [{ $project: { username: 1, email: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'manager',
          foreignField: '_id',
          as: 'manager',
          pipeline: [{ $project: { username: 1, email: 1 } }]
        }
      },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$manager', preserveNullAndEmptyArrays: true } }
    ]);

    res.json(venues);
  } catch (err) {
    console.error('Get random venues error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured venues for homepage
router.get('/featured', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 4;
    const venues = await Venue.find({ 
      isActive: true,
      featured: true 
    })
    .limit(count)
    .populate('owner', 'username email')
    .populate('manager', 'username email')
    .sort({ createdAt: -1 });

    // If no featured venues, get the latest venues
    if (venues.length === 0) {
      const latestVenues = await Venue.find({ isActive: true })
        .limit(count)
        .populate('owner', 'username email')
        .populate('manager', 'username email')
        .sort({ createdAt: -1 });
      
      return res.json(latestVenues);
    }

    res.json(venues);
  } catch (err) {
    console.error('Get featured venues error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get venue statistics for homepage
router.get('/stats', async (req, res) => {
  try {
    const totalVenues = await Venue.countDocuments({ isActive: true });
    const totalLocations = await Venue.distinct('location', { isActive: true });
    const totalSports = await Venue.distinct('sport', { isActive: true });
    
    // Get bookings count if bookings model exists
    let totalBookings = 0;
    try {
      const Booking = require('../models/Booking');
      totalBookings = await Booking.countDocuments({});
    } catch (e) {
      // Booking model might not exist yet
      totalBookings = 0;
    }

    res.json({
      totalVenues,
      totalLocations: totalLocations.length,
      totalSports: totalSports.length,
      totalBookings
    });
  } catch (err) {
    console.error('Get venue stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single venue by ID
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('owner', 'username email phone')
      .populate('manager', 'username email phone');
    
    if (!venue || !venue.isActive) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(venue);
  } catch (err) {
    console.error('Get venue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
