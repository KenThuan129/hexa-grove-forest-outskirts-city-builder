import React, { useState } from 'react';
import { BoosterItem, JourneyChest, BoosterId } from '../types/economy';
import { BOOSTER_CATALOG } from '../data/economyData';
import {
  Coins,
  Leaf,
  ShoppingBag,
  Sparkles,
  Lock,
  CheckCircle2,
  Gift,
  X,
  ChevronRight,
  Shield,
  Zap,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  coins: number;
  leaves: number;
  highestCompletedLevel: number;
  boosterInventory: Record<BoosterId, number>;
  journeyChests: JourneyChest[];
  onBuyBooster: (booster: BoosterItem) => void;
  onClaimChest: (chestId: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  coins,
  leaves,
  highestCompletedLevel,
  boosterInventory,
  journeyChests,
  onBuyBooster,
  onClaimChest,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'boosters' | 'journey'>('boosters');

  if (!isOpen) return null;

  const handleClaimChestWithConfetti = (chest: JourneyChest) => {
    sounds.playVictory();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
    onClaimChest(chest.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Balances */}
        <header className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                Frontier Emporium & Journey Vault
              </h2>
              <p className="text-[11px] text-slate-400">
                Purchase tactical boosters with Coins & claim Leaves for Home Resort
              </p>
            </div>
          </div>

          {/* Currency Display & Close */}
          <div className="flex items-center gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{coins}</span>
              <span className="text-[9px] text-amber-400/80 font-sans">Coins</span>
            </div>

            {/* Leaves */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs shadow-inner">
              <Leaf className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{leaves}</span>
              <span className="text-[9px] text-emerald-400/80 font-sans">Leaves</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/90 text-xs">
          <button
            onClick={() => setActiveTab('boosters')}
            className={`pb-3 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'boosters'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Tactical Boosters ({BOOSTER_CATALOG.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`pb-3 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'journey'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>Journey Leaves Chests ({journeyChests.filter(c => !c.isClaimed && highestCompletedLevel >= c.levelThreshold).length} ready)</span>
          </button>
        </div>

        {/* Tab 1: Tactical Boosters Catalog */}
        {activeTab === 'boosters' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Earn Coins by conquering levels and achieving 2★ and 3★ ratings.</span>
              <span className="font-mono text-[11px] text-cyan-400">Highest Level: Lvl {highestCompletedLevel}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {BOOSTER_CATALOG.map(booster => {
                const isUnlocked = highestCompletedLevel >= booster.unlockLevel;
                const canAfford = coins >= booster.costCoins;
                const ownedCount = boosterInventory[booster.id] || 0;

                return (
                  <div
                    key={booster.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isUnlocked
                        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                            {booster.icon}
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-black text-white">
                              {booster.name}
                            </h3>
                            <span className="text-[10px] text-cyan-300 font-mono">
                              {booster.tagline}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold shrink-0">
                          Owned: {ownedCount}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {booster.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-300">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{booster.costCoins} Coins</span>
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              sounds.playClick();
                              onBuyBooster(booster);
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>{canAfford ? 'Purchase' : 'Need Coins'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400/70 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-900/50">
                          <Lock className="w-3 h-3" />
                          <span>Unlocks at Level {booster.unlockLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Journey Leaves Progression & Chests */}
        {activeTab === 'journey' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Journey Progression Rewards</span>
                  <span className="text-[11px] text-emerald-300/80">
                    Earn Leaves by conquering milestone levels. Spend Leaves to build and upgrade your resort in Home!
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-300 text-xs shrink-0">
                {highestCompletedLevel} / 40 Levels Cleared
              </span>
            </div>

            <div className="space-y-2.5 mt-1">
              {journeyChests.map(chest => {
                const isUnlocked = highestCompletedLevel >= chest.levelThreshold;

                return (
                  <div
                    key={chest.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      chest.isClaimed
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                        : isUnlocked
                        ? 'bg-gradient-to-r from-emerald-950/70 to-slate-900 border-emerald-500/50 shadow-lg text-emerald-100 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        chest.isClaimed
                          ? 'bg-slate-800 text-slate-500'
                          : isUnlocked
                          ? 'bg-emerald-500 text-emerald-950 shadow-lg animate-bounce'
                          : 'bg-slate-800 text-slate-600'
                      }`}>
                        {chest.isClaimed ? '✓' : '🎁'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-white">
                            {chest.title}
                          </h4>
                          <span className="text-[10px] font-mono text-cyan-300">
                            Threshold: Level {chest.levelThreshold}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400">
                          {chest.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end text-xs font-mono">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5" /> +{chest.leavesReward} Leaves
                        </span>
                        <span className="text-amber-400 text-[10px] flex items-center gap-1">
                          <Coins className="w-3 h-3" /> +{chest.coinsReward} Coins
                        </span>
                      </div>

                      {chest.isClaimed ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold font-mono">
                          Claimed ✓
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleClaimChestWithConfetti(chest)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer animate-pulse"
                        >
                          Claim Rewards!
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-mono">
                          <Lock className="w-3 h-3" />
                          <span>Lvl {chest.levelThreshold}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
