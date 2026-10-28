export const MOOD_LEVELS = [
  {
    level: 1,
    label: "Very low",
    dot: "bg-rose-500",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    activeColor: "bg-rose-100 text-rose-800 ring-2 ring-rose-500",
    badgeBg: "bg-rose-50 text-rose-700 border border-rose-200",
    barColor: "#F43F5E",
    description: "Feeling overwhelmed, exhausted, or down"
  },
  {
    level: 2,
    label: "Low",
    dot: "bg-amber-500",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    activeColor: "bg-amber-100 text-amber-800 ring-2 ring-amber-500",
    badgeBg: "bg-amber-50 text-amber-700 border border-amber-200",
    barColor: "#F59E0B",
    description: "Somewhat tired, stressed, or unsettled"
  },
  {
    level: 3,
    label: "Okay",
    dot: "bg-slate-400",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    activeColor: "bg-slate-100 text-slate-800 ring-2 ring-slate-500",
    badgeBg: "bg-slate-50 text-slate-700 border border-slate-200",
    barColor: "#64748B",
    description: "Balanced, neutral, steady day"
  },
  {
    level: 4,
    label: "Good",
    dot: "bg-emerald-500",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    activeColor: "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    barColor: "#10B981",
    description: "Positive, engaged, and calm"
  },
  {
    level: 5,
    label: "Great",
    dot: "bg-sage-600",
    color: "bg-sage-50 text-sage-800 border-sage-200",
    activeColor: "bg-sage-100 text-sage-900 ring-2 ring-sage-600",
    badgeBg: "bg-sage-50 text-sage-800 border border-sage-200",
    barColor: "#526B55",
    description: "Energized, joyful, and inspired"
  }
];

export const getMoodByLevel = (level) => {
  const num = parseInt(level, 10);
  return MOOD_LEVELS.find(m => m.level === num) || MOOD_LEVELS[2];
};
