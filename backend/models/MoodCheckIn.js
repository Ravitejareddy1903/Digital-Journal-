/**
 * Mongoose Schema: Mood Check-In
 * Supports 5 mood levels (1: Very low, 2: Low, 3: Okay, 4: Good, 5: Great)
 */
const mongoose = require('mongoose');

const MoodCheckInSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    moodLevel: {
      type: Number,
      required: [true, 'Please select a mood level between 1 and 5'],
      min: 1,
      max: 5,
    },
    moodLabel: {
      type: String,
      enum: ['Very low', 'Low', 'Okay', 'Good', 'Great'],
      required: true,
    },
    emoji: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journal',
      default: null,
    },
    entryDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

MoodCheckInSchema.index({ user: 1, entryDate: -1 });

module.exports = mongoose.model('MoodCheckIn', MoodCheckInSchema);
