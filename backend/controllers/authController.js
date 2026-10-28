/**
 * Authentication Controller
 * Topics: Node.js, Express, MongoDB, JWT, Security, Password Hashing
 */
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to sign JWT tokens
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secure_jwt_secret_digital_journal_2026_xyz987',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        hasPin: Boolean(user.journalPin),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Login user & return JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password +journalPin');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        hasPin: Boolean(user.journalPin),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
};

/**
 * @desc    Set or update 4-digit Journal Lock PIN
 * @route   POST /api/v1/auth/set-pin
 * @access  Private
 */
exports.setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 4 numeric digits',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    await User.findByIdAndUpdate(req.user.id, { journalPin: hashedPin });

    res.status(200).json({
      success: true,
      message: 'Journal Privacy PIN configured successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set security PIN',
    });
  }
};

/**
 * @desc    Verify 4-digit PIN to unlock journal
 * @route   POST /api/v1/auth/verify-pin
 * @access  Private
 */
exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.user.id).select('+journalPin');

    if (!user.journalPin) {
      return res.status(200).json({ success: true, message: 'No PIN configured' });
    }

    const isMatch = await bcrypt.compare(pin, user.journalPin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect 4-digit security PIN',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journal unlocked successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
};

/**
 * @desc    Update user profile & preferences
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, timezone, dailyWordGoal, avatar, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (timezone) user.timezone = timezone;
    if (dailyWordGoal) user.dailyWordGoal = Number(dailyWordGoal);
    if (avatar) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully in MongoDB',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + error.message,
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (user.password && currentPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password does not match' });
      }
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
    });
  }
};
