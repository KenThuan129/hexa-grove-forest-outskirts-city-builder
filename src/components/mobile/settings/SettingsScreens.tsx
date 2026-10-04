// src/components/mobile/settings/SettingsScreens.tsx

import React from 'react';
import {
    Cloud,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    LogIn,
    LogOut,
    Trash2,
    Volume2,
    VolumeX,
    Lightbulb,
    Trophy,
    Zap,
    Sparkles,
    Award,
    CheckCircle2 as CheckIcon,
    HelpCircle,
    BookOpen,
    Lock,
    Compass,
    Hammer,
    Play,
    RotateCcw,
} from 'lucide-react';
import { SettingsRow } from './SettingsRow';
import { sounds } from '../../../utils/audio';
import { GameMode, PlayMode } from '../../../types/game';

// ─────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────

export interface SettingsScreenCommonProps {
    // Sound
    soundEnabled: boolean;
    onToggleSound: () => void;

    // Play mode
    playMode: PlayMode;
    onChangePlayMode: (mode: PlayMode) => void;
    isAdminUnlocked: boolean;
    onRequestAdminAuth?: (feature: string) => void;

    // Game mode
    gameMode: GameMode;
    onChangeGameMode: (mode: GameMode) => void;
    highestCompletedLevel: number;

    // Graphics
    performanceMode: 'low' | 'high';
    targetFps: 60 | 30 | 24;
    isLowPowerMode: boolean;
    textureQuality: 'high' | 'low';
    /** Mobile: apply immediately, no reload modal. */
    onApplyGraphicsNow: (
        mode: 'low' | 'high',
        fps: 60 | 30 | 24,
        quality?: 'high' | 'low'
    ) => void;
    onToggleLowPowerMode: (enabled: boolean) => void;

    // Cloud / Account
    syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'signed-out';
    lastSyncedAt: number | null;
    syncError: string | null;
    userEmail?: string | null;
    isGuest: boolean;
    onForceSync: () => void;
    onWipeCloudSave: () => void;
    onSignOut: () => void;
    onRequestAuth?: () => void;

    // Intro
    onPlayIntro?: () => void;

    // Tutorial
    onResetTutorial?: () => void;

    // Editor
    onOpenLevelEditor: () => void;
    onOpenDevDebugger: () => void;
}

// ─────────────────────────────────────────────────────────────────
// 1. Menu screen
// ─────────────────────────────────────────────────────────────────

interface MenuScreenProps extends SettingsScreenCommonProps {
    onNavigate: (screen: string) => void;
}

