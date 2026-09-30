import React from 'react';
import { LevelConfig, PhaseConfig, PlacedTile, RotationZone, BossBattleStats, PenaltyRecord } from '../types/game';
import {
  Compass,
  TrendingUp,
  Maximize2,
  Lightbulb,
  Swords,
  Zap,
  Shield,
  Heart,
  ShieldAlert,
  RotateCw,
  Check,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { coordKey } from '../utils/hexMath';

interface UnifiedBuildingSidebarProps {
  currentLevel: LevelConfig;
  currentPhase: PhaseConfig;
  currentPhaseIndex: number;
  totalPhases: number;
  placedTiles: Map<string, PlacedTile[]>;
  placedCount: number;
  parCount: number;
  matchedZonesCount: number;
  totalZonesCount: number;
  lightbulbsUsed: number;
  lightbulbBudget: number;
  bossBattleStats?: BossBattleStats;
  rotationZones?: RotationZone[];
  penalties?: PenaltyRecord;
  soundEnabled: boolean;
  canCompletePhase: boolean;
  isLastPhase: boolean;
  onRotateZone?: (zoneId: string) => void;
  onCompletePhase: () => void;
  onOpenBossBattle?: () => void;
  onToggleSound: () => void;
  onResetBoard: () => void;
  onOpenRules: () => void;
}

export const UnifiedBuildingSidebar: React.FC<UnifiedBuildingSidebarProps> = ({
  currentLevel,
  currentPhase,
  currentPhaseIndex,
  totalPhases,
  placedTiles,
  placedCount,
  parCount,
  matchedZonesCount,
  totalZonesCount,
  lightbulbsUsed,
  lightbulbBudget,
  bossBattleStats,
  rotationZones,
  penalties,
  soundEnabled,
  canCompletePhase,
  isLastPhase,
  onRotateZone,
  onCompletePhase,
  onOpenBossBattle,
  onToggleSound,
  onResetBoard,
  onOpenRules,
}) => {
  const isBossLevel = Boolean(currentLevel.isBossLevel);
  const expandingPercent =
    totalZonesCount > 0
      ? Math.min(100, Math.round((matchedZonesCount / totalZonesCount) * 100))
      : 100;

  return (
    <aside
      data-tutorial-id="unified-building-sidebar"
      className="pointer-events-auto w-72 sm:w-80 flex flex-col gap-2.5 p-1 select-none font-sans text-[#f4ecd8]"
    >
      {/* 1. Unified Progress & Lightbulb Currency Meter */}
      <div className="wood-panel p-3.5 flex flex-col gap-2.5 border-2 border-[#5c3d2e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#5c3d2e] pb-2 font-rounded">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6b8e5a]/30 border border-[#8fbc6f]/50 flex items-center justify-center text-[#8fbc6f]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#f4ecd8]">
              Sanctuary Progress
            </h2>
          </div>

          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-lg border border-[#8fbc6f]/50 bg-[#1e3520] text-[#8fbc6f]">
            Building Journey
          </span>
        </div>

        {/* Lightbulb Currency Budget Meter */}
        <div data-tutorial-id="tutorial-lightbulb-budget" className="flex flex-col gap-1.5 font-rounded">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-[#a8b89a]">
              <Lightbulb className="w-3.5 h-3.5 text-[#f0c674] fill-current" />
              <span>Lightbulb Budget</span>
            </span>
            <span
              className={`font-mono font-bold tabular-nums ${
                lightbulbsUsed > lightbulbBudget ? 'text-rose-400 font-black' : 'text-[#f0c674]'
              }`}
            >
              {lightbulbsUsed} / {lightbulbBudget} 💡
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#1e3520] rounded-full overflow-hidden border border-[#5c3d2e] shadow-inner">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                lightbulbsUsed > lightbulbBudget
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-gradient-to-r from-[#e8b04b] to-[#f0c674]'
              }`}
              style={{ width: `${Math.min(100, Math.round((lightbulbsUsed / Math.max(1, lightbulbBudget)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Expanding Progress */}
        <div data-tutorial-id="tutorial-expanding-progress" className="flex flex-col gap-1.5 border-t border-[#5c3d2e] pt-2 font-rounded">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-[#a8b89a]">
              <Maximize2 className="w-3.5 h-3.5 text-[#7a9b8e]" />
              <span>Expanding Progress</span>
            </span>
            <span className="font-mono font-bold text-[#7a9b8e] tabular-nums">
              {matchedZonesCount} / {totalZonesCount} Zones
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#1e3520] rounded-full overflow-hidden border border-[#5c3d2e] shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#7a9b8e] to-[#8fbc6f] transition-all duration-300 rounded-full"
              style={{ width: `${expandingPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Colored Zones Checklist & Turntable Control */}
      <div data-tutorial-id="tutorial-target-color-zones" className="wood-panel p-3.5 flex flex-col gap-2 border-2 border-[#5c3d2e] shadow-2xl">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#a8b89a] font-rounded">
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
                    ? 'bg-[#1e3520] border-[#8fbc6f] text-[#8fbc6f] font-bold'
                    : 'bg-[#2b1a11] border-[#5c3d2e] text-[#f4ecd8]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    zone.color === 'amber'
                      ? 'bg-amber-400'
                      : zone.color === 'emerald'
                      ? 'bg-emerald-400'
                      : zone.color === 'sapphire'
                      ? 'bg-cyan-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span className="truncate max-w-[90px]">{zone.name}</span>
                {isZoneComplete ? (
                  <Check className="w-3 h-3 text-[#8fbc6f] shrink-0" />
                ) : (
                  <span className="font-mono text-[9px] text-[#a8b89a]">
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

            // Rules for Level 10+ "No Penalty" Badge:
            // 1 - Bypass all Overuse penalty
            // 2 - Overlap, Off-board, Falsehood, and Disconnect penalties are all counted
            const countedOverlap = penalties?.overlap ?? overlapCount;
            const countedOffMap = penalties?.offMap ?? offMapCount;
            const countedDisconnect = penalties?.disconnect ?? 0;
            const countedFalsehood = penalties?.falsehood ?? 0;

            const countedPenaltyErrors = countedOverlap + countedOffMap + countedDisconnect + countedFalsehood;

            let isClean = false;
            let violationCount = 0;

            if (isLevel10Plus) {
              isClean = countedPenaltyErrors === 0 && (lightbulbBudget <= 0 || lightbulbsUsed <= lightbulbBudget);
              violationCount = Math.max(countedPenaltyErrors, lightbulbBudget > 0 && lightbulbsUsed > lightbulbBudget ? 1 : 0);
            } else if (isLevel9) {
              isClean = overlapCount === 0;
              violationCount = overlapCount;
            } else {
              isClean = offMapCount === 0;
              violationCount = offMapCount;
            }

            return (
              <div
                key="tag-penalty-condition"
                data-tutorial-id="tag-no-off-map"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] transition-all ${
                  isClean
                    ? 'bg-[#1e3520] border-[#8fbc6f] text-[#8fbc6f] font-bold shadow'
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
                    isClean ? 'bg-[#8fbc6f]' : 'bg-rose-400'
                  }`}
                />
                <span className="truncate max-w-[90px]">{tagName}</span>
                {isClean ? (
                  <Check className="w-3 h-3 text-[#8fbc6f] shrink-0" />
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
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] transition-all ${
                  isRoadUsed
                    ? 'bg-[#1e3520] border-[#8fbc6f] text-[#8fbc6f] font-bold shadow'
                    : 'bg-amber-950/80 border-amber-500/80 text-amber-200 font-bold'
                }`}
                title={isRoadUsed ? 'Use Road: Checked! Road hex placed.' : 'Use Road: None placed yet. Place at least 1 road hex!'}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isRoadUsed ? 'bg-[#8fbc6f]' : 'bg-amber-400'}`} />
                <span className="truncate max-w-[90px]">Use Road</span>
                {isRoadUsed ? (
                  <Check className="w-3 h-3 text-[#8fbc6f] shrink-0" />
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
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] transition-all ${
                  isBridgeUsed
                    ? 'bg-[#1e3520] border-[#8fbc6f] text-[#8fbc6f] font-bold shadow'
                    : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200 font-bold'
                }`}
                title={isBridgeUsed ? 'Use Bridge: Checked! Bridge hex placed.' : 'Use Bridge: None placed yet. Place at least 1 bridge hex!'}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isBridgeUsed ? 'bg-[#8fbc6f]' : 'bg-cyan-400'}`} />
                <span className="truncate max-w-[90px]">Use Bridge</span>
                {isBridgeUsed ? (
                  <Check className="w-3 h-3 text-[#8fbc6f] shrink-0" />
                ) : (
                  <span className="font-mono text-[9px] text-cyan-300 font-bold">(none)</span>
                )}
              </div>
            );
          })()}
        </div>

        {/* Turntable Spin Controls */}
        {rotationZones && rotationZones.length > 0 && (
          <div className="flex flex-col gap-1 mt-1 border-t border-[#5c3d2e] pt-2">
            {rotationZones.map(zone => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-2 rounded-xl bg-[#1e3520] text-[#f4ecd8] border border-[#7a9b8e] shadow"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <RotateCw className="w-3.5 h-3.5 text-[#7a9b8e] shrink-0 animate-spin-slow" />
                  <div className="truncate text-[10px] font-bold text-[#f4ecd8]">
                    {zone.name}
                  </div>
                </div>
                <button
                  onClick={() => onRotateZone?.(zone.id)}
                  className="btn-river-stone px-2.5 py-1 text-[10px] font-bold shadow transition-all cursor-pointer flex items-center gap-1 ml-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Spin</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Boss HP Preview if Boss level */}
        {isBossLevel && (
          <div className="p-2.5 rounded-xl bg-[#3a2519] border border-[#f0c674] shadow flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">👹</span>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#f0c674] font-rounded">
                    BOSS CHALLENGE
                  </div>
                  <div className="text-[11px] font-bold text-[#f4ecd8]">
                    {currentLevel.bossName || 'Ancient Mist Titan'}
                  </div>
                </div>
              </div>
            </div>

            {bossBattleStats && (
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono mt-1">
                <div className="bg-[#1e3520] p-1.5 rounded-lg border border-[#6b8e5a] flex items-center justify-between">
                  <span className="text-[10px] text-[#a8b89a]">ATK</span>
                  <span className="font-bold text-[#f0c674]">{bossBattleStats.attack}</span>
                </div>
                <div className="bg-[#1e3520] p-1.5 rounded-lg border border-[#6b8e5a] flex items-center justify-between">
                  <span className="text-[10px] text-[#a8b89a]">DEF</span>
                  <span className="font-bold text-[#7a9b8e]">{bossBattleStats.defense}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Boss Battle Button */}
        {isBossLevel && onOpenBossBattle && (
          <button
            onClick={onOpenBossBattle}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold btn-sunlight text-[#2b1a11] shadow-xl transition-all cursor-pointer animate-pulse mt-1"
          >
            <Swords className="w-4 h-4 text-[#2b1a11]" />
            <span>COMMENCE 1v1 BOSS SHOWDOWN</span>
          </button>
        )}

        {/* Action Button: Expand Area or Claim Victory */}
        {!isBossLevel && canCompletePhase && (
          <button
            data-tutorial-id="btn-expand-action"
            onClick={onCompletePhase}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold btn-river-stone text-[#f4ecd8] shadow-xl transition-all cursor-pointer mt-1"
          >
            <CheckCircle2 className="w-4 h-4 text-[#8fbc6f]" />
            <span>
              {isLastPhase ? 'Complete Level & Frontier ✓' : 'Expand Area (Next Phase)'}
            </span>
          </button>
        )}
      </div>

      {/* 4. Quick Utilities */}
      <div className="wood-panel p-1.5 flex items-center justify-between gap-1.5 text-[#f4ecd8] border-2 border-[#5c3d2e]">
        <button
          onClick={onOpenRules}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-[#5c3d2e] bg-[#1e3520] hover:bg-[#2d4a2b] text-[#f4ecd8] text-[10.5px] font-bold transition-all cursor-pointer font-rounded"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#7a9b8e]" />
          <span>Rules</span>
        </button>

        <button
          onClick={onResetBoard}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-[#5c3d2e] bg-[#1e3520] hover:bg-[#2d4a2b] text-[#f4ecd8] text-[10.5px] font-bold transition-all cursor-pointer font-rounded"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#f0c674]" />
          <span>Reset</span>
        </button>

        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg border border-[#5c3d2e] bg-[#1e3520] hover:bg-[#2d4a2b] transition-all cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#8fbc6f]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#a8b89a]" />
          )}
        </button>
      </div>
    </aside>
  );
};
