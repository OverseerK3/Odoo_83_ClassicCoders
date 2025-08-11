const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'player', 'facility_manager'], default: 'player' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
