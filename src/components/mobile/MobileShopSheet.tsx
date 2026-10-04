// src/components/mobile/MobileShopSheet.tsx

import React from 'react';
import { Coins, Lock, Zap, ShoppingBag } from 'lucide-react';
import { BoosterItem, BoosterId } from '../../types/economy';
import { BOOSTER_CATALOG } from '../../data/economyData';
import { BottomSheet } from './BottomSheet';
import { sounds } from '../../utils/audio';

interface MobileShopSheetProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  highestCompletedLevel: number;
  boosterInventory: Record<BoosterId, number>;
  onBuyBooster: (booster: BoosterItem) => void;
}

export const MobileShopSheet: React.FC<MobileShopSheetProps> = ({
  isOpen,
  onClose,
  coins,
  highestCompletedLevel,
  boosterInventory,
  onBuyBooster,
}) => {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      initialSnap="full"
      title="Emporium"
    >
      <div className="flex flex-col gap-3 pb-6">
        {/* Coins balance */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coins}</span>
          </div>
        </div>

        {/* Sub-header */}
        <div className="flex items-center gap-2 text-[10px] text-amber-300/80 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Tactical Boosters · {BOOSTER_CATALOG.length} items</span>
        </div>

        {/* Booster list */}
        {BOOSTER_CATALOG.map((booster) => {
          const isUnlocked = highestCompletedLevel >= booster.unlockLevel;
          const canAfford = coins >= booster.costCoins;
          const ownedCount = boosterInventory[booster.id] || 0;

          return (
            <div
              key={booster.id}
              className={`p-3 rounded-2xl border flex flex-col gap-2 ${
                isUnlocked
                  ? 'bg-[#1f120a] border-[#5c3d2e]'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-[#2b1a11] border border-[#5c3d2e] flex items-center justify-center text-2xl shrink-0">
                  {booster.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white truncate">
                      {booster.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      Owned: {ownedCount}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    {booster.tagline}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {booster.description}
              </p>

              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#5c3d2e]">
                <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{booster.costCoins}</span>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => {
                      if (canAfford) {
                        sounds.playClick();
                        onBuyBooster(booster);
                      } else {
                        sounds.playWarning();
                      }
                    }}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl font-black text-xs shadow-md transition-all ${
                      canAfford
                        ? 'bg-gradient-to-b from-[#f0c674] to-[#d49b38] text-[#2b1a11] active:translate-y-[1px] cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Buy' : 'Need Coins'}
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-amber-400/70 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Unlocks at Level {booster.unlockLevel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
};