import React from 'react';
import { AlertTriangle, Sparkles, Copy, Layers, Unlink2, MapPinOff, ArrowRight } from 'lucide-react';

interface PenaltyDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PenaltyDiscoveryModal: React.FC<PenaltyDiscoveryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 p-4 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 block">
              Challenger Mode Unlocked
            </span>
            <h2 className="text-lg font-black tracking-tight leading-tight">
              Penalties & Settlement Scoring Activated!
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 text-slate-800">
          <p className="text-xs text-slate-600 leading-relaxed">
            Welcome to <strong>Challenger Mode</strong>! Your Settlement Score, 3-Star targets, and Penalty limits are now active on your HUD.
          </p>

          {/* 4 Penalty Rules Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Overlap */}
            <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-orange-950 mb-1">
                <Copy className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Overlap Error</span>
              </div>
              <p className="text-[10.5px] text-orange-800 leading-tight">
                <strong>-100 pts.</strong> Stacking tiles over occupied cells. <em>Remove the top tile to clear the penalty!</em>
              </p>
            </div>

            {/* Overuse */}
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Overuse Quota</span>
              </div>
              <p className="text-[10.5px] text-amber-800 leading-tight">
                <strong>-150 pts.</strong> Exceeding the level Par limit. Compact planning yields higher scores.
              </p>
            </div>

            {/* Disconnect */}
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-rose-950 mb-1">
                <Unlink2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Disconnect</span>
              </div>
              <p className="text-[10.5px] text-rose-800 leading-tight">
                <strong>-120 pts.</strong> Isolated islands not connected to the main settlement.
              </p>
            </div>

            {/* Off-Map */}
            <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-red-950 mb-1">
                <MapPinOff className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Off-Map</span>
              </div>
              <p className="text-[10.5px] text-red-800 leading-tight">
                <strong>-80 pts.</strong> Dropping structures outside valid unlocked boundaries.
              </p>
            </div>
          </div>

          {/* Settlement Score Formula Banner */}
          <div className="p-2.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-[11px] block text-amber-300">Settlement Score Formula</span>
                <span className="text-[10px] text-slate-300 font-mono">
                  Score = (Placed × 220) + (Zone Matches × 450) − Penalties
                </span>
              </div>
            </div>
          </div>

          {/* Dismiss Action Button */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            <span>Got it, Pioneer! Continue Level 3</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
