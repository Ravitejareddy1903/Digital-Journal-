import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Settings,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Header({
  activeTab,
  onNewEntry,
  onSearchOpen,
  onLockClick,
  pinEnabled = false,
  saveStatus = 'saved', // 'saved' | 'saving' | 'error'
  user = { name: 'Chittresh', email: 'user@aurajournal.com' },
  setMobileOpen,
  setActiveTab
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'journal': return 'My Journal Entries';
      case 'calendar': return 'Journal Calendar';
      case 'mood': return 'Daily Mood Tracker';
      case 'insights': return 'Writing Insights & Trends';
      case 'prompts': return 'Daily Writing Prompts';
      case 'favorites': return 'Favorites & Pinned';
      case 'profile': return 'User Profile';
      case 'settings': return 'Preferences & Security';
      default: return 'EverJournal';
    }
  };

  return (
    <header className="journal-header sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-paper-200 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-medium text-charcoal-400 hidden sm:inline">EverJournal / </span>
          <span className="text-sm sm:text-base font-semibold text-charcoal-800">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-paper-100 hover:bg-paper-200 border border-[#E5E7E0] text-charcoal-400 text-sm transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-600" />
            <span className="text-xs font-normal">Search journals, prompts, tags...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white text-charcoal-500 border border-[#E5E7E0] shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Sync status, Lock, New Entry, Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Real-time MongoDB Persistence Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[#E5E7E0] bg-white text-charcoal-600">
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span className="text-amber-700">Saving...</span>
            </>
          ) : saveStatus === 'error' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-rose-700">Sync issue</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span className="text-sage-700">Synced to DB</span>
            </>
          )}
        </div>

        {/* Lock Session (if PIN lock is enabled) */}
        {pinEnabled && (
          <button
            onClick={onLockClick}
            className="p-2 rounded-xl text-charcoal-500 hover:text-charcoal-800 hover:bg-paper-200 border border-transparent hover:border-[#E5E7E0] transition-colors"
            title="Lock Journal with PIN"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Prominent New Entry CTA */}
        <button
          onClick={onNewEntry}
          className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-sm font-medium shadow-sm shadow-sage-500/20 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden">Write</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-paper-200 border border-transparent hover:border-[#E5E7E0] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-sage-500/15 text-sage-700 flex items-center justify-center font-bold text-xs ring-1 ring-sage-500/30">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CJ'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5E7E0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#E5E7E0]">
                <p className="text-xs font-semibold text-charcoal-800 truncate">{user?.name || 'Chittresh'}</p>
                <p className="text-[11px] text-charcoal-500 truncate">{user?.email || 'user@aurajournal.com'}</p>
              </div>
              <button
                onClick={() => { setActiveTab('profile'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-paper-100 transition-colors"
              >
                <User className="w-4 h-4 text-charcoal-400" />
                Profile Details
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-paper-100 transition-colors"
              >
                <Settings className="w-4 h-4 text-charcoal-400" />
                Settings & PIN
              </button>
              <div className="px-4 py-1.5 border-t border-[#E5E7E0] mt-1 text-[10px] text-charcoal-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
                <span>MongoDB Protected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
