const express = require('express');
const Venue = require('../models/Venue');

const router = express.Router();

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

    const filter = { status: 'active' };
    
    // Location filter
    if (location && location !== 'all') {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Sport filter
    if (sport && sport !== 'all') {
      filter.sport = { $regex: sport, $options: 'i' };
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
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const venues = await Venue.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('managerId', 'username email');

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

// Get random venues (limit 8 for home page)
router.get('/random', async (req, res) => {
  try {
    const count = await Venue.countDocuments({ status: 'active' });
    if (count === 0) {
      return res.json([]);
    }
    
    const venues = await Venue.aggregate([
      { $match: { status: 'active' } },
      { $sample: { size: Math.min(8, count) } }
    ]);
    res.json(venues);
  } catch (err) {
    console.error('Get random venues error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured venues for home page
router.get('/featured', async (req, res) => {
  try {
    const venues = await Venue.find({ 
      status: 'active',
      featured: true 
    })
    .sort({ rating: -1, createdAt: -1 })
    .limit(8)
    .populate('managerId', 'username email');

    // If no featured venues, get top-rated ones
    if (venues.length === 0) {
      const topVenues = await Venue.find({ status: 'active' })
        .sort({ rating: -1, createdAt: -1 })
        .limit(8)
        .populate('managerId', 'username email');
      
      return res.json(topVenues);
    }

    res.json(venues);
  } catch (err) {
    console.error('Get featured venues error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get venue statistics for home page
router.get('/stats', async (req, res) => {
  try {
    const stats = await Venue.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerHour' },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalVenues = await Venue.countDocuments({ status: 'active' });
    const locations = await Venue.distinct('location', { status: 'active' });

    res.json({
      sports: stats,
      totalVenues,
      locations: locations.length,
      topLocations: locations.slice(0, 8)
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
      .populate('managerId', 'username email phone');
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(venue);
  } catch (err) {
    console.error('Get venue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
