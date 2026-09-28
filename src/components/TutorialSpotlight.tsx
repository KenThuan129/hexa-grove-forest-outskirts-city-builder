import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ChevronRight, Check } from 'lucide-react';
import { HexPiece, PlacedTile } from '../types/game';
import { sounds } from '../utils/audio';

interface TutorialSpotlightProps {
  levelId: number;
  selectedPiece: HexPiece | null;
  placedTiles: Map<string, PlacedTile[]>;
  canCompletePhase: boolean;
  onCompleteTutorialStep?: () => void;
}

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

type PointerDirection = 'down' | 'left' | 'right' | 'up';

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  levelId,
  selectedPiece,
  placedTiles,
  canCompletePhase,
  onCompleteTutorialStep,
}) => {
  // Level 2 Sub-step Tracking: 1 = Left Sidebar, 2 = Right Sidebar, 3 = Tray list, 4 = Completed
  const [level2Step, setLevel2Step] = useState<number>(1);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  // Reset Level 2 step when switching to level 2
  useEffect(() => {
    if (levelId === 2) {
      setLevel2Step(1);
    }
  }, [levelId]);

  // Level 1 Progress Detection
  const hasPlacedCenter = Boolean(placedTiles.get('0,0')?.length);
  const hasPlacedAmber = Boolean(placedTiles.get('1,0')?.some(t => t.color === 'amber'));
  const isHoldingTimber = selectedPiece?.id === 'p-house-gray';
  const isHoldingAmber = selectedPiece?.color === 'amber';

  // Advance Level 2 tutorial step when player clicks or acknowledges
  const handleAdvanceLevel2 = () => {
    sounds.playPickup();
    setLevel2Step(prev => Math.min(4, prev + 1));
  };

  // If level 2 is at step 3 and user selects a piece, advance to step 4 (dismiss)
  useEffect(() => {
    if (levelId === 2 && level2Step === 3 && selectedPiece) {
      setLevel2Step(4);
    }
  }, [levelId, level2Step, selectedPiece]);

  // Determine current tutorial metadata
  let targetSelector: string | null = null;
  let targetHex: { q: number; r: number } | null = null;
  let title = '';
  let description = '';
  let badgeLabel = 'CLICK';
  let themeColor: 'emerald' | 'amber' | 'cyan' = 'emerald';
  let pointerDirection: PointerDirection = 'down';

  if (levelId === 1) {
    if (!hasPlacedCenter) {
      if (!isHoldingTimber) {
        targetSelector = '[data-tutorial-id="tray-piece-p-house-gray"], [data-piece-index="0"]';
        title = 'Step 1: Select Timber Cottage';
        description = 'Click on the Timber Cottage tile in your inventory tray below to pick it up.';
        badgeLabel = 'CLICK TO HOLD';
        themeColor = 'emerald';
        pointerDirection = 'down';
      } else {
        targetHex = { q: 0, r: 0 };
        title = 'Step 2: Place on Center Hex (0,0)';
        description = 'Click on the central clearing hex in the 3D scene to place your cottage.';
        badgeLabel = 'PLACE HERE';
        themeColor = 'emerald';
        pointerDirection = 'down';
      }
    } else if (!hasPlacedAmber) {
      if (!isHoldingAmber) {
        targetSelector = '[data-tutorial-id="tray-piece-p-house-amber"], [data-piece-index="1"]';
        title = 'Step 3: Select Sunlit Townhall (Amber)';
        description = 'Click on the golden Sunlit Townhall to prepare it for the sunlit zone.';
        badgeLabel = 'CLICK TO HOLD';
        themeColor = 'amber';
        pointerDirection = 'down';
      } else {
        targetHex = { q: 1, r: 0 };
        title = 'Step 4: Align with Golden Zone (1,0)';
        description = 'Click on the glowing amber hex on the board to fulfill the color requirement!';
        badgeLabel = 'MATCH AMBER';
        themeColor = 'amber';
        pointerDirection = 'down';
      }
    } else {
      // Level 1 Completed - Both pieces placed and verified!
      targetSelector = null;
      targetHex = null;
      title = '🎉 Tutorial Step 1 Completed!';
      description = 'All dwellings aligned perfectly! Click "Continue to Level 2" to advance.';
      badgeLabel = 'CONTINUE';
      themeColor = 'emerald';
      pointerDirection = 'down';
    }
  } else if (levelId === 2) {
    if (level2Step === 1) {
      targetSelector = '[data-tutorial-id="left-sidebar-panel"]';
      title = 'Step 1: Frontier Building Quota';
      description = 'The Left Sidebar tracks your Building Quota vs Par allowance. Click this panel to acknowledge.';
      badgeLabel = 'CLICK PANEL';
      themeColor = 'emerald';
      pointerDirection = 'left';
    } else if (level2Step === 2) {
      targetSelector = '[data-tutorial-id="right-sidebar-panel"]';
      title = 'Step 2: Target Color Zones';
      description = 'The Right Sidebar shows Amber & Emerald objectives. Match tiles to clear them. Click this panel to acknowledge.';
      badgeLabel = 'CLICK PANEL';
      themeColor = 'cyan';
      pointerDirection = 'right';
    } else if (level2Step === 3) {
      targetSelector = '[data-tutorial-id="tile-tray-container"]';
      title = 'Step 3: Pick & Place Tiles';
      description = 'Now click on any tile in the inventory tray below and place it on the board!';
      badgeLabel = 'SELECT ANY TILE';
      themeColor = 'amber';
      pointerDirection = 'down';
    }
  } else if (levelId === 3 && placedTiles.size === 0) {
    targetHex = { q: 0, r: 0 };
    title = 'Level 3: Penalty Discovery';
    description = 'Place tiles to match the zones. Stacking on an occupied cell will demonstrate the Overlap Penalty!';
    badgeLabel = 'TRY PLACING HERE';
    themeColor = 'amber';
    pointerDirection = 'down';
  }

  const targetHexQ = targetHex ? targetHex.q : null;
  const targetHexR = targetHex ? targetHex.r : null;

  // Update target bounding box dynamically with zero lag across window resize and DOM reflow
  const updateTargetRect = useCallback(() => {
    let newRect: TargetRect | null = null;

    // 1. Try 3D Hex Projection if targeting board coordinate
    if (targetHexQ !== null && targetHexR !== null) {
      const getHexPos = (window as any).__hexaGetHexScreenPos;
      if (typeof getHexPos === 'function') {
        const hexRect = getHexPos(targetHexQ, targetHexR);
        if (hexRect) {
          newRect = {
            left: hexRect.left,
            top: hexRect.top,
            width: hexRect.width,
            height: hexRect.height,
            right: hexRect.right,
            bottom: hexRect.bottom,
            centerX: hexRect.x,
            centerY: hexRect.y,
          };
        }
      }
      // Fallback: screen center if 3D scene is initializing
      if (!newRect) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2 - 20;
        newRect = {
          left: cx - 44,
          top: cy - 44,
          width: 88,
          height: 88,
          right: cx + 44,
          bottom: cy + 44,
          centerX: cx,
          centerY: cy,
        };
      }
    } else if (targetSelector) {
      // 2. Try DOM element selector
      const el = document.querySelector(targetSelector);
      if (el) {
        const domRect = el.getBoundingClientRect();
        if (domRect.width > 0 && domRect.height > 0) {
          newRect = {
            left: domRect.left,
            top: domRect.top,
            width: domRect.width,
            height: domRect.height,
            right: domRect.right,
            bottom: domRect.bottom,
            centerX: domRect.left + domRect.width / 2,
            centerY: domRect.top + domRect.height / 2,
          };
        }
      }
    }

    setTargetRect(prev => {
      if (!prev && !newRect) return null;
      if (prev && newRect) {
        if (
          Math.abs(prev.left - newRect.left) < 0.5 &&
          Math.abs(prev.top - newRect.top) < 0.5 &&
          Math.abs(prev.width - newRect.width) < 0.5 &&
          Math.abs(prev.height - newRect.height) < 0.5
        ) {
          return prev;
        }
      }
      return newRect;
    });
  }, [targetSelector, targetHexQ, targetHexR]);

  // Keep target box synced with screen animations, layout shifts, resize, and scroll
  useEffect(() => {
    updateTargetRect();
    let animId: number;
    const loop = () => {
      updateTargetRect();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  // Dismiss conditions (only active on Levels 1, 2, 3)
  if (levelId > 3) {
    return null;
  }
  if (levelId === 2 && (level2Step >= 4 || placedTiles.size > 0)) {
    return null;
  }
  if (levelId === 3 && placedTiles.size > 0) {
    return null;
  }
  if (!title) {
    return null;
  }

  // Padding around cutout hole
  const padding = targetHex ? 6 : 8;
  const rx = targetHex ? 24 : 20;

  const colorStyles = {
    emerald: {
      ring: 'ring-emerald-400 border-emerald-400',
      badge: 'bg-emerald-400 text-slate-950 shadow-emerald-500/50',
      glow: 'shadow-[0_0_35px_rgba(52,211,153,0.65)]',
      text: 'text-emerald-300',
      iconBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400',
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    },
    amber: {
      ring: 'ring-amber-400 border-amber-400',
      badge: 'bg-amber-400 text-slate-950 shadow-amber-500/50',
      glow: 'shadow-[0_0_35px_rgba(245,158,11,0.65)]',
      text: 'text-amber-300',
      iconBg: 'bg-amber-500/20 border-amber-400/40 text-amber-400',
      btn: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    },
    cyan: {
      ring: 'ring-cyan-400 border-cyan-400',
      badge: 'bg-cyan-400 text-slate-950 shadow-cyan-500/50',
      glow: 'shadow-[0_0_35px_rgba(6,182,212,0.65)]',
      text: 'text-cyan-300',
      iconBg: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400',
      btn: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    },
  }[themeColor];

  // Determine smart placement of the guidance banner so it never overlaps the highlighted element
  const isTargetAtTop = Boolean(targetRect && targetRect.top < 160 && targetSelector);

  return (
    <div className="fixed inset-0 z-30 overflow-hidden select-none pointer-events-none">
      {/* SVG Mask Cutout: Dims entire screen EXCEPT target bounding box (100% crystal clear & unclouded) */}
      {targetRect && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none"
          style={{ width: '100vw', height: '100vh' }}
        >
          <defs>
            <mask id="tutorial-spotlight-mask">
              {/* White background: dark veil will show */}
              <rect width="100%" height="100%" fill="white" />
              {/* Black cutout: dark veil becomes 100% transparent here! */}
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={rx}
                fill="black"
              />
            </mask>
          </defs>

          {/* Backdrop rect with mask applied */}
          <rect
            width="100%"
            height="100%"
            fill="rgba(2, 6, 23, 0.72)"
            mask="url(#tutorial-spotlight-mask)"
          />
        </svg>
      )}

      {/* Click backdrop area for Level 2 interactive step progression */}
      {levelId === 2 && (
        <div
          onClick={handleAdvanceLevel2}
          className="fixed inset-0 pointer-events-auto cursor-pointer"
        />
      )}

      {/* Glowing Cutout Highlight Frame & Hand Pointer */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
          onClick={levelId === 2 ? handleAdvanceLevel2 : undefined}
          className={`rounded-3xl ring-4 ${colorStyles.ring} ${colorStyles.glow} transition-all duration-150 animate-pulse pointer-events-none z-40`}
        >
          {/* Hand Pointing Gesture with Direction & Action Badge */}
          {(() => {
            if (pointerDirection === 'down') {
              return (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                  <span className="text-4xl animate-bounce filter drop-shadow-lg">👇</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${colorStyles.badge} whitespace-nowrap`}
                  >
                    {badgeLabel}
                  </span>
                </div>
              );
            }
            if (pointerDirection === 'left') {
              return (
                <div className="absolute top-1/2 -right-16 -translate-y-1/2 flex flex-col items-center gap-1">
                  <span className="text-4xl animate-bounce filter drop-shadow-lg">👈</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${colorStyles.badge} whitespace-nowrap`}
                  >
                    {badgeLabel}
                  </span>
                </div>
              );
            }
            if (pointerDirection === 'right') {
              return (
                <div className="absolute top-1/2 -left-16 -translate-y-1/2 flex flex-col items-center gap-1">
                  <span className="text-4xl animate-bounce filter drop-shadow-lg">👉</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${colorStyles.badge} whitespace-nowrap`}
                  >
                    {badgeLabel}
                  </span>
                </div>
              );
            }
            return (
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${colorStyles.badge} whitespace-nowrap`}
                >
                  {badgeLabel}
                </span>
                <span className="text-4xl animate-bounce filter drop-shadow-lg">👆</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Floating Guidance Card (Placed opposite to target element to prevent collision) */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto transition-all duration-300 ${
          isTargetAtTop ? 'bottom-28' : 'top-14 sm:top-16'
        }`}
      >
        <div className="p-3.5 bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700/80 rounded-3xl shadow-2xl text-white flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 border ${colorStyles.iconBg}`}
            >
              {levelId === 2 ? (
                <span className="font-black text-xs font-mono">{level2Step}/3</span>
              ) : (
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              )}
            </div>
            <div>
              <h4 className={`text-xs font-black tracking-tight ${colorStyles.text}`}>
                {title}
              </h4>
              <p className="text-[11px] text-slate-200 leading-snug">{description}</p>
            </div>
          </div>

          {/* Level 1 Victory Continue Button */}
          {levelId === 1 && (canCompletePhase || (hasPlacedCenter && hasPlacedAmber)) && onCompleteTutorialStep && (
            <button
              data-tutorial-id="tutorial-continue-btn"
              onClick={onCompleteTutorialStep}
              className={`px-4 py-2 ${colorStyles.btn} font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-emerald-500/40 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 animate-pulse hover:scale-105 active:scale-95`}
            >
              <span>Continue to Level 2</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Level 2 Next Step Button */}
          {levelId === 2 && (
            <button
              onClick={handleAdvanceLevel2}
              className={`px-3.5 py-1.5 ${colorStyles.btn} font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer shrink-0 flex items-center gap-1`}
            >
              <span>{level2Step === 3 ? 'Got it!' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
