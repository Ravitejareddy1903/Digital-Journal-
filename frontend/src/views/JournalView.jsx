import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  Plus,
  Star,
  Pin,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Mic,
  MicOff,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Tag,
  Share2,
  Bookmark,
  CheckCircle2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { MOOD_LEVELS, getMoodByLevel } from '../data/moods';

const CATEGORIES = [
  'All',
  'Personal',
  'Reflection',
  'Gratitude',
  'Growth & Goals',
  'Work & Projects',
  'Health & Wellness',
  'Ideas & Notes',
  'Travel'
];

export default function JournalView({
  journals = [],
  currentEntry,
  mode = 'list', // 'list' | 'edit' | 'read'
  setMode,
  onSaveEntry,
  onDeleteEntry,
  onToggleFavorite,
  onTogglePin,
  saveStatus = 'saved',
  initialDraft = null
}) {
  // Listing State
  const [viewStyle, setViewStyle] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [draftsOnly, setDraftsOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'updated' | 'alpha'

  // Selected entry for reading
  const [readingEntry, setReadingEntry] = useState(null);

  // Editor State
  const [editorId, setEditorId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [moodLevel, setMoodLevel] = useState(4); // default: Good
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 16));
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const textareaRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);

  // When initialDraft or currentEntry changes
  useEffect(() => {
    if (currentEntry) {
      if (mode === 'edit') {
        populateEditor(currentEntry);
      } else if (mode === 'read') {
        setReadingEntry(currentEntry);
      }
    } else if (initialDraft) {
      populateEditor(initialDraft);
      setMode('edit');
    }
  }, [currentEntry, initialDraft, mode]);

  const populateEditor = (entry) => {
    setEditorId(entry._id || entry.id || null);
    setTitle(entry.title || '');
    setContent(entry.content || '');
    setCategory(entry.category || 'Personal');
    setMoodLevel(entry.moodLevel || 4);
    setTags(entry.tags || []);
    setIsPinned(!!entry.isPinned);
    setIsFavorite(!!entry.isFavorite);
    setIsDraft(!!entry.isDraft);
    if (entry.createdAt || entry.date) {
      const d = new Date(entry.createdAt || entry.date);
      setEntryDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    } else {
      setEntryDate(new Date().toISOString().slice(0, 16));
    }
  };

  const startNewEntry = (prefill = {}) => {
    setEditorId(null);
    setTitle(prefill.title || '');
    setContent(prefill.content || '');
    setCategory(prefill.category || 'Personal');
    setMoodLevel(prefill.moodLevel || 4);
    setTags(prefill.tags || []);
    setIsPinned(false);
    setIsFavorite(false);
    setIsDraft(false);
    setEntryDate(new Date().toISOString().slice(0, 16));
    setPreviewMode(false);
    setMode('edit');
  };

  // Debounced Autosave (1.5s after typing)
  useEffect(() => {
    if (mode !== 'edit') return;
    if (!title && !content) return; // Don't autosave empty blank sheet

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      handleSave(false, true); // silent autosave
    }, 1500);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [title, content, category, moodLevel, tags, entryDate, isPinned, isFavorite]);

  const handleSave = async (explicitDraft = false, isAutosave = false) => {
    if (!title.trim() && !content.trim()) return;

    const payload = {
      _id: editorId,
      title: title.trim() || 'Untitled Reflection',
      content,
      category,
      moodLevel,
      tags,
      isPinned,
      isFavorite,
      isDraft: explicitDraft,
      entryDate: new Date(entryDate).toISOString(),
      createdAt: new Date(entryDate).toISOString()
    };

    try {
      const saved = await onSaveEntry(payload, isAutosave);
      if (saved && (saved._id || saved.id)) {
        setEditorId(saved._id || saved.id);
      }
      if (!isAutosave) {
        setMode('list');
      }
    } catch {
      // Handled in parent
    }
  };

  // Tag management
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tToRemove) => {
    setTags(tags.filter(t => t !== tToRemove));
  };

  // Rich Text Editor Toolbar Helpers
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + selectedText + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Speech to Text Dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setContent((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Word & Reading Time Counts
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Filter & Sort Logic for Listings
  const filteredJournals = journals.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesMood = selectedMoodFilter === 'All' || item.moodLevel?.toString() === selectedMoodFilter;
    const matchesFavorites = !favoritesOnly || item.isFavorite;
    const matchesDrafts = !draftsOnly || item.isDraft;

    return matchesSearch && matchesCategory && matchesMood && matchesFavorites && matchesDrafts;
  });

  // Sorting
  const sortedJournals = [...filteredJournals].sort((a, b) => {
    // Pinned always on top
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'newest') {
      return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
    }
    if (sortBy === 'updated') {
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    }
    if (sortBy === 'alpha') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  // Reading Navigation (Previous / Next)
  const currentReadingIndex = readingEntry
    ? sortedJournals.findIndex((j) => (j._id || j.id) === (readingEntry._id || readingEntry.id))
    : -1;

  // ==========================================
  // VIEW: EDIT / CREATE MODE
  // ==========================================
  if (mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
        {/* Editor Top Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7E0]">
          <button
            onClick={() => setMode('list')}
            className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Autosave Status Badge */}
            <span className="text-xs text-charcoal-400 flex items-center gap-1.5">
              {saveStatus === 'saving' ? (
                <span className="text-amber-600">Saving changes...</span>
              ) : (
                <span className="text-sage-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved to MongoDB
                </span>
              )}
            </span>

            {/* Toggle Preview Button */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                previewMode
                  ? 'bg-sage-50 text-sage-800 border-sage-300'
                  : 'bg-white text-charcoal-600 border-[#E5E7E0] hover:bg-paper-100'
              }`}
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{previewMode ? 'Edit Mode' : 'Preview'}</span>
            </button>

            {/* Pin and Favorite Toggles */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl border transition-colors ${
                isPinned
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-charcoal-400 border-[#E5E7E0] hover:text-charcoal-700'
              }`}
              title={isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-charcoal-400 border-[#E5E7E0] hover:text-charcoal-700'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Save Buttons */}
            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Save & Close
            </button>
          </div>
        </div>

        {/* Editor Main Canvas Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7E0] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Metadata Controls: Date, Category, Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#E5E7E0]/70 text-xs">
            {/* Date and Time */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
                Entry Date & Time
              </label>
              <input
                type="datetime-local"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E5E7E0] bg-paper-50 text-charcoal-700 font-sans focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E5E7E0] bg-paper-50 text-charcoal-700 font-sans focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood Selector (5 levels) */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
                Mood Check-in
              </label>
              <div className="flex gap-1.5 justify-between">
                {MOOD_LEVELS.map((m) => (
                  <button
                    key={m.level}
                    type="button"
                    onClick={() => setMoodLevel(m.level)}
                    className={`flex-1 py-1.5 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                      moodLevel === m.level
                        ? `${m.activeColor} shadow-2xs font-semibold scale-102`
                        : 'bg-paper-50 hover:bg-paper-100 border-[#E5E7E0] text-charcoal-600'
                    }`}
                    title={m.label}
                  >
                    <span className={`w-2 h-2 rounded-full mb-0.5 ${m.dot}`} />
                    <span className="text-[10px]">{m.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of this reflection..."
            className="w-full font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800 placeholder-charcoal-300 outline-hidden bg-transparent border-none p-0"
          />

          {/* Rich Text Toolbar */}
          {!previewMode && (
            <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-paper-100 border border-[#E5E7E0] text-charcoal-600 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting('# ', '')}
                className="px-2 py-1 rounded hover:bg-white font-bold"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('## ', '')}
                className="px-2 py-1 rounded hover:bg-white font-bold"
                title="Heading 2"
              >
                H2
              </button>
              <span className="w-px h-4 bg-charcoal-300 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="px-2 py-1 rounded hover:bg-white font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="px-2 py-1 rounded hover:bg-white italic"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ', '')}
                className="px-2 py-1 rounded hover:bg-white"
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ', '')}
                className="px-2 py-1 rounded hover:bg-white"
                title="Numbered List"
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ', '')}
                className="px-2 py-1 rounded hover:bg-white italic"
                title="Blockquote"
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('`', '`')}
                className="px-2 py-1 rounded hover:bg-white font-mono"
                title="Inline Code"
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://)')}
                className="px-2 py-1 rounded hover:bg-white"
                title="Link"
              >
                Link
              </button>

              <div className="ml-auto flex items-center gap-2">
                {/* Voice Dictation */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isListening
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : 'hover:bg-white text-charcoal-600'
                  }`}
                  title="Speech-to-text dictation"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Dictate'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Writing Area OR Preview */}
          {previewMode ? (
            <div className="min-h-[350px] p-4 rounded-xl bg-paper-50/50 border border-[#E5E7E0] prose prose-slate max-w-none text-charcoal-800 font-editorial leading-relaxed whitespace-pre-wrap">
              {content || <span className="text-charcoal-400 italic">No content written yet...</span>}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely... pouring your thoughts, gratitude, or reflections here."
              rows={16}
              className="w-full font-editorial text-base sm:text-lg text-charcoal-800 placeholder-charcoal-300 leading-relaxed outline-hidden bg-transparent resize-y border-none p-0 focus:ring-0"
            />
          )}

          {/* Custom Tags Section */}
          <div className="pt-4 border-t border-[#E5E7E0]/70">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-paper-200 text-charcoal-700"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-600 text-charcoal-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag (press Enter)..."
                className="text-xs px-2.5 py-1 rounded-lg border border-[#E5E7E0] bg-paper-50 text-charcoal-700 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
            </div>
          </div>

          {/* Bottom Statistics: Words & Reading Time */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7E0] text-xs text-charcoal-400">
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-3 py-1.5 rounded-lg border border-[#E5E7E0] hover:bg-paper-100 text-charcoal-600 text-xs font-medium"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-4 py-1.5 rounded-lg bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold shadow-xs"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: READING DETAIL MODE
  // ==========================================
  if (mode === 'read' && readingEntry) {
    const mood = getMoodByLevel(readingEntry.moodLevel || readingEntry.mood);
    const dateFormatted = new Date(readingEntry.createdAt || readingEntry.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timeFormatted = new Date(readingEntry.createdAt || readingEntry.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const hasPrev = currentReadingIndex > 0;
    const hasNext = currentReadingIndex < sortedJournals.length - 1 && currentReadingIndex !== -1;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
        {/* Detail Top Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7E0]">
          <button
            onClick={() => setMode('list')}
            className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal Listing</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Prev / Next Entry Nav */}
            <button
              disabled={!hasPrev}
              onClick={() => hasPrev && setReadingEntry(sortedJournals[currentReadingIndex - 1])}
              className="p-1.5 rounded-lg border border-[#E5E7E0] hover:bg-paper-100 disabled:opacity-30 disabled:pointer-events-none text-charcoal-600"
              title="Previous Entry"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!hasNext}
              onClick={() => hasNext && setReadingEntry(sortedJournals[currentReadingIndex + 1])}
              className="p-1.5 rounded-lg border border-[#E5E7E0] hover:bg-paper-100 disabled:opacity-30 disabled:pointer-events-none text-charcoal-600"
              title="Next Entry"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-charcoal-200 mx-1" />

            {/* Favorite */}
            <button
              onClick={() => onToggleFavorite(readingEntry._id || readingEntry.id)}
              className="p-2 rounded-xl border border-[#E5E7E0] hover:bg-paper-100 text-charcoal-600"
              title="Toggle Favorite"
            >
              <Star
                className={`w-4 h-4 ${readingEntry.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>

            {/* Edit */}
            <button
              onClick={() => {
                populateEditor(readingEntry);
                setMode('edit');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7E0] hover:bg-paper-100 text-charcoal-700 text-xs font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => setDeleteConfirmId(readingEntry._id || readingEntry.id)}
              className="p-2 rounded-xl border border-[#E5E7E0] hover:bg-rose-50 hover:border-rose-200 text-charcoal-400 hover:text-rose-600"
              title="Delete Entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reading Article Card */}
        <article className="bg-white rounded-2xl border border-[#E5E7E0] p-8 sm:p-12 shadow-xs space-y-6">
          {/* Header Metadata */}
          <div className="space-y-3 pb-6 border-b border-[#E5E7E0]/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${mood.badgeBg} flex items-center gap-1.5`}>
                <span className={`w-2 h-2 rounded-full ${mood.dot}`} />
                <span>{mood.label}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-paper-200 text-charcoal-700">
                {readingEntry.category || 'Personal'}
              </span>
              {readingEntry.isPinned && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-amber-500 text-amber-500" /> Pinned
                </span>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
              {readingEntry.title || 'Untitled Entry'}
            </h1>

            <div className="flex items-center gap-4 text-xs text-charcoal-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {dateFormatted}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {timeFormatted}
              </span>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="font-editorial text-lg text-charcoal-800 leading-relaxed whitespace-pre-wrap py-2">
            {readingEntry.content || <span className="italic text-charcoal-400">No content.</span>}
          </div>

          {/* Tags */}
          {readingEntry.tags && readingEntry.tags.length > 0 && (
            <div className="pt-6 border-t border-[#E5E7E0]/80 flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-charcoal-400" />
              {readingEntry.tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-0.5 rounded-md bg-paper-100 text-charcoal-600">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#E5E7E0] p-6 max-w-sm w-full shadow-xl">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1">Delete this journal entry?</h3>
              <p className="text-xs text-charcoal-500 mb-5">
                This action is permanent and will remove this reflection from your MongoDB collection.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E5E7E0] text-charcoal-600 text-xs font-medium hover:bg-paper-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onDeleteEntry(deleteConfirmId);
                    setDeleteConfirmId(null);
                    setMode('list');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: LISTING MODE (GRID / COMPACT LIST)
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. Header with Actions and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">My Journal</h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            {sortedJournals.length} {sortedJournals.length === 1 ? 'entry' : 'entries'} stored in your database
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-paper-100 p-1 rounded-xl border border-[#E5E7E0]">
            <button
              onClick={() => setViewStyle('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewStyle === 'grid' ? 'bg-white shadow-2xs text-charcoal-800' : 'text-charcoal-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewStyle('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewStyle === 'list' ? 'bg-white shadow-2xs text-charcoal-800' : 'text-charcoal-400'
              }`}
              title="Compact List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* New Entry CTA */}
          <button
            onClick={() => startNewEntry()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="journal-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, thoughts, or tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-700 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Mood Filter */}
          <select
            value={selectedMoodFilter}
            onChange={(e) => setSelectedMoodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-700 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
          >
            <option value="All">All Moods</option>
            {MOOD_LEVELS.map((m) => (
              <option key={m.level} value={m.level.toString()}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-700 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="updated">Sort: Recently Updated</option>
            <option value="alpha">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Quick Filter Pills (Favorites, Drafts) */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              favoritesOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-paper-50 text-charcoal-600 border-[#E5E7E0] hover:bg-paper-100'
            }`}
          >
            <Star className={`w-3 h-3 ${favoritesOnly ? 'fill-rose-500' : ''}`} />
            <span>Favorites Only</span>
          </button>

          <button
            onClick={() => setDraftsOnly(!draftsOnly)}
            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              draftsOnly
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-paper-50 text-charcoal-600 border-[#E5E7E0] hover:bg-paper-100'
            }`}
          >
            <span>Drafts Only</span>
          </button>

          {(searchQuery || selectedCategory !== 'All' || selectedMoodFilter !== 'All' || favoritesOnly || draftsOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedMoodFilter('All');
                setFavoritesOnly(false);
                setDraftsOnly(false);
              }}
              className="text-xs text-charcoal-400 hover:text-charcoal-700 underline ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Empty State */}
      {sortedJournals.length === 0 ? (
        <div className="journal-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-paper-200 text-charcoal-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-800">No journal entries found</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or write a brand new reflection to store in MongoDB.
            </p>
          </div>
          <button
            onClick={() => startNewEntry()}
            className="px-4 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold shadow-xs"
          >
            Create New Reflection
          </button>
        </div>
      ) : viewStyle === 'grid' ? (
        /* 4. Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedJournals.map((item) => {
            const mood = getMoodByLevel(item.moodLevel || item.mood);
            const dateStr = new Date(item.createdAt || item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={item._id || item.id}
                className="journal-card p-5 flex flex-col justify-between group hover:border-sage-300 transition-all cursor-pointer relative"
                onClick={() => {
                  setReadingEntry(item);
                  setMode('read');
                }}
              >
                <div>
                  {/* Top card bar: Date, Pin, Favorite, Mood */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-charcoal-400 font-medium">{dateStr}</span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onTogglePin(item._id || item.id)}
                        className={`p-1 rounded-md hover:bg-paper-200 transition-colors ${
                          item.isPinned ? 'text-amber-500' : 'text-charcoal-300 hover:text-charcoal-600'
                        }`}
                        title={item.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => onToggleFavorite(item._id || item.id)}
                        className={`p-1 rounded-md hover:bg-paper-200 transition-colors ${
                          item.isFavorite ? 'text-rose-500' : 'text-charcoal-300 hover:text-charcoal-600'
                        }`}
                        title={item.isFavorite ? 'Remove favorite' : 'Mark favorite'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ml-1 ${mood.badgeBg}`}>
                        {mood.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <h3 className="font-editorial text-lg font-bold text-charcoal-900 group-hover:text-sage-700 line-clamp-1 mb-2">
                    {item.title || 'Untitled Entry'}
                  </h3>
                  <p className="font-editorial text-xs text-charcoal-500 line-clamp-3 leading-relaxed mb-4">
                    {item.content?.replace(/[#*`_]/g, '') || 'No content written.'}
                  </p>
                </div>

                {/* Bottom card bar: Category & Tags */}
                <div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E7E0]/70 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-paper-100 text-charcoal-600 font-medium">
                      {item.category || 'Personal'}
                    </span>
                    <span className="text-sage-700 font-semibold group-hover:underline">
                      Read reflection →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. Compact List View */
        <div className="journal-card divide-y divide-[#E5E7E0] overflow-hidden">
          {sortedJournals.map((item) => {
            const mood = getMoodByLevel(item.moodLevel || item.mood);
            const dateStr = new Date(item.createdAt || item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={item._id || item.id}
                onClick={() => {
                  setReadingEntry(item);
                  setMode('read');
                }}
                className="p-4 flex items-center justify-between gap-4 hover:bg-paper-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${mood.dot}`} title={mood.label} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      {item.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                      <h4 className="text-sm font-semibold text-charcoal-800 group-hover:text-sage-700 truncate">
                        {item.title || 'Untitled Entry'}
                      </h4>
                      {item.category && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-paper-200 text-charcoal-600 shrink-0">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-500 truncate">
                      {item.content?.replace(/[#*`_]/g, '') || 'No content written'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-charcoal-400">
                  <span>{dateStr}</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(item._id || item.id)}
                      className="p-1 text-charcoal-300 hover:text-rose-500"
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        populateEditor(item);
                        setMode('edit');
                      }}
                      className="p-1 text-charcoal-300 hover:text-charcoal-700"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal for List View */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1">Delete this entry?</h3>
            <p className="text-xs text-charcoal-500 mb-5">
              This will permanently delete the entry from MongoDB.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5E7E0] text-charcoal-600 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDeleteEntry(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
