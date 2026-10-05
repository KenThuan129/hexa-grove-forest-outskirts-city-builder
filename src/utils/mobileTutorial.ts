// src/utils/mobileTutorial.ts

import type { HexPiece, PlacedTile, GridCell, PenaltyRecord } from '../types/game';
import { coordKey } from './hexMath';

// ─────────────────────────────────────────────────────────────────
// Tutorial groups — one tutorial per group, never re-shown once seen
// ─────────────────────────────────────────────────────────────────

export type TutorialGroupId =
  | 'basic'
  | 'zones'
  | 'off_map'
  | 'overlap'
  | 'disconnect'
  | 'rotate'
  | 'turntable'
  | 'riverside'
  | 'boss';

/** Map level id → tutorial group. Levels not in this map have no tutorial. */
export const LEVEL_TO_TUTORIAL_GROUP: Record<number, TutorialGroupId> = {
  1: 'basic',
  2: 'zones',
  6: 'off_map',
  9: 'overlap',
  12: 'disconnect',
  15: 'rotate',
  18: 'turntable',
  20: 'riverside',
  23: 'riverside', // Shares group with 20 — no re-show
  25: 'boss',
};

export function getTutorialGroupForLevel(levelId: number): TutorialGroupId | null {
  return LEVEL_TO_TUTORIAL_GROUP[levelId] ?? null;
}

// ─────────────────────────────────────────────────────────────────
// Tutorial step definition
// ─────────────────────────────────────────────────────────────────

export type TutorialTarget =
  | { kind: 'ui'; selector: string }              // CSS selector target
  | { kind: 'hex'; q: number; r: number }         // 3D hex board target
  | { kind: 'center' };                            // No specific target

export interface TutorialStep {
  id: string;
  /** Message shown in the banner. Keep short — max 6 words. */
  text: string;
  /** Where the banner appears relative to the screen. */
  bannerPlacement: 'below-board' | 'over-board-top' | 'over-board-center';
  /** What to highlight on screen. */
  target: TutorialTarget;
  /** Optional: a hint subtext under the main text. */
  hint?: string;
}

// ─────────────────────────────────────────────────────────────────
// Per-group step definitions
// ─────────────────────────────────────────────────────────────────

export const TUTORIAL_STEPS: Record<TutorialGroupId, TutorialStep[]> = {
  basic: [
    {
      id: 'basic-1',
      text: 'Tap a tile below',
      hint: 'Drag it up to the board',
      bannerPlacement: 'below-board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
    },
    {
      id: 'basic-2',
      text: 'Tap the board to place',
      hint: 'Green outline = good spot',
      bannerPlacement: 'over-board-center',
      target: { kind: 'hex', q: 0, r: 0 },
    },
    {
      id: 'basic-3',
      text: 'Complete when zones match',
      bannerPlacement: 'below-board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-complete-btn"]' },
    },
  ],

  zones: [
    {
      id: 'zones-1',
      text: 'Watch your Lightbulb budget',
      hint: 'Top left of screen',
      bannerPlacement: 'over-board-top',
      target: { kind: 'ui', selector: '[data-tutorial-id="journey-lightbulb-pill"]' },
    },
    {
      id: 'zones-2',
      text: 'Match colors into zones',
      hint: 'Amber tile → Amber zone',
      bannerPlacement: 'over-board-center',
      target: { kind: 'center' },
    },
    {
      id: 'zones-3',
      text: 'Tap Complete when done',
      bannerPlacement: 'below-board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-complete-btn"]' },
    },
  ],

  off_map: [
    {
      id: 'off_map-1',
      text: 'Do not build off the map',
      hint: 'Red outline = invalid',
      bannerPlacement: 'over-board-center',
      target: { kind: 'center' },
    },
    {
      id: 'off_map-2',
      text: 'Fill all zones cleanly',
      bannerPlacement: 'over-board-top',
      target: { kind: 'center' },
    },
    {
      id: 'off_map-3',
      text: 'Tap Complete to win',
      bannerPlacement: 'below-board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-complete-btn"]' },
    },
  ],

  overlap: [
    {
      id: 'overlap-1',
      text: 'Never stack tiles',
      hint: 'Each cell holds one tile',
      bannerPlacement: 'over-board-center',
      target: { kind: 'center' },
    },
    {
      id: 'overlap-2',
      text: 'Finish with 0 overlaps',
      bannerPlacement: 'over-board-top',
      target: { kind: 'center' },
    },
  ],

  disconnect: [
    {
      id: 'disconnect-1',
      text: 'Keep tiles connected',
      hint: 'No isolated islands',
      bannerPlacement: 'over-board-center',
      target: { kind: 'center' },
    },
    {
      id: 'disconnect-2',
      text: 'Tap Complete to win',
      bannerPlacement: 'below-board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-complete-btn"]' },
    },
  ],

  rotate: [
    {
      id: 'rotate-1',
      text: 'Select a cluster tile',
      hint: 'Multi-hex pieces',
      bannerPlacement: 'below-board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
    },
    {
      id: 'rotate-2',
      text: 'Tap Rotate to spin it',
      hint: '60° per tap',
      bannerPlacement: 'over-board-top',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-rotate-btn"]' },
    },
  ],

  turntable: [
    {
      id: 'turntable-1',
      text: 'Tap Spin for turntable',
      hint: 'Rotates single tiles',
      bannerPlacement: 'over-board-top',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-spin-btn"]' },
    },
  ],

  riverside: [
    {
      id: 'riverside-1',
      text: 'Rivers block tiles',
      hint: 'Only Bridges cross water',
      bannerPlacement: 'over-board-center',
      target: { kind: 'center' },
    },
    {
      id: 'riverside-2',
      text: 'Tap a Bridge tile',
      bannerPlacement: 'below-board',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-tray-first-tile"]' },
    },
  ],

  boss: [
    {
      id: 'boss-1',
      text: 'Long-press zones to inspect',
      hint: 'Earns Popularity & Ambience',
      bannerPlacement: 'over-board-center',
      target: { kind: 'center' },
    },
    {
      id: 'boss-2',
      text: 'Enter Business Showdown',
      hint: 'When you have enough Pop',
      bannerPlacement: 'over-board-top',
      target: { kind: 'ui', selector: '[data-tutorial-id="mobile-complete-btn"]' },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

export function getStepsForGroup(group: TutorialGroupId): TutorialStep[] {
  return TUTORIAL_STEPS[group] ?? [];
}

export function isGroupSeen(
  group: TutorialGroupId,
  seenGroups: string[]
): boolean {
  return seenGroups.includes(group);
}

/** Emit a stable CSS selector for the first tile in the mobile tray. */
export const FIRST_TILE_SELECTOR = '[data-tutorial-id="mobile-tray-first-tile"]';
export const COMPLETE_BTN_SELECTOR = '[data-tutorial-id="mobile-complete-btn"]';
export const ROTATE_BTN_SELECTOR = '[data-tutorial-id="mobile-rotate-btn"]';
export const SPIN_BTN_SELECTOR = '[data-tutorial-id="mobile-spin-btn"]';
export const LIGHTBULB_PILL_SELECTOR = '[data-tutorial-id="journey-lightbulb-pill"]';