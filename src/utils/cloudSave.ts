// src/utils/cloudSave.ts

import { supabase } from './supabaseClient';
import type { CloudSaveBlob, OnboardingStage } from '../types/save';
import { CURRENT_SAVE_SCHEMA_VERSION } from '../types/save';

export const LOCAL_BLOB_KEY = 'hexa_save_blob';
export const LOCAL_DIRTY_KEY = 'hexa_save_dirty';

// ─────────────────────────────────────────────────────────────────
// Blob construction
// ─────────────────────────────────────────────────────────────────

export interface AppSaveSnapshot {
  highestCompletedLevel: number;
  coins: number;
  leaves: number;
  boosters: CloudSaveBlob['boosters'];
  constructions: CloudSaveBlob['constructions'];
  claimedChestIds: number[];
  hasGoldenTicket: boolean;
  playMode: CloudSaveBlob['playMode'];
  gameModifier: CloudSaveBlob['gameModifier'];
  unlockedModifiers: CloudSaveBlob['unlockedModifiers'];
  tightRopeLevelsCleared: CloudSaveBlob['tightRopeLevelsCleared'];
  latestChapterExplore: number;
  latestMemories: number;
  chosenBypass: CloudSaveBlob['chosenBypass'];
  memories: CloudSaveBlob['memories'];
  mobileTutorialSeenGroups: string[];
  onboardingStage: OnboardingStage;
  seenTutorials: Record<string, number>;
}

export function buildSaveBlob(snapshot: AppSaveSnapshot): CloudSaveBlob {
  return {
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    ...snapshot,
  };
}

// ─────────────────────────────────────────────────────────────────
// Local storage (single blob + dirty flag)
// ─────────────────────────────────────────────────────────────────

