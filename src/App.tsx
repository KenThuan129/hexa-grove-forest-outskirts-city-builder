import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { MemoriesPage } from './components/MemoriesPage';
import { ThreeScene, RendererInfo } from './components/ThreeScene';
import { TileTray } from './components/TileTray';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { UnifiedBuildingSidebar } from './components/UnifiedBuildingSidebar';
import { RulesModal } from './components/RulesModal';
import { PenaltyDiscoveryModal } from './components/PenaltyDiscoveryModal';
import { SettingsModal } from './components/SettingsModal';
import { ComingSoonModal } from './components/ComingSoonModal';
import { TutorialSpotlight } from './components/TutorialSpotlight';
import { BoosterBar } from './components/BoosterBar';
import { ShopModal } from './components/ShopModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { LevelEditorModal } from './components/LevelEditorModal';
import { GoldenTicketModal } from './components/GoldenTicketModal';
import { DeviceDebugger } from './components/DeviceDebugger';
import { GraphicsReloadModal } from './components/GraphicsReloadModal';
import { BossBattleModal } from './components/BossBattleModal';
import { SpecialIntroLoader } from './components/SpecialIntroLoader';
import { ScreenTransitionLoader } from './components/ScreenTransitionLoader';
import { LevelTransitLoader } from './components/LevelTransitLoader';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { GuestWelcomeModal } from './components/GuestWelcomeModal';
import { buildSaveBlob, deleteCloudBlob, readLocalBlob, writeLocalBlob } from './utils/cloudSave';
import { useCloudSaveSync } from './hooks/useCloudSaveSync';
import { CloudSaveIndicator } from './components/CloudSaveIndicator';
import { JourneyMobileOnly } from './components/journey/Journey';
import { useLayout } from './context/LayoutContext';
import { ConflictResolutionModal } from './components/ConflictResolutionModal';
import type { CloudSaveBlob } from './types/save';
import {
  GUEST_TRIAL_LEVEL_IDS,
  getGuestTrialIndex,
  getNextGuestTrialLevelId,
  advanceGuestTrial,
  hasSeenGuestWelcome,
  markGuestWelcomeSeen,
  isGuestTrialComplete,
} from './utils/guestProgress';
import { EndOfLevelCelebration, LevelCelebrationData } from './components/EndOfLevelCelebration';
import { LEVELS, PIECE_PALETTE } from './data/levels';
import { INITIAL_MEMORIES } from './data/memories';
import { BOOSTER_CATALOG, JOURNEY_CHESTS, INITIAL_CONSTRUCTIONS } from './data/economyData';
import { BoosterId, BoosterItem, JourneyChest, ConstructionId, ConstructionItem } from './types/economy';
import confetti from 'canvas-confetti';
import {
  GridCell,
  PlacedTile,
  HexPiece,
  LevelConfig,
  PenaltyRecord,
  HexCoord,
  TileColor,
  MemoryPicture,
  PenaltyBypassRecord,
  PenaltyType,
  BypassablePenaltyType,
  GameMode,
  PlayMode,
  BossBattleStats,
} from './types/game';
import { coordKey, analyzeConnectivity, rotateHexCoord, getCoordsInRadius, getHexNeighbors, HEX_DIRECTIONS } from './utils/hexMath';
import { sounds } from './utils/audio';
import {
  Sparkles,
  ArrowDownToLine,
  RotateCw,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Compass,
  Home,
  BookOpen,
  Shield,
  Award,
  Coins,
  Leaf,
  ShoppingBag,
  Eye,
  EyeOff,
  Zap,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Page Navigation: 'home' | 'journey' | 'memories'
  const [activePage, setActivePage] = useState<'home' | 'journey' | 'memories'>('home');

  // Layout descriptor — device class + orientation + viewport
  const layout = useLayout();

  const { user, isLoading: isAuthLoading, isIdleSignedOut, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<string | undefined>(undefined);
  const [authMode, setAuthMode] = useState<'guest' | 'idle'>('guest');
  const isGuest = !user;

  const [guestTrialIndex, setGuestTrialIndex] = useState<number>(() => getGuestTrialIndex());
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isGuest) return;
    if (hasSeenGuestWelcome()) return;
    // Small delay so the app has time to render its base layout first.
    const t = window.setTimeout(() => {
      setIsWelcomeOpen(true);
    }, 400);
    return () => window.clearTimeout(t);
  }, [isAuthLoading, isGuest]);

  // Keep guest index in state and localStorage aligned.
  const handleGuestTrialAdvance = useCallback(() => {
    const next = advanceGuestTrial();
    setGuestTrialIndex(next);
  }, []);

  // Loading Screens & Transit State
  const [showSpecialIntro, setShowSpecialIntro] = useState(true);
  const [screenTransition, setScreenTransition] = useState<{
    destination: 'home' | 'journey' | 'memories';
    title?: string;
    subtitle?: string;
  } | null>(null);
  const [levelTransit, setLevelTransit] = useState<{
    levelId: number;
    levelName: string;
    parLimit?: number;
    phaseNumber?: number;
  } | null>(null);
  const [levelCelebration, setLevelCelebration] = useState<LevelCelebrationData | null>(null);

  const navigateWithTransition = (
    dest: 'home' | 'journey' | 'memories',
    title?: string,
    subtitle?: string,
    force?: boolean
  ) => {
    if (activePage === dest && !force) return;
    setScreenTransition({
      destination: dest,
      title,
      subtitle,
    });
  };

  // Custom Built Levels State from Level Editor
  const [customLevels, setCustomLevels] = useState<LevelConfig[]>(() => {
    try {
      const saved = localStorage.getItem('hexa_custom_levels');
      const parsed = saved ? JSON.parse(saved) : [];
      // Clean up any stale overrides for official locked levels 3, 4, 5, 7, 8, 9, 10
      const lockedIds = new Set([3, 4, 5, 7, 8, 9, 10]);
      return Array.isArray(parsed) ? parsed.filter((l: any) => !lockedIds.has(l.id)) : [];
    } catch {
      return [];
    }
  });

  const [cursorScreenPos, setCursorScreenPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCursorScreenPos({ x: e.clientX, y: e.clientY });
    };
    const onLeave = () => setCursorScreenPos(null);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const allLevels = useMemo<LevelConfig[]>(() => {
    const lockedIds = new Set([3, 4, 5, 7, 8, 9, 10]);
    const customMap = new Map(customLevels.filter(l => !lockedIds.has(l.id)).map(l => [l.id, l]));
    const baseLevels = LEVELS.map(l => customMap.get(l.id) || l);
    const brandNewCustom = customLevels.filter(l => !LEVELS.some(b => b.id === l.id) && !lockedIds.has(l.id));
    return [...baseLevels, ...brandNewCustom];
  }, [customLevels]);

  const triggerLevelTransit = useCallback((targetIndex: number, phaseNum?: number) => {
    const safeTargetIndex = Math.max(0, Math.min(allLevels.length - 1, targetIndex));
    const target = allLevels[safeTargetIndex] || allLevels[0];

    // Do not gate on auth state while the session is still being restored.
    // Otherwise a signed-in user could see the guest prompt momentarily.
    if (isAuthLoading) {
      return;
    }

    if (isGuest && !GUEST_TRIAL_LEVEL_IDS.includes(target.id as any)) {
      sounds.playWarning();
      setAuthPrompt(`Sign in to unlock Level ${target.id}. Guests can play trials: 5, 10, 16, 20, 23.`);
      setAuthMode('guest');
      setIsAuthModalOpen(true);
      return;
    }
    setLevelTransit({
      levelId: target.id,
      levelName: target.name,
      parLimit: target.phases[0]?.targetTilesCount || 5,
      phaseNumber: phaseNum !== undefined ? phaseNum + 1 : 1,
    });
    setLevelIndex(safeTargetIndex);
    setPhaseIndex(phaseNum !== undefined ? phaseNum : 0);
  }, [allLevels, isAuthLoading, isGuest]);

  // Clean UI / Zen Mode for clutter-free viewport
  const [isCleanUiMode, setIsCleanUiMode] = useState(false);
  const [isJourneyPaused, setIsJourneyPaused] = useState(false);
  const [zoneHighlightKeys, setZoneHighlightKeys] = useState<Set<string>>(new Set());

  // Play Mode State: 'building' (Standard Journey Mode) vs 'challenger' (Stars, Score, Par, Penalties)
  const [playMode, setPlayMode] = useState<PlayMode>(() => {
    try {
      const saved = localStorage.getItem('hexa_play_mode');
      if (saved === 'building' || saved === 'challenger') return saved;
      return 'building';
    } catch {
      return 'building';
    }
  });

  const [isBossBattleOpen, setIsBossBattleOpen] = useState(false);

  // Game Mode State: 'casual' (relaxed, stress-free progression) vs 'tryhard' (1★ + Mastery required)
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    try {
      const saved = localStorage.getItem('hexa_game_mode');
      if (saved === 'casual' || saved === 'tryhard') return saved;
      return 'casual';
    } catch {
      return 'casual';
    }
  });

  // Performance Preset State ('low' = Ultra Performance 60 FPS, 'high' = Full FX)
  const [performanceMode, setPerformanceMode] = useState<'low' | 'high'>(() => {
    try {
      const saved = localStorage.getItem('hexa_perf_mode');
      if (saved === 'high' || saved === 'low') return saved;
      return 'low'; // Default to ultra-performance for maximum accessibility across lower-end devices
    } catch {
      return 'low';
    }
  });

  // Target Frame Rate Cap State: 60 | 30 | 24 FPS
  const [targetFps, setTargetFps] = useState<60 | 30 | 24>(() => {
    try {
      const saved = localStorage.getItem('hexa_target_fps');
      if (saved === '30' || saved === '24' || saved === '60') return parseInt(saved, 10) as 60 | 30 | 24;
      return 60;
    } catch {
      return 60;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hexa_target_fps', targetFps.toString());
    } catch { }
  }, [targetFps]);

  // Low-Power Mode State (Reduces ambient particles & lowers resolution scale to 0.75x)
  const [isLowPowerMode, setIsLowPowerMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hexa_low_power_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hexa_low_power_mode', isLowPowerMode.toString());
    } catch { }
  }, [isLowPowerMode]);

  // Texture Mipmap Quality State (Saves VRAM for devices < 2GB)
  const [textureQuality, setTextureQuality] = useState<'high' | 'low'>(() => {
    try {
      const saved = localStorage.getItem('hexa_texture_quality');
      if (saved === 'low' || saved === 'high') return saved;
      return 'high';
    } catch {
      return 'high';
    }
  });

  // Admin Code Authorization System State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hexa_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [adminAuthFeature, setAdminAuthFeature] = useState<string | null>(null);
  const [isLevelEditorOpen, setIsLevelEditorOpen] = useState(false);

  // Developer Device Debugger State (Password: 252324442)
  const [isDevUnlocked, setIsDevUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hexa_admin_unlocked') === 'true' || localStorage.getItem('hexa_dev_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [isDevDebuggerOpen, setIsDevDebuggerOpen] = useState(false);
  const [rendererInfo, setRendererInfo] = useState<RendererInfo>({
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    geometriesMemoryMb: 0,
    texturesVramMb: 0,
    totalVramMb: 0,
    jsHeapMemoryMb: 0,
    vramBudgetCapMb: 64.0,
    ramBudgetCapMb: 256.0,
    budgetUsagePercent: 0,
    isOverBudget: false,
  });
  const hudInsetLeftPx = 288;
  const hudInsetRightPx = 288;

  // Pending Graphics Reload Confirmation State
  const [pendingGraphicsReload, setPendingGraphicsReload] = useState<{
    newMode: 'low' | 'high';
    newFps: 60 | 30 | 24;
    newTextureQuality: 'high' | 'low';
  } | null>(null);

  const handleRequestGraphicsReload = useCallback((
    newMode: 'low' | 'high',
    newFps: 60 | 30 | 24,
    newTexQuality?: 'high' | 'low'
  ) => {
    setPendingGraphicsReload({
      newMode,
      newFps,
      newTextureQuality: newTexQuality ?? textureQuality,
    });
  }, [textureQuality]);

  const handleConfirmGraphicsReload = useCallback(() => {
    if (!pendingGraphicsReload) return;
    const { newMode, newFps, newTextureQuality } = pendingGraphicsReload;

    setPerformanceMode(newMode);
    setTargetFps(newFps);
    setTextureQuality(newTextureQuality);
    try {
      localStorage.setItem('hexa_perf_mode', newMode);
      localStorage.setItem('hexa_target_fps', newFps.toString());
      localStorage.setItem('hexa_texture_quality', newTextureQuality);
    } catch { }

    setPendingGraphicsReload(null);
    setIsSettingsModalOpen(false);
    setIsDevDebuggerOpen(false);

    setScreenTransition({
      destination: activePage,
      title: 'Applying Graphics & Texture Setup',
      subtitle: `Re-initializing WebGL context (${newMode === 'low' ? 'Ultra-Perf' : 'High FX'} · ${newFps} FPS · ${newTextureQuality === 'low' ? 'Compressed Low-VRAM' : 'High Mipmaps'})...`,
    });

    sounds.playVictory();
  }, [pendingGraphicsReload, activePage]);

  // Listen for TAB key to toggle Developer Device Debugger HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const targetTag = (e.target as HTMLElement)?.tagName;
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        setIsDevDebuggerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Level & Phase State
  const [levelIndex, setLevelIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [hasCompletedFirstTrial, setHasCompletedFirstTrial] = useState(false);
  const [rotationsPerformed, setRotationsPerformed] = useState(0);

  // Memories & Penalty Bypass System
  const [memories, setMemories] = useState<MemoryPicture[]>(INITIAL_MEMORIES);
  const [highestCompletedLevel, setHighestCompletedLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('hexa_highest_level') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [latestChapterExplore, setLatestChapterExplore] = useState<number>(0);
  const [latestMemories, setLatestMemories] = useState<number>(0);

  // Persist gameMode and highestCompletedLevel
  useEffect(() => {
    try {
      localStorage.setItem('hexa_game_mode', gameMode);
    } catch { }
  }, [gameMode]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_highest_level', highestCompletedLevel.toString());
    } catch { }
  }, [highestCompletedLevel]);

  useEffect(() => {
    const highestMemId = INITIAL_MEMORIES
      .filter(m => highestCompletedLevel >= m.levelReq)
      .reduce((max, m) => Math.max(max, m.id), 0);
    setLatestMemories(prev => (prev === highestMemId ? prev : highestMemId));
  }, [highestCompletedLevel]);

  // Currency & Economy State
  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hexa_coins');
      return saved ? parseInt(saved, 10) : 250;
    } catch {
      return 250;
    }
  });

  const [leaves, setLeaves] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hexa_leaves');
      return saved ? parseInt(saved, 10) : 40;
    } catch {
      return 40;
    }
  });

  const [boosters, setBoosters] = useState<Record<BoosterId, number>>(() => {
    try {
      const saved = localStorage.getItem('hexa_boosters');
      if (saved) return JSON.parse(saved);
    } catch { }
    return { chisel_brush: 1, cluster_splitter: 0, par_expander: 0, mist_piercer: 0, titan_shield: 0 };
  });

  const [constructions, setConstructions] = useState<ConstructionItem[]>(() => {
    try {
      const saved = localStorage.getItem('hexa_constructions');
      if (saved) {
        const parsed: Record<string, number> = JSON.parse(saved);
        return INITIAL_CONSTRUCTIONS.map(item => ({
          ...item,
          currentLevel: typeof parsed[item.id] === 'number' ? parsed[item.id] : item.currentLevel,
        }));
      }
    } catch { }
    return INITIAL_CONSTRUCTIONS;
  });

  const [claimedChestIds, setClaimedChestIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('hexa_claimed_chests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hasGoldenTicket, setHasGoldenTicket] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hexa_golden_ticket') === 'true';
    } catch {
      return false;
    }
  });

  // ── Cloud Save — conflict resolution + wipe ────────────────────
  const [pendingConflict, setPendingConflict] = useState<{
    local: CloudSaveBlob;
    cloud: CloudSaveBlob;
    resolve: (chosen: 'local' | 'cloud') => void;
  } | null>(null);

  const [isWipeCloudConfirmOpen, setIsWipeCloudConfirmOpen] = useState(false);

  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isGoldenTicketModalOpen, setIsGoldenTicketModalOpen] = useState(false);
  const [activeParBonus, setActiveParBonus] = useState(0);
  const [isTitanShieldActive, setIsTitanShieldActive] = useState(false);

  // Persist economy state
  useEffect(() => {
    try {
      localStorage.setItem('hexa_coins', coins.toString());
    } catch { }
  }, [coins]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_leaves', leaves.toString());
    } catch { }
  }, [leaves]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_boosters', JSON.stringify(boosters));
    } catch { }
  }, [boosters]);

  useEffect(() => {
    try {
      const levelsMap: Record<string, number> = {};
      constructions.forEach(c => {
        levelsMap[c.id] = c.currentLevel;
      });
      localStorage.setItem('hexa_constructions', JSON.stringify(levelsMap));
    } catch { }
  }, [constructions]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_claimed_chests', JSON.stringify(claimedChestIds));
    } catch { }
  }, [claimedChestIds]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_golden_ticket', hasGoldenTicket ? 'true' : 'false');
    } catch { }
  }, [hasGoldenTicket]);

  // Reset transient booster buffs upon level/phase change
  useEffect(() => {
    setActiveParBonus(0);
    setIsTitanShieldActive(false);
  }, [levelIndex, phaseIndex]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const currentLevel = allLevels[levelIndex] || allLevels[0];
  const currentPhase = currentLevel.phases[phaseIndex] || currentLevel.phases[0];

  // ─────────────────────────────────────────────────────────────
  // Cloud Save Blob — the snapshot pushed to Supabase
  // ─────────────────────────────────────────────────────────────
  const saveState: CloudSaveBlob = useMemo(() => {
    // Constructions → Record<ConstructionId, number>
    const constructionsMap: Record<string, number> = {};
    constructions.forEach(c => {
      constructionsMap[c.id] = c.currentLevel;
    });

    // Memories → Record<pictureId, BypassablePenaltyType>
    const chosenBypassMap: Record<number, any> = {};
    memories.forEach(m => {
      if (m.chosenBypass) chosenBypassMap[m.id] = m.chosenBypass;
    });

    return buildSaveBlob({
      highestCompletedLevel,
      coins,
      leaves,
      boosters,
      constructions: constructionsMap as any,
      claimedChestIds,
      hasGoldenTicket,
      playMode,
      gameMode,
      latestChapterExplore,
      latestMemories,
      chosenBypass: chosenBypassMap as any,
      memories,
    });
  }, [
    highestCompletedLevel,
    coins,
    leaves,
    boosters,
    constructions,
    claimedChestIds,
    hasGoldenTicket,
    playMode,
    gameMode,
    latestChapterExplore,
    latestMemories,
    memories,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Mirror blob to localStorage on any tracked state change.
  // This is the offline-cold-start copy; the cloud is the
  // server of record.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      writeLocalBlob(saveState);
    } catch { }
  }, [saveState]);

  // ── Next playable level, mode-aware ─────────────────────────
  // Signed-in: the level right after the highest completed.
  // Guest: the next trial level in the trial list, or null if all done.
  const nextPlayableIndex = useMemo(() => {
    if (isGuest) {
      const nextTrialId = getNextGuestTrialLevelId();
      if (nextTrialId == null) return -1; // no trials left
      return allLevels.findIndex((l) => l.id === nextTrialId);
    }
    // Signed-in / admin: sequential
    const nextId = highestCompletedLevel + 1;
    const idx = allLevels.findIndex((l) => l.id === nextId);
    return idx >= 0 ? idx : allLevels.length - 1;
  }, [isGuest, allLevels, highestCompletedLevel]);

  // Grid state: every cell key maps to an array/stack of placed tiles (to support overlapping error mechanics)
  const [unlockedCells, setUnlockedCells] = useState<Map<string, GridCell>>(new Map());
  const [placedTiles, setPlacedTiles] = useState<Map<string, PlacedTile[]>>(new Map());
  const [availablePieces, setAvailablePieces] = useState<HexPiece[]>([]);

  // Dragging & Interaction
  const [selectedPiece, setSelectedPiece] = useState<HexPiece | null>(null);
  const [pickedUpCoord, setPickedUpCoord] = useState<HexCoord | null>(null);
  const [prePlacedTileKeys, setPrePlacedTileKeys] = useState<Set<string>>(new Set());
  const [activeDragPiece, setActiveDragPiece] = useState<HexPiece | null>(null);
  const [dragPointerPos, setDragPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCoord, setHoveredCoord] = useState<HexCoord | null>(null);

  // Inspected Colored Zones in Boss Levels (Level 25)
  const [inspectedZoneKeys, setInspectedZoneKeys] = useState<Set<string>>(new Set());

  const selectTimestampRef = useRef<number>(0);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Animations, Modals & Discovery
  const [isExpansionAnimating, setIsExpansionAnimating] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isPenaltyDiscoveryModalOpen, setIsPenaltyDiscoveryModalOpen] = useState(false);
  const [hasDiscoveredPenalties, setHasDiscoveredPenalties] = useState(false);
  const [highlightPenalties, setHighlightPenalties] = useState(false);
  const [highlightScore, setHighlightScore] = useState(false);
  const [isOpenHomeShowcase, setIsOpenHomeShowcase] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertToast, setAlertToast] = useState<{ message: string; type: 'info' | 'warn' | 'success' } | null>(null);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'info' | 'warn' | 'success' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setAlertToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setAlertToast(null);
    }, 3000);
  };

  // Calculate Cumulative Penalty Bypasses from unlocked Memory Pictures (Max 3 per penalty type)
  const bypasses: PenaltyBypassRecord = useMemo(() => {
    const record: PenaltyBypassRecord = { overlap: 0, overuse: 0, disconnect: 0, offMap: 0 };
    memories.forEach(m => {
      if (m.chosenBypass) {
        if (record[m.chosenBypass] < 3) {
          record[m.chosenBypass]++;
        }
      }
    });
    return record;
  }, [memories]);

  const isPickingTile = Boolean(selectedPiece || activeDragPiece);

  const roadRequirementProgress = useMemo(() => {
    if (!currentPhase?.roadRequirements || currentPhase.roadRequirements.length === 0) {
      return { satisfied: true, perRoad: [] as { roadKey: string; adjacent: number; required: number; satisfied: boolean }[] };
    }

    const perRoad: { roadKey: string; adjacent: number; required: number; satisfied: boolean }[] = [];
    let allSatisfied = true;

    for (const req of currentPhase.roadRequirements) {
      // Build the set of road coords (as keys) that belong to this requirement
      const roadKeySet = new Set(req.roadCoords.map(c => coordKey(c.q, c.r)));

      // Collect all unique neighbor keys of the road coords
      const neighborKeySet = new Set<string>();
      for (const coord of req.roadCoords) {
        const neighbors = getHexNeighbors(coord.q, coord.r);
        for (const n of neighbors) {
          const nKey = coordKey(n.q, n.r);
          // Skip if the neighbor is itself a road (we only care about houses)
          if (!roadKeySet.has(nKey)) neighborKeySet.add(nKey);
        }
      }

      // Count how many of those neighbor cells contain a house-like tile
      let houseCount = 0;
      for (const nKey of neighborKeySet) {
        const stack = placedTiles.get(nKey) || [];
        const hasHouse = stack.some(t => {
          if (t.type === 'house' || t.type === 'tower' || t.type === 'landmark' || t.type === 'mixed') return true;
          if (t.clusterShape) {
            return t.clusterShape.some(o => o.type === 'house' || o.type === 'tower' || o.type === 'landmark' || o.type === 'mixed');
          }
          if (t.clusterPieceOriginal?.clusterShape) {
            return t.clusterPieceOriginal.clusterShape.some(o => o.type === 'house' || o.type === 'tower' || o.type === 'landmark' || o.type === 'mixed');
          }
          return false;
        });
        if (hasHouse) houseCount++;
      }

      const satisfied = houseCount >= req.minHousesAdjacent;
      perRoad.push({
        roadKey: req.roadKey,
        adjacent: houseCount,
        required: req.minHousesAdjacent,
        satisfied,
      });
      if (!satisfied) allSatisfied = false;
    }

    return { satisfied: allSatisfied, perRoad };
  }, [currentPhase, placedTiles]);

  const hoveredZoneInfo = useMemo(() => {
    if (!hoveredCoord || !currentPhase) return null;

    const hoveredKey = coordKey(hoveredCoord.q, hoveredCoord.r);

    for (const zone of currentPhase.coloredZones) {
      // Fast reject: is this coord inside the zone at all?
      const isInZone = zone.coords.some(c => coordKey(c.q, c.r) === hoveredKey);
      if (!isInZone) continue;

      // Count how many zone cells have a matching-colored tile on top
      let occupied = 0;
      for (const c of zone.coords) {
        const stack = placedTiles.get(coordKey(c.q, c.r));
        if (stack && stack.length > 0) {
          const top = stack[stack.length - 1];
          if (top.color === zone.color) occupied++;
        }
      }

      return {
        name: zone.name,
        color: zone.color,
        bossZoneType: zone.bossZoneType,
        occupied,
        total: zone.coords.length,
      };
    }

    return null;
  }, [hoveredCoord, currentPhase, placedTiles]);

  const hoveredRoadRequirement = useMemo(() => {
    if (!hoveredCoord || !currentPhase?.roadRequirements) return null;

    const hoveredKey = coordKey(hoveredCoord.q, hoveredCoord.r);

    for (const req of currentPhase.roadRequirements) {
      if (req.roadCoords.some(c => coordKey(c.q, c.r) === hoveredKey)) {
        const progress = roadRequirementProgress.perRoad.find(r => r.roadKey === req.roadKey);
        return {
          roadKey: req.roadKey,
          adjacent: progress?.adjacent ?? 0,
          required: req.minHousesAdjacent,
          satisfied: progress?.satisfied ?? false,
        };
      }
    }

    return null;
  }, [hoveredCoord, currentPhase, roadRequirementProgress]);

  // Handle player choosing a penalty bypass for a completed memory picture
  const handleSelectBypass = (pictureId: number, penalty: BypassablePenaltyType) => {
    setMemories(prev =>
      prev.map(m => (m.id === pictureId ? { ...m, chosenBypass: penalty } : m))
    );
    sounds.playVictory();
    showToast(`Memory #${pictureId} chosen! Granted +1 ${penalty.toUpperCase()} Free Pass per level.`, 'success');
  };

  // Initialize Unlocked Grid Cells for current Phase (including Fog Hexes & River Separators)
  const initializeGridForLevel = useCallback((lvlIdx: number, phIdx: number) => {
    const safeIdx = Math.max(0, Math.min(allLevels.length - 1, lvlIdx));
    const lvl = allLevels[safeIdx] || allLevels[0];
    if (!lvl || !lvl.phases || lvl.phases.length === 0) return;
    const newCells = new Map<string, GridCell>();

    const safePhIdx = Math.min(phIdx, lvl.phases.length - 1);
    for (let p = 0; p <= safePhIdx; p++) {
      const phase = lvl.phases[p];
      if (!phase) continue;

      // 1. Regular Unlocked Coords
      for (const coord of phase.unlockedCoords) {
        const key = coordKey(coord.q, coord.r);
        let colorReq: TileColor = 'neutral';
        for (const zone of phase.coloredZones) {
          if (zone.coords.some((c: HexCoord) => c.q === coord.q && c.r === coord.r)) {
            colorReq = zone.color;
            break;
          }
        }
        newCells.set(key, {
          q: coord.q,
          r: coord.r,
          colorRequirement: colorReq,
          isUnlocked: true,
          unlockPhase: p + 1,
          isFog: false,
          isRiver: false,
        });
      }

      // 2. River Barrier Coords
      if (phase.riverCoords) {
        for (const coord of phase.riverCoords) {
          const key = coordKey(coord.q, coord.r);
          newCells.set(key, {
            q: coord.q,
            r: coord.r,
            colorRequirement: 'neutral',
            isUnlocked: false,
            unlockPhase: p + 1,
            isRiver: true,
            isFog: false,
          });
        }
      }

      // 3. Fog Hexes (Predicting next phase boundaries)
      if (phase.fogCoords) {
        for (const coord of phase.fogCoords) {
          const key = coordKey(coord.q, coord.r);
          if (!newCells.has(key)) {
            newCells.set(key, {
              q: coord.q,
              r: coord.r,
              colorRequirement: 'neutral',
              isUnlocked: false,
              unlockPhase: p + 1,
              isFog: true,
              isRiver: false,
            });
          }
        }
      }
    }

    setUnlockedCells(newCells);
  }, [allLevels]);

  useEffect(() => {
    setPhaseIndex(0);
  }, [levelIndex]);

  // Effect B: Rebuild grid cells on level OR phase change
  useEffect(() => {
    initializeGridForLevel(levelIndex, phaseIndex);
  }, [levelIndex, phaseIndex, initializeGridForLevel]);

  // Reset or switch Level
  useEffect(() => {
    setInspectedZoneKeys(new Set());
    const initialMap = new Map<string, PlacedTile[]>();
    const prePlacedKeys = new Set<string>();
    const ph = currentLevel.phases[phaseIndex];

    if (ph) {
      // 1. Regular initial placements (movable by player)
      if (ph.initialPlacedTiles) {
        ph.initialPlacedTiles.forEach((init, i) => {
          const piece = PIECE_PALETTE.find(p => p.id === init.pieceId) || currentLevel.availablePieces.find(p => p.id === init.pieceId);
          if (piece) {
            const key = coordKey(init.q, init.r);
            const placed: PlacedTile = {
              ...piece,
              placementId: `init-${currentLevel.id}-p${phaseIndex}-${i}-${Date.now()}`,
              placedAt: Date.now() + i,
              q: init.q,
              r: init.r,
            };
            initialMap.set(key, [placed]);
          }
        });
      }

      // 2. Pre-placed roads (locked, immutable)
      if (ph.prePlacedRoads) {
        ph.prePlacedRoads.forEach((pre, i) => {
          const piece = PIECE_PALETTE.find(p => p.id === pre.pieceId) || currentLevel.availablePieces.find(p => p.id === pre.pieceId);
          if (piece) {
            const key = coordKey(pre.q, pre.r);
            const placed: PlacedTile = {
              ...piece,
              placementId: `preplaced-${currentLevel.id}-p${phaseIndex}-${i}-${Date.now()}`,
              placedAt: Date.now() + i,
              q: pre.q,
              r: pre.r,
              clusterId: `PREPLACED-${currentLevel.id}-${phaseIndex}-${i}`,
            };
            const existing = initialMap.get(key) || [];
            initialMap.set(key, [...existing, placed]);
            prePlacedKeys.add(key);
          }
        });
      }
    }

    setPlacedTiles(initialMap);
    setPrePlacedTileKeys(prePlacedKeys);
    setRotationsPerformed(0);
    setSelectedPiece(null);
    setPickedUpCoord(null);
    setActiveDragPiece(null);
    setLevelCelebration(null);
    setAvailablePieces(currentLevel.availablePieces);

    // Note: we do NOT reset phaseIndex here — the effect now runs ON phase change too
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, phaseIndex, currentLevel]);

  // Analyze connectivity of placed in-bounds and connected tiles
  const connectivity = useMemo(() => {
    const coords: HexCoord[] = [];
    placedTiles.forEach((stack, key) => {
      if (stack.length === 0) return;
      const cell = unlockedCells.get(key);
      const isBridge = stack.some(t => t.type === 'bridge');
      // Bridges act as path bridges even over water/void!
      if (isBridge || (cell && (cell.isUnlocked || cell.isFog) && !cell.isRiver)) {
        coords.push({ q: stack[0].q, r: stack[0].r });
      }
    });
    return analyzeConnectivity(coords);
  }, [placedTiles, unlockedCells]);

  // Off-map tiles count (River hexes or out-of-bounds cells)
  const rawOffMapCount = useMemo(() => {
    let count = 0;
    placedTiles.forEach((stack, key) => {
      const cell = unlockedCells.get(key);
      const isBridge = stack.some(t => t.type === 'bridge');
      if (isBridge) return; // Bridges are exempt from off-map/river penalties
      if (!cell || cell.isRiver) {
        count += stack.length;
      }
    });
    return count;
  }, [placedTiles, unlockedCells]);

  // In-bounds placed tiles count
  const inBoundsPlacedCount = useMemo(() => {
    let count = 0;
    placedTiles.forEach((stack, key) => {
      const cell = unlockedCells.get(key);
      const isBridge = stack.some(t => t.type === 'bridge');
      if (isBridge || (cell && (cell.isUnlocked || cell.isFog) && !cell.isRiver)) {
        count += stack.length;
      }
    });
    return count;
  }, [placedTiles, unlockedCells]);

  // Real-Time Active Overlap Errors
  const rawOverlapErrorCount = useMemo(() => {
    let count = 0;
    placedTiles.forEach(stack => {
      if (stack.length > 1) {
        count += stack.length - 1;
      }
    });
    return count;
  }, [placedTiles]);

  // Overuse calculation (incorporates Par Expander tactical booster bonus)
  const parCount = (currentPhase?.targetTilesCount || 5) + activeParBonus;
  const rawOveruseCount = Math.max(0, inBoundsPlacedCount - parCount);

  // Active Real-Time Falsehood evaluation:
  // Dynamically checks if ANY placed tile on a Fog cell is in a component disconnected from safe unlocked ground.
  // When tiles are removed from fog or reconnected to safe area, this automatically recalculates to 0!
  const dynamicFalsehoodCount = useMemo(() => {
    const allPlacedCoords: HexCoord[] = [];
    placedTiles.forEach(stack => {
      if (stack.length > 0) {
        allPlacedCoords.push({ q: stack[0].q, r: stack[0].r });
      }
    });

    if (allPlacedCoords.length === 0) return 0;

    let isolatedFogCount = 0;
    const visited = new Set<string>();

    for (const coord of allPlacedCoords) {
      const key = coordKey(coord.q, coord.r);
      if (visited.has(key)) continue;

      const component: HexCoord[] = [];
      const queue: HexCoord[] = [coord];
      visited.add(key);

      while (queue.length > 0) {
        const current = queue.shift()!;
        component.push(current);
        const neighbors = getHexNeighbors(current.q, current.r);
        for (const n of neighbors) {
          const nKey = coordKey(n.q, n.r);
          if (!visited.has(nKey) && (placedTiles.get(nKey)?.length || 0) > 0) {
            visited.add(nKey);
            queue.push(n);
          }
        }
      }

      // Check if this component contains any tile placed on safe unlocked area (isUnlocked && !isFog && !isRiver)
      const hasSafeTile = component.some(c => {
        const cell = unlockedCells.get(coordKey(c.q, c.r));
        const stack = placedTiles.get(coordKey(c.q, c.r));
        const hasBridge = stack?.some(t => t.type === 'bridge') ?? false;

        // Bridge tiles are always safe — they anchor otherwise-isolated fog components
        if (hasBridge) return true;

        return cell && cell.isUnlocked && !cell.isFog && !cell.isRiver;
      });

      const hasFogTile = component.some(c => {
        const cell = unlockedCells.get(coordKey(c.q, c.r));
        return cell?.isFog;
      });

      if (hasFogTile && !hasSafeTile) {
        isolatedFogCount++;
      }
    }

    return isolatedFogCount;
  }, [placedTiles, unlockedCells]);

  // Penalties record with Memories Penalty Bypass Free Passes Applied!
  const penalties: PenaltyRecord = useMemo(() => {
    // Overuse penalties are bypassed by default until Challenger Mode is entered
    const isOveruseActive = playMode === 'challenger';
    const effectiveOveruse = isOveruseActive ? Math.max(0, rawOveruseCount - bypasses.overuse) : 0;

    return {
      overuse: effectiveOveruse,
      disconnect: Math.max(0, connectivity.disconnectedCount - bypasses.disconnect),
      overlap: Math.max(0, rawOverlapErrorCount - bypasses.overlap),
      offMap: Math.max(0, rawOffMapCount - bypasses.offMap),
      falsehood: dynamicFalsehoodCount,
    };
  }, [playMode, rawOveruseCount, connectivity.disconnectedCount, rawOverlapErrorCount, rawOffMapCount, dynamicFalsehoodCount, bypasses]);

  // Strict Penalty Limit Check (Level 20+ max 3 penalties allowed in Try-Hard mode; relaxed in Casual mode)
  const totalPenaltiesCount =
    penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood;
  const strictPenaltyLimit = currentLevel.strictPenaltyLimit ?? (currentLevel.id >= 20 ? 3 : undefined);
  const isPenaltyLimitExceeded =
    !isTitanShieldActive &&
    gameMode === 'tryhard' &&
    strictPenaltyLimit !== undefined &&
    totalPenaltiesCount > strictPenaltyLimit;
  const isFalsehoodActive = !isTitanShieldActive && gameMode === 'tryhard' && penalties.falsehood > 0;

  // Trigger Penalty Discovery when switching to Challenger Mode for the first time
  const handleSwitchPlayMode = (mode: PlayMode) => {
    setPlayMode(mode);
    try {
      localStorage.setItem('hexa_play_mode', mode);
    } catch { }

    if (mode === 'challenger' && !hasDiscoveredPenalties) {
      setHasDiscoveredPenalties(true);
      setIsPenaltyDiscoveryModalOpen(true);
      setHighlightPenalties(true);
      setHighlightScore(true);
      sounds.playWarning();
      setTimeout(() => {
        setHighlightPenalties(false);
        setHighlightScore(false);
      }, 4000);
    } else {
      showToast(
        mode === 'building'
          ? 'Switched to Building Mode: Lightbulb currency, 0 stars, 0 penalties!'
          : 'Switched to Challenger Mode: Stars, score target, par quota & penalties!',
        'info'
      );
    }
  };

  // Colored Zones Completion check & counts
  const { matchedZonesCount, totalZonesCount, coloredZonesCompleted } = useMemo(() => {
    if (!currentPhase) return { matchedZonesCount: 0, totalZonesCount: 0, coloredZonesCompleted: false };
    const total = currentPhase.coloredZones.length;
    let matched = 0;

    for (const zone of currentPhase.coloredZones) {
      const isComplete = zone.coords.every(targetCoord => {
        const key = coordKey(targetCoord.q, targetCoord.r);
        const stack = placedTiles.get(key);
        if (!stack || stack.length === 0) return false;
        const topTile = stack[stack.length - 1];

        // Bridges and pre-placed roads never fulfill colored zones — they're infrastructure
        if (topTile.type === 'bridge') return false;
        if (topTile.clusterId?.startsWith('PREPLACED')) return false;

        return topTile.color === zone.color;
      });
      if (isComplete) matched++;
    }

    return {
      matchedZonesCount: matched,
      totalZonesCount: total,
      coloredZonesCompleted: matched === total,
    };
  }, [currentPhase, placedTiles]);

  // ── Zone highlight: keys of cells belonging to fully-completed zones ──
  React.useEffect(() => {
    if (!currentPhase) return;
    const keys = new Set<string>();
    for (const zone of currentPhase.coloredZones) {
      const isComplete = zone.coords.every((c) => {
        const stack = placedTiles.get(coordKey(c.q, c.r));
        if (!stack || stack.length === 0) return false;
        const top = stack[stack.length - 1];
        if (top.type === 'bridge') return false;
        return top.color === zone.color;
      });
      if (isComplete) {
        for (const c of zone.coords) keys.add(coordKey(c.q, c.r));
      }
    }
    setZoneHighlightKeys((prev) => {
      // Only update if changed, to avoid re-render storms
      if (prev.size === keys.size && [...keys].every((k) => prev.has(k))) return prev;
      return keys;
    });
  }, [currentPhase, placedTiles]);

  // ─────────────────────────────────────────────────────────────
  // Long-press hex — zone preview tooltip
  // ─────────────────────────────────────────────────────────────
  const handleLongPressHex = React.useCallback(
    (coord: HexCoord) => {
      if (!currentPhase) return;

      // Find zone at this coord
      const zone = currentPhase.coloredZones.find((z) =>
        z.coords.some((c) => c.q === coord.q && c.r === coord.r)
      );

      if (zone) {
        const stack = placedTiles.get(coordKey(coord.q, coord.r));
        let matched = 0;
        for (const c of zone.coords) {
          const s = placedTiles.get(coordKey(c.q, c.r));
          if (s && s.length > 0 && s[s.length - 1].color === zone.color) matched++;
        }
        const pct = Math.round((matched / zone.coords.length) * 100);
        showToast(
          `🎯 ${zone.name} — ${matched}/${zone.coords.length} filled (${pct}%)`,
          'info'
        );
        sounds.playZoneComplete();
      } else {
        // No zone — maybe a fog or road cell
        const cell = unlockedCells.get(coordKey(coord.q, coord.r));
        if (cell?.isFog) {
          showToast('🌫️ Fog hex — must connect to safe ground', 'info');
        } else if (cell?.isRiver) {
          showToast('🌊 River barrier — unbuildable', 'info');
        }
      }
    },
    [currentPhase, placedTiles, unlockedCells]
  );

  const handleJourneyPauseToggle = React.useCallback(() => {
    sounds.playClick();
    setIsJourneyPaused((p) => !p);
  }, []);

  const handleJourneyRestart = React.useCallback(() => {
    setIsJourneyPaused(false);
    handleResetBoard();
  }, []);

  const handleJourneyExitToHome = React.useCallback(() => {
    setIsJourneyPaused(false);
    navigateWithTransition('home', 'Returning to Island Sanctuary', 'Archipelago Resort & Building Hub');
  }, []);

  // Calculate Base Raw Score (before mastery bonus)
  const rawScore = useMemo(() => {
    let base = inBoundsPlacedCount * 220;

    if (currentPhase) {
      currentPhase.coloredZones.forEach(zone => {
        zone.coords.forEach(coord => {
          const key = coordKey(coord.q, coord.r);
          const stack = placedTiles.get(key);
          if (stack && stack.length > 0) {
            const topTile = stack[stack.length - 1];
            if (topTile.color === zone.color) {
              base += 450;
            }
          }
        });
      });
    }

    if (inBoundsPlacedCount <= parCount && inBoundsPlacedCount >= 3) {
      base += 300;
    }

    const deductions = isTitanShieldActive
      ? 0
      : penalties.overuse * 150 +
      penalties.disconnect * 120 +
      penalties.overlap * 100 +
      penalties.offMap * 80;

    const surgeBonus = isTitanShieldActive ? 500 : 0;
    return Math.max(0, base - deductions) + surgeBonus;
  }, [inBoundsPlacedCount, currentPhase, placedTiles, parCount, penalties, isTitanShieldActive]);

  // Mastery Challenge Evaluation (Starting from Level 13+)
  const isMasteryCompleted = useMemo(() => {
    if (!currentLevel.masteryChallenge) return true;
    const mc = currentLevel.masteryChallenge;
    if (mc.type === 'min_score') {
      const minRequired = mc.targetValue ?? 2500;
      return rawScore >= minRequired;
    }
    if (mc.type === 'zero_disconnect') {
      return penalties.disconnect === 0 && (rotationsPerformed >= 1 || !currentPhase.rotationZones);
    }
    if (mc.type === 'zero_overuse') {
      return penalties.overuse === 0;
    }
    if (mc.type === 'zero_overlap') {
      return penalties.overlap === 0;
    }
    if (mc.type === 'zero_offmap') {
      return penalties.offMap === 0;
    }
    if (mc.type === 'rotate_zone') {
      return rotationsPerformed >= 1;
    }
    return true;
  }, [currentLevel, penalties, rotationsPerformed, currentPhase, rawScore]);

  // Building Mode: Lightbulbs Used & Level Budget Calculation
  const lightbulbBudget = currentLevel.lightbulbBudget ?? (currentLevel.id * 5 + 20);
  const lightbulbsUsed = useMemo(() => {
    let total = 0;
    placedTiles.forEach(stack => {
      stack.forEach(tile => {
        total += tile.lightbulbCost ?? (tile.clusterShape ? tile.clusterShape.length : 1);
      });
    });
    return total;
  }, [placedTiles]);

  // Manual / sidebar inspection handler
  const handleInspectZone = useCallback((zoneKey: string, zone: { name: string; color: TileColor }) => {
    if (!currentLevel.isBossLevel) return;
    if (!inspectedZoneKeys.has(zoneKey)) {
      setInspectedZoneKeys(prev => {
        const next = new Set(prev);
        next.add(zoneKey);
        return next;
      });
      sounds.playZoneComplete();
      let benefitMsg = '';
      if (zone.color === 'amber' || zone.color === 'ruby') {
        benefitMsg = '+35 Popularity added to Business Showdown!';
      } else if (zone.color === 'sapphire') {
        benefitMsg = '+35 Ambience added to Business Showdown!';
      } else {
        benefitMsg = 'Bonus Activate! +1 Slot for Bonus Selection unlocked!';
      }
      showToast(`🔍 ${zone.name} Inspected: ${benefitMsg}`, 'success');
    }
  }, [currentLevel.isBossLevel, inspectedZoneKeys]);

  // Hover inspection of colored zones in Boss Levels (Level 25) counts AT ANY TIME during the building phase
  useEffect(() => {
    if (!currentLevel.isBossLevel) return;
    if (!hoveredCoord) return;

    // Check if hoveredCoord matches any colored zone in currentPhase
    const matchedZone = currentPhase?.coloredZones?.find(zone =>
      zone.coords.some(c => c.q === hoveredCoord.q && c.r === hoveredCoord.r)
    );

    if (matchedZone) {
      const zoneKey = `${currentLevel.id}-${matchedZone.name}`;
      if (!inspectedZoneKeys.has(zoneKey)) {
        setInspectedZoneKeys(prev => {
          const next = new Set(prev);
          next.add(zoneKey);
          return next;
        });

        sounds.playZoneComplete();

        let benefitMsg = '';
        if (matchedZone.color === 'amber' || matchedZone.color === 'ruby') {
          benefitMsg = '+35 Popularity added to Business Showdown!';
        } else if (matchedZone.color === 'sapphire') {
          benefitMsg = '+35 Ambience added to Business Showdown!';
        } else {
          benefitMsg = 'Bonus Activate! +1 Slot for Bonus Selection unlocked!';
        }

        showToast(`🔍 ${matchedZone.name} Inspected: ${benefitMsg}`, 'success');
      }
    }
  }, [currentLevel.isBossLevel, currentLevel.id, currentPhase, hoveredCoord, inspectedZoneKeys]);

  // Boss Battle Stats Calculation derived from inspected colored zones and placed tiles
  const bossBattleStats = useMemo<BossBattleStats>(() => {
    // ── Check Zero Stats Drop Rule ───────────────────────────────────
    // "if lightbulb budget used exceed or 2 penalties are triggered (exclude overuse penalty), all stats drop to 0."
    const isBudgetExceeded = lightbulbBudget > 0 && lightbulbsUsed > lightbulbBudget;
    const nonOverusePenaltiesCount =
      penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood;
    const isStatsCollapsed = isBudgetExceeded || nonOverusePenaltiesCount >= 2;

    // ── 1. Collect all unique colored zones across every phase ────────
    const allLevelZonesMap = new Map<
      string,
      { name: string; color: TileColor; cellCount: number }
    >();
    currentLevel.phases.forEach(ph => {
      ph.coloredZones.forEach(z => {
        const key = `${currentLevel.id}-${z.name}`;
        const existing = allLevelZonesMap.get(key);
        if (existing) {
          existing.cellCount += z.coords.length;
        } else {
          allLevelZonesMap.set(key, {
            name: z.name,
            color: z.color,
            cellCount: z.coords.length,
          });
        }
      });
    });

    const totalSectionsCount = allLevelZonesMap.size;
    let inspectedCount = 0;

    // ── 2. Inspection Bonuses (scaled by zone cell count) ─────────────
    let popGained = 0;
    let ambGained = 0;
    let slotsGained = 0;

    allLevelZonesMap.forEach((z, key) => {
      if (inspectedZoneKeys.has(key)) {
        inspectedCount++;

        if (z.color === 'amber') {
          popGained += 12 * z.cellCount;
        } else if (z.color === 'ruby') {
          popGained += 18 * z.cellCount;
        } else if (z.color === 'sapphire') {
          ambGained += 15 * z.cellCount;
        } else if (z.color === 'emerald') {
          slotsGained += Math.floor(z.cellCount / 2);
        }
      }
    });

    if (isStatsCollapsed) {
      return {
        popularity: 0,
        ambience: 0,
        bonusSlots: 0,
        inspectedSectionsCount: inspectedCount,
        totalSectionsCount,
        isStatsCollapsed: true,
        collapseReason: isBudgetExceeded
          ? `Budget Exceeded (${lightbulbsUsed}/${lightbulbBudget} 💡)`
          : `${nonOverusePenaltiesCount} Non-Overuse Penalties Active`,
        inspectedBenefits: {
          popularityGained: 0,
          ambienceGained: 0,
          bonusSlotsGained: 0,
        },
        synthesiaMultiplier: 1.0,
        zonesFulfilled: 0,
        attack: 0,
        defense: 0,
        traits: {
          lifeStealPct: 0,
          aegisShield: 0,
          doubleStrikePct: 0,
          thornCounterPct: 0,
          criticalRatePct: 0,
        },
      };
    }

    // ── Business Battle Player Stats — Zero Baseline ──────────────────
    let pop = 0;
    let amb = 0;
    let bonusSlots = 2; // Minimal baseline so milestone modals remain usable

    // ── 3. Tile Placement Bonuses (per placed tile on a colored cell) ─
    placedTiles.forEach(stack => {
      stack.forEach(tile => {
        const key = coordKey(tile.q, tile.r);
        const cell = unlockedCells.get(key);
        if (cell) {
          if (cell.colorRequirement === 'amber') {
            pop += 18;
          } else if (cell.colorRequirement === 'ruby') {
            pop += 24;
          } else if (cell.colorRequirement === 'sapphire') {
            amb += 22;
          } else if (cell.colorRequirement === 'emerald') {
            pop += 8;
            amb += 8;
          }
        }
      });
    });

    // ── 4. Count unique fulfilled zones across all phases ────────────
    // A zone is "fulfilled" when every cell has a tile whose color
    // matches the zone's required color (same logic as Target Color Zones).
    const fulfilledZoneNames = new Set<string>();
    const seenZoneNames = new Set<string>();
    currentLevel.phases.forEach(ph => {
      ph.coloredZones.forEach(zone => {
        const zoneKey = `${currentLevel.id}-${zone.name}`;
        if (seenZoneNames.has(zoneKey)) return;
        seenZoneNames.add(zoneKey);

        const isZoneComplete = zone.coords.every(c => {
          const stack = placedTiles.get(coordKey(c.q, c.r));
          if (!stack || stack.length === 0) return false;
          const top = stack[stack.length - 1];

          // Bridges don't count as zone fulfillment
          if (top.type === 'bridge') return false;

          return top.color === zone.color;
        });

        if (isZoneComplete) fulfilledZoneNames.add(zoneKey);
      });
    });

    const zonesFulfilled = fulfilledZoneNames.size;

    // ── 5. Synthesia Multiplier ──────────────────────────────────────
    // +0.05 per unique fulfilled zone, base 1.00, capped at 1.25.
    const synthesiaMultiplier = Math.min(1.0 + 0.05 * zonesFulfilled, 1.25);

    // ── 6. Apply Synthesia to combined stats and round ───────────────
    const combinedPop = pop + popGained;
    const combinedAmb = amb + ambGained;

    const finalPop = Math.round(combinedPop * synthesiaMultiplier);
    const finalAmb = Math.round(combinedAmb * synthesiaMultiplier);
    const finalBonusSlots = bonusSlots + slotsGained;

    return {
      popularity: finalPop,
      ambience: finalAmb,
      bonusSlots: finalBonusSlots,
      inspectedSectionsCount: inspectedCount,
      totalSectionsCount,
      inspectedBenefits: {
        popularityGained: popGained,
        ambienceGained: ambGained,
        bonusSlotsGained: slotsGained,
      },
      // Synthesia diagnostics
      synthesiaMultiplier,
      zonesFulfilled,
      attack: Math.round(finalPop / 3),
      defense: Math.round(finalAmb / 3),
      traits: {
        lifeStealPct: 0.1,
        aegisShield: 20,
        doubleStrikePct: 0.1,
        thornCounterPct: 0.1,
        criticalRatePct: 0.1,
      },
    };
  }, [placedTiles, unlockedCells, currentLevel, inspectedZoneKeys, lightbulbBudget, lightbulbsUsed, penalties]);

  // Check Road / Bridge requirements for Level 16 and Level 23
  const roadHexCount = useMemo(() => {
    let count = 0;
    placedTiles.forEach(stack => {
      stack.forEach(tile => {
        if (tile.type === 'road') count++;
      });
    });
    return count;
  }, [placedTiles]);

  const bridgeHexCount = useMemo(() => {
    let count = 0;
    placedTiles.forEach(stack => {
      stack.forEach(tile => {
        if (tile.type === 'bridge') count++;
      });
    });
    return count;
  }, [placedTiles]);

  const meetsLevelMechanicRequirement = (() => {
    // Original Level 16 / 23 gating
    if (currentLevel.id === 16) return roadHexCount >= 1;
    if (currentLevel.id === 23) return bridgeHexCount >= 1;

    // Traffic Attack gating — all road requirements must be satisfied
    if (currentLevel.levelType === 'traffic_attack') {
      return roadRequirementProgress.satisfied;
    }

    return true;
  })();

  // Counted blocking penalties for level victory: Overlap, Off-board, Falsehood, Disconnect (Overuse is bypassed)
  const blockingPenaltiesCount =
    (penalties.overlap || 0) +
    (penalties.offMap || 0) +
    (penalties.disconnect || 0) +
    (penalties.falsehood || 0);

  const isLastPhase = phaseIndex + 1 >= currentLevel.phases.length;

  // Can the player complete / advance this phase?
  // - Expand for next phase: Available when colored zones are completed
  // - Complete level (final phase): Blocked if Overlap, Off-board, Falsehood, or Disconnect penalties exist, or mechanic requirement unmet
  const canCompletePhase =
    playMode === 'building'
      ? isLastPhase
        ? coloredZonesCompleted && meetsLevelMechanicRequirement && blockingPenaltiesCount === 0 && (lightbulbBudget <= 0 || lightbulbsUsed <= lightbulbBudget)
        : coloredZonesCompleted && (lightbulbBudget <= 0 || lightbulbsUsed <= lightbulbBudget)
      : isLastPhase
        ? coloredZonesCompleted && meetsLevelMechanicRequirement && blockingPenaltiesCount === 0 && inBoundsPlacedCount >= Math.min(2, parCount)
        : coloredZonesCompleted && inBoundsPlacedCount >= Math.min(2, parCount);

  // Calculate Real-Time Score (includes +600 Mastery Bonus when achieved; 0 if disqualified)
  const score = useMemo(() => {
    if (isPenaltyLimitExceeded || isFalsehoodActive) {
      return 0;
    }
    let finalScore = rawScore;
    if (currentLevel.masteryChallenge && isMasteryCompleted) {
      finalScore += 600;
    }
    return finalScore;
  }, [rawScore, currentLevel, isMasteryCompleted, isPenaltyLimitExceeded, isFalsehoodActive]);

  // Stars calculation
  const starsEarned = useMemo(() => {
    const targets = currentLevel.targetScore;
    if (score >= targets.star3) return 3;
    if (score >= targets.star2) return 2;
    if (score >= targets.star1) return 1;
    return 0;
  }, [score, currentLevel]);

  // Rotate a held cluster by 60° (using R key or Rotate button)
  const handleRotateCluster = useCallback(() => {
    if (!selectedPiece) {
      showToast('Select a multi-hex cluster to rotate (R key)!', 'info');
      return;
    }
    if (selectedPiece.clusterShape && selectedPiece.clusterShape.length > 1) {
      const newShape = selectedPiece.clusterShape.map(off => {
        const rotated = rotateHexCoord(off, { q: 0, r: 0 }, 1);
        return { ...off, q: rotated.q, r: rotated.r };
      });
      setSelectedPiece({ ...selectedPiece, clusterShape: newShape });
      sounds.playRotate();
      showToast(`${selectedPiece.name} rotated 60° (R key)!`, 'info');
    } else {
      showToast('Single hexes have symmetric orientation. Use [R] on multi-hex clusters!', 'info');
    }
  }, [selectedPiece]);

  // Execute Tile / Cluster Placement
  const handlePlaceTile = useCallback(
    (anchorCoord: HexCoord, pieceToPlace: HexPiece) => {
      // Stock check for limited piece inventory (e.g. Level 25 Boss challenge)
      if (pieceToPlace.stock !== undefined && pieceToPlace.stock <= 0) {
        sounds.playWarning();
        showToast('Out of Stock! You have deployed all available copies of this tile.', 'warn');
        return;
      }

      const isCluster = Boolean(pieceToPlace.clusterShape && pieceToPlace.clusterShape.length > 1);
      const offsets = isCluster && pieceToPlace.clusterShape ? pieceToPlace.clusterShape : [{ q: 0, r: 0 }];

      // 1. Road Placement Adjacency Check:
      // Roads (single or multi-hex cluster) must be placed adjacent to at least one placed House, Tower, Landmark, Road, or Bridge structure.
      const hasRoadCells = offsets.some(off => (off.type || pieceToPlace.type) === 'road');
      let isRoadPlacedLegit = true;

      if (hasRoadCells) {
        isRoadPlacedLegit = offsets.some(off => {
          const tQ = anchorCoord.q + off.q;
          const tR = anchorCoord.r + off.r;
          const neighbors = getHexNeighbors(tQ, tR);

          return neighbors.some(n => {
            // Ignore cells that are part of the piece currently being placed
            const isInternal = offsets.some(other => anchorCoord.q + other.q === n.q && anchorCoord.r + other.r === n.r);
            if (isInternal) return false;

            const nKey = coordKey(n.q, n.r);
            const stack = placedTiles.get(nKey) || [];
            return stack.some(t => {
              const types = ['house', 'tower', 'landmark', 'road', 'bridge'];
              if (types.includes(t.type)) {
                return true;
              }
              if (t.clusterShape) {
                return t.clusterShape.some(o => types.includes(o.type || ''));
              }
              if (t.clusterPieceOriginal) {
                if (types.includes(t.clusterPieceOriginal.type)) {
                  return true;
                }
                if (t.clusterPieceOriginal.clusterShape) {
                  return t.clusterPieceOriginal.clusterShape.some(o => types.includes(o.type || ''));
                }
              }
              return false;
            });
          });
        });
      }

      if (hasRoadCells && !isRoadPlacedLegit) {
        sounds.playWarning();
        showToast('🚧 Road Placement Error: Roads can only be built adjacent to a House, Tower, Landmark, Road, or Bridge!', 'warn');
        return;
      }

      // Check Junction & Roundabout Placement Constraints:
      // Three-way junction requires 3 roads connect to it.
      // Four-way junction requires 4 roads connect to it.
      // Roundabout requires 5 roads connect to it.
      const is3Way = pieceToPlace.id === 'p-junction-3way' || pieceToPlace.id.includes('3way');
      const is4Way = pieceToPlace.id === 'p-junction-4way' || pieceToPlace.id.includes('4way');
      const isRoundabout = pieceToPlace.id === 'p-junction-roundabout' || pieceToPlace.id.includes('roundabout');

      if (is3Way || is4Way || isRoundabout) {
        let connectedRoads = 0;
        HEX_DIRECTIONS.forEach(dir => {
          const nQ = anchorCoord.q + dir.q;
          const nR = anchorCoord.r + dir.r;
          const stack = placedTiles.get(coordKey(nQ, nR)) || [];
          if (stack.some(t => t.type === 'road' || t.type === 'bridge')) {
            connectedRoads++;
          }
        });

        const minRequired = isRoundabout ? 5 : is4Way ? 4 : 3;
        if (connectedRoads < minRequired) {
          sounds.playWarning();
          const jName = isRoundabout ? 'Grand Roundabout' : is4Way ? 'Four-Way Crossroads' : 'Three-Way Junction';
          showToast(
            `⚠️ ${jName} Constraint: Requires at least ${minRequired} connecting road neighbors! (Currently connected to ${connectedRoads})`,
            'warn'
          );
          return;
        }
      }

      // 2. River Barrier Check: Waterways cannot be built on unless it's a bridge!
      const touchesRiver = offsets.some(off => {
        const tQ = anchorCoord.q + off.q;
        const tR = anchorCoord.r + off.r;
        const key = coordKey(tQ, tR);
        const cell = unlockedCells.get(key);
        const cellType = off.type || pieceToPlace.type;
        return cell?.isRiver && cellType !== 'bridge';
      });

      if (touchesRiver) {
        sounds.playWarning();
        showToast('🌊 River Barrier: Natural waterways are unbuildable!', 'warn');
        return;
      }

      // 3. Color Mismatch Check
      let hasMismatch = false;
      let mismatchName = '';

      for (const off of offsets) {
        const tQ = anchorCoord.q + off.q;
        const tR = anchorCoord.r + off.r;
        const targetCell = unlockedCells.get(coordKey(tQ, tR));
        if (targetCell && targetCell.colorRequirement !== 'neutral' && targetCell.colorRequirement !== pieceToPlace.color) {
          hasMismatch = true;
          mismatchName = targetCell.colorRequirement.toUpperCase();
          break;
        }
      }

      if (hasMismatch) {
        sounds.playWarning();
        showToast(`Color Mismatch! Cell reserved for ${mismatchName} pieces.`, 'warn');
        return;
      }

      // 4. Fog Hex Check:
      let placedOnFog = false;
      let isFogLegit = false;
      for (const off of offsets) {
        const tQ = anchorCoord.q + off.q;
        const tR = anchorCoord.r + off.r;
        const key = coordKey(tQ, tR);
        const cell = unlockedCells.get(key);
        if (cell?.isFog) {
          placedOnFog = true;
          const neighbors = getHexNeighbors(tQ, tR);
          for (const n of neighbors) {
            const nKey = coordKey(n.q, n.r);
            const nCell = unlockedCells.get(nKey);
            if (nCell && nCell.isUnlocked && !nCell.isFog && !nCell.isRiver) {
              isFogLegit = true;
              break;
            }
            if (placedTiles.has(nKey) && (placedTiles.get(nKey)?.length || 0) > 0) {
              isFogLegit = true;
              break;
            }
          }
        }
      }

      if (placedOnFog && !isFogLegit) {
        sounds.playWarning();
        showToast('⚠️ Falsehood Penalty! Fog exploration must connect to safe ground. Score is 0 until corrected or removed!', 'warn');
      } else if (placedOnFog && isFogLegit) {
        showToast('🌫️ Safe Fog Exploration! +3 bonus clearance tiles will unlock next phase.', 'success');
      }

      let hadOverlap = false;
      let hadOffMap = false;
      const clusterId = isCluster ? `cluster-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` : undefined;

      setPlacedTiles(prev => {
        const next = new Map(prev);
        offsets.forEach((off, idx) => {
          const tQ = anchorCoord.q + off.q;
          const tR = anchorCoord.r + off.r;
          const tKey = coordKey(tQ, tR);
          const targetCell = unlockedCells.get(tKey);
          const cellType = off.type || pieceToPlace.type;

          // Bridges can build on empty / water areas, so they are never Off-Map!
          if (cellType !== 'bridge' && (!targetCell || (targetCell.isFog && !isFogLegit))) {
            hadOffMap = true;
          }

          const existingStack = next.get(tKey) || [];
          if (existingStack.length > 0) {
            hadOverlap = true;
          }

          const newTile: PlacedTile = {
            ...pieceToPlace,
            type: off.type || pieceToPlace.type,
            placementId: `${clusterId || 'tile-' + Date.now()}-${idx}`,
            clusterId,
            clusterAnchor: { q: anchorCoord.q, r: anchorCoord.r },
            clusterPieceOriginal: pieceToPlace,
            placedAt: Date.now(),
            q: tQ,
            r: tR,
          };

          next.set(tKey, [...existingStack, newTile]);
        });
        return next;
      });

      // Decrement inventory stock if limited
      if (pieceToPlace.stock !== undefined) {
        setAvailablePieces(prev =>
          prev.map(p => (p.id === pieceToPlace.id && p.stock !== undefined ? { ...p, stock: Math.max(0, p.stock - 1) } : p))
        );
      }

      if (hadOverlap && bypasses.overlap === 0) {
        sounds.playWarning();
        showToast('⚠️ Overlap Error (+1)! Remove the overlapping tile or the -100 Overlap Penalty will apply.', 'warn');
      } else if (hadOverlap && bypasses.overlap > 0) {
        sounds.playPlace();
        showToast(`🛡️ Overlap Protected! Memory Free Pass absorbed penalty.`, 'success');
      } else if (hadOffMap && !placedOnFog) {
        sounds.playWarning();
        showToast('Placed outside boundary! Highlighted with warning border.', 'warn');
      } else {
        sounds.playPlace(pieceToPlace.color !== 'neutral');
        showToast(
          isCluster
            ? `${pieceToPlace.name} (Giant ${offsets.length}-Hex Cluster) placed!`
            : `${pieceToPlace.name} placed!`,
          'info'
        );
      }

      setSelectedPiece(null);
      setPickedUpCoord(null);
    },
    [unlockedCells, bypasses, placedTiles]
  );

  // Auto-demo build helper for tutorial demonstration
  const handleAutoDemoBuild = useCallback((coord: HexCoord, pieceId: string) => {
    const piece = PIECE_PALETTE.find(p => p.id === pieceId) || currentLevel.availablePieces.find(p => p.id === pieceId);
    if (piece) {
      handlePlaceTile(coord, piece);
    }
  }, [currentLevel, handlePlaceTile]);

  // Rotate a Rotation Zone (Turntable mechanic)
  // Logic: Turntables only rotate SINGLE hexes; clusters are fixed monolithic structures!
  // Level 20+: Turntables ALSO rotate the color requirements of the cells!
  const handleRotateZone = useCallback(
    (zoneId: string) => {
      const zone = currentPhase.rotationZones?.find(z => z.id === zoneId);
      if (!zone) return;

      const zoneCoords = getCoordsInRadius(zone.center, zone.radius);
      const zoneKeySet = new Set(zoneCoords.map(c => coordKey(c.q, c.r)));

      // 1. Rotate single tiles on the turntable (clusters remain stationary)
      setPlacedTiles(prev => {
        const next = new Map<string, PlacedTile[]>();
        const singleStacksToRotate: { oldKey: string; stack: PlacedTile[] }[] = [];

        prev.forEach((stack, key) => {
          if (zoneKeySet.has(key)) {
            // Check if this stack belongs to a multi-hex cluster
            const isClusterStack = stack.some(t => Boolean(t.clusterId || (t.clusterShape && t.clusterShape.length > 1)));
            if (isClusterStack) {
              // Cluster tiles stay fixed in place!
              next.set(key, stack);
            } else {
              // Single tile stack: rotate around zone center
              singleStacksToRotate.push({ oldKey: key, stack });
            }
          } else {
            next.set(key, stack);
          }
        });

        singleStacksToRotate.forEach(({ stack }) => {
          if (stack.length === 0) return;
          const rotatedCoord = rotateHexCoord({ q: stack[0].q, r: stack[0].r }, zone.center, 1);
          const newKey = coordKey(rotatedCoord.q, rotatedCoord.r);
          const updatedStack = stack.map(tile => ({
            ...tile,
            q: rotatedCoord.q,
            r: rotatedCoord.r,
          }));
          const existingAtNew = next.get(newKey) || [];
          next.set(newKey, [...existingAtNew, ...updatedStack]);
        });

        return next;
      });

      // 2. Level 20+ Turntable: Switch positions of the colored hexes within the turntable area!
      if (currentLevel.id >= 20) {
        setUnlockedCells(prev => {
          const next = new Map(prev);
          const cellsInZone = zoneCoords.map(c => prev.get(coordKey(c.q, c.r))).filter((c): c is GridCell => Boolean(c));
          cellsInZone.forEach(c => {
            const rotated = rotateHexCoord({ q: c.q, r: c.r }, zone.center, 1);
            const targetKey = coordKey(rotated.q, rotated.r);
            const existingTarget = next.get(targetKey);
            if (existingTarget) {
              next.set(targetKey, { ...existingTarget, colorRequirement: c.colorRequirement });
            }
          });
          return next;
        });
      }

      setRotationsPerformed(prev => prev + 1);
      sounds.playRotate();
      showToast(
        currentLevel.id >= 20
          ? `${zone.name} rotated 60° (Single tiles & Color Zones shifted)!`
          : `${zone.name} rotated 60° (Single tiles shifted)!`,
        'info'
      );
    },
    [currentPhase, currentLevel.id]
  );

  // Rotate Turntable zone (using T key)
  const handleRotateTurntableShortcut = useCallback(() => {
    if (currentPhase.rotationZones && currentPhase.rotationZones.length > 0) {
      handleRotateZone(currentPhase.rotationZones[0].id);
    } else {
      showToast('No Turntable in this phase!', 'info');
    }
  }, [currentPhase.rotationZones, handleRotateZone]);

  // Keyboard shortcuts: Press 'R' to rotate cluster, Press 'T' to rotate turntable, Press 'H' to toggle Clean UI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotateCluster();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleRotateTurntableShortcut();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsCleanUiMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotateCluster, handleRotateTurntableShortcut]);

  // Right-Click Handler
  const handleRightClickBoard = useCallback(
    (coord: HexCoord | null) => {
      if (selectedPiece) {
        setPickedUpCoord(null);
        setSelectedPiece(null);
        sounds.playPickup();
        showToast(`${selectedPiece.name} returned to tray!`, 'success');
        return;
      }

      if (coord) {
        const key = coordKey(coord.q, coord.r);

        const stack = placedTiles.get(key);
        if (stack && stack.length > 0) {
          const topTile = stack[stack.length - 1];

          // ─────────────────────────────────────────────────────────────
          // LOCKED PRE-PLACED TILE GUARD
          // Pre-placed roads/bridges are municipal infrastructure and
          // cannot be removed. Check the top tile, not the cell, so a
          // player's own tile stacked on top remains removable.
          // ─────────────────────────────────────────────────────────────
          const isPrePlacedTile =
            typeof topTile.clusterId === 'string' &&
            topTile.clusterId.startsWith('PREPLACED');

          if (isPrePlacedTile) {
            sounds.playWarning();
            showToast('🚧 This structure is locked by the Town Council — it cannot be removed!', 'warn');
            return;
          }

          if (topTile.clusterId) {
            const targetClusterId = topTile.clusterId;
            setPlacedTiles(prev => {
              const next = new Map(prev);
              prev.forEach((cellStack, cellKey) => {
                const remaining = cellStack.filter(t => t.clusterId !== targetClusterId);
                if (remaining.length === 0) {
                  next.delete(cellKey);
                } else if (remaining.length !== cellStack.length) {
                  next.set(cellKey, remaining);
                }
              });
              return next;
            });

            sounds.playPickup();
            showToast(`${topTile.name} (Giant Cluster) returned to tray! Overlap cleared.`, 'success');
            return;
          }

          setPlacedTiles(prev => {
            const next = new Map(prev);
            if (stack.length === 1) {
              next.delete(key);
            } else {
              next.set(key, stack.slice(0, stack.length - 1));
            }
            return next;
          });
          sounds.playPickup();
          if (stack.length > 1) {
            showToast(`Overlapping ${topTile.name} removed! Overlap penalty cleared.`, 'success');
          } else {
            showToast(`${topTile.name} returned to available hex cells!`, 'info');
          }
        }
      }
    },
    [placedTiles, selectedPiece]
  );

  const handleRightClickTrayPiece = (_piece: HexPiece) => {
    if (selectedPiece) {
      handleReturnPickedUpTile();
    }
  };

  const handleStartDrag = (piece: HexPiece, clientX: number, clientY: number) => {
    setActiveDragPiece(piece);
    setDragPointerPos({ x: clientX, y: clientY });
    dragStartPosRef.current = { x: clientX, y: clientY };
    hasDraggedRef.current = false;
    sounds.playPickup();
  };

  useEffect(() => {
    if (!activeDragPiece) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragPointerPos({ x: e.clientX, y: e.clientY });
      if (Math.hypot(e.clientX - dragStartPosRef.current.x, e.clientY - dragStartPosRef.current.y) > 12) {
        hasDraggedRef.current = true;
      }
    };

    const handlePointerUp = () => {
      if (hasDraggedRef.current && hoveredCoord && activeDragPiece) {
        handlePlaceTile(hoveredCoord, activeDragPiece);
      } else if (activeDragPiece) {
        setSelectedPiece(activeDragPiece);
      }
      setActiveDragPiece(null);
      setDragPointerPos(null);
      hasDraggedRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDragPiece, hoveredCoord, handlePlaceTile]);

  // Click-to-place, Pick Up Giant Cluster / Tile, or Relocate on board
  const handleTileDroppedOnBoard = (coord: HexCoord) => {
    if (Date.now() - selectTimestampRef.current < 250) {
      return;
    }

    if (selectedPiece) {
      handlePlaceTile(coord, selectedPiece);
      return;
    }

    const key = coordKey(coord.q, coord.r);
    const stack = placedTiles.get(key);
    if (stack && stack.length > 0) {
      const topTile = stack[stack.length - 1];

      // ─────────────────────────────────────────────────────────────
      // LOCKED PRE-PLACED TILE GUARD
      // Pre-placed roads/houses/bridges are municipal infrastructure
      // and cannot be picked up. Check the TOP tile, not the cell,
      // so a player's own tile stacked on top remains removable.
      // ─────────────────────────────────────────────────────────────
      const isPrePlacedTile =
        typeof topTile.clusterId === 'string' &&
        topTile.clusterId.startsWith('PREPLACED');

      if (isPrePlacedTile) {
        sounds.playWarning();
        showToast('🚧 This structure is locked by the Town Council — it cannot be moved!', 'warn');
        return;
      }

      // Giant Multi-Hex Cluster
      if (topTile.clusterId) {
        const targetClusterId = topTile.clusterId;
        const anchor = topTile.clusterAnchor || { q: topTile.q, r: topTile.r };
        const clusterPiece: HexPiece = topTile.clusterPieceOriginal || {
          id: topTile.id,
          type: topTile.type,
          color: topTile.color,
          name: topTile.name,
          description: topTile.description,
          bonusesDescription: topTile.bonusesDescription,
          clusterShape: topTile.clusterShape,
          clusterType: topTile.clusterType,
        };

        setPlacedTiles(prev => {
          const next = new Map(prev);
          prev.forEach((cellStack, cellKey) => {
            const remaining = cellStack.filter(t => t.clusterId !== targetClusterId);
            if (remaining.length === 0) {
              next.delete(cellKey);
            } else if (remaining.length !== cellStack.length) {
              next.set(cellKey, remaining);
            }
          });
          return next;
        });

        setPickedUpCoord(anchor);
        setSelectedPiece(clusterPiece);
        sounds.playPickup();

        const hexCount = clusterPiece.clusterShape?.length || 'Multi';
        showToast(
          `Picked up ${clusterPiece.name} (Giant ${hexCount}-Hex Cluster)! Click to relocate, right-click to return to tray.`,
          'info'
        );
        return;
      }

      // Single Tile
      setPlacedTiles(prev => {
        const next = new Map(prev);
        if (stack.length === 1) {
          next.delete(key);
        } else {
          next.set(key, stack.slice(0, stack.length - 1));
        }
        return next;
      });

      setPickedUpCoord(coord);
      setSelectedPiece(topTile);
      sounds.playPickup();

      if (stack.length > 1) {
        showToast(`Picked up overlapping ${topTile.name}! Overlap cleared. Relocate or right-click to return.`, 'info');
      } else {
        showToast(`${topTile.name} picked up! Click to place, right-click to return.`, 'info');
      }
    }
  };

  const handleCompletePhase = () => {
    setHasCompletedFirstTrial(true);

    if (phaseIndex + 1 < currentLevel.phases.length) {
      sounds.playZoneComplete();
      setIsExpansionAnimating(true);
      const nextPhaseNum = phaseIndex + 2;
      const nextPhaseTarget = currentLevel.phases[phaseIndex + 1]?.targetTilesCount || currentPhase?.targetTilesCount || 5;
      setLevelTransit({
        levelId: currentLevel.id,
        levelName: currentLevel.name,
        parLimit: nextPhaseTarget,
        phaseNumber: nextPhaseNum,
      });
      setPhaseIndex(prev => prev + 1);
      showToast(`Expansion Unlocked! Advancing to Phase ${nextPhaseNum}.`, 'success');
      setTimeout(() => {
        setIsExpansionAnimating(false);
      }, 1200);
    } else {
      // Final Phase: Level Victory Validation
      if (blockingPenaltiesCount > 0) {
        sounds.playWarning();
        showToast(`Cannot complete level: ${blockingPenaltiesCount} active penalty error(s) (Overlap, Off-board, Falsehood, or Disconnect). Resolve them to achieve victory!`, 'warn');
        return;
      }

      if (currentLevel.id === 16 && roadHexCount < 1) {
        sounds.playWarning();
        showToast('Level 16 Requirement: Place at least 1 Road hex to connect the settlements!', 'warn');
        return;
      }

      if (currentLevel.id === 23 && bridgeHexCount < 1) {
        sounds.playWarning();
        showToast('Level 23 Requirement: Place at least 1 Bridge hex to span across the river!', 'warn');
        return;
      }

      if (currentLevel.levelType === 'traffic_attack' && !roadRequirementProgress.satisfied) {
        sounds.playWarning();
        const unmet = roadRequirementProgress.perRoad.filter(r => !r.satisfied);
        showToast(
          `🚧 Transit Charters unmet: ${unmet.map(r => `${r.roadKey} (${r.adjacent}/${r.required})`).join(', ')}`,
          'warn'
        );
        return;
      }

      const isTryHard = gameMode === 'tryhard';
      const hasMastery = Boolean(currentLevel.masteryChallenge);

      if (isTryHard) {
        if (starsEarned < 1 || (hasMastery && !isMasteryCompleted)) {
          sounds.playWarning();
          if (starsEarned < 1 && hasMastery && !isMasteryCompleted) {
            showToast('Try-Hard Mode: Victory requires at least 1 Star (★1) AND Mastery Challenge completed!', 'warn');
          } else if (starsEarned < 1) {
            showToast('Try-Hard Mode: Victory requires reaching at least 1 Star (★1)!', 'warn');
          } else {
            showToast('Try-Hard Mode: Victory requires completing the Mastery Challenge objective!', 'warn');
          }
          return;
        }
      }

      // Level Completed! Record highest completed level and advance progression
      const completedLvlId = currentLevel.id;
      const newHighest = Math.max(highestCompletedLevel, completedLvlId);
      setHighestCompletedLevel(newHighest);

      // Reward Coins based on stars: Base 100 + 50 for 2★ + 100 for 3★
      const coinsEarned = 100 + (starsEarned >= 2 ? 50 : 0) + (starsEarned === 3 ? 100 : 0);
      setCoins(prev => prev + coinsEarned);

      // ── Guest trial advancement ────────────────────────────────
      // If a guest just finished one of the five trial levels, move
      // them to the next trial. This keeps the Home Play button in sync
      // with their progress.
      if (isGuest && GUEST_TRIAL_LEVEL_IDS.includes(currentLevel.id as any)) {
        handleGuestTrialAdvance();
      }

      // Check if any new Journey chests unlocked
      const unlockedChests = JOURNEY_CHESTS.filter(
        c => newHighest >= c.levelThreshold && !claimedChestIds.includes(c.id)
      );
      if (unlockedChests.length > 0) {
        showToast(`Settlement Established! +${coinsEarned} Coins Earned · Journey Chest Ready!`, 'success');
      } else {
        showToast(`Settlement Established! +${coinsEarned} Coins Earned!`, 'success');
      }

      sounds.playVictory();

      // Directly trigger the responsive End-of-Level Celebration Winning Modal!
      const nextLvl = allLevels[levelIndex + 1] || null;

      setLevelCelebration({
        completedLevelId: currentLevel.id,
        completedLevelName: currentLevel.name,
        nextLevelId: nextLvl ? nextLvl.id : undefined,
        nextLevelName: nextLvl ? nextLvl.name : undefined,
        score: score,
        starsEarned: starsEarned,
        coinsEarned: coinsEarned,
        isMasteryCompleted: isMasteryCompleted,
        masteryTitle: currentLevel.masteryChallenge?.title,
        masteryDescription: currentLevel.masteryChallenge?.description,
        penalties: penalties,
        totalLevelsCount: LEVELS.length,
        isFinalLevel: levelIndex + 1 >= LEVELS.length,
        gameMode: gameMode,
      });
    }
  };

  const handleCelebrationContinue = () => {
    const celebrationSnapshot = levelCelebration;
    setLevelCelebration(null);

    // After Level 5 complete, return Home and showcase all elements of Home
    if (celebrationSnapshot?.completedLevelId === 5) {
      setLevelIndex(5); // Level 6: The Great Stoneworks (introduces Cluster mechanics)
      navigateWithTransition('home', 'Conquered Level 5! Returning Home', 'Frontier Hub Unlocked');
      setIsOpenHomeShowcase(true);
      sounds.playVictory();
      showToast('Level 5 Conquered! Welcome to the Frontier Hub.', 'success');
      return;
    }

    if (levelIndex + 1 < allLevels.length) {
      triggerLevelTransit(levelIndex + 1);
    } else {
      navigateWithTransition('home', 'All 40 Levels Conquered!', 'Grand Archipelago Explorer');
      showToast('Mastery Victory! All Archipelago frontiers conquered.', 'success');
    }
  };

  const handleCelebrationReplay = () => {
    setLevelCelebration(null);
    handleResetBoard();
  };

  const handleResetBoard = () => {
    setLevelTransit({
      levelId: currentLevel.id,
      levelName: currentLevel.name,
      parLimit: currentPhase?.targetTilesCount || 5,
    });
    const initialMap = new Map<string, PlacedTile[]>();
    const prePlacedKeys = new Set<string>();
    if (currentPhase) {
      if (currentPhase.initialPlacedTiles) {
        currentPhase.initialPlacedTiles.forEach((init, i) => {
          const piece = PIECE_PALETTE.find(p => p.id === init.pieceId) || currentLevel.availablePieces.find(p => p.id === init.pieceId);
          if (piece) {
            const key = coordKey(init.q, init.r);
            const placed: PlacedTile = {
              ...piece,
              placementId: `init-${currentLevel.id}-${i}-${Date.now()}`,
              placedAt: Date.now() + i,
              q: init.q,
              r: init.r,
            };
            initialMap.set(key, [placed]);
          }
        })
      };
      if (currentPhase.prePlacedRoads) {
        currentPhase.prePlacedRoads.forEach((pre, i) => {
          const piece = PIECE_PALETTE.find(p => p.id === pre.pieceId) || currentLevel.availablePieces.find(p => p.id === pre.pieceId);
          if (piece) {
            const key = coordKey(pre.q, pre.r);
            const placed: PlacedTile = {
              ...piece,
              placementId: `preplaced-${currentLevel.id}-${i}-${Date.now()}`,
              placedAt: Date.now() + i,
              q: pre.q,
              r: pre.r,
              clusterId: `PREPLACED-${currentLevel.id}-${phaseIndex}-${i}`,
            };
            const existing = initialMap.get(key) || [];
            initialMap.set(key, [...existing, placed]);
            prePlacedKeys.add(key);
          }
        });
      }
    }
    setPlacedTiles(initialMap);
    setPrePlacedTileKeys(prePlacedKeys);
    setRotationsPerformed(0);
    setSelectedPiece(null);
    setPickedUpCoord(null);
    showToast('Board cleared. Pioneer anew!', 'info');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // ─────────────────────────────────────────────────────────────
  // Cloud Save — apply a remote blob to React state
  // ─────────────────────────────────────────────────────────────
  const applyRemoteBlob = useCallback((blob: CloudSaveBlob) => {
    console.log('[applyRemoteBlob] PULLING FROM CLOUD — setting latestChapterExplore:', blob.latestChapterExplore);
    setHighestCompletedLevel(blob.highestCompletedLevel);
    setCoins(blob.coins);
    setLeaves(blob.leaves);
    setBoosters(blob.boosters);
    setClaimedChestIds(blob.claimedChestIds);
    setHasGoldenTicket(blob.hasGoldenTicket);
    setPlayMode(blob.playMode);
    setGameMode(blob.gameMode);
    setLatestChapterExplore(blob.latestChapterExplore);
    setLatestMemories(blob.latestMemories);

    if (Array.isArray(blob.memories) && blob.memories.length > 0) {
      setMemories(blob.memories);
    }

    // Rehydrate constructions from the map
    setConstructions(prev =>
      prev.map(item => ({
        ...item,
        currentLevel: blob.constructions?.[item.id] ?? item.currentLevel,
      }))
    );

    showToast('Cloud save loaded.', 'success');
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Cloud Save — the sync engine
  // ─────────────────────────────────────────────────────────────
  const {
    status: saveStatus,
    lastSyncedAt,
    error: saveError,
    forceSync,
  } = useCloudSaveSync({
    userId: user?.id ?? null,
    saveState,
    applyRemote: applyRemoteBlob,
    onConflict: (local, cloud, resolve) => {
      setPendingConflict({ local, cloud, resolve });
    },
  });

  const handleReturnPickedUpTile = () => {
    if (selectedPiece) {
      showToast(`${selectedPiece.name} returned to available hex cells!`, 'info');
      setPickedUpCoord(null);
      setSelectedPiece(null);
      sounds.playPickup();
    }
  };

  // Economy Handlers
  const handleBuyBooster = (booster: BoosterItem) => {
    if (isGuest) {
      sounds.playWarning();
      setAuthPrompt('Sign in to purchase tactical boosters from the Emporium.');
      setAuthMode('guest');
      setIsAuthModalOpen(true);
      return;
    }
    if (coins < booster.costCoins) {
      sounds.playWarning();
      showToast(`Not enough Coins! Need ${booster.costCoins} Coins.`, 'warn');
      return;
    }
    setCoins(prev => prev - booster.costCoins);
    setBoosters(prev => ({
      ...prev,
      [booster.id]: (prev[booster.id] || 0) + 1,
    }));
    sounds.playVictory();
    showToast(`Purchased 1x ${booster.name}!`, 'success');
  };

  const handleClaimChest = (chestId: number) => {
    if (isGuest) {
      sounds.playWarning();
      setAuthPrompt('Sign in to claim Journey Chest rewards and expand your resort.');
      setAuthMode('guest');
      setIsAuthModalOpen(true);
      return;
    }
    const chest = JOURNEY_CHESTS.find(c => c.id === chestId);
    if (!chest) return;
    if (claimedChestIds.includes(chestId)) return;
    if (highestCompletedLevel < chest.levelThreshold) {
      showToast(`Reach Level ${chest.levelThreshold} to unlock this chest!`, 'warn');
      return;
    }

    setClaimedChestIds(prev => [...prev, chestId]);
    setLeaves(prev => prev + chest.leavesReward);
    setCoins(prev => prev + chest.coinsReward);
    sounds.playVictory();
    showToast(`Claimed ${chest.title}: +${chest.leavesReward} Leaves & +${chest.coinsReward} Coins!`, 'success');
  };

  // ─────────────────────────────────────────────────────────────
  // Cloud Save — wipe cloud row (dangerous)
  // ─────────────────────────────────────────────────────────────
  const handleWipeCloudSave = useCallback(async () => {
    if (!user?.id) return;
    try {
      await deleteCloudBlob(user.id);
      showToast('Cloud save wiped. Signing out…', 'success');
      setIsWipeCloudConfirmOpen(false);
      try { await signOut(); } catch { /* ignore */ }
    } catch (e: any) {
      showToast(`Wipe failed: ${e?.message ?? 'unknown error'}`, 'warn');
    }
  }, [user?.id, signOut]);

  const handleUpgradeConstruction = (id: ConstructionId) => {
    if (isGuest) {
      sounds.playWarning();
      setAuthPrompt('Sign in to build and upgrade your island resort.');
      setAuthMode('guest');
      setIsAuthModalOpen(true);
      return;
    }
    const target = constructions.find(c => c.id === id);
    if (!target) return;
    if (target.currentLevel >= target.maxLevel) {
      showToast(`${target.name} is already at Max Level 3 ★!`, 'info');
      return;
    }
    const cost = target.upgradeCosts[target.currentLevel];
    if (leaves < cost) {
      sounds.playWarning();
      showToast(`Need ${cost} Leaves to upgrade ${target.name}. (Have ${leaves} Leaves)`, 'warn');
      return;
    }

    setLeaves(prev => prev - cost);
    let allMaxed = false;
    setConstructions(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, currentLevel: c.currentLevel + 1 } : c));
      allMaxed = updated.every(c => c.currentLevel === 3);
      return updated;
    });

    sounds.playZoneComplete();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#10b981', '#34d399', '#fef08a'],
    });

    if (allMaxed && !hasGoldenTicket) {
      setHasGoldenTicket(true);
      setIsGoldenTicketModalOpen(true);
      showToast('All 10 Resort Constructions Maxed! Golden Ticket Awarded ★', 'success');
    } else {
      showToast(`${target.name} upgraded to Level ${target.currentLevel + 1}!`, 'success');
    }
  };

  const handleActivateBooster = (boosterId: BoosterId) => {
    if ((boosters[boosterId] || 0) <= 0) {
      // Mobile uses MobileShopSheet (local state per Home screen).
      // Only open the desktop ShopModal on non-mobile layouts.
      if (!layout.useMobileLayout) {
        setIsShopModalOpen(true);
      } else {
        sounds.playWarning();
        showToast('Out of stock — tap Coins to buy more boosters!', 'warn');
      }
      return;
    }

    // Deduct 1 booster from inventory
    setBoosters(prev => ({
      ...prev,
      [boosterId]: Math.max(0, (prev[boosterId] || 0) - 1),
    }));

    if (boosterId === 'chisel_brush') {
      let removedCoord: HexCoord | null = null;
      let removedPiece: PlacedTile | null = null;

      // Helper: is this tile locked infrastructure?
      const isLocked = (t: PlacedTile) => t.clusterId?.startsWith('PREPLACED') === true;

      // First check if any overlap exists
      for (const [key, stack] of placedTiles.entries()) {
        if (stack.length > 1) {
          const top = stack[stack.length - 1];
          if (isLocked(top)) continue; // can't remove locked top tile
          removedCoord = { q: top.q, r: top.r };
          removedPiece = top;
          setPlacedTiles(prev => {
            const next = new Map(prev);
            next.set(key, stack.slice(0, stack.length - 1));
            return next;
          });
          break;
        }
      }

      // If no overlaps, pop the last placed tile
      if (!removedPiece && placedTiles.size > 0) {
        // Iterate newest-first so we pop the most recently placed eligible tile
        const entries = Array.from(placedTiles.entries());
        for (let i = entries.length - 1; i >= 0; i--) {
          const [key, stack] = entries[i];
          if (stack.length === 0) continue;
          const top = stack[stack.length - 1];
          if (isLocked(top)) continue;
          removedCoord = { q: top.q, r: top.r };
          removedPiece = top;
          setPlacedTiles(prev => {
            const next = new Map(prev);
            if (stack.length === 1) next.delete(key);
            else next.set(key, stack.slice(0, stack.length - 1));
            return next;
          });
          break;
        }
      }

      if (removedPiece) {
        setSelectedPiece({
          id: removedPiece.id,
          type: removedPiece.type || 'mixed',
          name: removedPiece.name,
          color: removedPiece.color,
          description: removedPiece.description,
          bonusesDescription: removedPiece.bonusesDescription,
          clusterShape: removedPiece.clusterShape,
          clusterType: removedPiece.clusterType,
        });
        setPickedUpCoord(removedCoord);
      }

      sounds.playPickup();
      showToast('Chisel Brush activated: Misplaced tile restored with zero penalty!', 'success');
    } else if (boosterId === 'cluster_splitter') {
      if (selectedPiece?.clusterShape && selectedPiece.clusterShape.length > 1) {
        const singlePieces: HexPiece[] = selectedPiece.clusterShape.map((_, i) => ({
          id: `${selectedPiece.id}_split_${i}`,
          type: selectedPiece.type || 'mixed',
          name: `${selectedPiece.name} Hex #${i + 1}`,
          color: selectedPiece.color,
          description: 'Split single hex tile from cluster.',
          bonusesDescription: selectedPiece.bonusesDescription,
        }));
        setSelectedPiece(singlePieces[0]);
        setAvailablePieces(prev => [...prev, ...singlePieces.slice(1)]);
        sounds.playPickup();
        showToast('Cluster Splitter activated: Giant cluster split into single-hex tiles!', 'success');
      } else {
        let hasSplit = false;
        setAvailablePieces(prev => {
          const next: HexPiece[] = [];
          prev.forEach(p => {
            if (p.clusterShape && p.clusterShape.length > 1) {
              hasSplit = true;
              p.clusterShape.forEach((_, i) => {
                next.push({
                  id: `${p.id}_split_${i}`,
                  type: p.type || 'mixed',
                  name: `${p.name} Hex #${i + 1}`,
                  color: p.color,
                  description: 'Split single hex tile from cluster.',
                  bonusesDescription: p.bonusesDescription,
                });
              });
            } else {
              next.push(p);
            }
          });
          return next;
        });
        sounds.playPickup();
        showToast(
          hasSplit
            ? 'Cluster Splitter activated: Tray clusters deconstructed into single tiles!'
            : 'Cluster Splitter activated: Ready for next cluster piece!',
          'success'
        );
      }
    } else if (boosterId === 'par_expander') {
      setActiveParBonus(prev => prev + 5);
      sounds.playVictory();
      showToast('Par Expander activated: +5 Free Tile Building Allowance added!', 'success');
    } else if (boosterId === 'mist_piercer') {
      setUnlockedCells(prev => {
        const next = new Map(prev);
        next.forEach((cell, key) => {
          if (cell.isFog) {
            next.set(key, { ...cell, isFog: false });
          }
        });
        return next;
      });
      sounds.playVictory();
      showToast('Mist Piercer activated: Purified all dark fog hexes into clear ground!', 'success');
    } else if (boosterId === 'titan_shield') {
      setIsTitanShieldActive(true);
      sounds.playVictory();
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#f59e0b', '#ec4899', '#6366f1'],
      });
      showToast('Titan Sovereign Shield activated: +500 Score Surge & Immunity from penalties!', 'success');
    }
  };

  const isHoldingCluster = Boolean(selectedPiece?.clusterShape && selectedPiece.clusterShape.length > 1);

  // =========================================================================
  // VIEW ROUTER: HOME, MEMORIES, JOURNEY
  // =========================================================================
  const unclaimedChestsCount = JOURNEY_CHESTS.filter(
    c => highestCompletedLevel >= c.levelThreshold && !claimedChestIds.includes(c.id)
  ).length;

  return (
    <>
      {activePage === 'home' && (
        <HomePage
          isGuest={isGuest}
          guestTrialIndex={guestTrialIndex}
          nextPlayableIndex={nextPlayableIndex}
          levels={allLevels}
          currentLevelIndex={levelIndex}
          isOpenShowcase={isOpenHomeShowcase}
          gameMode={gameMode}
          playMode={playMode}
          performanceMode={performanceMode}
          cloudSaveStatus={saveStatus}
          lastSyncedAt={lastSyncedAt}
          cloudSaveError={saveError}
          onForceCloudSync={forceSync}
          coins={coins}
          leaves={leaves}
          boosters={boosters}
          constructions={constructions}
          hasGoldenTicket={hasGoldenTicket}
          isAdminUnlocked={isAdminUnlocked}
          unclaimedChestsCount={unclaimedChestsCount}
          claimedChestIds={claimedChestIds}
          boosterInventory={boosters}
          onClaimChest={handleClaimChest}
          onBuyBooster={handleBuyBooster}
          onUpgradeConstruction={handleUpgradeConstruction}
          onChangeGameMode={mode => {
            setGameMode(mode);
            showToast(
              mode === 'casual'
                ? 'Switched to Casual Mode: Relaxed rules & easy progression.'
                : 'Switched to Try-Hard Mode: 1★ + Mastery required to win.',
              'info'
            );
          }}
          onChangePlayMode={mode => {
            setPlayMode(mode);
            try {
              localStorage.setItem('hexa_play_mode', mode);
            } catch { }
            showToast(
              mode === 'building'
                ? 'Switched to Building Mode: Lightbulb currency, 0 stars, 0 penalties!'
                : 'Switched to Challenger Mode: Stars, score target, par quota & penalties!',
              'info'
            );
          }}
          onCloseShowcase={() => setIsOpenHomeShowcase(false)}
          onSelectLevel={idx => triggerLevelTransit(idx)}
          onStartJourney={() => {
            // Guests who've finished all trials must sign in.
            if (isGuest && isGuestTrialComplete()) {
              sounds.playWarning();
              setAuthPrompt('Sign in to unlock all 40 levels and continue your journey.');
              setAuthMode('guest');
              setIsAuthModalOpen(true);
              return;
            }

            const playIndex = nextPlayableIndex >= 0 ? nextPlayableIndex : levelIndex;
            const playLevel = allLevels[playIndex] ?? currentLevel;

            triggerLevelTransit(playIndex);
            navigateWithTransition(
              'journey',
              `Embarking on Level ${playLevel.id}: ${playLevel.name}`,
              `Par Limit: ${playLevel.phases[0]?.targetTilesCount || 5} Tiles · 3★ Challenge`
            );
          }}
          onNavigateMemories={() => {
            navigateWithTransition('memories', 'Opening Gallery of Memories', 'Chronicles of unlocked relics & penalties');
          }}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenLevelEditor={() => setIsLevelEditorOpen(true)}
          onOpenAdminAuth={feat => setAdminAuthFeature(feat || 'Admin Access')}
          onOpenShop={() => setIsShopModalOpen(true)}
          onShowGoldenTicket={() => setIsGoldenTicketModalOpen(true)}
          onPlayIntro={() => setShowSpecialIntro(true)}
        />
      )}

      {activePage === 'memories' && (
        <MemoriesPage
          memories={memories}
          highestCompletedLevel={highestCompletedLevel}
          currentLevelIndex={levelIndex}
          bypasses={bypasses}
          isAdminUnlocked={isAdminUnlocked}
          onChapterOpen={(id) => {
            console.log('[App.onChapterOpen] Setting latestChapterExplore to:', id);
            setLatestChapterExplore(id);
          }}
          onSelectBypass={handleSelectBypass}
          onNavigateHome={() =>
            navigateWithTransition('home', 'Returning to Island Sanctuary', 'Archipelago Resort & Building Hub')
          }
          onNavigateJourney={() =>
            navigateWithTransition(
              'journey',
              'Resuming Frontier Expedition',
              `Level ${currentLevel.id}: ${currentLevel.name}`
            )
          }
          onRequestAdminAuth={(featureName) => setAdminAuthFeature(featureName || 'VN Studio')}
          onRequestHubReturn={() =>
            navigateWithTransition(
              'memories',
              'Sealing the Chapter',
              'Returning to the Memories Gallery',
              true
            )
          }
        />
      )}

      {activePage === 'journey' && (
        layout.useMobileLayout ? (
          <JourneyMobileOnly
            playMode={playMode}
            coins={coins}
            onBuyBooster={handleBuyBooster}
            lightbulbsUsed={lightbulbsUsed}
            lightbulbBudget={lightbulbBudget}
            placedCount={inBoundsPlacedCount}
            parCount={parCount}
            penalties={penalties}
            boosterInventory={boosters}
            highestCompletedLevel={highestCompletedLevel}
            onActivateBooster={handleActivateBooster}
              onOpenShop={() => setIsShopModalOpen(true)}
            availablePieces={currentLevel.availablePieces}
            selectedPiece={selectedPiece}
            activeDragPiece={activeDragPiece}
            unlockedCells={unlockedCells}
            placedTiles={placedTiles}
            dragPointerPos={dragPointerPos}
            hoveredCoord={hoveredCoord}
            pickedUpCoord={pickedUpCoord}
            disconnectedKeys={connectivity.disconnectedKeys}
            rotationZones={currentPhase?.rotationZones}
            onHoverCoordChange={setHoveredCoord}
            onTileDroppedOnBoard={handleTileDroppedOnBoard}
            onRightClickBoard={handleRightClickBoard}
            onRotateZone={handleRotateZone}
            isExpansionAnimating={isExpansionAnimating}
            performanceMode={performanceMode}
            targetFps={targetFps}
            isLowPowerMode={isLowPowerMode}
            textureQuality={textureQuality}
            onUpdateRendererInfo={setRendererInfo}
            isPaused={isJourneyPaused}
            onPauseToggle={handleJourneyPauseToggle}
            onRestart={handleJourneyRestart}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onExitToHome={handleJourneyExitToHome}
            onSelectPiece={(piece) => {
              selectTimestampRef.current = Date.now();
              setPickedUpCoord(null);
              setSelectedPiece(piece);
              if (piece) sounds.playPickup();
            }}
            onStartDragPiece={handleStartDrag}
            onEndDragPiece={() => {
              setActiveDragPiece(null);
              setDragPointerPos(null);
            }}
            onClearHover={() => setHoveredCoord(null)}
            canCompletePhase={canCompletePhase}
            isLastPhase={isLastPhase}
            phaseIndex={phaseIndex}
            totalPhases={currentLevel.phases.length}
            onCompletePhase={handleCompletePhase}
            selectedPieceIsCluster={Boolean(selectedPiece?.clusterShape && selectedPiece.clusterShape.length > 1)}
            hasSelectedPiece={Boolean(selectedPiece)}
            onRotateCluster={handleRotateCluster}
            onCancelSelected={handleReturnPickedUpTile}
            hasRotationZone={Boolean(currentPhase?.rotationZones && currentPhase.rotationZones.length > 0)}
            onRotateTurntable={() => {
              const zoneId = currentPhase?.rotationZones?.[0]?.id;
              if (zoneId) handleRotateZone(zoneId);
            }}
          />
        ) : (
          <div className="relative w-screen h-screen overflow-hidden bg-[#1e3520] font-sans flex flex-col justify-between select-none">
            {/* Ambient Dappled Light & Mist Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-30 animate-dapple bg-radial from-[#f0c674]/20 via-transparent to-transparent" />
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-25 animate-mist bg-gradient-to-r from-transparent via-[#7a9b8e]/30 to-transparent" />

            {/* 3D WebGL Canvas Layer */}
            <div className="absolute inset-0 z-0">
              <ThreeScene
                unlockedCells={unlockedCells}
                placedTiles={placedTiles}
                activeDragPiece={activeDragPiece || selectedPiece}
                dragPointerPos={dragPointerPos}
                hoveredCoord={hoveredCoord}
                pickedUpCoord={pickedUpCoord}
                disconnectedKeys={connectivity.disconnectedKeys}
                rotationZones={currentPhase?.rotationZones}
                onHoverCoordChange={setHoveredCoord}
                onTileDroppedOnBoard={handleTileDroppedOnBoard}
                onRightClickBoard={handleRightClickBoard}
                onRotateZone={handleRotateZone}
                isExpansionAnimating={isExpansionAnimating}
                performanceMode={performanceMode}
                targetFps={targetFps}
                isLowPowerMode={isLowPowerMode}
                textureQuality={textureQuality}
                onUpdateRendererInfo={setRendererInfo}
                hudInsetLeftPx={hudInsetLeftPx}
                hudInsetRightPx={hudInsetRightPx}
              />
            </div>

            {/* Tutorial Spotlight Overlay for Levels 1, 2, 6, 9, 12, 15, 18, 20 */}
            {[1, 2, 6, 9, 12, 15, 18, 20].includes(currentLevel.id) && (
              <TutorialSpotlight
                levelId={currentLevel.id}
                currentPhaseIndex={phaseIndex}
                totalPhases={currentLevel.phases.length}
                selectedPiece={selectedPiece}
                placedTiles={placedTiles}
                canCompletePhase={canCompletePhase}
                penalties={penalties}
                onCompleteTutorialStep={handleCompletePhase}
                onAutoDemoBuild={handleAutoDemoBuild}
              />
            )}

            {/* Main Cockpit HUD: Left Sidebar, Right Sidebar, Top Action Bar */}
            <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between p-2 sm:p-3">
              {/* Top Floating Row: Navigation, Level Switcher & System Controls */}
              {isCleanUiMode ? (
                <div className="w-full flex justify-between items-center pointer-events-none animate-in fade-in duration-200">
                  <div className="pointer-events-auto flex items-center gap-2 wood-panel px-3.5 py-1.5 text-xs text-[#f4ecd8]">
                    <span className="font-bold text-[#f0c674]">Lvl {currentLevel.id}:</span>
                    <span className="font-bold text-[#f4ecd8] font-rounded">{currentLevel.name}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsCleanUiMode(false);
                      sounds.playClick();
                    }}
                    className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 btn-river-stone text-[#f4ecd8] text-xs font-bold shadow-2xl transition-all cursor-pointer"
                    title="Show in-game HUD (or press H)"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#8fbc6f]" />
                    <span>Show UI [H]</span>
                  </button>
                </div>
              ) : (
                <div className="w-full flex justify-between items-start gap-2">
                  {/* Top Left: Home, Memories & Level Name ONLY */}
                  <div className="pointer-events-auto flex items-center gap-2 wood-panel px-3.5 py-1.5 text-[#f4ecd8] text-xs whitespace-nowrap shadow-xl">
                    <button
                      onClick={() => navigateWithTransition('home', 'Returning to Island Sanctuary', 'Archipelago Resort & Building Hub')}
                      className="flex items-center gap-1 text-[#a8b89a] hover:text-[#f4ecd8] pr-2.5 border-r border-[#5c3d2e] transition-colors cursor-pointer font-rounded"
                      title="Return to Home Menu"
                    >
                      <Home className="w-3.5 h-3.5 text-[#8fbc6f]" />
                      <span className="font-bold hidden sm:inline">Home</span>
                    </button>

                    {!isGuest && (
                      <button
                        onClick={() => navigateWithTransition('memories', 'Opening Gallery of Memories', 'Chronicles of unlocked relics & penalties')}
                        className="flex items-center gap-1 text-[#a8b89a] hover:text-[#f4ecd8] pr-2.5 border-r border-[#5c3d2e] transition-colors cursor-pointer font-rounded"
                        title="Open Memories Gallery"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#7a9b8e]" />
                        <span className="font-bold hidden sm:inline">Memories</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5 font-rounded">
                      <Compass className="w-3.5 h-3.5 text-[#f0c674] shrink-0" />
                      <span className="font-bold text-[#f0c674]">Lvl {currentLevel.id}:</span>
                      <span className="font-bold text-[#f4ecd8]">
                        {currentLevel.name}
                      </span>
                    </div>
                  </div>

                  {/* Tactical Boosters (All visible), Currency, Clean Mode & Settings */}
                  <div className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap">
                    {/* Currency Pill */}
                    <div className="hidden lg:flex items-center gap-2 wood-panel px-3 py-1.5 shadow-xl text-xs font-bold">
                      <span className="flex items-center gap-1 text-[#f0c674]" title="Coins: Earned from levels and stars">
                        <Coins className="w-3.5 h-3.5 text-[#f0c674]" />
                        <span className="font-mono">{coins}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[#8fbc6f]" title="Leaves: Earned from Journey chests">
                        <Leaf className="w-3.5 h-3.5 text-[#8fbc6f]" />
                        <span className="font-mono">{leaves}</span>
                      </span>
                    </div>

                    {/* All Boosters displayed on bar */}
                    {!isGuest && (
                      <BoosterBar
                        boosterInventory={boosters}
                        highestCompletedLevel={highestCompletedLevel}
                        onActivateBooster={handleActivateBooster}
                        onOpenShop={() => setIsShopModalOpen(true)}
                      />
                    )}

                    {/* Clean UI Mode Toggle Button */}
                    <button
                      onClick={() => {
                        setIsCleanUiMode(true);
                        sounds.playClick();
                        showToast('Clean Mode active: UI hidden. Click Show UI or press H to restore.', 'info');
                      }}
                      className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-slate-300 hover:text-white px-2.5 py-1.5 rounded-2xl border border-slate-700 shadow-xl text-xs font-bold transition-colors cursor-pointer"
                      title="Hide UI for clean view (Press H)"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Clean UI</span>
                    </button>

                    {/* 60 FPS Ultra-Performance Quick Toggle */}
                    <button
                      onClick={() => {
                        sounds.playClick();
                        handleRequestGraphicsReload(performanceMode === 'low' ? 'high' : 'low', targetFps);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border backdrop-blur-md shadow-xl text-xs font-bold transition-all cursor-pointer ${performanceMode === 'low'
                        ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 hover:bg-cyan-900'
                        : 'bg-slate-900/90 text-amber-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      title="Toggle Graphics & Performance (Ultra Performance vs High FX Quality)"
                    >
                      <Zap className={`w-3.5 h-3.5 ${performanceMode === 'low' ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="hidden sm:inline">{performanceMode === 'low' ? '⚡ Ultra-Perf' : '✨ High FX'}</span>
                    </button>

                    {/* Cloud Save indicator */}
                    <CloudSaveIndicator
                      status={saveStatus}
                      lastSyncedAt={lastSyncedAt}
                      error={saveError}
                      onRetry={forceSync}
                    />

                    {!isAuthLoading && (

                      user ? (
                        <div
                          className="flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md text-emerald-200 px-2.5 py-1.5 rounded-2xl border border-emerald-500/40 shadow-xl text-xs font-bold"
                          title={user.email ?? ''}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline truncate max-w-[120px]">
                            {user.email?.split('@')[0] ?? 'Signed in'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAuthPrompt('Sign in to unlock all 40 levels and sync your progress.');
                            setAuthMode('guest');
                            setIsAuthModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900/80 backdrop-blur-md text-cyan-200 hover:text-white px-2.5 py-1.5 rounded-2xl border border-cyan-500/50 shadow-xl text-xs font-bold transition-colors cursor-pointer"
                          title="Sign in to unlock all levels"
                        >
                          <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">Sign In</span>
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-white px-2.5 py-1.5 rounded-2xl border border-slate-700 shadow-xl text-xs font-bold transition-colors cursor-pointer"
                      title="Settings (Sound, Game Mode & Performance)"
                    >
                      <span className="text-amber-400 text-xs">⚙️</span>
                      <span className="hidden sm:inline">Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mid Row: Unified Building Sidebar (Building Mode) OR Split 2-Sidebars Layout (Challenger Mode) */}
              {!isCleanUiMode && (
                <div className="flex-1 flex justify-between items-start w-full pointer-events-none overflow-hidden my-auto animate-in fade-in duration-150">
                  {playMode === 'building' ? (
                    /* Single Merged Sidebar for Building Mode */
                    <div onPointerEnter={() => setHoveredCoord(null)}>
                      <UnifiedBuildingSidebar
                        currentLevel={currentLevel}
                        currentPhase={currentPhase}
                        currentPhaseIndex={phaseIndex}
                        totalPhases={currentLevel.phases.length}
                        placedTiles={placedTiles}
                        placedCount={inBoundsPlacedCount}
                        parCount={parCount}
                        matchedZonesCount={matchedZonesCount}
                        totalZonesCount={totalZonesCount}
                        lightbulbsUsed={lightbulbsUsed}
                        lightbulbBudget={lightbulbBudget}
                        bossBattleStats={currentLevel.isBossLevel ? bossBattleStats : undefined}
                        inspectedZoneIds={inspectedZoneKeys}
                        onInspectZone={handleInspectZone}
                        rotationZones={currentPhase?.rotationZones}
                        penalties={penalties}
                        soundEnabled={soundEnabled}
                        canCompletePhase={canCompletePhase}
                        isLastPhase={phaseIndex + 1 === currentLevel.phases.length}
                        onRotateZone={handleRotateZone}
                        onCompletePhase={handleCompletePhase}
                        onOpenBossBattle={() => setIsBossBattleOpen(true)}
                        onToggleSound={handleToggleSound}
                        onResetBoard={handleResetBoard}
                        onOpenRules={() => setIsRulesModalOpen(true)}
                      />
                    </div>
                  ) : (
                    /* Standard Split 2 Sidebars Layout for Challenger Mode */
                    <>
                      {/* Left Sidebar */}
                      {!currentLevel.uiConfig?.hideLeftSidebar ? (
                        <div onPointerEnter={() => setHoveredCoord(null)}>
                          <LeftSidebar
                            placedCount={inBoundsPlacedCount}
                            parCount={parCount}
                            matchedZonesCount={matchedZonesCount}
                            totalZonesCount={totalZonesCount}
                            penalties={penalties}
                            starsEarned={starsEarned}
                            levelId={currentLevel.id}
                            strictPenaltyLimit={strictPenaltyLimit}
                            hidePenalties={currentLevel.uiConfig?.hidePenalties}
                            highlightPenalties={highlightPenalties}
                            bypasses={bypasses}
                            gameMode={gameMode}
                            playMode={playMode}
                            lightbulbsUsed={lightbulbsUsed}
                            lightbulbBudget={lightbulbBudget}
                            bossBattleStats={currentLevel.isBossLevel ? bossBattleStats : undefined}
                            isBossLevel={currentLevel.isBossLevel}
                          />
                        </div>
                      ) : (
                        <div />
                      )}

                      {/* Right Sidebar */}
                      {!currentLevel.uiConfig?.hideRightSidebar ? (
                        <div onPointerEnter={() => setHoveredCoord(null)}>
                          <RightSidebar
                            currentLevel={currentLevel}
                            currentPhase={currentPhase}
                            currentPhaseIndex={phaseIndex}
                            totalPhases={currentLevel.phases.length}
                            placedTiles={placedTiles}
                            score={score}
                            starsEarned={starsEarned}
                            soundEnabled={soundEnabled}
                            canCompletePhase={canCompletePhase}
                            isLastPhase={phaseIndex + 1 === currentLevel.phases.length}
                            hasCompletedFirstTrial={hasCompletedFirstTrial}
                            masteryChallenge={currentLevel.masteryChallenge}
                            isMasteryCompleted={isMasteryCompleted}
                            gameMode={gameMode}
                            playMode={playMode}
                            bossBattleStats={currentLevel.isBossLevel ? bossBattleStats : undefined}
                            inspectedZoneIds={inspectedZoneKeys}
                            onInspectZone={handleInspectZone}
                            rotationZones={currentPhase?.rotationZones}
                            penalties={penalties}
                            overlapErrorCount={penalties.overlap}
                            hideScore={currentLevel.uiConfig?.hideScore}
                            highlightScore={highlightScore}
                            isFalsehoodActive={isFalsehoodActive}
                            isPenaltyLimitExceeded={isPenaltyLimitExceeded}
                            onRotateZone={handleRotateZone}
                            onCompletePhase={handleCompletePhase}
                            onOpenBossBattle={() => setIsBossBattleOpen(true)}
                            onToggleSound={handleToggleSound}
                            onResetBoard={handleResetBoard}
                            onOpenRules={() => setIsRulesModalOpen(true)}
                          />
                        </div>
                      ) : (
                        <div />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Relocating Hex Floating Pill */}
              {!isCleanUiMode && pickedUpCoord && (
                <div className="pointer-events-auto self-center mb-1 flex items-center gap-2 px-3 py-1 bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-700 shadow-xl text-xs text-white animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-slate-300 font-mono text-[11px]">Relocating hex ({pickedUpCoord.q}, {pickedUpCoord.r})</span>
                  <button
                    onClick={handleReturnPickedUpTile}
                    className="flex items-center gap-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                  >
                    <ArrowDownToLine className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}

              {/* Bottom Available Hex Tiles Tray with 3D Visual Demos & Color Filter */}
              {!isCleanUiMode && (
                <div
                  className="pointer-events-auto w-full animate-in fade-in duration-150"
                  onPointerEnter={() => setHoveredCoord(null)}
                >
                  <TileTray
                    availablePieces={currentLevel.availablePieces}
                    selectedPiece={selectedPiece}
                    activeDragPiece={activeDragPiece}
                    hasRotationZones={Boolean(currentPhase?.rotationZones && currentPhase.rotationZones.length > 0)}
                    playMode={playMode}
                    lightbulbsUsed={lightbulbsUsed}
                    lightbulbBudget={lightbulbBudget}
                    onSelectPiece={piece => {
                      selectTimestampRef.current = Date.now();
                      setPickedUpCoord(null);
                      setSelectedPiece(piece);
                      if (piece) sounds.playPickup();
                    }}
                    onRightClickPiece={handleRightClickTrayPiece}
                    onStartDragPiece={handleStartDrag}
                    onClearHover={() => setHoveredCoord(null)}
                    onEndDragPiece={() => {
                      setActiveDragPiece(null);
                      setDragPointerPos(null);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Floating Drag Avatar following cursor/touch on mobile */}
            {activeDragPiece && dragPointerPos && (
              <div
                className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-75"
                style={{
                  left: `${dragPointerPos.x}px`,
                  top: `${dragPointerPos.y - 42}px`,
                }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-2xl shadow-2xl border-2 border-emerald-500 scale-105 backdrop-blur-sm animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-800">
                    {activeDragPiece.name}
                    {activeDragPiece.clusterShape && activeDragPiece.clusterShape.length > 1
                      ? ` (${activeDragPiece.clusterShape.length}H)`
                      : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Floating Toast Notification */}
            {alertToast && (
              <div className="fixed top-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all animate-in fade-in slide-in-from-top-3">
                <div
                  className={`px-3.5 py-1.5 rounded-full shadow-xl text-xs font-bold flex items-center gap-2 border ${alertToast.type === 'warn'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : alertToast.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-900 text-white border-slate-700'
                    }`}
                >
                  {alertToast.type === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  <span>{alertToast.message}</span>
                </div>
              </div>
            )}

            {currentLevel.isBossLevel && hoveredZoneInfo && cursorScreenPos && (() => {
              const TOOLTIP_W = 230;
              const TOOLTIP_H = 140;
              const vw = window.innerWidth;
              const vh = window.innerHeight;

              // Position strictly on the right side of the cursor for optimal visibility
              let left = cursorScreenPos.x + 22;
              let top = cursorScreenPos.y - 25;

              // Flip horizontally if clipping the right edge
              if (left + TOOLTIP_W > vw - 16) {
                left = cursorScreenPos.x - TOOLTIP_W - 22;
              }
              // Clamp vertically so tooltip never clips offscreen
              top = Math.max(16, Math.min(vh - TOOLTIP_H - 16, top));

              // Per-color theme (dot, border glow, gradient bg, label text)
              const theme =
                hoveredZoneInfo.color === 'amber'
                  ? { bg: 'from-amber-950/95 to-amber-900/95', border: 'border-amber-500/70', dot: 'bg-amber-400', label: 'text-amber-200', ring: 'shadow-[0_0_18px_rgba(245,158,11,0.4)]' }
                  : hoveredZoneInfo.color === 'emerald'
                    ? { bg: 'from-emerald-950/95 to-emerald-900/95', border: 'border-emerald-500/70', dot: 'bg-emerald-400', label: 'text-emerald-200', ring: 'shadow-[0_0_18px_rgba(16,185,129,0.4)]' }
                    : hoveredZoneInfo.color === 'sapphire'
                      ? { bg: 'from-cyan-950/95 to-cyan-900/95', border: 'border-cyan-500/70', dot: 'bg-cyan-400', label: 'text-cyan-200', ring: 'shadow-[0_0_18px_rgba(6,182,212,0.4)]' }
                      : hoveredZoneInfo.color === 'ruby'
                        ? { bg: 'from-rose-950/95 to-rose-900/95', border: 'border-rose-500/70', dot: 'bg-rose-400', label: 'text-rose-200', ring: 'shadow-[0_0_18px_rgba(244,63,94,0.4)]' }
                        : { bg: 'from-slate-900/95 to-slate-800/95', border: 'border-slate-600/70', dot: 'bg-slate-400', label: 'text-slate-200', ring: '' };

              const isComplete = hoveredZoneInfo.occupied >= hoveredZoneInfo.total;
              const zoneKey = `${currentLevel.id}-${hoveredZoneInfo.name}`;
              const isInspected = inspectedZoneKeys.has(zoneKey);
              const isCollapsed = Boolean(bossBattleStats.isStatsCollapsed);

              return (
                <div
                  className="fixed z-[60] pointer-events-none animate-in fade-in duration-100"
                  style={{ left, top, width: TOOLTIP_W }}
                >
                  <div
                    className={`bg-gradient-to-br ${theme.bg} border-2 ${theme.border} ${theme.ring} rounded-2xl px-3 py-2.5 shadow-2xl backdrop-blur-md`}
                  >
                    {/* Header: color swatch + zone color name + inspected badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dot} shadow`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.label}`}>
                          {hoveredZoneInfo.color} Zone
                        </span>
                      </div>
                      {isComplete ? (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-emerald-950">
                          ✓ DONE
                        </span>
                      ) : isInspected ? (
                        <span className="text-[9px] font-bold text-amber-300">
                          ✓ Inspected
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-white/70 animate-pulse">
                          👁️ Inspecting...
                        </span>
                      )}
                    </div>

                    {/* Zone name */}
                    <div className="text-xs font-bold text-white mb-1.5 truncate">
                      {hoveredZoneInfo.name}
                    </div>

                    {/* Occupancy meter */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${isComplete ? 'bg-emerald-400' : theme.dot
                            }`}
                          style={{ width: `${Math.round((hoveredZoneInfo.occupied / Math.max(1, hoveredZoneInfo.total)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white font-mono font-bold tabular-nums">
                        {hoveredZoneInfo.occupied}/{hoveredZoneInfo.total}
                      </span>
                    </div>

                    {/* Stats Preview & Zero Collapse Warning */}
                    {isCollapsed ? (
                      <div className="pt-1.5 border-t border-rose-500/30 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-rose-300 font-black text-[10px]">
                          <span>⚠️</span>
                          <span>ALL STATS DROPPED TO 0</span>
                        </div>
                        <div className="text-[9px] text-rose-200/90 font-medium">
                          {bossBattleStats.collapseReason || 'Lightbulb budget exceeded or 2+ penalties active'}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-white/10 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-200">
                          {hoveredZoneInfo.color === 'amber' || hoveredZoneInfo.color === 'ruby' ? (
                            <>
                              <span>⭐</span>
                              <span>+35 Popularity (+{hoveredZoneInfo.color === 'ruby' ? '18' : '12'}/tile)</span>
                            </>
                          ) : hoveredZoneInfo.color === 'sapphire' ? (
                            <>
                              <span>✨</span>
                              <span>+35 Ambience (+15/tile)</span>
                            </>
                          ) : (
                            <>
                              <span>🎁</span>
                              <span>+1 Bonus Selection Slot</span>
                            </>
                          )}
                        </div>
                        <div className="text-[9px] text-white/60 font-medium">
                          {isComplete ? '✨ Zone fulfilled · Synthesia boosted' : 'Match all zone tiles for Synthesia multiplier'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {!isPickingTile && hoveredRoadRequirement && cursorScreenPos && (() => {
              const TOOLTIP_W = 220;
              const TOOLTIP_H = 110;
              const vw = window.innerWidth;
              const vh = window.innerHeight;

              let left = cursorScreenPos.x + 22;
              let top = cursorScreenPos.y - 25;
              if (left + TOOLTIP_W > vw - 16) left = cursorScreenPos.x - TOOLTIP_W - 22;
              top = Math.max(16, Math.min(vh - TOOLTIP_H - 16, top));

              const isDone = hoveredRoadRequirement.satisfied;

              return (
                <div
                  className="fixed z-[60] pointer-events-none animate-in fade-in duration-100"
                  style={{ left, top, width: TOOLTIP_W }}
                >
                  <div
                    className={`bg-gradient-to-br ${isDone
                      ? 'from-emerald-950/95 to-emerald-900/95 border-emerald-500/70 shadow-[0_0_18px_rgba(16,185,129,0.4)]'
                      : 'from-slate-950/95 to-slate-900/95 border-amber-500/70 shadow-[0_0_18px_rgba(245,158,11,0.4)]'
                      } border-2 rounded-2xl px-3 py-2.5 shadow-2xl backdrop-blur-md`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDone ? 'bg-emerald-400' : 'bg-amber-400'
                          } shadow`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-200' : 'text-amber-200'
                          }`}>
                          Transit Charter
                        </span>
                      </div>
                      {isDone ? (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-emerald-950">
                          ✓ MET
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-300 animate-pulse">
                          ⚠️ Unmet
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-white mb-1.5 truncate capitalize">
                      {hoveredRoadRequirement.roadKey.replace(/-/g, ' ')}
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${isDone ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          style={{
                            width: `${Math.round((hoveredRoadRequirement.adjacent / Math.max(1, hoveredRoadRequirement.required)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-white font-mono font-bold tabular-nums">
                        {hoveredRoadRequirement.adjacent}/{hoveredRoadRequirement.required}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-white/10 text-[10px] font-bold text-amber-200">
                      🏠 Requires {hoveredRoadRequirement.required} adjacent houses
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Level 3 Penalty Discovery Modal */}
            <PenaltyDiscoveryModal
              isOpen={isPenaltyDiscoveryModalOpen}
              onClose={() => setIsPenaltyDiscoveryModalOpen(false)}
            />
          </div>
        )
      )}

      {/* Global System Modals */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        isGuest={isGuest}
        syncStatus={saveStatus}
        lastSyncedAt={lastSyncedAt}
        syncError={saveError}
        onForceSync={forceSync}
        onWipeCloudSave={() => setIsWipeCloudConfirmOpen(true)}
        soundEnabled={soundEnabled}
        gameMode={gameMode}
        playMode={playMode}
        performanceMode={performanceMode}
        targetFps={targetFps}
        isLowPowerMode={isLowPowerMode}
        textureQuality={textureQuality}
        highestCompletedLevel={highestCompletedLevel}
        onChangeGameMode={setGameMode}
        onChangePlayMode={handleSwitchPlayMode}
        onTogglePerformanceMode={setPerformanceMode}
        onChangeTargetFps={setTargetFps}
        onToggleLowPowerMode={enabled => {
          setIsLowPowerMode(enabled);
          showToast(
            enabled
              ? '⚡ Low-Power Mode Active: 0.75x Resolution Scale & Particles Disabled'
              : 'Low-Power Mode Disabled: Full Native Resolution',
            'info'
          );
        }}
        onToggleTextureQuality={quality => {
          setTextureQuality(quality);
          try {
            localStorage.setItem('hexa_texture_quality', quality);
          } catch { }
        }}
        onRequestGraphicsReload={handleRequestGraphicsReload}
        onOpenDevDebugger={() => {
          if (!isAdminUnlocked) {
            setAdminAuthFeature('Developer Debugger');
          } else {
            setIsDevDebuggerOpen(true);
          }
        }}
        onOpenLevelEditor={() => {
          if (!isAdminUnlocked) {
            setAdminAuthFeature('Level Editor');
          } else {
            setIsLevelEditorOpen(true);
          }
        }}
        onOpenAdminAuth={feat => setAdminAuthFeature(feat || 'Admin Access')}
        onToggleSound={handleToggleSound}
        onResetTutorial={() => {
          setLevelIndex(0);
          setPhaseIndex(0);
          setHasDiscoveredPenalties(false);
        }}
        onPlayIntro={() => setShowSpecialIntro(true)}
        onRequestAuth={() => {
          setAuthPrompt('Sign in to unlock all 40 levels and sync your progress.');
          setAuthMode('guest');
          setIsAuthModalOpen(true);
        }}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Developer Device Debugger Overlay & Password Authenticator */}
      <DeviceDebugger
        isOpen={isDevDebuggerOpen}
        isGuest={isGuest}
        isUnlocked={isDevUnlocked}
        targetFps={targetFps}
        performanceMode={performanceMode}
        isLowPowerMode={isLowPowerMode}
        currentLevelId={currentLevel.id}
        currentLevelName={currentLevel.name}
        phaseIndex={phaseIndex}
        unlockedHexCount={unlockedCells.size}
        placedTilesCount={placedTiles.size}
        rendererInfo={rendererInfo}
        onAuthenticate={pass => {
          if (pass === '252324442') {
            setIsDevUnlocked(true);
            try {
              localStorage.setItem('hexa_dev_unlocked', 'true');
            } catch { }
            return true;
          }
          return false;
        }}
        onChangeTargetFps={setTargetFps}
        onTogglePerformanceMode={setPerformanceMode}
        onToggleLowPowerMode={enabled => {
          setIsLowPowerMode(enabled);
          showToast(
            enabled
              ? '⚡ Low-Power Mode Active: 0.75x Resolution Scale'
              : 'Low-Power Mode Disabled',
            'info'
          );
        }}
        onRequestGraphicsReload={handleRequestGraphicsReload}
        onUnlockAllLevels={() => {
          setHighestCompletedLevel(40);
          showToast('Developer Utility: All 40 Levels Unlocked!', 'success');
        }}
        onAddDevCurrency={() => {
          setCoins(c => c + 1000);
          setLeaves(l => l + 1000);
          showToast('Developer Utility: +1000 Coins & Leaves added!', 'success');
        }}
        onClose={() => setIsDevDebuggerOpen(false)}
      />

      {/* 1v1 Boss Showdown Battle Modal */}
      <BossBattleModal
        isOpen={isBossBattleOpen}
        bossName={currentLevel.bossName || 'Tycoon Sterling Vance'}
        bossPopularity={
          (currentLevel.bossPopularity || 180) +
          (currentLevel.levelType === 'traffic_attack'
            ? roadRequirementProgress.perRoad.filter(r => !r.satisfied).length * 25
            : 0)
        }
        bossAmbience={
          (currentLevel.bossAmbience || 170) +
          (currentLevel.levelType === 'traffic_attack'
            ? roadRequirementProgress.perRoad.filter(r => !r.satisfied).length * 20
            : 0)
        }
        playerStats={bossBattleStats}
        onVictory={() => {
          setIsBossBattleOpen(false);
          handleCompletePhase();
        }}
        onDefeat={() => {
          setIsBossBattleOpen(false);
          showToast('Market Showdown Defeat! Hover over colored zones on the board without picking up tiles to inspect Popularity, Ambience, and +1 Bonus Slots before re-engaging!', 'warn');
        }}
        onClose={() => setIsBossBattleOpen(false)}
      />

      {/* Graphics Setup Reload Confirmation Modal */}
      <GraphicsReloadModal
        isOpen={Boolean(pendingGraphicsReload)}
        currentPerfMode={performanceMode}
        newPerfMode={pendingGraphicsReload?.newMode || performanceMode}
        currentTargetFps={targetFps}
        newTargetFps={pendingGraphicsReload?.newFps || targetFps}
        currentTextureQuality={textureQuality}
        newTextureQuality={pendingGraphicsReload?.newTextureQuality || textureQuality}
        onConfirm={handleConfirmGraphicsReload}
        onCancel={() => setPendingGraphicsReload(null)}
      />

      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />

      <ShopModal
        isOpen={!layout.useMobileLayout && !isGuest && isShopModalOpen}
        coins={coins}
        leaves={leaves}
        highestCompletedLevel={highestCompletedLevel}
        boosterInventory={boosters}
        journeyChests={JOURNEY_CHESTS.map(c => ({
          ...c,
          isClaimed: claimedChestIds.includes(c.id),
        }))}
        onBuyBooster={handleBuyBooster}
        onClaimChest={handleClaimChest}
        onClose={() => setIsShopModalOpen(false)}
      />

      <GoldenTicketModal
        isOpen={!isGuest && isGoldenTicketModalOpen}
        hasGoldenTicket={hasGoldenTicket}
        maxedBuildingsCount={constructions.filter(c => c.currentLevel === 3).length}
        constructions={constructions}
        onClaimTicket={() => {
          setHasGoldenTicket(true);
          try {
            localStorage.setItem('hexa_golden_ticket', 'true');
          } catch { }
        }}
        onClose={() => setIsGoldenTicketModalOpen(false)}
      />

      {isWipeCloudConfirmOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Wipe Cloud Save?</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                This permanently deletes your entire cloud save. Your local device save
                remains, and will be re-synced to a fresh cloud slot if you sign in again
                on this device.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWipeCloudConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeCloudSave}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg cursor-pointer"
              >
                Wipe Cloud &amp; Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={Boolean(pendingConflict)}
        local={pendingConflict?.local ?? null}
        cloud={pendingConflict?.cloud ?? null}
        onChoose={(chosen) => {
          const resolve = pendingConflict?.resolve;
          setPendingConflict(null);
          resolve?.(chosen);
        }}
      />

      {/* Admin Code Authorization Modal */}
      <AdminAuthModal
        isOpen={Boolean(adminAuthFeature)}
        featureName={adminAuthFeature || 'Admin Feature'}
        onAuthenticate={code => {
          const valid = ['252324442', 'ADMIN', 'admin', 'ADMIN2026', '8888'].includes(code.trim());
          if (valid) {
            setIsAdminUnlocked(true);
            setIsDevUnlocked(true);
            try {
              localStorage.setItem('hexa_admin_unlocked', 'true');
              localStorage.setItem('hexa_dev_unlocked', 'true');
            } catch { }
            showToast('Admin Access Unlocked! All features & Level Editor active.', 'success');
            if (adminAuthFeature === 'Level Editor') {
              setIsLevelEditorOpen(true);
            }
            if (adminAuthFeature === 'Golden Ticket') {
              setIsGoldenTicketModalOpen(true);
            }
            setAdminAuthFeature(null);
            return true;
          }
          return false;
        }}
        onClose={() => setAdminAuthFeature(null)}
      />

      {/* Auth Modal — sign in, sign up, and idle re-auth */}
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        prompt={authPrompt}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPrompt(undefined);
          setAuthMode('guest');
        }}
      />

      {/* First-time guest welcome — shown once per browser */}
      <GuestWelcomeModal
        isOpen={isWelcomeOpen}
        onContinue={() => {
          markGuestWelcomeSeen();
          setIsWelcomeOpen(false);
        }}
        onSignIn={() => {
          markGuestWelcomeSeen();
          setIsWelcomeOpen(false);
          setAuthPrompt('Sign in to unlock all 40 levels and sync your progress.');
          setAuthMode('guest');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Idle Sign-Out Prompt — opens automatically when the idle timer fires */}
      {isIdleSignedOut && (
        <AuthModal
          isOpen
          mode="idle"
          onClose={() => {
            /* idle mode cannot be dismissed — must sign in */
          }}
        />
      )}

      {/* Fully Functional Map & Level Editor */}
      <LevelEditorModal
        isOpen={isLevelEditorOpen}
        existingLevels={allLevels}
        onSaveLevel={level => {
          setCustomLevels(prev => {
            const existingIdx = prev.findIndex(l => l.id === level.id);
            let updated: LevelConfig[];
            if (existingIdx >= 0) {
              updated = [...prev];
              updated[existingIdx] = level;
            } else {
              updated = [...prev, level];
            }
            try {
              localStorage.setItem('hexa_custom_levels', JSON.stringify(updated));
            } catch { }
            return updated;
          });
          showToast(`Custom Level "${level.name}" saved!`, 'success');
        }}
        onTestLevel={level => {
          const existingIdx = customLevels.findIndex(l => l.id === level.id);
          const updatedCustom = existingIdx >= 0
            ? customLevels.map((l, i) => i === existingIdx ? level : l)
            : [...customLevels, level];

          setCustomLevels(updatedCustom);
          try {
            localStorage.setItem('hexa_custom_levels', JSON.stringify(updatedCustom));
          } catch { }

          const combined = [...LEVELS, ...updatedCustom];
          const targetIdx = combined.findIndex(l => l.id === level.id);
          const safeIdx = targetIdx >= 0 ? targetIdx : combined.length - 1;

          triggerLevelTransit(safeIdx);
          setIsLevelEditorOpen(false);
          showToast(`Launching test session for "${level.name}"...`, 'info');
        }}
        onClose={() => setIsLevelEditorOpen(false)}
      />

      {/* 1. Special Intro Loading Screen with animated intro and pickup line "Rejoyce, a journey up for the youth" */}
      {showSpecialIntro && (
        <SpecialIntroLoader
          onComplete={() => setShowSpecialIntro(false)}
        />
      )}

      {/* 2. Screen Transitions Loading Screen */}
      {screenTransition && (
        <ScreenTransitionLoader
          destination={screenTransition.destination}
          destinationTitle={screenTransition.title}
          destinationSubtitle={screenTransition.subtitle}
          onTransitionMidpoint={() => setActivePage(screenTransition.destination)}
          onComplete={() => setScreenTransition(null)}
        />
      )}

      {/* 3. Level Transit & Progression Loading Screen */}
      {levelTransit && (
        <LevelTransitLoader
          levelId={levelTransit.levelId}
          levelName={levelTransit.levelName}
          parLimit={levelTransit.parLimit}
          phaseNumber={levelTransit.phaseNumber}
          onComplete={() => setLevelTransit(null)}
        />
      )}

      {/* 4. End-of-Level Celebration Animation */}
      {levelCelebration && (
        <EndOfLevelCelebration
          data={levelCelebration}
          onContinue={handleCelebrationContinue}
          onReplay={handleCelebrationReplay}
          onViewMemories={() => {
            setLevelCelebration(null);
            navigateWithTransition('memories', 'Opening Gallery of Memories', 'Chronicles of unlocked relics & penalties');
          }}
        />
      )}
    </>
  );
}
