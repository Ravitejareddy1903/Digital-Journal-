import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { getMoodByLevel } from '../data/moods';

export default function CalendarView({
  journals = [],
  onSelectEntry,
  onNewEntryForDate
}) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };
  const jumpToToday = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Build calendar matrix
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group entries by date string YYYY-MM-DD
  const entriesByDate = {};
  journals.forEach((entry) => {
    const dStr = new Date(entry.createdAt || entry.date).toISOString().split('T')[0];
    if (!entriesByDate[dStr]) entriesByDate[dStr] = [];
    entriesByDate[dStr].push(entry);
  });

  // Selected date entries
  const selectedEntries = entriesByDate[selectedDateStr] || [];

  const monthName = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const selectedFormatted = new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">Journal Calendar</h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Browse through your daily memories and reflection cadence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl border border-[#E5E7E0] bg-white hover:bg-paper-100 text-charcoal-700 text-xs font-medium"
          >
            Today
          </button>
          <div className="flex items-center bg-white rounded-xl border border-[#E5E7E0] p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-paper-100"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-charcoal-800 min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-paper-100"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Selected Day Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 journal-card p-6">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold uppercase tracking-wider text-charcoal-400">
            {dayLabels.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[72px] rounded-xl bg-paper-50/30 border border-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              const entries = entriesByDate[dateStr] || [];
              const hasEntries = entries.length > 0;
              const topMood = hasEntries ? getMoodByLevel(entries[0].moodLevel || entries[0].mood) : null;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[76px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-sage-500 bg-sage-50/40 ring-2 ring-sage-400 shadow-2xs'
                      : 'border-[#E5E7E0] hover:border-sage-300 hover:bg-paper-50'
                  } ${isToday ? 'bg-paper-100/60 font-semibold' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-sage-600 text-white font-bold' : 'text-charcoal-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {topMood && <span className={`w-2 h-2 rounded-full ${topMood.dot}`} title={topMood.label} />}
                  </div>

                  {hasEntries && (
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-600" />
                        <span className="text-[10px] text-charcoal-600 font-medium truncate">
                          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel (1 col) */}
        <div className="journal-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7E0] mb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-600">Selected Date</span>
                <h3 className="font-editorial text-base font-bold text-charcoal-800 leading-snug">{selectedFormatted}</h3>
              </div>
              <button
                onClick={() => onNewEntryForDate(selectedDateStr)}
                className="p-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-medium shadow-xs"
                title="Write entry for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of entries for selected day */}
            {selectedEntries.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-charcoal-300 mx-auto" />
                <p className="text-xs text-charcoal-500">No journal entries recorded on this day.</p>
                <button
                  onClick={() => onNewEntryForDate(selectedDateStr)}
                  className="px-3.5 py-1.5 rounded-xl bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200 text-xs font-semibold transition-colors"
                >
                  + Add Entry For This Day
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEntries.map((entry) => {
                  const mood = getMoodByLevel(entry.moodLevel || entry.mood);
                  const time = new Date(entry.createdAt || entry.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={entry._id || entry.id}
                      onClick={() => onSelectEntry(entry)}
                      className="p-3 rounded-xl border border-[#E5E7E0] hover:border-sage-400 bg-paper-50/50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-charcoal-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {time}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${mood.badgeBg}`}>
                          {mood.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-charcoal-800 group-hover:text-sage-700 line-clamp-1 mb-1">
                        {entry.title || 'Untitled Entry'}
                      </h4>
                      <p className="text-xs text-charcoal-500 line-clamp-2">
                        {entry.content?.replace(/[#*`_]/g, '')}
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#E5E7E0] flex justify-between items-center text-[10px]">
                        <span className="px-1.5 py-0.5 rounded-sm bg-paper-200 text-charcoal-600">
                          {entry.category || 'Personal'}
                        </span>
                        <span className="text-sage-700 font-semibold group-hover:underline">Open →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E5E7E0] text-[11px] text-charcoal-400 text-center">
            Entries are synchronized with MongoDB Atlas / Local
          </div>
        </div>
      </div>
    </div>
  );
}
