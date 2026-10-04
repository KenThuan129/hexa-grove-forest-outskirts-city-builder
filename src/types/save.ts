// src/types/save.ts

import type { BoosterId, ConstructionId } from './economy';
import type { BypassablePenaltyType, GameMode, MemoryPicture, PlayMode } from './game';

/** Bump this whenever the blob shape changes in a breaking way. */
export const CURRENT_SAVE_SCHEMA_VERSION = 1;

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
}