// src/data/vn/index.ts

import type { VNChapter } from '../../types/vn';
import { STORY_CHAPTERS } from '../storyData';
import { convertLegacyChapters } from './legacyAdapter';

/**
 * The canonical, built-in VN chapters.
 *
 * These are produced once from the legacy STORY_CHAPTERS definitions by
 * running them through the legacy adapter. From this point forward, all
 * consumers (the VN player, the studio editor, the memories page) work
 * with the VN format directly.
 *
 * The legacy source is kept intact so the adapter can keep regenerating
 * these if the source ever needs to change. Down the road, when all
 * chapters have been hand-authored in the new format, this file will
 * simply export the authored chapters and the legacy import can be
 * dropped.
 */
export const VN_CHAPTERS: VNChapter[] = convertLegacyChapters(STORY_CHAPTERS);

/**
 * Convenience: a map from chapter id -> VNChapter, for O(1) lookups.
 */
export const VN_CHAPTERS_BY_ID: Record<number, VNChapter> = VN_CHAPTERS.reduce(
  (acc, ch) => {
    acc[ch.id] = ch;
    return acc;
  },
  {} as Record<number, VNChapter>
);

/**
 * Retrieves a chapter by id, checking custom chapters first, then the
 * built-in canon. Custom chapters override built-ins by id, which allows
 * the player to "remix" any chapter and keep their version.
 */
export function getChapterById(
  id: number,
  customChapters: VNChapter[] = []
): VNChapter | null {
  const custom = customChapters.find((c) => c.id === id);
  if (custom) return custom;
  return VN_CHAPTERS_BY_ID[id] ?? null;
}