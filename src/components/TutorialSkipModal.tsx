import React from 'react';
import { Compass, BookOpen, FastForward, Sparkles } from 'lucide-react';

interface TutorialSkipModalProps {
  isOpen: boolean;
  onStartTutorial: () => void;
  onSkipToLevel4: () => void;
}

export const TutorialSkipModal: React.FC<TutorialSkipModalProps> = ({
  isOpen,
  onStartTutorial,
  onSkipToLevel4,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl max-w-lg w-full shadow-2xl border-2 border-amber-300 p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/30">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Frontier Onboarding</span>
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Welcome, Pioneer!
        </h2>

        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          Do you already know the hexagon placement and color harmony mechanics, or would you like a guided step-by-step tutorial?
        </p>

        {/* Action Choice Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={onStartTutorial}
            className="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center gap-2 text-center transition-all cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm text-slate-900 block">
                Start Tutorial
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                Guided walkthrough through Levels 1, 2, and 3.
              </span>
            </div>
          </button>

          <button
            onClick={onSkipToLevel4}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white flex flex-col items-center gap-2 text-center transition-all cursor-pointer group shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm block">
                I Know the Rules!
              </span>
              <span className="text-[11px] text-amber-100 block leading-tight mt-0.5">
                Skip straight to Level 4 (Whispering Glade).
              </span>
            </div>
          </button>
        </div>

        <span className="text-[10px] text-slate-400">
          You can replay any previous tutorial levels at any time from the level selector.
        </span>
      </div>
    </div>
  );
};
