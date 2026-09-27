import { MemoryPicture, NarrativeChapter, AcePerk } from '../types/game';

// ============================================================================
// THE 6 LEGENDARY ACES (Unlocked upon completing full chapters)
// Players can carry exactly ONE ACE into upcoming levels.
// ============================================================================
export const ACE_PERKS: AcePerk[] = [
  {
    id: 'inventory_expand',
    name: 'Starting Inventory Expand',
    tagline: 'Diverse Multi-Hex Arsenal',
    description:
      'Unlocks maximum piece variety at level start: Duo, Triad, Quad, Pentad clusters, and all elemental colors are always ready in your tray.',
    icon: '🎒',
    accentColor: '#10b981',
  },
  {
    id: 'synthesis',
    name: 'Synthesis',
    tagline: 'Harmonic Score Multiplier',
    description:
      'Earn +1.25x additional score per colored zone filled (up to +5.25x multiplier bonus for fulfilling all color alignments).',
    icon: '✨',
    accentColor: '#f59e0b',
  },
  {
    id: 'recombulation',
    name: 'Recombulation',
    tagline: 'Optimized Piece Reroll',
    description:
      'Provides a Recombulate Inventory button at level start to roll pieces perfectly suited for 3★ rating or swift Mastery Challenge clears.',
    icon: '🎲',
    accentColor: '#8b5cf6',
  },
  {
    id: 'surge',
    name: 'Surge (Brute Force)',
    tagline: 'Massive Penalty Bypass Shield',
    description:
      'Drastically increases all Penalty Bypasses (+5 Disconnect, Overlap, Off-Map, Overuse tolerance) in exchange for tighter par quotas.',
    icon: '⚡',
    accentColor: '#ef4444',
  },
  {
    id: 'expandacardia',
    name: 'Expandacardia',
    tagline: 'Crystal-Pink Burst Expansion',
    description:
      'Highlights a cluster of hexes in glowing Crystal Pink. Filling all marked cells instantly triggers an expansion burst (+3 safe tiles)!',
    icon: '💖',
    accentColor: '#ec4899',
  },
  {
    id: 'merry_go_rondo',
    name: 'Merry-go-Rondo',
    tagline: 'Rotary Stabilization Engine',
    description:
      'Stabilizes and bypasses one turntable gear per level into its optimal orientation, while slightly lowering building par quota.',
    icon: '🎠',
    accentColor: '#06b6d4',
  },
];

// ============================================================================
// 4 EPOCH CHAPTERS (Narrative Timeline)
// ============================================================================
export const NARRATIVE_CHAPTERS: NarrativeChapter[] = [
  {
    id: 1,
    title: 'The Wilderness Awakening',
    epoch: 'Epoch I: Foundations',
    description:
      'The initial steps into the great pine valleys. Mastering the hearth, building quotas, and foundational multi-hex masonry.',
    levelRange: [1, 10],
  },
  {
    id: 2,
    title: 'Rotary Riverbend & Grand Citadel',
    epoch: 'Epoch II: Industrial Dawn',
    description:
      'The discovery of rotary turntable mechanisms, sapphire waterways, 4-hex quad geometry, and the legendary 6-hex blossom citadel.',
    levelRange: [11, 20],
  },
  {
    id: 3,
    title: 'The Mistveil Valley & Titan of the Mist',
    epoch: 'Epoch III: The Great Siege',
    description:
      'Braving mysterious fog hexes, unbuildable rushing rivers, and the 5-phase siege against the Ancient River Titan.',
    levelRange: [21, 30],
  },
  {
    id: 4,
    title: 'The Sovereign Empire & Eternal Frontier',
    epoch: 'Epoch IV: Eternal Reign',
    description:
      'The pinnacle of frontier civilization: multi-river archipelagoes, dual synchronized rotary matrixes, and the Sovereign Metropolis.',
    levelRange: [31, 40],
  },
];

