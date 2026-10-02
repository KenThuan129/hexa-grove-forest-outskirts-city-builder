export type TileType = 'house' | 'trees' | 'mixed' | 'road' | 'bridge' | 'tower' | 'landmark';

export type TileColor = 'neutral' | 'amber' | 'emerald' | 'sapphire' | 'ruby';

export type PlayMode = 'building' | 'challenger';

export type BossZoneType = 'power' | 'defend' | 'traits' | 'mixed';

export type BossInspectionBenefitType = 'popularity' | 'ambience' | 'bonus_slot';

export interface BossSectionInspection {
  zoneIndex: number;
  zoneName: string;
  color: TileColor;
  benefitType: BossInspectionBenefitType;
  benefitValue: number;
  isInspected: boolean;
}

export interface BossBattleStats {
  popularity: number;
  ambience: number;
  bonusSlots: number;
  inspectedSectionsCount: number;
  totalSectionsCount: number;
  isStatsCollapsed?: boolean;
  collapseReason?: string;
  inspectedBenefits: {
    popularityGained: number;
    ambienceGained: number;
    bonusSlotsGained: number;
  };

  // Synthesia
  synthesiaMultiplier: number;
  zonesFulfilled: number;

  attack: number;
  defense: number;
  traits: {
    lifeStealPct: number;
    aegisShield: number;
    doubleStrikePct: number;
    thornCounterPct: number;
    criticalRatePct: number;
  };
}

export interface HexCoord {
  q: number;
  r: number;
}

export interface ClusterCellOffset {
  q: number;
  r: number;
  type?: TileType;
}

export type ClusterType = 'single' | 'duo' | 'triad' | 'quad' | 'pentad' | 'blossom';

export interface GridCell {
  q: number;
  r: number;
  colorRequirement: TileColor;
  isUnlocked: boolean;
  unlockPhase: number;
  placedTile?: PlacedTile;
  heightOffset?: number;
  isFog?: boolean;
  isRiver?: boolean;
  isCrystalPink?: boolean; // Highlighted by Expandacardia Ace
  bossZoneType?: BossZoneType;
}

export interface HexPiece {
  id: string;
  type: TileType;
  color: TileColor;
  name: string;
  description: string;
  bonusesDescription?: string;
  // Multi-hex Cluster geometry: max 6 hexes per cluster
  clusterShape?: ClusterCellOffset[];
  clusterType?: ClusterType;
  stock?: number; // Limited inventory stock count (e.g. Boss level)
  lightbulbCost?: number; // Cost in Lightbulbs (Building Mode)
  roadArms?: number;
}

export interface PlacedTile extends HexPiece {
  placementId: string;
  placedAt: number;
  q: number;
  r: number;
  clusterId?: string;
  clusterAnchor?: HexCoord;
  clusterPieceOriginal?: HexPiece;
}

export interface PenaltyRecord {
  overuse: number;     // Tiles placed over the par limit
  disconnect: number;  // Disconnected hex components count
  overlap: number;     // Tiles replaced/stacked over existing ones
  offMap: number;      // Placement attempts outside valid bounds
  falsehood: number;   // Placed on Fog Hex without connection to safe area
}

export interface RotationZone {
  id: string;
  name: string;
  center: HexCoord;
  radius: number; // e.g. 1 means center + 6 neighbors = 7 hexes
}

export interface MasteryChallenge {
  id: string;
  title: string;
  description: string;
  type:
    | 'zero_disconnect'
    | 'zero_overuse'
    | 'zero_overlap'
    | 'zero_offmap'
    | 'rotate_zone'
    | 'multi_cluster'
    | 'fill_all_zones'
    | 'min_score'
    | 'roads_pass_houses'
    | 'bridge_to_target'
    | 'no_shutdown_during_window';
  targetValue?: number;
}

export interface BossSkill {
  id: string;
  name: string;
  description: string;
  trigger: 'at_percent' | 'always_after_percent' | 'window';
  triggerPercent?: number;     // e.g. 25, 55, 75, 90, 95
  windowStart?: number;        // e.g. 75 (Triple Surge Shutdown window)
  windowEnd?: number;          // e.g. 85
  effect: string;              // Human-readable description of the effect
}

