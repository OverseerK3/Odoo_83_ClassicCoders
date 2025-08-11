const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', TeamSchema);


