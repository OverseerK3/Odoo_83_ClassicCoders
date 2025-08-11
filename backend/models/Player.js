const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add player-specific fields here
  favoriteSports: [{ type: String }],
  age: { type: Number },
  // ...
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);
