// src/data/vn/legacyAdapter.ts

import type {
  StoryChapter,
  DialogueSlide,
} from '../../types/story';
import type {
  VNChapter,
  VNScene,
  VNLine,
  VNCharacterPlacement,
  VNAnchor,
} from '../../types/vn';
import { VN_CHARACTERS } from './character';

// ─────────────────────────────────────────────────────────────────
// Speaker mapping: legacy `SpeakerType` → VN `characterId`
// ─────────────────────────────────────────────────────────────────

function mapSpeakerTypeToCharacterId(speakerType: DialogueSlide['speakerType']): string {
  switch (speakerType) {
    case 'kid':
      return 'kid';
    case 'nature':
      return 'nature';
    case 'people':
      return 'people';
    case 'self':
      return 'self';
    case 'traveler':
      return 'traveler';
    case 'system':
      return 'system';
    case 'dam':
      return 'dam';
    default:
      return 'narration';
  }
}

// ─────────────────────────────────────────────────────────────────
// Position mapping: legacy side-agnostic → VN anchor
//
// Legacy chapters never declared positions. We pick sensible anchors
// based on speaker type so the frame doesn't look empty.
// ─────────────────────────────────────────────────────────────────

function chooseAnchorFor(speakerType: DialogueSlide['speakerType']): VNAnchor {
  switch (speakerType) {
    case 'kid':
      return 'left';
    case 'nature':
    case 'people':
    case 'self':
    case 'traveler':
      return 'right';
    case 'system':
    case 'dam':
    default:
      return 'center';
  }
}

// ─────────────────────────────────────────────────────────────────
// Convert one slide into a VN line
// ─────────────────────────────────────────────────────────────────

function convertSlideToLine(slide: DialogueSlide): VNLine {
  const characterId = mapSpeakerTypeToCharacterId(slide.speakerType);

  const line: VNLine = {
    id: slide.id,
    speakerId: characterId,
    text: slide.text,
  };

  if (slide.optionChoice) {
    line.choice = {
      prompt: slide.optionChoice.prompt,
      options: slide.optionChoice.options.map((opt, idx) => ({
        id: `${slide.id}-opt-${idx}`,
        label: opt.text,
        aceBond: opt.aceBond,
        reflectionResponse: opt.reflectionResponse,
      })),
    };
  }

  return line;
}

// ─────────────────────────────────────────────────────────────────
// Convert one chapter's slides into a single VN scene
//
// Legacy chapters have no scene structure — they're a flat list of
// slides with a single background mood. We wrap the whole chapter in
// one scene. Later, when the story is rewritten into the new format,
// it can be split into many scenes with transitions.
// ─────────────────────────────────────────────────────────────────

function convertChapterToScene(chapter: StoryChapter): VNScene {
  // Collect all speakers who appear in the chapter, deduplicated, so
  // we can pre-place them for the whole scene. The stage will dim
  // non-speaking characters dynamically.
  const speakersSeen = new Set<string>();
  const placements: VNCharacterPlacement[] = [];

  chapter.slides.forEach(slide => {
    const characterId = mapSpeakerTypeToCharacterId(slide.speakerType);
    if (characterId === 'narration') return;
    if (speakersSeen.has(characterId)) return;
    speakersSeen.add(characterId);

    // Only place a character sprite if it isn't already taken by the
    // opposite side. Otherwise skip so the frame doesn't overflow.
    const anchor = chooseAnchorFor(slide.speakerType);
    const anchorOccupied = placements.some(p => p.anchor === anchor);
    if (anchorOccupied) return;

    // Only place the character if we have a definition for them.
    if (!VN_CHARACTERS[characterId]) return;

    placements.push({
      characterId,
      anchor,
      speaking: false,
    });
  });

  return {
    id: `chapter-${chapter.id}`,
    title: chapter.title,
    background: {
      mood: chapter.slides[0]?.backgroundMood ?? 'dream_forest',
      vignette: true,
      particles: 'none',
    },
    characters: placements,
    lines: chapter.slides.map(convertSlideToLine),
  };
}

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

export function convertLegacyChapter(chapter: StoryChapter): VNChapter {
  return {
    id: chapter.id,
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    subtitle: chapter.subtitle,
    levelReq: chapter.levelReq,
    sketchIcon: chapter.sketchIcon,
    summary: chapter.summary,
    bgGradient: chapter.bgGradient,
    scenes: [convertChapterToScene(chapter)],
    aceLore: chapter.aceLore,
    legacySlides: chapter.slides,
  };
}

export function convertLegacyChapters(chapters: StoryChapter[]): VNChapter[] {
  return chapters.map(convertLegacyChapter);
}