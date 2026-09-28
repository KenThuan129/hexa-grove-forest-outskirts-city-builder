import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Compass, ChevronRight, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SpecialIntroLoaderProps {
  onComplete: () => void;
  autoCloseDelayMs?: number;
}

export const SpecialIntroLoader: React.FC<SpecialIntroLoaderProps> = ({
  onComplete,
  autoCloseDelayMs = 3800,
}) => {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('Igniting ancient celestial beacons...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const finishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onCompleteRef.current();
    }, 200);
  }, []);

  useEffect(() => {
    // Play majestic celestial intro chime
    sounds.playIntroChime();

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / Math.max(1, autoCloseDelayMs - 600)) * 100));
      setProgress(pct);

      if (pct < 30) {
        setPhaseText('Igniting ancient celestial beacons...');
      } else if (pct < 65) {
        setPhaseText('Awakening the Archipelago Frontier...');
      } else if (pct < 90) {
        setPhaseText('Gathering the pioneering youth of the realm...');
      } else {
        setPhaseText('The journey commences now.');
      }

      if (elapsed >= autoCloseDelayMs - 400) {
        setIsFadingOut(true);
      }

      if (elapsed >= autoCloseDelayMs) {
        clearInterval(interval);
        handleFinish();
      }
    }, 40);

    const failsafe = setTimeout(() => {
      handleFinish();
    }, autoCloseDelayMs + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(failsafe);
    };
  }, [autoCloseDelayMs, handleFinish]);

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 sm:p-12 bg-slate-950 text-white select-none transition-opacity duration-500 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambient Glow & Starfields */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial Ambient Center Beam */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/15 via-emerald-500/10 to-cyan-500/15 rounded-full blur-3xl animate-pulse" />
        
        {/* Subtle Constellation Hex Grid Lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px]" />

        {/* Ambient Top & Bottom Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
      </div>

      {/* Top Header: Brand Wordmark & Skip Affordance */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
            <Compass className="w-4 h-4 animate-spin [animation-duration:12s]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold block">
              Archipelago Chronicles
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Island Settlement Odyssey</span>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg hover:border-slate-500"
        >
          <span>Enter</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Stage: Animated Hex Sacred Seal + THE PICKUP LINE */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl text-center px-4">
        {/* Animated Layered Hex Emblem */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-8 flex items-center justify-center">
          {/* Outer Rotating Glowing Ring */}
          <div className="absolute inset-0 rounded-full border border-amber-400/30 border-dashed animate-spin [animation-duration:24s]" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-spin [animation-duration:18s] [animation-direction:reverse]" />
          
          {/* Pulsing Sacred Hex Core */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-[0_0_24px_rgba(245,158,11,0.5)] animate-pulse"
            >
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3.5"
              />
              <polygon
                points="50,18 78,34 78,66 50,82 22,66 22,34"
                fill="url(#emeraldGradient)"
                fillOpacity="0.25"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Luminous Spark */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <Sparkles className="w-8 h-8 text-amber-300 animate-bounce [animation-duration:2.5s]" />
            </div>
          </div>
        </div>

        {/* The Exact Special Pickup Line Requested by the User */}
        <div className="relative space-y-3 animate-in fade-in zoom-in-95 duration-1000">
          <p className="text-xs uppercase tracking-[0.3em] font-mono text-amber-400/90 font-bold">
            The Awakening Calling
          </p>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-[0_4px_16px_rgba(245,158,11,0.35)] leading-tight">
            &ldquo;Rejoyce, a journey up for the youth&rdquo;
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium leading-relaxed pt-1">
            Where stone by stone and realm by realm, young architects claim the untamed horizon.
          </p>
        </div>
      </div>

      {/* Bottom Footer: Progress Bar, Status Message & Tactile Percent */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3">
        {/* Progress Text State */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 font-medium truncate pr-2">{phaseText}</span>
          <span className="text-amber-400 font-bold tabular-nums">{progress}%</span>
        </div>

        {/* Glowing Progress Track */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[10px] text-slate-500 font-mono tracking-wider pt-1">
          Archipelago Cartography System · Ready to Explore
        </p>
      </div>
    </div>
  );
};
