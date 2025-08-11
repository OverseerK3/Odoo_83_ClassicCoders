const express = require('express');
const Venue = require('../models/Venue');

const router = express.Router();

// Get random venues (limit 8 for home page)
router.get('/random', async (req, res) => {
  try {
    const venues = await Venue.aggregate([{ $sample: { size: 8 } }]);
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
