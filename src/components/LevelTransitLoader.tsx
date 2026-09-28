import React, { useEffect, useState, useMemo } from 'react';
import { Compass, Sparkles, CheckCircle2, Star, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

const ARCHIPELAGO_TIPS = [
  'Pivotal junctions allow a single well-placed hex to bridge distant island outposts.',
  'Observe Par limits closely: compact clusters maximize score and claim the 3rd star.',
  'Rotate awkward multi-hex shapes in the turntable before committing them to the terrain.',
  'Adjoining matching tile colors triggers structural resonance and boosts your rating.',
  'The Chisel Brush can retrieve any misplaced stone with zero star deductions.',
  'Unlocking rotation zones creates dynamic bridges to previously unreachable coastlines.',
  'Try-Hard mode requires conquering both the par limit and the specialized mastery goal.',
];

interface LevelTransitLoaderProps {
  levelId: number;
  levelName: string;
  parLimit?: number;
  phaseNumber?: number;
  onComplete: () => void;
  durationMs?: number;
}

export const LevelTransitLoader: React.FC<LevelTransitLoaderProps> = ({
  levelId,
  levelName,
  parLimit,
  phaseNumber,
  onComplete,
  durationMs = 600,
}) => {
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Pick a stable random tip
  const tip = useMemo(() => {
    const idx = (levelId + (phaseNumber || 0)) % ARCHIPELAGO_TIPS.length;
    return ARCHIPELAGO_TIPS[idx];
  }, [levelId, phaseNumber]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / (durationMs - 100)) * 100));
      setProgress(pct);

      if (elapsed >= durationMs - 120 && !isClosing) {
        setIsClosing(true);
        sounds.playLevelTransitArrival();
      }

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onComplete();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [durationMs, isClosing, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl transition-opacity duration-200 select-none ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={() => {
        setIsClosing(true);
        sounds.playLevelTransitArrival();
        setTimeout(onComplete, 80);
      }}
    >
      {/* Tactical Center Card */}
      <div className="relative w-full max-w-sm bg-slate-900/95 border border-slate-700/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        {/* Animated Interlocking Hex Tile Cluster Icon */}
        <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-pulse" />
          
          {/* Mini 3-Hex SVG Cluster Animation */}
          <svg viewBox="0 0 60 60" className="w-10 h-10 drop-shadow-md">
            {/* Hex 1 */}
            <polygon
              points="30,5 42,12 42,26 30,33 18,26 18,12"
              className="fill-amber-400 stroke-amber-200 transition-all duration-300"
              strokeWidth="1.5"
            />
            {/* Hex 2 */}
            <polygon
              points="18,26 30,33 30,47 18,54 6,47 6,33"
              className="fill-emerald-500 stroke-emerald-300 transition-all duration-300"
              strokeWidth="1.5"
            />
            {/* Hex 3 */}
            <polygon
              points="42,26 54,33 54,47 42,54 30,47 30,33"
              className="fill-cyan-500 stroke-cyan-300 transition-all duration-300"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Small Progression Kicker */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Compass className="w-3 h-3 text-amber-400" />
          <span>Sector Progression</span>
          {phaseNumber && phaseNumber > 1 && (
            <span className="text-cyan-300">· Phase {phaseNumber}</span>
          )}
        </div>

        {/* Level Name */}
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
          Lvl {levelId}: {levelName}
        </h3>

        {/* Par Allowance if available */}
        {parLimit && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300">
            <span className="font-mono text-emerald-400 font-bold">Par: {parLimit} Tiles</span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-0.5 text-amber-300 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>3★ Available</span>
            </span>
          </div>
        )}

        {/* Pro Tip Box */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 leading-snug max-w-xs text-left">
          <span className="text-amber-400 font-bold block mb-0.5">Architect Tip:</span>
          {tip}
        </div>

        {/* Snappy Progress Track */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[9px] text-slate-500 font-mono mt-2">
          Click anywhere to skip
        </span>
      </div>
    </div>
  );
};
