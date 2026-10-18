// src/types/save.ts

import type { BoosterId, ConstructionId } from './economy';
import type { BypassablePenaltyType, GameMode, MemoryPicture, PlayMode } from './game';

/** Bump this whenever the blob shape changes in a breaking way. */
export const CURRENT_SAVE_SCHEMA_VERSION = 3;

/**
 * Onboarding progression stages.
 * - `welcome`: first login, only Play button visible, welcome overlay active.
 * - `tutorial_lv1`: level 1 tutorial flow in progress.
 * - `tutorial_lv2`: level 2 tutorial flow in progress.
 * - `post_lv5`: after level 5, partial UI unlocked, Tutorial menu available.
 * - `complete`: full UI.
 */
export type OnboardingStage =
  | 'welcome'
  | 'tutorial_lv1'
  | 'tutorial_lv2'
  | 'post_lv5'
  | 'complete';

/**
 * The single source of truth for everything that syncs to the cloud.
 * Anything NOT in here is device-local (perf settings, admin flags,
 * guest progress, custom authoring content — the latter lands later).
 */
export interface CloudSaveBlob {
  schemaVersion: number;
  /** Local epoch ms. The LWW driver against `player_saves.saved_at`. */
  updatedAt: number;

  // ── Core progression ─────────────────────────────────────────────
  highestCompletedLevel: number;
  coins: number;
  leaves: number;
  boosters: Record<BoosterId, number>;
  /** Level per construction id (0..3). Rehydrated to ConstructionItem[] in App. */
  constructions: Record<ConstructionId, number>;
  claimedChestIds: number[];
  hasGoldenTicket: boolean;
  playMode: PlayMode;
  gameMode: GameMode;

  // ── Memories feature ─────────────────────────────────────────────
  /** Last VN chapter id the player opened (0 = none). */
  latestChapterExplore: number;
  /** Highest MemoryPicture.id unlocked. Derived + cached. */
  latestMemories: number;
  /** Chosen penalty bypass per MemoryPicture id. */
  chosenBypass: Record<number, BypassablePenaltyType>;

  /** Full memory array so title/lore/unlockBypass survive cross-device. */
  memories: MemoryPicture[];

  // ── Mobile tutorial ──────────────────────────────────────────
  /** Tutorial groups the player has completed or skipped. */
  mobileTutorialSeenGroups: string[];

  // ── Onboarding (schema v3) ───────────────────────────────────
  /** Which stage of the tutorial funnel the player is currently in. */
  onboardingStage: OnboardingStage;
  /**
   * Progress for replayable tutorials — key = tutorial id, value = highest
   * step index reached (0-based). Used to gate "Skip" (must reach 50%).
   */
  seenTutorials: Record<string, number>;
}