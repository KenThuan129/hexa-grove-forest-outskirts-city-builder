import React, { useState } from 'react';
import { LevelConfig, GameMode, PlayMode, AcePerkId } from '../types/game';
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
  Lightbulb,
  Swords,
  Trophy,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface HomePageProps {
  levels: LevelConfig[];
  currentLevelIndex: number;
  isOpenShowcase?: boolean;
  gameMode?: GameMode;
  playMode?: PlayMode;
  performanceMode?: 'low' | 'high';
  highestCompletedLevel?: number;
  equippedAce?: AcePerkId | null;
  coins: number;
  leaves: number;
  boosters: Record<BoosterId, number>;
  constructions: ConstructionItem[];
  hasGoldenTicket: boolean;
  isAdminUnlocked?: boolean;
  unclaimedChestsCount?: number;
  onUpgradeConstruction: (id: ConstructionId) => void;
  onCloseShowcase?: () => void;
  onSelectLevel: (index: number) => void;
  onStartJourney: () => void;
  onNavigateMemories: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenLevelEditor: () => void;
  onOpenAdminAuth?: (featureName?: string) => void;
  onChangeGameMode?: (mode: GameMode) => void;
  onChangePlayMode?: (mode: PlayMode) => void;
  onOpenShop: () => void;
  onShowGoldenTicket: () => void;
  onPlayIntro?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  levels,
  currentLevelIndex,
  isOpenShowcase = false,
  gameMode = 'casual',
  playMode = 'building',
  performanceMode = 'low',
  highestCompletedLevel = 0,
  coins = 0,
  leaves = 0,
  constructions,
  hasGoldenTicket = false,
  isAdminUnlocked = false,
  unclaimedChestsCount = 0,
  onUpgradeConstruction,
  onCloseShowcase = () => {},
  onSelectLevel,
  onStartJourney,
  onNavigateMemories,
  onOpenSettings,
  onOpenRules,
  onOpenLevelEditor,
  onOpenAdminAuth,
  onChangeGameMode = () => {},
  onChangePlayMode = () => {},
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
    if (!isAdminUnlocked) {
      sounds.playWarning();
      onOpenAdminAuth?.('Try-Hard Mode');
      return;
    }
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
          performanceMode={performanceMode}
          onSelectConstruction={id => {
            setSelectedId(id);
            sounds.playClick();
          }}
        />
      </div>

      {/* Top Floating HUD: Resort Title, Currency, Golden Ticket & Shop */}
      <header className="relative z-10 w-full p-2.5 sm:p-4 flex items-center justify-between max-w-7xl mx-auto pointer-events-none">
        {/* Left: Cozy Resort Title & 3D Building Progress */}
        <div className="pointer-events-auto flex items-center gap-3 wood-panel px-4 py-2 rounded-2xl shadow-2xl hover:border-[#8fbc6f] transition-all">
          <div className="w-9 h-9 rounded-xl bg-[#6b8e5a]/30 border border-[#8fbc6f]/50 flex items-center justify-center text-lg shadow-inner">
            🌲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-[#f4ecd8] tracking-wide font-rounded">
                Archipelago Haven
              </h1>
              <span className="text-[9.5px] font-bold bg-[#1e3520] text-[#8fbc6f] px-2 py-0.5 rounded-lg border border-[#6b8e5a]/50">
                Forest Sanctuary
              </span>
            </div>
            <p className="text-[10.5px] text-[#a8b89a] font-medium">
              {totalBuiltCount}/10 Built · <span className="text-[#f0c674] font-bold">{totalMaxedCount}/10 Maxed 🌿</span>
            </p>
          </div>
        </div>

        {/* Right: Currency Balances, Shop & System Modals */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Golden Ticket Badge Button (Locked until Admin Unlocked) */}
          {hasGoldenTicket ? (
            <button
              onClick={() => {
                sounds.playClick();
                if (!isAdminUnlocked) {
                  onOpenAdminAuth?.('Golden Ticket');
                } else {
                  onShowGoldenTicket();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-sunlight font-bold text-xs shadow-xl cursor-pointer"
              title="View Legendary Golden Ticket"
            >
              <Crown className="w-4 h-4 text-[#2b1a11]" />
              <span className="hidden sm:inline">Golden Ticket 🌟</span>
            </button>
          ) : totalMaxedCount === 10 ? (
            <button
              onClick={() => {
                sounds.playClick();
                if (!isAdminUnlocked) {
                  onOpenAdminAuth?.('Golden Ticket');
                } else {
                  onShowGoldenTicket();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 btn-sunlight text-[#2b1a11] font-bold text-xs shadow-xl cursor-pointer animate-pulse"
              title="All 10 constructions maxed! Click to claim your Golden Ticket!"
            >
              <Sparkles className="w-4 h-4 text-[#2b1a11]" />
              <span>Claim Ticket! (10/10)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                if (!isAdminUnlocked) {
                  onOpenAdminAuth?.('Golden Ticket');
                } else {
                  onShowGoldenTicket();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 wood-panel text-[#a8b89a] text-xs font-bold cursor-pointer hover:border-[#f0c674] hover:text-[#f0c674] transition-all shadow-lg"
              title={isAdminUnlocked ? `Golden Ticket Vault: Max out all 10 resort buildings (${totalMaxedCount}/10 maxed)` : 'Golden Ticket: Requires Admin Code'}
            >
              <Lock className="w-3.5 h-3.5 text-[#f0c674]" />
              <span className="hidden md:inline">Ticket</span>
              <span className="text-[#f0c674]">({totalMaxedCount}/10)</span>
            </button>
          )}

          {/* Leaves Balance */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#1e3520]/90 border border-[#6b8e5a]/60 text-[#8fbc6f] font-bold text-xs shadow-lg"
            title="Leaves: Obtained from Journey Chests. Spend to build and upgrade your resort!"
          >
            <Leaf className="w-4 h-4 text-[#8fbc6f]" />
            <span className="font-mono">{leaves}</span>
            <span className="text-[9.5px] text-[#a8b89a] hidden sm:inline">Leaves</span>
          </div>

          {/* Coins Balance */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#3a2519]/90 border border-[#f0c674]/50 text-[#f0c674] font-bold text-xs shadow-lg"
            title="Coins: Obtained from completing levels and stars. Spend to buy tactical boosters in Emporium!"
          >
            <Coins className="w-4 h-4 text-[#f0c674]" />
            <span className="font-mono">{coins}</span>
            <span className="text-[9.5px] text-[#f4ecd8]/80 hidden sm:inline">Coins</span>
          </div>

          {/* Shop / Emporium Button */}
          <button
            onClick={onOpenShop}
            className="relative flex items-center gap-1.5 px-3 py-1.5 btn-wooden-sign text-[#f4ecd8] font-bold text-xs shadow-lg transition-all cursor-pointer"
            title="Open Emporium (Boosters & Journey Leaves Chests)"
          >
            <ShoppingBag className="w-4 h-4 text-[#f0c674]" />
            <span className="hidden sm:inline">Emporium</span>
            {unclaimedChestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e8b04b] text-[#2b1a11] font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce shadow">
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
            className="p-2 wood-panel text-[#f4ecd8] hover:border-[#8fbc6f] transition-all cursor-pointer shadow-lg"
            title={isZenMode ? "Show Island UI" : "Clean View: Hide UI to view Resort Island"}
          >
            {isZenMode ? <Eye className="w-4 h-4 text-[#8fbc6f]" /> : <EyeOff className="w-4 h-4 text-[#a8b89a]" />}
          </button>

          {/* Rules */}
          <button
            onClick={onOpenRules}
            className="p-2 wood-panel text-[#f4ecd8] hover:border-[#7a9b8e] transition-all cursor-pointer shadow-lg"
            title="Game Rules & Guide"
          >
            <HelpCircle className="w-4 h-4 text-[#7a9b8e]" />
          </button>

          {/* Special Intro Prologue */}
          {onPlayIntro && (
            <button
              onClick={onPlayIntro}
              className="p-2 wood-panel text-[#f0c674] hover:border-[#f0c674] transition-all cursor-pointer shadow-lg"
              title="Watch Animated Intro: 'Rejoyce, a journey up for the youth'"
            >
              <Sparkles className="w-4 h-4 text-[#f0c674]" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 wood-panel text-[#f4ecd8] hover:border-[#f0c674] transition-all cursor-pointer shadow-lg"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-[#f0c674]" />
          </button>
        </div>
      </header>

      {/* Floating Center-Left Action Card: Campaign Play, Game Mode, Memories */}
      {!isZenMode && (
        <div className="relative z-10 p-3 sm:p-5 max-w-sm w-full pointer-events-none self-start animate-in fade-in duration-150">
          <div className="pointer-events-auto wood-panel p-4.5 rounded-2xl border-2 border-[#5c3d2e] shadow-2xl flex flex-col gap-3">
            {/* Corner Decorative Leaf */}
            <div className="absolute -top-2 -right-2 text-lg pointer-events-none">🍃</div>

            {/* Primary Gameplay Mode Selector: Building Mode (Standard Journey) vs Challenger Mode */}
            <div className="flex flex-col gap-1.5 p-2 bg-[#1e3520]/80 rounded-xl border border-[#6b8e5a]/40">
              <span className="text-[10.5px] text-[#a8b89a] font-bold flex items-center gap-1 font-rounded">
                <Sparkles className="w-3 h-3 text-[#f0c674]" />
                <span>Primary Game Mode</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onChangePlayMode('building');
                    sounds.playClick();
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer border ${
                    playMode === 'building'
                      ? 'btn-sunlight border-[#f0c674]'
                      : 'bg-[#2b1a11]/60 border-[#5c3d2e] text-[#a8b89a] hover:text-[#f4ecd8]'
                  }`}
                >
                  <div className="flex items-center gap-1 font-rounded">
                    <Lightbulb className="w-3.5 h-3.5 fill-current" />
                    <span>Building Mode</span>
                  </div>
                  <span className="text-[9px] font-medium opacity-85">Lightbulbs · 0 Stars · 1v1 Boss</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    if (!isAdminUnlocked) {
                      onOpenAdminAuth?.('Challenger Mode');
                    } else {
                      onChangePlayMode('challenger');
                    }
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer border ${
                    playMode === 'challenger'
                      ? 'btn-river-stone border-[#8fbc6f]'
                      : 'bg-[#2b1a11]/60 border-[#5c3d2e] text-[#a8b89a] hover:text-[#f4ecd8]'
                  }`}
                >
                  <div className="flex items-center gap-1 font-rounded">
                    {!isAdminUnlocked ? <Lock className="w-3.5 h-3.5 text-[#f0c674]" /> : <Trophy className="w-3.5 h-3.5 text-[#8fbc6f]" />}
                    <span>Challenger Mode</span>
                  </div>
                  <span className="text-[9px] font-medium opacity-85">
                    {!isAdminUnlocked ? '🔒 Requires Admin Code' : 'Stars · Par · Penalties'}
                  </span>
                </button>
              </div>
            </div>

            {/* Level Header & Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#a8b89a] font-bold font-rounded">
                <Compass className="w-3.5 h-3.5 text-[#f0c674]" />
                <span>EXPEDITION CAMPAIGN</span>
              </div>

              <button
                onClick={() => setIsLevelSelectorOpen(!isLevelSelectorOpen)}
                className="text-[11px] font-bold text-[#8fbc6f] hover:text-[#f4ecd8] cursor-pointer flex items-center gap-1 bg-[#1e3520] px-2.5 py-1 rounded-lg border border-[#6b8e5a]/50"
              >
                <span>Select Level</span>
                {isLevelSelectorOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Level Switcher Dropdown */}
            {isLevelSelectorOpen && (
              <div className="max-h-48 overflow-y-auto bg-[#1e3520] p-1.5 rounded-xl border border-[#6b8e5a]/50 space-y-1 shadow-inner">
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
                        ? 'bg-[#6b8e5a] text-[#f4ecd8] shadow'
                        : 'text-[#a8b89a] hover:bg-[#2d4a2b] hover:text-[#f4ecd8]'
                    }`}
                  >
                    <span>Lvl {lvl.id}: {lvl.name}</span>
                    {idx === currentLevelIndex && <CheckCircle2 className="w-3.5 h-3.5 text-[#f4ecd8]" />}
                  </button>
                ))}
              </div>
            )}

            {/* Game Mode Selector: Casual Mode vs Locked Try-Hard Mode */}
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#1e3520]/80 rounded-xl border border-[#6b8e5a]/40">
                <button
                  type="button"
                  onClick={() => {
                    onChangeGameMode('casual');
                    sounds.playClick();
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gameMode === 'casual'
                      ? 'btn-river-stone'
                      : 'text-[#a8b89a] hover:text-[#f4ecd8]'
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
                      ? 'text-[#a8b89a]/60 bg-[#1e3520]/40 border border-[#5c3d2e] cursor-pointer hover:border-[#f0c674]'
                      : gameMode === 'tryhard'
                      ? 'btn-sunlight text-[#2b1a11]'
                      : 'text-[#a8b89a] hover:text-[#f4ecd8] cursor-pointer'
                  }`}
                  title={
                    !isTryHardUnlocked
                      ? `Locked: Complete Level 40 to unlock Try-Hard mode (${highestCompletedLevel}/40 completed)`
                      : 'Try-Hard Mode: Requires 1★ + Mastery Challenge completed'
                  }
                >
                  {!isTryHardUnlocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#f0c674]" />
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
                <div className="text-[10px] text-[#f0c674] font-bold bg-[#3a2519]/90 border border-[#f0c674]/50 p-1.5 rounded-xl text-center animate-in fade-in duration-150">
                  {modeNotice}
                </div>
              )}
            </div>

            {/* Primary Action Button: Play Level */}
            <button
              data-tutorial-id="home-play-btn"
              onClick={onStartJourney}
              className="group relative w-full flex items-center justify-between p-3.5 btn-wooden-sign text-[#f4ecd8] shadow-xl border-2 border-[#8fbc6f] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#8fbc6f]/30 border border-[#8fbc6f]/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-[#f4ecd8] text-[#f4ecd8] ml-0.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8fbc6f] block font-rounded">
                    Level {currentLevel.id} of {levels.length}
                  </span>
                  <span className="text-xs sm:text-sm font-bold tracking-wide block truncate max-w-[170px] font-rounded">
                    {currentLevel.name}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#f0c674] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Memories (Visual Novel Story Lore) Button */}
            <button
              onClick={onNavigateMemories}
              className="w-full flex items-center justify-between px-3.5 py-2.5 wood-panel text-[#f4ecd8] hover:border-[#8fbc6f] text-xs font-bold transition-all cursor-pointer shadow"
            >
              <div className="flex items-center gap-2 font-rounded">
                <BookOpen className="w-4 h-4 text-[#7a9b8e]" />
                <span>Memories & Island Relics</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#a8b89a]" />
            </button>

            {/* Level Editor (Admin Tool) Launcher Button */}
            <button
              onClick={() => {
                sounds.playClick();
                if (!isAdminUnlocked) {
                  onOpenAdminAuth?.('Level Editor');
                } else {
                  onOpenLevelEditor();
                }
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 wood-panel text-[#f0c674] hover:border-[#f0c674] text-xs font-bold transition-all cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-2 font-rounded">
                <Hammer className="w-4 h-4 text-[#f0c674]" />
                <span>Map Level Editor 🛠️</span>
              </div>
              {!isAdminUnlocked ? (
                <span className="text-[10px] font-bold bg-[#1e3520] border border-[#6b8e5a] text-[#f0c674] px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#f0c674]" /> Lock
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-[#f0c674]" />
              )}
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
              className="px-4 py-1.5 btn-wooden-sign text-[11px] font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Hammer className="w-3.5 h-3.5 text-[#8fbc6f]" />
              <span>{isBuildingTrayCollapsed ? 'Expand 10 Haven Constructions' : 'Hide Construction Tray'}</span>
              {isBuildingTrayCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!isBuildingTrayCollapsed && (
            <div className="pointer-events-auto w-full wood-panel p-3.5 sm:p-4 flex flex-col gap-3">
              {/* Top Row: Selected Construction Inspector & Upgrade Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-[#5c3d2e]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1e3520] border border-[#6b8e5a]/60 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {selectedItem.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#f4ecd8] font-rounded">
                        {selectedItem.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        selectedItem.currentLevel === 3
                          ? 'bg-[#3a2519] border-[#f0c674] text-[#f0c674]'
                          : selectedItem.currentLevel > 0
                          ? 'bg-[#1e3520] border-[#8fbc6f] text-[#8fbc6f]'
                          : 'bg-[#2b1a11] border-[#5c3d2e] text-[#a8b89a]'
                      }`}>
                        {selectedItem.currentLevel === 0
                          ? 'Unbuilt Plot'
                          : selectedItem.currentLevel === 3
                          ? '🌿 MAX LEVEL 3'
                          : `Level ${selectedItem.currentLevel} / 3`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a8b89a] font-medium mt-0.5 line-clamp-1">
                      {selectedItem.description}
                    </p>
                    <span className="text-[10px] text-[#8fbc6f] font-bold">
                      ✦ {selectedItem.perkDescription}
                    </span>
                  </div>
                </div>

                {/* Upgrade / Build Action Button */}
                <div className="shrink-0 w-full sm:w-auto">
                  {isMaxLevel ? (
                    <div className="px-4 py-2 rounded-xl bg-[#3a2519] border border-[#f0c674] text-[#f0c674] font-bold text-xs flex items-center justify-center gap-2 shadow">
                      <CheckCircle2 className="w-4 h-4 text-[#f0c674]" />
                      <span>Peak Sanctuary Glory Reached 🌿</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpgradeConstruction(selectedItem.id)}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                        canAfford
                          ? 'btn-river-stone text-[#f4ecd8]'
                          : 'bg-[#2b1a11] text-[#a8b89a]/50 border border-[#5c3d2e] cursor-not-allowed'
                      }`}
                    >
                      <Leaf className={`w-4 h-4 ${canAfford ? 'text-[#8fbc6f]' : 'text-[#a8b89a]/50'}`} />
                      <span>
                        {selectedItem.currentLevel === 0 ? 'Build' : 'Upgrade'}: {upgradeCost} Leaves
                      </span>
                      {!canAfford && (
                        <span className="text-[10px] text-[#f0c674]">
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
                      className={`relative p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#6b8e5a]/30 border-[#f0c674] shadow-md scale-105'
                          : isBuilt
                          ? 'bg-[#1e3520] border-[#5c3d2e] hover:border-[#8fbc6f]'
                          : 'bg-[#2b1a11]/60 border-[#3a2519] opacity-60 hover:opacity-100'
                      }`}
                      title={`${item.name} (${item.currentLevel === 0 ? 'Unbuilt' : `Lv ${item.currentLevel}/3`})`}
                    >
                      <span className="text-xl sm:text-2xl">{item.icon}</span>
                      <span className="text-[10px] font-bold text-[#f4ecd8] truncate max-w-full text-center font-rounded">
                        {item.name.split(' ')[0]}
                      </span>

                      {/* Level Tag */}
                      <span
                        className={`text-[9px] px-1.5 rounded-md font-bold ${
                          isMax
                            ? 'bg-[#f0c674] text-[#2b1a11]'
                            : isBuilt
                            ? 'bg-[#6b8e5a] text-[#f4ecd8]'
                            : 'bg-[#2b1a11] text-[#a8b89a]'
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
