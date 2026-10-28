import React, { useState } from 'react';
import {
  Star,
  Pin,
  Search,
  BookOpen,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getMoodByLevel } from '../data/moods';

export default function FavoritesView({
  journals = [],
  onSelectEntry,
  onToggleFavorite,
  onTogglePin
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites' | 'pinned'
  const [searchQuery, setSearchQuery] = useState('');

  const savedEntries = journals.filter((j) => {
    if (activeTab === 'favorites') return j.isFavorite;
    if (activeTab === 'pinned') return j.isPinned;
    return j.isFavorite || j.isPinned;
  });

  const filteredEntries = savedEntries.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">
            Favorites & Pinned
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Your most meaningful thoughts, treasured reflections, and pinned priorities
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-paper-100 p-1 rounded-xl border border-[#E5E7E0] text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-white text-charcoal-900 shadow-2xs' : 'text-charcoal-500'
            }`}
          >
            All Saved
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'favorites' ? 'bg-white text-charcoal-900 shadow-2xs' : 'text-charcoal-500'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Favorites</span>
          </button>
          <button
            onClick={() => setActiveTab('pinned')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'pinned' ? 'bg-white text-charcoal-900 shadow-2xs' : 'text-charcoal-500'
            }`}
          >
            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Pinned</span>
          </button>
        </div>
      </div>

      {/* 2. Search */}
      <div className="journal-card p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through your starred and pinned entries..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
          />
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="journal-card p-12 text-center space-y-3">
          <Star className="w-8 h-8 text-charcoal-300 mx-auto" />
          <h3 className="font-editorial text-lg font-bold text-charcoal-800">No saved entries</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Click the star icon or pin button on any journal entry to bookmark it here for quick access.
          </p>
        </div>
      ) : (
        /* 4. Grid of Saved Entries */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((item) => {
            const mood = getMoodByLevel(item.moodLevel || item.mood);
            const dateStr = new Date(item.createdAt || item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={item._id || item.id}
                onClick={() => onSelectEntry(item)}
                className="journal-card p-5 flex flex-col justify-between hover:border-sage-300 transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-charcoal-400 font-medium">{dateStr}</span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onTogglePin(item._id || item.id)}
                        className={`p-1 rounded-md hover:bg-paper-200 transition-colors ${
                          item.isPinned ? 'text-amber-500' : 'text-charcoal-300'
                        }`}
                        title={item.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => onToggleFavorite(item._id || item.id)}
                        className={`p-1 rounded-md hover:bg-paper-200 transition-colors ${
                          item.isFavorite ? 'text-rose-500' : 'text-charcoal-300'
                        }`}
                        title="Remove from favorites"
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${mood.badgeBg}`}>
                        {mood.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-editorial text-lg font-bold text-charcoal-900 group-hover:text-sage-700 line-clamp-1 mb-2">
                    {item.title || 'Untitled Entry'}
                  </h3>
                  <p className="font-editorial text-xs text-charcoal-500 line-clamp-3 leading-relaxed mb-4">
                    {item.content?.replace(/[#*`_]/g, '') || 'No content.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E7E0] flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-paper-100 text-charcoal-600 font-medium">
                    {item.category || 'Personal'}
                  </span>
                  <span className="text-sage-700 font-semibold group-hover:underline flex items-center gap-1">
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
