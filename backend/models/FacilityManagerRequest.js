const mongoose = require('mongoose');

const FacilityManagerRequestSchema = new mongoose.Schema({
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  message: { 
    type: String,
    default: 'You have been invited to become a facility manager'
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  respondedAt: { 
    type: Date 
  },
  permissions: {
    canManageAllBookings: { type: Boolean, default: true },
    canManageAllVenues: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Ensure one pending request per user at a time
FacilityManagerRequestSchema.index({ user: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'pending' }
});

module.exports = mongoose.model('FacilityManagerRequest', FacilityManagerRequestSchema);
