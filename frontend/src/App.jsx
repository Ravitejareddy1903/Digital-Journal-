import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PinModal from './components/PinModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import LogoutModal from './components/LogoutModal';

// Views
import DashboardView from './views/DashboardView';
import JournalView from './views/JournalView';
import CalendarView from './views/CalendarView';
import MoodTrackerView from './views/MoodTrackerView';
import InsightsView from './views/InsightsView';
import DailyPromptsView from './views/DailyPromptsView';
import FavoritesView from './views/FavoritesView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';

import { api } from './services/api';
import { DAILY_PROMPTS } from './data/prompts';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [journalMode, setJournalMode] = useState('list'); // 'list' | 'edit' | 'read'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [initialDraft, setInitialDraft] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Data state
  const [journals, setJournals] = useState([]);
  const [moods, setMoods] = useState([]);
  const [user, setUser] = useState({ name: 'Chittresh', email: 'user@aurajournal.com' });
  const [dbConnected, setDbConnected] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [loading, setLoading] = useState(true);

  // PIN security lock state
  const [pinConfig, setPinConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('everjournal_pin');
      return stored ? JSON.parse(stored) : { enabled: false, pin: '1234' };
    } catch {
      return { enabled: false, pin: '1234' };
    }
  });

  const [isLocked, setIsLocked] = useState(() => {
    try {
      const stored = localStorage.getItem('everjournal_pin');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.enabled === true;
      }
    } catch {}
    return false;
  });

  // Load Initial Data from Backend (MongoDB 9.0)
  const fetchData = useCallback(async () => {
    try {
      const [journalsRes, moodsRes, profileRes] = await Promise.allSettled([
        api.getJournals(),
        api.getMoods(),
        api.getProfile()
      ]);

      if (journalsRes.status === 'fulfilled' && journalsRes.value) {
        const data = Array.isArray(journalsRes.value)
          ? journalsRes.value
          : journalsRes.value.data || journalsRes.value.journals || [];
        setJournals(data);
        setDbConnected(true);
      } else {
        setDbConnected(false);
      }

      if (moodsRes.status === 'fulfilled' && moodsRes.value) {
        const mData = Array.isArray(moodsRes.value)
          ? moodsRes.value
          : moodsRes.value.data || moodsRes.value.moods || [];
        setMoods(mData);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setUser(profileRes.value.user || profileRes.value);
      }
    } catch (err) {
      console.error('Initial data fetch error:', err);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Global Keyboard Shortcuts (Ctrl+K for search)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save / Update Journal Entry (with debounce status & confetti on new non-draft saves)
  const handleSaveEntry = async (entryData, isAutosave = false) => {
    setSaveStatus('saving');
    try {
      let savedResult;
      const isNew = !entryData._id;

      if (isNew) {
        const res = await api.createJournal(entryData);
        savedResult = res.data || res;
        setJournals((prev) => [savedResult, ...prev]);

        // Celebrate meaningful new entry save with subtle confetti!
        if (!isAutosave && !entryData.isDraft) {
          confetti({
            particleCount: 40,
            spread: 55,
            origin: { y: 0.7 },
            colors: ['#526B55', '#A7BCA9', '#E5EBE5']
          });
        }
      } else {
        const res = await api.updateJournal(entryData._id, entryData);
        savedResult = res.data || res;
        setJournals((prev) =>
          prev.map((item) => ((item._id || item.id) === entryData._id ? savedResult : item))
        );
      }

      setSaveStatus('saved');
      setDbConnected(true);
      return savedResult;
    } catch (err) {
      console.error('Failed to save journal:', err);
      setSaveStatus('error');
      throw err;
    }
  };

  // Delete Journal Entry
  const handleDeleteEntry = async (id) => {
    try {
      await api.deleteJournal(id);
      setJournals((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (selectedEntry && (selectedEntry._id || selectedEntry.id) === id) {
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete entry: ' + err.message);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id) => {
    try {
      const res = await api.toggleFavorite(id);
      const updated = res.data || res;
      setJournals((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? updated : item))
      );
      if (selectedEntry && (selectedEntry._id || selectedEntry.id) === id) {
        setSelectedEntry(updated);
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id) => {
    try {
      const res = await api.togglePin(id);
      const updated = res.data || res;
      setJournals((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? updated : item))
      );
      if (selectedEntry && (selectedEntry._id || selectedEntry.id) === id) {
        setSelectedEntry(updated);
      }
    } catch (err) {
      console.error('Pin error:', err);
    }
  };

  // Log Mood Check-in
  const handleLogMood = async (moodData) => {
    try {
      const res = await api.createMood(moodData);
      const created = res.data || res;
      setMoods((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Mood error:', err);
      throw err;
    }
  };

  // Delete Mood Check-in
  const handleDeleteMood = async (id) => {
    try {
      await api.deleteMood(id);
      setMoods((prev) => prev.filter((m) => (m._id || m.id) !== id));
    } catch (err) {
      console.error('Delete mood error:', err);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (profileData) => {
    const updated = await api.updateProfile(profileData);
    setUser(updated.user || updated);
    return updated;
  };

  // Import Journals
  const handleImportJournals = async (importList) => {
    const res = await api.importJournals(importList);
    await fetchData();
    return res;
  };

  // Update PIN configuration
  const handleUpdatePin = (newConfig) => {
    setPinConfig(newConfig);
    localStorage.setItem('everjournal_pin', JSON.stringify(newConfig));
  };

  // Actions for Prompts and Drafts
  const handleStartPrompt = (promptItem) => {
    setSelectedEntry(null);
    setInitialDraft({
      title: promptItem.prompt,
      content: `> ${promptItem.description}\n\n`,
      category: promptItem.category === 'All' ? 'Reflection' : promptItem.category
    });
    setActiveTab('journal');
    setJournalMode('edit');
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setInitialDraft(null);
    setActiveTab('journal');
    setJournalMode('edit');
  };

  const handleOpenEntry = (entry) => {
    if (!entry) {
      setActiveTab('journal');
      setJournalMode('list');
      return;
    }
    setSelectedEntry(entry);
    setActiveTab('journal');
    setJournalMode('read');
  };

  const handleOpenDraft = (draft) => {
    setSelectedEntry(draft);
    setActiveTab('journal');
    setJournalMode('edit');
  };

  const handleNewEntryForDate = (dateStr) => {
    setSelectedEntry(null);
    setInitialDraft({
      title: '',
      content: '',
      date: `${dateStr}T12:00:00`
    });
    setActiveTab('journal');
    setJournalMode('edit');
  };

  // Unlock from PIN screen
  const handleUnlock = () => {
    setIsLocked(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-charcoal-800 flex flex-col font-sans">
      {/* 1. PIN Security Modal (Screen Lock) */}
      {isLocked && (
        <PinModal
          correctPin={pinConfig.pin || '1234'}
          onUnlock={handleUnlock}
          onForgotPin={() => {
            if (window.confirm('Reset PIN lock protection?')) {
              handleUpdatePin({ enabled: false, pin: '1234' });
              setIsLocked(false);
            }
          }}
        />
      )}

      {/* 2. Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        entries={journals}
        prompts={DAILY_PROMPTS}
        onSelectEntry={(entry) => {
          setSelectedEntry(entry);
          setActiveTab('journal');
          setJournalMode('read');
        }}
        onSelectPrompt={(prompt) => handleStartPrompt(prompt)}
      />

      {/* 3. Log out Confirmation Modal */}
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirmLock={() => {
          setLogoutOpen(false);
          setIsLocked(true);
        }}
        onFullLogout={() => {
          localStorage.removeItem('token');
          setLogoutOpen(false);
          setIsLocked(true);
        }}
      />

      {/* 4. Left Sidebar (Fixed / Responsive Drawer with exactly 10 navigation items) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'journal' && journalMode !== 'list' && !selectedEntry) {
            setJournalMode('list');
          }
        }}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        dbConnected={dbConnected}
        entryCount={journals.length}
        onLogoutClick={() => setLogoutOpen(true)}
      />

      {/* 5. Main Content Shell */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onNewEntry={handleNewEntry}
          onSearchOpen={() => setSearchOpen(true)}
          onLockClick={() => setIsLocked(true)}
          pinEnabled={pinConfig.enabled}
          saveStatus={saveStatus}
          user={user}
          setMobileOpen={setMobileOpen}
          setActiveTab={setActiveTab}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              journals={journals}
              moods={moods}
              user={user}
              onNewEntry={handleNewEntry}
              onOpenEntry={handleOpenEntry}
              onOpenDraft={handleOpenDraft}
              onStartPrompt={handleStartPrompt}
              onLogMood={handleLogMood}
            />
          )}

          {activeTab === 'journal' && (
            <JournalView
              journals={journals}
              currentEntry={selectedEntry}
              mode={journalMode}
              setMode={setJournalMode}
              onSaveEntry={handleSaveEntry}
              onDeleteEntry={handleDeleteEntry}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              saveStatus={saveStatus}
              initialDraft={initialDraft}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              journals={journals}
              onSelectEntry={handleOpenEntry}
              onNewEntryForDate={handleNewEntryForDate}
            />
          )}

          {activeTab === 'mood' && (
            <MoodTrackerView
              moods={moods}
              journals={journals}
              onLogMood={handleLogMood}
              onDeleteMood={handleDeleteMood}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView journals={journals} moods={moods} />
          )}

          {activeTab === 'prompts' && (
            <DailyPromptsView onStartWritingFromPrompt={handleStartPrompt} />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              journals={journals}
              onSelectEntry={handleOpenEntry}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView user={user} onUpdateProfile={handleUpdateProfile} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              pinConfig={pinConfig}
              onUpdatePin={handleUpdatePin}
              onImportJournals={handleImportJournals}
            />
          )}
        </main>
      </div>
    </div>
  );
}
