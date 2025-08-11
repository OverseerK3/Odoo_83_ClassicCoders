const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add admin-specific fields here
  permissions: [{ type: String }],
  // ...
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
