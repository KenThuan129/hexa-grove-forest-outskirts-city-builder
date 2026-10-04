// src/components/journey/JourneyBoosterRow.tsx

import React from 'react';
import { BOOSTER_CATALOG } from '../../data/economyData';
import { BoosterId } from '../../types/economy';
import { sounds } from '../../utils/audio';

interface JourneyBoosterRowProps {
  boosterInventory: Record<BoosterId, number>;
  highestCompletedLevel: number;
  onActivateBooster: (id: BoosterId) => void;
  onOpenShop: () => void;
  /** 'horizontal' (portrait, bottom row) or 'vertical' (landscape, right rail) */
  orientation?: 'horizontal' | 'vertical';
}

export const JourneyBoosterRow: React.FC<JourneyBoosterRowProps> = ({
  boosterInventory,
  highestCompletedLevel,
  onActivateBooster,
  onOpenShop,
  orientation = 'horizontal',
}) => {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={
        isVertical
          ? 'flex flex-col items-center gap-2'
          : 'flex items-center justify-center gap-2 px-3 py-2'
      }
    >
      {BOOSTER_CATALOG.map((booster) => {
        const isUnlocked = highestCompletedLevel >= booster.unlockLevel;
        const count = boosterInventory[booster.id] || 0;
        const canUse = isUnlocked && count > 0;
        

        return (
          <button
            key={booster.id}
            onClick={() => {
              if (!isUnlocked) {
                sounds.playWarning();
                onOpenShop();
                return;
              }
              if (count <= 0) {
                sounds.playClick();
                onOpenShop();
                return;
              }
              sounds.playVictory();
              onActivateBooster(booster.id);
            }}
            title={
              !isUnlocked
                ? `${booster.name} — Unlocks at Level ${booster.unlockLevel}`
                : `${booster.name} (x${count})`
            }
            className={`relative shrink-0 rounded-2xl border-2 flex items-center justify-center shadow-lg active:scale-90 transition-transform ${
              isVertical ? 'w-11 h-11' : 'w-12 h-12'
            } ${
              canUse
                ? 'bg-gradient-to-b from-[#f0c674] to-[#d49b38] border-[#fce8ad] text-[#2b1a11]'
                : isUnlocked
                ? 'bg-[#2b1a11] border-[#5c3d2e] text-[#a8b89a]'
                : 'bg-[#1a0f07] border-[#3a2519] text-[#5c3d2e] opacity-60'
            }`}
          >
            <span className="text-lg">{booster.icon}</span>

            {/* Count badge */}
            {isUnlocked && (
              <span
                className={`absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center border-2 ${
                  canUse
                    ? 'bg-[#2b1a11] text-[#f0c674] border-[#f0c674]'
                    : 'bg-[#0f0805] text-[#a8b89a] border-[#5c3d2e]'
                }`}
              >
                {count}
              </span>
            )}

            {/* Lock badge */}
            {!isUnlocked && (
              <span className="absolute -top-1 -left-1 text-[10px]">🔒</span>
            )}

            {/* "!" badge when usable — draws attention to buy more */}
            {isUnlocked && count === 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border border-[#1f120a]">
                +
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};