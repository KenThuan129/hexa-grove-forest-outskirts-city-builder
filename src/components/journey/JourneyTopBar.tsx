// src/components/journey/JourneyTopBar.tsx

import React from 'react';
import { Pause, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface JourneyTopBarProps {
  /** Whether the level is in Building Mode (lightbulb budget) or Challenger (par quota). */
  playMode: 'building' | 'challenger';
  /** Building Mode: lightbulbs used / budget. */
  lightbulbsUsed?: number;
  lightbulbBudget?: number;
  /** Challenger Mode: tiles placed / par target. */
  placedCount?: number;
  parCount?: number;
  /** Penalty summary — only shows ✓ or ⚠️, no details. */
  hasAnyPenalty: boolean;
  /** Penalty count when hasAnyPenalty is true. */
  penaltyCount?: number;
  onPause: () => void;
}

export const JourneyTopBar: React.FC<JourneyTopBarProps> = ({
  playMode,
  lightbulbsUsed = 0,
  lightbulbBudget = 0,
  placedCount = 0,
  parCount = 0,
  hasAnyPenalty,
  penaltyCount = 0,
  onPause,
}) => {
  const isBuilding = playMode === 'building';

  // Building Mode: show lightbulb usage. Challenger: show quota.
  const primaryDisplay = isBuilding
    ? {
        icon: <Lightbulb className="w-4 h-4 text-[#f0c674] fill-current" />,
        text: `${lightbulbsUsed} / ${lightbulbBudget}`,
        over: lightbulbsUsed > lightbulbBudget,
      }
    : {
        icon: <Lightbulb className="w-4 h-4 text-[#8fbc6f] fill-current" />,
        text: `${placedCount} / ${parCount}`,
        over: placedCount > parCount,
      };

  return (
    <header
      className="flex items-center justify-between gap-2 px-3 py-2 bg-[#1f120a]/95 border-b-2 border-[#5c3d2e] shadow-lg"
      style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}
    >
      {/* Pause button — left */}
      <button
        onClick={() => {
          sounds.playClick();
          onPause();
        }}
        className="w-10 h-10 rounded-2xl bg-[#2b1a11] border-2 border-[#5c3d2e] flex items-center justify-center text-[#f4ecd8] shadow-md active:scale-90 transition-transform shrink-0"
        title="Pause"
      >
        <Pause className="w-5 h-5" />
      </button>

      {/* Center-left: lightbulb / quota pill */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 shadow-md shrink-0 ${
          primaryDisplay.over
            ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
            : 'bg-[#2b1a11] border-[#5c3d2e] text-[#f4ecd8]'
        }`}
      >
        {primaryDisplay.icon}
        <span className="font-mono font-black text-xs tabular-nums">
          {primaryDisplay.text}
        </span>
      </div>

      <div className="flex-1" />

      {/* Right: penalty status pill — icon only, no detail */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 shadow-md shrink-0 ${
          hasAnyPenalty
            ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}
      >
        {hasAnyPenalty ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-mono font-black text-xs">
              {penaltyCount > 0 ? penaltyCount : '!'}
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-mono font-black text-[10px] uppercase tracking-wider">
              Clean
            </span>
          </>
        )}
      </div>
    </header>
  );
};