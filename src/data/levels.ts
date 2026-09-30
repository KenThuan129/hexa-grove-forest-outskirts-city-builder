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

  // ==================== ROADS (Gimmick 1) ====================
  {
    id: 'p-road-single',
    type: 'road',
    color: 'neutral',
    name: 'Pioneer Asphalt Road',
    description: 'A robust paved road link. Connects adjacent to Houses, Towers, Landmarks, Roads, or Bridges.',
    bonusesDescription: 'Road Gimmick. Extends settlement pathways.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'road' }],
  },
  {
    id: 'p-road-duo',
    type: 'road',
    color: 'neutral',
    name: 'Dual-Lane Road Duo',
    description: 'Twin-section dual-lane transit corridor.',
    bonusesDescription: '2-Hex Road Duo. Continuous transit link.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'road' },
      { q: 1, r: 0, type: 'road' },
    ],
  },
  {
    id: 'p-road-triad-line',
    type: 'road',
    color: 'neutral',
    name: 'Express Highway Triad',
    description: '3-hex straight transit avenue connecting distant districts.',
    bonusesDescription: '3-Hex Road Triad. Rapid straightline expansion.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'road' },
      { q: 1, r: 0, type: 'road' },
      { q: 2, r: 0, type: 'road' },
    ],
  },
  {
    id: 'p-road-triad-curve',
    type: 'road',
    color: 'neutral',
    name: 'Boulevard Curve Triad',
    description: '3-hex sweeping curved boulevard navigating terrain corners.',
    bonusesDescription: '3-Hex Road Triad. Smooth corner transit.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'road' },
      { q: 1, r: 0, type: 'road' },
      { q: 1, r: -1, type: 'road' },
    ],
  },
  {
    id: 'p-road-quad-loop',
    type: 'road',
    color: 'neutral',
    name: 'Interchange Quad Loop',
    description: '4-hex diamond highway interchange with high capacity throughput.',
    bonusesDescription: '4-Hex Road Quad. Central transit hub.',
    clusterType: 'quad',
    clusterShape: [
      { q: 0, r: 0, type: 'road' },
      { q: 1, r: 0, type: 'road' },
      { q: 0, r: 1, type: 'road' },
      { q: 1, r: 1, type: 'road' },
    ],
  },
  {
    id: 'p-road-quad-line',
    type: 'road',
    color: 'neutral',
    name: 'Grand Arterial Highway',
    description: '4-hex long-distance high-speed arterial corridor.',
    bonusesDescription: '4-Hex Road Quad. Spans across entire valleys.',
    clusterType: 'quad',
    clusterShape: [
      { q: -1, r: 0, type: 'road' },
      { q: 0, r: 0, type: 'road' },
      { q: 1, r: 0, type: 'road' },
      { q: 2, r: 0, type: 'road' },
    ],
  },

  // ==================== BRIDGES (Gimmick 2) ====================
  {
    id: 'p-bridge-single',
    type: 'bridge',
    color: 'neutral',
    name: 'Spanning Timber Bridge',
    description: 'Can be placed over rivers or in empty voids to unite separate islands.',
    bonusesDescription: 'Bridge Gimmick. Safe from off-map/river penalties.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'bridge' }],
  },
  {
    id: 'p-bridge-duo',
    type: 'bridge',
    color: 'neutral',
    name: 'Timber Bridgeway Duo',
    description: 'Two-hex connected timber deck bridge to span waterways and gaps.',
    bonusesDescription: '2-Hex Bridge Duo. Crosses river channels.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'bridge' },
      { q: 1, r: 0, type: 'bridge' },
    ],
  },
  {
    id: 'p-bridge-triad-line',
    type: 'bridge',
    color: 'neutral',
    name: 'Aqueduct Viaduct Triad',
    description: '3-hex continuous viaduct spanning deep gorges, chasms, and wide estuaries.',
    bonusesDescription: '3-Hex Bridge Triad. Spans wide rivers.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'bridge' },
      { q: 1, r: 0, type: 'bridge' },
      { q: 2, r: 0, type: 'bridge' },
    ],
  },
  {
    id: 'p-bridge-triad-curve',
    type: 'bridge',
    color: 'neutral',
    name: 'Serpentine Estuary Bridge',
    description: '3-hex curved bridge following meandering river channels.',
    bonusesDescription: '3-Hex Bridge Triad. Navigates curved riverbanks.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'bridge' },
      { q: 1, r: 0, type: 'bridge' },
      { q: 1, r: -1, type: 'bridge' },
    ],
  },
  {
    id: 'p-bridge-quad-line',
    type: 'bridge',
    color: 'neutral',
    name: 'Grand Causeway Viaduct',
    description: '4-hex heavy load-bearing viaduct crossing extensive water bodies.',
    bonusesDescription: '4-Hex Bridge Quad. Massive water crossing.',
    clusterType: 'quad',
    clusterShape: [
      { q: -1, r: 0, type: 'bridge' },
      { q: 0, r: 0, type: 'bridge' },
      { q: 1, r: 0, type: 'bridge' },
      { q: 2, r: 0, type: 'bridge' },
    ],
  },
  {
    id: 'p-causeway-duo',
    type: 'mixed',
    color: 'neutral',
    name: 'Shoreline Pier Causeway',
    description: 'Seamless transition piece with 1 overland Road segment connected to 1 water Bridge.',
    bonusesDescription: '2-Hex Hybrid Cluster. Connects land to sea.',
    clusterType: 'duo',
    clusterShape: [
      { q: 0, r: 0, type: 'road' },
      { q: 1, r: 0, type: 'bridge' },
    ],
  },
  {
    id: 'p-causeway-triad',
    type: 'mixed',
    color: 'neutral',
    name: 'Harbor Wharf Span',
    description: 'Harbor transition cluster featuring 1 land Road connecting to a 2-hex offshore Bridge jetty.',
    bonusesDescription: '3-Hex Hybrid Cluster. Offshore jetty link.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'road' },
      { q: 1, r: 0, type: 'bridge' },
      { q: 2, r: 0, type: 'bridge' },
    ],
  },

  // ==================== COMPLEX TOWERS & LANDMARKS (Gimmick 3) ====================
  {
    id: 'p-tower-neutral',
    type: 'tower',
    color: 'neutral',
    name: 'Frontier Watchtower',
    description: 'A tall stone and timber watchtower overlooking the valley.',
    bonusesDescription: 'Complex Tower. Beautiful stylized vertical structure.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'tower' }],
  },
  {
    id: 'p-tower-amber',
    type: 'tower',
    color: 'amber',
    name: 'Solar Citadel Spire',
    description: 'A spectacular 3-hex amber cluster anchored by a radiant wizard tower.',
    bonusesDescription: '3-Hex Tower Cluster. High amber alignment score.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'tower' },
      { q: 1, r: 0, type: 'mixed' },
      { q: 0, r: 1, type: 'house' },
    ],
  },
  {
    id: 'p-tower-sapphire',
    type: 'tower',
    color: 'sapphire',
    name: 'Hydro-Spire Keep',
    description: 'Three-hex waterworks castle keep with sky-high sapphire tower.',
    bonusesDescription: '3-Hex Tower Cluster. Protects alignment zones.',
    clusterType: 'triad',
    clusterShape: [
      { q: 0, r: 0, type: 'tower' },
      { q: 1, r: -1, type: 'mixed' },
      { q: 0, r: -1, type: 'house' },
    ],
  },
  {
    id: 'p-landmark-blossom',
    type: 'landmark',
    color: 'neutral',
    name: 'Grand Triumphal Arch',
    description: 'An legendary 6-hex hexagonal ring landmark celebrating alpine pioneers.',
    bonusesDescription: 'Ultimate Landmark! Epic blossom ring shape.',
    clusterType: 'blossom',
    clusterShape: [
      { q: 0, r: 0, type: 'landmark' },
      { q: 1, r: 0, type: 'mixed' },
      { q: 1, r: -1, type: 'house' },
      { q: 0, r: -1, type: 'landmark' },
      { q: -1, r: 0, type: 'mixed' },
      { q: -1, r: 1, type: 'house' },
    ],
  },
  {
    id: 'p-landmark-monolith',
    type: 'landmark',
    color: 'emerald',
    name: 'Ancient Verdant Obelisk',
    description: 'A 4-hex square emerald cluster centered around a high-standing stone obelisk.',
    bonusesDescription: '4-Hex Landmark. Excellent green district anchor.',
    clusterType: 'quad',
    clusterShape: [
      { q: 0, r: 0, type: 'landmark' },
      { q: 1, r: 0, type: 'trees' },
      { q: 0, r: 1, type: 'mixed' },
      { q: 1, r: 1, type: 'trees' },
    ],
  },
  {
    id: 'p-landmark-cathedral',
    type: 'landmark',
    color: 'ruby',
    name: 'Crimson Sovereign Cathedral',
    description: 'Five-hex magnificent terracotta cathedral and spire landmark.',
    bonusesDescription: '5-Hex Landmark. Epic crimson beauty.',
    clusterType: 'pentad',
    clusterShape: [
      { q: 0, r: 0, type: 'landmark' },
      { q: 1, r: 0, type: 'mixed' },
      { q: 0, r: 1, type: 'house' },
      { q: -1, r: 1, type: 'landmark' },
      { q: 1, r: -1, type: 'house' },
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
    targetScore: { star1: 300, star2: 600, star3: 1000 },
    lightbulbBudget: 3,
  },

  // --------------------------------------------------------------------------
  // LEVEL 2: Introduces Progression & Multi-Phase Expansion
  // --------------------------------------------------------------------------
  {
    id: 2,
    name: 'Frontier Horizons',
    subtitle: 'Tutorial: Building Quota, Target Zones & Expand',
    description:
      'Keep an eye on your Building Quota (Left), fill the Target Color Zones (Right), and Expand into new territory!',
    uiConfig: {
      hideLeftSidebar: false,
      hideRightSidebar: false,
      hidePenalties: true,
      hideScore: true,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Twin Clearings',
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
      {
        phaseNumber: 2,
        title: 'Phase 2: Expanded Frontier',
        objective: 'Expand through the newly cleared western terraces to complete the settlement.',
        targetTilesCount: 9,
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
          { q: 1, r: 1 },
          { q: -1, r: 2 },
          { q: -2, r: 1 },
          { q: -2, r: 0 },
          { q: 2, r: -1 },
          { q: 0, r: -2 },
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
          {
            name: 'Western Terraces',
            color: 'emerald',
            coords: [{ q: -1, r: 2 }, { q: -2, r: 1 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-amber', 'p-trees-emerald', 'p-road-single', 'p-road-duo', 'p-bridge-single']),
    targetScore: { star1: 400, star2: 700, star3: 1000 },
    lightbulbBudget: 8,
  },

  // --------------------------------------------------------------------------
  // LEVEL 3: Frontier Outpost
  // --------------------------------------------------------------------------
  {
    id: 3,
    name: 'Frontier Outpost',
    subtitle: 'Mechanic: Forest Expansion',
    description: 'A hand-crafted settlement frontier built with the Level Editor.',
    lightbulbBudget: 40,
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Foundation Settlement',
        objective: 'Build structures on the safe clearings and match colored zones.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: -1 },
          { q: -1, r: 0 },
          { q: -1, r: -1 },
          { q: -2, r: 1 },
          { q: -2, r: 0 },
          { q: 0, r: 0 },
          { q: -1, r: 1 },
        ],
        coloredZones: [
          {
            name: 'AMBER Zone',
            color: 'amber',
            coords: [{ q: 0, r: -1 }],
            bossZoneType: 'power',
          },
          {
            name: 'EMERALD Zone',
            color: 'emerald',
            coords: [
              { q: -1, r: -1 },
              { q: -2, r: 1 },
            ],
            bossZoneType: 'traits',
          },
        ],
        fogCoords: [],
        riverCoords: [],
        rotationZones: [],
      },
    ],
    availablePieces: [
      {
        id: 'p-house-gray',
        type: 'house',
        color: 'neutral',
        name: 'Timber Cottage',
        description: 'Single pioneer dwelling with stone base & slate roof.',
        bonusesDescription: 'Single cell. Safe on any gray clearing.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'house' }],
        lightbulbCost: 1,
      },
      {
        id: 'p-road-single',
        type: 'road',
        color: 'neutral',
        name: 'Pioneer Asphalt Road',
        description: 'A robust paved road link. Connects adjacent to Houses, Towers, Landmarks, Roads, or Bridges.',
        bonusesDescription: 'Road Gimmick. Extends settlement pathways.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'road' }],
        lightbulbCost: 1,
      },
      {
        id: 'p-house-amber',
        type: 'house',
        color: 'amber',
        name: 'Sunlit Townhall',
        description: 'Golden shingle residence with radiant lantern tower.',
        bonusesDescription: 'Single cell. Matches Amber sunlit zones.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'house' }],
        lightbulbCost: 1,
      },
      {
        id: 'p-trees-emerald',
        type: 'trees',
        color: 'emerald',
        name: 'Verdant Shelter',
        description: 'Dense sanctuary of mystical emerald pines and botanical gardens.',
        bonusesDescription: 'Single cell. Matches Emerald grove zones.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'trees' }],
        lightbulbCost: 1,
      },
    ],
    targetScore: {
      star1: 400,
      star2: 700,
      star3: 1000,
    },
    isBossLevel: false,
  },

  // --------------------------------------------------------------------------
  // LEVEL 4: Introduces "Phases" (Multi-Phase Expansion)
  // --------------------------------------------------------------------------
  {
  id: 4,
  name: "Whispering Glade",
  subtitle: "Mechanic: Phase Expansion",
  description: "Fill Phase 1 target color zones to push back the deep forest and expand into Phase 2!",
  lightbulbBudget: 40,
  phases: [
    {
      phaseNumber: 1,
      title: "Phase 1: Inner Outpost",
      objective: "Settle the inner clearing to unlock Phase 2 expansion.",
      targetTilesCount: 4,
      unlockedCoords: [
        {
          q: 0,
          r: 0
        },
        {
          q: 1,
          r: 0
        },
        {
          q: 0,
          r: 1
        },
        {
          q: -1,
          r: 1
        },
        {
          q: -1,
          r: 0
        },
        {
          q: 0,
          r: -1
        },
        {
          q: 1,
          r: -1
        }
      ],
      coloredZones: [
        {
          name: "Amber Hearth",
          color: "amber",
          coords: [
            {
              q: 1,
              r: 0
            },
            {
              q: 1,
              r: -1
            }
          ]
        }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Forest Expansion",
      objective: "Expand through the newly cleared emerald glades.",
      targetTilesCount: 8,
      unlockedCoords: [
        {
          q: 0,
          r: 0
        },
        {
          q: 1,
          r: 0
        },
        {
          q: 0,
          r: 1
        },
        {
          q: 1,
          r: -1
        },
        {
          q: 2,
          r: 0
        },
        {
          q: 2,
          r: -1
        },
        {
          q: 0,
          r: 2
        },
        {
          q: -1,
          r: 2
        },
        {
          q: -2,
          r: 0
        },
        {
          q: 0,
          r: -2
        },
        {
          q: -1,
          r: -1
        },
        {
          q: -2,
          r: 1
        },
        {
          q: -1,
          r: 1
        },
        {
          q: -1,
          r: 0
        },
        {
          q: 0,
          r: -1
        }
      ],
      coloredZones: [
        {
          name: "Amber Hearth",
          color: "amber",
          coords: [
            {
              q: 1,
              r: 0
            },
            {
              q: 1,
              r: -1
            },
            {
              q: 0,
              r: -2
            },
            {
              q: -1,
              r: -1
            },
            {
              q: -1,
              r: 0
            },
            {
              q: 0,
              r: -1
            }
          ]
        },
        {
          name: "Emerald Glade",
          color: "emerald",
          coords: [
            {
              q: 0,
              r: 2
            },
            {
              q: -1,
              r: 2
            },
            {
              q: -2,
              r: 1
            },
            {
              q: -1,
              r: 1
            }
          ]
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    }
  ],
  availablePieces: [
    {
      id: "p-house-gray",
      type: "house",
      color: "neutral",
      name: "Timber Cottage",
      description: "Single pioneer dwelling with stone base & slate roof.",
      bonusesDescription: "Single cell. Safe on any gray clearing.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-duo-amber",
      type: "mixed",
      color: "amber",
      name: "Solar Duo",
      description: "Sunlit house connected to a golden wheat croft.",
      bonusesDescription: "2-Hex Duo cluster. Matches Amber zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    },
    {
      id: "p-duo-emerald",
      type: "mixed",
      color: "emerald",
      name: "Arbor Duo",
      description: "Tandem grove shelter with towering emerald conifers.",
      bonusesDescription: "2-Hex Duo cluster. Matches Emerald zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "trees"
        },
        {
          q: 0,
          r: 1,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    }
  ],
  targetScore: {
    star1: 400,
    star2: 700,
    star3: 1000,
  },
  isBossLevel: false
},

  // --------------------------------------------------------------------------
  // LEVEL 5: Mastering Phases (3 Colors, 2 Expansion Waves)
  // --------------------------------------------------------------------------
  {
  id: 5,
  name: "Emerald Highlands",
  subtitle: "Mechanic: Tri-Color Phase Expansion",
  description: "Coordinate expansion across Amber, Emerald, and Sapphire zones across two distinct phases.",
  lightbulbBudget: 45,
  phases: [
    {
      phaseNumber: 1,
      title: "Phase 1: Highland Post",
      objective: "Secure the central spring and meadow.",
      targetTilesCount: 5,
      unlockedCoords: [
        {
          q: 1,
          r: 0
        },
        {
          q: 0,
          r: 1
        },
        {
          q: -1,
          r: 0
        },
        {
          q: 1,
          r: -1
        },
        {
          q: -1,
          r: 1
        },
        {
          q: 0,
          r: 0
        },
        {
          q: 0,
          r: -1
        }
      ],
      coloredZones: [
        {
          name: "Central Meadow",
          color: "amber",
          coords: [
            {
              q: 1,
              r: 0
            },
            {
              q: 0,
              r: 0
            }
          ]
        },
        {
          name: "Highland Spring",
          color: "sapphire",
          coords: [
            {
              q: -1,
              r: 0
            },
            {
              q: 0,
              r: -1
            }
          ]
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Full Frontier",
      objective: "Expand into the northern pine terraces and connect all zones.",
      targetTilesCount: 10,
      unlockedCoords: [
        {
          q: 1,
          r: 0
        },
        {
          q: 0,
          r: 1
        },
        {
          q: -1,
          r: 0
        },
        {
          q: 1,
          r: -1
        },
        {
          q: -1,
          r: 1
        },
        {
          q: 2,
          r: 0
        },
        {
          q: 2,
          r: -1
        },
        {
          q: 1,
          r: 1
        },
        {
          q: 0,
          r: 2
        },
        {
          q: -1,
          r: 2
        },
        {
          q: -2,
          r: 1
        },
        {
          q: -2,
          r: 0
        },
        {
          q: -1,
          r: -1
        },
        {
          q: 0,
          r: -2
        },
        {
          q: 0,
          r: -1
        },
        {
          q: 0,
          r: 0
        }
      ],
      coloredZones: [
        {
          name: "Central Meadow",
          color: "amber",
          coords: [
            {
              q: 1,
              r: 0
            },
            {
              q: 2,
              r: 0
            },
            {
              q: 0,
              r: 0
            }
          ]
        },
        {
          name: "Highland Spring",
          color: "sapphire",
          coords: [
            {
              q: -1,
              r: 0
            },
            {
              q: -2,
              r: 0
            },
            {
              q: 0,
              r: -1
            }
          ]
        },
        {
          name: "Northern Terraces",
          color: "emerald",
          coords: [
            {
              q: 0,
              r: 2
            },
            {
              q: -1,
              r: 2
            }
          ]
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    }
  ],
  availablePieces: [
    {
      id: "p-house-gray",
      type: "house",
      color: "neutral",
      name: "Timber Cottage",
      description: "Single pioneer dwelling with stone base & slate roof.",
      bonusesDescription: "Single cell. Safe on any gray clearing.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-house-amber",
      type: "house",
      color: "amber",
      name: "Sunlit Townhall",
      description: "Golden shingle residence with radiant lantern tower.",
      bonusesDescription: "Single cell. Matches Amber sunlit zones.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-landmark-monolith",
      type: "landmark",
      color: "emerald",
      name: "Ancient Verdant Obelisk",
      description: "A 4-hex square emerald cluster centered around a high-standing stone obelisk.",
      bonusesDescription: "4-Hex Landmark. Excellent green district anchor.",
      clusterType: "quad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "landmark"
        },
        {
          q: 1,
          r: 0,
          type: "trees"
        },
        {
          q: 0,
          r: 1,
          type: "mixed"
        },
        {
          q: 1,
          r: 1,
          type: "trees"
        }
      ],
      lightbulbCost: 4
    },
    {
      id: "p-duo-sapphire",
      type: "mixed",
      color: "sapphire",
      name: "Aqueduct Duo",
      description: "Twin watermill and sluice gate reservoir.",
      bonusesDescription: "2-Hex Duo cluster. Matches Sapphire zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    },
    {
      id: "p-tower-amber",
      type: "tower",
      color: "amber",
      name: "Solar Citadel Spire",
      description: "A spectacular 3-hex amber cluster anchored by a radiant wizard tower.",
      bonusesDescription: "3-Hex Tower Cluster. High amber alignment score.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "tower"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        },
        {
          q: 0,
          r: 1,
          type: "house"
        }
      ],
      lightbulbCost: 3
    }
  ],
  targetScore: {
    star1: 450,
    star2: 750,
    star3: 1000,
  },
  isBossLevel: false
},

  // --------------------------------------------------------------------------
  // LEVEL 6: Introduces Mastery Challenge & Off-Map Penalty
  // --------------------------------------------------------------------------
  {
    id: 6,
    name: 'The Great Stoneworks',
    subtitle: 'Tutorial: Mastery Challenge & Off-Map Penalty',
    description:
      'Learn how Crown Mastery Challenges work: identify and remove Off-Map violations to claim victory with 0 penalties!',
    masteryChallenge: {
      id: 'mc-6',
      title: 'No Off-map',
      description: 'Settle all target zones cleanly with 0 Off-map penalty errors.',
      type: 'zero_offmap',
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Surveyor Territory',
        objective: 'Remove off-map placements and align all green and amber zones cleanly.',
        targetTilesCount: 8,
        initialPlacedTiles: [
          { pieceId: 'p-trees-emerald', q: 0, r: 1 },
          { pieceId: 'p-trees-emerald', q: 0, r: 2 },
          { pieceId: 'p-trees-emerald', q: 0, r: 3 }, // OUTSIDE MAP BOUNDARY -> Off-Map penalty!
        ],
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
            name: 'Emerald Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
          {
            name: 'Sunstone Plaza',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-amber', 'p-trees-emerald', 'p-duo-amber', 'p-duo-emerald']),
    targetScore: { star1: 400, star2: 700, star3: 1000 },
    lightbulbBudget: 7,
  },

  // --------------------------------------------------------------------------
  // LEVEL 7: Sunfire Basin (4H Quad Clusters & Spatial Geometry)
  // --------------------------------------------------------------------------
  {
  id: 7,
  name: "Sunfire Basin",
  subtitle: "Mechanic: 4-Hex Quad Clusters",
  description: "Master the Forest Quad and Sunstone Quad 4-hex geometries in an 8x8 diamond clearing.",
  lightbulbBudget: 25,
  phases: [
    {
      phaseNumber: 1,
      title: "Diamond Basin",
      objective: "Align 4-hex clusters efficiently to stay within the par quota.",
      targetTilesCount: 10,
      unlockedCoords: [
        {
          q: 0,
          r: 1
        },
        {
          q: -2,
          r: 1
        },
        {
          q: 0,
          r: -1
        },
        {
          q: 1,
          r: -1
        },
        {
          q: 1,
          r: 0
        },
        {
          q: -1,
          r: 0
        },
        {
          q: -1,
          r: 1
        },
        {
          q: -2,
          r: 2
        },
        {
          q: -1,
          r: 2
        },
        {
          q: 0,
          r: 0
        },
        {
          q: 0,
          r: 2
        },
        {
          q: 1,
          r: 1
        }
      ],
      coloredZones: [
        {
          name: "Sunfire Quad",
          color: "amber",
          coords: [
            {
              q: 0,
              r: 1
            },
            {
              q: -1,
              r: 0
            },
            {
              q: 0,
              r: 2
            },
            {
              q: 1,
              r: 1
            }
          ]
        },
        {
          name: "SAPPHIRE Zone",
          color: "sapphire",
          coords: [
            {
              q: 1,
              r: 0
            },
            {
              q: -1,
              r: 1
            },
            {
              q: 0,
              r: 0
            }
          ],
          bossZoneType: "defend"
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    }
  ],
  availablePieces: [
    {
      id: "p-house-gray",
      type: "house",
      color: "neutral",
      name: "Timber Cottage",
      description: "Single pioneer dwelling with stone base & slate roof.",
      bonusesDescription: "Single cell. Safe on any gray clearing.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-duo-sapphire",
      type: "mixed",
      color: "sapphire",
      name: "Aqueduct Duo",
      description: "Twin watermill and sluice gate reservoir.",
      bonusesDescription: "2-Hex Duo cluster. Matches Sapphire zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    },
    {
      id: "p-tower-sapphire",
      type: "tower",
      color: "sapphire",
      name: "Hydro-Spire Keep",
      description: "Three-hex waterworks castle keep with sky-high sapphire tower.",
      bonusesDescription: "3-Hex Tower Cluster. Protects alignment zones.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "tower"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        },
        {
          q: 0,
          r: -1,
          type: "house"
        }
      ],
      lightbulbCost: 3
    },
    {
      id: "p-duo-amber",
      type: "mixed",
      color: "amber",
      name: "Solar Duo",
      description: "Sunlit house connected to a golden wheat croft.",
      bonusesDescription: "2-Hex Duo cluster. Matches Amber zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    },
    {
      id: "p-tower-amber",
      type: "tower",
      color: "amber",
      name: "Solar Citadel Spire",
      description: "A spectacular 3-hex amber cluster anchored by a radiant wizard tower.",
      bonusesDescription: "3-Hex Tower Cluster. High amber alignment score.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "tower"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        },
        {
          q: 0,
          r: 1,
          type: "house"
        }
      ],
      lightbulbCost: 3
    }
  ],
  targetScore: {
    star1: 450,
    star2: 750,
    star3: 1000,
  },
  isBossLevel: false
},

  // --------------------------------------------------------------------------
  // LEVEL 8: Azure Aqueducts (Sapphire & Amber Waterway Network)
  // --------------------------------------------------------------------------
  {
  id: 8,
  name: "Azure Aqueducts",
  subtitle: "Mechanic: Dual-Color Cluster Weaving",
  description: "Weave together Sapphire Aqueduct Duos and Amber Solar Duos across interlocking waterways.",
  lightbulbBudget: 30,
  phases: [
    {
      phaseNumber: 1,
      title: "Waterway Clearing",
      objective: "Settle both the sapphire aquifer stream and sunlit canal banks.",
      targetTilesCount: 10,
      unlockedCoords: [
        {
          q: 0,
          r: 0
        },
        {
          q: -1,
          r: -1
        },
        {
          q: 2,
          r: -1
        },
        {
          q: -1,
          r: 1
        },
        {
          q: 0,
          r: 1
        },
        {
          q: -2,
          r: 0
        },
        {
          q: 2,
          r: 0
        },
        {
          q: 0,
          r: -1
        },
        {
          q: 1,
          r: -2
        },
        {
          q: 1,
          r: -1
        }
      ],
      coloredZones: [
        {
          name: "AMBER Zone",
          color: "amber",
          coords: [
            {
              q: -1,
              r: 1
            },
            {
              q: 0,
              r: 1
            }
          ],
          bossZoneType: "power"
        },
        {
          name: "SAPPHIRE Zone",
          color: "sapphire",
          coords: [
            {
              q: -2,
              r: 0
            },
            {
              q: 2,
              r: 0
            }
          ],
          bossZoneType: "defend"
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Frontier Expansion",
      objective: "Expand land boundaries to cover newly unlocked zones.",
      targetTilesCount: 20,
      unlockedCoords: [
        {
          q: -2,
          r: 0
        },
        {
          q: 2,
          r: 0
        },
        {
          q: 1,
          r: -2
        },
        {
          q: 0,
          r: -1
        },
        {
          q: 1,
          r: -1
        },
        {
          q: -1,
          r: 2
        },
        {
          q: 1,
          r: 0
        },
        {
          q: -1,
          r: -1
        },
        {
          q: 2,
          r: -1
        },
        {
          q: 0,
          r: 2
        },
        {
          q: -1,
          r: 1
        },
        {
          q: 0,
          r: 1
        },
        {
          q: -2,
          r: 1
        },
        {
          q: 1,
          r: 1
        },
        {
          q: -2,
          r: 2
        }
      ],
      coloredZones: [
        {
          name: "SAPPHIRE Zone",
          color: "sapphire",
          coords: [
            {
              q: -2,
              r: 0
            },
            {
              q: 2,
              r: 0
            },
            {
              q: 1,
              r: -2
            },
            {
              q: 0,
              r: -1
            },
            {
              q: 1,
              r: -1
            }
          ],
          bossZoneType: "defend"
        },
        {
          name: "AMBER Zone",
          color: "amber",
          coords: [
            {
              q: 0,
              r: 2
            }
          ],
          bossZoneType: "power"
        },
        {
          name: "EMERALD Zone",
          color: "emerald",
          coords: [
            {
              q: -1,
              r: 2
            },
            {
              q: -2,
              r: 1
            },
            {
              q: 1,
              r: 1
            }
          ],
          bossZoneType: "traits"
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    }
  ],
  availablePieces: [
    {
      id: "p-tower-sapphire",
      type: "tower",
      color: "sapphire",
      name: "Hydro-Spire Keep",
      description: "Three-hex waterworks castle keep with sky-high sapphire tower.",
      bonusesDescription: "3-Hex Tower Cluster. Protects alignment zones.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "tower"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        },
        {
          q: 0,
          r: -1,
          type: "house"
        }
      ],
      lightbulbCost: 3
    },
    {
      id: "p-house-amber",
      type: "house",
      color: "amber",
      name: "Sunlit Townhall",
      description: "Golden shingle residence with radiant lantern tower.",
      bonusesDescription: "Single cell. Matches Amber sunlit zones.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-triad-emerald",
      type: "mixed",
      color: "emerald",
      name: "Grove Triad",
      description: "Three-cell enchanted forest grove with warden post.",
      bonusesDescription: "3-Hex Triad cluster. Fast green zone coverage.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "trees"
        },
        {
          q: 1,
          r: 0,
          type: "trees"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        }
      ],
      lightbulbCost: 3
    },
    {
      id: "p-trees-emerald",
      type: "trees",
      color: "emerald",
      name: "Verdant Shelter",
      description: "Dense sanctuary of mystical emerald pines and botanical gardens.",
      bonusesDescription: "Single cell. Matches Emerald grove zones.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "trees"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-house-sapphire",
      type: "house",
      color: "sapphire",
      name: "Aquifer Lodge",
      description: "Sturdy blue shingle lodge overlooking pristine natural springs.",
      bonusesDescription: "Single cell. Matches Sapphire aquifer zones.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-quad-sapphire",
      type: "mixed",
      color: "sapphire",
      name: "Basin Quad",
      description: "Four-cell hydro reservoir with purification fountain & lodge.",
      bonusesDescription: "4-Hex Quad cluster. Wide sapphire reach.",
      clusterType: "quad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        },
        {
          q: 0,
          r: 1,
          type: "house"
        },
        {
          q: -1,
          r: 1,
          type: "mixed"
        }
      ],
      lightbulbCost: 4
    }
  ],
  targetScore: {
    star1: 450,
    star2: 750,
    star3: 1000,
  },
  isBossLevel: false
},

  // --------------------------------------------------------------------------
  // LEVEL 9: Autumn Canopy (5-Hex Pentad Clusters & Tight Par)
  // --------------------------------------------------------------------------
  {
  id: 9,
  name: "Autumn Canopy",
  subtitle: "Mechanic: 5-Hex Canopy Pentad",
  description: "Deploy the massive 5-Hex Canopy Pentad cluster to anchor ancient emerald forest sanctuaries.",
  lightbulbBudget: 65,
  phases: [
    {
      phaseNumber: 1,
      title: "Canopy Basin",
      objective: "Place the Canopy Pentad with zero overlap and precise alignment.",
      targetTilesCount: 11,
      unlockedCoords: [
        {
          q: -2,
          r: 1
        },
        {
          q: -1,
          r: 2
        },
        {
          q: 2,
          r: -1
        },
        {
          q: 1,
          r: -2
        },
        {
          q: 0,
          r: -2
        },
        {
          q: -2,
          r: 2
        },
        {
          q: 0,
          r: 2
        },
        {
          q: 2,
          r: -2
        },
        {
          q: -1,
          r: -1
        },
        {
          q: 1,
          r: 1
        },
        {
          q: -1,
          r: 1
        },
        {
          q: 1,
          r: -1
        },
        {
          q: 0,
          r: 1
        },
        {
          q: 0,
          r: -1
        },
        {
          q: -2,
          r: 0
        },
        {
          q: 0,
          r: 0
        },
        {
          q: 2,
          r: 0
        },
        {
          q: -1,
          r: 0
        },
        {
          q: 1,
          r: 0
        },
        {
          q: -2,
          r: -1
        },
        {
          q: 3,
          r: -1
        }
      ],
      coloredZones: [
        {
          name: "AMBER Zone",
          color: "amber",
          coords: [
            {
              q: -2,
              r: 1
            },
            {
              q: -1,
              r: 2
            },
            {
              q: 2,
              r: -1
            },
            {
              q: 1,
              r: -2
            },
            {
              q: -1,
              r: -1
            },
            {
              q: 1,
              r: 1
            }
          ],
          bossZoneType: "power"
        },
        {
          name: "SAPPHIRE Zone",
          color: "sapphire",
          coords: [
            {
              q: -2,
              r: 0
            },
            {
              q: 0,
              r: 0
            },
            {
              q: 2,
              r: 0
            }
          ],
          bossZoneType: "defend"
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    }
  ],
  availablePieces: [
    {
      id: "p-duo-amber",
      type: "mixed",
      color: "amber",
      name: "Solar Duo",
      description: "Sunlit house connected to a golden wheat croft.",
      bonusesDescription: "2-Hex Duo cluster. Matches Amber zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    },
    {
      id: "p-quad-amber",
      type: "mixed",
      color: "amber",
      name: "Sunstone Quad",
      description: "Four-piece sunstone estate and harvest silos.",
      bonusesDescription: "4-Hex Quad cluster. Powerful amber scoring.",
      clusterType: "quad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        },
        {
          q: 0,
          r: 1,
          type: "trees"
        },
        {
          q: 1,
          r: 1,
          type: "mixed"
        }
      ],
      lightbulbCost: 4
    },
    {
      id: "p-tower-sapphire",
      type: "tower",
      color: "sapphire",
      name: "Hydro-Spire Keep",
      description: "Three-hex waterworks castle keep with sky-high sapphire tower.",
      bonusesDescription: "3-Hex Tower Cluster. Protects alignment zones.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "tower"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        },
        {
          q: 0,
          r: -1,
          type: "house"
        }
      ],
      lightbulbCost: 3
    },
    {
      id: "p-duo-sapphire",
      type: "mixed",
      color: "sapphire",
      name: "Aqueduct Duo",
      description: "Twin watermill and sluice gate reservoir.",
      bonusesDescription: "2-Hex Duo cluster. Matches Sapphire zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    }
  ],
  targetScore: {
    star1: 500,
    star2: 750,
    star3: 1000,
  },
  isBossLevel: false
},

  // --------------------------------------------------------------------------
  // LEVEL 10: Citadel of the Pioneers (Tier 1 Grand Finale)
  // --------------------------------------------------------------------------
  {
  id: 10,
  name: "Citadel of the Pioneers",
  subtitle: "Tier 1 Grand Finale: Multi-Phase Cluster Citadel",
  description: "Combine all learned mechanics: Multi-Phase expansion, 2H to 5H Giant Clusters, and Tri-Color zone completion.",
  lightbulbBudget: 50,
  phases: [
    {
      phaseNumber: 1,
      title: "Phase 1: Citadel Foundations",
      objective: "Establish the core citadel using amber and sapphire clusters.",
      targetTilesCount: 7,
      unlockedCoords: [
        {
          q: 0,
          r: 0
        },
        {
          q: 1,
          r: 0
        },
        {
          q: 0,
          r: 1
        },
        {
          q: -1,
          r: 1
        },
        {
          q: -1,
          r: 0
        },
        {
          q: 0,
          r: -1
        },
        {
          q: 1,
          r: -1
        },
        {
          q: 2,
          r: 0
        },
        {
          q: -2,
          r: 0
        },
        {
          q: 1,
          r: 1
        }
      ],
      coloredZones: [
        {
          name: "Citadel Gate",
          color: "amber",
          coords: [
            {
              q: 1,
              r: 0
            },
            {
              q: 2,
              r: 0
            }
          ]
        },
        {
          name: "Reservoir Keep",
          color: "sapphire",
          coords: [
            {
              q: -1,
              r: 0
            },
            {
              q: -2,
              r: 0
            }
          ]
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Grand Bastion",
      objective: "Expand into the outer emerald walls to complete the pioneer fortress.",
      targetTilesCount: 14,
      unlockedCoords: [
        {
          q: 1,
          r: 0
        },
        {
          q: -1,
          r: 0
        },
        {
          q: 2,
          r: 0
        },
        {
          q: -2,
          r: 0
        },
        {
          q: -2,
          r: 1
        },
        {
          q: -1,
          r: -1
        },
        {
          q: 1,
          r: 1
        },
        {
          q: -1,
          r: 2
        },
        {
          q: -1,
          r: 1
        },
        {
          q: 0,
          r: 0
        },
        {
          q: 1,
          r: -1
        },
        {
          q: 0,
          r: -1
        },
        {
          q: 0,
          r: 1
        },
        {
          q: 0,
          r: 2
        },
        {
          q: 0,
          r: -2
        },
        {
          q: 2,
          r: -2
        },
        {
          q: -2,
          r: 2
        }
      ],
      coloredZones: [
        {
          name: "Citadel Gate",
          color: "amber",
          coords: [
            {
              q: 1,
              r: 0
            },
            {
              q: 2,
              r: 0
            }
          ]
        },
        {
          name: "Reservoir Keep",
          color: "sapphire",
          coords: [
            {
              q: -1,
              r: 0
            },
            {
              q: -2,
              r: 0
            }
          ]
        },
        {
          name: "RUBY Zone",
          color: "ruby",
          coords: [
            {
              q: -1,
              r: 1
            },
            {
              q: 0,
              r: 0
            },
            {
              q: 1,
              r: -1
            },
            {
              q: 2,
              r: -2
            },
            {
              q: -2,
              r: 2
            }
          ],
          bossZoneType: "power"
        },
        {
          name: "EMERALD Zone",
          color: "emerald",
          coords: [
            {
              q: 0,
              r: -1
            },
            {
              q: 0,
              r: 1
            },
            {
              q: 0,
              r: 2
            },
            {
              q: 0,
              r: -2
            }
          ],
          bossZoneType: "traits"
        }
      ],
      fogCoords: [],
      riverCoords: [],
      rotationZones: []
    }
  ],
  availablePieces: [
    {
      id: "p-house-gray",
      type: "house",
      color: "neutral",
      name: "Timber Cottage",
      description: "Single pioneer dwelling with stone base & slate roof.",
      bonusesDescription: "Single cell. Safe on any gray clearing.",
      clusterType: "single",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        }
      ],
      lightbulbCost: 1
    },
    {
      id: "p-triad-amber",
      type: "mixed",
      color: "amber",
      name: "Amber Triad",
      description: "Triangular sun-district with townhall and twin amber crofts.",
      bonusesDescription: "3-Hex Triad cluster. Fills 3 amber zones.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        },
        {
          q: 0,
          r: 1,
          type: "trees"
        }
      ],
      lightbulbCost: 3
    },
    {
      id: "p-duo-sapphire",
      type: "mixed",
      color: "sapphire",
      name: "Aqueduct Duo",
      description: "Twin watermill and sluice gate reservoir.",
      bonusesDescription: "2-Hex Duo cluster. Matches Sapphire zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    },
    {
      id: "p-quad-sapphire",
      type: "mixed",
      color: "sapphire",
      name: "Basin Quad",
      description: "Four-cell hydro reservoir with purification fountain & lodge.",
      bonusesDescription: "4-Hex Quad cluster. Wide sapphire reach.",
      clusterType: "quad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        },
        {
          q: 0,
          r: 1,
          type: "house"
        },
        {
          q: -1,
          r: 1,
          type: "mixed"
        }
      ],
      lightbulbCost: 4
    },
    {
      id: "p-triad-emerald",
      type: "mixed",
      color: "emerald",
      name: "Grove Triad",
      description: "Three-cell enchanted forest grove with warden post.",
      bonusesDescription: "3-Hex Triad cluster. Fast green zone coverage.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "trees"
        },
        {
          q: 1,
          r: 0,
          type: "trees"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        }
      ],
      lightbulbCost: 3
    },
    {
      id: "p-landmark-cathedral",
      type: "landmark",
      color: "ruby",
      name: "Crimson Sovereign Cathedral",
      description: "Five-hex magnificent terracotta cathedral and spire landmark.",
      bonusesDescription: "5-Hex Landmark. Epic crimson beauty.",
      clusterType: "pentad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "landmark"
        },
        {
          q: 1,
          r: 0,
          type: "mixed"
        },
        {
          q: 0,
          r: 1,
          type: "house"
        },
        {
          q: -1,
          r: 1,
          type: "landmark"
        },
        {
          q: 1,
          r: -1,
          type: "house"
        }
      ],
      lightbulbCost: 5
    },
    {
      id: "p-duo-ruby",
      type: "mixed",
      color: "ruby",
      name: "Forge Duo",
      description: "Twin blacksmith workshop and brick kiln foundry.",
      bonusesDescription: "2-Hex Duo cluster. Matches Ruby zones.",
      clusterType: "duo",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "house"
        },
        {
          q: 0,
          r: 1,
          type: "mixed"
        }
      ],
      lightbulbCost: 2
    },
    {
      id: "p-tower-sapphire",
      type: "tower",
      color: "sapphire",
      name: "Hydro-Spire Keep",
      description: "Three-hex waterworks castle keep with sky-high sapphire tower.",
      bonusesDescription: "3-Hex Tower Cluster. Protects alignment zones.",
      clusterType: "triad",
      clusterShape: [
        {
          q: 0,
          r: 0,
          type: "tower"
        },
        {
          q: 1,
          r: -1,
          type: "mixed"
        },
        {
          q: 0,
          r: -1,
          type: "house"
        }
      ],
      lightbulbCost: 3
    }
  ],
  targetScore: {
    star1: 500,
    star2: 750,
    star3: 1000,
  },
  isBossLevel: false
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
    lightbulbBudget: 60,
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
    lightbulbBudget: 60,
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
    lightbulbBudget: 35,
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
            coords: [
              { q: 1, r: 0 },
              { q: 2, r: 0 },
            ],
          },
          {
            name: 'Aquifer Spring',
            color: 'sapphire',
            coords: [
              { q: -1, r: 0 },
              { q: -2, r: 0 },
            ],
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
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-gray',
      'p-duo-emerald',
      'p-duo-sapphire',
      'p-duo-amber',
    ]),
    targetScore: { star1: 2600, star2: 3800, star3: 5000 },
    isBossLevel: false,
    masteryChallenge: {
      id: 'mc-custom-13',
      title: 'Highland Score Mastery',
      description: 'Complete with at least 2500 points',
      type: 'min_score',
      targetValue: 2500,
    },
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
    lightbulbBudget: 65,
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
    lightbulbBudget: 65,
  },

  // --------------------------------------------------------------------------
  // LEVEL 16: Grand Highway Crossroads (Introduces Roads)
  // --------------------------------------------------------------------------
  {
    id: 16,
    name: 'Grand Highway Crossroads',
    subtitle: 'Mechanic: Road Networks & Highway Infrastructure',
    description:
      'Introduces Road Networks! Start with 3 Ruby Hearths and connect your settlement by placing at least one Road hex into the map.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Highland Roadway',
        objective: 'Connect the 3 Ruby settlements by placing at least one Road hex and matching target zones.',
        targetTilesCount: 10,
        initialPlacedTiles: [
          { pieceId: 'p-house-ruby', q: 1, r: -1 },
          { pieceId: 'p-house-ruby', q: 2, r: -1 },
          { pieceId: 'p-house-ruby', q: 1, r: 1 },
        ],
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
          { q: -1, r: 2 },
          { q: 0, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Terracotta Hearth',
            color: 'ruby',
            coords: [
              { q: 1, r: -1 },
              { q: 2, r: -1 },
              { q: 1, r: 1 },
            ],
          },
          {
            name: 'Sunlit Waystation',
            color: 'amber',
            coords: [
              { q: -1, r: 1 },
              { q: 0, r: 1 },
            ],
          },
        ],
      },
    ],
    availablePieces: getPieces([
      'p-road-single',
      'p-road-duo',
      'p-road-triad-line',
      'p-road-triad-curve',
      'p-house-gray',
      'p-duo-gray',
      'p-duo-ruby',
      'p-duo-amber',
    ]),
    targetScore: { star1: 400, star2: 800, star3: 1000 },
    lightbulbBudget: 9,
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
    lightbulbBudget: 50,
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
    lightbulbBudget: 50,
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
    lightbulbBudget: 50,
  },

  // --------------------------------------------------------------------------
  // LEVEL 20: Pioneer Metropolis (Grand Campaign Master Finale)
  // --------------------------------------------------------------------------
  {
    id: 20,
    name: 'Pioneer Metropolis',
    subtitle: 'Grand Finale: 3-Phase Quad-Color Challenge (1000 Pts Mastery)',
    description:
      'The ultimate campaign finale: 3-Phase expansion with all 4 colors available, Blossom mega-clusters, central turntable, 1★ at 1000 points, and Mastery Challenge of achieving at least 1000 points!',
    masteryChallenge: {
      id: 'mc-20',
      title: 'Grand Metropolis Mastery',
      description: 'Complete with at least 1000 points',
      type: 'min_score',
      targetValue: 1000,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Metropolitan Core',
        objective: 'Build the grand central blossom plaza around the rushing riverside crossing.',
        targetTilesCount: 8,
        riverCoords: [{ q: 0, r: -1 }, { q: 1, r: -2 }],
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
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
      'p-duo-gray',
      'p-blossom-multi',
      'p-house-amber',
      'p-triad-amber',
      'p-trees-emerald',
      'p-duo-emerald',
      'p-pentad-emerald',
      'p-house-sapphire',
      'p-duo-sapphire',
      'p-quad-sapphire',
      'p-house-ruby',
      'p-duo-ruby',
      'p-road-single',
      'p-road-duo',
      'p-road-triad-line',
      'p-road-triad-curve',
      'p-road-quad-loop',
      'p-road-quad-line',
      'p-bridge-single',
      'p-bridge-duo',
      'p-bridge-triad-line',
      'p-bridge-triad-curve',
      'p-bridge-quad-line',
      'p-causeway-duo',
      'p-causeway-triad',
    ]),
    targetScore: { star1: 1000, star2: 3200, star3: 5500 },
    lightbulbBudget: 75,
  },

  // --------------------------------------------------------------------------
  // LEVEL 21: Mistveil Outpost (Introduces Fog Hexes)
  // --------------------------------------------------------------------------
  {
    id: 21,
    name: 'Mistveil Outpost',
    subtitle: 'Special Mechanic: Fog Hexes & Future Forecast',
    description:
      'Predict next phase expansion by placing tiles onto purple Fog Hexes connected to safe ground. Avoid Falsehood penalties and earn +3 bonus safe clearance tiles!',
    masteryChallenge: {
      id: 'mc-21',
      title: 'Mist Prophet',
      description: 'Complete with at least 1800 points and 0 Falsehood penalties.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Mistveil Camp',
        objective: 'Establish base camp and forecast phase 2 using the eastern Fog Hexes.',
        targetTilesCount: 7,
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
            name: 'Sunlit Clearing',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 1, r: -1 }],
          },
        ],
        fogCoords: [{ q: 2, r: 0 }, { q: 2, r: -1 }, { q: 1, r: 1 }],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Fog Dissipation',
        objective: 'Occupy the emerald groves unlocked from the mist.',
        targetTilesCount: 13,
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
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Sunlit Clearing',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 1, r: -1 }],
          },
          {
            name: 'Grove Clearing',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
        ],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-house-amber', 'p-duo-amber', 'p-duo-emerald', 'p-road-triad-line', 'p-road-triad-curve', 'p-bridge-duo']),
    targetScore: { star1: 1000, star2: 3200, star3: 4500 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 22: The Azure Crossing (Introduces River Separator)
  // --------------------------------------------------------------------------
  {
    id: 22,
    name: 'The Azure Crossing',
    subtitle: 'Special Mechanic: River Waterways (Unbuildable Barrier)',
    description:
      'A rushing azure river splits the valley in two. Build settlements on both riverbanks without dropping structures into the water!',
    masteryChallenge: {
      id: 'mc-22',
      title: 'Riverbank Master',
      description: 'Complete with at least 1800 points and 0 Disconnect penalties.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Twin Riverbanks',
        objective: 'Match the Amber and Sapphire districts across the natural waterway.',
        targetTilesCount: 10,
        unlockedCoords: [
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: -1, r: -1 },
          { q: -1, r: 1 },
          { q: 1, r: -1 },
          { q: 1, r: 0 },
          { q: 2, r: -1 },
          { q: 2, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Western Aquifer',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
          },
          {
            name: 'Eastern Solar Bank',
            color: 'amber',
            coords: [{ q: 2, r: -1 }, { q: 2, r: 0 }],
          },
        ],
        riverCoords: [{ q: 0, r: -1 }, { q: 0, r: 0 }, { q: 0, r: 1 }],
      },
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-gray',
      'p-duo-sapphire',
      'p-quad-sapphire',
      'p-triad-amber',
      'p-bridge-single',
      'p-bridge-duo',
      'p-bridge-triad-line',
      'p-bridge-quad-line',
      'p-road-duo',
      'p-road-triad-line',
      'p-causeway-duo',
      'p-causeway-triad',
    ]),
    targetScore: { star1: 1000, star2: 3400, star3: 4800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 23: Meandering Mist Delta (Introduces River & Bridge Mechanics)
  // --------------------------------------------------------------------------
  {
    id: 23,
    name: 'Meandering Mist Delta',
    subtitle: 'Mechanics: River Divide & Bridge Crossings',
    description:
      'Introduces River & Bridge mechanics! Normal structures cannot be placed directly into deep water, but Bridge pieces span across the river to connect your settlement.',
    masteryChallenge: {
      id: 'mc-23',
      title: 'Delta Bridge Master',
      description: 'Span bridges across the river and complete with at least 2000 points.',
      type: 'min_score',
      targetValue: 2000,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Delta Basin',
        objective: 'Span bridges across the river divide and align the amber and emerald banks.',
        targetTilesCount: 8,
        initialPlacedTiles: [
          { pieceId: 'p-house-gray', q: -1, r: 0 },
          { pieceId: 'p-house-gray', q: 1, r: 0 },
        ],
        unlockedCoords: [
          { q: -1, r: 0 },
          { q: -1, r: 1 },
          { q: -2, r: 1 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Delta Sunfield',
            color: 'amber',
            coords: [
              { q: 1, r: 0 },
              { q: 2, r: 0 },
            ],
          },
        ],
        riverCoords: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: -1 },
        ],
        fogCoords: [
          { q: -2, r: 2 },
          { q: -1, r: 2 },
          { q: 1, r: 1 },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Emerald Wetlands',
        objective: 'Develop the newly revealed emerald grove wetlands.',
        targetTilesCount: 14,
        unlockedCoords: [
          { q: -1, r: 0 },
          { q: -1, r: 1 },
          { q: -2, r: 1 },
          { q: -2, r: 2 },
          { q: -1, r: 2 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 1, r: -1 },
          { q: 1, r: 1 },
          { q: 2, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Delta Sunfield',
            color: 'amber',
            coords: [
              { q: 1, r: 0 },
              { q: 2, r: 0 },
            ],
          },
          {
            name: 'Wetland Sanctuary',
            color: 'emerald',
            coords: [
              { q: -2, r: 2 },
              { q: -1, r: 2 },
            ],
          },
        ],
        riverCoords: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: -1 },
        ],
      },
    ],
    availablePieces: getPieces([
      'p-bridge-single',
      'p-bridge-duo',
      'p-causeway-duo',
      'p-road-duo',
      'p-house-gray',
      'p-duo-gray',
      'p-duo-amber',
      'p-duo-emerald',
    ]),
    targetScore: { star1: 1000, star2: 3600, star3: 5000 },
    lightbulbBudget: 50,
  },

  // --------------------------------------------------------------------------
  // LEVEL 24: Turntable Rapids (River + Rotary Colored Zone Swapper)
  // --------------------------------------------------------------------------
  {
    id: 24,
    name: 'Turntable Rapids',
    subtitle: 'Mechanic: Turntable Color Zone Swapping (Lvl 20+)',
    description:
      'Spinning the rotary turntable now shifts both single tiles AND the color zone requirements underneath them!',
    masteryChallenge: {
      id: 'mc-24',
      title: 'Rapids Engineer',
      description: 'Complete with at least 1800 points and max 3 penalties.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Rotary Rapids',
        objective: 'Rotate the turntable mechanism to shift the Amber and Sapphire zones.',
        targetTilesCount: 11,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: -2, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Rotary Sunspire',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: -1 }],
          },
          {
            name: 'River Well',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 1 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-24-rapids',
            name: 'Rapids Rotary Hub',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 0, r: 2 }, { q: 1, r: 1 }, { q: -1, r: 2 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-duo-amber', 'p-quad-sapphire', 'p-duo-ruby']),
    targetScore: { star1: 1000, star2: 3800, star3: 5200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 25: TITAN OF THE MIST (BOSS CHALLENGE)
  // --------------------------------------------------------------------------
  {
    id: 25,
    name: 'Titan of the Mist',
    subtitle: 'BOSS CHALLENGE: 5-Phase Siege with Limited Stock',
    description:
      'Defeat the Ancient River Titan across 5 escalating phases! Each completed color zone reduces the Boss HP gauge down a notch. Use limited piece inventory wisely to claim 3★ victory!',
    isBossLevel: true,
    bossName: 'Ancient River Titan',
    bossMaxHp: 5000,
    masteryChallenge: {
      id: 'mc-25',
      title: 'Titan Slayer Mastery',
      description: 'Defeat all 5 Boss phases with at least 2500 points!',
      type: 'min_score',
      targetValue: 2500,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Boss Phase 1: The Titan Awakens',
        objective: 'Establish the northern sunstone line to deal first damage to the Titan.',
        targetTilesCount: 6,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Titan Eye (Amber)',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
        ],
        riverCoords: [{ q: 0, r: 2 }, { q: 1, r: 2 }],
      },
      {
        phaseNumber: 2,
        title: 'Boss Phase 2: Glacial Barrier',
        objective: 'Subdue the sapphire hydro surges across the river flank.',
        targetTilesCount: 11,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: 2, r: -1 },
          { q: 2, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Titan Eye (Amber)',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Ice Sluice (Sapphire)',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
          },
        ],
        riverCoords: [{ q: 0, r: 2 }, { q: 1, r: 2 }],
      },
      {
        phaseNumber: 3,
        title: 'Boss Phase 3: Verdant Shield',
        objective: 'Break through the emerald armor in the northern valley.',
        targetTilesCount: 16,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: 2, r: -1 },
          { q: 2, r: 0 },
          { q: 0, r: -2 },
          { q: -1, r: -1 },
          { q: 1, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Titan Eye (Amber)',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Ice Sluice (Sapphire)',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
          },
          {
            name: 'Verdant Carapace (Emerald)',
            color: 'emerald',
            coords: [{ q: 0, r: -2 }, { q: 1, r: -2 }],
          },
        ],
        riverCoords: [{ q: 0, r: 2 }, { q: 1, r: 2 }],
      },
      {
        phaseNumber: 4,
        title: 'Boss Phase 4: Volcanic Rage',
        objective: 'Ignite the Ruby hearths to counter the Titan blazing fury.',
        targetTilesCount: 20,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: 2, r: -1 },
          { q: 2, r: 0 },
          { q: 0, r: -2 },
          { q: -1, r: -1 },
          { q: 1, r: -2 },
          { q: -1, r: 2 },
          { q: -2, r: 2 },
          { q: 0, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Titan Eye (Amber)',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Ice Sluice (Sapphire)',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
          },
          {
            name: 'Verdant Carapace (Emerald)',
            color: 'emerald',
            coords: [{ q: 0, r: -2 }, { q: 1, r: -2 }],
          },
          {
            name: 'Magma Core (Ruby)',
            color: 'ruby',
            coords: [{ q: -1, r: 2 }, { q: -2, r: 2 }],
          },
        ],
        riverCoords: [{ q: 0, r: 2 }, { q: 1, r: 2 }],
      },
      {
        phaseNumber: 5,
        title: 'Boss Phase 5: Final Titan Subjugation',
        objective: 'Unite all quad-color districts with the Blossom mega-cluster for total victory!',
        targetTilesCount: 25,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -1, r: 1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: 2, r: -1 },
          { q: 2, r: 0 },
          { q: 0, r: -2 },
          { q: -1, r: -1 },
          { q: 1, r: -2 },
          { q: -1, r: 2 },
          { q: -2, r: 2 },
          { q: 0, r: 1 },
          { q: 2, r: 1 },
          { q: 3, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Titan Eye (Amber)',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Ice Sluice (Sapphire)',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
          },
          {
            name: 'Verdant Carapace (Emerald)',
            color: 'emerald',
            coords: [{ q: 0, r: -2 }, { q: 1, r: -2 }],
          },
          {
            name: 'Magma Core (Ruby)',
            color: 'ruby',
            coords: [{ q: -1, r: 2 }, { q: -2, r: 2 }],
          },
        ],
        riverCoords: [{ q: 0, r: 2 }, { q: 1, r: 2 }],
      },
    ],
    availablePieces: [
      { ...PIECE_PALETTE.find(p => p.id === 'p-blossom-multi')!, stock: 2 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-triad-amber')!, stock: 3 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-pentad-emerald')!, stock: 2 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-quad-sapphire')!, stock: 3 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-duo-ruby')!, stock: 4 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-house-gray')!, stock: 6 },
    ],
    targetScore: { star1: 1000, star2: 3500, star3: 4200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 26: Whispering Canyon (River Canyon & Dual Fog)
  // --------------------------------------------------------------------------
  {
    id: 26,
    name: 'Whispering Canyon',
    subtitle: 'Mechanics: Dual River Canyons & Deep Fog',
    description:
      'A canyon of dual rushing streams flanked by misty banks. Connect structures to safe clearings to unlock extra gray tiles.',
    masteryChallenge: {
      id: 'mc-26',
      title: 'Canyon Sovereign',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Canyon Rim',
        objective: 'Establish the amber canyon rim and forecast the western fog.',
        targetTilesCount: 9,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Sunstone Rim',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
        riverCoords: [{ q: -1, r: 0 }, { q: -1, r: 1 }, { q: -1, r: 2 }],
        fogCoords: [{ q: -2, r: 0 }, { q: -2, r: 1 }, { q: -2, r: 2 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-triad-amber', 'p-quad-amber', 'p-duo-emerald']),
    targetScore: { star1: 1000, star2: 3600, star3: 4800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 27: Sunstone Aqueduct (Rotary River Bridge)
  // --------------------------------------------------------------------------
  {
    id: 27,
    name: 'Sunstone Aqueduct',
    subtitle: 'Mechanic: Rotary Aqueduct Hub',
    description:
      'Spin the central turntable gear to switch solar and hydro alignments across the aqueduct gorge.',
    masteryChallenge: {
      id: 'mc-27',
      title: 'Aqueduct Master',
      description: 'Complete with at least 1800 points and 0 Disconnects.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Aqueduct Mechanism',
        objective: 'Rotate the central aqueduct gear to match all color requirements.',
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
        ],
        coloredZones: [
          {
            name: 'Aqueduct Sunpath',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Hydro Sluice',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-27-aqueduct',
            name: 'Aqueduct Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 0, r: 2 }, { q: 1, r: 1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-triad-amber', 'p-quad-sapphire', 'p-duo-emerald']),
    targetScore: { star1: 1000, star2: 4000, star3: 5200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 28: Verdant Sluice Gate (Emerald Delta + Rotary Zones)
  // --------------------------------------------------------------------------
  {
    id: 28,
    name: 'Verdant Sluice Gate',
    subtitle: 'Mechanic: Emerald Waterway Management',
    description:
      'Manage emerald groves and sapphire streams alongside strict 3-penalty integrity restrictions.',
    masteryChallenge: {
      id: 'mc-28',
      title: 'Sluice Keeper',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Verdant Basin',
        objective: 'Align emerald and sapphire zones with the rotary sluice.',
        targetTilesCount: 12,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: 2, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Grove Glade',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
          {
            name: 'Stream Inflow',
            color: 'sapphire',
            coords: [{ q: 1, r: -1 }, { q: 2, r: -1 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-28-sluice',
            name: 'Verdant Sluice Hub',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: -2, r: 1 }, { q: -2, r: 2 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-emerald', 'p-pentad-emerald', 'p-quad-sapphire', 'p-duo-amber']),
    targetScore: { star1: 1000, star2: 4200, star3: 5600 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 29: Magma Caldera Gorge (Ruby Forges + River Barrier)
  // --------------------------------------------------------------------------
  {
    id: 29,
    name: 'Magma Caldera Gorge',
    subtitle: 'Mechanic: Ruby Forges & Rushing Rapids',
    description:
      'Construct crimson kilns and blacksmith workshops on opposite banks of a roaring volcanic river.',
    masteryChallenge: {
      id: 'mc-29',
      title: 'Foundry Overseer',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Caldera Foundry',
        objective: 'Construct the ruby hearth and amber granaries across the river.',
        targetTilesCount: 13,
        unlockedCoords: [
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: -1, r: 1 },
          { q: -2, r: 1 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Terracotta Kiln',
            color: 'ruby',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
          {
            name: 'Sunstone Silo',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
        riverCoords: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: -1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-house-ruby', 'p-duo-ruby', 'p-triad-amber', 'p-quad-gray']),
    targetScore: { star1: 1000, star2: 4400, star3: 5800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 30: The Quad-Color Meridian (Full 4-Color Rotary Dynamic Swapper)
  // --------------------------------------------------------------------------
  {
    id: 30,
    name: 'The Quad-Color Meridian',
    subtitle: 'Mechanic: Quad-Color Dynamic Turntable',
    description:
      'The central turntable rotates all 4 harmonic colors simultaneously. Solve the spatial puzzle without exceeding 3 penalties!',
    masteryChallenge: {
      id: 'mc-30',
      title: 'Meridian Sovereign',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Meridian Core',
        objective: 'Align Amber, Emerald, Sapphire, and Ruby zones around the central turntable.',
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
          { q: 0, r: 2 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Meridian Sun',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
          {
            name: 'Meridian Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
          {
            name: 'Meridian Spring',
            color: 'sapphire',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
          {
            name: 'Meridian Hearth',
            color: 'ruby',
            coords: [{ q: 0, r: -1 }, { q: 0, r: -2 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-30-meridian',
            name: 'Meridian Dial',
            center: { q: 0, r: 0 },
            radius: 1,
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
      'p-triad-amber',
    ]),
    targetScore: { star1: 1000, star2: 4600, star3: 6000 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 31: Foggy Archipelago (Twin Rivers + Fog Island Hopping)
  // --------------------------------------------------------------------------
  {
    id: 31,
    name: 'Foggy Archipelago',
    subtitle: 'Mechanics: Multi-River Channels & Fog Exploration',
    description:
      'Island hop across multiple river channels using Fog Hex forecasts to unlock fertile new delta islands.',
    masteryChallenge: {
      id: 'mc-31',
      title: 'Archipelago Explorer',
      description: 'Complete with at least 2000 points.',
      type: 'min_score',
      targetValue: 2000,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Center Islet',
        objective: 'Establish the center island and connect to the southern fog bank.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Sunlit Islet',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
        ],
        riverCoords: [{ q: -1, r: 0 }, { q: -1, r: 1 }, { q: 2, r: 0 }, { q: 2, r: -1 }],
        fogCoords: [{ q: 0, r: 1 }, { q: 1, r: 1 }, { q: 0, r: 2 }],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Sapphire Archipelago',
        objective: 'Expand into the revealed southern sapphire aquifer archipelago.',
        targetTilesCount: 15,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: 1, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Sunlit Islet',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'South Aquifer',
            color: 'sapphire',
            coords: [{ q: 0, r: 2 }, { q: 1, r: 2 }],
          },
        ],
        riverCoords: [{ q: -1, r: 0 }, { q: -1, r: 1 }, { q: 2, r: 0 }, { q: 2, r: -1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-gray', 'p-triad-amber', 'p-quad-sapphire', 'p-duo-emerald']),
    targetScore: { star1: 1000, star2: 4800, star3: 6200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 32: The Great Blossom Weir (6-Hex Blossom Mega-Cluster over River)
  // --------------------------------------------------------------------------
  {
    id: 32,
    name: 'The Great Blossom Weir',
    subtitle: 'Mechanic: 6-Hex Blossom River Bridging',
    description:
      'Rotate and position the giant 6-Hex Highland Blossom cluster to span across the wide river gorge.',
    masteryChallenge: {
      id: 'mc-32',
      title: 'Blossom Architect',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Blossom Gorge',
        objective: 'Place and rotate the 6-Hex Blossom mega-cluster across the gorge.',
        targetTilesCount: 13,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 1, r: -1 },
          { q: 0, r: -1 },
          { q: -1, r: 0 },
          { q: -1, r: 1 },
          { q: 2, r: 0 },
          { q: -2, r: 1 },
          { q: 0, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Blossom Sun Ring',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }],
          },
        ],
        riverCoords: [{ q: -1, r: -1 }, { q: 0, r: -2 }, { q: 1, r: -2 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-blossom-multi', 'p-duo-emerald', 'p-quad-sapphire', 'p-duo-ruby']),
    targetScore: { star1: 1000, star2: 5000, star3: 6500 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 33: Rotary Delta Citadel (Dual Turntables + River Separator)
  // --------------------------------------------------------------------------
  {
    id: 33,
    name: 'Rotary Delta Citadel',
    subtitle: 'Mechanic: Dual Turntable Color Zone Realignments',
    description:
      'Two interconnected rotary turntables shift Amber and Ruby districts across a dividing river.',
    masteryChallenge: {
      id: 'mc-33',
      title: 'Citadel Master',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Delta Fortresses',
        objective: 'Synchronize both turntables to solve the dual riverbank color requirements.',
        targetTilesCount: 15,
        unlockedCoords: [
          { q: -2, r: 0 },
          { q: -1, r: 0 },
          { q: -1, r: 1 },
          { q: -2, r: 1 },
          { q: -1, r: -1 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 1, r: 1 },
          { q: 2, r: -1 },
          { q: 1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'West Hearth Hub',
            color: 'ruby',
            coords: [{ q: -2, r: 0 }, { q: -1, r: 0 }],
          },
          {
            name: 'East Sun Hub',
            color: 'amber',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-33-west',
            name: 'West Turntable',
            center: { q: -1, r: 0 },
            radius: 1,
          },
          {
            id: 'zone-33-east',
            name: 'East Turntable',
            center: { q: 1, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: -1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-ruby', 'p-triad-amber', 'p-duo-emerald', 'p-quad-sapphire']),
    targetScore: { star1: 1000, star2: 5200, star3: 6800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 34: Emerald Riverbank Enclave (High Density Grove with 3-Penalty Limit)
  // --------------------------------------------------------------------------
  {
    id: 34,
    name: 'Emerald Riverbank Enclave',
    subtitle: 'Mechanic: High-Density Ancient Canopy Reserve',
    description:
      'Deploy 5-Hex Pentad and 3-Hex Triad grove structures without violating the strict 3-penalty integrity limit.',
    masteryChallenge: {
      id: 'mc-34',
      title: 'Enclave Warden',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Canopy Enclave',
        objective: 'Establish the massive emerald canopy reserve alongside the tranquil river.',
        targetTilesCount: 14,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 1 },
          { q: -1, r: 2 },
          { q: -2, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Emerald Sanctuary',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 1, r: 1 }, { q: 0, r: 2 }, { q: -1, r: 2 }],
          },
        ],
        riverCoords: [{ q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-pentad-emerald', 'p-triad-emerald', 'p-duo-emerald', 'p-duo-amber']),
    targetScore: { star1: 1000, star2: 5400, star3: 7000 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 35: Sapphire Torrent Sanctum (Triple Rotary Nodes)
  // --------------------------------------------------------------------------
  {
    id: 35,
    name: 'Sapphire Torrent Sanctum',
    subtitle: 'Mechanic: Triple Rotary Waterwheels',
    description:
      'Three synchronized waterwheels route rushing sapphire currents into surrounding emerald groves.',
    masteryChallenge: {
      id: 'mc-35',
      title: 'Torrent Sovereign',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Torrent Hub',
        objective: 'Coordinate the triple rotary mechanisms across the river delta.',
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
          { q: 0, r: 2 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Torrent Well',
            color: 'sapphire',
            coords: [{ q: 0, r: 0 }, { q: -1, r: 0 }, { q: -2, r: 0 }],
          },
          {
            name: 'Verdant Bank',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-35-main',
            name: 'Torrent Waterwheel',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 1, r: 1 }, { q: 2, r: 1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-quad-sapphire', 'p-duo-sapphire', 'p-pentad-emerald', 'p-duo-amber']),
    targetScore: { star1: 1000, star2: 5600, star3: 7200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 36: Crimson Forge Causeway (Ruby Hearths + River Canyon)
  // --------------------------------------------------------------------------
  {
    id: 36,
    name: 'Crimson Forge Causeway',
    subtitle: 'Mechanic: Ruby Hearths & Magma River Canyon',
    description:
      'Build blacksmith forges along the magma river causeway, using Fog Hexes to safely bridge both rims.',
    masteryChallenge: {
      id: 'mc-36',
      title: 'Magma Master',
      description: 'Complete with at least 2000 points.',
      type: 'min_score',
      targetValue: 2000,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Causeway Rim',
        objective: 'Construct the forge causeway and project into the eastern fog.',
        targetTilesCount: 10,
        unlockedCoords: [
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: -1, r: 1 },
          { q: -2, r: 1 },
          { q: -1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'West Kiln',
            color: 'ruby',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
        ],
        riverCoords: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: -1 }],
        fogCoords: [{ q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: -1 }],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Full Forge Causeway',
        objective: 'Ignite both sides of the volcanic causeway.',
        targetTilesCount: 18,
        unlockedCoords: [
          { q: -1, r: 0 },
          { q: -2, r: 0 },
          { q: -1, r: 1 },
          { q: -2, r: 1 },
          { q: -1, r: -1 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 1, r: -1 },
          { q: 2, r: -1 },
          { q: 1, r: 1 },
        ],
        coloredZones: [
          {
            name: 'West Kiln',
            color: 'ruby',
            coords: [{ q: -1, r: 0 }, { q: -2, r: 0 }],
          },
          {
            name: 'East Forge',
            color: 'ruby',
            coords: [{ q: 1, r: 0 }, { q: 2, r: 0 }],
          },
        ],
        riverCoords: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: -1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-ruby', 'p-house-ruby', 'p-triad-amber', 'p-duo-emerald']),
    targetScore: { star1: 1000, star2: 5800, star3: 7400 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 37: Grand Blossom Archipelago (Blossom Mega-Cluster across Canyons)
  // --------------------------------------------------------------------------
  {
    id: 37,
    name: 'Grand Blossom Archipelago',
    subtitle: 'Mechanic: 6-Hex Blossom Cluster & Fog Navigation',
    description:
      'Wield the mighty 6-Hex Blossom mega-cluster across deep misty river channels.',
    masteryChallenge: {
      id: 'mc-37',
      title: 'Blossom Sovereign',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Blossom Peninsula',
        objective: 'Rotate and plant the 6-Hex Blossom cluster to connect all archipelago channels.',
        targetTilesCount: 16,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 1, r: -1 },
          { q: 0, r: -1 },
          { q: -1, r: 0 },
          { q: -1, r: 1 },
          { q: 2, r: 0 },
          { q: 0, r: 2 },
          { q: -2, r: 1 },
          { q: -2, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Imperial Blossom Ring',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }],
          },
        ],
        riverCoords: [{ q: 0, r: 1 }, { q: 2, r: -1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-blossom-multi', 'p-pentad-emerald', 'p-quad-sapphire', 'p-duo-ruby']),
    targetScore: { star1: 1000, star2: 6000, star3: 7600 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 38: Dual River Sluice Matrix (Two Intersecting Rivers + Dual Turntables)
  // --------------------------------------------------------------------------
  {
    id: 38,
    name: 'Dual River Sluice Matrix',
    subtitle: 'Mechanics: Cross-River Waterways & Dual Dynamic Hubs',
    description:
      'Manage settlement expansion across an X-crossing river matrix controlled by two rotary turntable gears.',
    masteryChallenge: {
      id: 'mc-38',
      title: 'Matrix Engineer',
      description: 'Complete with at least 1800 points.',
      type: 'min_score',
      targetValue: 1800,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Matrix Hubs',
        objective: 'Rotate both gear nodes to align Amber, Emerald, and Sapphire districts.',
        targetTilesCount: 18,
        unlockedCoords: [
          { q: -2, r: 0 },
          { q: -1, r: 0 },
          { q: -1, r: -1 },
          { q: -2, r: 1 },
          { q: 2, r: 0 },
          { q: 1, r: 0 },
          { q: 1, r: 1 },
          { q: 2, r: -1 },
          { q: 0, r: 2 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'West Sluice',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -1, r: 0 }],
          },
          {
            name: 'East Sun Matrix',
            color: 'amber',
            coords: [{ q: 2, r: 0 }, { q: 1, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-38-left',
            name: 'West Matrix Gear',
            center: { q: -1, r: 0 },
            radius: 1,
          },
          {
            id: 'zone-38-right',
            name: 'East Matrix Gear',
            center: { q: 1, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: -1 }],
      },
    ],
    availablePieces: getPieces(['p-house-gray', 'p-triad-amber', 'p-quad-sapphire', 'p-duo-emerald', 'p-duo-ruby']),
    targetScore: { star1: 1000, star2: 6200, star3: 7800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 39: Titan's Legacy Peninsula (4-Phase Expansion with Fog & River)
  // --------------------------------------------------------------------------
  {
    id: 39,
    name: "Titan's Legacy Peninsula",
    subtitle: 'Mechanics: 4-Phase Epic Expansion & River Divide',
    description:
      'The sacred grounds of the defeated titan: A massive 4-phase peninsula requiring all 4 color masteries.',
    masteryChallenge: {
      id: 'mc-39',
      title: 'Legacy Sovereign',
      description: 'Complete all 4 phases with at least 2200 points.',
      type: 'min_score',
      targetValue: 2200,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Peninsula Gateway',
        objective: 'Establish the gateway and project into northern fog.',
        targetTilesCount: 8,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Gateway Sun',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
        ],
        riverCoords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
        fogCoords: [{ q: 0, r: 1 }, { q: 1, r: 1 }, { q: -1, r: 1 }],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Grove District',
        objective: 'Expand into the revealed emerald grove.',
        targetTilesCount: 14,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: 0, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Gateway Sun',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Peninsula Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
        ],
        riverCoords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Aquifer Flank',
        objective: 'Construct the sapphire hydro sluices.',
        targetTilesCount: 19,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: 0, r: 2 },
          { q: 2, r: 0 },
          { q: 2, r: -1 },
          { q: 1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Gateway Sun',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Peninsula Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
          {
            name: 'River Aquifer',
            color: 'sapphire',
            coords: [{ q: 2, r: 0 }, { q: 2, r: -1 }],
          },
        ],
        riverCoords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: Sovereign Kilns',
        objective: 'Complete the quad-color citadel with the Ruby forge kiln.',
        targetTilesCount: 24,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 0, r: 1 },
          { q: 1, r: 1 },
          { q: -1, r: 1 },
          { q: 0, r: 2 },
          { q: 2, r: 0 },
          { q: 2, r: -1 },
          { q: 1, r: -1 },
          { q: 0, r: -2 },
          { q: -1, r: -1 },
        ],
        coloredZones: [
          {
            name: 'Gateway Sun',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Peninsula Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 0, r: 2 }],
          },
          {
            name: 'River Aquifer',
            color: 'sapphire',
            coords: [{ q: 2, r: 0 }, { q: 2, r: -1 }],
          },
          {
            name: 'Hearth Spire',
            color: 'ruby',
            coords: [{ q: 0, r: -2 }, { q: -1, r: -1 }],
          },
        ],
        riverCoords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
      },
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-gray',
      'p-triad-amber',
      'p-pentad-emerald',
      'p-quad-sapphire',
      'p-duo-ruby',
    ]),
    targetScore: { star1: 1000, star2: 6500, star3: 8200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 40: THE ETERNAL SOVEREIGN EMPIRE (Ultimate Campaign Climax)
  // --------------------------------------------------------------------------
  {
    id: 40,
    name: 'The Eternal Sovereign Empire',
    subtitle: 'Campaign Finale: The Sovereign Master Metropolis',
    description:
      'The definitive frontier masterpiece: 4-Phase expansion, Blossom mega-clusters, Fog predictions, dividing rivers, dynamic rotary color hubs, and the ultimate 7000+ points Mastery Challenge!',
    masteryChallenge: {
      id: 'mc-40',
      title: 'Eternal Grand Emperor',
      description: 'Conquer the Sovereign Empire with at least 2500 points!',
      type: 'min_score',
      targetValue: 2500,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Imperial Core & Turntable',
        objective: 'Build the grand blossom ring on the central turntable.',
        targetTilesCount: 8,
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
            name: 'Imperial Sun Plaza',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-40-core',
            name: 'Imperial Sovereign Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 2, r: 0 }, { q: 2, r: -1 }],
        fogCoords: [{ q: -2, r: 0 }, { q: -2, r: 1 }, { q: 0, r: 2 }],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Emerald Sanctuary',
        objective: 'Expand across the revealed western grove terraces.',
        targetTilesCount: 16,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
        ],
        coloredZones: [
          {
            name: 'Imperial Sun Plaza',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Grove Sanctuary',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-40-core',
            name: 'Imperial Sovereign Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 2, r: 0 }, { q: 2, r: -1 }],
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Sapphire Aqueducts',
        objective: 'Route the crystal sapphire aqueducts into the capital.',
        targetTilesCount: 22,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -1, r: -1 },
          { q: -2, r: -1 },
          { q: 0, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Imperial Sun Plaza',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Grove Sanctuary',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
          {
            name: 'Sapphire Aqueducts',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-40-core',
            name: 'Imperial Sovereign Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 2, r: 0 }, { q: 2, r: -1 }],
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: The Grand Metropolis Sovereign',
        objective: 'Ignite the Ruby hearths to complete the ultimate eternal empire!',
        targetTilesCount: 28,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 0, r: 1 },
          { q: -1, r: 1 },
          { q: -1, r: 0 },
          { q: 0, r: -1 },
          { q: 1, r: -1 },
          { q: -2, r: 0 },
          { q: -2, r: 1 },
          { q: 0, r: 2 },
          { q: -1, r: 2 },
          { q: -1, r: -1 },
          { q: -2, r: -1 },
          { q: 0, r: -2 },
          { q: 1, r: -2 },
          { q: -1, r: -2 },
        ],
        coloredZones: [
          {
            name: 'Imperial Sun Plaza',
            color: 'amber',
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
          },
          {
            name: 'Grove Sanctuary',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
          },
          {
            name: 'Sapphire Aqueducts',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
          },
          {
            name: 'Ruby Sovereign Kiln',
            color: 'ruby',
            coords: [{ q: 0, r: -2 }, { q: 1, r: -2 }],
          },
        ],
        rotationZones: [
          {
            id: 'zone-40-core',
            name: 'Imperial Sovereign Gear',
            center: { q: 0, r: 0 },
            radius: 1,
          },
        ],
        riverCoords: [{ q: 2, r: 0 }, { q: 2, r: -1 }],
      },
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-gray',
      'p-blossom-multi',
      'p-triad-amber',
      'p-pentad-emerald',
      'p-quad-sapphire',
      'p-duo-ruby',
      'p-house-ruby',
    ]),
    targetScore: { star1: 1000, star2: 6800, star3: 8800 },
  },
];
