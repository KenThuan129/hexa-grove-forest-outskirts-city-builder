import React, { useState } from 'react';
import { Lock, Star, Compass, ArrowLeft, Shield, Sword, Droplets, ChevronRight } from 'lucide-react';
import { LevelConfig, GameModifier, PlayMode } from '../types/game';
import { sounds } from '../utils/audio';

interface JourneyMapProps {
  levels: LevelConfig[];
  highestCompletedLevel: number;
  currentLevelIndex: number;
  playMode: PlayMode;
  gameModifier: GameModifier;
  unlockedModifiers: GameModifier[];
  tightRopeLevelsCleared: number[];
  onSelectLevel: (index: number, useModifier: GameModifier) => void;
  onSelectModifier: (modifier: GameModifier) => void;
  onTogglePlayMode: (mode: PlayMode) => void;
  onNavigateHome: () => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  levels,
  highestCompletedLevel,
  currentLevelIndex,
  playMode,
  gameModifier,
  unlockedModifiers,
  tightRopeLevelsCleared,
  onSelectLevel,
  onSelectModifier,
  onTogglePlayMode,
  onNavigateHome,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(currentLevelIndex);
  const selectedLevel = levels[selectedIdx];

  const chapterIndex = Math.floor(selectedIdx / 10);
  const chapters = Array.from({ length: Math.ceil(levels.length / 10) }, (_, i) => i);
  const currentChapterLevels = levels.slice(chapterIndex * 10, chapterIndex * 10 + 10);

  const handlePlay = () => {
    onSelectLevel(selectedIdx, gameModifier);
  };

  const pathCoords = [
    { x: 10, y: 70 }, { x: 25, y: 40 }, { x: 40, y: 60 }, { x: 55, y: 30 },
    { x: 70, y: 50 }, { x: 85, y: 20 }, { x: 80, y: 70 }, { x: 60, y: 85 },
    { x: 40, y: 90 }, { x: 20, y: 95 },
  ];

