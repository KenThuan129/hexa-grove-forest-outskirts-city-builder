// src/components/vn/VNPlayer.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  FastForward,
  MessageSquare,
  X,
  ChevronRight,
  Settings,
  LogOut,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { VNChapter, VNCharacterPlacement, VNChoiceOption } from '../../types/vn';
import { VN_CHARACTERS } from '../../data/vn/character';
import { useVNEngine } from '../../hooks/useVNEngine';
import { VNStage } from './VNStage';
import { sounds } from '../../utils/audio';

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────

interface VNPlayerProps {
  chapter: VNChapter;
  /** Called when the player dismisses the player. */
  onClose: () => void;
  /** Optional callback when the chapter's final line completes. */
  onComplete?: () => void;
  /** Optional ACE bond selection callback — surfaces the player's pick upward. */
  onSelectAceBond?: (chapterId: number, bond: 'nature' | 'people' | 'self') => void;
  /** Currently selected ACE bond (for chapters replayed from Memory). */
  selectedAceBond?: 'nature' | 'people' | 'self';
  /** Whether to allow sound toggle. Default true. */
  allowSoundToggle?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Character sprite — CSS silhouette placeholder
//
// When `portraitSrc` exists on the character definition, this renders
// an <img>. Otherwise it falls back to a themed abstract silhouette.
// ─────────────────────────────────────────────────────────────────

const VNCharacterSprite: React.FC<{
  placement: VNCharacterPlacement;
  isCurrentlySpeaking: boolean;
}> = ({ placement, isCurrentlySpeaking }) => {
  const character = VN_CHARACTERS[placement.characterId];
  if (!character) return null;

  const active = isCurrentlySpeaking;
  const animKey = active ? 'vn-char-active' : 'vn-char-idle';
  const transitionStyle: React.CSSProperties = {
    transition: 'opacity 400ms ease, filter 400ms ease, transform 400ms ease',
    opacity: active ? 1 : 0.52,
    filter: active ? 'saturate(1) brightness(1)' : 'saturate(0.35) brightness(0.62)',
    transform: active ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
    animation: `${animKey} 3.5s ease-in-out infinite`,
  };

  return (
    <div
      className="relative h-full"
      style={{
        ...transitionStyle,
        // Width is derived from the frame's height via the aspect we set on the inner content.
        width: '100%',
        maxWidth: 340,
      }}
    >
      {character.portraitSrc ? (
        <img
          src={character.portraitSrc}
          alt={character.name}
          draggable={false}
          className="h-full w-full object-contain object-bottom select-none pointer-events-none"
          style={{
            // Subtle drop shadow to lift the sprite off the background
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))',
          }}
        />
      ) : (
        <SilhouettePlaceholder color={character.color} speakerType={character.speakerType} />
      )}

      {/* Name plaque floating just above the sprite's feet (only when speaking) */}
      {active && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
          style={{
            background: 'rgba(0, 0, 0, 0.72)',
            border: `1px solid ${character.color}88`,
            color: character.color,
            boxShadow: `0 0 18px ${character.color}22`,
          }}
        >
          {character.name || character.role}
        </div>
      )}
    </div>
  );
};

