import React from 'react';
import {
  BarChart3,
  Flame,
  BookOpen,
  FileText,
  Calendar,
  Smile,
  Tag,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { MOOD_LEVELS, getMoodByLevel } from '../data/moods';

export default function InsightsView({ journals = [], moods = [] }) {
  // Real Data Aggregations
  const totalEntries = journals.length;

  let totalWords = 0;
  const categoryCounts = {};
  const tagCounts = {};
  const dayOfWeekCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  journals.forEach((j) => {
    // Words
    const words = j.content ? j.content.trim().split(/\s+/).length : 0;
    totalWords += words;

    // Categories
    const cat = j.category || 'Personal';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Tags
    if (Array.isArray(j.tags)) {
      j.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }

    // Day of week
    const d = new Date(j.createdAt || j.date);
    dayOfWeekCounts[d.getDay()] = (dayOfWeekCounts[d.getDay()] || 0) + 1;
  });

  const avgWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

  // Most active day of week
  let maxDayCount = -1;
  let mostActiveDayIndex = 0;
  Object.keys(dayOfWeekCounts).forEach((idx) => {
    if (dayOfWeekCounts[idx] > maxDayCount) {
      maxDayCount = dayOfWeekCounts[idx];
      mostActiveDayIndex = parseInt(idx, 10);
    }
  });
  const mostActiveDay = totalEntries > 0 ? dayNames[mostActiveDayIndex] : 'Any day';

  // Streaks
  const datesSet = new Set(
    journals.map((j) => new Date(j.createdAt || j.date).toISOString().split('T')[0])
  );
  let currentStreak = 0;
  let checkDate = new Date();
  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (datesSet.has(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (currentStreak === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterday = checkDate.toISOString().split('T')[0];
      if (datesSet.has(yesterday)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Top Tags sorted
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Top Categories sorted
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. Header */}
      <div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">Writing Insights</h2>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Deep behavioral metrics and patterns calculated directly from your stored journal database
        </p>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Words */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Words</span>
            <FileText className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-editorial text-charcoal-800">
              {totalWords.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">~{avgWordsPerEntry} words per entry</p>
        </div>

        {/* Current Streak */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-editorial text-charcoal-800">
              {currentStreak}
            </span>
            <span className="text-xs text-charcoal-400">days active</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Keep the flame burning!</p>
        </div>

        {/* Peak Writing Day */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Peak Day</span>
            <Clock className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-editorial text-charcoal-800 truncate">
              {mostActiveDay}
            </span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Most reflections written</p>
        </div>

        {/* Total Entries */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stored Entries</span>
            <BookOpen className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-editorial text-charcoal-800">
              {totalEntries}
            </span>
            <span className="text-xs text-sage-700 bg-sage-50 px-1.5 py-0.5 rounded-md font-medium">MongoDB</span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Across all categories</p>
        </div>
      </div>

      {/* 3. Categories and Day of Week Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entries by Category */}
        <div className="journal-card p-6">
          <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1">Entries by Category</h3>
          <p className="text-xs text-charcoal-500 mb-6">Distribution of your journal topics</p>

          {sortedCategories.length === 0 ? (
            <p className="text-xs text-charcoal-400 italic py-6 text-center">No categories to display yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([cat, count]) => {
                const pct = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-charcoal-700">{cat}</span>
                      <span className="text-charcoal-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-paper-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sage-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day-of-Week Writing Activity */}
        <div className="journal-card p-6">
          <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1">Writing Rhythm</h3>
          <p className="text-xs text-charcoal-500 mb-6">Day-of-week entry creation patterns</p>

          <div className="grid grid-cols-7 gap-2 pt-4 items-end min-h-[160px]">
            {dayNames.map((name, idx) => {
              const count = dayOfWeekCounts[idx];
              const maxC = Math.max(1, ...Object.values(dayOfWeekCounts));
              const heightPct = Math.round((count / maxC) * 100);

              return (
                <div key={name} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-semibold text-charcoal-600">{count}</span>
                  <div
                    className="w-full max-w-[28px] rounded-t-lg bg-sage-500/20 hover:bg-sage-500 transition-colors"
                    style={{ height: `${Math.max(12, heightPct)}%` }}
                    title={`${name}: ${count} entries`}
                  />
                  <span className="text-[11px] font-medium text-charcoal-400">
                    {name.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Top Tags Cloud */}
      <div className="journal-card p-6">
        <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1 flex items-center gap-2">
          <Tag className="w-4 h-4 text-sage-600" />
          <span>Most Frequent Tags</span>
        </h3>
        <p className="text-xs text-charcoal-500 mb-4">Recurring themes and keywords across your journaling</p>

        {sortedTags.length === 0 ? (
          <p className="text-xs text-charcoal-400 italic py-4">No custom tags added yet. Add tags in the journal editor!</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {sortedTags.map(([tag, count]) => (
              <div
                key={tag}
                className="px-3 py-1.5 rounded-xl bg-paper-100 border border-[#E5E7E0] flex items-center gap-2 text-xs"
              >
                <span className="font-medium text-charcoal-800">#{tag}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-sage-50 text-sage-700 font-semibold text-[10px]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
