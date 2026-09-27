import React from 'react';
import { Sparkles, Wrench, X, Layers, Compass, ArrowRight } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block">
                Feature Preview
              </span>
              <h3 className="text-base font-black tracking-tight">Level Editor: Coming Soon</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 text-slate-800 text-xs">
          {/* Blueprint Illustration Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-700 flex flex-col gap-2.5 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-10">
              <Compass className="w-24 h-24 text-cyan-400" />
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
              <Layers className="w-4 h-4" />
              <span>Architect's Drafting Kit</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed z-10">
              The custom level crafting suite is currently in active development. Pioneers will soon be able to:
            </p>
            <ul className="text-[10.5px] text-slate-300 space-y-1.5 z-10 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Sculpt custom hexagonal clearings & multi-phase expansions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Place custom Amber, Emerald, Sapphire & Ruby target zones</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Configure interactive 60° Turntable Rotation dials</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Design custom Mastery Challenges & share level codes</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10.5px]">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Stay tuned for the next major expedition update!</span>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Return to Home</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
