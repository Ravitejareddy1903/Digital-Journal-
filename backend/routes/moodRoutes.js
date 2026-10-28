/**
 * Mood Check-In Routes
 */
const express = require('express');
const router = express.Router();
const {
  getMoodCheckIns,
  createMoodCheckIn,
  deleteMoodCheckIn,
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMoodCheckIns)
  .post(createMoodCheckIn);

router.route('/:id')
  .delete(deleteMoodCheckIn);

module.exports = router;
