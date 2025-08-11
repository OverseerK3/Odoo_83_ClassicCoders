// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth'); // OTP-enabled auth
const venuesRoutes = require('./routes/venues');
const teamsRoutes = require('./routes/teams');
const bookingsRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!', timestamp: new Date().toISOString() });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/bookings', bookingsRoutes);

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