export const SettingsMenuScreen: React.FC<MenuScreenProps> = (props) => {
    const {
        soundEnabled,
        onToggleSound,
        playMode,
        gameMode,
        highestCompletedLevel,
        performanceMode,
        isAdminUnlocked,
        isGuest,
        onRequestAuth,
        onNavigate,
    } = props;

    const challengeLabel =
        gameMode === 'casual'
            ? 'Casual'
            : highestCompletedLevel >= 40
                ? 'Try-Hard'
                : `Lvl ${highestCompletedLevel}/40`;

    const challengeAccent =
        gameMode === 'tryhard' ? 'text-amber-300' : 'text-[#a8b89a]';

    const graphicsLabel =
        performanceMode === 'low' ? 'Ultra' : 'High FX';

    return (
        <div className="flex flex-col gap-2 px-1">
            {/* Sound — inline toggle */}
            <SettingsRow
                icon={soundEnabled ? <Volume2 className="w-4 h-4 text-[#8fbc6f]" /> : <VolumeX className="w-4 h-4 text-[#a8b89a]" />}
                label="Sound"
                kind="toggle"
                toggleValue={soundEnabled}
                onTap={() => onToggleSound()}
            />

            {/* Play Mode — navigate */}
            <SettingsRow
                icon={<Lightbulb className="w-4 h-4 text-[#f0c674]" />}
                label="Play Mode"
                kind="navigate"
                value={playMode === 'building' ? 'Building' : 'Challenger'}
                valueAccent={playMode === 'challenger' ? 'text-cyan-300' : 'text-amber-300'}
                onTap={() => onNavigate('playMode')}
            />

            {/* Challenge Mode — navigate */}
            <SettingsRow
                icon={<Trophy className="w-4 h-4 text-[#f0c674]" />}
                label="Challenge Mode"
                kind="navigate"
                value={challengeLabel}
                valueAccent={challengeAccent}
                onTap={() => onNavigate('challenge')}
            />

            {/* Graphics — navigate */}
            <SettingsRow
                icon={<Zap className="w-4 h-4 text-cyan-400" />}
                label="Graphics & FPS"
                kind="navigate"
                value={graphicsLabel}
                valueAccent={performanceMode === 'low' ? 'text-cyan-300' : 'text-amber-300'}
                onTap={() => onNavigate('graphics')}
            />

            {/* Cinematic Intro — navigate */}
            <SettingsRow
                icon={<Sparkles className="w-4 h-4 text-[#f0c674]" />}
                label="Cinematic Intro"
                kind="navigate"
                value="Replay"
                valueAccent="text-[#a8b89a]"
                onTap={() => onNavigate('intro')}
            />

            {/* Tutorial — navigate */}
            <SettingsRow
                icon={<BookOpen className="w-4 h-4 text-[#7a9b8e]" />}
                label="Tutorial Guides"
                kind="navigate"
                onTap={() => onNavigate('tutorial')}
            />

            {/* Level Editor — navigate (locked state shown via value) */}
            <SettingsRow
                icon={<Hammer className="w-4 h-4 text-[#f0c674]" />}
                label="Level Editor"
                kind="navigate"
                value={!isAdminUnlocked ? 'Locked' : undefined}
                valueAccent={!isAdminUnlocked ? 'text-amber-400' : undefined}
                badge={
                    !isAdminUnlocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : undefined
                }
                onTap={() => onNavigate('editor')}
            />

            {/* Divider */}
            <div className="h-px bg-[#5c3d2e]/60 my-1" />

            {/* Account — always at bottom */}
            <SettingsRow
                icon={<Cloud className="w-4 h-4 text-emerald-400" />}
                label="Account"
                subtitle={
                    isGuest
                        ? 'Not signed in'
                        : props.userEmail?.split('@')[0] ?? 'Signed in'
                }
                kind="navigate"
                badge={
                    <span
                        className={`w-2 h-2 rounded-full ${isGuest
                                ? 'bg-slate-500'
                                : props.syncStatus === 'synced'
                                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                                    : props.syncStatus === 'syncing'
                                        ? 'bg-amber-400 animate-pulse'
                                        : props.syncStatus === 'error'
                                            ? 'bg-rose-400 animate-pulse'
                                            : 'bg-slate-500'
                            }`}
                    />
                }
                onTap={() => {
                    if (isGuest) {
                        sounds.playWarning();
                        onRequestAuth?.();
                    } else {
                        onNavigate('account');
                    }
                }}
            />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// 2. Play Mode screen
// ─────────────────────────────────────────────────────────────────

interface PlayModeScreenProps extends SettingsScreenCommonProps { }

export const PlayModeScreen: React.FC<PlayModeScreenProps> = ({
    playMode,
    onChangePlayMode,
    isAdminUnlocked,
    onRequestAdminAuth,
}) => {
    return (
        <div className="flex flex-col gap-3 px-1">
            <OptionCard
                icon={<Lightbulb className="w-5 h-5 text-[#f0c674] fill-current" />}
                title="Building Mode"
                description="Lightbulb budget, 0 stars, 0 penalties"
                selected={playMode === 'building'}
                onSelect={() => onChangePlayMode('building')}
                accent="amber"
            />

            <OptionCard
                icon={
                    isAdminUnlocked ? (
                        <Trophy className="w-5 h-5 text-cyan-300" />
                    ) : (
                        <Lock className="w-5 h-5 text-amber-400" />
                    )
                }
                title="Challenger Mode"
                description={
                    isAdminUnlocked
                        ? 'Stars, par quotas, penalties'
                        : 'Requires admin passcode'
                }
                selected={playMode === 'challenger'}
                onSelect={() => {
                    if (!isAdminUnlocked) {
                        sounds.playWarning();
                        onRequestAdminAuth?.('Challenger Mode');
                        return;
                    }
                    onChangePlayMode('challenger');
                }}
                accent="cyan"
                locked={!isAdminUnlocked}
            />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// 3. Challenge Mode screen
// ─────────────────────────────────────────────────────────────────

interface ChallengeScreenProps extends SettingsScreenCommonProps { }

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
    gameMode,
    onChangeGameMode,
    highestCompletedLevel,
    isAdminUnlocked,
    onRequestAdminAuth,
}) => {
    const isTryHardUnlocked = highestCompletedLevel >= 40;

    return (
        <div className="flex flex-col gap-3 px-1">
            <OptionCard
                icon={<CheckIcon className="w-5 h-5 text-emerald-400" />}
                title="Casual Mode"
                description="Relaxed rules, no star requirements to advance"
                selected={gameMode === 'casual'}
                onSelect={() => onChangeGameMode('casual')}
                accent="emerald"
            />

            <OptionCard
                icon={
                    isTryHardUnlocked ? (
                        <Award className="w-5 h-5 text-amber-300" />
                    ) : (
                        <Lock className="w-5 h-5 text-amber-400" />
                    )
                }
                title="Try-Hard Mode"
                description={
                    isTryHardUnlocked
                        ? '1★ + Mastery Challenge required to win'
                        : `Unlocks at Level 40 (${highestCompletedLevel}/40)`
                }
                selected={gameMode === 'tryhard'}
                onSelect={() => {
                    if (!isAdminUnlocked) {
                        sounds.playWarning();
                        onRequestAdminAuth?.('Try-Hard Mode');
                        return;
                    }
                    if (!isTryHardUnlocked) {
                        sounds.playWarning();
                        return;
                    }
                    onChangeGameMode('tryhard');
                }}
                accent="amber"
                locked={!isTryHardUnlocked || !isAdminUnlocked}
            />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// 4. Graphics screen
// ─────────────────────────────────────────────────────────────────

interface GraphicsScreenProps extends SettingsScreenCommonProps { }

export const GraphicsScreen: React.FC<GraphicsScreenProps> = ({
  performanceMode,
  targetFps,
  isLowPowerMode,
  textureQuality,
  onApplyGraphicsNow,
  onToggleLowPowerMode,
}) => {
    return (
        <div className="flex flex-col gap-4 px-1">
            {/* Quality preset */}
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#a8b89a] mb-2">
                    Quality Preset
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <OptionCard
                        icon={<Zap className="w-4 h-4 text-cyan-400" />}
                        title="Ultra"
                        description="Low-end CPUs"
                        selected={performanceMode === 'low'}
                        onSelect={() => {
                            if (performanceMode !== 'low') {
                                onApplyGraphicsNow('low', targetFps, textureQuality);
                            }
                            }}
                        accent="cyan"
                        compact
                    />
                    <OptionCard
                        icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                        title="High FX"
                        description="GPU shadows"
                        selected={performanceMode === 'high'}
                        onSelect={() => {
                            if (performanceMode !== 'high') {
                                onApplyGraphicsNow('high', targetFps, textureQuality);
                            }
                        }}
                        accent="amber"
                        compact
                    />
                </div>
            </div>

            {/* Target FPS */}
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#a8b89a] mb-2">
                    Target FPS
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {([60, 30, 24] as const).map((fps) => (
                        <button
                            key={fps}
                            onClick={() => {
                                sounds.playClick();
                                if (targetFps !== fps) {
                                    onApplyGraphicsNow(performanceMode, fps, textureQuality);
                                }
                            }}
                            className={`py-2 rounded-xl text-xs font-black font-mono border-2 transition-all ${targetFps === fps
                                    ? 'bg-[#8fbc6f]/20 border-[#8fbc6f] text-[#8fbc6f]'
                                    : 'bg-[#2b1a11]/80 border-[#5c3d2e] text-[#a8b89a]'
                                }`}
                        >
                            {fps}
                        </button>
                    ))}
                </div>
            </div>

            {/* Low Power */}
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#a8b89a] mb-2">
                    Low-Power Mode
                </div>
                <SettingsRow
                    icon={<Zap className="w-4 h-4 text-amber-400" />}
                    label="Battery Saver"
                    subtitle="0.75x resolution, no particles"
                    kind="toggle"
                    toggleValue={isLowPowerMode}
                    onTap={(next) => onToggleLowPowerMode(Boolean(next))}
                />
            </div>

            {/* Texture */}
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#a8b89a] mb-2">
                    Texture Quality
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <OptionCard
                        icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
                        title="High"
                        description="Full mipmaps"
                        selected={textureQuality === 'high'}
                        onSelect={() => {
                            if (textureQuality !== 'high') {
                                onApplyGraphicsNow(performanceMode, targetFps, 'high');
                            }
                        }}
                        accent="cyan"
                        compact
                    />
                    <OptionCard
                        icon={<Zap className="w-4 h-4 text-amber-400" />}
                        title="Low VRAM"
                        description="Saves 75% VRAM"
                        selected={textureQuality === 'low'}
                        onSelect={() => {
                            if (textureQuality !== 'low') {
                                onApplyGraphicsNow(performanceMode, targetFps, 'low');
                            }
                        }}
                        accent="amber"
                        compact
                    />
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// 5. Account screen
// ─────────────────────────────────────────────────────────────────

interface AccountScreenProps extends SettingsScreenCommonProps { }

export const AccountScreen: React.FC<AccountScreenProps> = ({
    syncStatus,
    lastSyncedAt,
    syncError,
    userEmail,
    isGuest,
    onForceSync,
    onWipeCloudSave,
    onSignOut,
    onRequestAuth,
}) => {
    if (isGuest) {
        return (
            <div className="flex flex-col gap-3 px-1">
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                        <Cloud className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-black text-white font-rounded">
                            Not Signed In
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                        Sign in to unlock all 40 levels, sync your progress across devices,
                        and access the Emporium, Vault, and Memories.
                    </p>
                    <button
                        onClick={() => {
                            sounds.playVictory();
                            onRequestAuth?.();
                        }}
                        className="w-full py-3 rounded-2xl font-black text-xs bg-gradient-to-b from-cyan-500 to-blue-600 text-white shadow-lg active:translate-y-[2px] transition-transform flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-4 h-4" />
                        <span className="font-rounded">Sign In / Create Account</span>
                    </button>
                </div>
            </div>
        );
    }

    const statusLabel =
        syncStatus === 'synced'
            ? 'Synced'
            : syncStatus === 'syncing'
                ? 'Syncing…'
                : syncStatus === 'error'
                    ? 'Error'
                    : 'Idle';

    const statusColor =
        syncStatus === 'synced'
            ? 'text-emerald-300'
            : syncStatus === 'syncing'
                ? 'text-amber-300'
                : syncStatus === 'error'
                    ? 'text-rose-300'
                    : 'text-slate-400';

    return (
        <div className="flex flex-col gap-3 px-1">
            {/* User card */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-300 flex items-center justify-center text-xl shrink-0">
                        🧑
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-white truncate font-rounded">
                            {userEmail?.split('@')[0] ?? 'Pioneer'}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-300/80 truncate">
                            {userEmail}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                    <span className={`text-[10.5px] font-bold font-mono ${statusColor}`}>
                        {statusLabel}
                    </span>
                    {lastSyncedAt && (
                        <span className="text-[9.5px] font-mono text-slate-500">
                            {new Date(lastSyncedAt).toLocaleTimeString()}
                        </span>
                    )}
                </div>

                {syncError && (
                    <div className="text-[10px] text-rose-300 font-mono flex items-center gap-1 truncate">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{syncError}</span>
                    </div>
                )}
            </div>

            {/* Force sync */}
            <button
                onClick={() => {
                    sounds.playClick();
                    onForceSync();
                }}
                disabled={syncStatus === 'syncing'}
                className="w-full py-3 rounded-2xl bg-[#2b1a11]/80 border-2 border-[#5c3d2e] hover:border-[#8fbc6f] text-[#f0c674] font-black text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:translate-y-[1px] transition-all"
            >
                <RefreshCw
                    className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                />
                <span className="font-rounded">Sync Now</span>
            </button>

            {/* Wipe cloud */}
            <button
                onClick={() => {
                    sounds.playWarning();
                    onWipeCloudSave();
                }}
                className="w-full py-3 rounded-2xl bg-rose-950/40 border-2 border-rose-500/40 text-rose-200 font-black text-xs flex items-center justify-center gap-2 active:translate-y-[1px] transition-all"
            >
                <Trash2 className="w-4 h-4" />
                <span className="font-rounded">Wipe Cloud Save</span>
            </button>

            {/* Sign out */}
            <button
                onClick={() => {
                    sounds.playClick();
                    onSignOut();
                }}
                className="w-full py-3 rounded-2xl bg-[#1f120a] border-2 border-[#3a2519] text-[#a8b89a] font-black text-xs flex items-center justify-center gap-2 active:translate-y-[1px] transition-all"
            >
                <LogOut className="w-4 h-4" />
                <span className="font-rounded">Sign Out</span>
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// 6. Cinematic intro screen
// ─────────────────────────────────────────────────────────────────

interface IntroScreenProps extends SettingsScreenCommonProps { }

export const IntroScreen: React.FC<IntroScreenProps> = ({ onPlayIntro }) => {
    return (
        <div className="flex flex-col gap-3 px-1">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-black text-amber-200 font-rounded">
                        Cinematic Prologue
                    </span>
                </div>
                <p className="text-[11px] text-amber-100/80 font-serif italic leading-relaxed">
                    &ldquo;Rejoyce, a journey up for the youth&rdquo; — Relive the opening
                    sequence of the Dream Forest.
                </p>
                <button
                    onClick={() => {
                        sounds.playVictory();
                        onPlayIntro?.();
                    }}
                    className="w-full py-3 rounded-2xl font-black text-xs bg-gradient-to-b from-[#f0c674] to-[#d49b38] text-[#2b1a11] shadow-lg active:translate-y-[2px] transition-transform flex items-center justify-center gap-2"
                >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="font-rounded">Replay Intro</span>
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// 7. Tutorial screen
// ─────────────────────────────────────────────────────────────────

interface TutorialScreenProps extends SettingsScreenCommonProps { }

export const TutorialScreen: React.FC<TutorialScreenProps> = ({
    onResetTutorial,
}) => {
    return (
        <div className="flex flex-col gap-3 px-1">
            <div className="p-4 rounded-2xl bg-[#2b1a11]/80 border border-[#5c3d2e] flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-[#7a9b8e]" />
                    <span className="text-sm font-black text-[#f4ecd8] font-rounded">
                        Replay Tutorial
                    </span>
                </div>
                <p className="text-[11px] text-[#a8b89a] leading-relaxed">
                    Jump back to Level 1 with the interactive spotlight that walks you
                    through placement, quota, and color zones.
                </p>
                <button
                    onClick={() => {
                        sounds.playClick();
                        onResetTutorial?.();
                    }}
                    className="w-full py-3 rounded-2xl font-black text-xs bg-[#1f120a] border-2 border-[#5c3d2e] text-[#f4ecd8] active:translate-y-[2px] transition-transform flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-rounded">Restart Tutorial</span>
                </button>
            </div>

            {/* Keyboard shortcuts reference */}
            <div className="p-4 rounded-2xl bg-[#2b1a11]/80 border border-[#5c3d2e] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[11px] font-black text-[#f4ecd8]">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-rounded">Keyboard Shortcuts</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-[#a8b89a]">
                    <div className="p-2 rounded-xl bg-[#1f120a] border border-[#3a2519]">
                        <strong className="text-[#f4ecd8] block">Left-Click</strong>
                        Place / Pick up tile
                    </div>
                    <div className="p-2 rounded-xl bg-[#1f120a] border border-[#3a2519]">
                        <strong className="text-[#f4ecd8] block">Right-Click</strong>
                        Return tile
                    </div>
                    <div className="p-2 rounded-xl bg-[#1f120a] border border-[#3a2519]">
                        <strong className="text-[#f4ecd8] block">'R' Key</strong>
                        Rotate cluster
                    </div>
                    <div className="p-2 rounded-xl bg-[#1f120a] border border-[#3a2519]">
                        <strong className="text-[#f4ecd8] block">'H' Key</strong>
                        Clean view
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// 8. Editor screen
// ─────────────────────────────────────────────────────────────────

interface EditorScreenProps extends SettingsScreenCommonProps { }

export const EditorScreen: React.FC<EditorScreenProps> = ({
    isAdminUnlocked,
    onOpenLevelEditor,
    onOpenDevDebugger,
    onRequestAdminAuth,
}) => {
    return (
        <div className="flex flex-col gap-3 px-1">
            {!isAdminUnlocked && (
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10.5px] text-amber-200 leading-relaxed">
                        These tools require an Admin Passcode. Tap either button to enter
                        the code.
                    </p>
                </div>
            )}

            <button
                onClick={() => {
                    sounds.playClick();
                    if (!isAdminUnlocked) {
                        onRequestAdminAuth?.('Level Editor');
                        return;
                    }
                    onOpenLevelEditor();
                }}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 active:translate-y-[2px] transition-all ${isAdminUnlocked
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-100'
                        : 'bg-[#2b1a11]/60 border-[#3a2519] text-[#a8b89a]'
                    }`}
            >
                <Hammer className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-black font-rounded">Map Level Editor</div>
                    <div className="text-[10px] opacity-80">
                        Craft custom hex boards & boss encounters
                    </div>
                </div>
                {!isAdminUnlocked && <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
            </button>

            <button
                onClick={() => {
                    sounds.playClick();
                    if (!isAdminUnlocked) {
                        onRequestAdminAuth?.('Developer Debugger');
                        return;
                    }
                    onOpenDevDebugger();
                }}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 active:translate-y-[2px] transition-all ${isAdminUnlocked
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-100'
                        : 'bg-[#2b1a11]/60 border-[#3a2519] text-[#a8b89a]'
                    }`}
            >
                <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-black font-rounded">Device Debugger</div>
                    <div className="text-[10px] opacity-80">
                        Live GPU/RAM telemetry & dev controls
                    </div>
                </div>
                {!isAdminUnlocked && <Lock className="w-4 h-4 text-cyan-400 shrink-0" />}
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// OptionCard — reusable selection card
// ─────────────────────────────────────────────────────────────────

interface OptionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
    accent: 'amber' | 'cyan' | 'emerald';
    locked?: boolean;
    compact?: boolean;
}

const ACCENT_MAP: Record<OptionCardProps['accent'], {
    border: string;
    bg: string;
    text: string;
    ring: string;
}> = {
    amber: {
        border: 'border-[#f0c674]',
        bg: 'bg-gradient-to-b from-[#f0c674]/20 to-[#d49b38]/10',
        text: 'text-[#f0c674]',
        ring: 'ring-2 ring-[#f0c674]/40',
    },
    cyan: {
        border: 'border-cyan-400',
        bg: 'bg-gradient-to-b from-cyan-500/20 to-cyan-700/10',
        text: 'text-cyan-300',
        ring: 'ring-2 ring-cyan-400/40',
    },
    emerald: {
        border: 'border-[#8fbc6f]',
        bg: 'bg-gradient-to-b from-[#8fbc6f]/20 to-[#435e38]/10',
        text: 'text-[#8fbc6f]',
        ring: 'ring-2 ring-[#8fbc6f]/40',
    },
};

const OptionCard: React.FC<OptionCardProps> = ({
    icon,
    title,
    description,
    selected,
    onSelect,
    accent,
    locked = false,
    compact = false,
}) => {
    const theme = ACCENT_MAP[accent];

    return (
        <button
            onClick={() => {
                sounds.playClick();
                onSelect();
            }}
            className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 transition-all active:scale-[0.98] ${compact ? 'p-3' : 'p-4'
                } ${selected
                    ? `${theme.border} ${theme.bg} ${theme.ring}`
                    : locked
                        ? 'bg-[#1a0f07] border-[#3a2519] opacity-60'
                        : 'bg-[#2b1a11]/80 border-[#5c3d2e] hover:border-[#8fbc6f]'
                }`}
        >
            <div className="flex items-center justify-center">{icon}</div>
            <div
                className={`text-xs font-black font-rounded ${selected ? theme.text : 'text-[#f4ecd8]'
                    }`}
            >
                {title}
            </div>
            <div className="text-[10px] text-[#a8b89a] text-center leading-tight">
                {description}
            </div>
            {selected && (
                <div className="absolute top-2 right-2">
                    <CheckIcon className={`w-3.5 h-3.5 ${theme.text}`} />
                </div>
            )}
        </button>
    );
};