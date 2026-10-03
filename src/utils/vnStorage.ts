// src/utils/vnStorage.ts

import type { VNChapter } from '../types/vn';

const STORAGE_KEY = 'hexa_custom_vn_chapters';

/**
 * Reads all custom VN chapters from localStorage.
 *
 * Fails gracefully: any malformed entry is skipped rather than crashing
 * the whole app. This is important because localStorage can be corrupted
 * by other code, browser extensions, or a bad edit from a previous session.
 */
export function loadCustomVNChapters(): VNChapter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Basic shape validation — must have id, title, and at least one scene.
    return parsed.filter(
      (c): c is VNChapter =>
        c &&
        typeof c.id === 'number' &&
        typeof c.title === 'string' &&
        Array.isArray(c.scenes) &&
        c.scenes.length > 0
    );
  } catch {
    return [];
  }
}

/**
 * Persists an array of custom VN chapters to localStorage.
 * Returns true on success, false if the write failed (quota exceeded,
 * private browsing mode, etc.).
 */
export function saveCustomVNChapters(chapters: VNChapter[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
    return true;
  } catch {
    return false;
  }
}

/**
 * Upserts a single custom chapter by id. If a chapter with the same id
 * already exists, it is replaced. Returns the new full array.
 */
export function upsertCustomVNChapter(chapter: VNChapter): VNChapter[] {
  const existing = loadCustomVNChapters();
  const idx = existing.findIndex((c) => c.id === chapter.id);
  const next =
    idx >= 0
      ? existing.map((c, i) => (i === idx ? chapter : c))
      : [...existing, chapter];
  saveCustomVNChapters(next);
  return next;
}

/**
 * Deletes a custom chapter by id. Returns the new full array.
 */
export function deleteCustomVNChapter(id: number): VNChapter[] {
  const existing = loadCustomVNChapters();
  const next = existing.filter((c) => c.id !== id);
  saveCustomVNChapters(next);
  return next;
}

/**
 * Retrieves a single custom chapter by id, or null if not found.
 */
export function getCustomVNChapter(id: number): VNChapter | null {
  const all = loadCustomVNChapters();
  return all.find((c) => c.id === id) ?? null;
}

/**
 * Generates a fresh chapter id that does not collide with any built-in
 * or custom chapter. Custom chapters use ids starting at 1000.
 */
export function allocateCustomChapterId(existingIds: number[]): number {
  const maxExisting = existingIds.length > 0 ? Math.max(...existingIds) : 999;
  return Math.max(1000, maxExisting + 1);
}