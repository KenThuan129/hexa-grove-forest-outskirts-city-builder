export type BoosterId =
  | 'chisel_brush'     // Lvl 5
  | 'cluster_splitter' // Lvl 8
  | 'par_expander'     // Lvl 15
  | 'mist_piercer'     // Lvl 23
  | 'titan_shield';    // Lvl 33

export interface BoosterItem {
  id: BoosterId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  costCoins: number;
  unlockLevel: number;
  accentColor: string;
}

export interface JourneyChest {
  id: number;
  levelThreshold: number;
  title: string;
  subtitle: string;
  leavesReward: number;
  coinsReward: number;
  isClaimed: boolean;
}

export type ConstructionId =
  | 'timber_lodge'
  | 'glade_pool'
  | 'campfire_hearth'
  | 'sand_land'
  | 'greenhouse'
  | 'waterwheel_spa'
  | 'starlit_terrace'
  | 'bakery_workshop'
  | 'windmill_keep'
  | 'shrine_pavilion';

export interface ConstructionItem {
  id: ConstructionId;
  name: string;
  category: 'core' | 'relaxation' | 'culinary' | 'nature' | 'landmark';
  tagline: string;
  description: string;
  icon: string;
  currentLevel: number; // 0 = unbuilt, 1 = built, 2 = enhanced, 3 = max
  maxLevel: 3;
  upgradeCosts: [number, number, number]; // Leaves cost for lvl 1, 2, 3
  color: string;
  worldPosition: { x: number; z: number; rotation: number };
  perkDescription: string;
}

export interface PlayerEconomyState {
  coins: number;
  leaves: number;
  boosters: Record<BoosterId, number>;
  constructions: Record<ConstructionId, number>; // level per building 0-3
  claimedChestIds: number[];
  hasGoldenTicket: boolean;
}
