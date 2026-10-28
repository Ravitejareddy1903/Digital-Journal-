import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { getMoodByLevel } from '../data/moods';

export default function GlobalSearchModal({ isOpen, onClose, entries = [], prompts = [], onSelectEntry, onSelectPrompt }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingEntries = trimmed
    ? entries.filter(
        (e) =>
          e.title?.toLowerCase().includes(trimmed) ||
          e.content?.toLowerCase().includes(trimmed) ||
          e.tags?.some((t) => t.toLowerCase().includes(trimmed)) ||
          e.category?.toLowerCase().includes(trimmed)
      ).slice(0, 6)
    : entries.slice(0, 4);

  const matchingPrompts = trimmed
    ? prompts.filter(
        (p) =>
          p.prompt?.toLowerCase().includes(trimmed) ||
          p.category?.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#E5E7E0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="p-4 border-b border-[#E5E7E0] flex items-center gap-3">
          <Search className="w-5 h-5 text-charcoal-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries by title, notes, tags or prompts..."
            className="flex-1 text-sm text-charcoal-800 placeholder-charcoal-400 outline-hidden bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {/* Entries Section */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{trimmed ? 'Matching Entries' : 'Recent Entries'}</span>
            </div>
            {matchingEntries.length === 0 ? (
              <p className="px-3 py-3 text-xs text-charcoal-500 italic">No journal entries found matching "{query}"</p>
            ) : (
              <div className="space-y-1 mt-1">
                {matchingEntries.map((entry) => {
                  const mood = getMoodByLevel(entry.moodLevel || entry.mood);
                  return (
                    <div
                      key={entry._id || entry.id}
                      onClick={() => {
                        onSelectEntry(entry);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-paper-100 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${mood.dot}`} />
                          <h4 className="text-sm font-semibold text-charcoal-800 group-hover:text-sage-700 truncate">
                            {entry.title || 'Untitled Entry'}
                          </h4>
                          {entry.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-paper-200 text-charcoal-600">
                              {entry.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-500 line-clamp-1">
                          {entry.content?.replace(/[#*`_]/g, '') || 'Empty entry'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-charcoal-300 group-hover:text-sage-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prompts Section */}
          {matchingPrompts.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                <span>Writing Prompts</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchingPrompts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectPrompt(p);
                      onClose();
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-paper-100 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <span className="text-[10px] font-medium text-sage-700 bg-sage-50 px-1.5 py-0.5 rounded-sm">
                        {p.category}
                      </span>
                      <p className="text-xs font-medium text-charcoal-800 mt-1 line-clamp-2">
                        {p.prompt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-300 group-hover:text-sage-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-paper-50 border-t border-[#E5E7E0] flex items-center justify-between text-[11px] text-charcoal-400">
          <span>Navigate with mouse or click an item</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
