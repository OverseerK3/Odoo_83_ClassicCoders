const mongoose = require('mongoose');

const FacilityManagerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add manager-specific fields here
  managedVenues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
  phone: { type: String },
  // ...
}, { timestamps: true });

module.exports = mongoose.model('FacilityManager', FacilityManagerSchema);
