import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { MemoriesPage } from './components/MemoriesPage';
import { ThreeScene } from './components/ThreeScene';
import { TileTray } from './components/TileTray';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { RulesModal } from './components/RulesModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { PenaltyDiscoveryModal } from './components/PenaltyDiscoveryModal';
import { SettingsModal } from './components/SettingsModal';
import { ComingSoonModal } from './components/ComingSoonModal';
import { TutorialSpotlight } from './components/TutorialSpotlight';
import { LEVELS } from './data/levels';
import { INITIAL_MEMORIES } from './data/memories';
import {
  GridCell,
  PlacedTile,
  HexPiece,
  PenaltyRecord,
  HexCoord,
  TileColor,
  MemoryPicture,
  PenaltyBypassRecord,
  PenaltyType,
  BypassablePenaltyType,
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
} from 'lucide-react';

export default function App() {
  // Page Navigation: 'home' | 'journey' | 'memories'
  const [activePage, setActivePage] = useState<'home' | 'journey' | 'memories'>('home');

  // Level & Phase State
  const [levelIndex, setLevelIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [hasCompletedFirstTrial, setHasCompletedFirstTrial] = useState(false);
  const [rotationsPerformed, setRotationsPerformed] = useState(0);

  // Memories & Penalty Bypass System
  const [memories, setMemories] = useState<MemoryPicture[]>(INITIAL_MEMORIES);
  const [highestCompletedLevel, setHighestCompletedLevel] = useState<number>(0);

  const currentLevel = LEVELS[levelIndex] || LEVELS[0];
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
  const [isLevelCompleteModalOpen, setIsLevelCompleteModalOpen] = useState(false);
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
    const lvl = LEVELS[lvlIdx];
    const newCells = new Map<string, GridCell>();

    for (let p = 0; p <= phIdx; p++) {
      const phase = lvl.phases[p];
      if (!phase) continue;

      // 1. Regular Unlocked Coords
      for (const coord of phase.unlockedCoords) {
        const key = coordKey(coord.q, coord.r);
        let colorReq: TileColor = 'neutral';
        for (const zone of phase.coloredZones) {
          if (zone.coords.some(c => c.q === coord.q && c.r === coord.r)) {
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
  }, []);

  // Reset or switch Level
  useEffect(() => {
    setPhaseIndex(0);
    setPlacedTiles(new Map());
    setRotationsPerformed(0);
    setSelectedPiece(null);
    setPickedUpCoord(null);
    setActiveDragPiece(null);
    setIsLevelCompleteModalOpen(false);
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

  // Overuse calculation
  const parCount = currentPhase?.targetTilesCount || 5;
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

  // Strict Penalty Limit Check (Level 20+ max 3 penalties allowed)
  const totalPenaltiesCount =
    penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood;
  const strictPenaltyLimit = currentLevel.strictPenaltyLimit ?? (currentLevel.id >= 20 ? 3 : undefined);
  const isPenaltyLimitExceeded = strictPenaltyLimit !== undefined && totalPenaltiesCount > strictPenaltyLimit;
  const isFalsehoodActive = penalties.falsehood > 0;

  // Trigger Penalty Discovery in Level 3
  useEffect(() => {
    if (currentLevel.id === 3 && !hasDiscoveredPenalties) {
      if (
        rawOverlapErrorCount > 0 ||
        rawOffMapCount > 0 ||
        rawOveruseCount > 0 ||
        connectivity.disconnectedCount > 0
      ) {
        setHasDiscoveredPenalties(true);
        setIsPenaltyDiscoveryModalOpen(true);
        setHighlightPenalties(true);
        setHighlightScore(true);
        sounds.playWarning();
        setTimeout(() => {
          setHighlightPenalties(false);
          setHighlightScore(false);
        }, 4000);
      }
    }
  }, [currentLevel.id, hasDiscoveredPenalties, rawOverlapErrorCount, rawOffMapCount, rawOveruseCount, connectivity.disconnectedCount]);

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

    const deductions =
      penalties.overuse * 150 +
      penalties.disconnect * 120 +
      penalties.overlap * 100 +
      penalties.offMap * 80;

    return Math.max(0, base - deductions);
  }, [inBoundsPlacedCount, currentPhase, placedTiles, parCount, penalties]);

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
    if (mc.type === 'rotate_zone') {
      return rotationsPerformed >= 1;
    }
    return true;
  }, [currentLevel, penalties, rotationsPerformed, currentPhase, rawScore]);

  // Can the player complete / advance this phase?
  const canCompletePhase =
    currentLevel.id === 1
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

  // Keyboard shortcuts: Press 'R' to rotate cluster, Press 'T' to rotate turntable
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotateCluster();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleRotateTurntableShortcut();
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
      setPhaseIndex(prev => prev + 1);
      showToast('Expansion Unlocked! Deep forest recedes with new zones.', 'success');
      setTimeout(() => {
        setIsExpansionAnimating(false);
      }, 1200);
    } else {
      // Final Phase: Level Victory Validation
      // 1-phase or multi-phase level requires at least 1 Star AND Mastery Challenge (if configured)
      const hasMastery = Boolean(currentLevel.masteryChallenge);
      if (starsEarned < 1 || (hasMastery && !isMasteryCompleted)) {
        sounds.playWarning();
        if (starsEarned < 1 && hasMastery && !isMasteryCompleted) {
          showToast('Victory requires at least 1 Star (★1) AND Mastery Challenge completed!', 'warn');
        } else if (starsEarned < 1) {
          showToast('Victory requires reaching at least 1 Star (★1)!', 'warn');
        } else {
          showToast('Victory requires completing the Mastery Challenge objective!', 'warn');
        }
        return;
      }

      // Level Completed! Record highest completed level
      const completedLvlId = currentLevel.id;
      setHighestCompletedLevel(prev => Math.max(prev, completedLvlId));
      sounds.playVictory();
      setIsLevelCompleteModalOpen(true);
    }
  };

  const handleNextLevel = () => {
    setIsLevelCompleteModalOpen(false);

    // After Level 5 complete, force to return Home and showcase all elements of Home
    if (currentLevel.id === 5) {
      setLevelIndex(5); // Level 6: The Great Stoneworks (introduces Cluster mechanics)
      setActivePage('home');
      setIsOpenHomeShowcase(true);
      sounds.playVictory();
      showToast('Level 5 Conquered! Welcome to the Frontier Hub.', 'success');
      return;
    }

    if (levelIndex + 1 < LEVELS.length) {
      setLevelIndex(prev => prev + 1);
    } else {
      setLevelIndex(0);
    }
  };

  const handleResetBoard = () => {
    setPlacedTiles(new Map());
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

  const isHoldingCluster = Boolean(selectedPiece?.clusterShape && selectedPiece.clusterShape.length > 1);

  // =========================================================================
  // VIEW ROUTER: HOME, MEMORIES, JOURNEY
  // =========================================================================
  if (activePage === 'home') {
    return (
      <>
        <HomePage
          levels={LEVELS}
          currentLevelIndex={levelIndex}
          isOpenShowcase={isOpenHomeShowcase}
          onCloseShowcase={() => setIsOpenHomeShowcase(false)}
          onSelectLevel={idx => setLevelIndex(idx)}
          onStartJourney={() => setActivePage('journey')}
          onNavigateMemories={() => setActivePage('memories')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenLevelEditor={() => setIsComingSoonModalOpen(true)}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onResetTutorial={() => {
            setLevelIndex(0);
            setPhaseIndex(0);
            setHasDiscoveredPenalties(false);
          }}
          onClose={() => setIsSettingsModalOpen(false)}
        />
        <ComingSoonModal
          isOpen={isComingSoonModalOpen}
          onClose={() => setIsComingSoonModalOpen(false)}
        />
        <RulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />
      </>
    );
  }

  if (activePage === 'memories') {
    return (
      <>
        <MemoriesPage
          memories={memories}
          highestCompletedLevel={highestCompletedLevel}
          currentLevelIndex={levelIndex}
          bypasses={bypasses}
          onSelectBypass={handleSelectBypass}
          onNavigateHome={() => setActivePage('home')}
          onNavigateJourney={() => setActivePage('journey')}
        />
        <RulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />
      </>
    );
  }

  // Active Journey 3D Viewport
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col justify-between select-none">
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
        />
      </div>

      {/* Strict Tutorial Spotlight Overlay for Levels 1 -> 3 (Blackens irrelevant areas, tooltips, hand gesture) */}
      <TutorialSpotlight
        levelId={currentLevel.id}
        selectedPiece={selectedPiece}
        placedTiles={placedTiles}
        canCompletePhase={canCompletePhase}
        onCompleteTutorialStep={handleCompletePhase}
      />

      {/* Main Cockpit HUD: Left Sidebar, Right Sidebar, Top Action Bar */}
      <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between p-2 sm:p-3">
        {/* Top Floating Row: Navigation, Level Switcher & Tutorial Guidance */}
        <div className="w-full flex justify-between items-start gap-2">
          {/* Top Left: Home Button, Memories & Level Info */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 shadow-xl text-white text-xs">
            <button
              onClick={() => setActivePage('home')}
              className="flex items-center gap-1 text-slate-300 hover:text-white pr-2 border-r border-slate-700 transition-colors cursor-pointer"
              title="Return to Home Menu"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => setActivePage('memories')}
              className="flex items-center gap-1 text-slate-300 hover:text-white pr-2 border-r border-slate-700 transition-colors cursor-pointer"
              title="Open Memories Gallery"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold hidden sm:inline">Memories</span>
            </button>

            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-amber-300">Lvl {currentLevel.id}:</span>
            <span className="font-bold text-slate-200 truncate max-w-[120px] sm:max-w-[180px]">
              {currentLevel.name}
            </span>

            {/* Quick Level Switch dropdown */}
            <select
              value={levelIndex}
              onChange={e => setLevelIndex(Number(e.target.value))}
              className="ml-1 bg-slate-800 text-slate-200 border border-slate-600 rounded-lg text-[10px] font-bold px-1.5 py-0.5 outline-none cursor-pointer"
            >
              {LEVELS.map((lvl, idx) => (
                <option key={lvl.id} value={idx}>
                  Lvl {lvl.id}: {lvl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Center Banner: Held Piece Action Banner */}
          <div className="flex-1 flex justify-center items-start">
            {selectedPiece && (
              <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-bold">
                  Held: <span className="text-cyan-300">{selectedPiece.name}</span>
                  {isHoldingCluster ? ` (${selectedPiece.clusterShape?.length}H Cluster)` : ''}
                  {pickedUpCoord ? ` at (${pickedUpCoord.q}, ${pickedUpCoord.r})` : ''} · Left-Click: Place · Right-Click: Return
                </span>

                <button
                  onClick={handleReturnPickedUpTile}
                  className="flex items-center gap-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ml-0.5"
                  title="Cancel placing and return to tray"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                  <span>Return to Tray</span>
                </button>
              </div>
            )}
          </div>

          {/* Rules Button */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-white px-2.5 py-1.5 rounded-2xl border border-slate-700 shadow-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Rules</span>
            </button>
          </div>
        </div>

        {/* Mid Row: Left Sidebar (Progress & Penalties) and Right Sidebar (Area, Action Button & Star Progress) */}
        <div className="flex-1 flex justify-between items-start w-full pointer-events-none overflow-hidden my-auto">
          {/* Left Sidebar (Gated in Level 1) */}
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
              />
            </div>
          ) : (
            <div />
          )}

          {/* Right Sidebar (Gated in Level 1) */}
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
                rotationZones={currentPhase?.rotationZones}
                overlapErrorCount={penalties.overlap}
                hideScore={currentLevel.uiConfig?.hideScore}
                highlightScore={highlightScore}
                isFalsehoodActive={isFalsehoodActive}
                isPenaltyLimitExceeded={isPenaltyLimitExceeded}
                onRotateZone={handleRotateZone}
                onCompletePhase={handleCompletePhase}
                onToggleSound={handleToggleSound}
                onResetBoard={handleResetBoard}
                onOpenRules={() => setIsRulesModalOpen(true)}
              />
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Bottom Available Hex Tiles Tray with 3D Visual Demos & Color Filter */}
        <div
          className="pointer-events-auto w-full"
          onPointerEnter={() => setHoveredCoord(null)}
        >
          <TileTray
            availablePieces={currentLevel.availablePieces}
            selectedPiece={selectedPiece}
            activeDragPiece={activeDragPiece}
            hasRotationZones={Boolean(currentPhase?.rotationZones && currentPhase.rotationZones.length > 0)}
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

      {/* Rules & Help Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetTutorial={() => {
          setLevelIndex(0);
          setPhaseIndex(0);
          setHasDiscoveredPenalties(false);
        }}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Level Editor Coming Soon Modal */}
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />

      {/* Level 3 Penalty Discovery Modal */}
      <PenaltyDiscoveryModal
        isOpen={isPenaltyDiscoveryModalOpen}
        onClose={() => setIsPenaltyDiscoveryModalOpen(false)}
      />

      {/* Level Complete / Victory Modal */}
      <LevelCompleteModal
        isOpen={isLevelCompleteModalOpen}
        levelName={currentLevel.name}
        score={score}
        starsEarned={starsEarned}
        penalties={penalties}
        hasNextLevel={levelIndex + 1 < LEVELS.length}
        masteryChallenge={currentLevel.masteryChallenge}
        isMasteryCompleted={isMasteryCompleted}
        onNextLevel={handleNextLevel}
        onReplayLevel={() => {
          setIsLevelCompleteModalOpen(false);
          handleResetBoard();
        }}
        onViewMemories={() => {
          setIsLevelCompleteModalOpen(false);
          setActivePage('memories');
        }}
      />
    </div>
  );
}
