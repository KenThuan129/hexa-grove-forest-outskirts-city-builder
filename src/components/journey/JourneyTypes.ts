// src/components/journey/journeyTypes.ts

import type {
  GridCell,
  HexPiece,
  HexCoord,
  PenaltyRecord,
  PlacedTile,
  RotationZone,
  PlayMode,
  BossBattleStats,
  PhaseConfig,
} from '../../types/game';
import type { BoosterId, BoosterItem } from '../../types/economy';
import type { RendererInfo } from '../ThreeScene';

export interface JourneySharedProps {
  // ── Play mode ─────────────────────────────────────────────
  playMode: PlayMode;

  // ── Level context ────────────────────────────────────────
  levelId: number;

  // ── Tutorial ─────────────────────────────────────────────
  mobileTutorialSeenGroups: string[];
  onMarkTutorialSeen: (group: string) => void;
  /** Tutorial advance tracking. */
  rotationsPerformed: number;
  hasPlacedRoad: boolean;
  hasPlacedBridge: boolean;

  // ── Boss Battle ─────────────────────────────────────────
  isBossLevel?: boolean;
  bossName?: string;
  bossPopularity?: number;
  bossAmbience?: number;
  bossBattleStats?: BossBattleStats;

  /** Mobile: long-press on a pre-placed road → show requirement progress. */
  roadRequirements?: {
    roadKey: string;
    adjacent: number;
    required: number;
    satisfied: boolean;
  }[];

  /** Mobile: long-press on a colored zone hex (boss levels) → show zone info. */
  coloredZones?: PhaseConfig['coloredZones'];

  coins: number;
  onBuyBooster: (booster: BoosterItem) => void;

  // ── Top bar counters ──────────────────────────────────────
  lightbulbsUsed: number;
  lightbulbBudget: number;
  placedCount: number;
  parCount: number;
  penalties: PenaltyRecord;

  // ── Boosters ──────────────────────────────────────────────
  boosterInventory: Record<BoosterId, number>;
  highestCompletedLevel: number;
  onActivateBooster: (id: BoosterId) => void;
  onOpenShop: () => void;

  // ── Board / pieces ────────────────────────────────────────
  availablePieces: HexPiece[];
  selectedPiece: HexPiece | null;
  activeDragPiece: HexPiece | null;

  // ── 3D scene wiring ───────────────────────────────────────
  unlockedCells: Map<string, GridCell>;
  placedTiles: Map<string, PlacedTile[]>;
  dragPointerPos: { x: number; y: number } | null;
  hoveredCoord: HexCoord | null;
  pickedUpCoord: HexCoord | null;
  disconnectedKeys: Set<string>;
  rotationZones?: RotationZone[];
  onHoverCoordChange: (coord: HexCoord | null) => void;
  onTileDroppedOnBoard: (coord: HexCoord) => void;
  onRightClickBoard: (coord: HexCoord | null) => void;
  onRotateZone?: (zoneId: string) => void;
  isExpansionAnimating: boolean;

  // ── Performance ───────────────────────────────────────────
  performanceMode: 'low' | 'high';
  targetFps: 60 | 30 | 24;
  isLowPowerMode: boolean;
  textureQuality: 'high' | 'low';
  threeSceneKey?: number;
  onUpdateRendererInfo?: (info: RendererInfo) => void;

    // ── Phase completion ──────────────────────────────────────
  canCompletePhase: boolean;
  isLastPhase: boolean;
  phaseIndex: number;
  totalPhases: number;
  onCompletePhase: () => void;

  // ── Rotate actions ────────────────────────────────────────
  selectedPieceIsCluster: boolean;
  hasSelectedPiece: boolean;
  onRotateCluster: () => void;
  onCancelSelected: () => void;
  hasRotationZone: boolean;
  onRotateTurntable: () => void;


  // ── Pause sheet ───────────────────────────────────────────
  isPaused: boolean;
  onPauseToggle: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onExitToHome: () => void;

  // ── Tray ──────────────────────────────────────────────────
  onSelectPiece: (piece: HexPiece | null) => void;
  onStartDragPiece: (piece: HexPiece, clientX: number, clientY: number) => void;
  onEndDragPiece: () => void;
  onClearHover?: () => void;
}