// Abstract silhouette placeholder. Uses layered radial/linear gradients
// to feel illustrated rather than iconographic.
const SilhouettePlaceholder: React.FC<{ color: string; speakerType: string }> = ({
  color,
  speakerType,
}) => {
  // Two-tone glow body: a soft head circle + a broader shoulders arc.
  // The color drives everything so each character reads distinctly.
  const gradientBase = `radial-gradient(60% 55% at 50% 70%, ${color}cc 0%, ${color}00 70%)`;

  return (
    <div className="relative h-full w-full flex items-end justify-center">
      {/* Glow halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: gradientBase,
          filter: 'blur(18px)',
        }}
      />
      {/* Head */}
      <div
        className="absolute rounded-full"
        style={{
          width: '34%',
          aspectRatio: '1 / 1',
          bottom: '52%',
          background: `radial-gradient(circle at 50% 40%, ${color} 0%, ${color}66 55%, ${color}22 100%)`,
          boxShadow: `inset 0 0 40px ${color}44, 0 0 40px ${color}55`,
        }}
      />
      {/* Shoulders / body */}
      <div
        className="absolute"
        style={{
          width: '74%',
          height: '58%',
          bottom: 0,
          background: `linear-gradient(to top, ${color}cc 0%, ${color}55 60%, ${color}00 100%)`,
          borderRadius: '50% 50% 0 0 / 40% 40% 0 0',
          boxShadow: `0 -12px 60px ${color}33`,
        }}
      />
      {/* Speaker-type motif hint */}
      <div className="absolute top-2 text-[9px] font-mono uppercase tracking-widest opacity-40">
        {speakerType}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Text layer — typewriter dialogue at the bottom of the frame
// ─────────────────────────────────────────────────────────────────

const VNTextLayer: React.FC<{
  speakerName: string;
  speakerColor: string;
  text: string;
  isNarration: boolean;
  isTyping: boolean;
}> = ({ speakerName, speakerColor, text, isNarration, isTyping }) => {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 px-6 pb-6 sm:px-10 sm:pb-8"
      style={{
        // Keep text above the text-gradient that VNStage renders
        zIndex: 30,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 900,
        }}
      >
        {/* Speaker name (skip for narration) */}
        {!isNarration && speakerName && (
          <div
            className="mb-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]"
            style={{
              color: speakerColor,
              textShadow: '0 1px 8px rgba(0,0,0,0.85)',
            }}
          >
            {speakerName}
          </div>
        )}

        {/* The line itself */}
        <p
          className="font-serif text-white"
          style={{
            fontSize: 'clamp(0.95rem, 1.35vw, 1.15rem)',
            lineHeight: 1.55,
            letterSpacing: '0.01em',
            textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.6)',
            minHeight: '3.2em',
          }}
        >
          {text}
          {isTyping && (
            <span
              className="inline-block align-middle ml-1"
              style={{
                width: 2,
                height: '1em',
                background: speakerColor,
                animation: 'vn-cursor-blink 1s steps(2) infinite',
              }}
            />
          )}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Advance indicator — small pulsing diamond bottom-right
// ─────────────────────────────────────────────────────────────────

const VNAdvanceIndicator: React.FC<{ visible: boolean; color: string }> = ({
  visible,
  color,
}) => {
  if (!visible) return null;
  return (
    <div
      className="absolute bottom-3 right-4 pointer-events-none"
      style={{ zIndex: 31 }}
    >
      <div
        className="w-3 h-3 rotate-45"
        style={{
          background: color,
          boxShadow: `0 0 12px ${color}, 0 0 4px ${color}`,
          animation: 'vn-advance-pulse 1.4s ease-in-out infinite',
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Choice overlay — options rendered over the frame
// ─────────────────────────────────────────────────────────────────

const VNChoiceOverlay: React.FC<{
  prompt: string;
  options: VNChoiceOption[];
  onChoose: (option: VNChoiceOption) => void;
  selectedId: string | null;
  accentColor: string;
}> = ({ prompt, options, onChoose, selectedId, accentColor }) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{
        zIndex: 40,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div className="w-full" style={{ maxWidth: 560 }}>
        <div
          className="mb-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]"
          style={{ color: accentColor }}
        >
          {prompt}
        </div>

        <div className="flex flex-col gap-2.5">
          {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onChoose(opt)}
                disabled={Boolean(selectedId)}
                className="w-full text-left px-5 py-3.5 rounded-xl border transition-all cursor-pointer disabled:cursor-default"
                style={{
                  background: isSelected
                    ? `${accentColor}22`
                    : 'rgba(15, 23, 42, 0.82)',
                  borderColor: isSelected ? accentColor : 'rgba(148, 163, 184, 0.35)',
                  color: isSelected ? accentColor : '#e2e8f0',
                  boxShadow: isSelected ? `0 0 24px ${accentColor}55` : 'none',
                }}
              >
                <div className="text-sm font-bold tracking-wide">{opt.label}</div>
                {opt.description && (
                  <div className="mt-1 text-[11px] opacity-70 leading-snug">
                    {opt.description}
                  </div>
                )}
                {isSelected && opt.reflectionResponse && (
                  <div className="mt-2 text-[11px] italic opacity-90">
                    "{opt.reflectionResponse}"
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// HUD — top-right cluster of controls
// ─────────────────────────────────────────────────────────────────

const VNHud: React.FC<{
  mode: 'manual' | 'auto' | 'skip';
  setMode: (m: 'manual' | 'auto' | 'skip') => void;
  onOpenHistory: () => void;
  onRequestQuit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  visible: boolean;
}> = ({
  mode,
  setMode,
  onOpenHistory,
  onRequestQuit,
  soundEnabled,
  onToggleSound,
  visible,
}) => {
  return (
    <div
      className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-auto transition-opacity duration-300"
      style={{ zIndex: 50, opacity: visible ? 1 : 0.25 }}
    >
      <HudButton
        active={mode === 'auto'}
        onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
        title="Auto-play"
      >
        {mode === 'auto' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span className="text-[10px] font-black tracking-widest hidden sm:inline">AUTO</span>
      </HudButton>

      <HudButton
        active={mode === 'skip'}
        onClick={() => setMode(mode === 'skip' ? 'manual' : 'skip')}
        title="Fast-forward"
      >
        <FastForward className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black tracking-widest hidden sm:inline">SKIP</span>
      </HudButton>

      <HudButton onClick={onOpenHistory} title="Dialogue history">
        <MessageSquare className="w-3.5 h-3.5" />
      </HudButton>

      <HudButton onClick={onToggleSound} title={soundEnabled ? 'Mute' : 'Unmute'}>
        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      </HudButton>

      <HudButton onClick={onRequestQuit} title="Close chapter" danger>
        <X className="w-3.5 h-3.5" />
      </HudButton>
    </div>
  );
};

const HudButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active?: boolean;
  danger?: boolean;
}> = ({ children, onClick, title, active, danger }) => (
  <button
    onClick={onClick}
    title={title}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none"
    style={{
      background: active ? 'rgba(96, 165, 250, 0.22)' : 'rgba(15, 23, 42, 0.75)',
      borderColor: active
        ? 'rgba(96, 165, 250, 0.65)'
        : danger
        ? 'rgba(244, 63, 94, 0.4)'
        : 'rgba(148, 163, 184, 0.3)',
      color: danger ? '#fda4af' : active ? '#bfdbfe' : '#cbd5e1',
    }}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────
// History modal — full-dialogue log
// ─────────────────────────────────────────────────────────────────

const VNHistoryModal: React.FC<{
  history: import('../../types/vn').VNHistoryEntry[];
  onClose: () => void;
}> = ({ history, onClose }) => (
  <div
    className="absolute inset-0 flex items-center justify-center p-4"
    style={{
      zIndex: 70,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
    }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-2xl max-h-[80%] rounded-2xl border p-5 flex flex-col"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(96, 165, 250, 0.35)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
          Dialogue Transcript
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto pr-2 flex flex-col gap-2.5">
        {history.length === 0 ? (
          <div className="text-xs text-slate-500 italic text-center py-6">
            No dialogue recorded yet.
          </div>
        ) : (
          history.map((entry, idx) => (
            <div key={idx} className="text-sm">
              {entry.speakerName && (
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-0.5">
                  {entry.speakerName}
                </div>
              )}
              <div className="text-slate-200 font-serif italic">"{entry.text}"</div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// Quit confirmation modal
// ─────────────────────────────────────────────────────────────────

const VNQuitConfirm: React.FC<{
  chapterTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ chapterTitle, onConfirm, onCancel }) => (
  <div
    className="absolute inset-0 flex items-center justify-center p-4"
    style={{
      zIndex: 80,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
    }}
  >
    <div
      className="w-full max-w-md rounded-2xl border p-6 flex flex-col items-center gap-4 text-center"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(244, 63, 94, 0.4)',
      }}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
        <LogOut className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white">Leave "{chapterTitle}"?</h3>
      <p className="text-xs text-slate-300 font-serif leading-relaxed">
        You can return to this chapter anytime from the Memories gallery.
      </p>
      <div className="flex items-center gap-3 mt-1 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 cursor-pointer"
        >
          Continue Reading
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
        >
          Exit Chapter
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// Main player
// ─────────────────────────────────────────────────────────────────

export const VNPlayer: React.FC<VNPlayerProps> = ({
  chapter,
  onClose,
  onComplete,
  onSelectAceBond,
  selectedAceBond,
  allowSoundToggle = true,
}) => {
  const engine = useVNEngine({
    onComplete,
    onSceneChange: (scene) => {
      // Future: trigger background transition audio here
      void scene;
    },
  });

  const [showHistory, setShowHistory] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const [soundEnabled, setSoundEnabledLocal] = useState(true);

  const hudTimerRef = useRef<number | null>(null);

  // ── Start the engine on chapter change ─────────────────────
  useEffect(() => {
    engine.start(chapter, chapter.scenes[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  // ── HUD auto-hide after inactivity ─────────────────────────
  const nudgeHud = useCallback(() => {
    setHudVisible(true);
    if (hudTimerRef.current) window.clearTimeout(hudTimerRef.current);
    hudTimerRef.current = window.setTimeout(() => setHudVisible(false), 3200);
  }, []);

  useEffect(() => {
    nudgeHud();
    return () => {
      if (hudTimerRef.current) window.clearTimeout(hudTimerRef.current);
    };
  }, [nudgeHud]);

  // ── Broadcast ACE bond selection upward ────────────────────
  useEffect(() => {
    if (engine.state.chosenAceBond && onSelectAceBond) {
      onSelectAceBond(chapter.id, engine.state.chosenAceBond);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.state.chosenAceBond]);

  // ── Sound toggle wrapper ───────────────────────────────────
  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabledLocal(next);
    sounds.enabled = next;
  }, [soundEnabled]);

  // ── Choose handler ─────────────────────────────────────────
  const selectedOptionId =
    engine.line?.choice && engine.hasChoice === false
      ? // If the choice was already picked, find the option that matches the ACE bond (if any)
        engine.state.chosenAceBond
        ? engine.line.choice.options.find((o) => o.aceBond === engine.state.chosenAceBond)?.id ?? null
        : null
      : null;

  // ── Click on frame advances unless a choice is pending ─────
  const handleFrameClick = useCallback(() => {
    if (engine.hasChoice) return;
    engine.advance();
  }, [engine]);

  // ── Guard: chapter must have at least one scene ────────────
  if (!chapter.scenes.length) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center text-sm">
        This chapter has no scenes.
      </div>
    );
  }

  const scene = engine.scene;
  const line = engine.line;

  // ── Determine which character is currently speaking ────────
  const speakingCharacterId = line?.speakerId ?? null;
  const isNarration = speakingCharacterId === 'narration';
  const speakerColor = engine.speaker?.color ?? '#cbd5e1';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      onMouseMove={nudgeHud}
      onClick={nudgeHud}
    >
      {/* ── The stage: black frame with the illustration inside ── */}
      <div className="absolute inset-0" onClick={handleFrameClick}>
        <VNStage
          aspect={scene?.aspect ?? '16:9'}
          background={scene?.background ?? { mood: 'dream_forest' }}
        >
          {/* Character layer */}
          {scene?.characters && scene.characters.length > 0 && (
            <div className="absolute inset-0 flex items-end justify-between px-8 sm:px-14 pb-[14%]">
              {/* Group by anchor; we only support left/right for now */}
              {scene.characters.map((placement) => (
                <div
                  key={placement.characterId}
                  className="flex-1 flex justify-center items-end h-[68%] pointer-events-none"
                  style={{
                    maxWidth: '42%',
                  }}
                >
                  <VNCharacterSprite
                    placement={placement}
                    isCurrentlySpeaking={placement.characterId === speakingCharacterId}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Text layer */}
          {line && (
            <VNTextLayer
              speakerName={engine.speaker?.name ?? ''}
              speakerColor={speakerColor}
              text={engine.visibleText}
              isNarration={isNarration}
              isTyping={engine.state.isTyping}
            />
          )}

          {/* Advance indicator */}
          {line && !engine.state.isTyping && !engine.hasChoice && (
            <VNAdvanceIndicator visible color={speakerColor} />
          )}

          {/* Choice overlay */}
          {engine.hasChoice && line?.choice && (
            <VNChoiceOverlay
              prompt={line.choice.prompt}
              options={line.choice.options}
              onChoose={engine.chooseOption}
              selectedId={selectedOptionId}
              accentColor={speakerColor}
            />
          )}
        </VNStage>
      </div>

      {/* ── HUD chrome, floating over the frame ── */}
      <VNHud
        mode={engine.state.mode}
        setMode={engine.setMode}
        onOpenHistory={() => setShowHistory(true)}
        onRequestQuit={() => setShowQuitConfirm(true)}
        soundEnabled={soundEnabled && allowSoundToggle}
        onToggleSound={handleToggleSound}
        visible={hudVisible}
      />

      {/* ── Modals ── */}
      {showHistory && (
        <VNHistoryModal history={engine.state.history} onClose={() => setShowHistory(false)} />
      )}

      {showQuitConfirm && (
        <VNQuitConfirm
          chapterTitle={chapter.title}
          onConfirm={() => {
            setShowQuitConfirm(false);
            onClose();
          }}
          onCancel={() => setShowQuitConfirm(false)}
        />
      )}

      {/* ── Scoped keyframes ── */}
      <style>{`
        @keyframes vn-cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes vn-advance-pulse {
          0%, 100% { transform: rotate(45deg) scale(0.85); opacity: 0.7; }
          50%      { transform: rotate(45deg) scale(1.15); opacity: 1; }
        }
        @keyframes vn-char-active {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        @keyframes vn-char-idle {
          0%, 100% { transform: translateY(8px); }
          50%      { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
};

export default VNPlayer;