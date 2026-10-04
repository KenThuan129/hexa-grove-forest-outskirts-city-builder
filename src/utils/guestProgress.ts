// src/utils/guestProgress.ts

/**
 * Trial level ids accessible to guests.
 * Order matters: it's the linear progression for the demo.
 */
export const GUEST_TRIAL_LEVEL_IDS = [3, 10, 14, 16, 19] as const;

const KEY_TRIAL_INDEX = 'hexa_guest_trial_index';
const KEY_WELCOME_SEEN = 'hexa_guest_welcome_seen';

/** Reads how many trials the guest has beaten (0..5). */
export function getGuestTrialIndex(): number {
  try {
    const raw = localStorage.getItem(KEY_TRIAL_INDEX);
    const n = raw ? parseInt(raw, 10) : 0;
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(GUEST_TRIAL_LEVEL_IDS.length, n));
  } catch {
    return 0;
  }
}

/** Writes the guest's trial progress index. */
export function setGuestTrialIndex(index: number): void {
  try {
    localStorage.setItem(KEY_TRIAL_INDEX, String(index));
  } catch {
    // ignore
  }
}

/** Advances to the next trial. Returns the new index. */
export function advanceGuestTrial(): number {
  const next = Math.min(GUEST_TRIAL_LEVEL_IDS.length, getGuestTrialIndex() + 1);
  setGuestTrialIndex(next);
  return next;
}

/** Returns the id of the next trial the guest can play, or null if all done. */
export function getNextGuestTrialLevelId(): number | null {
  const idx = getGuestTrialIndex();
  if (idx >= GUEST_TRIAL_LEVEL_IDS.length) return null;
  return GUEST_TRIAL_LEVEL_IDS[idx];
}

/** True if the guest has beaten all trials. */
export function isGuestTrialComplete(): boolean {
  return getGuestTrialIndex() >= GUEST_TRIAL_LEVEL_IDS.length;
}

/** Whether the guest has ever seen the welcome modal. */
export function hasSeenGuestWelcome(): boolean {
  try {
    return localStorage.getItem(KEY_WELCOME_SEEN) === 'true';
  } catch {
    return false;
  }
}

/** Mark the welcome modal as seen. */
export function markGuestWelcomeSeen(): void {
  try {
    localStorage.setItem(KEY_WELCOME_SEEN, 'true');
  } catch {
    // ignore
  }
}