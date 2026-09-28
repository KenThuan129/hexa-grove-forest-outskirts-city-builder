import React from 'react';
import { BoosterId } from '../types/economy';
import { BOOSTER_CATALOG } from '../data/economyData';
import { ShoppingBag, Zap, Lock, Plus } from 'lucide-react';
import { sounds } from '../utils/audio';

interface BoosterBarProps {
  boosterInventory: Record<BoosterId, number>;
  highestCompletedLevel: number;
  onActivateBooster: (boosterId: BoosterId) => void;
  onOpenShop: () => void;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  boosterInventory,
  highestCompletedLevel,
  onActivateBooster,
  onOpenShop,
}) => {
  return (
    <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-2xl border border-slate-700 shadow-xl">
      {/* Label / Zap indicator */}
      <div className="flex items-center gap-1 pl-1 pr-1.5 border-r border-slate-700/80 text-amber-400 select-none">
        <Zap className="w-3.5 h-3.5 fill-amber-400/40" />
        <span className="text-[11px] font-bold text-amber-200 hidden md:inline">Boosters</span>
      </div>

      {/* All Boosters displayed directly */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {BOOSTER_CATALOG.map((booster) => {
          const isUnlocked = highestCompletedLevel >= booster.unlockLevel;
          const count = boosterInventory[booster.id] || 0;
          const canUse = isUnlocked && count > 0;

          if (!isUnlocked) {
            return (
              <div
                key={booster.id}
                className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-600 opacity-50 cursor-not-allowed select-none"
                title={`${booster.name} (Locked): Unlocks at Level ${booster.unlockLevel} · ${booster.tagline}`}
              >
                <span className="text-xs sm:text-sm grayscale">{booster.icon}</span>
                <span className="absolute -bottom-1 -right-1 bg-slate-900 text-slate-400 text-[8px] font-mono px-1 py-0.2 rounded-full border border-slate-700 flex items-center gap-0.5">
                  <Lock className="w-2 h-2 text-slate-500" />
                  <span>{booster.unlockLevel}</span>
                </span>
              </div>
            );
          }

          if (canUse) {
            return (
              <button
                key={booster.id}
                onClick={() => {
                  sounds.playVictory();
                  onActivateBooster(booster.id);
                }}
                className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-amber-500/50 hover:border-amber-400 text-white shadow transition-all transform active:scale-95 hover:scale-105 cursor-pointer group"
                title={`${booster.name} (x${count}): ${booster.tagline}\n${booster.description}\nClick to Activate!`}
              >
                <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">{booster.icon}</span>
                <span className="absolute -top-1 -right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 text-[9px] font-black font-mono px-1.5 py-0.2 rounded-full shadow-md border border-amber-300/40">
                  {count}
                </span>
              </button>
            );
          }

          // Unlocked but count === 0: click to open shop to get more
          return (
            <button
              key={booster.id}
              onClick={() => {
                sounds.playClick();
                onOpenShop();
              }}
              className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-400 hover:text-amber-300 transition-all cursor-pointer group"
              title={`${booster.name} (0 remaining): ${booster.description}\nClick to get in Shop!`}
            >
              <span className="text-xs sm:text-sm opacity-60 group-hover:opacity-100">{booster.icon}</span>
              <span className="absolute -top-1 -right-1.5 bg-slate-800 hover:bg-amber-500 text-slate-400 hover:text-amber-950 text-[8px] sm:text-[9px] font-mono px-1 py-0.2 rounded-full border border-slate-600 flex items-center">
                <Plus className="w-2 h-2" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Emporium Shop Button */}
      <button
        onClick={() => {
          sounds.playClick();
          onOpenShop();
        }}
        className="ml-0.5 flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
        title="Open Emporium Shop (Buy Boosters with Coins)"
      >
        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Shop</span>
      </button>
    </div>
  );
};
