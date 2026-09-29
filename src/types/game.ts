export type TileType = 'house' | 'trees' | 'mixed';

export type TileColor = 'neutral' | 'amber' | 'emerald' | 'sapphire' | 'ruby';

export type PlayMode = 'building' | 'challenger';

export type BossZoneType = 'power' | 'defend' | 'traits' | 'mixed';

export interface BossBattleStats {
  attack: number;
  defense: number;
  traits: {
    lifeStealPct: number;    // e.g. 0.25 = 25% heal on hit
    aegisShield: number;     // e.g. 50 starting shield
    doubleStrikePct: number; // e.g. 0.20 = 20% double attack
    thornCounterPct: number; // e.g. 0.30 = 30% reflect damage
    criticalRatePct: number; // e.g. 0.25 = 25% critical hit chance
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
  type: 'zero_disconnect' | 'zero_overuse' | 'zero_overlap' | 'zero_offmap' | 'rotate_zone' | 'multi_cluster' | 'fill_all_zones' | 'min_score';
  targetValue?: number;
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
    bossZoneType?: BossZoneType;
  }[];
  fogCoords?: HexCoord[];     // Fog Hexes previewing next phase boundaries
  riverCoords?: HexCoord[];   // Unbuildable natural river barrier cells
  rotationZones?: RotationZone[];
  initialPlacedTiles?: { pieceId: string; q: number; r: number }[];
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
  bossAtk?: number;
  bossDef?: number;
  strictPenaltyLimit?: number; // Starting from level 20: max 3 penalties allowed
  uiConfig?: {
    hideLeftSidebar?: boolean;
    hideRightSidebar?: boolean;
    hidePenalties?: boolean;
    hideScore?: boolean;
  };
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
