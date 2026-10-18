// src/components/InlineTutorialOverlay.tsx

import React, { useEffect, useState } from 'react';
import { Sparkles, Check, RotateCw, X as XIcon, ArrowRight, Undo2, AlertTriangle } from 'lucide-react';
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
  onStepSeen?: (tutorialId: string, stepIndex: number) => void;
}

type StepIcon = 'sparkle' | 'rotate' | 'undo' | 'check' | 'arrow' | 'warning';

type Step = {
  id: string;
  title: string;
  description: string;
  icon: StepIcon;
  position: 'center' | 'top' | 'bottom';
  isInterrupt?: boolean; // Cho popup Warning
};

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

  // Phase 2 (Interrupted check)
  const topCell = placedTiles.get(coordKey(0, 0))?.length ?? 0;
  const bottomCell = placedTiles.get(coordKey(0, 1))?.length ?? 0;

  // Tìm xem có tile nào trên board ở phase này là Duo không
  let isDuoPlaced = false;
  placedTiles.forEach((stack) => {
    if (stack.length > 0) {
      const top = stack[stack.length - 1];
      // Nếu là khối Duo (clusterShape >= 2) hoặc lấy từ lightbulbCost = 2
      if ((top.clusterShape?.length ?? 0) > 1 || top.lightbulbCost === 2) {
        isDuoPlaced = true;
      }
    }
  });

  // Nếu phát hiện user đã đặt Duo ở Phase 2, hiện ngay popup Interrupted bắt Undo
  if (isDuoPlaced) {
    return [{
      id: 'lv2p2-interrupted',
      title: 'Budget Interrupted!',
      description: 'Bạn vừa dùng khối Duo (2 Lightbulbs) cho phase này. Hãy thu hồi (Undo) khối Duo và dùng các khối Single nhỏ thay thế để tối ưu!',
      icon: 'warning',
      position: 'center',
      isInterrupt: true,
    }];
  }

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

export const InlineTutorialOverlay: React.FC<InlineTutorialOverlayProps> = ({
  levelId,
  phaseIndex,
  placedTiles,
  selectedPiece,
  rotationsPerformed,
  onStepSeen,
}) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

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

    const tutorialId = levelId === 1 ? 'basic_placement' : 'rotate_budget';
    onStepSeen?.(tutorialId, dismissed.size + 1);
  };

  const iconEl =
    visibleStep.icon === 'rotate' ? <RotateCw className="w-4 h-4 text-amber-300" /> :
    visibleStep.icon === 'undo' ? <Undo2 className="w-4 h-4 text-rose-300" /> :
    visibleStep.icon === 'check' ? <Check className="w-4 h-4 text-emerald-300" /> :
    visibleStep.icon === 'arrow' ? <ArrowRight className="w-4 h-4 text-cyan-300" /> :
    visibleStep.icon === 'warning' ? <AlertTriangle className="w-5 h-5 text-rose-400" /> :
    <Sparkles className="w-4 h-4 text-amber-300" />;

  // Nếu là popup Interrupted thì style khác biệt (to hơn, giữa màn hình)
  const isInterrupt = visibleStep.isInterrupt;
  const positionClass = isInterrupt 
    ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto w-[90%] max-w-sm'
    : visibleStep.position === 'bottom'
      ? 'fixed bottom-40 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-sm'
      : visibleStep.position === 'top'
        ? 'fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-sm'
        : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-auto max-w-sm';

  return (
    <div className={positionClass}>
      <div className={`px-4 py-3 rounded-2xl backdrop-blur-xl border-2 shadow-2xl flex flex-col gap-2 text-white animate-in zoom-in-95 duration-200 ${
        isInterrupt 
          ? 'bg-rose-950/95 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]' 
          : 'bg-slate-950/95 border-amber-500/60'
      }`}>
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
            isInterrupt ? 'bg-rose-900 border-rose-700' : 'bg-slate-800 border-slate-700'
          }`}>
            {iconEl}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-black tracking-wide ${
              isInterrupt ? 'text-rose-200' : 'text-amber-200'
            }`}>
              {visibleStep.title}
            </div>
            <div className={`text-[11.5px] mt-1 leading-snug font-medium ${
              isInterrupt ? 'text-rose-100' : 'text-slate-300'
            }`}>
              {visibleStep.description}
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className={`self-end text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            isInterrupt
              ? 'bg-rose-800 hover:bg-rose-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {isInterrupt ? 'I Understand' : 'Got it →'}
        </button>
      </div>
    </div>
  );
};