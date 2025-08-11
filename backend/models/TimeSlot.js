const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String }, // Maintenance, etc.
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

TimeSlotSchema.index({ court: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);
