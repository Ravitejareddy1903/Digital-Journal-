import React, { useState } from 'react';
import {
  Smile,
  Calendar,
  Clock,
  TrendingUp,
  Trash2,
  CheckCircle2,
  Heart,
  BarChart2,
  FileText
} from 'lucide-react';
import { MOOD_LEVELS, getMoodByLevel } from '../data/moods';

export default function MoodTrackerView({
  moods = [],
  journals = [],
  onLogMood,
  onDeleteMood
}) {
  const [selectedLevel, setSelectedLevel] = useState(4);
  const [note, setNote] = useState('');
  const [linkedJournalId, setLinkedJournalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Statistics calculation
  const totalCount = moods.length;
  const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalScore = 0;

  moods.forEach((m) => {
    const lvl = parseInt(m.moodLevel, 10);
    if (moodCounts[lvl] !== undefined) {
      moodCounts[lvl]++;
      totalScore += lvl;
    }
  });

  const averageScore = totalCount > 0 ? (totalScore / totalCount).toFixed(1) : '5.0';

  // Find most common mood
  let maxCount = -1;
  let dominantLevel = 4;
  Object.keys(moodCounts).forEach((lvl) => {
    if (moodCounts[lvl] > maxCount) {
      maxCount = moodCounts[lvl];
      dominantLevel = parseInt(lvl, 10);
    }
  });
  const dominantMood = getMoodByLevel(dominantLevel);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onLogMood({
        moodLevel: selectedLevel,
        note: note.trim(),
        journalId: linkedJournalId || undefined
      });
      setSuccessMsg('✨ Mood check-in logged to MongoDB!');
      setNote('');
      setLinkedJournalId('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      // error handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. Header */}
      <div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">Mood Tracker</h2>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Monitor your emotional well-being across 5 core states and discover self-awareness trends
        </p>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Average Score */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Mood Score</span>
            <TrendingUp className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-editorial text-charcoal-800">{averageScore}</span>
            <span className="text-xs text-charcoal-400 font-medium">/ 5.0 scale</span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Calculated across {totalCount} check-ins</p>
        </div>

        {/* Dominant Mood */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dominant State</span>
            <Smile className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`w-3.5 h-3.5 rounded-full ${dominantMood.dot}`} />
            <div>
              <span className="text-lg font-bold font-editorial text-charcoal-800">{dominantMood.label}</span>
              <p className="text-[11px] text-charcoal-500">{maxCount > 0 ? `${maxCount} days logged` : 'No data yet'}</p>
            </div>
          </div>
        </div>

        {/* Total Check-ins */}
        <div className="journal-card p-5">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Check-ins</span>
            <BarChart2 className="w-4 h-4 text-sage-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-editorial text-charcoal-800">{totalCount}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium">Logged in DB</span>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Synced with local MongoDB collection</p>
        </div>
      </div>

      {/* 3. Check-in Form & Mood Distribution Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Form */}
        <div className="journal-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-editorial text-lg font-bold text-charcoal-800 flex items-center gap-2">
              <Smile className="w-5 h-5 text-sage-600" />
              <span>Log Mood Check-in</span>
            </h3>
            {successMsg && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 5-Level Mood Select */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 mb-2">
                Select Your Mood
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_LEVELS.map((m) => {
                  const isSelected = selectedLevel === m.level;
                  return (
                    <button
                      key={m.level}
                      type="button"
                      onClick={() => setSelectedLevel(m.level)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        isSelected
                          ? `${m.activeColor} shadow-xs font-semibold scale-102`
                          : 'bg-paper-50 hover:bg-paper-100 border-[#E5E7E0] text-charcoal-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full mb-1.5 ${m.dot}`} />
                      <span className="text-xs font-semibold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflection Note */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
                Reflection Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What factors influenced this mood today?"
                rows={3}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-paper-50 border border-[#E5E7E0] text-charcoal-800 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
            </div>

            {/* Optional Journal Entry Association */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 mb-1">
                Link to Journal Reflection (Optional)
              </label>
              <select
                value={linkedJournalId}
                onChange={(e) => setLinkedJournalId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-charcoal-700 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              >
                <option value="">None / Standalone Check-in</option>
                {journals.slice(0, 10).map((j) => (
                  <option key={j._id || j.id} value={j._id || j.id}>
                    {j.title || 'Untitled Entry'} ({new Date(j.createdAt || j.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {isSubmitting ? 'Recording...' : 'Record Check-in'}
              </button>
            </div>
          </form>
        </div>

        {/* Distribution Breakdown Chart */}
        <div className="journal-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1">Mood Distribution</h3>
            <p className="text-xs text-charcoal-500 mb-6">Percentage breakdown of each emotional level</p>

            <div className="space-y-4">
              {MOOD_LEVELS.slice().reverse().map((m) => {
                const count = moodCounts[m.level] || 0;
                const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

                return (
                  <div key={m.level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                        <span className="font-semibold text-charcoal-700">{m.label}</span>
                      </div>
                      <span className="text-charcoal-500 font-medium">{count} ({percentage}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-paper-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: m.barColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5E7E0] mt-6 text-xs text-charcoal-400">
            Higher ratings correspond to energizing and calm emotional balance.
          </div>
        </div>
      </div>

      {/* 4. Historical Mood Timeline */}
      <div className="journal-card p-6">
        <h3 className="font-editorial text-lg font-bold text-charcoal-800 mb-1">Mood History & Log</h3>
        <p className="text-xs text-charcoal-500 mb-4">Historical record of all mood check-ins</p>

        {moods.length === 0 ? (
          <div className="py-8 text-center text-xs text-charcoal-400 italic">
            No mood check-ins logged yet. Use the form above to record today's state!
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7E0]">
            {moods.map((m) => {
              const moodObj = getMoodByLevel(m.moodLevel);
              const dateFormatted = new Date(m.createdAt || m.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const timeFormatted = new Date(m.createdAt || m.date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={m._id || m.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${moodObj.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-charcoal-800">{moodObj.label}</span>
                        <span className="text-[11px] text-charcoal-400">
                          {dateFormatted} at {timeFormatted}
                        </span>
                      </div>
                      {m.note && (
                        <p className="text-xs text-charcoal-600 mt-0.5">{m.note}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMood(m._id || m.id)}
                    className="p-1.5 rounded-lg text-charcoal-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Check-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
