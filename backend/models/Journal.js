/**
 * Mongoose Schema: Journal Entry
 * Topics: MongoDB, Node.js, JavaScript
 */
const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: String,
      index: true,
      default: null,
    },
    title: {
      type: String,
      default: 'Untitled Reflection',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    mood: {
      type: String,
      default: 'okay',
      index: true,
    },
    moodLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    category: {
      type: String,
      default: 'Personal',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    weather: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'night'],
      default: 'sunny',
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true,
    },
    promptUsed: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
    },
    entryDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound Index for user journal queries sorted by date
JournalSchema.index({ user: 1, entryDate: -1 });
JournalSchema.index({ user: 1, isFavorite: 1 });
JournalSchema.index({ user: 1, isPinned: 1 });

// Full-Text Search Index
JournalSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Pre-save hook: Automatically compute wordCount and reading time
JournalSchema.pre('save', function (next) {
  if (this.content) {
    const plainText = this.content.replace(/<[^>]*>?/gm, ' ');
    const words = plainText.trim().split(/\s+/).filter(Boolean);
    this.wordCount = words.length;
    this.readingTimeMinutes = Math.max(1, Math.ceil(this.wordCount / 200));
  } else {
    this.wordCount = 0;
    this.readingTimeMinutes = 1;
  }
  next();
});

module.exports = mongoose.model('Journal', JournalSchema);
