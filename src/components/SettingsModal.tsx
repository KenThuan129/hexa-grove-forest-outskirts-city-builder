import React from 'react';
import { Volume2, VolumeX, RotateCcw, X, HelpCircle, Sliders, CheckCircle2, Award, Zap, Lock, Sparkles, Compass, Lightbulb, Trophy, Hammer, ShieldCheck, Cloud, RefreshCw, AlertCircle } from 'lucide-react';
import { GameMode, PlayMode } from '../types/game';
import { sounds } from '../utils/audio';
import { MobileSettingsModal } from './mobile/settings/MobileSettingsModal';
import { useLayout } from '../context/LayoutContext';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  gameMode?: GameMode;
  playMode?: PlayMode;
  performanceMode?: 'low' | 'high';
  targetFps?: 60 | 30 | 24;
  isLowPowerMode?: boolean;
  textureQuality?: 'high' | 'low';
  highestCompletedLevel?: number;
  isAdminUnlocked?: boolean;
  isGuest?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error' | 'signed-out';
  lastSyncedAt?: number | null;
  syncError?: string | null;
  userEmail?: string | null;
  onForceSync?: () => void;
  onWipeCloudSave?: () => void;
  onSignOut?: () => void;
  onChangeGameMode?: (mode: GameMode) => void;
  onChangePlayMode?: (mode: PlayMode) => void;
  onTogglePerformanceMode?: (mode: 'low' | 'high') => void;
  onChangeTargetFps?: (fps: 60 | 30 | 24) => void;
  onToggleLowPowerMode?: (enabled: boolean) => void;
  onToggleTextureQuality?: (quality: 'high' | 'low') => void;
  onRequestGraphicsReload?: (
    newMode: 'low' | 'high',
    newFps: 60 | 30 | 24,
    newTextureQuality?: 'high' | 'low'
  ) => void;
  /** Mobile: apply graphics immediately without reload modal. */
  onApplyGraphicsNow?: (
    newMode: 'low' | 'high',
    newFps: 60 | 30 | 24,
    newTextureQuality?: 'high' | 'low'
  ) => void;
  onOpenDevDebugger?: () => void;
  onOpenLevelEditor?: () => void;
  onOpenAdminAuth?: (featureName?: string) => void;
  onToggleSound: () => void;
  onResetTutorial?: () => void;
  onPlayIntro?: () => void;
  onRequestAuth?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  soundEnabled,
  gameMode = 'casual',
  playMode = 'building',
  performanceMode = 'low',
  targetFps = 60,
  isLowPowerMode = false,
  textureQuality = 'high',
  highestCompletedLevel = 0,
  isAdminUnlocked = false,
  isGuest = false,
  syncStatus = 'signed-out',
  lastSyncedAt = null,
  syncError = null,
  userEmail = null,
  onForceSync,
  onWipeCloudSave,
  onSignOut,
  onChangeGameMode,
  onChangePlayMode,
  onTogglePerformanceMode,
  onChangeTargetFps,
  onToggleLowPowerMode,
  onToggleTextureQuality,
  onRequestGraphicsReload,
  onApplyGraphicsNow,
  onOpenDevDebugger,
  onOpenLevelEditor,
  onOpenAdminAuth,
  onToggleSound,
  onResetTutorial,
  onPlayIntro,
  onRequestAuth,
  onClose,
}) => {
  // Layout hook must be called before any early return.
  const layout = useLayout();

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────
  // Mobile: hypercasual nested navigation (menu → sub-screens)
  // ─────────────────────────────────────────────────────────────
  if (layout.useMobileLayout) {
    return (
      <MobileSettingsModal
        isOpen={isOpen}
        onClose={onClose}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        playMode={playMode}
        onChangePlayMode={onChangePlayMode ?? (() => {})}
        isAdminUnlocked={isAdminUnlocked}
        onRequestAdminAuth={onOpenAdminAuth}
        gameMode={gameMode}
        onChangeGameMode={onChangeGameMode ?? (() => {})}
        highestCompletedLevel={highestCompletedLevel}
        performanceMode={performanceMode}
        targetFps={targetFps}
        isLowPowerMode={isLowPowerMode}
        textureQuality={textureQuality}
        onApplyGraphicsNow={onApplyGraphicsNow ?? (() => {})}
        onToggleLowPowerMode={onToggleLowPowerMode ?? (() => {})}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        syncError={syncError}
        userEmail={userEmail}
        isGuest={isGuest}
        onForceSync={onForceSync ?? (() => {})}
        onWipeCloudSave={onWipeCloudSave ?? (() => {})}
        onSignOut={onSignOut ?? (() => {})}
        onRequestAuth={onRequestAuth}
        onPlayIntro={onPlayIntro}
        onResetTutorial={onResetTutorial}
        onOpenLevelEditor={onOpenLevelEditor ?? (() => {})}
        onOpenDevDebugger={onOpenDevDebugger ?? (() => {})}
      />
    );
  }

  const isTryHardUnlocked = highestCompletedLevel >= 40;

  const handleTryHardClick = () => {
    if (!isAdminUnlocked) {
      sounds.playWarning();
      onOpenAdminAuth?.('Try-Hard Mode');
      return;
    }
    if (!isTryHardUnlocked) {
      sounds.playWarning();
      return;
    }
    onChangeGameMode?.('tryhard');
    sounds.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e3520]/80 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-md wood-panel text-[#f4ecd8] border-2 border-[#5c3d2e] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cozy Forest Header */}
        <div className="bg-gradient-to-r from-[#2d4a2b] via-[#3a2519] to-[#2d4a2b] text-[#f4ecd8] p-4 sm:p-5 border-b border-[#5c3d2e] flex items-center justify-between">
          <div className="flex items-center gap-3 font-rounded">
            <div className="w-9 h-9 rounded-xl bg-[#6b8e5a]/30 border border-[#8fbc6f]/50 flex items-center justify-center text-[#f0c674] shadow-inner">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#f4ecd8] flex items-center gap-1.5">
                <span>Sanctuary Settings</span>
                <span className="text-[10px] font-mono font-bold text-[#f0c674] bg-[#1e3520] px-1.5 py-0.5 rounded-md border border-[#6b8e5a]">
                  v2.4
                </span>
              </h3>
              <p className="text-[10.5px] text-[#a8b89a]">Audio, Game Modes & Forest Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e3520] hover:bg-[#2d4a2b] flex items-center justify-center text-[#a8b89a] hover:text-[#f4ecd8] transition-colors cursor-pointer border border-[#5c3d2e]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 text-xs max-h-[80vh] overflow-y-auto">
          <CloudAccountPanel
            onRequestAuth={onRequestAuth}
            onForceSync={onForceSync}
            onWipeCloudSave={onWipeCloudSave}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            syncError={syncError}
          />

          {/* Primary Play Mode Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs">Primary Play Mode</span>
              </div>
              <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${playMode === 'building'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                }`}>
                {playMode === 'building' ? 'Building Mode' : 'Challenger Mode'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => {
                  onChangePlayMode?.('building');
                  sounds.playClick();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${playMode === 'building'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-slate-950 font-black shadow-lg shadow-amber-950/50 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Lightbulb className="w-4 h-4 fill-current" />
                  <span>Building Mode</span>
                </div>
                <span className="text-[10px] opacity-90 leading-tight">
                  Lightbulb budget, 0 stars, 0 penalties
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  if (!isAdminUnlocked) {
                    onOpenAdminAuth?.('Challenger Mode');
                  } else {
                    onChangePlayMode?.('challenger');
                  }
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${playMode === 'challenger'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white font-black shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {isGuest ? <Lock className="w-4 h-4 text-amber-400" /> : <Trophy className="w-4 h-4 text-cyan-200" />}
                  <span>{!isGuest ? 'Challenger Mode' : '???'}</span>
                </div>
                <span className="text-[10px] opacity-90 leading-tight">
                  {isGuest ? '🔒 Requires Login' : 'Stars, target scores, par quotas'}
                </span>
              </button>

            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">Expedition Challenge Mode</span>
              </div>
              <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${gameMode === 'casual'
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
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${gameMode === 'casual'
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

              <button
                type="button"
                onClick={handleTryHardClick}
                className={`relative p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${!isTryHardUnlocked
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
                  {!isGuest && !isTryHardUnlocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-slate-400">{!isGuest ? 'Try-hard' : '?.?'}</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-amber-300" />
                      <span className={gameMode === 'tryhard' ? 'text-white' : 'text-amber-300'}>{!isGuest ? 'Try-hard' : '?.?'}</span>
                    </>
                  )}
                </div>

                <span className="text-[9.5px] leading-tight">
                  {!isTryHardUnlocked ? (
                    <span className="text-amber-400/90 font-mono font-bold">
                      🔒 Unlocks at Lvl 40 ({highestCompletedLevel}/40)
                    </span>
                  ) : (
                    <span className="text-slate-400">{!isGuest ? '1★ + Mastery required to win' : '???'}</span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Graphics & Performance Preset (For Low-End Devices) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs">Graphics & FPS Performance</span>
              </div>
              <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${performanceMode === 'low'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}>
                {performanceMode === 'low' ? '⚡ Ultra-Performance' : '✨ High Quality FX'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  if (performanceMode !== 'low') {
                    onRequestGraphicsReload?.('low', targetFps);
                  }
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${performanceMode === 'low'
                  ? 'bg-cyan-950/90 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
              >
                <span className="font-bold text-xs text-cyan-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ultra Performance</span>
                </span>
                <span className="text-[9.5px] text-slate-400 leading-tight">
                  Smooth performance on low-end CPUs / Intel HD
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  if (performanceMode !== 'high') {
                    onRequestGraphicsReload?.('high', targetFps);
                  }
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${performanceMode === 'high'
                  ? 'bg-amber-950/90 border-amber-500/80 text-white shadow-lg shadow-amber-950/50 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
              >
                <span className="font-bold text-xs text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>High FX Quality</span>
                </span>
                <span className="text-[9.5px] text-slate-400 leading-tight">
                  Realtime GPU shadows & particle effects
                </span>
              </button>
            </div>

            {/* Target FPS Cap Dropdown / Selector (60 FPS, 30 FPS, 24 FPS) */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-200">Target Frame Rate Cap</span>
                <span className="text-[10px] text-slate-400 font-mono">Locks render loop rate</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {([60, 30, 24] as const).map(fpsOption => (
                  <button
                    key={fpsOption}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      if (targetFps !== fpsOption) {
                        onRequestGraphicsReload?.(performanceMode, fpsOption);
                      }
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${targetFps === fpsOption
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                  >
                    {fpsOption} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Low-Power & Resolution Scale Mode Toggle */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Low-Power Resolution Mode</span>
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                  Scales resolution (0.75x DPR) & disables particles for thermal / battery boost
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onToggleLowPowerMode?.(!isLowPowerMode);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border whitespace-nowrap ${isLowPowerMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md shadow-amber-950/40'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
              >
                {isLowPowerMode ? '⚡ Active (0.75x)' : 'Off'}
              </button>
            </div>

            {/* Texture Quality & VRAM Optimization Toggle (<2GB GPU memory target) */}
            <div className="pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Texture Mipmap Quality</span>
                </span>
                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  &lt; 2GB GPU Target
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Reduces texture mipmapping levels &amp; resolution scale to save up to 75% VRAM on budget or integrated GPUs.
              </p>

              <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    if (textureQuality !== 'high') {
                      onRequestGraphicsReload?.(performanceMode, targetFps, 'high');
                    }
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center flex flex-col items-center gap-0.5 ${textureQuality === 'high'
                    ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                >
                  <span className="text-[11px]">High (Full Mipmaps)</span>
                  <span className="text-[9px] font-normal text-slate-400">Crisp Bilinear/Trilinear</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    if (textureQuality !== 'low') {
                      onRequestGraphicsReload?.(performanceMode, targetFps, 'low');
                    }
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center flex flex-col items-center gap-0.5 ${textureQuality === 'low'
                    ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                >
                  <span className="text-[11px]">Low VRAM (Compressed)</span>
                  <span className="text-[9px] font-normal text-amber-300/80">Saves 75% VRAM (&lt;2GB)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Developer Option Trigger */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-cyan-300 block text-xs flex items-center gap-1">
                <span>Developer Device Debugger</span>
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">TAB</span>
              </span>
              <span className="text-[10px] text-slate-400">Live hardware telemetry, GPU metrics & dev controls</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenDevDebugger?.();
              }}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 shadow transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Open Overlay</span>
            </button>
          </div>

          {/* Sound Setting */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
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
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${soundEnabled
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


          {!isGuest && (
            <>
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
              {/* Level Editor & Admin Tool Launch Button */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                <div>
                  <span className="font-bold text-amber-200 block text-xs flex items-center gap-1.5">
                    <Hammer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Level Editor &amp; Map Builder</span>
                  </span>
                  <span className="text-[10px] text-amber-300/80">
                    {!isAdminUnlocked ? '🔒 Protected by Admin Passcode' : 'Create & edit map phases, boss stats & stock'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (!isAdminUnlocked) {
                      onOpenAdminAuth?.('Level Editor');
                    } else {
                      onOpenLevelEditor?.();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  {!isAdminUnlocked ? 'Unlock' : 'Launch Editor 🛠️'}
                </button>
              </div>
            </>
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

// ─────────────────────────────────────────────────────────────────
// Cloud Account Panel
// ─────────────────────────────────────────────────────────────────

const CloudAccountPanel: React.FC<{
  onRequestAuth?: () => void;
  onForceSync?: () => void;
  onWipeCloudSave?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error' | 'signed-out';
  lastSyncedAt?: number | null;
  syncError?: string | null;
}> = ({
  onRequestAuth,
  onForceSync,
  onWipeCloudSave,
  syncStatus = 'signed-out',
  lastSyncedAt = null,
  syncError = null,
}) => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white text-xs">Cloud Account</span>
          <span className="ml-auto text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
            Signed Out
          </span>
        </div>
        <p className="text-[10.5px] text-slate-300 leading-relaxed">
          Sign in to unlock all 40 levels and sync your progress across devices.
          Guests can play 5 trial levels.
        </p>
        <button
          onClick={() => onRequestAuth?.()}
          className="w-full py-2 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const statusLabel =
    syncStatus === 'syncing'
      ? 'Syncing…'
      : syncStatus === 'error'
      ? 'Sync error'
      : syncStatus === 'synced'
      ? 'Synced'
      : 'Idle';

  const statusColor =
    syncStatus === 'syncing'
      ? 'bg-amber-950 text-amber-300 border-amber-500/50'
      : syncStatus === 'error'
      ? 'bg-rose-950 text-rose-300 border-rose-500/50'
      : syncStatus === 'synced'
      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
      : 'bg-slate-950 text-slate-400 border-slate-800';

  return (
    <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Cloud className="w-4 h-4 text-emerald-400" />
        <span className="font-bold text-white text-xs">Cloud Account</span>
        <span
          className={`ml-auto text-[9.5px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusColor}`}
        >
          {syncStatus === 'syncing' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
          {syncStatus === 'synced' && <CheckCircle2 className="w-2.5 h-2.5" />}
          {syncStatus === 'error' && <AlertCircle className="w-2.5 h-2.5" />}
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
          Signed in as
        </span>
        <span className="text-xs font-mono text-emerald-200 truncate">
          {user.email}
        </span>
        {lastSyncedAt && (
          <span className="text-[9.5px] font-mono text-slate-500">
            Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}
          </span>
        )}
        {syncError && (
          <span className="text-[9.5px] font-mono text-rose-300 truncate" title={syncError}>
            {syncError}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onForceSync?.()}
          disabled={syncStatus === 'syncing'}
          className="py-2 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          <span>Sync Now</span>
        </button>

        <button
          onClick={() => onWipeCloudSave?.()}
          className="py-2 rounded-xl font-bold text-xs bg-slate-900 hover:bg-rose-950 text-rose-300 border border-rose-500/40"
        >
          Wipe Cloud Save
        </button>
      </div>

      <button
        onClick={() => signOut()}
        className="w-full py-2 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/40"
      >
        Sign Out
      </button>
    </div>
  );
};