import React, { useState } from 'react';
import { LevelConfig, GameMode, AcePerkId } from '../types/game';
import { ACE_PERKS } from '../data/memories';
import { HomeShowcaseSpotlight } from './HomeShowcaseSpotlight';
import {
  Compass,
  Play,
  Settings,
  BookOpen,
  Wrench,
  Sparkles,
  HelpCircle,
  Star,
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2,
  Flame,
  Award,
} from 'lucide-react';

interface HomePageProps {
  levels: LevelConfig[];
  currentLevelIndex: number;
  isOpenShowcase?: boolean;
  gameMode?: GameMode;
  equippedAce?: AcePerkId | null;
  onCloseShowcase?: () => void;
  onSelectLevel: (index: number) => void;
  onStartJourney: () => void;
  onNavigateMemories: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenLevelEditor: () => void;
  onChangeGameMode?: (mode: GameMode) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  levels,
  currentLevelIndex,
  isOpenShowcase = false,
  gameMode = 'tryhard',
  equippedAce = null,
  onCloseShowcase = () => {},
  onSelectLevel,
  onStartJourney,
  onNavigateMemories,
  onOpenSettings,
  onOpenRules,
  onOpenLevelEditor,
  onChangeGameMode = () => {},
}) => {
  const [showLevelSelectModal, setShowLevelSelectModal] = useState(false);
  const currentLevel = levels[currentLevelIndex] || levels[0];
  const activeAceObj = ACE_PERKS.find(a => a.id === equippedAce);

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-slate-950 font-sans select-none text-slate-100 flex flex-col justify-between">
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
      {/* Ambient Atmospheric Hex Background with Mountain Dawn Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0b1526] to-[#040810]" />
        
        {/* Soft Dawn Sunbeams */}
        <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        {/* Subtle geometric grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Bar with Settings & Rules */}
      <header className="relative z-10 w-full p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            v1.0 Expedition Ready
          </span>
        </div>

        <div data-tutorial-id="home-rules-settings-bar" className="flex items-center gap-2">
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md text-xs font-bold transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Rules</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md text-xs font-bold transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Action Center */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 text-center my-auto">
        {/* Emblem & Game Title Branding */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-1 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center backdrop-blur-sm border border-emerald-400/30">
                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 drop-shadow-md animate-pulse" />
              </div>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-teal-500/20 rounded-3xl blur-xl -z-10" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg flex items-center justify-center gap-2">
              <span>HEXA PIONEER</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-emerald-300/90 tracking-wide mt-1">
              Frontier Settlement & Spatial Architecture
            </p>
          </div>
        </div>

        {/* Action Buttons Hub */}
        <div className="flex flex-col gap-3 w-full max-w-sm sm:max-w-md">
          {/* Game Mode Selector: Casual Mode vs Try-Hard Mode */}
          <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <span>Game Mode</span>
              <span className={gameMode === 'tryhard' ? 'text-amber-400' : 'text-emerald-400'}>
                {gameMode === 'tryhard' ? '★ 3-Star Rating' : '✓ Mastery Objective Only'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onChangeGameMode('casual')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  gameMode === 'casual'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Casual Mode</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeGameMode('tryhard')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  gameMode === 'tryhard'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Try-hard Mode</span>
              </button>
            </div>
          </div>

          {/* Active Ace Perk Indicator if equipped */}
          {activeAceObj && (
            <div
              onClick={onNavigateMemories}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/90 to-purple-950/90 border border-amber-500/50 shadow-lg flex items-center justify-between text-xs cursor-pointer hover:border-amber-400 transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl filter drop-shadow">{activeAceObj.icon}</span>
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block leading-tight">
                    Equipped Ace Perk
                  </span>
                  <span className="font-bold text-amber-100 group-hover:text-white">
                    {activeAceObj.name}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-700">
                <span>Manage</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          )}

          {/* Main Play Button: "Level + <current level progression>" */}
          <button
            data-tutorial-id="home-play-btn"
            onClick={onStartJourney}
            className="group relative w-full flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-2xl shadow-emerald-950/80 border border-emerald-400/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block">
                  Level {currentLevel.id} of {levels.length} · {gameMode === 'tryhard' ? 'Try-hard' : 'Casual'}
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight">
                  {currentLevel.name}
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Buttons Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Level Editor Button (Opens Coming Soon Popup) */}
            <button
              data-tutorial-id="home-editor-btn"
              onClick={onOpenLevelEditor}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg text-xs font-bold transition-all cursor-pointer group"
            >
              <Wrench className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span>Level Editor</span>
            </button>

            {/* Memories Gallery Button */}
            <button
              data-tutorial-id="home-memories-btn"
              onClick={onNavigateMemories}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg text-xs font-bold transition-all cursor-pointer group"
            >
              <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Memories</span>
            </button>
          </div>

          {/* Level Select Selector Bar */}
          <button
            data-tutorial-id="home-level-selector-btn"
            onClick={() => setShowLevelSelectModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Specific Level (1 - {levels.length})</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-4 text-center text-[10px] text-slate-500 border-t border-slate-800/60 max-w-6xl mx-auto">
        <p>Hexa Pioneer · 40 Levels Grand Expedition · Atmospheric Hex Puzzle Architecture</p>
      </footer>

      {/* Level Selection Modal */}
      {showLevelSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black tracking-wide">Select Level (1 to {levels.length})</h3>
              </div>
              <button
                onClick={() => setShowLevelSelectModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Level Grid (40 Levels) */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {levels.map((lvl, idx) => {
                const isCurrent = idx === currentLevelIndex;
                const tier =
                  lvl.isBossLevel
                    ? '👹 BOSS'
                    : lvl.id > 30
                    ? 'Tier 4: Master'
                    : lvl.id > 20
                    ? 'Tier 3: Expert'
                    : lvl.id > 10
                    ? 'Tier 2: Journey'
                    : 'Tier 1: Pioneer';

                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      onSelectLevel(idx);
                      setShowLevelSelectModal(false);
                      onStartJourney();
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      lvl.isBossLevel
                        ? isCurrent
                          ? 'bg-rose-950/90 border-rose-500 text-white shadow-lg ring-2 ring-rose-500'
                          : 'bg-rose-950/40 hover:bg-rose-950/70 border-rose-800/80 text-rose-100 hover:text-white'
                        : isCurrent
                        ? 'bg-emerald-950/80 border-emerald-500/80 text-white shadow-lg ring-1 ring-emerald-500'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                          lvl.isBossLevel
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isCurrent
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {lvl.id}
                      </div>
                      <div>
                        <span className="text-xs font-bold block truncate max-w-[150px]">
                          {lvl.name}
                        </span>
                        <span className="text-[9.5px] text-slate-400 truncate block max-w-[150px]">
                          {lvl.subtitle}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-lg border ${
                        lvl.isBossLevel
                          ? 'bg-rose-900/80 text-rose-300 border-rose-700'
                          : 'bg-slate-900/80 text-cyan-300 border-slate-700'
                      }`}
                    >
                      {tier}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
