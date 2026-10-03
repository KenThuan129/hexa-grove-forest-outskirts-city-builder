// src/types/vn.ts

import type {
  BackgroundMood,
  DialogueOption,
} from './story';

// ─────────────────────────────────────────────────────────────────
// Aspect ratio — per-scene override of the frame shape
// ─────────────────────────────────────────────────────────────────
export type VNAspectRatio = '16:9' | '21:9' | '9:16' | '4:3';

// ─────────────────────────────────────────────────────────────────
// Particle ambiance
// ─────────────────────────────────────────────────────────────────
export type VNParticleType =
  | 'none'
  | 'motes'
  | 'embers'
  | 'petals'
  | 'snow'
  | 'ash'
  | 'rain';

// ─────────────────────────────────────────────────────────────────
// Background layers — stack of images over the base
// ─────────────────────────────────────────────────────────────────
export type VNBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'lighten';

export type VNLayerAnimation = 'none' | 'drift' | 'pulse' | 'shimmer';

export interface VNBackgroundLayer {
  /** Path served from /public or /src/assets. */
  src: string;
  /** 0..1 — how much this layer contributes. Default 1.0. */
  opacity?: number;
  /** CSS mix-blend-mode. Default 'normal'. */
  blendMode?: VNBlendMode;
  /** Slow ambient motion. Default 'none'. */
  animated?: VNLayerAnimation;
  /** Optional parallax strength in pixels for mouse-move effect. Default 0. */
  parallax?: number;
}

export interface VNBackground {
  /**
   * Mood identifier. Used as a fallback gradient when `layers` is absent,
   * so existing legacy chapters with only `backgroundMood` still render.
   */
  mood: BackgroundMood;
  /** Stack of illustration layers, back-to-front. */
  layers?: VNBackgroundLayer[];
  /** Ambient particle overlay. Default 'none'. */
  particles?: VNParticleType;
  /** Darken corners to draw focus to the center. Default true. */
  vignette?: boolean;
  /** Optional light-ray effect from a corner. Default false. */
  lightRays?: boolean;
  /** Optional focus color overlay (tint the whole frame). */
  colorWash?: {
    color: string;
    opacity: number;
  };
}

// ─────────────────────────────────────────────────────────────────
// Characters — definitions vs. placements
// ─────────────────────────────────────────────────────────────────

export type VNSpeakerType =
  | 'kid'
  | 'nature'
  | 'people'
  | 'self'
  | 'traveler'
  | 'system'
  | 'dam'
  | 'narration';

export type VNAnchor =
  | 'left'
  | 'near-left'
  | 'center'
  | 'near-right'
  | 'right';

export interface VNCharacter {
  id: string;
  name: string;
  role: string;
  /** Theme color used for name label, cursor accent, placeholder silhouette. */
  color: string;
  speakerType: VNSpeakerType;
  /**
   * Optional illustration path. When absent, a CSS silhouette placeholder
   * is rendered using `color` and `speakerType`.
   */
  portraitSrc?: string;
  /** Emoji fallback shown in the corner of the name label (optional). */
  avatarIcon?: string;
  /** Where this character stands by default when a scene omits an anchor. */
  defaultAnchor: VNAnchor;
}

export interface VNCharacterPlacement {
  characterId: string;
  anchor: VNAnchor;
  /** Default true. Set false to render the character dimmed and lowered. */
  speaking?: boolean;
  /**
   * Optional expression / pose identifier. Currently used as a data attribute
   * for future sprite swapping.
   */
  mood?: string;
}

// ─────────────────────────────────────────────────────────────────
// Line effects — per-line visual flourishes
// ─────────────────────────────────────────────────────────────────

export type VNLineEffectType =
  | 'shake'
  | 'flash'
  | 'fade-in'
  | 'fade-out'
  | 'zoom'
  | 'cross-fade';

