const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // e.g., '17:30'
    endTime: { type: String, required: true },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked', index: true },
  },
  { timestamps: true }
);

BookingSchema.index({ venue: 1, date: 1, startTime: 1, endTime: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);


