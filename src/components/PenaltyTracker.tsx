// src/components/PenaltyTracker.tsx
import React from 'react';
import { AlertTriangle, Copy, Unlink2, MapPinOff, Layers } from 'lucide-react';
import type { PenaltyRecord, PenaltyBypassRecord } from '../types/game';

interface PenaltyTrackerProps {
  penalties: PenaltyRecord;
  bypasses: PenaltyBypassRecord;
  isTryHard: boolean;
}

const PENALTY_CONFIG = [
  { key: 'overuse', label: 'Overuse', icon: Layers },
  { key: 'offMap', label: 'Out of Bounds', icon: MapPinOff },
  { key: 'overlap', label: 'Overlap', icon: Copy },
  { key: 'disconnect', label: 'Disconnect', icon: Unlink2 },
] as const;

export const PenaltyTracker: React.FC<PenaltyTrackerProps> = ({
  penalties,
  bypasses,
  isTryHard,
}) => {
  const totalErrors =
    penalties.overuse +
    penalties.offMap +
    penalties.overlap +
    penalties.disconnect +
    penalties.falsehood;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
            Penalties
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
          {isTryHard ? 'Try-Hard' : 'Casual'}
        </span>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5">
        {PENALTY_CONFIG.map((conf) => {
          const count = penalties[conf.key] || 0;
          const bypassCount = bypasses[conf.key] || 0;
          const Icon = conf.icon;

          const usedBypasses = Math.min(count, bypassCount);
          const remainingBypasses = Math.max(0, bypassCount - count);

          return (
            <div key={conf.key} className="flex items-center justify-between text-xs h-8">
              {/* Left: Icon & Label */}
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${count > 0 ? 'bg-rose-950/50 text-rose-400' : 'bg-slate-800/50 text-slate-500'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`font-bold ${count > 0 ? 'text-slate-200' : 'text-slate-400'}`}>
                  {conf.label}
                </span>
              </div>

              {/* Right: Stamps */}
              <div className="flex items-center gap-1.5">
                {/* 1. Red Error Stamps */}
                {count > 0 && (
                  <div className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)] font-mono font-black text-[10px]">
                    -{count}
                  </div>
                )}

                {/* 2. White Bypass Stamps (Used) */}
                {Array.from({ length: usedBypasses }).map((_, i) => (
                  <div
                    key={`used-${i}`}
                    className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-in zoom-in duration-200"
                  >
                    <div className="w-2 h-2 bg-slate-900 rounded-full" />
                  </div>
                ))}

                {/* 3. Empty Bypass Slots (Available but unused) */}
                {Array.from({ length: remainingBypasses }).map((_, i) => (
                  <div
                    key={`avail-${i}`}
                    className="w-5 h-5 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center"
                  />
                ))}

                {/* 4. Placeholder slots if total slots < 3 */}
                {count === 0 && bypassCount === 0 && (
                  <>
                    <div className="w-5 h-5 rounded-full bg-slate-950/50 border-2 border-slate-800" />
                    <div className="w-5 h-5 rounded-full bg-slate-950/50 border-2 border-slate-800" />
                    <div className="w-5 h-5 rounded-full bg-slate-950/50 border-2 border-slate-800" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: Total */}
      <div className="mt-1 pt-2 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total Penalties
          </span>
          <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${totalErrors > 0 ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
            {totalErrors}
          </span>
        </div>
        
        {isTryHard && (
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
            <span className="text-amber-400">⚡</span>
            <span className="text-rose-400">-{totalErrors * 100} Pts</span>
          </div>
        )}
      </div>
    </div>
  );
};