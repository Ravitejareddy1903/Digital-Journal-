import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';

export default function PinModal({ correctPin, onUnlock, onForgotPin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F7F2]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E7E0] p-6 shadow-xl text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-sage-50 text-sage-600 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-editorial text-2xl font-bold text-charcoal-800 mb-1">Journal Locked</h2>
        <p className="text-xs text-charcoal-500 mb-6">Enter your 4-digit PIN to access EverJournal</p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-shake'
                  : pin.length > idx
                  ? 'border-sage-600 bg-sage-600 scale-110'
                  : 'border-charcoal-200 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium mb-4 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Incorrect PIN, please try again
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              className="h-12 rounded-xl bg-paper-100 hover:bg-paper-200 text-charcoal-800 text-lg font-semibold active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-12 rounded-xl text-charcoal-500 hover:bg-paper-100 text-xs font-medium"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-paper-100 hover:bg-paper-200 text-charcoal-800 text-lg font-semibold active:scale-95 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl text-charcoal-500 hover:bg-paper-100 text-xs font-medium"
          >
            Delete
          </button>
        </div>

        {onForgotPin && (
          <button
            onClick={onForgotPin}
            className="text-xs text-charcoal-400 hover:text-charcoal-600 underline pt-2"
          >
            Reset / Forgot PIN
          </button>
        )}
      </div>
    </div>
  );
}
