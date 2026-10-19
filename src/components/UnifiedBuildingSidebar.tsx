import React from 'react';
import { LevelConfig, PhaseConfig, PlacedTile, RotationZone, BossBattleStats, PenaltyRecord, TileColor, PenaltyBypassRecord } from '../types/game';
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
  Briefcase,
  Star,
  Sparkles,
  Gift,
} from 'lucide-react';
import { PenaltyTracker } from './PenaltyTracker';
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
  bypasses?: PenaltyBypassRecord;
  soundEnabled: boolean;
  canCompletePhase: boolean;
  isLastPhase: boolean;
  inspectedZoneIds?: Set<string>;
  onInspectZone?: (zoneKey: string, zone: { name: string; color: TileColor }, idx: number) => void;
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
  bypasses,
  soundEnabled,
  canCompletePhase,
  isLastPhase,
  inspectedZoneIds,
  onInspectZone,
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
      </div>

      {penalties && (
        <PenaltyTracker
          penalties={penalties}
          bypasses={bypasses || { overlap: 0, overuse: 0, disconnect: 0, offMap: 0 }} // <--- Fallback an toàn
          isTryHard={currentLevel.id >= 10}
        />
      )}

      {currentLevel.isBossLevel && bossBattleStats && (
        <div className={`flex items-center justify-between p-2 rounded-xl border ${
          bossBattleStats.zonesFulfilled > 0
            ? 'bg-gradient-to-r from-amber-950/80 to-emerald-950/80 border-amber-500/60'
            : 'bg-[#2b1a11] border-[#5c3d2e]'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔮</span>
            <div>
              <div className="text-[10px] font-bold text-[#f4ecd8]">Synthesia</div>
              <div className="text-[9px] text-[#a8b89a]">
                {bossBattleStats.zonesFulfilled} zone{bossBattleStats.zonesFulfilled === 1 ? '' : 's'} fulfilled
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-mono font-black ${
            bossBattleStats.zonesFulfilled > 0 ? 'text-amber-300' : 'text-slate-500'
          }`}>
            ×{bossBattleStats.synthesiaMultiplier.toFixed(2)}
          </span>
        </div>
      )}

      {/* 3. Colored Zones Checklist & Turntable Control */}
     <div data-tutorial-id="tutorial-target-color-zones" className="wood-panel p-3.5 flex flex-col gap-2 border-2 border-[#5c3d2e] shadow-2xl">
        

        {/* Business Battle Showcase (Boss Level) */}
        {isBossLevel && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2a1a10] via-[#352115] to-[#1e130c] border-2 border-amber-500/70 shadow-xl flex flex-col gap-2 mt-1 select-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">💼</span>
                <div>
                  <div className="text-[9.5px] font-mono font-black text-amber-400 uppercase tracking-widest">
                    BUSINESS BATTLE
                  </div>
                  <div className="text-xs font-bold text-[#f4ecd8]">
                    {currentLevel.bossName || 'Tycoon Sterling Vance'}
                  </div>
                </div>
              </div>
              <span className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                Phase {currentPhaseIndex + 1}/{totalPhases}
              </span>
            </div>

            {bossBattleStats && (
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-[#1e3520] p-1.5 rounded-xl border border-[#6b8e5a] flex flex-col justify-between">
                    <span className="text-[9px] text-emerald-300 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>Popularity</span>
                    </span>
                    <span className="text-sm font-black text-white">{bossBattleStats.popularity}</span>
                  </div>
                  <div className="bg-[#172b38] p-1.5 rounded-xl border border-[#4a7a96] flex flex-col justify-between">
                    <span className="text-[9px] text-cyan-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Ambience</span>
                    </span>
                    <span className="text-sm font-black text-white">{bossBattleStats.ambience}</span>
                  </div>
                </div>

                {/* Section Inspection Tracker */}
                <div className="p-2 rounded-xl bg-black/40 border border-amber-500/20 flex flex-col gap-1.5 text-[10px]">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-300 flex items-center gap-1">
                      <span>🔍 Inspected Sections:</span>
                    </span>
                    <span className="text-white font-mono">
                      {bossBattleStats.inspectedSectionsCount} / {bossBattleStats.totalSectionsCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9.5px] font-mono text-emerald-300 bg-emerald-950/60 p-1 rounded-lg border border-emerald-500/30">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3 h-3 text-emerald-400" />
                      <span>Bonus Slots:</span>
                    </span>
                    <span className="font-bold text-amber-300">{bossBattleStats.bonusSlots} Available</span>
                  </div>

                  <p className="text-[9px] text-[#f4ecd8]/70 leading-tight">
                    Hover over colored zones without picking up tiles to inspect &amp; earn Pop, Amb, or +1 Bonus Slot!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Business Battle Action Button */}
        {isBossLevel && onOpenBossBattle && (
          <button
            onClick={onOpenBossBattle}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-200 shadow-xl transition-all cursor-pointer animate-pulse mt-1"
          >
            <Briefcase className="w-4 h-4 text-slate-950" />
            <span>ENTER BUSINESS SHOWDOWN ➔</span>
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
