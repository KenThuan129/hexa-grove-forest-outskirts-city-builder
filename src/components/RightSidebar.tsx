import React from 'react';
import { PhaseConfig, LevelConfig, PlacedTile, RotationZone, MasteryChallenge, GameMode } from '../types/game';
import {
  Star,
  Compass,
  Check,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Lock,
  Crown,
  RotateCw,
  Award,
} from 'lucide-react';
import { coordKey } from '../utils/hexMath';

interface RightSidebarProps {
  currentLevel: LevelConfig;
  currentPhase: PhaseConfig;
  currentPhaseIndex: number;
  totalPhases: number;
  placedTiles: Map<string, PlacedTile[]>;
  score: number;
  starsEarned: number;
  soundEnabled: boolean;
  canCompletePhase: boolean;
  isLastPhase: boolean;
  hasCompletedFirstTrial: boolean;
  masteryChallenge?: MasteryChallenge;
  isMasteryCompleted?: boolean;
  gameMode?: GameMode;
  rotationZones?: RotationZone[];
  overlapErrorCount?: number;
  hideScore?: boolean;
  highlightScore?: boolean;
  isFalsehoodActive?: boolean;
  isPenaltyLimitExceeded?: boolean;
  onRotateZone?: (zoneId: string) => void;
  onCompletePhase: () => void;
  onToggleSound: () => void;
  onResetBoard: () => void;
  onOpenRules: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentLevel,
  currentPhase,
  currentPhaseIndex,
  totalPhases,
  placedTiles,
  score,
  starsEarned,
  soundEnabled,
  canCompletePhase,
  isLastPhase,
  hasCompletedFirstTrial,
  masteryChallenge,
  isMasteryCompleted = false,
  gameMode = 'tryhard',
  rotationZones,
  overlapErrorCount = 0,
  hideScore = false,
  highlightScore = false,
  isFalsehoodActive = false,
  isPenaltyLimitExceeded = false,
  onRotateZone,
  onCompletePhase,
  onToggleSound,
  onResetBoard,
  onOpenRules,
}) => {
  const [scrambleNum, setScrambleNum] = React.useState('742');

  React.useEffect(() => {
    if (!isFalsehoodActive && !isPenaltyLimitExceeded) return;
    const interval = setInterval(() => {
      setScrambleNum(Math.floor(100 + Math.random() * 900).toString());
    }, 50);
    return () => clearInterval(interval);
  }, [isFalsehoodActive, isPenaltyLimitExceeded]);

  const isTryHard = gameMode === 'tryhard';
  const targets = currentLevel.targetScore;
  const maxTarget = targets.star3 * 1.08;
  const scorePercent = Math.min(100, Math.round((score / maxTarget) * 100));

  const s1Percent = (targets.star1 / maxTarget) * 100;
  const s2Percent = (targets.star2 / maxTarget) * 100;
  const s3Percent = (targets.star3 / maxTarget) * 100;

  // Next milestone calculation
  let nextMilestoneText = 'Max 3 Stars!';
  if (score < targets.star1) {
    nextMilestoneText = `${targets.star1 - score} to ★1`;
  } else if (score < targets.star2) {
    nextMilestoneText = `${targets.star2 - score} to ★2`;
  } else if (score < targets.star3) {
    nextMilestoneText = `${targets.star3 - score} to ★3`;
  }

  // Victory / Expansion eligibility:
  // If intermediate phase (!isLastPhase): canProceed is always true for expansion.
  // If final phase (isLastPhase):
  //   - Try-hard mode: winning requires at least 1 Star + Mastery Challenge (if configured).
  //   - Casual mode: winning only requires Mastery Challenge (if configured) + phase targets.
  const isFinalVictoryReady = isTryHard
    ? starsEarned >= 1 && (!masteryChallenge || isMasteryCompleted)
    : !masteryChallenge || isMasteryCompleted;
  const canProceed = !isLastPhase || isFinalVictoryReady;

  return (
    <aside
      data-tutorial-id="right-sidebar-panel"
      className="pointer-events-auto w-64 sm:w-72 flex flex-col gap-2 p-1 select-none"
    >
      {/* 1. Current Area & Biome Card + Rotation Zone + Expand / Claim Victory Button */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl rounded-2xl p-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center text-amber-700">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="text-[11px] font-black text-slate-900 leading-none">
                {currentLevel.name}
              </h1>
            </div>
          </div>

          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-full">
            Phase {currentPhaseIndex + 1}/{totalPhases}
          </span>
        </div>

        {/* Phase Objective Box */}
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px]">
          <div className="font-bold text-slate-800 leading-tight">
            {currentPhase.title}
          </div>
          <p className="text-slate-600 line-clamp-2 mt-0.5 leading-normal">
            {currentPhase.objective}
          </p>
        </div>

        {/* Rotation Zones Interactive Control */}
        {rotationZones && rotationZones.length > 0 && (
          <div className="flex flex-col gap-1">
            {rotationZones.map(zone => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-md"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-spin-slow" />
                  <div className="truncate">
                    <div className="text-[10px] font-bold truncate">{zone.name}</div>
                    <div className="text-[8px] text-slate-400">Turntable (60° Spin)</div>
                  </div>
                </div>
                <button
                  onClick={() => onRotateZone?.(zone.id)}
                  className="shrink-0 px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1 ml-1"
                  title="Rotate all single hexes on this turntable by 60° (Press T key)"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Spin</span>
                  <span className="font-mono text-[9px] bg-cyan-800/80 px-1 py-0.2 rounded text-cyan-200">[T]</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Colored Zones Checklist */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Target Color Zones:
          </span>

          <div className="flex flex-wrap gap-1">
            {currentPhase.coloredZones.map(zone => {
              const totalInZone = zone.coords.length;
              let matchedCount = 0;
              zone.coords.forEach(c => {
                const key = coordKey(c.q, c.r);
                const stack = placedTiles.get(key);
                if (stack && stack.length > 0) {
                  const topTile = stack[stack.length - 1];
                  if (topTile.color === zone.color) {
                    matchedCount++;
                  }
                }
              });
              const isZoneComplete = matchedCount === totalInZone;

              return (
                <div
                  key={zone.name}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] transition-all ${
                    isZoneComplete
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      zone.color === 'amber'
                        ? 'bg-amber-400'
                        : zone.color === 'emerald'
                        ? 'bg-emerald-500'
                        : zone.color === 'sapphire'
                        ? 'bg-blue-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="truncate max-w-[90px]">{zone.name}</span>
                  {isZoneComplete ? (
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="font-mono text-[9px] text-slate-400">
                      {matchedCount}/{totalInZone}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fog Prediction Notice if present in current phase */}
        {currentPhase.fogCoords && currentPhase.fogCoords.length > 0 && (
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-300 text-purple-900 text-[10px] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🌫️</span>
              <span className="font-bold">Fog Hexes Active ({currentPhase.fogCoords.length})</span>
            </div>
            <span className="text-[8px] font-mono bg-purple-200 text-purple-950 px-1.5 py-0.5 rounded-full font-bold">
              +3 Safe Tiles on Clear
            </span>
          </div>
        )}

        {/* Boss HP Gauge (for Level 25 Boss Challenge) */}
        {currentLevel.isBossLevel && (
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white border-2 border-rose-500/80 shadow-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">👹</span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                    BOSS CHALLENGE
                  </div>
                  <div className="text-[11px] font-bold text-slate-100">
                    {currentLevel.bossName || 'Ancient Mist Titan'}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono font-black text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded-full border border-rose-700">
                Phase {currentPhaseIndex + 1}/5
              </span>
            </div>

            {/* Boss HP Bar (Decreases as color zones are filled) */}
            <div className="flex flex-col gap-0.5 mt-0.5">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                <span className="text-rose-400">Titan Stamina</span>
                <span className="text-slate-300">
                  {Math.max(0, 100 - Math.round(((currentPhaseIndex * 20) + (currentPhase.coloredZones.length > 0 ? (currentPhase.coloredZones.filter(z => z.coords.every(c => placedTiles.get(coordKey(c.q, c.r))?.[0]?.color === z.color)).length / currentPhase.coloredZones.length) * 20 : 0))))}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-rose-900/60">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(0, 100 - Math.round(((currentPhaseIndex * 20) + (currentPhase.coloredZones.length > 0 ? (currentPhase.coloredZones.filter(z => z.coords.every(c => placedTiles.get(coordKey(c.q, c.r))?.[0]?.color === z.color)).length / currentPhase.coloredZones.length) * 20 : 0))))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {masteryChallenge && (
          <div
            className={`p-2 rounded-xl border flex flex-col gap-1 transition-all ${
              isMasteryCompleted
                ? 'bg-gradient-to-r from-amber-50 to-emerald-50 border-amber-300 ring-1 ring-amber-300'
                : 'bg-purple-50/80 border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-purple-900">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>Mastery Challenge</span>
              </div>
              <span
                className={`text-[8px] font-black px-1.5 py-0.2 rounded-full border ${
                  isMasteryCompleted
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : isLastPhase
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-purple-100 text-purple-800 border-purple-300'
                }`}
              >
                {isMasteryCompleted
                  ? 'MASTERED ✓'
                  : isLastPhase
                  ? 'REQUIRED FOR WIN'
                  : 'VICTORY GOAL'}
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-800 leading-tight">
              {masteryChallenge.title}
            </div>
            <p className="text-[9px] text-slate-600 leading-tight">
              {masteryChallenge.description}
            </p>
            {!isLastPhase && (
              <span className="text-[8px] text-purple-700 font-semibold italic">
                Active condition for winning final phase
              </span>
            )}
          </div>
        )}

        {/* Active Overlap Error Warning Banner */}
        {overlapErrorCount > 0 && (
          <div className="p-2 rounded-xl bg-orange-50 border border-orange-300 text-orange-900 flex items-start gap-1.5 animate-pulse">
            <span className="text-xs">⚠️</span>
            <div className="text-[9.5px] leading-tight">
              <span className="font-bold block">
                {overlapErrorCount} Active Overlap Error{overlapErrorCount > 1 ? 's' : ''}!
              </span>
              <span className="text-orange-800">
                Remove overlapping tile(s) or -{overlapErrorCount * 100} pts penalty will be applied.
              </span>
            </div>
          </div>
        )}

        {/* Action Button: Expand Area or Claim Victory */}
        {canCompletePhase && (
          <button
            onClick={() => {
              if (canProceed) {
                onCompletePhase();
              }
            }}
            disabled={!canProceed && isLastPhase}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
              canProceed
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white animate-bounce'
                : 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-90'
            }`}
          >
            {canProceed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isLastPhase
                    ? masteryChallenge
                      ? 'Claim Mastered Victory! ★'
                      : 'Claim Settlement Victory'
                    : 'Expand Area (Next Phase)'}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px]">1★ + Mastery Required</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 2. Settlement Star Progress Bar */}
      {!hideScore && (
        <div
          className={`backdrop-blur-xl border shadow-xl rounded-2xl p-2.5 flex flex-col gap-1.5 transition-all ${
            isFalsehoodActive || isPenaltyLimitExceeded
              ? 'bg-rose-50/95 border-rose-500 ring-4 ring-rose-400/80 animate-pulse'
              : highlightScore
              ? 'bg-white/95 border-amber-400 ring-4 ring-amber-400/80 animate-bounce'
              : 'bg-white/95 border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1">
              <Sparkles className={`w-3.5 h-3.5 ${isFalsehoodActive || isPenaltyLimitExceeded ? 'text-rose-500' : 'text-amber-500'}`} />
              <h3 className={`text-[11px] font-black uppercase tracking-wider ${isFalsehoodActive || isPenaltyLimitExceeded ? 'text-rose-900' : 'text-slate-800'}`}>
                Settlement Score
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {isFalsehoodActive || isPenaltyLimitExceeded ? (
                <div className="flex items-center gap-1">
                  <span className="text-base font-black text-rose-600 font-mono">0</span>
                  <span className="font-mono text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded shadow animate-pulse">
                    ERR-{scrambleNum}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-black text-slate-900 font-mono tabular-nums">
                  {score}
                </span>
              )}
            </div>
          </div>

          {/* Falsehood / Penalty Warning Banner */}
          {isFalsehoodActive ? (
            <div className="p-1.5 rounded-xl bg-rose-600 text-white text-[9px] font-black flex items-center justify-between shadow animate-pulse">
              <div className="flex items-center gap-1">
                <span>⚠️</span>
                <span>FALSEHOOD: FOG DISCONNECTED!</span>
              </div>
              <span className="bg-rose-950/80 px-1.5 py-0.2 rounded font-mono text-rose-200">
                SCORE 0
              </span>
            </div>
          ) : isPenaltyLimitExceeded ? (
            <div className="p-1.5 rounded-xl bg-rose-600 text-white text-[9px] font-black flex items-center justify-between shadow animate-pulse">
              <div className="flex items-center gap-1">
                <span>⚠️</span>
                <span>PENALTY LIMIT EXCEEDED</span>
              </div>
              <span className="bg-rose-950/80 px-1.5 py-0.2 rounded font-mono text-rose-200">
                SCORE 0
              </span>
            </div>
          ) : null}

          {isTryHard ? (
            hasCompletedFirstTrial ? (
              <div className="flex flex-col gap-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 transition-all ${
                          isFalsehoodActive || isPenaltyLimitExceeded
                            ? 'fill-slate-200 text-slate-400'
                            : s <= starsEarned
                            ? 'fill-amber-400 text-amber-500 drop-shadow scale-110'
                            : 'fill-slate-100 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[9px] font-semibold font-mono ${isFalsehoodActive || isPenaltyLimitExceeded ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    {isFalsehoodActive ? 'Falsehood Disqualified' : isPenaltyLimitExceeded ? 'Limit Disqualified' : nextMilestoneText}
                  </span>
                </div>

                {/* Continuous Progress Bar with Milestone Markers */}
                <div className="relative w-full h-2 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFalsehoodActive || isPenaltyLimitExceeded
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-500'
                    }`}
                    style={{ width: `${isFalsehoodActive || isPenaltyLimitExceeded ? 100 : scorePercent}%` }}
                  />
                </div>

                {/* Threshold Labels */}
                <div className="relative w-full h-3 text-[8px] font-mono text-slate-400">
                  <span
                    className="absolute top-0 transform -translate-x-1/2"
                    style={{ left: `${s1Percent}%` }}
                  >
                    ★{targets.star1}
                  </span>
                  <span
                    className="absolute top-0 transform -translate-x-1/2"
                    style={{ left: `${s2Percent}%` }}
                  >
                    ★{targets.star2}
                  </span>
                  <span
                    className="absolute top-0 transform -translate-x-1/2"
                    style={{ left: `${s3Percent}%` }}
                  >
                    ★{targets.star3}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10px]">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <div className="text-amber-900 leading-tight">
                  <span className="font-bold block">Trial 1 in Progress</span>
                  <span className="text-amber-700 text-[8.5px]">
                    Complete Phase 1 trial to unlock 3-star rating!
                  </span>
                </div>
              </div>
            )
          ) : (
            /* Casual Mode Banner */
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Casual Mode</span>
              </div>
              <span className="text-[9px] text-emerald-700 font-medium">
                {masteryChallenge ? (isMasteryCompleted ? 'Mastery Met ✓' : 'Fulfill Mastery to Win') : 'Clear Zones to Win'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Quick Utilities: Rules, Reset, Sound */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl rounded-2xl p-1.5 flex items-center justify-between gap-1.5">
        <button
          onClick={onOpenRules}
          className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-bold transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3 h-3 text-slate-500" />
          <span>Rules</span>
        </button>

        <button
          onClick={onResetBoard}
          className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Reset</span>
        </button>

        <button
          onClick={onToggleSound}
          className="p-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>
    </aside>
  );
};
