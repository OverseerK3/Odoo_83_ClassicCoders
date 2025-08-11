const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  sport: { type: String, required: true },
  image: { type: String }, // URL to image
  description: { type: String },
  capacity: { type: Number },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'FacilityManager' },
}, { timestamps: true });

module.exports = mongoose.model('Venue', VenueSchema);
