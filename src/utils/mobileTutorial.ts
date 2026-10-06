// src/utils/mobileTutorial.ts

// ─────────────────────────────────────────────────────────────────
// Tutorial groups
// ─────────────────────────────────────────────────────────────────

export type TutorialGroupId =
  | 'basic'            // Level 1 — tap tile, place tile
  | 'zones'            // Level 2 — budget + color zones
  | 'cluster'          // Level 4 — multi-hex cluster piece
  | 'cluster_rotate'   // (Level 5 or 7 — reserved for later)
  | 'off_map'          // Level 6 — off-map penalty
  | 'turntable'        // Level 11 — tap spin
  | 'road'             // Level 16 — road adjacent to building
  | 'bridge'           // Level 23 — bridge crosses river
  | 'traffic_attack';  // Level 36 — house adjacent to pre-placed road

export const LEVEL_TO_TUTORIAL_GROUP: Record<number, TutorialGroupId> = {
  1: 'basic',
  2: 'zones',
  4: 'cluster',
  6: 'off_map',
  11: 'turntable',
  16: 'road',
  23: 'bridge',
  36: 'traffic_attack',
  // Reserved for later:
  // 5: 'cluster_rotate',
};

export function getTutorialGroupForLevel(levelId: number): TutorialGroupId | null {
  return LEVEL_TO_TUTORIAL_GROUP[levelId] ?? null;
}

// ─────────────────────────────────────────────────────────────────
// Targets + advance conditions
// ─────────────────────────────────────────────────────────────────

export type TutorialTarget =
  | { kind: 'ui'; selector: string }
  | { kind: 'hex'; q: number; r: number }
  | { kind: 'none' };

export type TutorialAdvanceCondition =
  | { type: 'has-selected-piece' }
  | { type: 'has-placed-tile' }
  | { type: 'has-placed-road' }
  | { type: 'has-placed-bridge' }
  | { type: 'has-rotated' }
  | { type: 'has-rotated-turntable' }
  | { type: 'delay'; ms: number };

export type GhostGesture = 'tap' | 'drag' | 'long-press' | 'shake';

export interface TutorialStep {
  id: string;
  /** Short instruction. Keep ≤ 6 words. */
  text: string;
  /** Optional one-line hint under text. */
  hint?: string;
  target: TutorialTarget;
  advance: TutorialAdvanceCondition;
  gesture?: GhostGesture;
}

export const TUTORIAL_STEPS: Record<TutorialGroupId, TutorialStep[]> = {
  // ─────────────────────────────────────────────────────────────
  // Level 1 — Basic placement
  // ─────────────────────────────────────────────────────────────
  basic: [
    {
      id: 'basic-select',
      text: 'Tap the tile',
      hint: 'Drag it up to the board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
    {
      id: 'basic-place',
      text: 'Place it here',
      target: { kind: 'hex', q: 0, r: 0 },
      advance: { type: 'has-placed-tile' },
      gesture: 'drag',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // Level 2 — Budget + color zones
  // ─────────────────────────────────────────────────────────────
  zones: [
    {
      id: 'zones-budget',
      text: 'Watch your budget',
      hint: 'Top left corner',
      target: { kind: 'ui', selector: '[data-tutorial-id="journey-lightbulb-pill"]' },
      advance: { type: 'delay', ms: 3000 },
      gesture: 'tap',
    },
    {
      id: 'zones-match',
      text: 'Match tile colors',
      hint: 'Amber tile → Amber zone',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
    {
      id: 'zones-place',
      text: 'Fill the zones',
      target: { kind: 'hex', q: 1, r: 0 },
      advance: { type: 'has-placed-tile' },
      gesture: 'drag',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // Level 4 — Cluster piece (multi-hex)
  // ─────────────────────────────────────────────────────────────
  cluster: [
    {
      id: 'cluster-pick',
      text: 'Tap the duo cluster',
      hint: 'Multi-hex piece covers 2 cells',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
    {
      id: 'cluster-place',
      text: 'Place both hexes',
      hint: 'Both cells must fit',
      target: { kind: 'hex', q: 0, r: 0 },
      advance: { type: 'has-placed-tile' },
      gesture: 'drag',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // Level 6 — Off-map penalty
  // ─────────────────────────────────────────────────────────────
  off_map: [
    {
      id: 'off_map-invalid',
      text: 'Do not build here',
      hint: 'Outside the frontier',
      target: { kind: 'hex', q: 0, r: 3 },
      advance: { type: 'delay', ms: 2800 },
      gesture: 'shake',
    },
    {
      id: 'off_map-pick',
      text: 'Pick a tile',
      hint: 'Build inside the border',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
    {
      id: 'off_map-place',
      text: 'Place inside',
      hint: 'Safe ground only',
      target: { kind: 'hex', q: 1, r: 0 },
      advance: { type: 'has-placed-tile' },
      gesture: 'drag',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // Level 11 — Turntable spin
  // ─────────────────────────────────────────────────────────────
  turntable: [
    {
      id: 'turntable-spin',
      text: 'Tap Spin to rotate',
      hint: 'Turntable shifts single tiles',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-spin-btn"]' },
      advance: { type: 'has-rotated-turntable' },
      gesture: 'tap',
    },
    {
      id: 'turntable-place',
      text: 'Now place a tile',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // Level 16 — Road adjacent to building
  // ─────────────────────────────────────────────────────────────
  road: [
    {
      id: 'road-info',
      text: 'Roads connect buildings',
      hint: 'Must touch a house or road',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
    {
      id: 'road-place',
      text: 'Place near a house',
      hint: 'Roads cannot stand alone',
      target: { kind: 'hex', q: 0, r: 0 },
      advance: { type: 'has-placed-road' },
      gesture: 'drag',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // Level 23 — Bridge crosses river
  // ─────────────────────────────────────────────────────────────
  bridge: [
    {
      id: 'bridge-water',
      text: 'Water blocks tiles',
      hint: 'Rivers reject normal pieces',
      target: { kind: 'hex', q: 0, r: 0 },
      advance: { type: 'delay', ms: 2800 },
      gesture: 'shake',
    },
    {
      id: 'bridge-pick',
      text: 'Pick a bridge',
      hint: 'Bridges cross any water',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
    {
      id: 'bridge-place',
      text: 'Bridge over water',
      target: { kind: 'hex', q: 0, r: 0 },
      advance: { type: 'has-placed-bridge' },
      gesture: 'drag',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // Level 36 — Traffic Attack (house adjacent to pre-placed road)
  // ─────────────────────────────────────────────────────────────
  traffic_attack: [
    {
      id: 'traffic-info',
      text: 'Transit Charter road',
      hint: 'Pre-built road needs houses',
      target: { kind: 'hex', q: 0, r: 0 },
      advance: { type: 'delay', ms: 3000 },
      gesture: 'tap',
    },
    {
      id: 'traffic-pick',
      text: 'Pick a house',
      hint: 'Houses count toward charter',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
      advance: { type: 'has-selected-piece' },
      gesture: 'tap',
    },
    {
      id: 'traffic-place',
      text: 'Build next to road',
      hint: 'Adjacent counts',
      target: { kind: 'hex', q: 0, r: -1 },
      advance: { type: 'has-placed-tile' },
      gesture: 'drag',
    },
  ],

  // Reserved — no steps yet
  cluster_rotate: [],
};

export function getStepsForGroup(group: TutorialGroupId): TutorialStep[] {
  return TUTORIAL_STEPS[group] ?? [];
}