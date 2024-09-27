const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true, unique: true },
  type: { type: String, enum: ['Public', 'Regional', 'Optional'], required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
});

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;