const mongoose = require('mongoose');

// Define the ActiveProjects schema
const activeProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'on-hold'],
    default: 'in-progress'
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

// Create the ActiveProjects model
const ActiveProject = mongoose.model('ActiveProject', activeProjectSchema);

module.exports = ActiveProject;
