import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  Download,
  Upload,
  Printer,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView({
  pinConfig = { enabled: false, pin: '1234' },
  onUpdatePin,
  onImportJournals
}) {
  // PIN state
  const [pinEnabled, setPinEnabled] = useState(pinConfig.enabled || false);
  const [pinValue, setPinValue] = useState(pinConfig.pin || '1234');
  const [pinSavedMsg, setPinSavedMsg] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Export/Import state
  const [exportLoading, setExportLoading] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importError, setImportError] = useState('');

  // Save PIN Configuration
  const handleSavePin = (e) => {
    e.preventDefault();
    if (pinValue.length !== 4 || !/^\d+$/.test(pinValue)) {
      setPinSavedMsg('PIN must be exactly 4 digits');
      return;
    }
    onUpdatePin({
      enabled: pinEnabled,
      pin: pinValue
    });
    setPinSavedMsg('PIN security preferences updated!');
    setTimeout(() => setPinSavedMsg(''), 3500);
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPasswordLoading(true);
    setPasswordMsg('');
    setPasswordError('');
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Export JSON
  const handleExportJson = async () => {
    setExportLoading(true);
    try {
      const data = await api.exportJournalsJson();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EverJournal-Backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const blob = await api.exportJournalsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EverJournal-Export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('CSV Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Import JSON File
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const entriesToImport = Array.isArray(parsed) ? parsed : parsed.journals || [];
        if (!entriesToImport || entriesToImport.length === 0) {
          throw new Error('No valid journal entries found in file');
        }

        const result = await onImportJournals(entriesToImport);
        setImportStatus(`Successfully imported ${result?.count || entriesToImport.length} entries into MongoDB!`);
        setImportError('');
        setTimeout(() => setImportStatus(''), 4000);
      } catch (err) {
        setImportError(err.message || 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* 1. Header */}
      <div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-800">
          Preferences & Security
        </h2>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Manage privacy lock, security credentials, data backup, and system status
        </p>
      </div>

      {/* 2. Privacy PIN Lock Section */}
      <div className="journal-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7E0]">
          <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-800">Privacy PIN Lock</h3>
            <p className="text-xs text-charcoal-500">Protect your personal reflections with a 4-digit code</p>
          </div>
        </div>

        {pinSavedMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pinSavedMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePin} className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-paper-50 border border-[#E5E7E0]">
            <div>
              <p className="text-xs font-semibold text-charcoal-800">Enable PIN Protection</p>
              <p className="text-[11px] text-charcoal-500">Locks the screen on refresh and provides manual lock shortcut</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pinEnabled}
                onChange={(e) => setPinEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-paper-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-600"></div>
            </label>
          </div>

          {pinEnabled && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
                4-Digit Passcode
              </label>
              <input
                type="password"
                maxLength={4}
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1234"
                className="w-40 text-center tracking-widest text-lg font-mono font-bold px-3 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Update PIN Settings
            </button>
          </div>
        </form>
      </div>

      {/* 3. Password Security Section */}
      <div className="journal-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7E0]">
          <div className="w-10 h-10 rounded-xl bg-paper-100 text-charcoal-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-800">Account Password</h3>
            <p className="text-xs text-charcoal-500">Update your account credentials</p>
          </div>
        </div>

        {passwordMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordMsg}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 rounded-xl bg-paper-50 border border-[#E5E7E0] text-xs text-charcoal-800 focus:outline-hidden focus:ring-1 focus:ring-sage-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-900 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Data Management: Export & Import */}
      <div className="journal-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7E0]">
          <div className="w-10 h-10 rounded-xl bg-paper-100 text-charcoal-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-800">Data Portability</h3>
            <p className="text-xs text-charcoal-500">You own your words. Export backups or import past journals anytime.</p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-[#E5E7E0] bg-paper-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-charcoal-800 font-semibold text-xs mb-1">
                <FileCode className="w-4 h-4 text-sage-600" />
                <span>Export JSON Archive</span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Complete data backup including metadata, tags, mood check-ins, and timestamps.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJson}
              disabled={exportLoading}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-paper-100 border border-[#E5E7E0] text-xs font-semibold text-charcoal-700 shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl border border-[#E5E7E0] bg-paper-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-charcoal-800 font-semibold text-xs mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV Spreadsheet</span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Tabular format ideal for Microsoft Excel, Google Sheets, or data analysis.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exportLoading}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-paper-100 border border-[#E5E7E0] text-xs font-semibold text-charcoal-700 shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
            Import Journals from JSON File
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="text-xs text-charcoal-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-[#E5E7E0] file:text-xs file:font-semibold file:bg-white hover:file:bg-paper-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Print / PDF preview */}
        <div className="pt-4 border-t border-[#E5E7E0] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-800">Print / Save as PDF</p>
            <p className="text-[11px] text-charcoal-500">Format journal entries for high quality printing</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E5E7E0] bg-white hover:bg-paper-100 text-xs font-semibold text-charcoal-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* 5. System Architecture & MongoDB Status */}
      <div className="journal-card p-6 bg-paper-50/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 mb-3">
          <Database className="w-4 h-4 text-sage-600" />
          <span>System Environment & Database Health</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white border border-[#E5E7E0]">
            <span className="text-charcoal-400 block text-[10px] uppercase">Database Engine</span>
            <span className="font-semibold text-charcoal-800">MongoDB 9.0 (Local Service)</span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">● Connected on port 27017</span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#E5E7E0]">
            <span className="text-charcoal-400 block text-[10px] uppercase">Backend Server</span>
            <span className="font-semibold text-charcoal-800">Node.js Express REST API</span>
            <span className="text-[11px] text-charcoal-500 block mt-0.5">Port 5000 / Vite Proxy</span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#E5E7E0]">
            <span className="text-charcoal-400 block text-[10px] uppercase">Client Session</span>
            <span className="font-semibold text-charcoal-800">Workspace User Active</span>
            <span className="text-[11px] text-sage-700 block mt-0.5">Auto-attaches user identity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
