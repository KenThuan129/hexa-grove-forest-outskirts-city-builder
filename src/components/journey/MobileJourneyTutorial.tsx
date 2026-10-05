// src/components/journey/MobileJourneyTutorial.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
    getTutorialGroupForLevel,
    getStepsForGroup,
    type TutorialStep,
    type TutorialTarget,
} from '../../utils/mobileTutorial';
import { sounds } from '../../utils/audio';

import { useLayout } from '../../context/LayoutContext';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface MobileJourneyTutorialProps {
    levelId: number;
    /** Groups the player has already seen or skipped. */
    seenGroups: string[];
    /** Called when the tutorial finishes or is skipped. */
    onComplete: (group: string) => void;
    /** Optional: fired when a step begins (for parent analytics / flow). */
    onStepChange?: (stepId: string, stepIndex: number) => void;
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

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export const MobileJourneyTutorial: React.FC<MobileJourneyTutorialProps> = ({
    levelId,
    seenGroups,
    onComplete,
    onStepChange,
}) => {
    const layout = useLayout();

    const isLandscape = layout.orientation === 'landscape'

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

    const currentStep: TutorialStep | null = shouldRun ? steps[stepIndex] ?? null : null;

    // ── Emit step change ────────────────────────────────────────
    useEffect(() => {
        if (currentStep) onStepChange?.(currentStep.id, stepIndex);
    }, [currentStep, stepIndex, onStepChange]);

    // ── Track target rect for the current step ─────────────────
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
            } else {
                // center — banner will self-center, no highlight
                next = null;
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

    // ── Finish / skip ───────────────────────────────────────────
    const finish = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        if (!group) return;

        sounds.playVictory();
        setIsFadingOut(true);
        setTimeout(() => {
            onComplete(group);
        }, 200);
    }, [group, onComplete]);

    const advanceStep = useCallback(() => {
        if (stepIndex >= steps.length - 1) {
            finish();
        } else {
            sounds.playClick();
            setStepIndex((i) => i + 1);
        }
    }, [stepIndex, steps.length, finish]);

    if (!shouldRun || !currentStep || isFadingOut) return null;

    // ── Compute banner placement ────────────────────────────────
    const bannerPlacement = currentStep.bannerPlacement;

    const bannerStyle: React.CSSProperties = (() => {
        // In landscape, side rails (tray left + booster right) eat ~130px total.
        // Center the banner horizontally in the remaining board area.
        const landscapeCenterLeft = 'calc(50% + 36px)'; // shifted right slightly (tray is 72px, booster 56px → diff/2 = 8px, plus buffer)
        const centerLeft = isLandscape ? landscapeCenterLeft : '50%';
        const landscapeMaxWidth = 280;
        const portraitMaxWidth = 360;

        if (bannerPlacement === 'below-board') {
            return isLandscape
                ? {
                    position: 'fixed',
                    left: centerLeft,
                    transform: 'translateX(-50%)',
                    bottom: 16,
                    width: 'calc(100% - 160px)',
                    maxWidth: landscapeMaxWidth,
                }
                : {
                    position: 'fixed',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '32%',
                    width: 'calc(100% - 32px)',
                    maxWidth: portraitMaxWidth,
                };
        }
        if (bannerPlacement === 'over-board-top') {
            return isLandscape
                ? {
                    position: 'fixed',
                    left: centerLeft,
                    transform: 'translateX(-50%)',
                    top: 56,
                    width: 'calc(100% - 160px)',
                    maxWidth: landscapeMaxWidth,
                }
                : {
                    position: 'fixed',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '18%',
                    width: 'calc(100% - 32px)',
                    maxWidth: portraitMaxWidth,
                };
        }
        // over-board-center
        return isLandscape
            ? {
                position: 'fixed',
                left: centerLeft,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'calc(100% - 160px)',
                maxWidth: landscapeMaxWidth,
            }
            : {
                position: 'fixed',
                left: '50%',
                top: '45%',
                transform: 'translate(-50%, -50%)',
                width: 'calc(100% - 32px)',
                maxWidth: portraitMaxWidth,
            };
    })();

    return (
        <>
            {/* ── Highlight ring on target ────────────────────────── */}
            {targetRect && (
                <div
                    className="fixed pointer-events-none z-[45] rounded-3xl border-4 border-amber-400 shadow-[0_0_28px_rgba(240,198,116,0.8),0_0_60px_rgba(240,198,116,0.4)] animate-pulse"
                    style={{
                        left: targetRect.left - 8,
                        top: targetRect.top - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            {/* ── Dimmed backdrop (very light so player still sees board) ── */}
            <div
                className="fixed inset-0 pointer-events-none z-[40] bg-black/25"
                style={{
                    // Punch a hole around the target via a mask
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

            {/* ── Banner ───────────────────────────────────────────── */}
            <div
                className="pointer-events-auto z-[46] animate-in fade-in slide-in-from-bottom-3 duration-200"
                style={bannerStyle}
            >
                <div className="relative rounded-2xl bg-gradient-to-b from-[#2b1a11] via-[#1f120a] to-[#0f0805] border-2 border-[#f0c674]/70 shadow-[0_8px_28px_rgba(0,0,0,0.6),0_0_20px_rgba(240,198,116,0.3)] px-4 py-3 flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-[#f0c674]/20 border border-[#f0c674]/50 flex items-center justify-center text-2xl shrink-0">
                        👆
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-[#f4ecd8] font-rounded leading-tight">
                            {currentStep.text}
                        </div>
                        {currentStep.hint && (
                            <div className="text-[10.5px] text-[#a8b89a] font-medium mt-0.5 leading-tight">
                                {currentStep.hint}
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono text-[#f0c674]/70">
                                {stepIndex + 1}/{steps.length}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    advanceStep();
                                }}
                                className="text-[10.5px] font-black text-[#f0c674] hover:text-[#fce8ad] underline cursor-pointer"
                            >
                                {stepIndex >= steps.length - 1 ? 'Finish' : 'Next →'}
                            </button>
                        </div>
                    </div>

                    {/* Skip button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            sounds.playWarning();
                            finish();
                        }}
                        className="w-7 h-7 rounded-lg bg-[#a85560]/60 border border-[#e8a8b3]/60 flex items-center justify-center text-[#f4ecd8] shrink-0 active:scale-90 transition-transform"
                        title="Skip tutorial"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </>
    );
};