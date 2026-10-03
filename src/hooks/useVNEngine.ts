// src/hooks/useVNEngine.ts

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  VNChapter,
  VNScene,
  VNLine,
  VNChoiceOption,
  VNHistoryEntry,
  VNPlayerMode,
  VNEngineState,
} from '../types/vn';
import { VN_CHARACTERS } from '../data/vn/character';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface UseVNEngineOptions {
  /** Called once when the last line of the last scene is consumed. */
  onComplete?: () => void;
  /** Called whenever the active scene changes. */
  onSceneChange?: (scene: VNScene) => void;
  /** Typewriter speed in characters per second. Default 45. */
  typingCps?: number;
  /** Auto-play delay between lines, in ms. Default 2400. */
  autoDelayMs?: number;
  /** Skip-mode tick between lines, in ms. Default 90. */
  skipTickMs?: number;
}

export interface UseVNEngineAPI {
  // ── State
  state: VNEngineState;
  chapter: VNChapter | null;
  scene: VNScene | null;
  line: VNLine | null;
  speaker: { id: string; name: string; color: string } | null;
  visibleText: string;
  fullText: string;
  hasChoice: boolean;
  choiceOptions: VNChoiceOption[];
  isAtEnd: boolean;

  // ── Actions
  start: (chapter: VNChapter, sceneId?: string) => void;
  advance: () => void;
  chooseOption: (option: VNChoiceOption) => void;
  jumpToScene: (sceneId: string) => void;
  setMode: (mode: VNPlayerMode) => void;
  restart: () => void;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────
// The hook
// ─────────────────────────────────────────────────────────────────

export function useVNEngine(options: UseVNEngineOptions = {}): UseVNEngineAPI {
  const {
    onComplete,
    onSceneChange,
    typingCps = 45,
    autoDelayMs = 2400,
    skipTickMs = 90,
  } = options;

  // ── Core state ────────────────────────────────────────────────
  const [chapter, setChapter] = useState<VNChapter | null>(null);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [lineId, setLineId] = useState<string | null>(null);
  const [history, setHistory] = useState<VNHistoryEntry[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean | number | string>>({});
  const [typedChars, setTypedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<VNPlayerMode>('manual');
  const [chosenAceBond, setChosenAceBond] = useState<'nature' | 'people' | 'self' | undefined>(undefined);
  const [selectedChoice, setSelectedChoice] = useState<VNChoiceOption | null>(null);

  // ── Refs to avoid stale closures in timers ────────────────────
  const chapterRef = useRef(chapter);
  const sceneIdRef = useRef(sceneId);
  const lineIdRef = useRef(lineId);
  const modeRef = useRef(mode);
  const typedCharsRef = useRef(typedChars);
  const isTypingRef = useRef(isTyping);
  const selectedChoiceRef = useRef(selectedChoice);

  chapterRef.current = chapter;
  sceneIdRef.current = sceneId;
  lineIdRef.current = lineId;
  modeRef.current = mode;
  typedCharsRef.current = typedChars;
  isTypingRef.current = isTyping;
  selectedChoiceRef.current = selectedChoice;

  // ── Resolved current scene and line ───────────────────────────
  const scene = useMemo<VNScene | null>(() => {
    if (!chapter || !sceneId) return null;
    return chapter.scenes.find((s) => s.id === sceneId) ?? null;
  }, [chapter, sceneId]);

  const line = useMemo<VNLine | null>(() => {
    if (!scene || !lineId) return null;
    return scene.lines.find((l) => l.id === lineId) ?? null;
  }, [scene, lineId]);

  const speaker = useMemo(() => {
    if (!line) return null;
    if (line.speakerId === 'narration') {
      return { id: 'narration', name: '', color: '#cbd5e1' };
    }
    const c = VN_CHARACTERS[line.speakerId];
    if (!c) return null;
    return { id: c.id, name: c.name, color: c.color };
  }, [line]);

  const fullText = line?.text ?? '';
  const visibleText = fullText.slice(0, typedChars);
  const hasChoice = Boolean(line?.choice) && !selectedChoice;
  const choiceOptions = line?.choice?.options ?? [];
  const isAtEnd =
    Boolean(scene) &&
    Boolean(line) &&
    scene!.lines[scene!.lines.length - 1].id === line!.id &&
    !scene!.nextSceneId;

  // ───────────────────────────────────────────────────────────────
  // START
  // ───────────────────────────────────────────────────────────────
  const start = useCallback((nextChapter: VNChapter, startSceneId?: string) => {
    if (!nextChapter || nextChapter.scenes.length === 0) return;

    const firstSceneId = startSceneId ?? nextChapter.scenes[0].id;
    const firstScene = nextChapter.scenes.find((s) => s.id === firstSceneId);
    if (!firstScene || firstScene.lines.length === 0) return;

    setChapter(nextChapter);
    setSceneId(firstSceneId);
    setLineId(firstScene.lines[0].id);
    setHistory([]);
    setFlags({});
    setTypedChars(0);
    setIsTyping(true);
    setMode('manual');
    setChosenAceBond(undefined);
    setSelectedChoice(null);
  }, []);

  // ───────────────────────────────────────────────────────────────
  // RESTART / RESET
  // ───────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    if (!chapter) return;
    start(chapter, chapter.scenes[0].id);
  }, [chapter, start]);

  const reset = useCallback(() => {
    setChapter(null);
    setSceneId(null);
    setLineId(null);
    setHistory([]);
    setFlags({});
    setTypedChars(0);
    setIsTyping(false);
    setMode('manual');
    setChosenAceBond(undefined);
    setSelectedChoice(null);
  }, []);

  // ───────────────────────────────────────────────────────────────
  // JUMP TO SCENE
  // ───────────────────────────────────────────────────────────────
  const jumpToScene = useCallback(
    (nextSceneId: string) => {
      const ch = chapterRef.current;
      if (!ch) return;
      const nextScene = ch.scenes.find((s) => s.id === nextSceneId);
      if (!nextScene || nextScene.lines.length === 0) return;

      setSceneId(nextSceneId);
      setLineId(nextScene.lines[0].id);
      setTypedChars(0);
      setIsTyping(true);
      setSelectedChoice(null);
      onSceneChange?.(nextScene);
    },
    [onSceneChange]
  );

  // ───────────────────────────────────────────────────────────────
  // ADVANCE — move to the next line
  // ───────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    const ch = chapterRef.current;
    const scn = scene;
    const cur = line;
    if (!ch || !scn || !cur) return;

    // If a choice is pending, do nothing on advance — player must pick.
    if (cur.choice && !selectedChoiceRef.current) return;

    // If typing is still in progress, complete the line instantly.
    if (isTypingRef.current) {
      setTypedChars(cur.text.length);
      setIsTyping(false);
      return;
    }

    // Line has setFlags — write them before advancing.
    if (cur.setFlags) {
      setFlags((prev) => ({ ...prev, ...cur.setFlags }));
    }

    // Line ends with a scene jump?
    if (cur.nextSceneId) {
      jumpToScene(cur.nextSceneId);
      return;
    }

    // Line ends with a next line id?
    if (cur.nextLineId) {
      const next = scn.lines.find((l) => l.id === cur.nextLineId);
      if (next) {
        setLineId(next.id);
        setTypedChars(0);
        setIsTyping(true);
        return;
      }
    }

    // Otherwise, natural next line in scene order.
    const idx = scn.lines.findIndex((l) => l.id === cur.id);
    if (idx >= 0 && idx < scn.lines.length - 1) {
      const next = scn.lines[idx + 1];
      setLineId(next.id);
      setTypedChars(0);
      setIsTyping(true);
      return;
    }

    // We're at the end of the scene.
    if (scn.nextSceneId) {
      jumpToScene(scn.nextSceneId);
      return;
    }

    // We're at the end of the chapter.
    onComplete?.();
  }, [scene, line, jumpToScene, onComplete]);

  // ───────────────────────────────────────────────────────────────
  // CHOOSE OPTION
  // ───────────────────────────────────────────────────────────────
  const chooseOption = useCallback(
    (option: VNChoiceOption) => {
      setSelectedChoice(option);

      if (option.aceBond) {
        setChosenAceBond(option.aceBond);
      }

      if (option.setFlags) {
        setFlags((prev) => ({ ...prev, ...option.setFlags }));
      }

      // Jump targets
      if (option.nextSceneId) {
        // Small delay so player sees their pick highlighted, then jump.
        window.setTimeout(() => {
          setSelectedChoice(null);
          jumpToScene(option.nextSceneId!);
        }, 420);
        return;
      }

      if (option.nextLineId) {
        const scn = scene;
        if (!scn) return;
        const next = scn.lines.find((l) => l.id === option.nextLineId);
        if (next) {
          window.setTimeout(() => {
            setSelectedChoice(null);
            setLineId(next.id);
            setTypedChars(0);
            setIsTyping(true);
          }, 420);
          return;
        }
      }

      // No jump target — just continue naturally after a delay.
      window.setTimeout(() => {
        setSelectedChoice(null);
        advance();
      }, 420);
    },
    [scene, jumpToScene, advance]
  );

  // ───────────────────────────────────────────────────────────────
  // TYPEWRITER — reveal characters one at a time
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!line) return;
    if (!isTyping) return;
    if (typedChars >= line.text.length) {
      setIsTyping(false);
      return;
    }

    // Skip mode and auto mode both accelerate typing.
    const effectiveCps =
      mode === 'skip' ? 500 : mode === 'auto' ? typingCps * 1.4 : typingCps;
    const delay = Math.max(12, Math.round(1000 / effectiveCps));

    const timer = window.setTimeout(() => {
      setTypedChars((n) => Math.min(n + 1, line.text.length));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [line, isTyping, typedChars, mode, typingCps]);

  // ───────────────────────────────────────────────────────────────
  // AUTO-PLAY — advance automatically once typing completes
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'auto') return;
    if (!line) return;
    if (isTyping) return;
    if (line.choice && !selectedChoice) return; // pause on choices

    const timer = window.setTimeout(() => {
      advance();
    }, autoDelayMs);

    return () => window.clearTimeout(timer);
  }, [mode, line, isTyping, selectedChoice, autoDelayMs, advance]);

  // ───────────────────────────────────────────────────────────────
  // SKIP MODE — fast-advance
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'skip') return;
    if (!line) return;

    const timer = window.setTimeout(() => {
      // Instantly fill text, then advance
      if (isTyping) {
        setTypedChars(line.text.length);
        setIsTyping(false);
      } else {
        advance();
      }
    }, skipTickMs);

    return () => window.clearTimeout(timer);
  }, [mode, line, isTyping, skipTickMs, advance]);

  // ───────────────────────────────────────────────────────────────
  // HISTORY — push entries as lines complete typing
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scene || !line) return;
    if (isTyping) return;

    const entry: VNHistoryEntry = {
      sceneId: scene.id,
      lineId: line.id,
      speakerId: line.speakerId,
      speakerName: speaker?.name ?? '',
      text: line.text,
    };

    setHistory((prev) => {
      // Avoid duplicate pushes for the same line.
      if (prev.length > 0 && prev[prev.length - 1].lineId === entry.lineId) {
        return prev;
      }
      return [...prev, entry];
    });
  }, [scene, line, isTyping, speaker]);

  // ───────────────────────────────────────────────────────────────
  // BUILD STATE OBJECT
  // ───────────────────────────────────────────────────────────────
  const state: VNEngineState = {
    chapterId: chapter?.id ?? null,
    sceneId,
    lineId,
    history,
    flags,
    typedChars,
    isTyping,
    mode,
    chosenAceBond,
  };

  return {
    state,
    chapter,
    scene,
    line,
    speaker,
    visibleText,
    fullText,
    hasChoice,
    choiceOptions,
    isAtEnd,
    start,
    advance,
    chooseOption,
    jumpToScene,
    setMode,
    restart,
    reset,
  };
}