export interface VNLineEffect {
  type: VNLineEffectType;
  /** 1..10 for shake; 0..1 for flash opacity; 0..2 for zoom scale. */
  intensity?: number;
  /** Defaults to 400ms if omitted. */
  durationMs?: number;
  /** Optional color for `flash`. Defaults to '#ffffff'. */
  color?: string;
}

// ─────────────────────────────────────────────────────────────────
// Choices
// ─────────────────────────────────────────────────────────────────

export interface VNChoiceOption {
  id: string;
  label: string;
  description?: string;
  /** ACE bond assignment — mirrors legacy `DialogueOption.aceBond`. */
  aceBond?: 'nature' | 'people' | 'self';
  /** Short affirmation shown after the player picks this option. */
  reflectionResponse?: string;
  /** Persistent flag writes when this option is chosen. */
  setFlags?: Record<string, boolean | number | string>;
  /** Jump targets — if both are omitted, the current scene continues. */
  nextLineId?: string;
  nextSceneId?: string;
}

export interface VNChoice {
  prompt: string;
  options: VNChoiceOption[];
}

// ─────────────────────────────────────────────────────────────────
// Lines
// ─────────────────────────────────────────────────────────────────

export interface VNLine {
  id: string;
  /**
   * Either a `VNCharacter.id` (the character speaks), or the literal
   * string 'narration' (first-person narrative voice, no speaker label).
   */
  speakerId: string;
  text: string;
  /** Visual effects that trigger when this line begins typing. */
  effects?: VNLineEffect[];
  /** Persistent flag writes when this line is reached. */
  setFlags?: Record<string, boolean | number | string>;
  /** Continue to a specific line within the same scene. */
  nextLineId?: string;
  /** Jump to a scene (overrides nextLineId). */
  nextSceneId?: string;
  /** Present a choice instead of automatically advancing. */
  choice?: VNChoice;
}

// ─────────────────────────────────────────────────────────────────
// Scenes and chapters
// ─────────────────────────────────────────────────────────────────

export interface VNScene {
  id: string;
  title?: string;
  background: VNBackground;
  characters?: VNCharacterPlacement[];
  lines: VNLine[];
  /** Default next scene when the last line completes without a jump. */
  nextSceneId?: string;
  /** Ambient audio key (reserved). */
  bgm?: string;
  /**
   * Frame aspect ratio for this scene.
   * Defaults to the engine default (16:9) when omitted.
   */
  aspect?: VNAspectRatio;
}

export interface VNChapter {
  id: number;
  chapterNumber: number;
  title: string;
  subtitle: string;
  levelReq: number;
  sketchIcon: string;
  summary: string;
  bgGradient: string;
  scenes: VNScene[];
  aceLore?: {
    natureMessage: string;
    peopleMessage: string;
    selfMessage: string;
  };
  /**
   * Legacy slides preserved for backward-compat. Not used when `scenes`
   * is non-empty. The adapter populates one or the other.
   */
  legacySlides?: import('./story').DialogueSlide[];
}

// ─────────────────────────────────────────────────────────────────
// Engine state
// ─────────────────────────────────────────────────────────────────

export interface VNHistoryEntry {
  sceneId: string;
  lineId: string;
  speakerId: string;
  speakerName: string;
  text: string;
}

export type VNPlayerMode = 'auto' | 'manual' | 'skip';

export interface VNEngineState {
  chapterId: number | null;
  sceneId: string | null;
  lineId: string | null;
  history: VNHistoryEntry[];
  flags: Record<string, boolean | number | string>;
  typedChars: number;
  isTyping: boolean;
  mode: VNPlayerMode;
  /** Currently selected ACE bond across the chapter, if any. */
  chosenAceBond?: 'nature' | 'people' | 'self';
}

// ─────────────────────────────────────────────────────────────────
// Re-exports for convenience
// ─────────────────────────────────────────────────────────────────

export type { BackgroundMood, DialogueOption };