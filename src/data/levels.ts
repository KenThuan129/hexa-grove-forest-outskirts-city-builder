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
    roadArms: 3,
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
    roadArms: 3,
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
    roadArms: 3,
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
    roadArms: 3,
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
    roadArms: 3,
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
    roadArms: 3,
  },

  // ==================== JUNCTIONS & ROUNDABOUTS ====================
  {
    id: 'p-junction-3way',
    type: 'road',
    color: 'neutral',
    name: 'Three-Way T-Junction',
    description: 'A 3-way highway intersection hub. Constraint: Requires at least 3 connecting adjacent roads!',
    bonusesDescription: 'Junction Hub: Connects 3 road arteries with center junction marker.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'road' }],
    roadArms: 3,
    lightbulbCost: 2,
  },
  {
    id: 'p-junction-4way',
    type: 'road',
    color: 'neutral',
    name: 'Four-Way Crossroads',
    description: 'A 4-way crossroad interchange. Constraint: Requires at least 4 connecting adjacent roads!',
    bonusesDescription: 'Crossroads Hub: Connects 4 road arteries with center crossroads marker.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'road' }],
    roadArms: 4,
    lightbulbCost: 3,
  },
  {
    id: 'p-junction-roundabout',
    type: 'road',
    color: 'neutral',
    name: 'Grand Roundabout',
    description: 'A high-throughput circular roundabout hub. Constraint: Requires at least 5 connecting adjacent roads!',
    bonusesDescription: 'Roundabout Hub: Unites 5 road arteries around a central circular traffic island.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'road' }],
    roadArms: 5,
    lightbulbCost: 4,
  },

  // ==================== BRIDGES (Gimmick 2) ====================
  {
    id: 'p-bridge-single',
    type: 'bridge',
    color: 'neutral',
    name: 'Arched Cable-Stayed Bridge',
    description: 'An elegant arched cable-stayed bridge spanning across waterways with steep curving deck approaches, dual portal pylons, and stay cables.',
    bonusesDescription: 'Arched Bridge: Steep curving deck over river channels. Safe from off-map and river penalties.',
    clusterType: 'single',
    clusterShape: [{ q: 0, r: 0, type: 'bridge' }],
  },
  {
    id: 'p-bridge-duo',
    type: 'bridge',
    color: 'neutral',
    name: 'Twin Arched Cable Bridge',
    description: 'Two-hex connected arched cable-stayed bridges spanning wide river delta channels.',
    bonusesDescription: '2-Hex Arched Bridge. High clearance over rivers.',
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
  // LEVEL 1: "Placing Your First Tile"
  // Onboarding tutorial — UI heavily restricted. Only tray + board + final
  // Complete button are visible. Auto-advances between phases.
  // --------------------------------------------------------------------------
  {
    id: 1,
    name: 'Placing Your First Tile',
    subtitle: 'Tutorial: Select and place a tile on a glowing cell.',
    description:
      'Every tile needs a home. Click a tile from your tray, then click the glowing cell on the board to place it.',
    uiConfig: {
      hideLeftSidebar: true,
      hideRightSidebar: true,
      hidePenalties: true,
      hideScore: true,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Place a Tile',
        objective: 'Place the Amber tile on the glowing Amber cell.',
        targetTilesCount: 1,
        unlockedCoords: [{ q: 0, r: 0 }],
        coloredZones: [
          {
            name: 'Amber Cell',
            color: 'amber',
            coords: [{ q: 0, r: 0 }],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Match the Colors',
        objective:
          'Each colored cell accepts only its matching color. The gray center accepts any tile.',
        targetTilesCount: 5,
        unlockedCoords: [
          { q: 0, r: 0 },   // neutral center
          { q: 1, r: 0 },   // amber
          { q: 0, r: 1 },   // emerald
          { q: -1, r: 1 },  // sapphire
          { q: -1, r: 0 },  // ruby
        ],
        coloredZones: [
          {
            name: 'Amber',
            color: 'amber',
            coords: [{ q: 1, r: 0 }],
          },
          {
            name: 'Emerald',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }],
          },
          {
            name: 'Sapphire',
            color: 'sapphire',
            coords: [{ q: -1, r: 1 }],
          },
          {
            name: 'Ruby',
            color: 'ruby',
            coords: [{ q: -1, r: 0 }],
          },
          // Neutral center is NOT a colored zone. But we still want it
          // filled for the tutorial. Adding it as a "neutral" zone so
          // the game counts it toward completion.
          // Wait — app logic uses coloredZones.every with color match.
          // Neutral zone with color 'neutral' matches any tile? Let me
          // check App's coloredZones completion logic... it requires
          // topTile.color === zone.color. So a 'neutral' zone would
          // only match neutral tiles. That's actually fine: user must
          // place a neutral tile on center.
          {
            name: 'Neutral Center',
            color: 'neutral',
            coords: [{ q: 0, r: 0 }],
          },
        ],
      },
    ],
    availablePieces: [
      {
        id: 'p-tutorial-single-neutral',
        type: 'house',
        color: 'neutral',
        name: 'Timber Cottage',
        description: 'Neutral tile — fits any gray cell.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'house' }],
        lightbulbCost: 1,
      },
      {
        id: 'p-tutorial-single-amber',
        type: 'house',
        color: 'amber',
        name: 'Sunlit Cottage',
        description: 'Amber tile — matches Amber cells.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'house' }],
        lightbulbCost: 1,
      },
      {
        id: 'p-tutorial-single-emerald',
        type: 'trees',
        color: 'emerald',
        name: 'Emerald Grove',
        description: 'Emerald tile — matches Emerald cells.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'trees' }],
        lightbulbCost: 1,
      },
      {
        id: 'p-tutorial-single-sapphire',
        type: 'house',
        color: 'sapphire',
        name: 'Aquifer Lodge',
        description: 'Sapphire tile — matches Sapphire cells.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'house' }],
        lightbulbCost: 1,
      },
      {
        id: 'p-tutorial-single-ruby',
        type: 'house',
        color: 'ruby',
        name: 'Terracotta Hearth',
        description: 'Ruby tile — matches Ruby cells.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'house' }],
        lightbulbCost: 1,
      },
    ],
    targetScore: { star1: 100, star2: 200, star3: 300 },
    lightbulbBudget: 5,
  },

  // --------------------------------------------------------------------------
  // LEVEL 2: "Rotate & Budget"
  // Onboarding tutorial — teaches drag-drop, cluster rotation, and the
  // "undo" pattern via right-click / cancel. The board is intentionally
  // shaped so the player MUST rotate the duo before placing it.
  // --------------------------------------------------------------------------
  {
    id: 2,
    name: 'Rotate & Budget',
    subtitle: 'Tutorial: Drag a duo cluster, rotate it, and watch your budget.',
    description:
      'Clusters are multi-hex pieces. You can rotate them before placing. Watch your Lightbulb budget — placing a bigger cluster costs more.',
    uiConfig: {
      hideLeftSidebar: true,
      hideRightSidebar: true,
      hidePenalties: true,
      hideScore: true,
    },
    phases: [
      {
        phaseNumber: 1,
        title: 'Place a Duo',
        objective: 'Drag the Emerald Duo onto the two glowing Emerald cells.',
        targetTilesCount: 2,
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Emerald Duo',
            color: 'emerald',
            coords: [
              { q: 0, r: 0 },
              { q: 1, r: 0 },
            ],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Rotate, Undo, and Reconsider',
        objective: 'The duo no longer fits. Rotate it, place it, then undo and try single tiles instead.',
        targetTilesCount: 3, // 3 ô cần đặt
        unlockedCoords: [
          { q: 0, r: 0 },
          { q: 0, r: 1 },
          { q: 0, r: 2 }, // 3 ô dọc
        ],
        coloredZones: [
          {
            name: 'Emerald Vertical',
            color: 'emerald',
            coords: [
              { q: 0, r: 0 },
              { q: 0, r: 1 },
              { q: 0, r: 2 }, // 3 ô dọc
            ],
          },
        ],
      },
    ],
    availablePieces: [
      {
        id: 'p-tutorial-duo-emerald',
        type: 'mixed',
        color: 'emerald',
        name: 'Emerald Duo',
        description: 'A 2-hex Emerald cluster. Rotate it before placing.',
        clusterType: 'duo',
        clusterShape: [
          { q: 0, r: 0, type: 'trees' },
          { q: 1, r: 0, type: 'mixed' },
        ],
        lightbulbCost: 2,
      },
      {
        id: 'p-tutorial-single-emerald',
        type: 'trees',
        color: 'emerald',
        name: 'Emerald Grove',
        description: 'Single Emerald tile.',
        clusterType: 'single',
        clusterShape: [{ q: 0, r: 0, type: 'trees' }],
        lightbulbCost: 1,
      },
    ],
    targetScore: { star1: 200, star2: 400, star3: 600 },
    lightbulbBudget: 3, // duo = 2, or 2 singles = 2, buffer for undo/retry
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
              { q: -1, r: 0 },
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
  // LEVEL 10: "Citadel of the Pioneers" (Now: Challenge Precursor)
  // --------------------------------------------------------------------------
  {
    id: 10,
    name: "The Trade-off Citadel",
    subtitle: "Mechanic: Zone Modifiers & Trade-offs",
    description: "Inspect the 4 islands! Filling certain colored zones will grant powerful buffs but at a cost. Plan your resources wisely.",
    lightbulbBudget: 45,
    phases: [
      {
        phaseNumber: 1,
        title: 'The Divided Citadel',
        objective: 'Fill the colored zones across the 4 islands. Pay attention to the trade-offs!',
        targetTilesCount: 15, // Tổng số ô
        unlockedCoords: [
          // Đảo 1 (Top Left - Amber): 4 ô xếp hình vuông
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: -2, r: 1 }, { q: -1, r: 1 },

          // Đảo 2 (Top Right - Ruby): 4 ô xếp hình vuông
          { q: 1, r: -2 }, { q: 2, r: -2 }, { q: 1, r: -1 }, { q: 2, r: -1 },

          // Đảo 3 (Bottom Left - Sapphire): 3 ô xếp hình chữ L
          { q: -2, r: 2 }, { q: -1, r: 2 }, { q: -2, r: 3 },

          // Đảo 4 (Bottom Right - Emerald): 4 ô xếp hình vuông
          { q: 1, r: 1 }, { q: 2, r: 1 }, { q: 1, r: 2 }, { q: 2, r: 2 },
        ],
        // 3 cây cầu hình tam giác ở giữa (Pre-placed)
        prePlacedRoads: [
          { pieceId: 'p-bridge-single', q: 0, r: 0 },
          { pieceId: 'p-bridge-single', q: 0, r: -1 },
          { pieceId: 'p-bridge-single', q: -1, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Amber Crucible',
            color: 'amber',
            coords: [{ q: -2, r: 0 }, { q: -1, r: 0 }, { q: -2, r: 1 }, { q: -1, r: 1 }],
            zoneModifier: { type: 'add_lightbulb_pct', value: 20 },
          },
          {
            name: 'Ruby Forge',
            color: 'ruby',
            coords: [{ q: 1, r: -2 }, { q: 2, r: -2 }, { q: 1, r: -1 }, { q: 2, r: -1 }], // Đã sửa thành 4 ô
            zoneModifier: { type: 'ruby_tradeoff', value: 6 }, // Dùng type mới
          },
          {
            name: 'Sapphire Spring',
            color: 'sapphire',
            coords: [{ q: -2, r: 2 }, { q: -1, r: 2 }, { q: -2, r: 3 }],
            // Không có modifier
          },
          {
            name: 'Emerald Grove',
            color: 'emerald',
            coords: [{ q: 1, r: 1 }, { q: 2, r: 1 }, { q: 1, r: 2 }, { q: 2, r: 2 }],
            zoneModifier: { type: 'add_leaves', value: 100 },
          }
        ],
      }
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-amber', 'p-triad-amber', 'p-house-amber',
      'p-duo-ruby', 'p-triad-ruby', 'p-quad-ruby',
      'p-duo-sapphire', 'p-house-sapphire',
      'p-duo-emerald', 'p-triad-emerald', 'p-quad-emerald'
    ]),
    targetScore: { star1: 500, star2: 1000, star3: 1500 },
    isBossLevel: false,
  },

  // --------------------------------------------------------------------------
  // LEVEL 11: The Rotary Tollway (Trade-off: Budget vs Bypass)
  // --------------------------------------------------------------------------
  {
    id: 11,
    name: "The Rotary Tollway",
    subtitle: "Mechanic: Trade-off - Budget vs Bypass",
    description: "A massive rotating tollway dominates the center. Choose wisely: Amber gives you budget, but Ruby takes it away for powerful Overlap passes.",
    lightbulbBudget: 25, // Budget cơ bản khá thấp
    phases: [
      {
        phaseNumber: 1,
        title: 'The Central Hub',
        objective: 'Fill the Amber and Ruby zones on the tollway.',
        targetTilesCount: 10,
        unlockedCoords: [
          // Vòng trong (Turntable)
          { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 },
          { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          // Vòng ngoài
          { q: 2, r: 0 }, { q: 0, r: 2 }, { q: -2, r: 2 }, { q: -2, r: 0 }, { q: 0, r: -2 }, { q: 2, r: -2 },
        ],
        // Đường bị khóa (Pre-placed) bắt buộc user phải xoay
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: 0, r: 0 },
        ],
        rotationZones: [
          { id: 'zone-11-core', name: 'Rotary Core', center: { q: 0, r: 0 }, radius: 1 },
        ],
        coloredZones: [
          {
            name: 'Amber Boost',
            color: 'amber',
            coords: [{ q: 0, r: 2 }, { q: -2, r: 2 }, { q: -2, r: 0 }],
            zoneModifier: { type: 'add_lightbulb_pct', value: 20 },
          },
          {
            name: 'Ruby Toll',
            color: 'ruby',
            coords: [{ q: 2, r: 0 }, { q: 0, r: -2 }, { q: 2, r: -2 }],
            zoneModifier: { type: 'ruby_tradeoff', value: 3 }, // Mất 15% budget, +3 Overlap/Disconnect
          }
        ],
      }
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-amber', 'p-duo-ruby', 'p-triad-amber', 'p-triad-ruby']),
    targetScore: { star1: 600, star2: 1200, star3: 1800 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 12: The Bloodwood Canopy (Trade-off: Leaves vs Power)
  // --------------------------------------------------------------------------
  {
    id: 12,
    name: "The Bloodwood Canopy",
    subtitle: "Mechanic: Spend Leaves for Bypasses",
    description: "The forest demands a sacrifice. Fill the Emerald zone to gain Leaves, but spending the Ruby zone will consume your Leaves for massive Bypass power.",
    lightbulbBudget: 35,
    phases: [
      {
        phaseNumber: 1,
        title: 'The Canopy Floor',
        objective: 'Balance your Leaves and Bypasses.',
        targetTilesCount: 12,
        unlockedCoords: [
          { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 0, r: 1 }, { q: 1, r: 1 },
          { q: -1, r: 1 }, { q: -2, r: 1 }, { q: -2, r: 2 }, { q: -1, r: 2 }, { q: 0, r: 2 },
        ],
        // Đường bị khóa chia cắt map
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 1, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Emerald Grove',
            color: 'emerald',
            coords: [{ q: 0, r: 1 }, { q: 1, r: 1 }, { q: 0, r: 2 }],
            zoneModifier: { type: 'add_leaves', value: 150 },
          },
          {
            name: 'Bloodwood Forge',
            color: 'ruby',
            coords: [{ q: -1, r: 1 }, { q: -2, r: 1 }, { q: -1, r: 2 }],
            zoneModifier: { type: 'leaves_for_bypass', value: 50 }, // Tốn 50 Leaves để được 4 Bypass
          }
        ],
      }
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-emerald', 'p-duo-ruby', 'p-triad-emerald', 'p-triad-ruby']),
    targetScore: { star1: 800, star2: 1500, star3: 2200 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 13: The Broken Aqueduct (Trade-off: Unlock new land)
  // --------------------------------------------------------------------------
  {
    id: 13,
    name: "The Broken Aqueduct",
    subtitle: "Mechanic: Unlock the Hidden Isles",
    description: "The Sapphire zone is cut off. You must fill the Amber zone to repair the ancient viaducts and gain access to the inner sanctum.",
    lightbulbBudget: 30,
    phases: [
      {
        phaseNumber: 1,
        title: 'The Outer Rim',
        objective: 'Fill the Amber zone to unlock the inner isle.',
        targetTilesCount: 15,
        unlockedCoords: [
          // Vành đai ngoài
          { q: 2, r: 0 }, { q: 3, r: 0 }, { q: 1, r: 1 }, { q: 2, r: 1 }, 
          { q: 0, r: 2 }, { q: 1, r: 2 }, { q: -1, r: 2 }, { q: 0, r: 3 },
          // Đảo trong (sẽ được unlock)
          { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
          // Ô Sapphire thứ 3 (nằm ngay giữa 3 cây cầu)
          { q: 0, r: 0 }, // Sẽ được merge với ô trên
        ],
        prePlacedRoads: [
          // 3 cây cầu nối vành đai với đảo trong (giữ nguyên)
          { pieceId: 'p-bridge-single', q: 1, r: 0 },
          { pieceId: 'p-bridge-single', q: 0, r: 1 },
          { pieceId: 'p-bridge-single', q: -1, r: 1 },
        ],
        coloredZones: [
          {
            name: 'Amber Repairs',
            color: 'amber',
            coords: [{ q: 2, r: 0 }, { q: 3, r: 0 }, { q: 1, r: 1 }, { q: 2, r: 1 }],
            zoneModifier: { type: 'unlock_pieces', value: 0 },
          },
          {
            name: 'Sapphire Sanctum',
            color: 'sapphire',
            // Đưa 3 ô Sapphire vào giữa các cây cầu
            coords: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }],
          }
        ],
      }
    ],
    availablePieces: getPieces(['p-house-gray', 'p-duo-amber', 'p-quad-amber', 'p-duo-sapphire', 'p-triad-sapphire']),
    targetScore: { star1: 1000, star2: 1800, star3: 2500 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 14: The Gravity Well (High Risk / High Reward)
  // --------------------------------------------------------------------------
  {
    id: 14,
    name: "The Gravity Well",
    subtitle: "Mechanic: Heavy Penalties vs Ultimate Power",
    description: "The Ruby core grants immense power but at a terrible cost. You can only win if you have enough Bypasses to survive the Overlap penalty.",
    lightbulbBudget: 40,
    phases: [
      {
        phaseNumber: 1,
        title: 'The Singularity',
        objective: 'Fill the Ruby core and survive the penalty.',
        targetTilesCount: 12,
        unlockedCoords: [
          { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -1, r: 0 }, { q: -2, r: 0 }, { q: -2, r: 1 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
          { q: 2, r: -1 }, { q: -1, r: 2 }, { q: 0, r: 2 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-junction-roundabout', q: 0, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Ruby Singularity',
            color: 'ruby',
            coords: [{ q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: -1, r: 2 }, { q: 0, r: 2 }],
            zoneModifier: { type: 'ruby_tradeoff', value: 2 }, // Phạt nhẹ, nhưng cho 2 bypass
          },
          {
            name: 'Amber Heavy Core',
            color: 'amber',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }],
            zoneModifier: { type: 'reduce_lightbulb_pct', value: 5 }, // Mất 5% budget
          }
        ],
      }
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-amber', 'p-triad-amber',
      'p-duo-ruby', 'p-triad-ruby', 'p-quad-ruby', // Bổ sung đủ Ruby
      'p-duo-emerald', 'p-duo-sapphire'
    ]),
    targetScore: { star1: 1200, star2: 2000, star3: 3000 },
  },

  // --------------------------------------------------------------------------
  // LEVEL 15: The Grand Bazaar (Trade-off Mastery)
  // --------------------------------------------------------------------------
  {
    id: 15,
    name: "The Grand Bazaar",
    subtitle: "Mechanic: Master of Trade-offs",
    description: "Four factions, four prices. Balance Budget, Leaves, and Bypasses to complete the ultimate trading hub.",
    lightbulbBudget: 50,
    phases: [
      {
        phaseNumber: 1,
        title: 'The Crossroads',
        objective: 'The ultimate test of resource management.',
        targetTilesCount: 16,
        unlockedCoords: [
          // Đảo Bắc
          { q: 0, r: -2 }, { q: 1, r: -2 }, { q: -1, r: -1 }, { q: 0, r: -1 },
          // Đảo Đông
          { q: 2, r: 0 }, { q: 2, r: 1 }, { q: 1, r: 0 }, { q: 1, r: 1 },
          // Đảo Nam
          { q: 0, r: 2 }, { q: -1, r: 2 }, { q: 1, r: 2 }, { q: 0, r: 3 },
          // Đảo Tây
          { q: -2, r: 0 }, { q: -2, r: 1 }, { q: -1, r: 0 }, { q: -1, r: 1 },
        ],
        prePlacedRoads: [
          { pieceId: 'p-bridge-single', q: 0, r: 0 },
        ],
        coloredZones: [
          {
            name: 'Northern Amber',
            color: 'amber',
            coords: [{ q: 0, r: -2 }, { q: 1, r: -2 }, { q: -1, r: -1 }, { q: 0, r: -1 }],
            zoneModifier: { type: 'add_lightbulb_pct', value: 25 },
          },
          {
            name: 'Eastern Ruby',
            color: 'ruby',
            coords: [{ q: 2, r: 0 }, { q: 2, r: 1 }, { q: 1, r: 0 }, { q: 1, r: 1 }],
            zoneModifier: { type: 'ruby_tradeoff', value: 4 },
          },
          {
            name: 'Southern Emerald',
            color: 'emerald',
            coords: [{ q: 0, r: 2 }, { q: -1, r: 2 }, { q: 1, r: 2 }, { q: 0, r: 3 }],
            zoneModifier: { type: 'add_leaves', value: 200 },
          },
          {
            name: 'Western Sapphire',
            color: 'sapphire',
            coords: [{ q: -2, r: 0 }, { q: -2, r: 1 }, { q: -1, r: 0 }, { q: -1, r: 1 }],
          }
        ],
      }
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-amber', 'p-triad-amber', 'p-quad-amber',
      'p-duo-ruby', 'p-triad-ruby', 'p-quad-ruby',
      'p-duo-emerald', 'p-triad-emerald', 'p-quad-emerald',
      'p-duo-sapphire', 'p-triad-sapphire'
    ]),
    targetScore: { star1: 1500, star2: 2500, star3: 3500 },
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
      'p-junction-3way',
      'p-junction-4way',
      'p-junction-roundabout',
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
    availablePieces: getPieces(['p-house-gray', 'p-duo-amber', 'p-house-amber', 'p-blossom-multi', 'p-duo-emerald', 'p-duo-sapphire']),
    targetScore: { star1: 3200, star2: 3500, star3: 4100 },
    lightbulbBudget: 8,
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
    targetScore: { star1: 3400, star2: 3600, star3: 4000 },
    lightbulbBudget: 25,
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
    targetScore: { star1: 3800, star2: 5400, star3: 6400 },
    lightbulbBudget: 20,
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
    lightbulbBudget: 17,
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
        "phaseNumber": 1,
        "title": "Phase 1: Mistveil Camp",
        "objective": "Establish base camp and forecast phase 2 using the eastern Fog Hexes.",
        "targetTilesCount": 7,
        "unlockedCoords": [
          {
            "q": 1,
            "r": -1
          },
          {
            "q": -1,
            "r": 1
          },
          {
            "q": -1,
            "r": -1
          },
          {
            "q": 1,
            "r": 1
          }
        ],
        "coloredZones": [
          {
            "name": "Sunlit Clearing",
            "color": "amber",
            "coords": [
              {
                "q": 1,
                "r": -1
              },
              {
                "q": -1,
                "r": 1
              },
              {
                "q": -1,
                "r": -1
              },
              {
                "q": 1,
                "r": 1
              }
            ]
          }
        ],
        "fogCoords": [
          {
            "q": 0,
            "r": -1
          },
          {
            "q": -1,
            "r": 0
          },
          {
            "q": 0,
            "r": 1
          },
          {
            "q": 1,
            "r": 0
          }
        ],
        "riverCoords": [],
        "rotationZones": []
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
    availablePieces: getPieces(['p-house-amber', 'p-duo-amber', 'p-duo-emerald']),
    targetScore: { star1: 1000, star2: 3200, star3: 4500 },
    lightbulbBudget: 12,
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
          { q: 0, r: 1 }
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
        riverCoords: [{ q: 0, r: -1 }, { q: 0, r: 0 },],
      },
    ],
    availablePieces: getPieces([
      'p-house-gray',
      'p-duo-gray',
      'p-duo-sapphire',
      'p-quad-sapphire',
      'p-triad-amber',
    ]),
    targetScore: { star1: 1000, star2: 3400, star3: 4800 },
    lightbulbBudget: 45,
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
          { q: 0, r: 0 },
          { q: -1, r: 1 },
          { q: -2, r: 1 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
          { q: 1, r: -1 },
          { q: 0, r: -1 },
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
          { q: 0, r: 1 },
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
    lightbulbBudget: 10,
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
  // LEVEL 25: THE GRAND TYCOON EXCHANGE (BUSINESS BATTLE)
  // --------------------------------------------------------------------------
  {
    id: 25,
    name: 'The Grand Tycoon Exchange',
    subtitle: 'BUSINESS BATTLE: Rival Commercial Showdown',
    description:
      'Engage Rival Tycoon Sterling Vance in a high-stakes Revenue Showdown! Inspect colored zones without picking up pieces to boost Popularity, Ambience, and Bonus Slots, then dominate the market revenue!',
    isBossLevel: true,
    lightbulbBudget: 75,
    bossName: 'Tycoon Sterling Vance',
    bossPopularity: 180,
    bossAmbience: 170,
    bossMaxHp: 5000,
    masteryChallenge: {
      id: 'mc-25',
      title: 'Commercial Hegemony',
      description: 'Win the Business Showdown and finish with at least 2500 points!',
      type: 'min_score',
      targetValue: 2500,
    },
    "phases": [
      {
        "phaseNumber": 1,
        "title": "Commercial Phase 1: Market Foundation",
        "objective": "Inspect the Golden Promenade to boost Popularity, then secure the commercial core.",
        "targetTilesCount": 6,
        "unlockedCoords": [
          {
            "q": 0,
            "r": 0
          },
          {
            "q": 1,
            "r": 0
          },
          {
            "q": -1,
            "r": 0
          },
          {
            "q": 0,
            "r": -1
          },
          {
            "q": 1,
            "r": -1
          },
          {
            "q": -1,
            "r": 1
          },
          {
            "q": 2,
            "r": 0
          },
          {
            "q": 3,
            "r": -1
          },
          {
            "q": 2,
            "r": -1
          },
          {
            "q": 3,
            "r": 0
          },
          {
            "q": 2,
            "r": 1
          },
          {
            "q": -1,
            "r": 2
          },
          {
            "q": -2,
            "r": 2
          },
          {
            "q": -3,
            "r": 2
          },
          {
            "q": -1,
            "r": -1
          },
          {
            "q": 1,
            "r": 1
          },
          {
            "q": 0,
            "r": 1
          },
          {
            "q": -2,
            "r": -1
          },
          {
            "q": -3,
            "r": 0
          },
          {
            "q": -3,
            "r": 1
          },
          {
            "q": -2,
            "r": 1
          },
          {
            "q": -2,
            "r": 0
          },
          {
            "q": 0,
            "r": -2
          },
          {
            "q": 1,
            "r": -2
          },
          {
            "q": 2,
            "r": -2
          }
        ],
        "coloredZones": [
          {
            "name": "Golden Promenade (Amber)",
            "color": "amber",
            "coords": [
              {
                "q": 0,
                "r": 0
              },
              {
                "q": 1,
                "r": 0
              },
              {
                "q": 1,
                "r": 1
              },
              {
                "q": 0,
                "r": 1
              }
            ]
          },
          {
            "name": "RUBY Zone",
            "color": "ruby",
            "coords": [
              {
                "q": -2,
                "r": -1
              },
              {
                "q": -3,
                "r": 0
              },
              {
                "q": -3,
                "r": 1
              },
              {
                "q": -2,
                "r": 1
              },
              {
                "q": -2,
                "r": 0
              }
            ],
            "bossZoneType": "power"
          },
          {
            "name": "SAPPHIRE Zone",
            "color": "sapphire",
            "coords": [
              {
                "q": 0,
                "r": -2
              },
              {
                "q": 1,
                "r": -2
              },
              {
                "q": 2,
                "r": -2
              }
            ],
            "bossZoneType": "defend"
          }
        ],
        "riverCoords": [
          {
            "q": 0,
            "r": 2
          },
          {
            "q": 1,
            "r": 2
          }
        ],
        "fogCoords": [],
        "rotationZones": []
      }
    ],

    availablePieces: [
      { ...PIECE_PALETTE.find(p => p.id === 'p-blossom-multi')!, stock: 2 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-triad-amber')!, stock: 3 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-pentad-emerald')!, stock: 2 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-quad-sapphire')!, stock: 3 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-duo-ruby')!, stock: 4 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-house-gray')!, stock: 6 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-road-single')!, stock: 4 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-road-triad-line')!, stock: 2 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-junction-3way')!, stock: 2 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-junction-4way')!, stock: 2 },
      { ...PIECE_PALETTE.find(p => p.id === 'p-junction-roundabout')!, stock: 1 },
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

  // ============================================================
  // LEVELS 36-49 — TRAFFIC ATTACK EXPANSION
  // ============================================================
  // ============================================================
  // LEVEL 36 — Debut of Traffic Attack (Single Corridor Requirement)
  // ============================================================
  {
    id: 36,
    name: "The Pioneer Parkway",
    subtitle: "Debut of Traffic Attack — connect homesteads to the central transit line",
    description: "Welcome to Traffic Attack! Certain arterial roads are pre-constructed on the frontier. Satisfy municipal transit charters by clustering dwellings directly adjacent to the designated road corridors.",
    targetScore: { star1: 500, star2: 1000, star3: 1500 },
    lightbulbBudget: 60,
    strictPenaltyLimit: 5,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-amber',
      'p-duo-amber',
      'p-triad-amber',
      'p-road-single',
    ]),
    masteryChallenge: {
      id: 'mc-36',
      title: 'Flawless Transit',
      description: 'Satisfy the Pioneer Parkway requirement with zero Overuse penalties.',
      type: 'zero_overuse',
    },
    phases: [
      {
        phaseNumber: 1,
        title: "The Central Corridor",
        objective: "Build at least 3 houses adjacent to the Pioneer Parkway.",
        targetTilesCount: 14,
        unlockedCoords: [
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: 0 },
          { pieceId: 'p-road-single', q: -1, r: 0 },
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 1, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: 0 },
        ],
        roadRequirements: [
          {
            roadKey: "pioneer-parkway",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 0, r: 0 }],
          },
        ],
        coloredZones: [
          { color: 'amber', coords: [{ q: 0, r: -1 }, { q: 0, r: 1 }], name: "Market Commons" },
        ],
      },
    ],
  },

  // ============================================================
  // LEVEL 37 — Dual Arterial Requirements
  // ============================================================
  {
    id: 37,
    name: "The Cross-Valley Byways",
    subtitle: "Dual arterial corridors requiring balanced civic growth",
    description: "Two parallel transit avenues slice through the valley. Balance expansion between the North and South byways to fulfill municipal demands.",
    targetScore: { star1: 550, star2: 1100, star3: 1600 },
    lightbulbBudget: 65,
    strictPenaltyLimit: 5,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-emerald',
      'p-duo-emerald',
      'p-triad-emerald',
      'p-road-single',
      'p-duo-amber',
    ]),
    masteryChallenge: {
      id: 'mc-37',
      title: 'Bilateral Growth',
      description: 'Satisfy both byways with zero Disconnect penalties.',
      type: 'zero_disconnect',
    },
    phases: [
      {
        phaseNumber: 1,
        title: "Valley Junctions",
        objective: "Place at least 2 adjacent houses along the North Byway and 2 along the South Byway.",
        targetTilesCount: 16,
        unlockedCoords: [
          { q: -2, r: -1 }, { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 1 },
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: -1 },
          { pieceId: 'p-road-single', q: 0, r: -1 },
          { pieceId: 'p-road-single', q: 0, r: 1 },
          { pieceId: 'p-road-single', q: 2, r: 1 },
        ],
        roadRequirements: [
          {
            roadKey: "north-byway",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 0, r: -1 }],
          },
          {
            roadKey: "south-byway",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 0, r: 1 }],
          },
        ],
        coloredZones: [
          { color: 'emerald', coords: [{ q: -1, r: 0 }, { q: 1, r: 0 }], name: "Greenway Buffer" },
          { color: 'amber', coords: [{ q: -1, r: -1 }, { q: 1, r: 1 }], name: "Civic Promenades" },
        ],
      },
    ],
  },

  // ============================================================
  // LEVEL 38 — Bridge + Road Combination with River Barriers
  // ============================================================
  {
    id: 38,
    name: "The Delta Aqueduct",
    subtitle: "Bridging the great estuary with pre-placed stone causeways",
    description: "The delta river cuts through the settlement. Bridge spans and road segments must be flanked by riverside dwellings to meet naval trade contracts.",
    targetScore: { star1: 600, star2: 1200, star3: 1700 },
    lightbulbBudget: 70,
    strictPenaltyLimit: 5,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-sapphire',
      'p-duo-sapphire',
      'p-triad-sapphire',
      'p-bridge-single',
      'p-house-amber',
    ]),
    masteryChallenge: {
      id: 'mc-38',
      title: 'Estuary Engineer',
      description: 'Complete the aqueduct quotas with zero Overlap penalties.',
      type: 'zero_overlap',
    },
    phases: [
      {
        phaseNumber: 1,
        title: "Delta Crossing",
        objective: "Fulfill adjacent housing quotas for both the West Pier and the Bridge Span.",
        targetTilesCount: 16,
        unlockedCoords: [
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
        ],
        riverCoords: [{ q: 0, r: -1 }, { q: 0, r: 0 }, { q: 0, r: 1 }],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: 0 },
          { pieceId: 'p-bridge-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: 0 },
        ],
        roadRequirements: [
          {
            roadKey: "west-pier",
            minHousesAdjacent: 2,
            roadCoords: [{ q: -2, r: 0 }],
          },
          {
            roadKey: "delta-bridge",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 0, r: 0 }],
          },
        ],
        coloredZones: [
          { color: 'sapphire', coords: [{ q: -1, r: -1 }, { q: 1, r: 1 }], name: "Harbor Basin" },
        ],
      },
    ],
  },

  // ============================================================
  // LEVEL 39 — Coastal Causeway & Peninsula Topology
  // ============================================================
  {
    id: 39,
    name: "The Harbor Spine",
    subtitle: "A winding coastal artery along the ocean bluffs",
    description: "Clifftop topography forces all development along a single curved coastal spine. Anchor fishermen cottages directly against the cliff highway.",
    targetScore: { star1: 620, star2: 1250, star3: 1780 },
    lightbulbBudget: 72,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-sapphire',
      'p-duo-sapphire',
      'p-house-emerald',
      'p-duo-emerald',
      'p-tower-neutral',
    ]),
    masteryChallenge: {
      id: 'mc-39',
      title: 'Maritime Line',
      description: 'Reach at least 1200 points on the coastal spine.',
      type: 'min_score',
      targetValue: 1200,
    },
    phases: [
      {
        phaseNumber: 1,
        title: "Cliffside Spine",
        objective: "Supply 3 adjacent dwellings to the Coastal Spine and 2 to the Bluff Approach.",
        targetTilesCount: 18,
        unlockedCoords: [
          { q: -2, r: 1 }, { q: -1, r: 1 }, { q: 0, r: 1 },
          { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 },
          { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },
          { q: -1, r: -1 }, { q: 1, r: 1 },
        ],
        riverCoords: [{ q: -2, r: 1 }, { q: -1, r: 1 }],
        prePlacedRoads: [
          { pieceId: 'p-bridge-single', q: -2, r: 1 },
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: -1 },
        ],
        roadRequirements: [
          {
            roadKey: "coastal-spine",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 0, r: 0 }],
          },
          {
            roadKey: "bluff-approach",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 2, r: -1 }],
          },
        ],
        coloredZones: [
          { color: 'sapphire', coords: [{ q: 0, r: 1 }, { q: 1, r: 1 }], name: "Tide Pools" },
          { color: 'emerald', coords: [{ q: 0, r: -1 }, { q: -1, r: -1 }], name: "Bluff Groves" },
        ],
      },
    ],
  },

  // ============================================================
  // LEVEL 40 — 2-Road Requirements With Bridges
  // ============================================================
  {
    id: 40,
    name: "The Twin Aqueduct Commute",
    subtitle: "Two parallel water bridges carrying municipal avenues",
    description: "Two great viaducts span the delta. Feed both arteries simultaneously with dense river neighborhoods.",
    targetScore: { star1: 650, star2: 1300, star3: 1850 },
    lightbulbBudget: 74,
    strictPenaltyLimit: 5,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-amber',
      'p-house-sapphire',
      'p-duo-amber',
      'p-duo-sapphire',
      'p-bridge-single',
      'p-tower-amber'
    ]),
    masteryChallenge: {
      id: 'mc-40',
      title: 'Bilateral Viaducts',
      description: 'Satisfy all road requirements with 0 Overuse penalties.',
      type: 'zero_overuse'
    },
    phases: [
      {
        phaseNumber: 1,
        title: "Dual Viaduct Settlement",
        objective: "Satisfy adjacent housing quotas on both the North and South aqueducts.",
        targetTilesCount: 18,
        unlockedCoords: [
          { q: -2, r: -1 }, { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },
          { q: -2, r: 1 }, { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 1 },
          { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }
        ],
        riverCoords: [
          { q: 0, r: -2 }, { q: 0, r: -1 }, { q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: 2 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: -1 },
          { pieceId: 'p-bridge-single', q: 0, r: -1 },
          { pieceId: 'p-road-single', q: 2, r: -1 },
          { pieceId: 'p-road-single', q: -2, r: 1 },
          { pieceId: 'p-bridge-single', q: 0, r: 1 },
          { pieceId: 'p-road-single', q: 2, r: 1 }
        ],
        roadRequirements: [
          {
            roadKey: "north-viaduct",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 0, r: -1 }]
          },
          {
            roadKey: "south-viaduct",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 0, r: 1 }]
          }
        ],
        coloredZones: [
          { color: 'amber', coords: [{ q: -1, r: -1 }, { q: 1, r: -1 }], name: "North Pierhead" },
          { color: 'sapphire', coords: [{ q: -1, r: 1 }, { q: 1, r: 1 }], name: "South Pierhead" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 41 — Causeway Commute
  // ============================================================
  {
    id: 41,
    name: "The Sunken Causeway",
    subtitle: "A tidal highway washed by salty spray",
    description: "Position residential piers between two tidal causeway segments to withstand the incoming surge.",
    targetScore: { star1: 680, star2: 1360, star3: 1920 },
    lightbulbBudget: 75,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-sapphire',
      'p-duo-sapphire',
      'p-bridge-duo',
      'p-road-single'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Tidal Frontage",
        objective: "Supply 3 houses to Causeway Alpha and 3 houses to Causeway Beta.",
        targetTilesCount: 18,
        unlockedCoords: [
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }
        ],
        riverCoords: [{ q: -1, r: 0 }, { q: 1, r: 0 }],
        prePlacedRoads: [
          { pieceId: 'p-bridge-single', q: -1, r: 0 },
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-bridge-single', q: 1, r: 0 }
        ],
        roadRequirements: [
          {
            roadKey: "causeway-alpha",
            minHousesAdjacent: 3,
            roadCoords: [{ q: -1, r: 0 }]
          },
          {
            roadKey: "causeway-beta",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 1, r: 0 }]
          }
        ],
        coloredZones: [
          { color: 'sapphire', coords: [{ q: 0, r: -1 }, { q: 0, r: 1 }], name: "Tidal Sandbar" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 42 — Industrial Overpass
  // ============================================================
  {
    id: 42,
    name: "The Smelting Viaducts",
    subtitle: "Overhead rails shuttling molten slag and coal",
    description: "Build worker tenements along the high rail lines without interrupting foundry operations.",
    targetScore: { star1: 710, star2: 1420, star3: 2000 },
    lightbulbBudget: 78,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-ruby',
      'p-duo-ruby',
      'p-triad-ruby',
      'p-tower-neutral'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Smelter Quarter",
        objective: "Provide required worker density for both Slag Line and Ingot Avenue.",
        targetTilesCount: 20,
        unlockedCoords: [
          { q: -2, r: -1 }, { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 1 },
          { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: -1 },
          { pieceId: 'p-road-single', q: 1, r: -1 },
          { pieceId: 'p-road-single', q: -1, r: 1 },
          { pieceId: 'p-road-single', q: 2, r: 1 }
        ],
        roadRequirements: [
          {
            roadKey: "slag-line",
            minHousesAdjacent: 3,
            roadCoords: [{ q: -2, r: -1 }]
          },
          {
            roadKey: "ingot-avenue",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 2, r: 1 }]
          }
        ],
        coloredZones: [
          { color: 'ruby', coords: [{ q: 0, r: 0 }, { q: -1, r: 0 }], name: "Blast Core" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 43 — Commerce Boulevards
  // ============================================================
  {
    id: 43,
    name: "The Gilded Esplanades",
    subtitle: "High-density retail strips and merchant plazas",
    description: "Align manor clusters to flank both trading promenades to maximize the city's commercial prosperity.",
    targetScore: { star1: 750, star2: 1500, star3: 2100 },
    lightbulbBudget: 80,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-amber',
      'p-duo-amber',
      'p-triad-amber',
      'p-tower-amber'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Golden Thoroughfare",
        objective: "Line both the Gilded Promenade and the Amber Way with bustling merchant households.",
        targetTilesCount: 22,
        unlockedCoords: [
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -2, r: -1 }, { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 1 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: 0 },
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: 0 }
        ],
        roadRequirements: [
          {
            roadKey: "gilded-promenade",
            minHousesAdjacent: 4,
            roadCoords: [{ q: 0, r: 0 }]
          },
          {
            roadKey: "amber-way",
            minHousesAdjacent: 2,
            roadCoords: [{ q: -2, r: 0 }]
          }
        ],
        coloredZones: [
          { color: 'amber', coords: [{ q: 0, r: -1 }, { q: 1, r: -1 }, { q: 1, r: 1 }], name: "Guild District" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 44 — Fog + Road Synergy
  // ============================================================
  {
    id: 44,
    name: "The Misted Tollway",
    subtitle: "A mountain highway veiled in freezing cloud cover",
    description: "The road stretches straight through impenetrable mist. Reveal unseen parcels while satisfying adjacent quotas.",
    targetScore: { star1: 520, star2: 1040, star3: 1550 },
    lightbulbBudget: 68,
    strictPenaltyLimit: 3,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-emerald',
      'p-duo-emerald',
      'p-triad-emerald',
      'p-road-single'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Perimeter Clearance",
        objective: "Place dwellings adjacent to the mist-shrouded highway without incurring Falsehood penalties.",
        targetTilesCount: 16,
        unlockedCoords: [
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }
        ],
        fogCoords: [
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: 0 },
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: 0 }
        ],
        roadRequirements: [
          {
            roadKey: "mist-highway",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 0, r: 0 }]
          }
        ],
        coloredZones: [
          { color: 'emerald', coords: [{ q: -1, r: -1 }, { q: 1, r: -1 }], name: "Alpine Pines" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 45 — Fog + River + Road Complex
  // ============================================================
  {
    id: 45,
    name: "Vapor on the Canal",
    subtitle: "Steamy hot springs and narrow stone locks",
    description: "Canal banks emerge slowly from the warm vapors. Guide construction alongside both waterways simultaneously.",
    targetScore: { star1: 560, star2: 1120, star3: 1680 },
    lightbulbBudget: 72,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-sapphire',
      'p-duo-sapphire',
      'p-bridge-single',
      'p-road-single'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Canal Lock Settlement",
        objective: "Satisfy the Canal North and Canal South transit thresholds.",
        targetTilesCount: 18,
        unlockedCoords: [
          { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }
        ],
        riverCoords: [{ q: 0, r: -1 }, { q: 0, r: 0 }, { q: 0, r: 1 }],
        fogCoords: [{ q: 1, r: -1 }, { q: 1, r: 1 }],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -1, r: 0 },
          { pieceId: 'p-bridge-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 1, r: 0 }
        ],
        roadRequirements: [
          {
            roadKey: "lock-bridge",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 0, r: 0 }]
          },
          {
            roadKey: "west-wharf",
            minHousesAdjacent: 2,
            roadCoords: [{ q: -1, r: 0 }]
          }
        ],
        coloredZones: [
          { color: 'sapphire', coords: [{ q: -1, r: -1 }, { q: -1, r: 1 }], name: "Spring Basins" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 46 — Spectral Ringway
  // ============================================================
  {
    id: 46,
    name: "The Spectral Ringway",
    subtitle: "A circular carriage road circumscribing ancient ruins",
    description: "Surround the haunted interior plaza without crossing into the treacherous phantom perimeter.",
    targetScore: { star1: 590, star2: 1180, star3: 1720 },
    lightbulbBudget: 75,
    strictPenaltyLimit: 3,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-amber',
      'p-duo-amber',
      'p-road-single',
      'p-tower-neutral'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Orbital Habitation",
        objective: "Place adjacent homesteads along 3 distinct sectors of the orbital highway.",
        targetTilesCount: 20,
        unlockedCoords: [
          { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
          { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
        ],
        fogCoords: [
          { q: 2, r: -1 }, { q: 1, r: -2 }, { q: -1, r: 2 }, { q: -2, r: 1 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: 1, r: 0 },
          { pieceId: 'p-road-single', q: -1, r: 1 },
          { pieceId: 'p-road-single', q: 0, r: -1 }
        ],
        roadRequirements: [
          {
            roadKey: "east-arc",
            minHousesAdjacent: 2,
            roadCoords: [{ q: 1, r: 0 }]
          },
          {
            roadKey: "south-arc",
            minHousesAdjacent: 2,
            roadCoords: [{ q: -1, r: 1 }]
          }
        ],
        coloredZones: [
          { color: 'amber', coords: [{ q: 0, r: 0 }], name: "Sunken Citadel" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 47 — Gorge of the Blind Monks
  // ============================================================
  {
    id: 47,
    name: "Gorge of the Blind Monks",
    subtitle: "A sheer canyon spanned by creaking wooden spans",
    description: "Deep shadows conceal the canyon floor. Connect monastery cells along the sky-high pass.",
    targetScore: { star1: 610, star2: 1220, star3: 1780 },
    lightbulbBudget: 76,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-ruby',
      'p-duo-ruby',
      'p-bridge-single',
      'p-road-single'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Chasm Line",
        objective: "Satisfy 3 houses on the North Chasm and 3 on the South Chasm.",
        targetTilesCount: 20,
        unlockedCoords: [
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }
        ],
        fogCoords: [{ q: 0, r: -1 }, { q: 0, r: 1 }],
        riverCoords: [{ q: 0, r: 0 }],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -2, r: 0 },
          { pieceId: 'p-bridge-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: 0 }
        ],
        roadRequirements: [
          {
            roadKey: "west-chasm-edge",
            minHousesAdjacent: 3,
            roadCoords: [{ q: -2, r: 0 }]
          },
          {
            roadKey: "east-chasm-edge",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 2, r: 0 }]
          }
        ],
        coloredZones: [
          { color: 'ruby', coords: [{ q: -1, r: 0 }, { q: 1, r: 0 }], name: "Incense Shrines" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 48 — Turntable Road Junction
  // ============================================================
  {
    id: 48,
    name: "The Gearwork Interchange",
    subtitle: "A massive mechanical turntable that rotates arterial flow",
    description: "Rotate the central hub to deliver road access directly to isolated hillside neighborhoods.",
    targetScore: { star1: 640, star2: 1280, star3: 1840 },
    lightbulbBudget: 78,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-emerald',
      'p-duo-emerald',
      'p-road-single',
      'p-junction-3way'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Rotary Traffic",
        objective: "Satisfy 4 adjacent houses on the Rotary Hub by turning the wheel to the optimal angle.",
        targetTilesCount: 22,
        unlockedCoords: [
          { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
          { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: 2, r: 0 }, { q: -2, r: 0 }
        ],
        rotationZones: [
          { id: 'gear-hub', name: "Rotary Carousel", center: { q: 0, r: 0 }, radius: 1 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 2, r: 0 },
          { pieceId: 'p-road-single', q: -2, r: 0 }
        ],
        roadRequirements: [
          {
            roadKey: "rotary-core",
            minHousesAdjacent: 4,
            roadCoords: [{ q: 0, r: 0 }]
          }
        ],
        coloredZones: [
          { color: 'emerald', coords: [{ q: 1, r: -1 }, { q: -1, r: 1 }], name: "Terrace Gardens" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 49 — Siphon Switchyard
  // ============================================================
  {
    id: 49,
    name: "The Grand Siphon",
    subtitle: "Complex hydraulics and rail turnstiles feeding a delta aqueduct",
    description: "Align rotating canal gates with adjacent residential docks to secure complete fluid equilibrium.",
    targetScore: { star1: 670, star2: 1340, star3: 1900 },
    lightbulbBudget: 80,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-sapphire',
      'p-duo-sapphire',
      'p-house-ruby',
      'p-bridge-single',
      'p-road-single'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Dual Alignment",
        objective: "Satisfy 3 houses on the North Line and 3 on the East Siphon.",
        targetTilesCount: 24,
        unlockedCoords: [
          { q: 0, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 1, r: 0 },
          { q: 0, r: 1 }, { q: -1, r: 1 }, { q: -1, r: 0 },
          { q: 0, r: -2 }, { q: 2, r: -1 }
        ],
        riverCoords: [{ q: 0, r: 0 }, { q: 0, r: -1 }],
        rotationZones: [
          { id: 'siphon-turntable', name: "Siphon Core", center: { q: 0, r: 0 }, radius: 1 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: 0, r: -2 },
          { pieceId: 'p-road-single', q: 2, r: -1 }
        ],
        roadRequirements: [
          {
            roadKey: "north-siphon",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 0, r: -2 }]
          },
          {
            roadKey: "east-siphon",
            minHousesAdjacent: 3,
            roadCoords: [{ q: 2, r: -1 }]
          }
        ],
        coloredZones: [
          { color: 'sapphire', coords: [{ q: 0, r: 1 }], name: "Lower Pool" },
          { color: 'ruby', coords: [{ q: -1, r: 0 }], name: "Pressure Valve" }
        ]
      }
    ]
  },

  // ============================================================
  // LEVEL 50 — Hidden Quotas (First Hover-to-Inspect Level)
  // ============================================================
  {
    id: 50,
    name: "The Cryptic Causeway",
    subtitle: "Town charters hidden in bureaucratic mystery",
    description: "The road requirements are veiled. Hover over the pre-placed segments to inspect the town council's hidden demands.",
    targetScore: { star1: 580, star2: 1200, star3: 1750 },
    lightbulbBudget: 75,
    strictPenaltyLimit: 4,
    levelType: 'traffic_attack',
    availablePieces: getPieces([
      'p-house-gray',
      'p-house-amber',
      'p-duo-amber',
      'p-triad-amber',
      'p-tower-neutral'
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: "Inspect the Charter",
        objective: "Hover over the central avenues to reveal requirements, then fulfill them.",
        targetTilesCount: 16,
        unlockedCoords: [
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 },
          { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }
        ],
        prePlacedRoads: [
          { pieceId: 'p-road-single', q: -1, r: 0 },
          { pieceId: 'p-road-single', q: 0, r: 0 },
          { pieceId: 'p-road-single', q: 1, r: 0 }
        ],
        roadRequirements: [
          {
            roadKey: "cryptic-central",
            minHousesAdjacent: 4,
            roadCoords: [{ q: 0, r: 0 }]
          }
        ],
        coloredZones: [
          { color: 'amber', coords: [{ q: 0, r: -1 }, { q: 0, r: 1 }], name: "Charter Square" }
        ]
      }
    ]
  },
  // --------------------------------------------------------------------------
  // LEVEL 51: The Grand Gridlock (Secret Level — Traffic Attack × Boss Battle)
  // --------------------------------------------------------------------------
  {
    id: 51,
    name: 'The Grand Gridlock',
    subtitle: 'SECRET LEVEL: Traffic Attack × Business Showdown',
    description:
      'A rival tycoon has jammed every artery in your city. Clear the transit charters to weaken his grip, inspect the district zones for bonus firepower, then face him in a showdown where unfinished roads cut your stats — and his stay fat.',
    isBossLevel: true,
    levelType: 'traffic_attack',
    bossName: 'Baron Rexford Throttle',
    bossPopularity: 220,
    bossAmbience: 200,
    bossMaxHp: 6000,
    lightbulbBudget: 80,
    strictPenaltyLimit: 4,
    masteryChallenge: {
      id: 'mc-51',
      title: 'Gridlock Breaker',
      description: 'Clear every Transit Charter AND win the Business Showdown with at least 3000 points.',
      type: 'min_score',
      targetValue: 3000,
    },
    availablePieces: getPieces([
      // Buildings for the road requirements
      'p-house-gray',
      'p-house-amber',
      'p-house-emerald',
      'p-house-sapphire',
      'p-house-ruby',
      'p-duo-gray',
      'p-duo-amber',
      'p-duo-emerald',
      'p-triad-amber',
      'p-triad-emerald',
      // Some roads for player-controlled connectivity
      'p-road-single',
      'p-road-duo',
      'p-junction-3way',
      'p-junction-4way',
    ]),
    phases: [
      {
        phaseNumber: 1,
        title: 'The Gridlocked Plaza',
        objective:
          'Satisfy all 3 Transit Charters by placing houses along the clogged parkways, and inspect every colored zone for bonus stats.',
        targetTilesCount: 18,
        unlockedCoords: [
          // ── 5x5 plaza grid (q: -2..2, r: -2..2) ──────────────────────
          // Row r = -2
          { q: -2, r: -2 }, { q: -1, r: -2 }, { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },
          // Row r = -1
          { q: -2, r: -1 }, { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },
          // Row r = 0
          { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
          // Row r = 1
          { q: -2, r: 1 }, { q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 1 },
          // Row r = 2
          { q: -2, r: 2 }, { q: -1, r: 2 }, { q: 0, r: 2 }, { q: 1, r: 2 }, { q: 2, r: 2 },
        ],
        // ── Pre-placed road grid: two horizontal + two vertical arteries ──
        prePlacedRoads: [
          // Horizontal artery on row r = -1
          { pieceId: 'p-road-single', q: -2, r: -1 },
          { pieceId: 'p-junction-4way', q: -1, r: -1 },
          { pieceId: 'p-junction-4way', q: 0, r: -1 },
          { pieceId: 'p-junction-4way', q: 1, r: -1 },
          { pieceId: 'p-road-single', q: 2, r: -1 },

          // Horizontal artery on row r = 1
          { pieceId: 'p-road-single', q: -2, r: 1 },
          { pieceId: 'p-junction-4way', q: -1, r: 1 },
          { pieceId: 'p-junction-4way', q: 0, r: 1 },
          { pieceId: 'p-junction-4way', q: 1, r: 1 },
          { pieceId: 'p-road-single', q: 2, r: 1 },

          // Vertical artery on col q = 0 (r = -2 and r = 2, filling in the top/bottom ends)
          { pieceId: 'p-road-single', q: 0, r: -2 },
          { pieceId: 'p-road-single', q: 0, r: 2 },
        ],
        // ── Three Transit Charters to clear ──
        roadRequirements: [
          {
            roadKey: 'north-artery',
            minHousesAdjacent: 4,
            roadCoords: [
              { q: -1, r: -1 },
              { q: 0, r: -1 },
              { q: 1, r: -1 },
            ],
          },
          {
            roadKey: 'south-artery',
            minHousesAdjacent: 4,
            roadCoords: [
              { q: -1, r: 1 },
              { q: 0, r: 1 },
              { q: 1, r: 1 },
            ],
          },
          {
            roadKey: 'central-spine',
            minHousesAdjacent: 3,
            roadCoords: [
              { q: 0, r: -2 },
              { q: 0, r: 2 },
            ],
          },
        ],
        // ── Four colored zones, one per corner block of the grid ──
        coloredZones: [
          {
            name: 'Northwest Merchant Row',
            color: 'amber',
            coords: [
              { q: -2, r: -2 },
              { q: -1, r: -2 },
            ],
          },
          {
            name: 'Northeast Wharf Exchange',
            color: 'sapphire',
            coords: [
              { q: 1, r: -2 },
              { q: 2, r: -2 },
            ],
          },
          {
            name: 'Southwest Traffic Gardens',
            color: 'emerald',
            coords: [
              { q: -2, r: 2 },
              { q: -1, r: 2 },
            ],
          },
          {
            name: 'Southeast Kiln Square',
            color: 'ruby',
            coords: [
              { q: 1, r: 2 },
              { q: 2, r: 2 },
            ],
          },
        ],
      },
    ],
    targetScore: { star1: 2200, star2: 5000, star3: 7500 },
  },
];
