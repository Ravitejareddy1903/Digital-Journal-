/**
 * Mongoose Schema: User Account & Security
 * Topics: MongoDB, Node.js, JavaScript, Authentication
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
      default: 'Chittresh',
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
      default: 'user@aurajournal.com',
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must have at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    bio: {
      type: String,
      maxlength: 300,
      default: 'Reflective writer & lifelong learner.',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    dailyWordGoal: {
      type: Number,
      default: 250,
      min: 50,
      max: 5000,
    },
    journalPin: {
      type: String,
      default: null,
      select: false,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['warm-editorial', 'light', 'dark', 'system'],
        default: 'warm-editorial',
      },
      enableDailyReminder: {
        type: Boolean,
        default: true,
      },
      autoSaveIntervalMs: {
        type: Number,
        default: 800,
      },
      defaultCategory: {
        type: String,
        default: 'Personal',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password with bcryptjs before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare input password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to verify journal PIN
UserSchema.methods.comparePin = async function (enteredPin) {
  if (!this.journalPin) return false;
  return await bcrypt.compare(enteredPin, this.journalPin);
};

module.exports = mongoose.model('User', UserSchema);
