import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { PenaltyRecord, GameMode } from '../types/game';
import {
  Sparkles,
  Star,
  Award,
  ArrowRight,
  RotateCcw,
  Coins,
  Crown,
  Compass,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  FastForward,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface LevelCelebrationData {
  completedLevelId: number;
  completedLevelName: string;
  nextLevelId?: number;
  nextLevelName?: string;
  score: number;
  starsEarned: number;
  coinsEarned: number;
  isMasteryCompleted?: boolean;
  masteryTitle?: string;
  masteryDescription?: string;
  penalties: PenaltyRecord;
  totalLevelsCount: number;
  isFinalLevel?: boolean;
  gameMode?: GameMode;
}

interface EndOfLevelCelebrationProps {
  data: LevelCelebrationData | null;
  onContinue: () => void;
  onReplay: () => void;
  onViewMemories?: () => void;
}

export const EndOfLevelCelebration: React.FC<EndOfLevelCelebrationProps> = ({
  data,
  onContinue,
  onReplay,
  onViewMemories,
}) => {
  const [revealedStars, setRevealedStars] = useState<number>(0);
  const [showPathProgress, setShowPathProgress] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showAuditDetails, setShowAuditDetails] = useState(false);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  const [countdown, setCountdown] = useState<number>(6);

  // Initial sequence reveal
  useEffect(() => {
    if (!data) return;

    // Reset local states
    setRevealedStars(0);
    setShowPathProgress(false);
    setShowRewards(false);
    setShowActions(false);
    setShowAuditDetails(false);
    setAnimatedCoins(0);
    setCountdown(6);

    // Initial Victory Fanfare
    sounds.playProgressionFanfare();

    // Initial Confetti burst
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.5, x: 0.5 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#fef08a'],
    });

    const timers: NodeJS.Timeout[] = [];

    // Star 1 Reveal
    timers.push(
      setTimeout(() => {
        setRevealedStars(1);
        sounds.playStarPing(1);
        if (data.starsEarned >= 1) {
          confetti({
            particleCount: 20,
            spread: 40,
            origin: { y: 0.42, x: 0.38 },
            colors: ['#f59e0b', '#fbbf24', '#fef08a'],
          });
        }
      }, 350)
    );

    // Star 2 Reveal
    timers.push(
      setTimeout(() => {
        setRevealedStars(2);
        if (data.starsEarned >= 2) {
          sounds.playStarPing(2);
          confetti({
            particleCount: 30,
            spread: 45,
            origin: { y: 0.4, x: 0.5 },
            colors: ['#f59e0b', '#fbbf24', '#38bdf8'],
          });
        }
      }, 700)
    );

    // Star 3 Reveal
    timers.push(
      setTimeout(() => {
        setRevealedStars(3);
        if (data.starsEarned >= 3) {
          sounds.playStarPing(3);
          confetti({
            particleCount: 45,
            spread: 55,
            origin: { y: 0.38, x: 0.62 },
            colors: ['#fbbf24', '#f59e0b', '#10b981', '#ec4899'],
          });
        }
      }, 1050)
    );

    // Reveal Journey Path
    timers.push(
      setTimeout(() => {
        setShowPathProgress(true);
        sounds.playPlace(true);
      }, 1400)
    );

    // Reveal Rewards & animate coin counter
    timers.push(
      setTimeout(() => {
        setShowRewards(true);
        sounds.playVictory();

        const targetCoins = data.coinsEarned;
        const duration = 500;
        const steps = 12;
        const stepTime = duration / steps;
        let currentStep = 0;

        const coinInterval = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          setAnimatedCoins(Math.round(targetCoins * progress));
          if (currentStep >= steps) {
            clearInterval(coinInterval);
            setAnimatedCoins(targetCoins);
          }
        }, stepTime);
      }, 1800)
    );

    // Reveal Actions
    timers.push(
      setTimeout(() => {
        setShowActions(true);
      }, 2200)
    );

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [data]);

  // Safe countdown timer (no setState during render)
  useEffect(() => {
    if (!showActions || !data) return;

    if (countdown <= 0) {
      onContinue();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showActions, countdown, data, onContinue]);

  // Keyboard shortcut listener (Space or Enter advances immediately)
  useEffect(() => {
    if (!data) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, onContinue]);

  if (!data) return null;

  const currentLevelId = data.completedLevelId;
  const nextLevelId = data.nextLevelId ?? currentLevelId + 1;
  const progressPercent = Math.min(100, Math.round((currentLevelId / data.totalLevelsCount) * 100));

  const totalDeductions =
    data.penalties.overuse * 150 +
    data.penalties.disconnect * 120 +
    data.penalties.overlap * 100 +
    data.penalties.offMap * 80;

  const totalPenaltiesCount =
    data.penalties.overuse +
    data.penalties.disconnect +
    data.penalties.overlap +
    data.penalties.offMap +
    data.penalties.falsehood;

  const ratingTitle =
    data.starsEarned === 3
      ? 'Flawless Master Architect ★★★'
      : data.starsEarned === 2
      ? 'Distinguished Pioneer ★★'
      : 'Frontier Cleared ★';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Radiant ambient glow rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[480px] h-[480px] bg-gradient-to-tr from-emerald-500/15 via-amber-500/15 to-teal-500/15 rounded-full blur-3xl animate-pulse scale-110" />
        <div className="absolute w-80 h-80 border border-amber-400/15 rounded-full animate-spin-slow" />
      </div>

      {/* Main Responsive Modal Card */}
      <div className="relative max-w-[420px] w-full max-h-[92vh] overflow-y-auto bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950/98 border border-amber-500/35 rounded-3xl p-4 sm:p-5 shadow-[0_0_40px_rgba(245,158,11,0.22)] flex flex-col items-center text-center backdrop-blur-xl">
        {/* Quick Skip Button */}
        <button
          onClick={onContinue}
          className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-bold transition-all hover:scale-105 cursor-pointer shadow"
          title="Skip animation (Space / Enter)"
        >
          <span>Skip</span>
          <FastForward className="w-3 h-3 text-amber-400" />
        </button>

        {/* Compact Triumphant Badge Crest */}
        <div className="relative mb-2 mt-0.5">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-emerald-500/40 rounded-2xl blur-sm animate-pulse" />
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-xl border border-yellow-200 transform animate-in zoom-in-50 duration-300">
            <Award className="w-8 h-8 sm:w-9 sm:h-9 text-slate-950 drop-shadow-sm" />
            <div className="absolute -bottom-1.5 px-2 py-0.2 rounded-full bg-slate-900 border border-amber-400 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow">
              VICTORY
            </div>
          </div>
        </div>

        {/* Level Name & Subtitle */}
        <div className="space-y-0.5 mb-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-center gap-1 text-amber-400 text-[10.5px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Expedition Conquered</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Level {data.completedLevelId}: {data.completedLevelName}
          </h2>
          <p className="text-[11px] font-bold text-amber-200/90">
            {ratingTitle}
          </p>
        </div>

        {/* 3-Star Celebration */}
        <div className="flex items-center justify-center gap-2.5 my-1 mb-3">
          {[1, 2, 3].map(starIdx => {
            const isEarned = starIdx <= data.starsEarned;
            const isRevealed = starIdx <= revealedStars;

            return (
              <div
                key={starIdx}
                className={`relative transition-all duration-300 ${
                  isRevealed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
              >
                {isEarned && isRevealed && (
                  <div className="absolute -inset-1.5 bg-amber-400/40 rounded-full blur-sm animate-ping" />
                )}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-amber-300 to-yellow-500 border-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] text-slate-950 scale-105'
                      : 'bg-slate-800/80 border-slate-700 text-slate-600'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      isEarned ? 'fill-yellow-100 text-slate-900' : 'fill-slate-700 text-slate-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Score & Treasury Spoils Grid */}
        <div className={`w-full grid grid-cols-2 gap-2 mb-2.5 transition-all duration-300 ${
          showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          {/* Settlement Score */}
          <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-2.5 text-left shadow-sm">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-0.5">
              Settlement Score
            </span>
            <div className="text-lg sm:text-xl font-black text-white font-mono leading-none">
              {data.score.toLocaleString()}
            </div>
            <button
              onClick={() => setShowAuditDetails(prev => !prev)}
              className="text-[9px] font-bold text-emerald-400 mt-1 flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
              <span>{totalPenaltiesCount === 0 ? 'Pristine Zero Errors' : `${totalPenaltiesCount} Deductions`}</span>
              {showAuditDetails ? <ChevronUp className="w-2.5 h-2.5 ml-0.5" /> : <ChevronDown className="w-2.5 h-2.5 ml-0.5" />}
            </button>
          </div>

          {/* Spoils / Coins Card */}
          <div className="bg-gradient-to-br from-amber-500/15 to-yellow-600/10 border border-amber-500/35 rounded-2xl p-2.5 text-left shadow-sm">
            <span className="text-[9.5px] uppercase font-bold text-amber-300 block mb-0.5">
              Expedition Spoils
            </span>
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono leading-none flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>+{animatedCoins}</span>
            </div>
            <div className="text-[9px] font-bold text-amber-200 mt-1">
              Treasury Credited
            </div>
          </div>
        </div>

        {/* Collapsible Penalties & Audit Breakdown */}
        {showAuditDetails && (
          <div className="w-full text-[10px] text-left mb-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 animate-in fade-in duration-200">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">
              Settlement Audit Breakdown:
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Overuse ({data.penalties.overuse}):</span>
              <span className="font-mono text-rose-400">{data.penalties.overuse > 0 ? `-${data.penalties.overuse * 150}` : '0'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Disconnects ({data.penalties.disconnect}):</span>
              <span className="font-mono text-rose-400">{data.penalties.disconnect > 0 ? `-${data.penalties.disconnect * 120}` : '0'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Overlaps ({data.penalties.overlap}):</span>
              <span className="font-mono text-rose-400">{data.penalties.overlap > 0 ? `-${data.penalties.overlap * 100}` : '0'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Off-Map Drops ({data.penalties.offMap}):</span>
              <span className="font-mono text-rose-400">{data.penalties.offMap > 0 ? `-${data.penalties.offMap * 80}` : '0'}</span>
            </div>
            {totalDeductions > 0 && (
              <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-rose-400">
                <span>Total Deductions:</span>
                <span className="font-mono">-{totalDeductions}</span>
              </div>
            )}
          </div>
        )}

        {/* Mastery Challenge Badge */}
        {data.isMasteryCompleted && showRewards && (
          <div className="w-full mb-2.5 px-2.5 py-1.5 rounded-xl bg-purple-950/50 border border-purple-400/35 flex items-center gap-2 text-left animate-in fade-in">
            <div className="w-6 h-6 rounded-lg bg-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black text-purple-200 flex items-center gap-1">
                <span>Mastery Conquered!</span>
                <span className="text-[8px] px-1 py-0.2 bg-purple-800 text-purple-100 rounded-full font-bold">+600 Score</span>
              </div>
              <div className="text-[8.5px] text-purple-300/80 truncate">
                {data.masteryTitle || 'Special challenge fulfilled.'}
              </div>
            </div>
          </div>
        )}

        {/* Archipelago Expedition Journey Cartography Track */}
        <div className={`w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 mb-3 text-left transition-all duration-300 ${
          showPathProgress ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-[11px] font-black text-slate-200">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>Archipelago Cartography Trail</span>
            </div>
            <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.2 rounded-full border border-emerald-500/30">
              {progressPercent}% Unveiled
            </span>
          </div>

          {/* Trail Nodes */}
          <div className="relative flex items-center justify-between px-3 py-1.5">
            {/* Base line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full" />
            
            {/* Animated Laser beam */}
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
              style={{
                width: showPathProgress ? (data.isFinalLevel ? '100%' : '50%') : '0%',
              }}
            />

            {/* Node 1: Completed Level */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 border border-emerald-200 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              </div>
              <span className="text-[9px] font-bold text-emerald-300 mt-0.5">
                Lvl {currentLevelId}
              </span>
              <span className="text-[7.5px] text-slate-400">Done ✓</span>
            </div>

            {/* Node 2: Unlocking Next Level */}
            {!data.isFinalLevel && (
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 ${
                  showPathProgress
                    ? 'bg-amber-500 border border-amber-200 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.7)] animate-bounce'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}>
                  {showPathProgress ? (
                    <Unlock className="w-3.5 h-3.5 text-amber-950" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <span className={`text-[9px] font-bold mt-0.5 ${showPathProgress ? 'text-amber-300' : 'text-slate-500'}`}>
                  Lvl {nextLevelId}
                </span>
                <span className="text-[7.5px] text-amber-400 font-semibold">
                  {showPathProgress ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            )}

            {/* Node 3: Grand Milestone */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center font-black text-xs">
                {data.isFinalLevel ? (
                  <Crown className="w-4 h-4 text-amber-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                {data.isFinalLevel ? 'Mastery' : `Lvl ${Math.min(data.totalLevelsCount, nextLevelId + 1)}`}
              </span>
              <span className="text-[7.5px] text-slate-500">
                {data.isFinalLevel ? 'Peak' : 'Frontier'}
              </span>
            </div>
          </div>

          {/* Next Level Preview Title */}
          {!data.isFinalLevel && data.nextLevelName && (
            <div className="mt-1.5 text-center text-[9.5px] font-semibold text-slate-300 bg-slate-900/80 py-1 px-2 rounded-lg border border-slate-800 flex items-center justify-center gap-1">
              <span className="text-amber-400 font-bold">Next:</span>
              <span className="text-white font-bold truncate">{data.nextLevelName}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className={`w-full flex flex-col gap-2 transition-all duration-300 ${
          showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          {/* Main Embark Button */}
          <button
            onClick={onContinue}
            className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>
              {data.isFinalLevel ? 'Return to Home Sanctuary' : `Embark on Level ${nextLevelId}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[9px] font-bold bg-emerald-950/30 text-emerald-950 px-1.5 py-0.2 rounded-full ml-0.5">
              {countdown}s
            </span>
          </button>

          {/* Secondary Buttons */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={onReplay}
              className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Replay</span>
            </button>

            {onViewMemories && (
              <button
                onClick={onViewMemories}
                className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-amber-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>Memories</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
