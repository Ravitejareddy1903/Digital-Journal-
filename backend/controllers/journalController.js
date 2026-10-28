/**
 * Journal Controller: CRUD, Full-Text Search & Aggregation Analytics
 * Topics: Node.js, Express, MongoDB (Aggregation Pipelines & Querying), JavaScript
 */
const mongoose = require('mongoose');
const Journal = require('../models/Journal');

// Helper to filter by either Mongo _id or clientId
const getEntryFilter = (id, userId) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return {
      $or: [
        { _id: id, user: userId },
        { clientId: id, user: userId },
      ],
    };
  }
  return { clientId: id, user: userId };
};

/**
 * @desc    Create a new journal entry
 * @route   POST /api/v1/journals
 * @access  Private
 */
exports.createJournalEntry = async (req, res) => {
  try {
    const {
      _id,
      id,
      clientId,
      title,
      content,
      mood,
      moodLevel,
      category,
      tags,
      weather,
      coverImage,
      entryDate,
      createdAt,
      isFavorite,
      isPinned,
      isDraft,
      promptUsed,
    } = req.body;

    const entryId = _id || id || clientId || null;

    // Check for existing document by _id or clientId to update instead of creating duplicate
    if (entryId) {
      let existing = null;
      if (mongoose.Types.ObjectId.isValid(entryId)) {
        existing = await Journal.findOne({ _id: entryId, user: req.user._id });
      }
      if (!existing) {
        existing = await Journal.findOne({ clientId: entryId, user: req.user._id });
      }
      if (existing) {
        if (title !== undefined) existing.title = title;
        if (content !== undefined) existing.content = content;
        if (mood !== undefined) existing.mood = mood;
        if (moodLevel !== undefined) existing.moodLevel = Number(moodLevel);
        if (category !== undefined) existing.category = category;
        if (tags !== undefined) existing.tags = Array.isArray(tags) ? tags : [];
        if (weather !== undefined) existing.weather = weather;
        if (coverImage !== undefined) existing.coverImage = coverImage;
        if (isFavorite !== undefined) existing.isFavorite = Boolean(isFavorite);
        if (isPinned !== undefined) existing.isPinned = Boolean(isPinned);
        if (isDraft !== undefined) existing.isDraft = Boolean(isDraft);
        if (promptUsed !== undefined) existing.promptUsed = promptUsed;
        if (entryDate || createdAt) existing.entryDate = new Date(entryDate || createdAt);
        await existing.save();
        console.log(`[MongoDB]: Updated existing journal entry "${existing.title}" (_id: ${existing._id})`);
        return res.status(200).json({
          success: true,
          message: 'Journal entry updated in MongoDB',
          data: existing,
        });
      }
    }

    const effectiveDate = entryDate || createdAt || new Date();

    const journal = await Journal.create({
      user: req.user._id,
      clientId: entryId,
      title: title || 'Untitled Reflection',
      content: content || '',
      mood: mood || 'okay',
      moodLevel: moodLevel !== undefined ? Number(moodLevel) : 3,
      category: category || 'Personal',
      tags: Array.isArray(tags) ? tags : [],
      weather: weather || 'sunny',
      coverImage: coverImage || null,
      isFavorite: Boolean(isFavorite),
      isPinned: Boolean(isPinned),
      isDraft: Boolean(isDraft),
      promptUsed: promptUsed || null,
      entryDate: new Date(effectiveDate),
    });

    console.log(`[MongoDB]: Saved new journal entry "${journal.title}" (_id: ${journal._id})`);

    res.status(201).json({
      success: true,
      message: 'Journal entry stored successfully in MongoDB',
      data: journal,
    });
  } catch (error) {
    console.error('[Create Journal Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all journal entries with search, filter, and pagination
 * @route   GET /api/v1/journals
 * @access  Private
 */
exports.getJournalEntries = async (req, res) => {
  try {
    const {
      q,
      mood,
      category,
      isFavorite,
      startDate,
      endDate,
      sortBy = 'entryDate',
      order = 'desc',
      page = 1,
      limit = 100,
    } = req.query;

    const query = { user: req.user._id };

    // Search filter
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    // Filter by Mood
    if (mood && mood !== 'all') {
      query.mood = mood;
    }

    // Filter by Category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by Favorites
    if (isFavorite !== undefined && isFavorite !== '') {
      query.isFavorite = isFavorite === 'true';
    }

    // Date Range Filter
    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate);
      if (endDate) query.entryDate.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = order === 'asc' ? 1 : -1;

    const total = await Journal.countDocuments(query);
    const entries = await Journal.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entries from MongoDB',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single journal entry by ID
 * @route   GET /api/v1/journals/:id
 * @access  Private
 */
exports.getJournalById = async (req, res) => {
  try {
    const filter = getEntryFilter(req.params.id, req.user._id);
    const journal = await Journal.findOne(filter);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: journal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving entry',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a journal entry
 * @route   PUT /api/v1/journals/:id
 * @access  Private
 */
exports.updateJournalEntry = async (req, res) => {
  try {
    const filter = getEntryFilter(req.params.id, req.user._id);
    let journal = await Journal.findOne(filter);

    // If entry does not exist yet in MongoDB, create it
    if (!journal) {
      journal = new Journal({
        user: req.user._id,
        clientId: req.params.id,
        title: req.body.title || 'Untitled Reflection',
        content: req.body.content || '',
      });
    }

    const fieldsToUpdate = [
      'title',
      'content',
      'mood',
      'moodLevel',
      'category',
      'tags',
      'weather',
      'isFavorite',
      'isPinned',
      'isDraft',
      'promptUsed',
      'coverImage',
      'entryDate',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        journal[field] = req.body[field];
      }
    });

    if (req.body.createdAt && !req.body.entryDate) {
      journal.entryDate = new Date(req.body.createdAt);
    }

    await journal.save();

    console.log(`[MongoDB]: Updated journal "${journal.title}" (_id: ${journal._id})`);

    res.status(200).json({
      success: true,
      message: 'Entry updated successfully in MongoDB',
      data: journal,
    });
  } catch (error) {
    console.error('[Update Journal Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update entry in MongoDB',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle favorite status of an entry
 * @route   PATCH /api/v1/journals/:id/favorite
 * @access  Private
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const filter = getEntryFilter(req.params.id, req.user._id);
    const journal = await Journal.findOne(filter);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    journal.isFavorite = !journal.isFavorite;
    await journal.save();

    res.status(200).json({
      success: true,
      message: `Journal marked as ${journal.isFavorite ? 'favorite' : 'unfavorited'}`,
      isFavorite: journal.isFavorite,
      data: journal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite status',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a journal entry
 * @route   DELETE /api/v1/journals/:id
 * @access  Private
 */
exports.deleteJournalEntry = async (req, res) => {
  try {
    const filter = getEntryFilter(req.params.id, req.user._id);
    const result = await Journal.findOneAndDelete(filter);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found or unauthorized',
      });
    }

    console.log(`[MongoDB]: Deleted journal entry (${req.params.id})`);

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted permanently from MongoDB',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error.message,
    });
  }
};

/**
 * @desc    Get mood analytics & statistics using MongoDB Aggregation Pipeline
 * @route   GET /api/v1/journals/analytics/summary
 * @access  Private
 */
exports.getJournalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const moodStats = await Journal.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categoryStats = await Journal.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totals = await Journal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          avgWordsPerEntry: { $avg: '$wordCount' },
        },
      },
    ]);

    const dates = await Journal.find({ user: userId })
      .select('entryDate')
      .sort({ entryDate: -1 });

    let currentStreak = 0;
    if (dates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const uniqueDays = new Set(
        dates.map((d) => {
          const dt = new Date(d.entryDate);
          dt.setHours(0, 0, 0, 0);
          return dt.getTime();
        })
      );

      const dayMillis = 24 * 60 * 60 * 1000;
      let checkDay = today.getTime();

      if (!uniqueDays.has(checkDay)) {
        checkDay -= dayMillis;
      }

      while (uniqueDays.has(checkDay)) {
        currentStreak++;
        checkDay -= dayMillis;
      }
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalEntries: totals[0]?.totalEntries || 0,
        totalWords: totals[0]?.totalWords || 0,
        avgWordsPerEntry: Math.round(totals[0]?.avgWordsPerEntry || 0),
        currentStreakDays: currentStreak,
        moodDistribution: moodStats,
        categoryDistribution: categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle pinned status of an entry
 * @route   PATCH /api/v1/journals/:id/pin
 */
exports.togglePin = async (req, res) => {
  try {
    const filter = getEntryFilter(req.params.id, req.user._id);
    const journal = await Journal.findOne(filter);
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    journal.isPinned = !journal.isPinned;
    await journal.save();
    res.status(200).json({ success: true, isPinned: journal.isPinned, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle pin status' });
  }
};

/**
 * @desc    Export user journals as CSV
 * @route   GET /api/v1/journals/export/csv
 */
exports.exportJournalsCSV = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id }).sort({ entryDate: -1 });
    let csv = 'ID,Date,Title,Mood,Category,Tags,WordCount,Favorite,Pinned\n';
    journals.forEach(j => {
      const escapedTitle = `"${(j.title || '').replace(/"/g, '""')}"`;
      const tags = `"${(j.tags || []).join(';')}"`;
      csv += `${j._id},${new Date(j.entryDate).toISOString()},${escapedTitle},${j.mood || ''},${j.category || ''},${tags},${j.wordCount || 0},${Boolean(j.isFavorite)},${Boolean(j.isPinned)}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="everjournal_export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed' });
  }
};

/**
 * @desc    Export user journals as JSON
 * @route   GET /api/v1/journals/export/json
 */
exports.exportJournalsJSON = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id }).sort({ entryDate: -1 });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="everjournal_backup.json"');
    res.status(200).json(journals);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed' });
  }
};

/**
 * @desc    Import journals into MongoDB
 * @route   POST /api/v1/journals/import
 */
exports.importJournals = async (req, res) => {
  try {
    const entries = req.body.entries || req.body.journals;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid import data: expected an array of entries' });
    }
    let count = 0;
    for (const item of entries) {
      if (item.title || item.content) {
        await Journal.create({
          user: req.user._id,
          title: item.title || 'Imported Reflection',
          content: item.content || '',
          mood: item.mood || 'okay',
          category: item.category || 'Personal',
          tags: Array.isArray(item.tags) ? item.tags : [],
          isFavorite: Boolean(item.isFavorite),
          isPinned: Boolean(item.isPinned),
          entryDate: item.entryDate ? new Date(item.entryDate) : new Date(),
        });
        count++;
      }
    }
    res.status(200).json({ success: true, message: `Successfully imported ${count} entries into MongoDB` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Import failed: ' + error.message });
  }
};
