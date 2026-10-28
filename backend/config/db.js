/**
 * MongoDB Connection Handler using Mongoose
 * Topic: Node.js & MongoDB Integration
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/digital_journal_db', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB Connected]: Host ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // In production, exit or handle reconnection
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB]: Disconnected from database cluster');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB]: Reconnected successfully');
});

module.exports = connectDB;
