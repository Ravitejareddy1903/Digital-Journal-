/**
 * Mood Check-In Controller
 * Supports 5 mood levels: 1: Very low, 2: Low, 3: Okay, 4: Good, 5: Great
 */
const MoodCheckIn = require('../models/MoodCheckIn');

const MOOD_MAP = {
  1: { label: 'Very low' },
  2: { label: 'Low' },
  3: { label: 'Okay' },
  4: { label: 'Good' },
  5: { label: 'Great' },
};

/**
 * @desc    Get all mood check-ins for authenticated user
 * @route   GET /api/v1/moods
 */
exports.getMoodCheckIns = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate);
      if (endDate) query.entryDate.$lte = new Date(endDate);
    }

    const checkIns = await MoodCheckIn.find(query)
      .sort({ entryDate: -1 })
      .limit(parseInt(limit, 10));

    // Calculate average score and distribution
    const total = checkIns.length;
    const sum = checkIns.reduce((acc, c) => acc + (c.moodLevel || 3), 0);
    const averageScore = total > 0 ? (sum / total).toFixed(1) : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    checkIns.forEach(c => {
      distribution[c.moodLevel] = (distribution[c.moodLevel] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      count: total,
      averageScore: Number(averageScore),
      distribution,
      data: checkIns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mood history',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new mood check-in
 * @route   POST /api/v1/moods
 */
exports.createMoodCheckIn = async (req, res) => {
  try {
    const { moodLevel, notes, note, entryDate, journalEntry, journalId } = req.body;
    const level = parseInt(moodLevel, 10) || 3;
    const meta = MOOD_MAP[level] || MOOD_MAP[3];

    const checkIn = await MoodCheckIn.create({
      user: req.user._id,
      moodLevel: level,
      moodLabel: meta.label,
      emoji: '',
      notes: notes || note || '',
      journalEntry: journalEntry || journalId || null,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Mood check-in recorded',
      data: checkIn,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record mood check-in',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a mood check-in
 * @route   DELETE /api/v1/moods/:id
 */
exports.deleteMoodCheckIn = async (req, res) => {
  try {
    const checkIn = await MoodCheckIn.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Mood check-in not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mood check-in deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete mood check-in',
    });
  }
};
