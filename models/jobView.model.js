const mongoose = require('mongoose');

const jobViewSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
});

const JobView = mongoose.model('JobView', jobViewSchema);

module.exports = JobView;