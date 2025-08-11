// Entry point for backend authentication server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const venuesRoutes = require('./routes/venues');
const teamsRoutes = require('./routes/teams');
const bookingsRoutes = require('./routes/bookings');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/bookings', bookingsRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/quickcourt', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
