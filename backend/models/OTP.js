// models/OTP.js
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  // store hashed OTP, not plaintext
  otp: { type: String, required: true },
  type: { type: String, enum: ['signup', 'login'], required: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  isUsed: { type: Boolean, default: false, index: true },
}, { timestamps: true });

// Composite index for common queries
OTPSchema.index({ email: 1, type: 1, createdAt: -1 });
// TTL index will automatically remove expired docs when expiresAt passes
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', OTPSchema);
