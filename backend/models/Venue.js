const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  sport: { type: String, required: true },
  image: { type: String }, // URL to image
  images: [{ type: String }], // Multiple photos
  description: { type: String },
  capacity: { type: Number },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amenities: [{ type: String }], // Array of amenities
  sportsSupported: [{ type: String }], // Multiple sports
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }, // For featured venues
  pricing: {
    hourlyRate: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  operatingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' }
  },
  contactInfo: {
    phone: { type: String },
    email: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Venue', VenueSchema);
