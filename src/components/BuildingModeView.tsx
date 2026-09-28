import React, { useState } from 'react';
import { ConstructionItem, ConstructionId } from '../types/economy';
import { Resort3DScene } from './Resort3DScene';
import {
  Leaf,
  Coins,
  ArrowLeft,
  Crown,
  Sparkles,
  Hammer,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface BuildingModeViewProps {
  constructions: ConstructionItem[];
  leaves: number;
  coins: number;
  hasGoldenTicket: boolean;
  onUpgradeConstruction: (id: ConstructionId) => void;
  onOpenShop: () => void;
  onExitBuildingMode: () => void;
  onShowGoldenTicket: () => void;
}

export const BuildingModeView: React.FC<BuildingModeViewProps> = ({
  constructions,
  leaves,
  coins,
  hasGoldenTicket,
  onUpgradeConstruction,
  onOpenShop,
  onExitBuildingMode,
  onShowGoldenTicket,
}) => {
  const [selectedId, setSelectedId] = useState<ConstructionId>('timber_lodge');

  const selectedItem =
    constructions.find(c => c.id === selectedId) || constructions[0];

  const currentLvl = selectedItem.currentLevel;
  const isMaxLevel = currentLvl >= selectedItem.maxLevel;
  const upgradeCost = !isMaxLevel ? selectedItem.upgradeCosts[currentLvl] : 0;
  const canAfford = leaves >= upgradeCost && !isMaxLevel;

  const totalBuiltCount = constructions.filter(c => c.currentLevel > 0).length;
  const totalMaxedCount = constructions.filter(c => c.currentLevel === 3).length;

  const handleUpgradeClick = () => {
    if (!canAfford) {
      sounds.playWarning();
      return;
    }

    sounds.playZoneComplete();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#22c55e', '#10b981', '#34d399', '#fef08a'],
    });

    onUpgradeConstruction(selectedItem.id);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-slate-100 flex flex-col justify-between">
      {/* 3D Resort Scene Canvas */}
      <div className="absolute inset-0 z-0">
        <Resort3DScene
          constructions={constructions}
          selectedConstructionId={selectedId}
          onSelectConstruction={id => {
            setSelectedId(id);
            sounds.playClick();
          }}
        />
      </div>

      {/* Top Floating Header HUD */}
      <header className="relative z-10 w-full p-3 sm:p-5 flex items-center justify-between max-w-6xl mx-auto pointer-events-none">
        {/* Return Button & Title */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 shadow-xl">
          <button
            onClick={onExitBuildingMode}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white pr-2.5 border-r border-slate-700 transition-colors cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🏝️</span>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white leading-tight">
                Resort "Home" · Building Mode
              </h1>
              <p className="text-[10px] text-emerald-400 font-mono">
                {totalBuiltCount}/10 Built · {totalMaxedCount}/10 Maxed ★
              </p>
            </div>
          </div>
        </div>

        {/* Currency & Golden Ticket Badge */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* Golden Ticket Badge if unlocked */}
          {hasGoldenTicket ? (
            <button
              onClick={onShowGoldenTicket}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black text-xs shadow-xl animate-pulse cursor-pointer border border-yellow-200"
            >
              <Crown className="w-4 h-4" />
              <span>Golden Ticket ★</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-mono">
              <Crown className="w-3.5 h-3.5 text-amber-500/50" />
              <span>Golden Ticket ({totalMaxedCount}/10 Max)</span>
            </div>
          )}

          {/* Leaves Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs shadow-xl">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>{leaves} Leaves</span>
          </div>

          {/* Coins Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-xl">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{coins}</span>
          </div>

          {/* Shop Launcher */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs shadow-xl transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Emporium</span>
          </button>
        </div>
      </header>

      {/* Bottom Construction & Upgrade Deck */}
      <footer className="relative z-10 w-full p-3 sm:p-5 flex flex-col gap-3 max-w-5xl mx-auto pointer-events-none">
        {/* Active Selected Construction Inspector Card */}
        <div className="pointer-events-auto w-full p-4 sm:p-5 rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {selectedItem.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {selectedItem.category} Construction
                </span>
                <span
                  className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    currentLvl === 0
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : currentLvl === 3
                      ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                      : 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                  }`}
                >
                  {currentLvl === 0 ? 'Blueprint Plot' : `Tier ${currentLvl} / 3`}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white">
                {selectedItem.name}
              </h3>
              <p className="text-xs text-slate-300 font-serif italic mt-0.5 line-clamp-1">
                "{selectedItem.tagline}" — {selectedItem.perkDescription}
              </p>
            </div>
          </div>

          {/* Action / Upgrade Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            {isMaxLevel ? (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-lg">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Max Upgrade Reached ★★★</span>
              </div>
            ) : (
              <button
                onClick={handleUpgradeClick}
                disabled={!canAfford}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  canAfford
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white active:scale-95 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Hammer className="w-4 h-4" />
                <span>
                  {currentLvl === 0 ? 'Build Construction' : `Upgrade to Tier ${currentLvl + 1}`}
                </span>
                <span className="font-mono bg-black/30 px-2 py-0.5 rounded-lg text-emerald-300 border border-emerald-500/30">
                  {upgradeCost} Leaves
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 10 Constructions Selection Strip */}
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
          {constructions.map(c => {
            const isSelected = c.id === selectedId;

            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  sounds.playClick();
                }}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 shadow-xl ring-2 ring-amber-400/50 scale-105'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <span className="text-xl sm:text-2xl">{c.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-white max-w-[100px] truncate">
                    {c.name}
                  </div>
                  <div className="text-[9.5px] font-mono text-emerald-400">
                    {c.currentLevel === 0 ? 'Not Built' : `Tier ${c.currentLevel}/3`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
