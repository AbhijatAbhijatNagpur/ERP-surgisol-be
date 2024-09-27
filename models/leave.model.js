const mongoose = require('mongoose');

// Define the Leaves schema
const leaveSchema = new mongoose.Schema({
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the Leaves model
const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
