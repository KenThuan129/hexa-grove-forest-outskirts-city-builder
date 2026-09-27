import { LevelConfig, HexPiece } from '../types/game';

// Comprehensive Palette of Single Hexes and Multi-Hex Clusters (max 6 hexes per cluster)
export const PIECE_PALETTE: HexPiece[] = [
  // ==================== NEUTRAL / SAFE GRAY ====================
  {
    id: 'p-house-gray',
    type: 'house',
    color: 'neutral',
    name: 'Timber Cottage',
    description: 'Single pioneer dwelling with stone base & slate roof.',
    bonusesDescription: 'Single cell. Safe on any gray clearing.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'house' }],
  },
  {
    id: 'p-duo-gray',
    type: 'mixed',
    color: 'neutral',
    name: 'Pioneer Tandem',
    description: 'Cozy pair of timber cottage and shelter pines.',
    bonusesDescription: '2-Hex Duo cluster. Fills 2 clearance tiles.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'trees' },
    ],
  },
  {
    id: 'p-triad-gray',
    type: 'mixed',
    color: 'neutral',
    name: 'Homestead Triad',
    description: 'Compact triangular hamlet with home, garden, and orchard pines.',
    bonusesDescription: '3-Hex Triad cluster. Efficient multi-cell building.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'trees' },
      { q: 0, r: 1, type: 'mixed' },
    ],
  },
  {
    id: 'p-quad-gray',
    type: 'mixed',
    color: 'neutral',
    name: 'Forest Quad',
    description: 'Diamond settlement quartet with homes, pine clusters, and garden paths.',
    bonusesDescription: '4-Hex Quad cluster. High spatial expansion.',
    clusterType: 'quad',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'trees' },
      { q: 0, r: 1, type: 'mixed' },
      { q: 1, r: -1, type: 'trees' },
    ],
  },

  // ==================== AMBER / GOLD ====================
  {
    id: 'p-house-amber',
    type: 'house',
    color: 'amber',
    name: 'Sunlit Townhall',
    description: 'Golden shingle residence with radiant lantern tower.',
    bonusesDescription: 'Single cell. Matches Amber sunlit zones.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'house' }],
  },
  {
    id: 'p-duo-amber',
    type: 'mixed',
    color: 'amber',
    name: 'Solar Duo',
    description: 'Sunlit house connected to a golden wheat croft.',
    bonusesDescription: '2-Hex Duo cluster. Matches Amber zones.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'mixed' },
    ],
  },
  {
    id: 'p-triad-amber',
    type: 'mixed',
    color: 'amber',
    name: 'Amber Triad',
    description: 'Triangular sun-district with townhall and twin amber crofts.',
    bonusesDescription: '3-Hex Triad cluster. Fills 3 amber zones.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'mixed' },
      { q: 0, r: 1, type: 'trees' },
    ],
  },
  {
    id: 'p-quad-amber',
    type: 'mixed',
    color: 'amber',
    name: 'Sunstone Quad',
    description: 'Four-piece sunstone estate and harvest silos.',
    bonusesDescription: '4-Hex Quad cluster. Powerful amber scoring.',
    clusterType: 'quad',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'mixed' },
      { q: 0, r: 1, type: 'trees' },
      { q: 1, r: 1, type: 'mixed' },
    ],
  },

  // ==================== EMERALD / GREEN ====================
  {
    id: 'p-trees-emerald',
    type: 'trees',
    color: 'emerald',
    name: 'Verdant Shelter',
    description: 'Dense sanctuary of mystical emerald pines and botanical gardens.',
    bonusesDescription: 'Single cell. Matches Emerald grove zones.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'trees' }],
  },
  {
    id: 'p-duo-emerald',
    type: 'mixed',
    color: 'emerald',
    name: 'Arbor Duo',
    description: 'Tandem grove shelter with towering emerald conifers.',
    bonusesDescription: '2-Hex Duo cluster. Matches Emerald zones.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'trees' },
      { q: 0, r: 1, type: 'mixed' },
    ],
  },
  {
    id: 'p-triad-emerald',
    type: 'mixed',
    color: 'emerald',
    name: 'Grove Triad',
    description: 'Three-cell enchanted forest grove with warden post.',
    bonusesDescription: '3-Hex Triad cluster. Fast green zone coverage.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'trees' },
      { q: 1, r: 0, type: 'trees' },
      { q: 1, r: -1, type: 'mixed' },
    ],
  },
  {
    id: 'p-pentad-emerald',
    type: 'mixed',
    color: 'emerald',
    name: 'Canopy Pentad',
    description: 'Five-hex sprawling ancient canopy reserve.',
    bonusesDescription: '5-Hex Pentad cluster. Massive grove anchor.',
    clusterType: 'pentad',
    clusterShape: [
      { q: 0, r: 0, type: 'trees' },
      { q: 1, r: 0, type: 'trees' },
      { q: 0, r: 1, type: 'mixed' },
      { q: -1, r: 1, type: 'trees' },
      { q: 1, r: -1, type: 'house' },
    ],
  },

  // ==================== SAPPHIRE / BLUE ====================
  {
    id: 'p-house-sapphire',
    type: 'house',
    color: 'sapphire',
    name: 'Aquifer Lodge',
    description: 'Sturdy blue shingle lodge overlooking pristine natural springs.',
    bonusesDescription: 'Single cell. Matches Sapphire aquifer zones.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'house' }],
  },
  {
    id: 'p-duo-sapphire',
    type: 'mixed',
    color: 'sapphire',
    name: 'Aqueduct Duo',
    description: 'Twin watermill and sluice gate reservoir.',
    bonusesDescription: '2-Hex Duo cluster. Matches Sapphire zones.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: -1, type: 'mixed' },
    ],
  },
  {
    id: 'p-quad-sapphire',
    type: 'mixed',
    color: 'sapphire',
    name: 'Basin Quad',
    description: 'Four-cell hydro reservoir with purification fountain & lodge.',
    bonusesDescription: '4-Hex Quad cluster. Wide sapphire reach.',
    clusterType: 'quad',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'mixed' },
      { q: 0, r: 1, type: 'house' },
      { q: -1, r: 1, type: 'mixed' },
    ],
  },

  // ==================== RUBY / RED ====================
  {
    id: 'p-house-ruby',
    type: 'house',
    color: 'ruby',
    name: 'Terracotta Hearth',
    description: 'Crimson shingle forge cottage with blazing chimney kiln.',
    bonusesDescription: 'Single cell. Matches Ruby terracotta hearths.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'house' }],
  },
  {
    id: 'p-duo-ruby',
    type: 'mixed',
    color: 'ruby',
    name: 'Forge Duo',
    description: 'Twin blacksmith workshop and brick kiln foundry.',
    bonusesDescription: '2-Hex Duo cluster. Matches Ruby zones.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 0, r: 1, type: 'mixed' },
    ],
  },

  // ==================== 6-HEX BLOSSOM MEGA CLUSTER ====================
  {
    id: 'p-blossom-multi',
    type: 'mixed',
    color: 'amber',
    name: 'Highland Blossom',
    description: 'Magnificent 6-hex hexagonal ring settlement with central plaza.',
    bonusesDescription: '6-Hex Blossom mega-cluster! Ultimate spatial power.',
    clusterType: 'blossom',
    clusterShape: [
      { q: 0, r: 0, type: 'house' },
      { q: 1, r: 0, type: 'mixed' },
      { q: 1, r: -1, type: 'trees' },
      { q: 0, r: -1, type: 'house' },
      { q: -1, r: 0, type: 'mixed' },
      { q: -1, r: 1, type: 'trees' },
    ],
  },
];

