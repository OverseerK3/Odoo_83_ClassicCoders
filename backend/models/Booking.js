const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // e.g., '17:30'
    endTime: { type: String, required: true },
    status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked', index: true },
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    courtName: { type: String }, // Which specific court within the venue
    notes: { type: String }, // Additional booking notes
  },
  { timestamps: true }
);

BookingSchema.index({ venue: 1, date: 1, startTime: 1, endTime: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);


