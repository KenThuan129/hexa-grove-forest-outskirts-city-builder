// src/components/GuestWelcomeModal.tsx

import React from 'react';
import { Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GuestWelcomeModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onSignIn: () => void;
}

export const GuestWelcomeModal: React.FC<GuestWelcomeModalProps> = ({
  isOpen,
  onContinue,
  onSignIn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300 select-none font-sans">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-cyan-400">
              Welcome to
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Hành trình rực rỡ:
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                HexaLog
              </span>
            </h1>
          </div>

          {/* Body */}
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            This demo lets you try{' '}
            <strong className="text-cyan-300 font-black">5 different levels</strong>{' '}
            through different ways to play. Sign in to unlock all{' '}
            <strong className="text-emerald-300 font-black">40 levels</strong> and
            explore the full journey.
          </p>

          {/* Trial pills */}
          <div className="flex items-center gap-1.5 mt-1">
            {[5, 10, 16, 20, 23].map((id) => (
              <span
                key={id}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-slate-400"
                title={`Trial Level ${id}`}
              >
                {id}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="relative z-10 flex flex-col gap-2 mt-6">
          <button
            onClick={() => {
              sounds.playVictory();
              onSignIn();
            }}
            className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Unlock All</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onContinue();
            }}
            className="w-full py-2.5 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>

        {/* Footnote */}
        <p className="relative z-10 text-[10px] text-slate-500 text-center mt-3 font-serif italic">
          The sanctuary awaits, young pioneer.
        </p>
      </div>
    </div>
  );
};

export default GuestWelcomeModal;