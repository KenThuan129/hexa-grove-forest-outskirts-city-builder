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
    <div className="wood-panel p-3.5 flex flex-col gap-2 border-2 border-[#5c3d2e] shadow-2xl font-rounded select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#5c3d2e] pb-2 mb-1">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#f0c674]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#f4ecd8]">
            Penalties
          </h3>
        </div>
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
            <div key={conf.key} className="flex items-center justify-between text-[11px] h-7">
              {/* Left: Icon & Label */}
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${count > 0 ? 'bg-rose-950/50 text-rose-400' : 'bg-[#1e3520] text-[#a8b89a]'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`font-bold ${count > 0 ? 'text-[#f4ecd8]' : 'text-[#a8b89a]'}`}>
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
                    className="w-5 h-5 rounded-full bg-[#f4ecd8] border-2 border-white flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-in zoom-in duration-200"
                  >
                    <div className="w-2 h-2 bg-[#2b1a11] rounded-full" />
                  </div>
                ))}

                {/* 3. Empty Bypass Slots (Available but unused) */}
                {Array.from({ length: remainingBypasses }).map((_, i) => (
                  <div
                    key={`avail-${i}`}
                    className="w-5 h-5 rounded-full bg-[#1e3520] border-2 border-[#6b8e5a] flex items-center justify-center"
                  />
                ))}

                {/* 4. Placeholder slots if total slots < 3 */}
                {count === 0 && bypassCount === 0 && (
                  <>
                    <div className="w-5 h-5 rounded-full bg-[#1e3520] border-2 border-[#3a2519]" />
                    <div className="w-5 h-5 rounded-full bg-[#1e3520] border-2 border-[#3a2519]" />
                    <div className="w-5 h-5 rounded-full bg-[#1e3520] border-2 border-[#3a2519]" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: Total */}
      <div className="mt-1 pt-2 border-t border-[#5c3d2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#a8b89a]">
            Total Penalties
          </span>
          <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded ${totalErrors > 0 ? 'bg-rose-950 text-rose-300' : 'bg-[#1e3520] text-[#8fbc6f]'}`}>
            {totalErrors}
          </span>
        </div>
        
        {isTryHard && (
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
            <span className="text-[#f0c674]">⚡</span>
            <span className="text-rose-400">-{totalErrors * 100} Pts</span>
          </div>
        )}
      </div>
    </div>
  );
};