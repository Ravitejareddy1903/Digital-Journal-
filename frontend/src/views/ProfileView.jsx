import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Target, Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfileView({ user, onUpdateProfile }) {
  const [name, setName] = useState(user?.name || 'Chittresh');
  const [email, setEmail] = useState(user?.email || 'user@aurajournal.com');
  const [bio, setBio] = useState(user?.bio || 'Documenting daily growth, clarity, and mind observations.');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC+05:30 (Asia/Kolkata)');
  const [dailyWordGoal, setDailyWordGoal] = useState(user?.dailyWordGoal || 300);
  const [defaultCategory, setDefaultCategory] = useState(user?.preferences?.defaultCategory || 'Personal');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.bio) setBio(user.bio);
      if (user.timezone) setTimezone(user.timezone);
      if (user.dailyWordGoal) setDailyWordGoal(user.dailyWordGoal);
      if (user.preferences?.defaultCategory) setDefaultCategory(user.preferences.defaultCategory);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await onUpdateProfile({
        name,
        bio,
        timezone,
        dailyWordGoal: parseInt(dailyWordGoal, 10) || 300,
        preferences: {
          defaultCategory
        }
      });
      setMessage('Profile updated successfully in MongoDB!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">User Profile</h2>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Manage your personal identity, journaling goals, and timezone preferences
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="journal-card p-6 sm:p-8 space-y-6">
        {/* Avatar Display */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#E5E7E0]">
          <div className="w-16 h-16 rounded-2xl bg-sage-500 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-sage-500/30">
            {name ? name.slice(0, 2).toUpperCase() : 'EJ'}
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-800">{name || 'Your Name'}</h3>
            <p className="text-xs text-charcoal-500">{email}</p>
            <span className="inline-block mt-1 text-[11px] font-medium text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200">
              Personal Journal Owner
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-paper-100 border border-[#E5E7E0] text-xs text-charcoal-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
              Journaling Intention / Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Why do you write? What brings you clarity?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
                Timezone
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
                Daily Word Target
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={dailyWordGoal}
                  onChange={(e) => setDailyWordGoal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
              Default Category for New Entries
            </label>
            <div className="relative">
              <Bookmark className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              >
                <option value="Personal">Personal</option>
                <option value="Reflection">Reflection</option>
                <option value="Gratitude">Gratitude</option>
                <option value="Growth & Goals">Growth & Goals</option>
                <option value="Work & Projects">Work & Projects</option>
                <option value="Ideas & Notes">Ideas & Notes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E5E7E0] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