  return (
    <div className="w-screen h-screen bg-[#12180e] flex flex-col font-sans select-none overflow-hidden relative">
      {/* Background Map Texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#12180e] via-transparent to-[#12180e] opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[#12180e]/40 pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between p-4 bg-black/60 backdrop-blur-md border-b border-[#5c3d2e]">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="p-2 bg-[#2b1a11] rounded-xl text-[#f0c674] hover:bg-[#3a2519] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#f4ecd8] font-rounded tracking-widest uppercase drop-shadow-md">
              Journey Map
            </h1>
            <p className="text-xs text-[#8fbc6f] font-mono">
              Chapter {chapterIndex + 1} - The Frontier
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-black/60 border border-slate-700 rounded-xl">
            <span className="text-[#f0c674] font-black">{highestCompletedLevel}</span>
            <span className="text-slate-400 text-xs">Cleared</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left: Chapter Tabs */}
        <div className="w-24 flex flex-col gap-2 p-3 overflow-y-auto no-scrollbar border-r border-white/10 bg-black/20">
          {chapters.map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedIdx(ch * 10)}
              className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                chapterIndex === ch
                  ? 'bg-[#3a2519] border-[#f0c674] text-[#f0c674] shadow-[0_0_15px_rgba(240,198,116,0.3)]'
                  : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              <span className="text-xs font-mono font-bold">Ch.{ch + 1}</span>
              <span className="text-[10px] font-bold text-center leading-tight">
                Level {ch * 10 + 1}-{Math.min((ch + 1) * 10, 40)}
              </span>
            </button>
          ))}
        </div>

        {/* Center: Node Map */}
        <div className="flex-1 relative bg-black/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(143,188,111,0.05)_0%,transparent_70%)]" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <polyline
              points={pathCoords.map((c) => `${c.x}%, ${c.y}%`).join(' ')}
              fill="none"
              stroke="#5c3d2e"
              strokeWidth="6"
              strokeDasharray="10 10"
              className="opacity-50"
            />
          </svg>

          {currentChapterLevels.map((lvl, i) => {
            const actualIdx = chapterIndex * 10 + i;
            const isUnlocked = actualIdx <= highestCompletedLevel;
            const isSelected = actualIdx === selectedIdx;
            const isCompleted = actualIdx < highestCompletedLevel;
            const isTightRopeCleared = tightRopeLevelsCleared.includes(lvl.id);
            const pos = pathCoords[i];

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedIdx(actualIdx);
                    sounds.playClick();
                  } else {
                    sounds.playWarning();
                  }
                }}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                } ${
                  !isUnlocked
                    ? 'bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed grayscale'
                    : isCompleted
                    ? 'bg-[#2d4a2b] border-[#8fbc6f] shadow-[0_0_20px_rgba(143,188,111,0.4)]'
                    : 'bg-[#3a2519] border-[#f0c674] shadow-[0_0_20px_rgba(240,198,116,0.4)]'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 rounded-full backdrop-blur-sm" />
                )}

                {!isUnlocked ? (
                  <Lock className="w-6 h-6 text-slate-500 relative z-10" />
                ) : (
                  <span className="text-xl font-black font-mono text-white relative z-10 drop-shadow-md">
                    {lvl.id}
                  </span>
                )}

                {isCompleted && (
                  <div className="absolute -bottom-3 flex gap-0.5 z-10">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow" />
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow" />
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow" />
                  </div>
                )}

                {isTightRopeCleared && (
                  <div
                    className="absolute -top-2 -right-2 bg-rose-600 rounded-full p-1.5 border-2 border-[#12180e] shadow-lg z-20"
                    title="Cleared with Tight Rope"
                  >
                    <Sword className="w-4 h-4 text-white" />
                  </div>
                )}

                {isSelected && (
                  <div className="absolute -inset-3 rounded-full border-2 border-white/30 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Detail Panel */}
        <div className="w-80 m-4 bg-[#1a120b]/95 backdrop-blur-xl border-2 border-[#5c3d2e] rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-black text-[#f0c674] uppercase tracking-widest">
                LEVEL {selectedLevel.id}
              </span>
            </div>
            <h2 className="text-xl font-black text-white font-rounded leading-tight drop-shadow">
              {selectedLevel.name}
            </h2>
            <p className="text-xs text-[#a8b89a] mt-1">{selectedLevel.subtitle}</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            {/* Objectives */}
            <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Objectives</div>
              {playMode === 'building' ? (
                <div className="flex items-start gap-2 text-xs text-amber-200">
                  <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Fill all Target Colored Zones with <strong>ZERO penalties</strong>.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-cyan-200">
                  <Star className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    Reach <strong>{selectedLevel.targetScore?.star1 || 100} Points</strong> (1★) & manage penalties.
                  </span>
                </div>
              )}
            </div>

            {/* Active Mode (1 nút toggle duy nhất) */}
            <div className="p-3 rounded-2xl bg-black/40 border border-slate-800 flex flex-col gap-2">
              <div className="text-[10px] font-black text-slate-400 uppercase">Active Mode</div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onTogglePlayMode('building');
                    sounds.playClick();
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer border ${
                    playMode === 'building'
                      ? 'bg-amber-950 border-amber-500 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span>Building</span>
                  <span className="text-[8.5px] opacity-75 font-normal">Lightbulbs</span>
                </button>
                <button
                  onClick={() => {
                    onTogglePlayMode('concrete');
                    sounds.playClick();
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer border ${
                    playMode === 'concrete'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span>Concrete</span>
                  <span className="text-[8.5px] opacity-75 font-normal">Score & Penalty</span>
                </button>
              </div>

              {/* Expanded Modifier Select — chỉ hiện khi Concrete */}
              {playMode === 'concrete' && (
                <div className="flex flex-col gap-1.5 mt-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    Select Modifier:
                  </div>

                  {/* Safety Guard */}
                  <button
                    onClick={() => {
                      onSelectModifier('safety_guard');
                      sounds.playClick();
                    }}
                    className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                      gameModifier === 'safety_guard'
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-[10px] font-bold">Safety Guard</div>
                      <div className="text-[8px] opacity-80">No penalties. Score capped at 1★.</div>
                    </div>
                  </button>

                  {/* Tight Rope */}
                  {unlockedModifiers.includes('tight_rope') && (
                    <button
                      onClick={() => {
                        onSelectModifier('tight_rope');
                        sounds.playClick();
                      }}
                      className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                        gameModifier === 'tight_rope'
                          ? 'border-rose-500 bg-rose-950/50 text-rose-200'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <Sword className="w-4 h-4 shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-[10px] font-bold">Tight Rope</div>
                        <div className="text-[8px] opacity-80">Strict 3★ or Fail.</div>
                      </div>
                    </button>
                  )}

                  {/* Cold Sea — chỉ hiện khi unlock */}
                  {unlockedModifiers.includes('cold_sea') && (
                    <button
                      onClick={() => {
                        onSelectModifier('cold_sea');
                        sounds.playClick();
                      }}
                      className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                        gameModifier === 'cold_sea'
                          ? 'border-blue-500 bg-blue-950/50 text-blue-200'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <Droplets className="w-4 h-4 shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-[10px] font-bold">Cold Sea</div>
                        <div className="text-[8px] opacity-80">1-Hex-Use + HP Countdown.</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handlePlay}
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-[#8fbc6f] to-[#435e38] border-2 border-[#c8e0b0] text-[#f4ecd8] font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(143,188,111,0.4)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Compass className="w-5 h-5" />
            Play Stage
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};