// ============================================================================
// TIMELINE GALLERY MEMORY MILESTONES (Grants Penalty Bypasses)
// ============================================================================
export const INITIAL_MEMORIES: MemoryPicture[] = [
  // Chapter 1: The Wilderness Awakening
  {
    id: 1,
    chapterId: 1,
    title: 'The First Hearth',
    subtitle: 'Where the pioneering spirit first took root.',
    lore: 'A quiet timber cottage standing under the morning pines. The beginning of a long journey.',
    levelReq: 1,
    sketchIcon: '🏡',
  },
  {
    id: 2,
    chapterId: 1,
    title: 'Sunlit Meadow & Grove',
    subtitle: 'Golden harvest fields kissing the emerald tree line.',
    lore: 'Learning the beauty of harmony and color alignment across the gentle rolling clearings.',
    levelReq: 3,
    sketchIcon: '🌾',
  },
  {
    id: 3,
    chapterId: 1,
    title: 'Whispering Elder Stones',
    subtitle: 'Ancient monoliths that teach stillness amidst ambition.',
    lore: 'Every penalty is but a gentle lesson in spatial discipline and mindful settlement.',
    levelReq: 5,
    sketchIcon: '🗿',
  },
  {
    id: 4,
    chapterId: 1,
    title: 'The Great Stoneworks',
    subtitle: 'When giant clusters united into monolithic strength.',
    lore: 'Multi-hex foundations bound by stone plinths and shared craftsmanship.',
    levelReq: 8,
    sketchIcon: '🏛️',
  },
  {
    id: 5,
    chapterId: 1,
    title: 'Citadel of the Pioneers',
    subtitle: 'The grand conclusion of the first pioneering wave.',
    lore: 'A fortified bastion standing proud against the mountain winds. Chapter 1 mastered.',
    levelReq: 10,
    sketchIcon: '🏰',
  },

  // Chapter 2: Rotary Riverbend & Industrial Citadel
  {
    id: 6,
    chapterId: 2,
    title: 'The Rotary Riverbend',
    subtitle: 'When the earth shifted with the turn of the rotary gear.',
    lore: 'Watching entire hamlets rotate in 60-degree harmony across the rushing waterways.',
    levelReq: 12,
    sketchIcon: '⚙️',
  },
  {
    id: 7,
    chapterId: 2,
    title: 'Highland Citadel Keep',
    subtitle: 'Soaring spires overlooking the mist-shrouded valleys.',
    lore: 'Mastery achieved through patience, zero disconnects, and unwavering perseverance.',
    levelReq: 16,
    sketchIcon: '🌄',
  },
  {
    id: 8,
    chapterId: 2,
    title: 'The Blossom Metropolis',
    subtitle: 'A grand civilization flourishing under eternal dawn.',
    lore: 'A sprawling sanctuary of four harmonic colors, eternal hearths, and peaceful dreams.',
    levelReq: 20,
    sketchIcon: '🌸',
  },

  // Chapter 3: The Mistveil Valley & Titan
  {
    id: 9,
    chapterId: 3,
    title: 'Mistveil Forecast',
    subtitle: 'Piercing the veil of foggy horizons.',
    lore: 'Connecting brave forward posts to safe clearance, unlocking bonus expansion ground.',
    levelReq: 22,
    sketchIcon: '🌫️',
  },
  {
    id: 10,
    chapterId: 3,
    title: 'The Titan Awakens',
    subtitle: 'The 5-phase trial against the River Titan.',
    lore: 'A legendary siege testing piece conservation, rotary reflexes, and fearless resolve.',
    levelReq: 25,
    sketchIcon: '🛡️',
  },
  {
    id: 11,
    chapterId: 3,
    title: 'The Quad-Color Meridian',
    subtitle: 'All four elemental powers in continuous rotation.',
    lore: 'Sunstone, Grove, Aquifer, and Forge aligned in radiant harmony. Chapter 3 conquered.',
    levelReq: 30,
    sketchIcon: '💠',
  },

  // Chapter 4: The Sovereign Empire
  {
    id: 12,
    chapterId: 4,
    title: 'The Great Blossom Weir',
    subtitle: 'Bridging canyons with 6-hex hexagonal blossoms.',
    lore: 'A monolithic blossom weir spanning roaring river rapids with effortless grace.',
    levelReq: 33,
    sketchIcon: '🌉',
  },
  {
    id: 13,
    chapterId: 4,
    title: 'Dual Matrix Citadel',
    subtitle: 'Intersecting river crossroads controlled by twin gears.',
    lore: 'Two dynamic hubs turning in perfect sync to weave vibrant color districts.',
    levelReq: 38,
    sketchIcon: '🎛️',
  },
  {
    id: 14,
    chapterId: 4,
    title: 'The Sovereign Eternal Empire',
    subtitle: 'The ultimate summit of frontier civilization.',
    lore: 'A permanent masterpiece carved into history. The frontier lives forever.',
    levelReq: 40,
    sketchIcon: '👑',
  },
];
