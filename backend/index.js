// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth'); // OTP-enabled auth
const venuesRoutes = require('./routes/venues');
const teamsRoutes = require('./routes/teams');
const bookingsRoutes = require('./routes/bookings');
const facilityRoutes = require('./routes/facility'); // New facility management routes
const loyaltyRoutes = require('./routes/loyalty'); // Player loyalty and discount cards
const facilityManagerRequestRoutes = require('./routes/facilityManagerRequests'); // Facility manager request system

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!', timestamp: new Date().toISOString() });
});

// Debug endpoint to check data
app.get('/api/debug/status', async (req, res) => {
  try {
    const User = require('./models/User');
    const Venue = require('./models/Venue');
    const Booking = require('./models/Booking');
    
    const userCount = await User.countDocuments();
    const venueCount = await Venue.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    const users = await User.find().select('username email role');
    const venues = await Venue.find().select('name location owner manager');
    const bookings = await Booking.find().populate('user', 'username email').populate('venue', 'name location');
    
    res.json({
      counts: { userCount, venueCount, bookingCount },
      users,
      venues,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/facility', facilityRoutes); // Facility management routes
app.use('/api/loyalty', loyaltyRoutes); // Player loyalty and discount cards
app.use('/api/facility-requests', facilityManagerRequestRoutes); // Facility manager request system

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickcourt';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
  });
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('💡 Make sure MongoDB is running and MONGO_URI is correct');
  process.exit(1);
});

// robust error handling
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
