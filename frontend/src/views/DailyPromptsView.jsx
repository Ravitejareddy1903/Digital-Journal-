import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shuffle,
  Star,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { DAILY_PROMPTS, PROMPT_CATEGORIES } from '../data/prompts';

export default function DailyPromptsView({ onStartWritingFromPrompt }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [favoritePromptIds, setFavoritePromptIds] = useState([]);

  const toggleFavoritePrompt = (id) => {
    if (favoritePromptIds.includes(id)) {
      setFavoritePromptIds(favoritePromptIds.filter((pId) => pId !== id));
    } else {
      setFavoritePromptIds([...favoritePromptIds, id]);
    }
  };

  const shuffleFeaturedPrompt = () => {
    const nextIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
    setFeaturedIndex(nextIndex);
  };

  const featured = DAILY_PROMPTS[featuredIndex] || DAILY_PROMPTS[0];

  const filteredPrompts = DAILY_PROMPTS.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">Daily Prompts</h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Curated writing inspirations to unlock insight, gratitude, and creativity
          </p>
        </div>

        <button
          onClick={shuffleFeaturedPrompt}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-paper-100 border border-[#E5E7E0] text-xs font-semibold text-charcoal-700 transition-colors shadow-2xs"
        >
          <Shuffle className="w-3.5 h-3.5 text-sage-600" />
          <span>Surprise Me</span>
        </button>
      </div>

      {/* 2. Featured Prompt Spotlight Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white via-white to-sage-50/70 border border-[#E5E7E0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sage-500 text-white shadow-2xs">
              Featured Today
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-paper-200 text-charcoal-700">
              {featured.category}
            </span>
          </div>

          <button
            onClick={() => toggleFavoritePrompt(featured.id)}
            className="p-2 rounded-xl border border-[#E5E7E0] hover:bg-paper-100 text-charcoal-400 hover:text-rose-500 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                favoritePromptIds.includes(featured.id) ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        </div>

        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 leading-snug">
          "{featured.prompt}"
        </h3>

        <p className="text-sm text-charcoal-600 max-w-2xl leading-relaxed">
          {featured.description}
        </p>

        <div className="pt-4 flex items-center justify-between">
          <span className="text-xs text-charcoal-400">Takes ~5 minutes to reflect & write</span>
          <button
            onClick={() => onStartWritingFromPrompt(featured)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Write with this prompt</span>
          </button>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {PROMPT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-sage-500 text-white shadow-2xs'
                : 'bg-white hover:bg-paper-100 text-charcoal-600 border border-[#E5E7E0]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((p) => {
          const isFav = favoritePromptIds.includes(p.id);
          return (
            <div
              key={p.id}
              className="journal-card p-5 flex flex-col justify-between hover:border-sage-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-sage-700 bg-sage-50 px-2.5 py-0.5 rounded-full">
                    {p.category}
                  </span>
                  <button
                    onClick={() => toggleFavoritePrompt(p.id)}
                    className="p-1 rounded-md text-charcoal-300 hover:text-rose-500 transition-colors"
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
                <h4 className="font-editorial text-base font-bold text-charcoal-800 group-hover:text-sage-700 mb-2 leading-snug">
                  {p.prompt}
                </h4>
                <p className="text-xs text-charcoal-500 leading-relaxed mb-4">
                  {p.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E7E0] flex items-center justify-between">
                <span className="text-[10px] text-charcoal-400">Writing cue</span>
                <button
                  onClick={() => onStartWritingFromPrompt(p)}
                  className="flex items-center gap-1 text-xs font-semibold text-sage-700 hover:text-sage-800"
                >
                  <span>Start Entry</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