// Helper to pick pieces by ID
export const getPieces = (ids: string[]): HexPiece[] => {
  return ids
    .map(id => PIECE_PALETTE.find(p => p.id === id))
    .filter((p): p is HexPiece => Boolean(p));
};

// ============================================================================
// 20 CAREFULLY CRAFTED LEVELS WITH PROGRESSIVE TUTORIALS & MECHANICS
// ============================================================================
export const LEVELS: LevelConfig[] = [
  // --------------------------------------------------------------------------
  // LEVEL 1: Strict Hardcoded Tutorial (No UI except Available Pieces Tray)
  // --------------------------------------------------------------------------
  {
    id: 1,
    name: "The Pioneer's Hearth",
    subtitle: 'Tutorial: Basic Placement & Color Alignment',
    description:
      'Welcome Pioneer! Place your first dwelling on the forest clearing, then match the golden Sunlit zone.',
    uiConfig: {
      hideLeftSidebar: true,
      hideRightSidebar: true,
      hidePenalties: true,
      hideScore: true,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Initial Clearing',
        objective: 'Place 1 Timber Cottage on (0,0) and 1 Sunlit Townhall on (1,0).',
        targetTilesCount: 3,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Sunlit Zone',
            color: 'amber',
            coords: [{ q: 1, r: 0 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-amber']),
    targetScore: { star1: 400, star2: 650, star3: 900 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 2: Introduces Progression (Left Sidebar: Quota, Right Sidebar: Target Zones)
  // --------------------------------------------------------------------------
  {
    id: 2,
    name: 'Frontier Horizons',
    subtitle: 'Tutorial: Building Quota & Target Color Zones',
    description:
      'Keep an eye on your Building Quota (Left) and fill the Target Color Zones (Right) to claim victory!',
    uiConfig: {
      hideLeftSidebar: false,
      hideRightSidebar: false,
      hidePenalties: true,
      hideScore: true,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Twin Clearings',
        objective: 'Fill the Amber Sunlit and Emerald Verdant zones within par quota.',
        targetTilesCount: 5,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 2 },
          { q: 1, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Sunlit Meadow',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Verdant Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-amber', 'p-trees-emerald']),
    targetScore: { star1: 800, star2: 1200, star3: 1600 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 3: Introduces Penalties & Settlement Scoring (Penalty Discovery Demo)
  // --------------------------------------------------------------------------
  {
    id: 3,
    name: 'The Elder Stones',
    subtitle: 'Tutorial: Penalties & Settlement Scoring',
    description:
      'Discover how Overlap, Overuse, Disconnect, and Off-Map penalties affect your Settlement Score.',
    uiConfig: {
      hideLeftSidebar: false,
      hideRightSidebar: false,
      hidePenalties: false,
      hideScore: false,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Tri-Color Valley',
        objective: 'Align Amber, Emerald, and Sapphire zones cleanly without penalties.',
        targetTilesCount: 6,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: -1 },
          { q: 0, r: -2 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Sunlit Ridge',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Verdant Hollow',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
          {
            name: 'Aquifer Spring',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-amber', 'p-trees-emerald', 'p-house-sapphire']),
    targetScore: { star1: 1200, star2: 1800, star3: 2400 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 4: Introduces "Phases" (Multi-Phase Expansion)
  // --------------------------------------------------------------------------
  {
    id: 4,
    name: 'Whispering Glade',
    subtitle: 'Mechanic: Phase Expansion',
    description:
      'Fill Phase 1 target color zones to push back the deep forest and expand into Phase 2!',
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Inner Outpost',
        objective: 'Settle the inner clearing to unlock Phase 2 expansion.',
        targetTilesCount: 4,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Amber Hearth',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 1, r: -1 }],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Forest Expansion',
        objective: 'Expand through the newly cleared emerald glades.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: 2, r: -1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
          { q: -2, r: 0 },
          { q: -1, r: -1 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Amber Hearth',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 1, r: -1 }],
          },
          {
            name: 'Emerald Glade',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-amber', 'p-trees-emerald']),
    targetScore: { star1: 1600, star2: 2400, star3: 3100 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 5: Mastering Phases (3 Colors, 2 Expansion Waves)
  // --------------------------------------------------------------------------
  {
    id: 5,
    name: 'Emerald Highlands',
    subtitle: 'Mechanic: Tri-Color Phase Expansion',
    description:
      'Coordinate expansion across Amber, Emerald, and Sapphire zones across two distinct phases.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Highland Post',
        objective: 'Secure the central spring and meadow.',
        targetTilesCount: 5,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Central Meadow',
            color: 'amber',
            coords: [{ q: 1, r: 0 }],
          },
          {
            name: 'Highland Spring',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Full Frontier',
        objective: 'Expand into the northern pine terraces and connect all zones.',
        targetTilesCount: 10,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
          { q: 2, r: 0 },
          { q: 2, r: -1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
          { q: -2, r: 0 },
          { q: -1, r: -1 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Central Meadow',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Highland Spring',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
          {
            name: 'Northern Terraces',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-amber', 'p-trees-emerald', 'p-house-sapphire']),
    targetScore: { star1: 2200, star2: 3200, star3: 4200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 6: Introduces "Cluster" Mechanics (2H & 3H Giant Multi-Hex Tiles)
  // --------------------------------------------------------------------------
  {
    id: 6,
    name: 'The Great Stoneworks',
    subtitle: 'Mechanic: Multi-Hex Clusters & Rotation',
    description:
      'Introduces Giant Clusters! Multi-hex pieces (2H Duo and 3H Triad) that rotate with the "R" key and place as monolithic units.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Cluster Masonry',
        objective: 'Use Duo and Triad clusters to rapidly cover large zones and avoid individual placements.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 2 },
          { q: 2, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Sunstone Plaza',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: 1 }],
          },
          {
            name: 'Emerald Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-duo-amber', 'p-triad-amber', 'p-duo-emerald']),
    targetScore: { star1: 1800, star2: 2600, star3: 3500 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 7: Sunfire Basin (4H Quad Clusters & Spatial Geometry)
  // --------------------------------------------------------------------------
  {
    id: 7,
    name: 'Sunfire Basin',
    subtitle: 'Mechanic: 4-Hex Quad Clusters',
    description:
      'Master the Forest Quad and Sunstone Quad 4-hex geometries in an 8x8 diamond clearing.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Diamond Basin',
        objective: 'Align 4-hex clusters efficiently to stay within the par quota.',
        targetTilesCount: 10,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: -2, r: 1 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: -1, r: 2 },
          { q: 1, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Sunfire Quad',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: 1 }, { q: 0, r: 1 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-quad-gray', 'p-quad-amber']),
    targetScore: { star1: 2000, star2: 2900, star3: 3800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 8: Azure Aqueducts (Sapphire & Amber Waterway Network)
  // --------------------------------------------------------------------------
  {
    id: 8,
    name: 'Azure Aqueducts',
    subtitle: 'Mechanic: Dual-Color Cluster Weaving',
    description:
      'Weave together Sapphire Aqueduct Duos and Amber Solar Duos across interlocking waterways.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Waterway Clearing',
        objective: 'Settle both the sapphire aquifer stream and sunlit canal banks.',
        targetTilesCount: 10,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: -1 },
          { q: -2, r: 1 },
          { q: 2, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Aquifer Stream',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }, { q: -1, r: 1 }],
          },
          {
            name: 'Sunlit Canal',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: 1 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-sapphire', 'p-quad-sapphire', 'p-duo-amber', 'p-triad-amber']),
    targetScore: { star1: 2200, star2: 3200, star3: 4200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 9: Autumn Canopy (5-Hex Pentad Clusters & Tight Par)
  // --------------------------------------------------------------------------
  {
    id: 9,
    name: 'Autumn Canopy',
    subtitle: 'Mechanic: 5-Hex Canopy Pentad',
    description:
      'Deploy the massive 5-Hex Canopy Pentad cluster to anchor ancient emerald forest sanctuaries.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Canopy Basin',
        objective: 'Place the Canopy Pentad with zero overlap and precise alignment.',
        targetTilesCount: 11,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: -1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Ancient Canopy',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 1, r: 1 }, { q: 0, r: 2 }, { q: -1, r: 2 }],
          },
          {
            name: 'Solar Clearing',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-triad-gray', 'p-pentad-emerald', 'p-duo-emerald', 'p-duo-amber']),
    targetScore: { star1: 2600, star2: 3800, star3: 4900 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 10: Citadel of the Pioneers (Tier 1 Grand Finale)
  // --------------------------------------------------------------------------
  {
    id: 10,
    name: 'Citadel of the Pioneers',
    subtitle: 'Tier 1 Grand Finale: Multi-Phase Cluster Citadel',
    description:
      'Combine all learned mechanics: Multi-Phase expansion, 2H to 5H Giant Clusters, and Tri-Color zone completion.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Citadel Foundations',
        objective: 'Establish the core citadel using amber and sapphire clusters.',
        targetTilesCount: 7,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: -2, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Citadel Gate',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Reservoir Keep',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Grand Bastion',
        objective: 'Expand into the outer emerald walls to complete the pioneer fortress.',
        targetTilesCount: 14,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: -2, r: 0 },
          { q: 2, r: -1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
          { q: -1, r: -1 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Citadel Gate',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Reservoir Keep',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
          {
            name: 'Bastion Glades',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }, { q: 1, r: 1 }],
          },
        ],
      },
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-gray',
      'p-triad-gray',
      'p-triad-amber',
      'p-duo-sapphire',
      'p-quad-sapphire',
      'p-triad-emerald',
    ]),
    targetScore: { star1: 3200, star2: 4500, star3: 5800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 11: The Riverbend Turntable (Introduces Rotation Zones)
  // --------------------------------------------------------------------------
  {
    id: 11,
    name: 'The Riverbend Turntable',
    subtitle: 'Mechanic: Interactive Rotation Zones',
    description:
      'Click the 3D rotary dial or the HUD button to rotate the 7 central hexes by 60°, shifting placed tiles into new color alignments!',
    phases: [
      {
        phaseNumber: 1,
        title: 'Riverbend Mechanism',
        objective: 'Use the turntable to shift structures into matching color zones.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: 0, r: 2 },
          { q: -2, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Rotary Sunpath',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: -1 }],
          },
          {
            name: 'Spring Inlet',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 1 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-11-core',
            name: 'Riverbend Turntable',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-amber', 'p-duo-sapphire', 'p-trees-emerald']),
    targetScore: { star1: 2200, star2: 3200, star3: 4200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 12: Whirling Windmill (Turntable + 3H Triads)
  // --------------------------------------------------------------------------
  {
    id: 12,
    name: 'Whirling Windmill',
    subtitle: 'Mechanic: Rotary Cluster Alignment',
    description:
      'Rotate multi-hex clusters on the central turntable to fulfill intricate color requirements.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Windmill Meadow',
        objective: 'Rotate the central mechanism to align the Amber and Emerald districts.',
        targetTilesCount: 9,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: 1, r: 1 },
          { q: -1, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Mill Grain Store',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Orchard Glade',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: -1, r: 2 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-12-core',
            name: 'Windmill Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-triad-amber', 'p-triad-emerald', 'p-duo-gray']),
    targetScore: { star1: 2400, star2: 3500, star3: 4600 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 13: Highland Citadel (Introduces Mastery Challenge)
  // --------------------------------------------------------------------------
  {
    id: 13,
    name: 'Highland Citadel',
    subtitle: 'Mechanic: Mastery Challenges (1★ + Mastery Required)',
    description:
      'Achieve 1 Star AND complete the Highland Mastery Challenge (Complete with at least 2500 points) to advance!',
    masteryChallenge: {
      id: 'mc-13',
      title: 'Highland Score Mastery',
      description: 'Complete with at least 2500 points',
      type: 'min_score',
      targetValue: 2500,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Citadel Outskirts',
        objective: 'Fulfill all color zones and execute the turntable mechanism.',
        targetTilesCount: 10,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: 0, r: 2 },
          { q: -2, r: 0 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Sunstone Bastion',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Aquifer Spring',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-13-highland',
            name: 'Citadel Turntable',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-triad-amber', 'p-quad-sapphire', 'p-duo-emerald']),
    targetScore: { star1: 2600, star2: 3800, star3: 5000 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 14: Sunstone Quarry (Mastery: Zero Overuse)
  // --------------------------------------------------------------------------
  {
    id: 14,
    name: 'Sunstone Quarry',
    subtitle: 'Mastery Challenge: Zero Overuse',
    description:
      'Stay strictly within the building quota to earn the Master Stonemason achievement.',
    masteryChallenge: {
      id: 'mc-14',
      title: 'Quarry Efficiency',
      description: 'Complete the level with 0 Overuse penalties (stay within Par).',
      type: 'zero_overuse',
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Quarry Terraces',
        objective: 'Pack 4-hex and 3-hex amber structures within par.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Sunstone Quarry',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: 1 }, { q: 2, r: -1 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-quad-amber', 'p-triad-amber', 'p-duo-amber']),
    targetScore: { star1: 2400, star2: 3400, star3: 4500 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 15: Glacial Springs (Sapphire Waterways + Dual Rotation Zones)
  // --------------------------------------------------------------------------
  {
    id: 15,
    name: 'Glacial Springs',
    subtitle: 'Mechanic: Sapphire Flow & Rotary Hubs',
    description:
      'Route crystal sapphire streams through rotating glacial valve hubs.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Glacial Basin',
        objective: 'Align sapphire springs and verdant banks using the rotary valve.',
        targetTilesCount: 11,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: 2 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Glacial Sluice',
            color: 'sapphire',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }, { q: -1, r: 1 }],
          },
          {
            name: 'Alpine Pines',
            color: 'emerald',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-15-glacial',
            name: 'Glacial Valve',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-sapphire', 'p-quad-sapphire', 'p-duo-emerald', 'p-triad-emerald']),
    targetScore: { star1: 2800, star2: 4000, star3: 5200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 16: Terracotta Kiln (Introduces 4th Color: Ruby)
  // --------------------------------------------------------------------------
  {
    id: 16,
    name: 'Terracotta Kiln',
    subtitle: 'Mechanic: Ruby Forge & Terracotta Hearths',
    description:
      'Introduces the vibrant crimson Ruby color! Build glowing blacksmith forges and brick kilns.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Foundry Basin',
        objective: 'Construct the ruby hearth and forge district alongside sunlit farms.',
        targetTilesCount: 10,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: -1, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Terracotta Foundry',
            color: 'ruby',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: 1 }],
          },
          {
            name: 'Amber Granary',
            color: 'amber',
            coords: [{ q: 0, r: -1 }, { q: 1, r: -1 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-ruby', 'p-duo-ruby', 'p-duo-amber', 'p-triad-amber']),
    targetScore: { star1: 2800, star2: 4100, star3: 5400 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 17: Grand Blossom Arch (Introduces 6-Hex Blossom Mega-Clusters)
  // --------------------------------------------------------------------------
  {
    id: 17,
    name: 'Grand Blossom Arch',
    subtitle: 'Mechanic: 6-Hex Blossom Mega-Cluster',
    description:
      'Wield the magnificent 6-Hex Highland Blossom mega-cluster to instantly establish grand city centers.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Blossom Sanctuary',
        objective: 'Place and rotate the 6-Hex Blossom mega-cluster with flawless spatial precision.',
        targetTilesCount: 12,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: 2, r: 0 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Blossom Ring',
            color: 'amber',
            coords: [
              { q: 0, r: 0 },
              { q: 1, r: 0 },
              { q: 1, r: -1 },
              { q: 0, r: -1 },
              { q: -1, r: 0 },
              { q: -1, r: 1 },
            ],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-blossom-multi', 'p-duo-emerald', 'p-duo-sapphire']),
    targetScore: { star1: 3200, star2: 4600, star3: 6000 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 18: The Dual Rotary Sanctum (Dual Interactive Turntables)
  // --------------------------------------------------------------------------
  {
    id: 18,
    name: 'The Dual Rotary Sanctum',
    subtitle: 'Mechanic: Dual Synchronized Turntables',
    description:
      'Manage two interconnected rotary turntable zones to solve complex spatial color paths.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Dual Turntables',
        objective: 'Rotate both mechanism dials to route Amber and Ruby streams.',
        targetTilesCount: 13,
        unlockedCoords: [
          { q: -1, r: 0 },
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: -1, r: 1 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: -1 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Left Sanctum',
            color: 'ruby',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }, { q: -1, r: 1 }],
          },
          {
            name: 'Right Sanctum',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: 1 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-18-left',
            name: 'Ruby Hub',
            center: { q: -1, r: 0 },
            radius: 1,
          },
          {
            id: 'zone-18-right',
            name: 'Amber Hub',
            center: { q: 1, r: 0 },
            radius: 1,
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-triad-amber', 'p-duo-ruby', 'p-triad-emerald']),
    targetScore: { star1: 3400, star2: 4800, star3: 6300 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 19: Volcanic Verge (All 4 Colors + 5H Clusters)
  // --------------------------------------------------------------------------
  {
    id: 19,
    name: 'Volcanic Verge',
    subtitle: 'Mechanic: Quad-Color Harmonic Settlement',
    description:
      'Unite all four elemental zones (Amber Sun, Emerald Grove, Sapphire Spring, Ruby Hearth) across shifting volcanic crags.',
    masteryChallenge: {
      id: 'mc-19',
      title: 'Elemental Concord',
      description: 'Finish with 0 Disconnect penalties and 0 Overlap errors across all 4 colors.',
      type: 'zero_disconnect',
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Four Elements Caldera',
        objective: 'Complete all 4 distinct colored zones.',
        targetTilesCount: 14,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: 0, r: -1 },
          { q: 0, r: -2 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Sunstone Spire',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Verdant Forest',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
          {
            name: 'Glacial Spring',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
          {
            name: 'Magma Forge',
            color: 'ruby',
            coords: [{ q: 0, r: -1 }, { q: 0, r: -2 }],
          },
        ],
      },
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-amber',
      'p-duo-emerald',
      'p-duo-sapphire',
      'p-duo-ruby',
      'p-quad-gray',
    ]),
    targetScore: { star1: 3800, star2: 5400, star3: 7000 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 20: Pioneer Metropolis (Grand Campaign Master Finale)
  // --------------------------------------------------------------------------
  {
    id: 20,
    name: 'Pioneer Metropolis',
    subtitle: 'Grand Campaign Finale: Master Pioneer Sanctuary',
    description:
      'The ultimate test of pioneer architecture: 3-Phase expansion, 6-Hex Blossom mega-clusters, dual rotary turntables, and complete quad-color integration.',
    masteryChallenge: {
      id: 'mc-20',
      title: 'Grand Master Sovereign',
      description: 'Claim 3 Stars with 0 Disconnects, 0 Overlaps, and at least 2 Zone Rotations.',
      type: 'zero_disconnect',
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Metropolitan Core',
        objective: 'Build the grand central blossom plaza.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: -2, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Imperial Sun Plaza',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-20-core',
            name: 'Metropolis Core Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: District Expansion',
        objective: 'Expand into the northern grove and southern hydro works.',
        targetTilesCount: 16,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: -2, r: 0 },
          { q: 2, r: -1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
          { q: -1, r: -1 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Imperial Sun Plaza',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Emerald Sanctuary',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
          {
            name: 'Sapphire Aqueducts',
            color: 'sapphire',
            coords: [{ q: -2, r: 1 }, { q: -2, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-20-core',
            name: 'Metropolis Core Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: The Grand Metropolis',
        objective: 'Ignite the Ruby forge citadel to complete the legendary metropolis.',
        targetTilesCount: 22,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: 0 },
          { q: -2, r: 0 },
          { q: 2, r: -1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
          { q: -1, r: -1 },
          { q: 0, r: -2 },
          { q: 2, r: 1 },
          { q: 3, r: -1 },
          { q: 1, r: 2 },
          { q: -2, r: 2 },
          { q: -3, r: 1 },
          { q: 0, r: -3 },
        ],
        coloredZones: [
          {
            name: 'Imperial Sun Plaza',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Emerald Sanctuary',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
          {
            name: 'Sapphire Aqueducts',
            color: 'sapphire',
            coords: [{ q: -2, r: 1 }, { q: -2, r: 0 }],
          },
          {
            name: 'Ruby Sovereign Kiln',
            color: 'ruby',
            coords: [{ q: 0, r: -2 }, { q: 0, r: -3 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-20-core',
            name: 'Metropolis Core Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
      },
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-blossom-multi',
      'p-triad-amber',
      'p-pentad-emerald',
      'p-quad-sapphire',
      'p-duo-ruby',
    ]),
    targetScore: { star1: 4500, star2: 6500, star3: 8800 },
  },
];