export interface BossConfig {
  id: string;
  name: string;
  maxHp: number;
  atk: number;
  def: number;
  personality:
    | 'high_pop_low_amb'    // Buffs own Ambience, defends
    | 'balanced'             // Debuffs player, uses Pierce
    | 'high_amb_low_pop'     // Skill-heavy, triple-trigger at thresholds
    | 'low_low_retribution'; // Random triple-triggers, Retribution finisher
  skills: BossSkill[];
  phases: PhaseConfig[];   // Each boss has its own board layout
}

export interface PhaseConfig {
  phaseNumber: number;
  title: string;
  objective: string;
  targetTilesCount: number;
  unlockedCoords: HexCoord[];
  coloredZones: {
    color: TileColor;
    coords: HexCoord[];
    name: string;
    bossZoneType?: BossZoneType | 'power' | 'defend' | 'traits' | 'mixed';
  }[];
  fogCoords?: HexCoord[];     // Fog Hexes previewing next phase boundaries
  riverCoords?: HexCoord[];   // Unbuildable natural river barrier cells
  rotationZones?: RotationZone[];
  initialPlacedTiles?: { pieceId: string; q: number; r: number }[];
  prePlacedRoads?: { pieceId: string; q: number; r: number; rotation?: number }[];
  roadRequirements?: {
    roadKey: string;   // e.g. "main-avenue"
    minHousesAdjacent: number;  // e.g. 3
    roadCoords: HexCoord[];
  }[];
  timeLimitSeconds?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  phases: PhaseConfig[];
  availablePieces: HexPiece[];
  targetScore: {
    star1: number;
    star2: number;
    star3: number;
  };
  lightbulbBudget?: number; // Available Lightbulbs for Building Mode
  masteryChallenge?: MasteryChallenge;
  isBossLevel?: boolean;
  bossName?: string;
  bossMaxHp?: number;
  bossPopularity?: number;
  bossAmbience?: number;
  bossAtk?: number;
  bossDef?: number;
  strictPenaltyLimit?: number; // Starting from level 20: max 3 penalties allowed
  uiConfig?: {
    hideLeftSidebar?: boolean;
    hideRightSidebar?: boolean;
    hidePenalties?: boolean;
    hideScore?: boolean;
  };
  bossSequence?: BossConfig[];   // For multi-boss levels (35, 60, 100)
  levelType?: 'standard' | 'traffic_attack' | 'multi_boss' | 'course';
  timeLimitSeconds?: number;     // For Course mode morph phases
}

export type BypassablePenaltyType = 'overlap' | 'overuse' | 'disconnect' | 'offMap';

export type PenaltyType = 'overlap' | 'overuse' | 'disconnect' | 'offMap' | 'falsehood';

export type GameMode = 'casual' | 'tryhard';

export type AcePerkId =
  | 'inventory_expand'
  | 'synthesis'
  | 'recombulation'
  | 'surge'
  | 'expandacardia'
  | 'merry_go_rondo';

export interface AcePerk {
  id: AcePerkId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
}

export interface PenaltyBypassRecord {
  overlap: number;    // 0 to 3 max (or more with Surge)
  overuse: number;    // 0 to 3 max
  disconnect: number; // 0 to 3 max
  offMap: number;     // 0 to 3 max
}

export interface MemoryPicture {
  id: number;
  chapterId: number;
  title: string;
  subtitle: string;
  lore: string;
  levelReq: number;
  sketchIcon: string;
  chosenBypass?: BypassablePenaltyType;
}

export interface NarrativeChapter {
  id: number;
  title: string;
  epoch: string;
  description: string;
  levelRange: [number, number];
  chapterRewardAceUnlocked?: boolean;
}

export interface GameState {
  currentLevelIndex: number;
  currentPhaseIndex: number;
  score: number;
  placedTiles: Map<string, PlacedTile[]>;
  unlockedCells: Map<string, GridCell>;
  penalties: PenaltyRecord;
  history: { q: number; r: number; prevTile?: PlacedTile; newTile?: PlacedTile }[];
  isPhaseCompleted: boolean;
  isLevelCompleted: boolean;
  isDragging: boolean;
  activeDragPiece: HexPiece | null;
  hoveredCoord: HexCoord | null;
  zoomLevel: number;
  soundEnabled: boolean;
}
