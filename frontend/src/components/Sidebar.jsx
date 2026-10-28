import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Smile,
  BarChart3,
  Sparkles,
  Star,
  User,
  Settings,
  LogOut,
  Feather,
  Database,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  dbConnected = true,
  entryCount = 0,
  onLogoutClick
}) {
  const primaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'My Journal', icon: BookOpen, badge: entryCount > 0 ? entryCount : null },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'mood', label: 'Mood Tracker', icon: Smile },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'prompts', label: 'Daily Prompts', icon: Sparkles },
    { id: 'favorites', label: 'Favorites', icon: Star },
  ];

  const bottomNav = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 journal-sidebar flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E5E7E0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-500 flex items-center justify-center text-white shadow-sm shadow-sage-500/20">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-editorial text-xl font-bold tracking-tight text-charcoal-800">EverJournal</h1>
              <p className="text-[11px] font-medium tracking-wide uppercase text-sage-600">Personal Sanctuary</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation (1-7) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-charcoal-400 uppercase">
            Journaling
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sage-500/10 text-sage-700 font-semibold shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-paper-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sage-600' : 'text-charcoal-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-paper-200 text-charcoal-600 font-normal">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation (8-10) */}
        <div className="p-3 border-t border-[#E5E7E0] space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-charcoal-400 uppercase">
            Account & Preferences
          </div>
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sage-500/10 text-sage-700 font-semibold'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-paper-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sage-600' : 'text-charcoal-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* 10. Log Out */}
          <button
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Log out</span>
          </button>

          {/* System & MongoDB Status Indicator */}
          <div className="pt-2">
            <div className="px-3 py-2 rounded-lg bg-paper-100 border border-[#E5E7E0] flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-charcoal-600 font-medium">
                <Database className="w-3.5 h-3.5 text-sage-600" />
                MongoDB 9.0
              </span>
              <span className="flex items-center gap-1 text-sage-700 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {dbConnected ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
