// src/components/InlineTutorialOverlay.tsx

import React, { useEffect, useState } from 'react';
import { Sparkles, Check, RotateCw, X as XIcon, ArrowRight, Undo2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import type { PlacedTile, HexPiece } from '../types/game';
import { coordKey } from '../utils/hexMath';

interface InlineTutorialOverlayProps {
  levelId: number;
  phaseIndex: number;
  placedTiles: Map<string, PlacedTile[]>;
  selectedPiece: HexPiece | null;
  rotationsPerformed: number;
  onComplete: () => void;
  /** Fires when user acknowledges (dismisses) a step. Used to track 50% skip progress. */
  onStepSeen?: (tutorialId: string, stepIndex: number) => void;
}

type StepIcon = 'sparkle' | 'rotate' | 'undo' | 'check' | 'arrow';

type Step = {
  id: string;
  title: string;
  description: string;
  icon: StepIcon;
  position: 'center' | 'top' | 'bottom';
};

// ─────────────────────────────────────────────────────────────
// Level 1 — steps based on phase and progress
// ─────────────────────────────────────────────────────────────
function resolveLevel1Steps(
  phaseIndex: number,
  placedTiles: Map<string, PlacedTile[]>,
  selectedPiece: HexPiece | null
): Step[] {
  if (phaseIndex === 0) {
    const cell = placedTiles.get(coordKey(0, 0));
    const hasPlaced = Boolean(cell && cell.length > 0);
    if (hasPlaced) return [];

    if (!selectedPiece) {
      return [{
        id: 'lv1p1-select',
        title: 'Pick a tile from your tray',
        description: 'Tap any tile below to pick it up.',
        icon: 'sparkle',
        position: 'bottom',
      }];
    }
    return [{
      id: 'lv1p1-place',
      title: 'Place it on the glowing cell',
      description: 'Tap the highlighted cell on the board to place your tile.',
      icon: 'arrow',
      position: 'top',
    }];
  }

  // Phase 2: 4 colored cells + 1 neutral center (5 total)
  const amber = placedTiles.get(coordKey(1, 0))?.length ?? 0;
  const emerald = placedTiles.get(coordKey(0, 1))?.length ?? 0;
  const sapphire = placedTiles.get(coordKey(-1, 1))?.length ?? 0;
  const ruby = placedTiles.get(coordKey(-1, 0))?.length ?? 0;
  const center = placedTiles.get(coordKey(0, 0))?.length ?? 0;

  const filled = [amber, emerald, sapphire, ruby, center].filter(x => x > 0).length;
  if (filled >= 5) return [];

  if (filled === 0) {
    return [{
      id: 'lv1p2-start',
      title: 'Match the colors',
      description: 'Each colored cell only accepts its matching color. The gray center accepts any tile.',
      icon: 'sparkle',
      position: 'top',
    }];
  }

  return [{
    id: 'lv1p2-continue',
    title: `${filled}/5 cells filled`,
    description: 'Keep going — fill every glowing cell to complete the phase.',
    icon: 'arrow',
    position: 'top',
  }];
}

// ─────────────────────────────────────────────────────────────
// Level 2 — teaches drag, rotate, undo, size consideration
// ─────────────────────────────────────────────────────────────
function resolveLevel2Steps(
  phaseIndex: number,
  placedTiles: Map<string, PlacedTile[]>,
  selectedPiece: HexPiece | null,
  rotationsPerformed: number
): Step[] {
  if (phaseIndex === 0) {
    const a = placedTiles.get(coordKey(0, 0))?.length ?? 0;
    const b = placedTiles.get(coordKey(1, 0))?.length ?? 0;
    if (a > 0 && b > 0) return [];

    if (!selectedPiece) {
      return [{
        id: 'lv2p1-pick',
        title: 'Drag the Emerald Duo onto the board',
        description: 'This 2-hex cluster fills both glowing cells at once.',
        icon: 'sparkle',
        position: 'bottom',
      }];
    }
    return [{
      id: 'lv2p1-place',
      title: 'Place the duo',
      description: 'Tap the two glowing cells.',
      icon: 'arrow',
      position: 'top',
    }];
  }

  // Phase 2: vertical duo — must rotate 60° first
  const topCell = placedTiles.get(coordKey(0, 0))?.length ?? 0;
  const bottomCell = placedTiles.get(coordKey(0, 1))?.length ?? 0;

  if (topCell > 0 && bottomCell > 0) return [];

  if (rotationsPerformed === 0) {
    return [{
      id: 'lv2p2-rotate',
      title: 'Rotate the cluster',
      description: 'The default shape will not fit. Tap the Rotate button below (or press R on PC).',
      icon: 'rotate',
      position: 'top',
    }];
  }

  if (rotationsPerformed >= 1 && (topCell === 0 || bottomCell === 0)) {
    return [{
      id: 'lv2p2-place',
      title: 'Now place it vertically',
      description: 'The two glowing cells are stacked. Drop the duo onto them.',
      icon: 'arrow',
      position: 'top',
    }];
  }

  return [];
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const InlineTutorialOverlay: React.FC<InlineTutorialOverlayProps> = ({
  levelId,
  phaseIndex,
  placedTiles,
  selectedPiece,
  rotationsPerformed,
  onStepSeen,
}) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Reset dismissed steps when phase changes
  useEffect(() => {
    setDismissed(new Set());
  }, [levelId, phaseIndex]);

  const allSteps =
    levelId === 1
      ? resolveLevel1Steps(phaseIndex, placedTiles, selectedPiece)
      : levelId === 2
        ? resolveLevel2Steps(phaseIndex, placedTiles, selectedPiece, rotationsPerformed)
        : [];

  const visibleStep = allSteps.find(s => !dismissed.has(s.id));

  if (!visibleStep) return null;

  const handleDismiss = () => {
    sounds.playClick();
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(visibleStep.id);
      return next;
    });

    // Report progress for skip gate.
    // Tutorial id matches the IDs used in TutorialMenuModal.
    const tutorialId = levelId === 1 ? 'basic_placement' : 'rotate_budget';
    // Progress = number of steps dismissed so far in this tutorial session.
    // Caller (App) is responsible for taking MAX with previous value.
    onStepSeen?.(tutorialId, dismissed.size + 1);
  };

  const iconEl =
    visibleStep.icon === 'rotate' ? (
      <RotateCw className="w-4 h-4 text-amber-300" />
    ) : visibleStep.icon === 'undo' ? (
      <Undo2 className="w-4 h-4 text-rose-300" />
    ) : visibleStep.icon === 'check' ? (
      <Check className="w-4 h-4 text-emerald-300" />
    ) : visibleStep.icon === 'arrow' ? (
      <ArrowRight className="w-4 h-4 text-cyan-300" />
    ) : (
      <Sparkles className="w-4 h-4 text-amber-300" />
    );

  const positionClass =
    visibleStep.position === 'bottom'
      ? 'fixed bottom-40 left-1/2 -translate-x-1/2 z-40 pointer-events-auto'
      : visibleStep.position === 'top'
        ? 'fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto'
        : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto';

  return (
    <div className={positionClass}>
      <div className="max-w-sm px-4 py-3 rounded-2xl bg-slate-950/95 backdrop-blur-xl border-2 border-amber-500/60 shadow-2xl flex flex-col gap-2 text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            {iconEl}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-amber-200 tracking-wide">
              {visibleStep.title}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {visibleStep.description}
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="self-end text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Got it →
        </button>
      </div>
    </div>
  );
};