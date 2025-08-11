const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
);

InviteSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Invite', InviteSchema);


