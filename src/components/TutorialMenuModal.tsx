// src/components/TutorialMenuModal.tsx

import React, { useMemo } from 'react';
import { X, Play, Lock, CheckCircle2, BookOpen, RotateCw, Lightbulb, Home, Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface TutorialEntry {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  /** Minimum highestCompletedLevel required to unlock this tutorial */
  unlockLevel: number;
  /** Target level id to replay */
  targetLevelId: number;
  /** Total steps in this tutorial (for 50% skip gate) */
  totalSteps: number;
}

interface TutorialMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  highestCompletedLevel: number;
  seenTutorials: Record<string, number>;
  onReplayTutorial: (tutorialId: string, targetLevelId: number) => void;
}

const TUTORIAL_CATALOG: TutorialEntry[] = [
  {
    id: 'basic_placement',
    title: 'Basic: Placing Tiles',
    description: 'Learn to select a tile, place it on the board, and match colored cells.',
    icon: <Sparkles className="w-4 h-4 text-amber-300" />,
    unlockLevel: 1,
    targetLevelId: 1,
    totalSteps: 4,
  },
  {
    id: 'rotate_budget',
    title: 'Rotate & Budget',
    description: 'Learn cluster rotation, undo, and watching your Lightbulb budget.',
    icon: <RotateCw className="w-4 h-4 text-cyan-300" />,
    unlockLevel: 2,
    targetLevelId: 2,
    totalSteps: 4,
  },
  {
    id: 'expand_zones',
    title: 'Expanding & Color Zones',
    description: 'Fill target color zones to unlock new phases of the frontier.',
    icon: <Lightbulb className="w-4 h-4 text-emerald-300" />,
    unlockLevel: 3,
    targetLevelId: 3,
    totalSteps: 3,
  },
  {
    id: 'home_navigation',
    title: 'Home Navigation',
    description: 'Tour the Home screen: campaign, memories, editor, and settings.',
    icon: <Home className="w-4 h-4 text-[#f0c674]" />,
    unlockLevel: 5,
    targetLevelId: 5,
    totalSteps: 5,
  },
];

export const TutorialMenuModal: React.FC<TutorialMenuModalProps> = ({
  isOpen,
  onClose,
  highestCompletedLevel,
  seenTutorials,
  onReplayTutorial,
}) => {
  const entries = useMemo(() => {
    return TUTORIAL_CATALOG.map(t => {
      const unlocked = highestCompletedLevel >= t.unlockLevel;
      const seenStep = seenTutorials[t.id] ?? 0;
      const canSkip = seenStep >= Math.ceil(t.totalSteps * 0.5);
      return { ...t, unlocked, seenStep, canSkip };
    });
  }, [highestCompletedLevel, seenTutorials]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">
                Tutorial Library
              </h2>
              <p className="text-[11px] text-slate-400">
                Replay any tutorial you've unlocked. First-time tutorials must reach 50% before skipping.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {entries.map(entry => (
            <div
              key={entry.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                entry.unlocked
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                {entry.unlocked ? entry.icon : <Lock className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white">{entry.title}</span>
                  {entry.canSkip && entry.unlocked && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      SKIPPABLE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {entry.description}
                </p>
                {!entry.unlocked && (
                  <span className="text-[10px] text-amber-400/80 font-mono mt-1 block">
                    Unlocks at Level {entry.unlockLevel}
                  </span>
                )}
                {entry.unlocked && entry.seenStep > 0 && (
                  <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Progress: {entry.seenStep}/{entry.totalSteps}
                  </span>
                )}
              </div>
              {entry.unlocked && (
                <button
                  onClick={() => {
                    sounds.playVictory();
                    onReplayTutorial(entry.id, entry.targetLevelId);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] shadow-md transition-all cursor-pointer flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Replay
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Close</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};