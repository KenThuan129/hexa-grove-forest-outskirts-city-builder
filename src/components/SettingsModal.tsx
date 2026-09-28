import React from 'react';
import { Volume2, VolumeX, RotateCcw, X, HelpCircle, Sliders, CheckCircle2, Award, Zap, Lock, Sparkles, Compass } from 'lucide-react';
import { GameMode } from '../types/game';
import { sounds } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  gameMode?: GameMode;
  highestCompletedLevel?: number;
  onChangeGameMode?: (mode: GameMode) => void;
  onToggleSound: () => void;
  onResetTutorial?: () => void;
  onPlayIntro?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  soundEnabled,
  gameMode = 'casual',
  highestCompletedLevel = 0,
  onChangeGameMode,
  onToggleSound,
  onResetTutorial,
  onPlayIntro,
  onClose,
}) => {
  if (!isOpen) return null;

  const isTryHardUnlocked = highestCompletedLevel >= 40;

  const handleTryHardClick = () => {
    if (!isTryHardUnlocked) {
      sounds.playWarning();
      return;
    }
    onChangeGameMode?.('tryhard');
    sounds.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-md bg-slate-900/95 text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cozy Modern Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Sanctuary Settings</span>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                  v2.4
                </span>
              </h3>
              <p className="text-[10.5px] text-slate-400">Audio, Game Modes & Archipelago Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Game Mode Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">Expedition Challenge Mode</span>
              </div>
              <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                gameMode === 'casual'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                {gameMode === 'casual' ? 'Casual Progression' : 'Try-Hard Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-0.5">
              {/* Casual Mode Button */}
              <button
                type="button"
                onClick={() => {
                  onChangeGameMode?.('casual');
                  sounds.playClick();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                  gameMode === 'casual'
                    ? 'bg-emerald-950/90 border-emerald-500/80 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Casual Mode</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Stress-free play, zero star restrictions to advance
                </span>
              </button>

              {/* Try Hard Mode Button (Locked until Level 40) */}
              <button
                type="button"
                onClick={handleTryHardClick}
                className={`relative p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  !isTryHardUnlocked
                    ? 'bg-slate-950/80 border-slate-800/80 text-slate-500 cursor-not-allowed opacity-75'
                    : gameMode === 'tryhard'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-orange-400 text-white shadow-lg shadow-amber-950/50 scale-[1.02] cursor-pointer'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:bg-slate-800/80 cursor-pointer'
                }`}
                title={
                  !isTryHardUnlocked
                    ? `Locked: Complete Level 40 to unlock Try-Hard mode (${highestCompletedLevel}/40 completed)`
                    : 'Try-Hard Mode: Requires 1★ + Mastery Challenge completed'
                }
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {!isTryHardUnlocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-slate-400">Try-Hard</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-amber-300" />
                      <span className={gameMode === 'tryhard' ? 'text-white' : 'text-amber-300'}>Try-Hard</span>
                    </>
                  )}
                </div>

                <span className="text-[9.5px] leading-tight">
                  {!isTryHardUnlocked ? (
                    <span className="text-amber-400/90 font-mono font-bold">
                      🔒 Unlocks at Lvl 40 ({highestCompletedLevel}/40)
                    </span>
                  ) : (
                    <span className="text-slate-400">1★ + Mastery required to win</span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Sound Setting */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  soundEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-bold text-white block text-xs">Acoustic Atmosphere</span>
                <span className="text-[10px] text-slate-400">Harmonic bells, wooden tile clacks & chimes</span>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                soundEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Special Intro Replay */}
          {onPlayIntro && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-200 block text-xs">Cinematic Prologue</span>
                  <span className="text-[10px] text-amber-300/80 font-serif italic">&ldquo;Rejoyce, a journey up for the youth&rdquo;</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onPlayIntro();
                }}
                className="px-3 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 shadow-md transition-all cursor-pointer hover:scale-105"
              >
                Replay
              </button>
            </div>
          )}

          {/* Controls Quick Ref */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <span className="font-bold text-[11px] text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Island Builder Shortcuts</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-400">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/90">
                <strong className="text-slate-200 block">Left-Click:</strong> Place / Pick up tile
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/90">
                <strong className="text-slate-200 block">Right-Click:</strong> Return tile / cluster
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/90">
                <strong className="text-slate-200 block">'R' Key:</strong> Rotate giant cluster
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/90">
                <strong className="text-slate-200 block">'H' Key:</strong> Toggle Clean View
              </div>
            </div>
          </div>

          {/* Tutorial Reset */}
          {onResetTutorial && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block text-xs">Replay Tutorial Guidance</span>
                <span className="text-[10px] text-slate-400">Jump back to Level 1 with interactive spotlight</span>
              </div>
              <button
                onClick={() => {
                  onResetTutorial();
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          )}

          {/* Save & Return Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1 hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Save & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
