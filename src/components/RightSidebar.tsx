import React from 'react';
import { PhaseConfig, LevelConfig, PlacedTile, RotationZone, MasteryChallenge, GameMode, PlayMode, PenaltyRecord } from '../types/game';
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
  Lightbulb,
  Swords,
  Trophy,
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
  playMode?: PlayMode;
  rotationZones?: RotationZone[];
  penalties?: PenaltyRecord;
  overlapErrorCount?: number;
  hideScore?: boolean;
  highlightScore?: boolean;
  isFalsehoodActive?: boolean;
  isPenaltyLimitExceeded?: boolean;
  onRotateZone?: (zoneId: string) => void;
  onCompletePhase: () => void;
  onOpenBossBattle?: () => void;
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
  playMode = 'building',
  rotationZones,
  penalties,
  overlapErrorCount = 0,
  hideScore = false,
  highlightScore = false,
  isFalsehoodActive = false,
  isPenaltyLimitExceeded = false,
  onRotateZone,
  onCompletePhase,
  onOpenBossBattle,
  onToggleSound,
  onResetBoard,
  onOpenRules,
}) => {
  const isBuildingMode = playMode === 'building';
  const isBossLevel = Boolean(currentLevel.isBossLevel);
  const [scrambleNum, setScrambleNum] = React.useState('742');

  React.useEffect(() => {
    if (!isFalsehoodActive && !isPenaltyLimitExceeded) return;
    const interval = setInterval(() => {
      setScrambleNum(Math.floor(100 + Math.random() * 899).toString());
    }, 120);
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

  // Counted penalties that block level victory: Overlap, Off-board, Falsehood, Disconnect (Overuse is bypassed)
  const blockingPenaltiesCount =
    (penalties?.overlap || 0) +
    (penalties?.offMap || 0) +
    (penalties?.disconnect || 0) +
    (penalties?.falsehood || 0) +
    (overlapErrorCount || 0);

  const isFinalVictoryReady = isTryHard
    ? starsEarned >= 1 && (!masteryChallenge || isMasteryCompleted) && (currentLevel.id < 10 || blockingPenaltiesCount === 0)
    : currentLevel.id < 10 || blockingPenaltiesCount === 0;

  // Expanding to the next phase is always available; completing the level is blocked if penalties exist
  const canProceed = !isLastPhase || isFinalVictoryReady;

  return (
    <aside
      data-tutorial-id="right-sidebar-panel"
      className="pointer-events-auto w-64 sm:w-72 flex flex-col gap-2 p-1 select-none font-sans"
    >
      {/* 1. Target Color Zones & Area Controls */}
      <div className="wood-panel p-3.5 flex flex-col gap-2.5 text-[#f4ecd8] border-2 border-[#5c3d2e] shadow-2xl">
        {/* Rotation Zones Interactive Control */}
        {rotationZones && rotationZones.length > 0 && (
          <div className="flex flex-col gap-1 pb-1 border-b border-[#5c3d2e]">
            {rotationZones.map(zone => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-2 rounded-2xl bg-slate-950/90 text-white border border-cyan-500/40 shadow-md"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-spin-slow" />
                  <div className="truncate">
                    <div className="text-[10px] font-bold truncate text-cyan-200">{zone.name}</div>
                    <div className="text-[8px] text-slate-400">Turntable (60° Spin)</div>
                  </div>
                </div>
                <button
                  onClick={() => onRotateZone?.(zone.id)}
                  className="shrink-0 px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-[10px] font-bold shadow transition-all cursor-pointer flex items-center gap-1 ml-1"
                  title="Rotate all single hexes on this turntable by 60° (Press T key)"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Spin</span>
                  <span className="font-mono text-[9px] bg-cyan-900/80 px-1 py-0.2 rounded text-cyan-200">[T]</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Colored Zones Checklist */}
        <div data-tutorial-id="tutorial-target-color-zones" className="flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
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
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border text-[10px] transition-all ${
                    isZoneComplete
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      zone.color === 'amber'
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                        : zone.color === 'emerald'
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : zone.color === 'sapphire'
                        ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                        : 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]'
                    }`}
                  />
                  <span className="truncate max-w-[90px]">{zone.name}</span>
                  {isZoneComplete ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="font-mono text-[9px] text-slate-400">
                      {matchedCount}/{totalInZone}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Target Color Zone Tag: "No Off-map" (Level 6-8), "No Overlap" (Level 9), "No Penalty" (Level 10+) */}
            {currentLevel.id >= 6 && (() => {
              const isLevel9 = currentLevel.id === 9;
              const isLevel10Plus = currentLevel.id >= 10;
              const tagName = isLevel10Plus ? 'No Penalty' : isLevel9 ? 'No Overlap' : 'No Off-map';

              const unlockedCoordSet = new Set(currentPhase.unlockedCoords.map(c => coordKey(c.q, c.r)));
              if (currentPhase.fogCoords) {
                currentPhase.fogCoords.forEach(c => unlockedCoordSet.add(coordKey(c.q, c.r)));
              }
              let offMapCount = 0;
              let overlapCount = 0;
              placedTiles.forEach((stack, key) => {
                if (stack && stack.length > 0) {
                  const isBridge = stack.some(t => t.type === 'bridge');
                  if (!isBridge && !unlockedCoordSet.has(key)) {
                    offMapCount += stack.length;
                  }
                  if (stack.length > 1) {
                    overlapCount += stack.length - 1;
                  }
                }
              });

              const activeOverlap = overlapErrorCount !== undefined ? overlapErrorCount : overlapCount;

              // Rules for Level 10+ "No Penalty" Badge:
              // 1 - Bypass all Overuse penalty
              // 2 - Overlap, Off-board, Falsehood, and Disconnect penalties are all counted
              const countedOverlap = penalties?.overlap ?? activeOverlap;
              const countedOffMap = penalties?.offMap ?? offMapCount;
              const countedDisconnect = penalties?.disconnect ?? 0;
              const countedFalsehood = penalties?.falsehood ?? (isFalsehoodActive ? 1 : 0);

              const countedPenaltyErrors = countedOverlap + countedOffMap + countedDisconnect + countedFalsehood;

              let isClean = false;
              let violationCount = 0;

              if (isLevel10Plus) {
                isClean = countedPenaltyErrors === 0 && !isFalsehoodActive && !isPenaltyLimitExceeded;
                violationCount = Math.max(countedPenaltyErrors, isPenaltyLimitExceeded || isFalsehoodActive ? 1 : 0);
              } else if (isLevel9) {
                isClean = activeOverlap === 0;
                violationCount = activeOverlap;
              } else {
                isClean = offMapCount === 0;
                violationCount = offMapCount;
              }

              return (
                <div
                  key="tag-penalty-condition"
                  data-tutorial-id="tag-no-off-map"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border text-[10px] transition-all ${
                    isClean
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                      : 'bg-rose-950/90 border-rose-500 text-rose-200 font-bold ring-2 ring-rose-500/80 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                  }`}
                  title={
                    isClean
                      ? `${tagName}: Clean! No errors or boundary violations.`
                      : `${tagName} Failed: ${violationCount} active error(s)!`
                  }
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isClean
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]'
                    }`}
                  />
                  <span className="truncate max-w-[90px]">{tagName}</span>
                  {isClean ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="font-mono text-[9px] text-rose-300 font-bold">
                      {violationCount > 0 ? `! (${violationCount})` : '✕'}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Level 16 Tag: "Use Road" (checked if player placed at least one road hex) */}
            {currentLevel.id === 16 && (() => {
              let roadHexCount = 0;
              placedTiles.forEach(stack => {
                if (stack) {
                  stack.forEach(tile => {
                    if (tile.type === 'road') roadHexCount++;
                  });
                }
              });
              const isRoadUsed = roadHexCount > 0;
              return (
                <div
                  key="tag-use-road"
                  data-tutorial-id="tag-use-road"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border text-[10px] transition-all ${
                    isRoadUsed
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-950/80 border-amber-500/80 text-amber-200 font-bold'
                  }`}
                  title={isRoadUsed ? 'Use Road: Checked! Road hex placed.' : 'Use Road: None placed yet. Place at least 1 road hex!'}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isRoadUsed ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
                  <span className="truncate max-w-[90px]">Use Road</span>
                  {isRoadUsed ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="font-mono text-[9px] text-amber-300 font-bold">(none)</span>
                  )}
                </div>
              );
            })()}

            {/* Level 23 Tag: "Use Bridge" (checked if player placed at least one bridge hex) */}
            {currentLevel.id === 23 && (() => {
              let bridgeHexCount = 0;
              placedTiles.forEach(stack => {
                if (stack) {
                  stack.forEach(tile => {
                    if (tile.type === 'bridge') bridgeHexCount++;
                  });
                }
              });
              const isBridgeUsed = bridgeHexCount > 0;
              return (
                <div
                  key="tag-use-bridge"
                  data-tutorial-id="tag-use-bridge"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border text-[10px] transition-all ${
                    isBridgeUsed
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold shadow-[0_0_6px_rgba(16,185,129,0.2)]'
                      : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200 font-bold'
                  }`}
                  title={isBridgeUsed ? 'Use Bridge: Checked! Bridge hex placed.' : 'Use Bridge: None placed yet. Place at least 1 bridge hex!'}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isBridgeUsed ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-cyan-400'}`} />
                  <span className="truncate max-w-[90px]">Use Bridge</span>
                  {isBridgeUsed ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="font-mono text-[9px] text-cyan-300 font-bold">(none)</span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Fog Notice */}
        {currentPhase.fogCoords && currentPhase.fogCoords.length > 0 && (
          <div className="p-2 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-[10px] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🌫️</span>
              <span className="font-bold">Fog Hexes Active ({currentPhase.fogCoords.length})</span>
            </div>
            <span className="text-[8.5px] font-mono bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded-full font-bold">
              +3 Safe Tiles
            </span>
          </div>
        )}

        {/* Boss HP Gauge */}
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

            <div className="flex flex-col gap-0.5 mt-0.5">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                <span className="text-rose-400">Titan Stamina</span>
                <span className="text-slate-300">
                  {Math.max(0, 100 - Math.round(((currentPhaseIndex * 20) + (currentPhase.coloredZones.length > 0 ? (currentPhase.coloredZones.filter(z => z.coords.every(c => placedTiles.get(coordKey(c.q, c.r))?.[0]?.color === z.color)).length / currentPhase.coloredZones.length) * 20 : 0))))}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-rose-900/60 shadow-inner">
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

        {/* Mastery Challenge (Challenger Mode Only) */}
        {!isBuildingMode && masteryChallenge && (
          <div
            data-tutorial-id="tutorial-mastery-challenge"
            className={`p-2.5 rounded-2xl border flex flex-col gap-1 transition-all ${
              isMasteryCompleted
                ? 'bg-gradient-to-r from-amber-950/60 to-emerald-950/60 border-amber-400/60 shadow-lg'
                : 'bg-purple-950/50 border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-amber-300">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Mastery Challenge</span>
              </div>
              <span
                className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${
                  isMasteryCompleted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : isLastPhase
                    ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                    : 'bg-purple-950 text-purple-300 border-purple-500/50'
                }`}
              >
                {isMasteryCompleted
                  ? 'MASTERED ✓'
                  : isLastPhase
                  ? 'REQUIRED FOR WIN'
                  : 'VICTORY GOAL'}
              </span>
            </div>
            <div className="text-[10.5px] font-bold text-white leading-tight">
              {masteryChallenge.title}
            </div>
            <p className="text-[9.5px] text-slate-300 leading-tight">
              {masteryChallenge.description}
            </p>
          </div>
        )}

        {/* Overlap Error Warning */}
        {overlapErrorCount > 0 && (
          <div className="p-2 rounded-2xl bg-orange-950/70 border border-orange-500/60 text-orange-200 flex items-start gap-2 animate-pulse">
            <span className="text-xs">⚠️</span>
            <div className="text-[10px] leading-tight">
              <span className="font-bold block text-orange-300">
                {overlapErrorCount} Active Overlap Error{overlapErrorCount > 1 ? 's' : ''}!
              </span>
              <span className="text-orange-200/90 text-[9px]">
                Remove overlapping tile(s) or placement invalidated.
              </span>
            </div>
          </div>
        )}

        {/* Boss Battle Button (Building Mode / Boss Levels) */}
        {isBossLevel && onOpenBossBattle && (
          <button
            onClick={onOpenBossBattle}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-200 shadow-xl transition-all cursor-pointer animate-pulse"
          >
            <Swords className="w-4 h-4 text-slate-950" />
            <span>COMMENCE 1v1 BOSS SHOWDOWN</span>
          </button>
        )}

        {/* Action Button: Expand Area or Claim Victory */}
        {!isBossLevel && canCompletePhase && (
          <button
            data-tutorial-id="btn-expand-action"
            onClick={() => {
              if (isBuildingMode || canProceed) {
                onCompletePhase();
              }
            }}
            disabled={!isBuildingMode && !canProceed && isLastPhase}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black shadow-xl transition-all cursor-pointer ${
              isBuildingMode || canProceed
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 animate-bounce'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-90'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>
              {isLastPhase ? 'Complete Level & Frontier ✓' : 'Expand Area (Next Phase)'}
            </span>
          </button>
        )}
      </div>

      {/* 2. Settlement Star Progress Bar (Challenger Mode Only) */}
      {!isBuildingMode && !hideScore && (
        <div
          className={`backdrop-blur-xl border shadow-2xl rounded-3xl p-3 flex flex-col gap-2 transition-all text-slate-100 ${
            isFalsehoodActive || isPenaltyLimitExceeded
              ? 'bg-rose-950/90 border-rose-500 ring-4 ring-rose-400/80 animate-pulse'
              : highlightScore
              ? 'bg-slate-900/95 border-amber-400 ring-4 ring-amber-400/80 animate-bounce'
              : 'bg-slate-900/95 border-slate-700/80'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${isFalsehoodActive || isPenaltyLimitExceeded ? 'text-rose-400' : 'text-amber-400'}`} />
              <h3 className={`text-xs font-black uppercase tracking-wider ${isFalsehoodActive || isPenaltyLimitExceeded ? 'text-rose-200' : 'text-white'}`}>
                Settlement Score
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {isFalsehoodActive || isPenaltyLimitExceeded ? (
                <div className="flex items-center gap-1">
                  <span className="text-base font-black text-rose-400 font-mono">0</span>
                  <span className="font-mono text-[9.5px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded shadow animate-pulse">
                    ERR-{scrambleNum}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-black text-amber-300 font-mono tabular-nums">
                  {score}
                </span>
              )}
            </div>
          </div>

          {isTryHard ? (
            hasCompletedFirstTrial ? (
              <div className="flex flex-col gap-1.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 transition-all ${
                          isFalsehoodActive || isPenaltyLimitExceeded
                            ? 'fill-slate-800 text-slate-600'
                            : s <= starsEarned
                            ? 'fill-amber-400 text-amber-400 drop-shadow scale-110'
                            : 'fill-slate-900 text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[9.5px] font-semibold font-mono ${isFalsehoodActive || isPenaltyLimitExceeded ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {isFalsehoodActive ? 'Falsehood Disqualified' : isPenaltyLimitExceeded ? 'Limit Disqualified' : nextMilestoneText}
                  </span>
                </div>

                {/* Continuous Progress Bar with Milestone Markers */}
                <div className="relative w-full h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFalsehoodActive || isPenaltyLimitExceeded
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    }`}
                    style={{ width: `${isFalsehoodActive || isPenaltyLimitExceeded ? 100 : scorePercent}%` }}
                  />
                </div>

                {/* Threshold Labels */}
                <div className="relative w-full h-3 text-[8.5px] font-mono text-slate-400">
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
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-[10px]">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="text-amber-200 leading-tight">
                  <span className="font-bold block">Trial 1 in Progress</span>
                  <span className="text-amber-300/80 text-[8.5px]">
                    Complete Phase 1 to unlock 3-star rating!
                  </span>
                </div>
              </div>
            )
          ) : (
            /* Casual Mode Banner */
            <div className="flex items-center justify-between p-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Casual Expedition</span>
              </div>
              <span className="text-[9px] text-emerald-400/90 font-mono">
                {masteryChallenge ? (isMasteryCompleted ? 'Mastery Met ✓' : 'Fulfill Mastery') : 'Fill Zones to Win'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Quick Utilities: Rules, Reset, Sound */}
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-1.5 flex items-center justify-between gap-1.5 text-slate-300">
        <button
          onClick={onOpenRules}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white text-[10.5px] font-bold transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Rules</span>
        </button>

        <button
          onClick={onResetBoard}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white text-[10.5px] font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset</span>
        </button>

        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 transition-all cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>
    </aside>
  );
};
