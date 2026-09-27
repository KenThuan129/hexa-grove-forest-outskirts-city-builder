import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HomeShowcaseSpotlightProps {
  isOpen: boolean;
  currentLevelId: number;
  onClose: () => void;
  onStartLevel: () => void;
  onOpenLevelEditor: () => void;
  onOpenMemories: () => void;
  onOpenRules: () => void;
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

export const HomeShowcaseSpotlight: React.FC<HomeShowcaseSpotlightProps> = ({
  isOpen,
  currentLevelId,
  onClose,
  onStartLevel,
  onOpenLevelEditor,
  onOpenMemories,
  onOpenRules,
}) => {
  const [step, setStep] = useState<number>(1);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const totalSteps = 5;

  const handleNextStep = () => {
    sounds.playPickup();
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      sounds.playVictory();
      onClose();
    }
  };

  const handlePrevStep = () => {
    sounds.playPickup();
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // Step Metadata
  let targetSelector = '[data-tutorial-id="home-play-btn"]';
  let tooltipTitle = '';
  let tooltipDesc = '';
  let badgeLabel = 'LEVEL 6 UNLOCKED';
  let themeColor: 'emerald' | 'amber' | 'cyan' | 'purple' = 'emerald';
  let pointerDirection: 'down' | 'up' = 'down';

  switch (step) {
    case 1:
      targetSelector = '[data-tutorial-id="home-play-btn"]';
      tooltipTitle = `1. Continue Frontier Journey (Level ${currentLevelId})`;
      tooltipDesc = `Level 5 complete! Level 6 is now unlocked, introducing giant multi-hex "Cluster" mechanics. Click the Play button to start!`;
      badgeLabel = 'LEVEL 6 UNLOCKED';
      themeColor = 'emerald';
      pointerDirection = 'down';
      break;
    case 2:
      targetSelector = '[data-tutorial-id="home-editor-btn"]';
      tooltipTitle = '2. Level Editor Hub';
      tooltipDesc = 'Create and test custom hex boards with tailored color zones and par targets (Feature coming soon).';
      badgeLabel = 'EDITOR PREVIEW';
      themeColor = 'amber';
      pointerDirection = 'down';
      break;
    case 3:
      targetSelector = '[data-tutorial-id="home-memories-btn"]';
      tooltipTitle = '3. Memories & Penalty Bypasses';
      tooltipDesc = 'Inspect unlocked frontier sketches in your gallery and choose permanent free passes for penalties!';
      badgeLabel = 'MEMORIES GALLERY';
      themeColor = 'cyan';
      pointerDirection = 'down';
      break;
    case 4:
      targetSelector = '[data-tutorial-id="home-level-selector-btn"]';
      tooltipTitle = '4. Level Selector (Levels 1 - 20)';
      tooltipDesc = 'Replay any previous stage to earn missing Master Stars and conquer all mastery challenges.';
      badgeLabel = 'LEVEL BROWSER';
      themeColor = 'purple';
      pointerDirection = 'down';
      break;
    case 5:
      targetSelector = '[data-tutorial-id="home-rules-settings-bar"]';
      tooltipTitle = '5. Rules & Custom Settings';
      tooltipDesc = 'Access complete settlement scoring formulas, penalty deductions, and sound toggles anytime.';
      badgeLabel = 'SETTINGS & RULES';
      themeColor = 'amber';
      pointerDirection = 'up';
      break;
  }

  // Dynamically update target bounding box
  const updateTargetRect = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }
    let newRect: TargetRect | null = null;
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
  }, [isOpen, targetSelector]);

  // Sync with resize and animation
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, updateTargetRect]);

  if (!isOpen) return null;

  const padding = 8;
  const rx = 24;

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
    purple: {
      ring: 'ring-purple-400 border-purple-400',
      badge: 'bg-purple-400 text-slate-950 shadow-purple-500/50',
      glow: 'shadow-[0_0_35px_rgba(192,132,252,0.65)]',
      text: 'text-purple-300',
      iconBg: 'bg-purple-500/20 border-purple-400/40 text-purple-400',
      btn: 'bg-purple-500 hover:bg-purple-400 text-slate-950',
    },
  }[themeColor];

  // Smart placement of floating card so it never covers the target
  const isTargetAtTop = targetRect && targetRect.top < 200;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      {/* SVG Mask Cutout: Dims background while keeping targeted element 100% crystal clear */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="home-showcase-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={rx}
                fill="black"
              />
            )}
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.78)"
          mask="url(#home-showcase-mask)"
        />
      </svg>

      {/* Backdrop click to advance */}
      <div onClick={handleNextStep} className="fixed inset-0 cursor-pointer" />

      {/* Glowing Cutout Highlight Frame & Bouncing Hand Pointer */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
          onClick={handleNextStep}
          className={`rounded-3xl ring-4 ${colorStyles.ring} ${colorStyles.glow} transition-all duration-150 animate-pulse pointer-events-none z-50`}
        >
          {pointerDirection === 'down' && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <span className="text-4xl sm:text-5xl animate-bounce filter drop-shadow-lg">👇</span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${colorStyles.badge} whitespace-nowrap`}
              >
                {badgeLabel}
              </span>
            </div>
          )}

          {pointerDirection === 'up' && (
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg ${colorStyles.badge} whitespace-nowrap`}
              >
                {badgeLabel}
              </span>
              <span className="text-4xl sm:text-5xl animate-bounce filter drop-shadow-lg">👆</span>
            </div>
          )}
        </div>
      )}

      {/* Floating Showcase Instruction Card */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto transition-all duration-300 ${
          isTargetAtTop ? 'bottom-12 sm:bottom-16' : 'top-12 sm:top-16'
        }`}
      >
        <div className="p-4 bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700/90 rounded-3xl shadow-2xl text-white flex flex-col gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono border ${colorStyles.iconBg}`}
              >
                {step}/{totalSteps}
              </div>
              <h4 className={`text-xs sm:text-sm font-black tracking-tight ${colorStyles.text}`}>
                {tooltipTitle}
              </h4>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Skip Tour
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">{tooltipDesc}</p>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                step === 1
                  ? 'opacity-30 cursor-not-allowed text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${colorStyles.btn}`}
            >
              <span>{step === totalSteps ? 'Finish Showcase' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
