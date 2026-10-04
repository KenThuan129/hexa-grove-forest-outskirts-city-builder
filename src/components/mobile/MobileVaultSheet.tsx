// src/components/mobile/MobileVaultSheet.tsx

import React, { useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Coins, Leaf, Lock, Gift, Check } from 'lucide-react';
import { JourneyChest } from '../../types/economy';
import { JOURNEY_CHESTS } from '../../data/economyData';
import { BottomSheet } from './BottomSheet';
import { sounds } from '../../utils/audio';

interface MobileVaultSheetProps {
  isOpen: boolean;
  onClose: () => void;
  highestCompletedLevel: number;
  claimedChestIds: number[];
  onClaimChest: (chestId: number) => void;
  /** Optional: chest id to scroll to on open (e.g. tapped from a Home slot) */
  initialChestId?: number | null;
}

type ChestState = 'claimed' | 'ready' | 'locked';

interface ChestRow {
  chest: JourneyChest;
  state: ChestState;
}

export const MobileVaultSheet: React.FC<MobileVaultSheetProps> = ({
  isOpen,
  onClose,
  highestCompletedLevel,
  claimedChestIds,
  onClaimChest,
  initialChestId = null,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  // Build sorted chest rows — always in progression order
  const rows: ChestRow[] = useMemo(() => {
    return JOURNEY_CHESTS
      .slice()
      .sort((a, b) => a.levelThreshold - b.levelThreshold)
      .map((chest) => {
        const isClaimed = claimedChestIds.includes(chest.id);
        const isUnlocked = highestCompletedLevel >= chest.levelThreshold;
        const state: ChestState = isClaimed
          ? 'claimed'
          : isUnlocked
          ? 'ready'
          : 'locked';
        return { chest, state };
      });
  }, [highestCompletedLevel, claimedChestIds]);

  // The "next claimable" chest — the first ready one
  const nextClaimable = rows.find((r) => r.state === 'ready') ?? null;

  // Scroll to a specific chest when opened with initialChestId
  useEffect(() => {
    if (!isOpen || !initialChestId) return;
    const t = setTimeout(() => {
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 320); // wait for sheet animation
    return () => clearTimeout(t);
  }, [isOpen, initialChestId]);

  const handleClaim = (chest: JourneyChest, chestEl: HTMLElement | null) => {
    sounds.playVictory();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
    onClaimChest(chest.id);
    chestEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      initialSnap="full"
      title="King's Journey"
    >
      <div ref={scrollRef} className="flex flex-col gap-4 pb-8">
        {/* ── Top highlight card: next claimable chest ── */}
        {nextClaimable && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#f0c674]/20 via-[#d49b38]/10 to-[#f0c674]/20 border-2 border-[#f0c674]/60 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#f0c674] to-[#d49b38] border-2 border-[#fce8ad] flex items-center justify-center text-3xl shadow-lg animate-pulse">
              🎁
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#f0c674]">
                Level Up Chest Unlocked!
              </div>
              <div className="text-sm font-black text-white truncate">
                {nextClaimable.chest.title}
              </div>
              <div className="text-[10px] font-mono text-[#f0c674]">
                Level {nextClaimable.chest.levelThreshold}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClaim(nextClaimable.chest, (e.currentTarget as HTMLElement).closest('.chest-row') as HTMLElement | null);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#8fbc6f] to-[#435e38] border-2 border-[#c8e0b0] text-[#f4ecd8] font-black text-xs uppercase tracking-wider shadow-lg active:translate-y-[2px] transition-transform cursor-pointer"
            >
              Claim
            </button>
          </div>
        )}

        {/* ── Timeline header ── */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#a8b89a]">
            Progression Timeline
          </span>
          <span className="text-[10px] font-mono text-[#a8b89a]">
            {claimedChestIds.length} / {JOURNEY_CHESTS.length} claimed
          </span>
        </div>

        {/* ── Timeline body ── */}
        <div className="relative pl-2">
          {/* Vertical axis line */}
          <div
            className="absolute left-[35px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#5c3d2e] via-[#8fbc6f]/40 to-[#5c3d2e]"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-1">
            {rows.map((row) => {
              const isTarget = initialChestId === row.chest.id;
              const isReady = row.state === 'ready';
              const isClaimed = row.state === 'claimed';
              const isLocked = row.state === 'locked';

              return (
                <div
                  key={row.chest.id}
                  ref={isTarget ? targetRef : undefined}
                  className={`chest-row relative flex items-center gap-3 py-2 ${
                    isTarget ? 'bg-[#f0c674]/10 rounded-xl -mx-2 px-2' : ''
                  }`}
                >
                  {/* Left: Chest icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all ${
                      isReady
                        ? 'bg-gradient-to-b from-[#f0c674] to-[#d49b38] border-2 border-[#fce8ad] shadow-lg animate-pulse'
                        : isClaimed
                        ? 'bg-[#2b1a11] border-2 border-[#5c3d2e] opacity-60'
                        : 'bg-[#0f0805] border-2 border-[#3a2519] opacity-70'
                    }`}
                  >
                    {isClaimed ? (
                      <Check className="w-6 h-6 text-[#8fbc6f]" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-[#5c3d2e]" />
                    ) : (
                      '🎁'
                    )}
                  </div>

                  {/* Middle: Node on the axis */}
                  <div
                    className={`relative z-10 w-4 h-4 rounded-full shrink-0 -ml-2 ${
                      isReady
                        ? 'bg-[#f0c674] ring-4 ring-[#f0c674]/30 animate-pulse'
                        : isClaimed
                        ? 'bg-[#8fbc6f]'
                        : 'bg-[#5c3d2e]'
                    }`}
                  />

                  {/* Right: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black truncate ${
                          isReady ? 'text-white' : isClaimed ? 'text-[#a8b89a]' : 'text-[#5c3d2e]'
                        }`}
                      >
                        {row.chest.title}
                      </span>
                      {isClaimed && (
                        <span className="text-[9px] font-mono text-[#8fbc6f] shrink-0">
                          ✓ Claimed
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-[#a8b89a] truncate">
                      {row.chest.subtitle}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                      <span className={isReady || isClaimed ? 'text-emerald-400' : 'text-slate-500'}>
                        <Leaf className="w-3 h-3 inline mr-0.5" />+{row.chest.leavesReward}
                      </span>
                      <span className={isReady || isClaimed ? 'text-amber-400' : 'text-slate-500'}>
                        <Coins className="w-3 h-3 inline mr-0.5" />+{row.chest.coinsReward}
                      </span>
                      {isLocked && (
                        <span className="text-[9px] text-amber-400/70 ml-auto">
                          Unlock at Level {row.chest.levelThreshold}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action button (right) */}
                  {isReady && (
                    <button
                      onClick={(e) => handleClaim(row.chest, (e.currentTarget as HTMLElement).closest('.chest-row') as HTMLElement | null)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-black text-[10px] uppercase shadow-md active:translate-y-[1px] transition-transform cursor-pointer"
                    >
                      Claim
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {rows.length === 0 && (
          <div className="text-center text-[11px] text-slate-500 italic py-6">
            No chests available yet. Conquer levels to unlock rewards.
          </div>
        )}
      </div>
    </BottomSheet>
  );
};