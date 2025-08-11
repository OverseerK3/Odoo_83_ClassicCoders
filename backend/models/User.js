const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'player', 'facility_manager'], default: 'player' },
  location: { type: String, default: 'Ahmedabad' },
  isEmailVerified: { type: Boolean, default: false }, // Add email verification status
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);