const mongoose = require('mongoose');

// Replace this with your MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI

async function connectDB () {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