export function readLocalBlob(): CloudSaveBlob | null {
  try {
    const raw = localStorage.getItem(LOCAL_BLOB_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migrateBlob(parsed);
  } catch {
    return null;
  }
}

export function writeLocalBlob(blob: CloudSaveBlob): boolean {
  try {
    localStorage.setItem(LOCAL_BLOB_KEY, JSON.stringify(blob));
    return true;
  } catch {
    return false;
  }
}

export function readLocalDirty(): boolean {
  try {
    return localStorage.getItem(LOCAL_DIRTY_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeLocalDirty(dirty: boolean): void {
  try {
    if (dirty) localStorage.setItem(LOCAL_DIRTY_KEY, 'true');
    else localStorage.removeItem(LOCAL_DIRTY_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────
// Cloud I/O
// ─────────────────────────────────────────────────────────────────

export async function readCloudBlob(userId: string): Promise<CloudSaveBlob | null> {
  const { data, error } = await supabase
    .from('player_saves')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || !data.state) return null;

  return migrateBlob(data.state);
}

export async function writeCloudBlob(userId: string, blob: CloudSaveBlob): Promise<void> {
  const { error } = await supabase
    .from('player_saves')
    .upsert(
      {
        user_id: userId,
        state: blob,
        saved_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw new Error(error.message);
}

export async function deleteCloudBlob(userId: string): Promise<void> {
  const { error } = await supabase
    .from('player_saves')
    .delete()
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────────────────────────
// Schema migration
// ─────────────────────────────────────────────────────────────────

export function migrateBlob(raw: any): CloudSaveBlob {
  const fallback: CloudSaveBlob = {
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    highestCompletedLevel: 0,
    coins: 250,
    leaves: 40,
    boosters: { chisel_brush: 1, cluster_splitter: 0, par_expander: 0, mist_piercer: 0, titan_shield: 0 },
    constructions: {} as Record<string, number>,
    claimedChestIds: [],
    hasGoldenTicket: false,
    playMode: 'building',
    gameModifier: 'none',
    // Mới — Tight Rope mặc định unlock sẵn
    unlockedModifiers: ['none', 'safety_guard', 'tight_rope'],
    tightRopeLevelsCleared: [],
    latestChapterExplore: 0,
    latestMemories: 0,
    chosenBypass: {},
    memories: [],
    mobileTutorialSeenGroups: [],
    onboardingStage: 'welcome',
    seenTutorials: {},
  };

  if (!raw || typeof raw !== 'object') return fallback;

  const rawSchema = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;

  // ── Onboarding stage migration ───────────────────────────────
  let migratedStage: OnboardingStage;
  if (rawSchema < 3) {
    // v1/v2 → user cũ. Nếu level > 0 → coi như đã qua tutorial.
    // Nếu level = 0 và không có schema → first run.
    if (rawSchema === 0 || (raw.highestCompletedLevel ?? 0) === 0) {
      migratedStage = 'welcome';
    } else {
      migratedStage = 'complete';
    }
  } else {
    migratedStage = (raw.onboardingStage as OnboardingStage) ?? 'welcome';
  }

  const validStages: OnboardingStage[] = ['welcome', 'tutorial_lv1', 'tutorial_lv2', 'post_lv5', 'complete'];
  if (!validStages.includes(migratedStage)) migratedStage = 'welcome';

  // ── playMode migration ───────────────────────────────────────
  // v1/v2: 'building' | 'challenger'
  // v3:    'building' | 'concrete'
  const migratedPlayMode: CloudSaveBlob['playMode'] =
    raw.playMode === 'concrete' || raw.playMode === 'challenger'
      ? 'concrete'
      : 'building';

  // ── gameModifier migration ───────────────────────────────────
  // v3: raw.gameModifier đã có → dùng trực tiếp
  // v1/v2: raw.gameMode 'casual' | 'tryhard' → map
  // Building mode → force 'none' (Building không có modifier)
  let migratedGameModifier: CloudSaveBlob['gameModifier'];
  if (raw.gameModifier === 'none' || raw.gameModifier === 'safety_guard' ||
      raw.gameModifier === 'tight_rope' || raw.gameModifier === 'cold_sea') {
    migratedGameModifier = raw.gameModifier;
  } else if (raw.gameMode === 'tryhard') {
    migratedGameModifier = 'tight_rope';
  } else if (raw.gameMode === 'casual') {
    migratedGameModifier = 'safety_guard';
  } else {
    migratedGameModifier = 'none';
  }
  // Building mode không dùng modifier — ép về 'none'
  if (migratedPlayMode === 'building') {
    migratedGameModifier = 'none';
  }

  // ── unlockedModifiers + tightRopeLevelsCleared ───────────────
  let migratedUnlockedModifiers: CloudSaveBlob['unlockedModifiers'] = Array.isArray(raw.unlockedModifiers)
  ? [...raw.unlockedModifiers]
  : ['none', 'safety_guard', 'tight_rope'];

  const migratedTightRopeLevels: CloudSaveBlob['tightRopeLevelsCleared'] =
    Array.isArray(raw.tightRopeLevelsCleared)
      ? raw.tightRopeLevelsCleared
      : [];

  // Đảm bảo 'none' + 'safety_guard' luôn có mặt
  if (!migratedUnlockedModifiers.includes('none')) migratedUnlockedModifiers.push('none');
  if (!migratedUnlockedModifiers.includes('safety_guard')) migratedUnlockedModifiers.push('safety_guard');
  // Sau block "Đảm bảo 'none' + 'safety_guard' luôn có mặt"
  if (!migratedUnlockedModifiers.includes('tight_rope')) {
    migratedUnlockedModifiers.push('tight_rope');
  }

  // Auto-unlock Cold Sea nếu đã clear >= 10 màn Tight Rope
  if (
    migratedTightRopeLevels.length >= 10 &&
    !migratedUnlockedModifiers.includes('cold_sea')
  ) {
    migratedUnlockedModifiers.push('cold_sea');
  }

  return {
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    highestCompletedLevel: typeof raw.highestCompletedLevel === 'number' ? raw.highestCompletedLevel : fallback.highestCompletedLevel,
    coins: typeof raw.coins === 'number' ? raw.coins : fallback.coins,
    leaves: typeof raw.leaves === 'number' ? raw.leaves : fallback.leaves,
    boosters: raw.boosters && typeof raw.boosters === 'object' ? raw.boosters : fallback.boosters,
    constructions: raw.constructions && typeof raw.constructions === 'object' ? raw.constructions : fallback.constructions,
    claimedChestIds: Array.isArray(raw.claimedChestIds) ? raw.claimedChestIds : fallback.claimedChestIds,
    hasGoldenTicket: typeof raw.hasGoldenTicket === 'boolean' ? raw.hasGoldenTicket : fallback.hasGoldenTicket,
    playMode: migratedPlayMode,
    gameModifier: migratedGameModifier,
    unlockedModifiers: migratedUnlockedModifiers,
    tightRopeLevelsCleared: migratedTightRopeLevels,
    latestChapterExplore: typeof raw.latestChapterExplore === 'number' ? raw.latestChapterExplore : 0,
    latestMemories: typeof raw.latestMemories === 'number' ? raw.latestMemories : 0,
    chosenBypass: raw.chosenBypass && typeof raw.chosenBypass === 'object' ? raw.chosenBypass : {},
    memories: Array.isArray(raw.memories) ? raw.memories : [],
    mobileTutorialSeenGroups: Array.isArray(raw.mobileTutorialSeenGroups)
      ? raw.mobileTutorialSeenGroups
      : [],
    onboardingStage: migratedStage,
    seenTutorials: raw.seenTutorials && typeof raw.seenTutorials === 'object' ? raw.seenTutorials : {},
  };
}

// ─────────────────────────────────────────────────────────────────
// LWW decision + conflict detection
// ─────────────────────────────────────────────────────────────────

export type SyncDirection = 'push' | 'pull' | 'noop';

export function decideSyncDirection(
  local: CloudSaveBlob | null,
  cloud: CloudSaveBlob | null
): SyncDirection {
  if (!local && !cloud) return 'noop';
  if (local && !cloud) return 'push';
  if (!local && cloud) return 'pull';

  const localTs = local!.updatedAt ?? 0;
  const cloudTs = cloud!.updatedAt ?? 0;

  if (Math.abs(localTs - cloudTs) < 60_000) return 'pull';

  return localTs > cloudTs ? 'push' : 'pull';
}

export function blobsAreMeaningfullyDifferent(
  local: CloudSaveBlob | null,
  cloud: CloudSaveBlob | null
): boolean {
  if (!local || !cloud) return false;

  const localTs = local.updatedAt ?? 0;
  const cloudTs = cloud.updatedAt ?? 0;
  if (Math.abs(localTs - cloudTs) >= 60_000) return false;

  const fields: (keyof CloudSaveBlob)[] = [
    'highestCompletedLevel',
    'coins',
    'leaves',
    'hasGoldenTicket',
    'onboardingStage',
    'gameModifier',
  ];

  for (const field of fields) {
    if (local[field] !== cloud[field]) return true;
  }

  const eqArr = (a: any[], b: any[]) => JSON.stringify(a) === JSON.stringify(b);
  const eqObj = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

  if (!eqArr(local.claimedChestIds, cloud.claimedChestIds)) return true;
  if (!eqObj(local.constructions, cloud.constructions)) return true;
  if (!eqObj(local.boosters, cloud.boosters)) return true;
  if (!eqObj(local.seenTutorials, cloud.seenTutorials)) return true;
  if (!eqArr(local.unlockedModifiers, cloud.unlockedModifiers)) return true;
  if (!eqArr(local.tightRopeLevelsCleared, cloud.tightRopeLevelsCleared)) return true;

  return false;
}