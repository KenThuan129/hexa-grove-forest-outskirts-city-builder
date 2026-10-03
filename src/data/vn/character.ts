// src/data/vn/characters.ts

import type { VNCharacter } from '../../types/vn';

/**
 * The canonical registry of VN characters.
 *
 * `portraitSrc` is intentionally omitted on all entries for now — the VN
 * stage falls back to CSS silhouette placeholders built from `color` and
 * `speakerType`. When real portraits are ready, add `portraitSrc` and the
 * placeholder automatically gives way.
 */
export const VN_CHARACTERS: Record<string, VNCharacter> = {
  narration: {
    id: 'narration',
    name: '',
    role: 'Narration',
    color: '#cbd5e1', // soft slate
    speakerType: 'narration',
    defaultAnchor: 'center',
  },

  kid: {
    id: 'kid',
    name: 'The Young Pioneer',
    role: 'Runaway Dreamer',
    color: '#f0c674', // warm amber, the pioneer's lantern
    speakerType: 'kid',
    avatarIcon: '👦',
    defaultAnchor: 'left',
  },

  nature: {
    id: 'nature',
    name: 'Forest Whispers',
    role: 'Guardian Spirit of the Dream Forest',
    color: '#8fbc6f', // moss green
    speakerType: 'nature',
    avatarIcon: '🌿',
    defaultAnchor: 'right',
  },

  people: {
    id: 'people',
    name: 'ACE of People',
    role: 'Steward of Harmony',
    color: '#fbbf24', // sunlit amber
    speakerType: 'people',
    avatarIcon: '💛',
    defaultAnchor: 'right',
  },

  self: {
    id: 'self',
    name: 'ACE of Self',
    role: 'Crimson Sovereign',
    color: '#ef4444', // crimson
    speakerType: 'self',
    avatarIcon: '🔥',
    defaultAnchor: 'right',
  },

  traveler: {
    id: 'traveler',
    name: 'Weary Traveler',
    role: 'Seeker of Respite',
    color: '#7dd3fc', // cool sky
    speakerType: 'traveler',
    avatarIcon: '🧳',
    defaultAnchor: 'right',
  },

  system: {
    id: 'system',
    name: 'ACE Guardian',
    role: 'The Bond of Creation',
    color: '#e9d5ff', // lavender
    speakerType: 'system',
    avatarIcon: '✦',
    defaultAnchor: 'center',
  },

  dam: {
    id: 'dam',
    name: 'The Corrupted Dam',
    role: 'Ancient Ruinous Structure',
    color: '#f87171', // alarm red
    speakerType: 'dam',
    avatarIcon: '⚠️',
    defaultAnchor: 'center',
  },
};

export function getCharacter(id: string): VNCharacter | null {
  return VN_CHARACTERS[id] ?? null;
}