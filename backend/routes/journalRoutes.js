/**
 * Journal Routes
 * Topics: Node.js, Express Router, RESTful APIs
 */
const express = require('express');
const router = express.Router();
const {
  createJournalEntry,
  getJournalEntries,
  getJournalById,
  updateJournalEntry,
  deleteJournalEntry,
  toggleFavorite,
  togglePin,
  getJournalAnalytics,
  exportJournalsCSV,
  exportJournalsJSON,
  importJournals,
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// All journal routes require authentication (with automatic workspace user fallback)
router.use(protect);

// Analytics summary route
router.get('/analytics/summary', getJournalAnalytics);

// Export & Import routes
router.get('/export/csv', exportJournalsCSV);
router.get('/export/json', exportJournalsJSON);
router.post('/import', importJournals);

// Primary CRUD routes
router
  .route('/')
  .post(createJournalEntry)
  .get(getJournalEntries);

router
  .route('/:id')
  .get(getJournalById)
  .put(updateJournalEntry)
  .delete(deleteJournalEntry);

// Toggle favorite and pin status
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/pin', togglePin);

module.exports = router;
