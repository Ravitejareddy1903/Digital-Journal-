/**
 * JWT Authentication Middleware with Seamless Default User Fallback
 * Topics: Node.js, Express, MongoDB, Security
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to ensure a default user exists for seamless local journaling
let cachedDefaultUser = null;

const getDefaultUser = async () => {
  if (cachedDefaultUser) return cachedDefaultUser;
  try {
    let user = await User.findOne({ email: 'user@aurajournal.com' });
    if (!user) {
      user = await User.create({
        name: 'Chittresh',
        email: 'user@aurajournal.com',
        password: 'password123',
      });
      console.log('[Auth]: Initialized default workspace user (Chittresh) in MongoDB');
    }
    cachedDefaultUser = user;
    return user;
  } catch (err) {
    console.error('[Auth]: Error ensuring default user:', err.message);
    return null;
  }
};

const protect = async (req, res, next) => {
  let token;

  // Extract Bearer token from authorization header if present
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If a valid token is provided, verify it
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secure_jwt_secret_digital_journal_2026_xyz987'
      );
      req.user = await User.findById(decoded.id).select('-password');
      if (req.user) {
        return next();
      }
    } catch (error) {
      console.warn('[Auth Token Expired/Invalid]: Falling back to workspace user');
    }
  }

  // If no token or token is invalid, seamlessly attach default workspace user
  const defaultUser = await getDefaultUser();
  if (defaultUser) {
    req.user = defaultUser;
    return next();
  }

  return res.status(500).json({
    success: false,
    message: 'Could not resolve workspace user in MongoDB',
  });
};

module.exports = { protect };
