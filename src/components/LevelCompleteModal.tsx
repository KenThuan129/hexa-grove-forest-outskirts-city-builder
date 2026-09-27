import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PenaltyRecord, MasteryChallenge } from '../types/game';
import { Star, Award, ArrowRight, RotateCcw, Crown } from 'lucide-react';

interface LevelCompleteModalProps {
  isOpen: boolean;
  levelName: string;
  score: number;
  starsEarned: number;
  penalties: PenaltyRecord;
  hasNextLevel: boolean;
  masteryChallenge?: MasteryChallenge;
  isMasteryCompleted?: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onViewMemories?: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  levelName,
  score,
  starsEarned,
  penalties,
  hasNextLevel,
  masteryChallenge,
  isMasteryCompleted = false,
  onNextLevel,
  onReplayLevel,
  onViewMemories,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalDeductions =
    penalties.overuse * 150 +
    penalties.disconnect * 120 +
    penalties.overlap * 100 +
    penalties.offMap * 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 flex flex-col items-center text-center">
        {/* Badge Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 shadow-inner">
          <Award className="w-9 h-9 text-amber-500" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">
          Settlement Established!
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          {levelName} Conquered
        </h2>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map(starIndex => (
            <Star
              key={starIndex}
              className={`w-9 h-9 transition-transform duration-500 ${
                starIndex <= starsEarned
                  ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Final Score Banner */}
        <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-3">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-0.5">
            Final Settlement Rating
          </span>
          <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {score}
          </span>
          <span className="text-xs text-slate-500 block mt-1">
            {starsEarned === 3
              ? 'Flawless Master Architect!'
              : starsEarned === 2
              ? 'Great Strategic Planner!'
              : 'Cleared the Frontier!'}
          </span>
        </div>

        {/* Mastery Challenge Ribbon if applicable */}
        {masteryChallenge && (
          <div className={`w-full p-2.5 rounded-xl border flex items-center justify-between mb-3 text-left ${
            isMasteryCompleted
              ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-600 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-black text-slate-800">
                  {masteryChallenge.title}
                </div>
                <div className="text-[9px] text-slate-500 line-clamp-1">
                  {masteryChallenge.description}
                </div>
              </div>
            </div>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ml-2 ${
              isMasteryCompleted
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}>
              {isMasteryCompleted ? 'MASTERED ✓' : 'NOT MET'}
            </span>
          </div>
        )}

        {/* Penalties & Deductions Breakdown */}
        <div className="w-full text-xs text-left mb-5 space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
            Settlement Audit:
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Overuse Penalties ({penalties.overuse} extra):</span>
            <span className="font-mono tabular-nums text-rose-600">
              {penalties.overuse > 0 ? `-${penalties.overuse * 150}` : '0'}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Disconnects ({penalties.disconnect} isolated):</span>
            <span className="font-mono tabular-nums text-rose-600">
              {penalties.disconnect > 0 ? `-${penalties.disconnect * 120}` : '0'}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Overlaps ({penalties.overlap} replaced):</span>
            <span className="font-mono tabular-nums text-rose-600">
              {penalties.overlap > 0 ? `-${penalties.overlap * 100}` : '0'}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Off-Map Drops ({penalties.offMap}):</span>
            <span className="font-mono tabular-nums text-rose-600">
              {penalties.offMap > 0 ? `-${penalties.offMap * 80}` : '0'}
            </span>
          </div>

          {totalDeductions > 0 && (
            <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-800">
              <span>Total Deductions:</span>
              <span className="font-mono tabular-nums text-rose-600">-{totalDeductions}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 w-full">
          {onViewMemories && (
            <button
              onClick={onViewMemories}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-900" />
              <span>Read Visual Novel Memory Story</span>
            </button>
          )}

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onReplayLevel}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            {hasNextLevel ? (
              <button
                onClick={onNextLevel}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <span>Next Frontier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onReplayLevel}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Play Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
