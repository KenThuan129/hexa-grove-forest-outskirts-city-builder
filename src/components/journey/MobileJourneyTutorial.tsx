// src/components/journey/MobileJourneyTutorial.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  getTutorialGroupForLevel,
  getStepsForGroup,
  type TutorialStep,
} from '../../utils/mobileTutorial';
import { GhostHand } from './GhostHand';
import { sounds } from '../../utils/audio';

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────

interface MobileJourneyTutorialProps {
  levelId: number;
  seenGroups: string[];
  onComplete: (group: string) => void;

  // ── Live game state for auto-advance ─────────────────────────
  hasSelectedPiece: boolean;
  placedCount: number;
  hasPlacedRoad: boolean;
  hasPlacedBridge: boolean;
  rotationsPerformed: number;
}

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

// ─────────────────────────────────────────────────────────────────
// Rect helpers
// ─────────────────────────────────────────────────────────────────

function rectFromDom(el: Element): TargetRect | null {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
  };
}

function rectFromHex(q: number, r: number): TargetRect | null {
  const fn = (window as any).__hexaGetHexScreenPos;
  if (typeof fn !== 'function') return null;
  const hexRect = fn(q, r);
  if (!hexRect || hexRect.width <= 0) return null;
  return {
    left: hexRect.left,
    top: hexRect.top,
    width: hexRect.width,
    height: hexRect.height,
    centerX: hexRect.x,
    centerY: hexRect.y,
  };
}

