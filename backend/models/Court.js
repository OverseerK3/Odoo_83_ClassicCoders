const mongoose = require('mongoose');

const CourtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  sportType: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  operatingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' }
  },
  features: [{ type: String }], // Air conditioning, Lighting, etc.
  maintenanceNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Court', CourtSchema);
