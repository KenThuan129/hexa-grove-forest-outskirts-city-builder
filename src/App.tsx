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
import { coordKey, analyzeConnectivity, rotateHexCoord, getCoordsInRadius, getHexNeighbors } from './utils/hexMath';
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
} from 'lucide-react';

export default function App() {
  // Page Navigation: 'home' | 'journey' | 'memories'
  const [activePage, setActivePage] = useState<'home' | 'journey' | 'memories'>('home');

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
    subtitle?: string
  ) => {
    if (activePage === dest) return;
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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allLevels = useMemo<LevelConfig[]>(() => {
    const customMap = new Map(customLevels.map(l => [l.id, l]));
    const baseLevels = LEVELS.map(l => customMap.get(l.id) || l);
    const brandNewCustom = customLevels.filter(l => !LEVELS.some(b => b.id === l.id));
    return [...baseLevels, ...brandNewCustom];
  }, [customLevels]);

  const triggerLevelTransit = useCallback((targetIndex: number, phaseNum?: number) => {
    const safeTargetIndex = Math.max(0, Math.min(allLevels.length - 1, targetIndex));
    const target = allLevels[safeTargetIndex] || allLevels[0];
    setLevelTransit({
      levelId: target.id,
      levelName: target.name,
      parLimit: target.phases[0]?.targetTilesCount || 5,
      phaseNumber: phaseNum !== undefined ? phaseNum + 1 : 1,
    });
    setLevelIndex(safeTargetIndex);
    setPhaseIndex(phaseNum !== undefined ? phaseNum : 0);
  }, [allLevels]);

  // Clean UI / Zen Mode for clutter-free viewport
  const [isCleanUiMode, setIsCleanUiMode] = useState(false);

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
    } catch {}
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
    } catch {}
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
    } catch {}

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

  // Persist gameMode and highestCompletedLevel
  useEffect(() => {
    try {
      localStorage.setItem('hexa_game_mode', gameMode);
    } catch {}
  }, [gameMode]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_highest_level', highestCompletedLevel.toString());
    } catch {}
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
    } catch {}
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
    } catch {}
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

  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isGoldenTicketModalOpen, setIsGoldenTicketModalOpen] = useState(false);
  const [activeParBonus, setActiveParBonus] = useState(0);
  const [isTitanShieldActive, setIsTitanShieldActive] = useState(false);

  // Persist economy state
  useEffect(() => {
    try {
      localStorage.setItem('hexa_coins', coins.toString());
    } catch {}
  }, [coins]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_leaves', leaves.toString());
    } catch {}
  }, [leaves]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_boosters', JSON.stringify(boosters));
    } catch {}
  }, [boosters]);

  useEffect(() => {
    try {
      const levelsMap: Record<string, number> = {};
      constructions.forEach(c => {
        levelsMap[c.id] = c.currentLevel;
      });
      localStorage.setItem('hexa_constructions', JSON.stringify(levelsMap));
    } catch {}
  }, [constructions]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_claimed_chests', JSON.stringify(claimedChestIds));
    } catch {}
  }, [claimedChestIds]);

  useEffect(() => {
    try {
      localStorage.setItem('hexa_golden_ticket', hasGoldenTicket ? 'true' : 'false');
    } catch {}
  }, [hasGoldenTicket]);

  // Reset transient booster buffs upon level/phase change
  useEffect(() => {
    setActiveParBonus(0);
    setIsTitanShieldActive(false);
  }, [levelIndex, phaseIndex]);

  const currentLevel = allLevels[levelIndex] || allLevels[0];
  const currentPhase = currentLevel.phases[phaseIndex] || currentLevel.phases[0];

  // Grid state: every cell key maps to an array/stack of placed tiles (to support overlapping error mechanics)
  const [unlockedCells, setUnlockedCells] = useState<Map<string, GridCell>>(new Map());
  const [placedTiles, setPlacedTiles] = useState<Map<string, PlacedTile[]>>(new Map());
  const [availablePieces, setAvailablePieces] = useState<HexPiece[]>([]);

  // Dragging & Interaction
  const [selectedPiece, setSelectedPiece] = useState<HexPiece | null>(null);
  const [pickedUpCoord, setPickedUpCoord] = useState<HexCoord | null>(null);
  const [activeDragPiece, setActiveDragPiece] = useState<HexPiece | null>(null);
  const [dragPointerPos, setDragPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCoord, setHoveredCoord] = useState<HexCoord | null>(null);

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

  // Reset or switch Level
  useEffect(() => {
    setPhaseIndex(0);
    const initialMap = new Map<string, PlacedTile[]>();
    const ph = currentLevel.phases[0];
    if (ph && ph.initialPlacedTiles) {
      ph.initialPlacedTiles.forEach((init, i) => {
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
      });
    }
    setPlacedTiles(initialMap);
    setRotationsPerformed(0);
    setSelectedPiece(null);
    setPickedUpCoord(null);
    setActiveDragPiece(null);
    setLevelCelebration(null);
    setAvailablePieces(currentLevel.availablePieces);
    initializeGridForLevel(levelIndex, 0);
  }, [levelIndex, initializeGridForLevel, currentLevel]);

  // Handle Phase change within level
  useEffect(() => {
    initializeGridForLevel(levelIndex, phaseIndex);
  }, [levelIndex, phaseIndex, initializeGridForLevel]);

  // Analyze connectivity of placed in-bounds and connected tiles
  const connectivity = useMemo(() => {
    const coords: HexCoord[] = [];
    placedTiles.forEach((stack, key) => {
      if (stack.length > 0 && unlockedCells.has(key) && !unlockedCells.get(key)?.isRiver) {
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
      if (cell && (cell.isUnlocked || cell.isFog) && !cell.isRiver) {
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
    return {
      overuse: Math.max(0, rawOveruseCount - bypasses.overuse),
      disconnect: Math.max(0, connectivity.disconnectedCount - bypasses.disconnect),
      overlap: Math.max(0, rawOverlapErrorCount - bypasses.overlap),
      offMap: Math.max(0, rawOffMapCount - bypasses.offMap),
      falsehood: dynamicFalsehoodCount,
    };
  }, [rawOveruseCount, connectivity.disconnectedCount, rawOverlapErrorCount, rawOffMapCount, dynamicFalsehoodCount, bypasses]);

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
    } catch {}

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

  // Boss Battle Stats Calculation derived from tiles placed over Power, Defend & Traits Zones
  const bossBattleStats = useMemo<BossBattleStats>(() => {
    let atk = 30; // Baseline Hero ATK
    let def = 20; // Baseline Hero DEF
    let lifeStealPct = 0;
    let aegisShield = 0;
    let doubleStrikePct = 0;
    let thornCounterPct = 0;
    let criticalRatePct = 0;

    placedTiles.forEach(stack => {
      stack.forEach(tile => {
        const key = coordKey(tile.q, tile.r);
        const cell = unlockedCells.get(key);
        if (cell) {
          if (cell.bossZoneType === 'power' || cell.colorRequirement === 'amber' || cell.colorRequirement === 'ruby') {
            atk += 15;
          }
          if (cell.bossZoneType === 'defend' || cell.colorRequirement === 'sapphire') {
            def += 12;
          }
          if (cell.bossZoneType === 'traits' || cell.colorRequirement === 'emerald') {
            lifeStealPct = Math.min(0.5, lifeStealPct + 0.1);
            aegisShield += 15;
            doubleStrikePct = Math.min(0.4, doubleStrikePct + 0.08);
            thornCounterPct = Math.min(0.5, thornCounterPct + 0.1);
            criticalRatePct = Math.min(0.5, criticalRatePct + 0.1);
          }
          if (cell.bossZoneType === 'mixed' || cell.colorRequirement === 'neutral') {
            atk += 6;
            def += 6;
            criticalRatePct = Math.min(0.5, criticalRatePct + 0.05);
          }
        }
      });
    });

    return {
      attack: atk,
      defense: def,
      traits: {
        lifeStealPct,
        aegisShield,
        doubleStrikePct,
        thornCounterPct,
        criticalRatePct,
      },
    };
  }, [placedTiles, unlockedCells]);

  // Can the player complete / advance this phase?
  const canCompletePhase =
    playMode === 'building'
      ? coloredZonesCompleted && rawOffMapCount === 0 && rawOverlapErrorCount === 0 && lightbulbsUsed <= lightbulbBudget
      : currentLevel.id === 1
      ? coloredZonesCompleted && inBoundsPlacedCount >= 2
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

      // 1. River Barrier Check: Waterways cannot be built on!
      const touchesRiver = offsets.some(off => {
        const key = coordKey(anchorCoord.q + off.q, anchorCoord.r + off.r);
        return unlockedCells.get(key)?.isRiver;
      });
      if (touchesRiver) {
        sounds.playWarning();
        showToast('🌊 River Barrier: Natural waterways are unbuildable!', 'warn');
        return;
      }

      // 2. Color Mismatch Check
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

      // 3. Fog Hex Check:
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

          if (!targetCell || (targetCell.isFog && !isFogLegit)) {
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
    [unlockedCells, bypasses]
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
      const nextLvl = LEVELS[levelIndex + 1] || null;
      const totalPen =
        penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood;

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
    if (currentPhase && currentPhase.initialPlacedTiles) {
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
      });
    }
    setPlacedTiles(initialMap);
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

  const handleUpgradeConstruction = (id: ConstructionId) => {
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
      setIsShopModalOpen(true);
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

      // First check if any overlap exists
      for (const [key, stack] of placedTiles.entries()) {
        if (stack.length > 1) {
          const top = stack[stack.length - 1];
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
        for (const [key, stack] of placedTiles.entries()) {
          if (stack.length > 0) {
            const top = stack[stack.length - 1];
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
          levels={allLevels}
          currentLevelIndex={levelIndex}
          isOpenShowcase={isOpenHomeShowcase}
          gameMode={gameMode}
          playMode={playMode}
          performanceMode={performanceMode}
          coins={coins}
          leaves={leaves}
          boosters={boosters}
          constructions={constructions}
          hasGoldenTicket={hasGoldenTicket}
          isAdminUnlocked={isAdminUnlocked}
          unclaimedChestsCount={unclaimedChestsCount}
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
            } catch {}
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
            navigateWithTransition(
              'journey',
              `Embarking on Level ${currentLevel.id}: ${currentLevel.name}`,
              `Par Limit: ${currentLevel.phases[0]?.targetTilesCount || 5} Tiles · 3★ Challenge`
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
          onSelectBypass={handleSelectBypass}
          onNavigateHome={() => navigateWithTransition('home', 'Returning to Island Sanctuary', 'Archipelago Resort & Building Hub')}
          onNavigateJourney={() => navigateWithTransition('journey', 'Resuming Frontier Expedition', `Level ${currentLevel.id}: ${currentLevel.name}`)}
        />
      )}

      {activePage === 'journey' && (
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

              <button
                onClick={() => navigateWithTransition('memories', 'Opening Gallery of Memories', 'Chronicles of unlocked relics & penalties')}
                className="flex items-center gap-1 text-[#a8b89a] hover:text-[#f4ecd8] pr-2.5 border-r border-[#5c3d2e] transition-colors cursor-pointer font-rounded"
                title="Open Memories Gallery"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#7a9b8e]" />
                <span className="font-bold hidden sm:inline">Memories</span>
              </button>

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
              <BoosterBar
                boosterInventory={boosters}
                highestCompletedLevel={highestCompletedLevel}
                onActivateBooster={handleActivateBooster}
                onOpenShop={() => setIsShopModalOpen(true)}
              />

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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border backdrop-blur-md shadow-xl text-xs font-bold transition-all cursor-pointer ${
                  performanceMode === 'low'
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 hover:bg-cyan-900'
                    : 'bg-slate-900/90 text-amber-300 border-slate-700 hover:bg-slate-800'
                }`}
                title="Toggle Graphics & Performance (Ultra Performance vs High FX Quality)"
              >
                <Zap className={`w-3.5 h-3.5 ${performanceMode === 'low' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{performanceMode === 'low' ? '⚡ Ultra-Perf' : '✨ High FX'}</span>
              </button>

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
                  rotationZones={currentPhase?.rotationZones}
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
                      rotationZones={currentPhase?.rotationZones}
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
            className={`px-3.5 py-1.5 rounded-full shadow-xl text-xs font-bold flex items-center gap-2 border ${
              alertToast.type === 'warn'
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

      {/* Level 3 Penalty Discovery Modal */}
      <PenaltyDiscoveryModal
        isOpen={isPenaltyDiscoveryModalOpen}
        onClose={() => setIsPenaltyDiscoveryModalOpen(false)}
      />
    </div>
    )}

    {/* Global System Modals */}
    <RulesModal
      isOpen={isRulesModalOpen}
      onClose={() => setIsRulesModalOpen(false)}
    />

    <SettingsModal
      isOpen={isSettingsModalOpen}
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
        } catch {}
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
      onClose={() => setIsSettingsModalOpen(false)}
    />

    {/* Developer Device Debugger Overlay & Password Authenticator */}
    <DeviceDebugger
      isOpen={isDevDebuggerOpen}
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
          } catch {}
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
      bossName={currentLevel.bossName || 'Goliath Stone Sovereign'}
      bossMaxHp={currentLevel.bossMaxHp || 350}
      bossAtk={currentLevel.bossAtk || 45}
      bossDef={currentLevel.bossDef || 25}
      playerStats={bossBattleStats}
      onVictory={() => {
        setIsBossBattleOpen(false);
        handleCompletePhase();
      }}
      onDefeat={() => {
        setIsBossBattleOpen(false);
        showToast('Defeated! Re-adjust tile placements on Power & Defend zones for higher stats.', 'warn');
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
      isOpen={isShopModalOpen}
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
      isOpen={isGoldenTicketModalOpen}
      hasGoldenTicket={hasGoldenTicket}
      maxedBuildingsCount={constructions.filter(c => c.currentLevel === 3).length}
      constructions={constructions}
      onClaimTicket={() => {
        setHasGoldenTicket(true);
        try {
          localStorage.setItem('hexa_golden_ticket', 'true');
        } catch {}
      }}
      onClose={() => setIsGoldenTicketModalOpen(false)}
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
          } catch {}
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
          } catch {}
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
        } catch {}

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
