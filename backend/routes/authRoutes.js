/**
 * Authentication Routes
 * Topics: Node.js, Express Router, JWT Auth
 */
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  setPin,
  verifyPin,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (with automatic workspace user fallback)
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/set-pin', protect, setPin);
router.post('/verify-pin', protect, verifyPin);

module.exports = router;
