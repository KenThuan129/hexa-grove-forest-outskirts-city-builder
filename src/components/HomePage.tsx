import React, { useState } from 'react';
import { LevelConfig, GameMode, AcePerkId } from '../types/game';
import { ConstructionItem, ConstructionId, BoosterId } from '../types/economy';
import { Resort3DScene } from './Resort3DScene';
import { HomeShowcaseSpotlight } from './HomeShowcaseSpotlight';
import {
  Compass,
  Play,
  Settings,
  BookOpen,
  HelpCircle,
  Star,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Award,
  Coins,
  Leaf,
  ShoppingBag,
  Crown,
  Sparkles,
  Hammer,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface HomePageProps {
  levels: LevelConfig[];
  currentLevelIndex: number;
  isOpenShowcase?: boolean;
  gameMode?: GameMode;
  highestCompletedLevel?: number;
  equippedAce?: AcePerkId | null;
  coins: number;
  leaves: number;
  boosters: Record<BoosterId, number>;
  constructions: ConstructionItem[];
  hasGoldenTicket: boolean;
  unclaimedChestsCount?: number;
  onUpgradeConstruction: (id: ConstructionId) => void;
  onCloseShowcase?: () => void;
  onSelectLevel: (index: number) => void;
  onStartJourney: () => void;
  onNavigateMemories: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenLevelEditor: () => void;
  onChangeGameMode?: (mode: GameMode) => void;
  onOpenShop: () => void;
  onShowGoldenTicket: () => void;
  onPlayIntro?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  levels,
  currentLevelIndex,
  isOpenShowcase = false,
  gameMode = 'casual',
  highestCompletedLevel = 0,
  coins = 0,
  leaves = 0,
  constructions,
  hasGoldenTicket = false,
  unclaimedChestsCount = 0,
  onUpgradeConstruction,
  onCloseShowcase = () => {},
  onSelectLevel,
  onStartJourney,
  onNavigateMemories,
  onOpenSettings,
  onOpenRules,
  onOpenLevelEditor,
  onChangeGameMode = () => {},
  onOpenShop,
  onShowGoldenTicket,
  onPlayIntro,
}) => {
  const [selectedId, setSelectedId] = useState<ConstructionId>('timber_lodge');
  const [isBuildingTrayCollapsed, setIsBuildingTrayCollapsed] = useState(false);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [modeNotice, setModeNotice] = useState<string | null>(null);

  const currentLevel = levels[currentLevelIndex] || levels[0];
  const selectedItem =
    constructions.find(c => c.id === selectedId) || constructions[0];

  const currentLvl = selectedItem.currentLevel;
  const isMaxLevel = currentLvl >= selectedItem.maxLevel;
  const upgradeCost = !isMaxLevel ? selectedItem.upgradeCosts[currentLvl] : 0;
  const canAfford = leaves >= upgradeCost && !isMaxLevel;

  const totalBuiltCount = constructions.filter(c => c.currentLevel > 0).length;
  const totalMaxedCount = constructions.filter(c => c.currentLevel === 3).length;
  const isTryHardUnlocked = highestCompletedLevel >= 40;

  const handleTryHardToggle = () => {
    if (!isTryHardUnlocked) {
      sounds.playWarning();
      setModeNotice(`🔒 Try-Hard Mode unlocks at Level 40 (${highestCompletedLevel}/40 completed)`);
      setTimeout(() => setModeNotice(null), 3000);
      return;
    }
    onChangeGameMode('tryhard');
    sounds.playClick();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-slate-100 flex flex-col justify-between">
      {/* Home Showcase Spotlight Walkthrough (Triggered after Level 5 completion) */}
      <HomeShowcaseSpotlight
        isOpen={isOpenShowcase}
        currentLevelId={currentLevel.id}
        onClose={onCloseShowcase}
        onStartLevel={onStartJourney}
        onOpenLevelEditor={onOpenLevelEditor}
        onOpenMemories={onNavigateMemories}
        onOpenRules={onOpenRules}
      />

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

      {/* Top Floating HUD: Resort Title, Currency, Golden Ticket & Shop */}
      <header className="relative z-10 w-full p-2.5 sm:p-4 flex items-center justify-between max-w-7xl mx-auto pointer-events-none">
        {/* Left: Cozy Resort Title & 3D Building Progress */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-3xl border border-slate-700/80 shadow-2xl hover:border-emerald-500/40 transition-colors">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 flex items-center justify-center text-lg shadow-inner">
            🏝️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Archipelago Resort
              </h1>
              <span className="text-[9.5px] font-mono bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                Home Sanctuary
              </span>
            </div>
            <p className="text-[10.5px] text-emerald-300/90 font-mono font-medium">
              {totalBuiltCount}/10 Built · <span className="text-amber-400 font-bold">{totalMaxedCount}/10 Maxed ★</span>
            </p>
          </div>
        </div>

        {/* Right: Currency Balances, Shop & System Modals */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Golden Ticket Badge Button (Locked until 10/10 Maxed) */}
          {hasGoldenTicket ? (
            <button
              onClick={() => {
                sounds.playClick();
                onShowGoldenTicket();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs shadow-xl animate-pulse cursor-pointer border border-yellow-200 transform hover:scale-105 transition-transform"
              title="View Legendary Golden Ticket"
            >
              <Crown className="w-4 h-4 fill-amber-950" />
              <span className="hidden sm:inline">Golden Ticket ★</span>
            </button>
          ) : totalMaxedCount === 10 ? (
            <button
              onClick={() => {
                sounds.playClick();
                onShowGoldenTicket();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-black text-xs shadow-xl animate-bounce cursor-pointer border border-yellow-300 hover:scale-105 transition-transform"
              title="All 10 constructions maxed! Click to claim your Golden Ticket!"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim Ticket! (10/10)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onShowGoldenTicket();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-400 text-xs font-mono font-bold cursor-pointer hover:border-amber-500/50 hover:text-amber-300 transition-all shadow-lg"
              title={`Golden Ticket Vault: Max out all 10 resort buildings to claim (${totalMaxedCount}/10 maxed)`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-500/70" />
              <span className="hidden md:inline">Ticket</span>
              <span className="text-amber-400">({totalMaxedCount}/10)</span>
            </button>
          )}

          {/* Leaves Balance */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs shadow-lg"
            title="Leaves: Obtained from Journey Chests. Spend to build and upgrade your resort!"
          >
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>{leaves}</span>
            <span className="text-[9.5px] text-emerald-400/80 font-sans hidden sm:inline">Leaves</span>
          </div>

          {/* Coins Balance */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-950/90 border border-amber-500/50 text-amber-300 font-mono font-bold text-xs shadow-lg"
            title="Coins: Obtained from completing levels and stars. Spend to buy tactical boosters in Emporium!"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{coins}</span>
            <span className="text-[9.5px] text-amber-400/80 font-sans hidden sm:inline">Coins</span>
          </div>

          {/* Shop / Emporium Button */}
          <button
            onClick={onOpenShop}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            title="Open Emporium (Boosters & Journey Leaves Chests)"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Emporium</span>
            {unclaimedChestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce shadow">
                {unclaimedChestsCount}
              </span>
            )}
          </button>

          {/* Clean View / Zen Mode Toggle */}
          <button
            onClick={() => {
              setIsZenMode(!isZenMode);
              sounds.playClick();
            }}
            className="p-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
            title={isZenMode ? "Show Island UI" : "Clean View: Hide UI to view Resort Island"}
          >
            {isZenMode ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-400 hover:text-emerald-400" />}
          </button>

          {/* Rules */}
          <button
            onClick={onOpenRules}
            className="p-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
            title="Game Rules & Guide"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Special Intro Prologue */}
          {onPlayIntro && (
            <button
              onClick={onPlayIntro}
              className="p-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white transition-all cursor-pointer shadow-lg"
              title="Watch Animated Intro: 'Rejoyce, a journey up for the youth'"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Floating Center-Left Action Card: Campaign Play, Game Mode, Memories */}
      {!isZenMode && (
        <div className="relative z-10 p-3 sm:p-5 max-w-sm w-full pointer-events-none self-start animate-in fade-in duration-150">
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col gap-3">
            {/* Level Header & Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-bold">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>EXPEDITION CAMPAIGN</span>
              </div>

              <button
                onClick={() => setIsLevelSelectorOpen(!isLevelSelectorOpen)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30"
              >
                <span>Select Level</span>
                {isLevelSelectorOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Level Switcher Dropdown */}
            {isLevelSelectorOpen && (
              <div className="max-h-48 overflow-y-auto bg-slate-950 p-1.5 rounded-2xl border border-slate-800 space-y-1 shadow-inner">
                {levels.map((lvl, idx) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      onSelectLevel(idx);
                      setIsLevelSelectorOpen(false);
                      sounds.playClick();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                      idx === currentLevelIndex
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span>Lvl {lvl.id}: {lvl.name}</span>
                    {idx === currentLevelIndex && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />}
                  </button>
                ))}
              </div>
            )}

            {/* Game Mode Selector: Casual Mode vs Locked Try-Hard Mode */}
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onChangeGameMode('casual');
                    sounds.playClick();
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gameMode === 'casual'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Casual</span>
                </button>

                <button
                  type="button"
                  onClick={handleTryHardToggle}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    !isTryHardUnlocked
                      ? 'text-slate-500 bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-amber-500/40'
                      : gameMode === 'tryhard'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md cursor-pointer'
                      : 'text-slate-400 hover:text-white cursor-pointer'
                  }`}
                  title={
                    !isTryHardUnlocked
                      ? `Locked: Complete Level 40 to unlock Try-Hard mode (${highestCompletedLevel}/40 completed)`
                      : 'Try-Hard Mode: Requires 1★ + Mastery Challenge completed'
                  }
                >
                  {!isTryHardUnlocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Try-Hard</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      <span>Try-Hard</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mode Notice Toast when clicked while locked */}
              {modeNotice && (
                <div className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/80 border border-amber-500/50 p-1.5 rounded-xl text-center animate-in fade-in duration-150">
                  {modeNotice}
                </div>
              )}
            </div>

            {/* Primary Action Button: Play Level */}
            <button
              data-tutorial-id="home-play-btn"
              onClick={onStartJourney}
              className="group relative w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl border border-emerald-400/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">
                    Level {currentLevel.id} of {levels.length}
                  </span>
                  <span className="text-xs sm:text-sm font-black tracking-tight block truncate max-w-[170px]">
                    {currentLevel.name}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Memories (Visual Novel Story Lore) Button */}
            <button
              onClick={onNavigateMemories}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Memories & Island Relics</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Building Mode Controller: Inspect & Upgrade Resort Constructions */}
      {!isZenMode && (
        <footer className="relative z-10 w-full p-2.5 sm:p-4 max-w-7xl mx-auto pointer-events-none flex flex-col items-center gap-2 animate-in fade-in duration-150">
          {/* Toggle Collapse Bar */}
          <div className="pointer-events-auto">
            <button
              onClick={() => setIsBuildingTrayCollapsed(!isBuildingTrayCollapsed)}
              className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:text-white transition-colors"
            >
              <Hammer className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBuildingTrayCollapsed ? 'Expand 10 Resort Constructions' : 'Hide Construction Tray'}</span>
              {isBuildingTrayCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!isBuildingTrayCollapsed && (
            <div className="pointer-events-auto w-full bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-3.5 sm:p-4 flex flex-col gap-3">
              {/* Top Row: Selected Construction Inspector & Upgrade Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {selectedItem.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">
                        {selectedItem.name}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        selectedItem.currentLevel === 3
                          ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                          : selectedItem.currentLevel > 0
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {selectedItem.currentLevel === 0
                          ? 'Unbuilt Plot'
                          : selectedItem.currentLevel === 3
                          ? '★ MAX LEVEL 3'
                          : `Level ${selectedItem.currentLevel} / 3`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5 line-clamp-1">
                      {selectedItem.description}
                    </p>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ✦ {selectedItem.perkDescription}
                    </span>
                  </div>
                </div>

                {/* Upgrade / Build Action Button */}
                <div className="shrink-0 w-full sm:w-auto">
                  {isMaxLevel ? (
                    <div className="px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Peak Glory Reached ★</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpgradeConstruction(selectedItem.id)}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white transform hover:scale-105 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Leaf className={`w-4 h-4 ${canAfford ? 'text-emerald-200' : 'text-slate-500'}`} />
                      <span>
                        {selectedItem.currentLevel === 0 ? 'Build' : 'Upgrade'}: {upgradeCost} Leaves
                      </span>
                      {!canAfford && (
                        <span className="text-[10px] text-rose-400 font-mono">
                          (Need {upgradeCost - leaves} more)
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Row: 10 Construction Selectors Carousel */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 overflow-x-auto">
                {constructions.map(item => {
                  const isSelected = item.id === selectedId;
                  const isMax = item.currentLevel === 3;
                  const isBuilt = item.currentLevel > 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        sounds.playClick();
                      }}
                      className={`relative p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-md scale-105'
                          : isBuilt
                          ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                          : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-100'
                      }`}
                      title={`${item.name} (${item.currentLevel === 0 ? 'Unbuilt' : `Lv ${item.currentLevel}/3`})`}
                    >
                      <span className="text-xl sm:text-2xl">{item.icon}</span>
                      <span className="text-[10px] font-bold text-white truncate max-w-full text-center">
                        {item.name.split(' ')[0]}
                      </span>

                      {/* Level Pill */}
                      <span
                        className={`text-[9px] font-mono px-1.5 rounded-full font-bold ${
                          isMax
                            ? 'bg-amber-400 text-amber-950 font-black'
                            : isBuilt
                            ? 'bg-emerald-900 text-emerald-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.currentLevel}/3
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};
