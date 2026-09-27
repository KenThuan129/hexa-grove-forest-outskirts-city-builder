export type TileType = 'house' | 'trees' | 'mixed';

export type TileColor = 'neutral' | 'amber' | 'emerald' | 'sapphire' | 'ruby';

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
  type: 'zero_disconnect' | 'zero_overuse' | 'zero_overlap' | 'rotate_zone' | 'multi_cluster' | 'fill_all_zones' | 'min_score';
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
  }[];
  rotationZones?: RotationZone[];
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
  masteryChallenge?: MasteryChallenge;
  uiConfig?: {
    hideLeftSidebar?: boolean;
    hideRightSidebar?: boolean;
    hidePenalties?: boolean;
    hideScore?: boolean;
  };
}

export type PenaltyType = 'overlap' | 'overuse' | 'disconnect' | 'offMap';

export interface PenaltyBypassRecord {
  overlap: number;    // 0 to 3 max
  overuse: number;    // 0 to 3 max
  disconnect: number; // 0 to 3 max
  offMap: number;     // 0 to 3 max
}

export interface MemoryPicture {
  id: number;
  title: string;
  subtitle: string;
  lore: string;
  levelReq: number;
  sketchIcon: string;
  chosenBypass?: PenaltyType;
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