function rectsEqual(a: TargetRect | null, b: TargetRect | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export const MobileJourneyTutorial: React.FC<MobileJourneyTutorialProps> = ({
  levelId,
  seenGroups,
  onComplete,
  hasSelectedPiece,
  placedCount,
  hasPlacedRoad,
  hasPlacedBridge,
  rotationsPerformed,
}) => {
  const group = useMemo(() => getTutorialGroupForLevel(levelId), [levelId]);
  const steps = useMemo(() => (group ? getStepsForGroup(group) : []), [group]);

  const shouldRun = useMemo(() => {
    if (!group) return false;
    if (steps.length === 0) return false;
    if (seenGroups.includes(group)) return false;
    return true;
  }, [group, steps.length, seenGroups]);

  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const finishedRef = useRef(false);

  // Reset step when group changes
  useEffect(() => {
    setStepIndex(0);
    finishedRef.current = false;
    setIsFadingOut(false);
  }, [group]);

  const currentStep: TutorialStep | null = shouldRun ? steps[stepIndex] ?? null : null;

  // ── Track target rect ───────────────────────────────────────
  useEffect(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const update = () => {
      const target = currentStep.target;
      let next: TargetRect | null = null;
      if (target.kind === 'ui') {
        const el = document.querySelector(target.selector);
        if (el) next = rectFromDom(el);
      } else if (target.kind === 'hex') {
        next = rectFromHex(target.q, target.r);
      }
      setTargetRect((prev) => (rectsEqual(prev, next) ? prev : next));
    };

    update();
    const interval = setInterval(update, 150);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [currentStep]);

  // ── Finish ──────────────────────────────────────────────────
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (!group) return;
    sounds.playVictory();
    setIsFadingOut(true);
    setTimeout(() => onComplete(group), 250);
  }, [group, onComplete]);

  const advanceStep = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, steps.length, finish]);

  // ── Auto-advance watchers ───────────────────────────────────
  // Delay-based step
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'delay') return;
    const t = setTimeout(() => advanceStep(), currentStep.advance.ms);
    return () => clearTimeout(t);
  }, [currentStep, advanceStep]);

  // has-selected-piece step
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'has-selected-piece') return;
    if (hasSelectedPiece) advanceStep();
  }, [currentStep, hasSelectedPiece, advanceStep]);

  // has-placed-tile step
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'has-placed-tile') return;
    if (placedCount > 0) advanceStep();
  }, [currentStep, placedCount, advanceStep]);

  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'has-placed-road') return;
    if (hasPlacedRoad) advanceStep();
  }, [currentStep, hasPlacedRoad, advanceStep]);

  // has-placed-bridge step
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'has-placed-bridge') return;
    if (hasPlacedBridge) advanceStep();
  }, [currentStep, hasPlacedBridge, advanceStep]);
  

  // has-rotated-turntable step
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'has-rotated-turntable') return;
    if (rotationsPerformed > 0) advanceStep();
  }, [currentStep, rotationsPerformed, advanceStep]);

  // has-rotated step (cluster rotate)
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'has-rotated') return;
    // Cluster rotate is not tracked separately yet — stub
  }, [currentStep, advanceStep]);

  // Failsafe: if a target selector never resolves (element missing),
  // auto-advance after 4s so the tutorial never softlocks the player.
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.advance.type !== 'delay' && targetRect) return;

    // Only apply failsafe when advance is action-based AND no target found
    if (currentStep.advance.type === 'delay') return;
    if (targetRect) return;

    const t = setTimeout(() => {
      // If still no target after 4s, skip this step
      if (!targetRect) advanceStep();
    }, 4000);
    return () => clearTimeout(t);
  }, [currentStep, targetRect, advanceStep]);

  if (!shouldRun || !currentStep || isFadingOut) return null;

  // ── Text pill placement (top of screen) ─────────────────────
  const textPillStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    top: 'calc(env(safe-area-inset-top, 0px) + 72px)', // below top bar
    zIndex: 47,
  };

  return (
    <>
      {/* ── Dimmed backdrop (light) ───────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-[40] bg-black/30"
        style={{
          maskImage: targetRect
            ? `radial-gradient(circle at ${targetRect.centerX}px ${targetRect.centerY}px, transparent 0, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20
            }px, black ${Math.max(targetRect.width, targetRect.height) / 2 + 60}px)`
            : undefined,
          WebkitMaskImage: targetRect
            ? `radial-gradient(circle at ${targetRect.centerX}px ${targetRect.centerY}px, transparent 0, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20
            }px, black ${Math.max(targetRect.width, targetRect.height) / 2 + 60}px)`
            : undefined,
        }}
      />

      {/* ── Highlight ring ─────────────────────────────────────── */}
      {targetRect && (
        <div
          className={`fixed pointer-events-none z-[45] rounded-3xl border-4 animate-pulse ${
            currentStep.gesture === 'shake'
              ? 'border-rose-500 shadow-[0_0_28px_rgba(244,63,94,0.8),0_0_60px_rgba(244,63,94,0.4)]'
              : 'border-amber-400 shadow-[0_0_28px_rgba(240,198,116,0.8),0_0_60px_rgba(240,198,116,0.4)]'
          }`}
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* ── Ghost hand ─────────────────────────────────────────── */}
      {targetRect && (
        <GhostHand
          x={targetRect.centerX}
          y={targetRect.centerY}
          gesture={currentStep.gesture ?? 'tap'}
          isError={currentStep.gesture === 'shake'}
        />
      )}

      {/* ── Text pill (small, top of screen) ──────────────────── */}
      <div style={textPillStyle} className="pointer-events-none z-[47]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1f120a]/95 border border-[#f0c674]/60 shadow-lg backdrop-blur-sm">
          <span className="text-[11px] font-black text-[#f4ecd8] font-rounded tracking-wide">
            {currentStep.text}
          </span>
        </div>
      </div>

      {/* ── Skip button (small, top-right) ─────────────────────── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          sounds.playWarning();
          finish();
        }}
        className="fixed z-[47] w-7 h-7 rounded-lg bg-[#a85560]/70 border border-[#e8a8b3]/70 flex items-center justify-center text-[#f4ecd8] active:scale-90 transition-transform"
        style={{
          right: 12,
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
        title="Skip tutorial"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </>
  );
};