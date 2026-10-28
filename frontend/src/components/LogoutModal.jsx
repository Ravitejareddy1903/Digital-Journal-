import React from 'react';
import { LogOut, Lock, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirmLock, onFullLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E5E7E0] p-6 max-w-sm w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-editorial text-lg font-bold text-charcoal-800">Exit EverJournal?</h3>
          <p className="text-xs text-charcoal-500 mt-1">
            All your journal entries and mood check-ins remain safely persisted in your local MongoDB database.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={onConfirmLock}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Journal Session</span>
          </button>
          <button
            onClick={onFullLogout}
            className="w-full px-4 py-2 rounded-xl border border-[#E5E7E0] hover:bg-paper-100 text-charcoal-600 text-xs font-medium transition-colors"
          >
            Clear Demo Token & Close
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-charcoal-400 hover:text-charcoal-600 pt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
