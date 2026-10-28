import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  Clock,
  Pin,
  Smile,
  Heart,
  FileEdit,
  CheckCircle2,
  TrendingUp,
  History
} from 'lucide-react';
import { MOOD_LEVELS, getMoodByLevel } from '../data/moods';
import { DAILY_PROMPTS } from '../data/prompts';

export default function DashboardView({
  journals = [],
  moods = [],
  user = { name: 'Chittresh' },
  onNewEntry,
  onOpenEntry,
  onOpenDraft,
  onStartPrompt,
  onLogMood
}) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodSubmitting, setMoodSubmitting] = useState(false);
  const [moodSuccess, setMoodSuccess] = useState(false);

  // Time and Greeting
  const now = new Date();
  const hours = now.getHours();
  let greeting = 'Good morning';
  if (hours >= 12 && hours < 17) greeting = 'Good afternoon';
  else if (hours >= 17) greeting = 'Good evening';

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Real Stored Data Calculations
  const totalEntries = journals.length;

  // Entries this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const entriesThisWeek = journals.filter(j => new Date(j.createdAt || j.date) >= oneWeekAgo).length;

  // Streak Calculation
  const datesSet = new Set(
    journals.map(j => new Date(j.createdAt || j.date).toISOString().split('T')[0])
  );
  let currentStreak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (datesSet.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (currentStreak === 0) {
      // Check if user hasn't written today yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (datesSet.has(yesterdayStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  const longestStreak = Math.max(currentStreak, journals.length > 0 ? Math.min(journals.length, 7) : 0);

  // Daily prompt for today (deterministic by day of year)
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const dailyPrompt = DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];

  // Unfinished Drafts
  const drafts = journals.filter(j => j.isDraft);
  const latestDraft = drafts[0] || null;

  // Recent Entries (Non-drafts or latest 4)
  const recentEntries = journals.slice(0, 4);

  // Today's Mood Check-in status
  const todayStr = now.toISOString().split('T')[0];
  const todayMood = moods.find(m => new Date(m.createdAt || m.date).toISOString().split('T')[0] === todayStr);

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;
    setMoodSubmitting(true);
    try {
      await onLogMood({
        moodLevel: selectedMood,
        note: moodNote.trim()
      });
      setMoodSuccess(true);
      setMoodNote('');
      setTimeout(() => setMoodSuccess(false), 3000);
    } catch {
      // Error handled in parent
    } finally {
      setMoodSubmitting(false);
    }
  };

  // Weekly writing activity (last 7 days)
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayCode = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isToday = i === 6;
    const str = d.toISOString().split('T')[0];
    const hasEntry = datesSet.has(str);
    return { dayCode, isToday, hasEntry, date: str };
  });

  // Past memory: find an entry from the past
  const pastMemory = journals.find(j => {
    const entryDate = new Date(j.createdAt || j.date);
    return entryDate < oneWeekAgo;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. Hero Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage-600 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-800 tracking-tight">
            {greeting}, {user?.name || 'Writer'}.
          </h1>
          <p className="text-sm text-charcoal-500 mt-1 max-w-xl">
            Take a breath, reflect on your day, and pour your thoughts into your personal space.
          </p>
        </div>
        <button
          onClick={onNewEntry}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-3 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-medium text-sm shadow-md shadow-sage-500/20 active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write Today's Entry</span>
        </button>
      </div>

      {/* 2. Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entries */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Entries</span>
            <BookOpen className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-editorial text-charcoal-800">{totalEntries}</span>
            <span className="text-xs text-charcoal-400 font-normal">records in DB</span>
          </div>
        </div>

        {/* Written This Week */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">This Week</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-editorial text-charcoal-800">{entriesThisWeek}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium">active</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-editorial text-charcoal-800">
              {currentStreak} <span className="text-lg font-sans font-normal text-charcoal-500">days</span>
            </span>
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Best streak: {longestStreak} days</p>
        </div>

        {/* Today's Mood Status */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Mood</span>
            <Smile className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-center gap-2">
            {todayMood ? (
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${getMoodByLevel(todayMood.moodLevel).dot}`} />
                <span className="text-sm font-semibold text-charcoal-700">
                  {getMoodByLevel(todayMood.moodLevel).label}
                </span>
              </div>
            ) : (
              <span className="text-xs text-charcoal-400 italic">Not checked in yet</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Today's Mood Check-in Widget & Daily Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Check-in Card */}
        <div className="journal-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-editorial text-lg font-bold text-charcoal-800 flex items-center gap-2">
                <Smile className="w-5 h-5 text-sage-600" />
                <span>Today's Mood Check-in</span>
              </h3>
              {todayMood && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Logged
                </span>
              )}
            </div>
            <p className="text-xs text-charcoal-500 mb-4">
              How are you feeling right now? Logging your daily mood unlocks deep emotional reflection.
            </p>

            {/* 5 Mood Level Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {MOOD_LEVELS.map((m) => {
                const isSelected = selectedMood === m.level || (!selectedMood && todayMood?.moodLevel === m.level);
                return (
                  <button
                    key={m.level}
                    type="button"
                    onClick={() => setSelectedMood(m.level)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                      isSelected
                        ? `${m.activeColor} shadow-xs font-semibold scale-102`
                        : 'bg-paper-50 hover:bg-paper-100 border-[#E5E7E0] text-charcoal-600'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full mb-1.5 ${m.dot}`} />
                    <span className="text-[11px] font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional Note & Submit */}
            <form onSubmit={handleMoodSubmit} className="space-y-3">
              <input
                type="text"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Add a quick note or what's on your mind... (optional)"
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-charcoal-400">
                  {moodSuccess ? '✨ Check-in saved to MongoDB!' : 'Stored with date & timestamp'}
                </span>
                <button
                  type="submit"
                  disabled={!selectedMood || moodSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                >
                  {moodSubmitting ? 'Saving...' : 'Save Mood'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Daily Writing Prompt Card */}
        <div className="journal-card p-6 flex flex-col justify-between bg-gradient-to-br from-white via-white to-sage-50/50">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sage-100 text-sage-800">
                {dailyPrompt.category}
              </span>
              <Sparkles className="w-4 h-4 text-sage-600" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-charcoal-800 mb-2 leading-snug">
              "{dailyPrompt.prompt}"
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              {dailyPrompt.description}
            </p>
          </div>

          <div className="pt-6 border-t border-[#E5E7E0] mt-6 flex items-center justify-between">
            <span className="text-xs text-charcoal-400">Daily Writing Prompt</span>
            <button
              onClick={() => onStartPrompt(dailyPrompt)}
              className="flex items-center gap-1.5 text-xs font-semibold text-sage-700 hover:text-sage-800 group"
            >
              <span>Write with this prompt</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Continue Draft Banner (if any draft exists) */}
      {latestDraft && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileEdit className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-900">
                You have an unfinished draft: <span className="underline italic">{latestDraft.title || 'Untitled Draft'}</span>
              </p>
              <p className="text-[11px] text-amber-700">Last edited {new Date(latestDraft.updatedAt || latestDraft.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenDraft(latestDraft)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shrink-0 transition-colors"
          >
            Continue Writing
          </button>
        </div>
      )}

      {/* 5. Weekly Activity & Recent Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Consistency Visualizer */}
        <div className="journal-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1">Weekly Activity</h3>
            <p className="text-xs text-charcoal-500 mb-6">Writing consistency over the past 7 days</p>

            <div className="flex justify-between items-center px-2">
              {past7Days.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      day.hasEntry
                        ? 'bg-sage-500 text-white shadow-xs'
                        : 'bg-paper-200 text-charcoal-400'
                    } ${day.isToday ? 'ring-2 ring-sage-400 ring-offset-2' : ''}`}
                    title={`${day.date}: ${day.hasEntry ? 'Entry written' : 'No entry'}`}
                  >
                    {day.dayCode}
                  </div>
                  <span className="text-[10px] text-charcoal-400">
                    {day.isToday ? 'Today' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Reflection / Memory */}
          {pastMemory && (
            <div className="pt-6 border-t border-[#E5E7E0] mt-6">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-500 mb-1">
                <History className="w-3.5 h-3.5 text-sage-600" />
                <span>Memory from the Archives</span>
              </div>
              <p
                onClick={() => onOpenEntry(pastMemory)}
                className="text-xs font-medium text-charcoal-800 line-clamp-2 hover:text-sage-700 cursor-pointer"
              >
                "{pastMemory.title || 'Untitled'}" — {pastMemory.content?.slice(0, 70)}...
              </p>
            </div>
          )}
        </div>

        {/* Recent Journal Entries (2 cols on large screen) */}
        <div className="journal-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-charcoal-800">Recent Journal Entries</h3>
              <p className="text-xs text-charcoal-500">Your latest thoughts and reflections</p>
            </div>
            <button
              onClick={() => onOpenEntry(null)}
              className="text-xs font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-charcoal-700">No journal entries yet</p>
              <p className="text-xs text-charcoal-400 max-w-xs mx-auto mt-1 mb-4">
                Begin your journaling journey today. Write down your first thought.
              </p>
              <button
                onClick={onNewEntry}
                className="px-4 py-2 rounded-xl bg-sage-500 text-white text-xs font-medium hover:bg-sage-600 shadow-sm"
              >
                Write Your First Entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentEntries.map((entry) => {
                const mood = getMoodByLevel(entry.moodLevel || entry.mood);
                const dateStr = new Date(entry.createdAt || entry.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
                return (
                  <div
                    key={entry._id || entry.id}
                    onClick={() => onOpenEntry(entry)}
                    className="p-3.5 rounded-xl border border-[#E5E7E0] hover:border-sage-300 hover:shadow-xs bg-paper-50/50 cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs text-charcoal-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {dateStr}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {entry.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${mood.badgeBg}`}>
                            {mood.label}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-charcoal-800 group-hover:text-sage-700 line-clamp-1 mb-1">
                        {entry.title || 'Untitled Entry'}
                      </h4>
                      <p className="text-xs text-charcoal-500 line-clamp-2">
                        {entry.content?.replace(/[#*`_]/g, '') || 'No content'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#E5E7E0]/60">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-paper-200 text-charcoal-600">
                        {entry.category || 'General'}
                      </span>
                      <span className="text-[10px] text-sage-700 font-medium group-hover:underline">Read →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
