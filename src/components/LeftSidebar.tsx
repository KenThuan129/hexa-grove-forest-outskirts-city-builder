import React from 'react';
import { PenaltyRecord, PenaltyBypassRecord, GameMode } from '../types/game';
import {
  AlertTriangle,
  Hammer,
  Maximize2,
  TrendingUp,
  Layers,
  Unlink2,
  Copy,
  MapPinOff,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface LeftSidebarProps {
  placedCount: number;
  parCount: number;
  matchedZonesCount: number;
  totalZonesCount: number;
  penalties: PenaltyRecord;
  starsEarned: number;
  levelId?: number;
  strictPenaltyLimit?: number;
  hidePenalties?: boolean;
  highlightPenalties?: boolean;
  bypasses?: PenaltyBypassRecord;
  gameMode?: GameMode;
  onClickPanel?: () => void;
  isPanelHighlighted?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  placedCount,
  parCount,
  matchedZonesCount,
  totalZonesCount,
  penalties,
  starsEarned,
  levelId = 1,
  strictPenaltyLimit,
  hidePenalties = false,
  highlightPenalties = false,
  bypasses = { overlap: 0, overuse: 0, disconnect: 0, offMap: 0 },
  gameMode = 'casual',
  onClickPanel,
  isPanelHighlighted = false,
}) => {
  const isTryHard = gameMode === 'tryhard';
  const buildingPercent = Math.min(100, Math.round((placedCount / Math.max(1, parCount)) * 100));
  const isOveruse = placedCount > parCount;

  const expandingPercent =
    totalZonesCount > 0
      ? Math.min(100, Math.round((matchedZonesCount / totalZonesCount) * 100))
      : 100;

  const totalDeductions =
    penalties.overuse * 150 +
    penalties.disconnect * 120 +
    penalties.overlap * 100 +
    penalties.offMap * 80;

  const totalPenaltiesCount =
    penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + (penalties.falsehood || 0);

  // In Casual Mode, penalty cap does not disqualify player
  const maxPenalties = isTryHard ? (strictPenaltyLimit ?? (levelId >= 20 ? 3 : undefined)) : undefined;
  const isPenaltyLimitExceeded = maxPenalties !== undefined && totalPenaltiesCount > maxPenalties;
  const isFalsehoodTriggered = isTryHard && (penalties.falsehood || 0) > 0;

  const [scrambleNum, setScrambleNum] = React.useState('742');

  React.useEffect(() => {
    if (!isFalsehoodTriggered && !isPenaltyLimitExceeded) return;
    const interval = setInterval(() => {
      setScrambleNum(Math.floor(100 + Math.random() * 899).toString());
    }, 120);
    return () => clearInterval(interval);
  }, [isFalsehoodTriggered, isPenaltyLimitExceeded]);

  const settlementStatus =
    isPenaltyLimitExceeded || isFalsehoodTriggered
      ? { label: 'Disqualified (0 Pts)', color: 'text-rose-300 bg-rose-950/80 border-rose-500 animate-pulse' }
      : !isTryHard
      ? { label: 'Casual Expedition', color: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40' }
      : starsEarned >= 3
      ? { label: 'Flourishing ★★★', color: 'text-amber-300 bg-amber-950/80 border-amber-500/40' }
      : starsEarned === 2
      ? { label: 'Prospering ★★', color: 'text-teal-300 bg-teal-950/80 border-teal-500/40' }
      : starsEarned === 1
      ? { label: 'Fragile ★', color: 'text-amber-400 bg-amber-950/60 border-amber-600/40' }
      : { label: 'At Risk', color: 'text-rose-300 bg-rose-950/60 border-rose-500/40' };

  return (
    <aside
      data-tutorial-id="left-sidebar-panel"
      className="pointer-events-auto w-64 sm:w-72 flex flex-col gap-2.5 p-1 select-none font-sans"
    >
      {/* 1. Building & Expanding Progress Bars */}
      <div
        onClick={onClickPanel}
        className={`bg-slate-900/95 backdrop-blur-xl border shadow-2xl rounded-3xl p-3.5 flex flex-col gap-2.5 transition-all text-slate-100 ${
          isPanelHighlighted
            ? 'ring-4 ring-emerald-400 border-emerald-500 shadow-emerald-500/30 scale-105 cursor-pointer animate-pulse'
            : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        {isPanelHighlighted && (
          <div className="bg-emerald-600 text-white font-black text-[9.5px] uppercase tracking-widest px-2 py-0.5 rounded-full text-center shadow animate-bounce">
            👆 CLICK THIS PANEL TO ACKNOWLEDGE
          </div>
        )}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Frontier Progress
            </h2>
          </div>

          <span
            className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${settlementStatus.color}`}
          >
            {settlementStatus.label}
          </span>
        </div>

        {/* Building Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Hammer className="w-3.5 h-3.5 text-amber-400" />
              <span>Building Quota</span>
            </span>
            <span
              className={`font-mono font-bold tabular-nums ${
                isOveruse ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {placedCount} / {parCount} Par
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isOveruse ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]' : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              }`}
              style={{ width: `${Math.min(100, buildingPercent)}%` }}
            />
          </div>
        </div>

        {/* Expanding Progress */}
        <div className="flex flex-col gap-1.5 border-t border-slate-800/80 pt-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Expanding Progress</span>
            </span>
            <span className="font-mono font-bold text-cyan-300 tabular-nums">
              {matchedZonesCount} / {totalZonesCount} Zones
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              style={{ width: `${expandingPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Penalties 2x2 Grid */}
      {!hidePenalties && (
        <div
          className={`bg-slate-900/95 backdrop-blur-xl border shadow-2xl rounded-3xl p-3.5 flex flex-col gap-2.5 transition-all text-slate-100 ${
            isPenaltyLimitExceeded || isFalsehoodTriggered
              ? 'border-rose-500 ring-4 ring-rose-400/80 animate-pulse bg-rose-950/40'
              : highlightPenalties
              ? 'ring-4 ring-rose-400/80 animate-bounce'
              : 'border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Penalties {maxPenalties !== undefined && `(${totalPenaltiesCount}/${maxPenalties} Max)`}
              </h3>
            </div>
            {isPenaltyLimitExceeded || isFalsehoodTriggered ? (
              <span className="text-[9.5px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full uppercase shadow animate-pulse">
                LIMIT EXCEEDED
              </span>
            ) : totalDeductions > 0 ? (
              <span className="text-xs font-black text-rose-400 font-mono tabular-nums">
                -{totalDeductions} pts
              </span>
            ) : (
              <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Clean
              </span>
            )}
          </div>

          {/* Falsehood Alert */}
          {isFalsehoodTriggered && (
            <div className="p-2 rounded-2xl bg-rose-950/90 text-white text-[10px] flex items-center justify-between font-bold border border-rose-500 ring-2 ring-rose-400 shadow animate-pulse">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">⚠️</span>
                <span>Falsehood Penalty</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded">
                  ERR-{scrambleNum}
                </span>
                <span className="text-rose-300 font-mono">Score 0</span>
              </div>
            </div>
          )}

          {/* 2x2 Grid of Penalties */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {/* Overuse */}
            <div
              className={`p-2 rounded-2xl border flex flex-col justify-between ${
                penalties.overuse > 0
                  ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Layers className={`w-3 h-3 ${penalties.overuse > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="font-bold truncate">Overuse</span>
                </div>
                {bypasses.overuse > 0 && (
                  <span className="text-[8px] font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.overuse} Free Pass active`}>
                    <Shield className="w-2.5 h-2.5" /> {bypasses.overuse}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className={`font-black ${penalties.overuse > 0 ? 'text-amber-300 text-xs' : ''}`}>{penalties.overuse}</span>
                <span className="text-[9px] text-slate-500">(-150)</span>
              </div>
            </div>

            {/* Disconnect */}
            <div
              className={`p-2 rounded-2xl border flex flex-col justify-between ${
                penalties.disconnect > 0
                  ? 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Unlink2 className={`w-3 h-3 ${penalties.disconnect > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                  <span className="font-bold truncate">Disconnect</span>
                </div>
                {bypasses.disconnect > 0 && (
                  <span className="text-[8px] font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.disconnect} Free Pass active`}>
                    <Shield className="w-2.5 h-2.5" /> {bypasses.disconnect}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className={`font-black ${penalties.disconnect > 0 ? 'text-rose-300 text-xs' : ''}`}>{penalties.disconnect}</span>
                <span className="text-[9px] text-slate-500">(-120)</span>
              </div>
            </div>

            {/* Overlap */}
            <div
              className={`p-2 rounded-2xl border flex flex-col justify-between transition-all ${
                penalties.overlap > 0
                  ? 'bg-orange-950/60 border-orange-500 text-orange-200 ring-2 ring-orange-500/40 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
              title={
                penalties.overlap > 0
                  ? 'Active Overlap Error! Remove the top tile to avoid -100 penalty'
                  : 'No overlapping tiles'
              }
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Copy className={`w-3 h-3 ${penalties.overlap > 0 ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span className="font-bold truncate">Overlap</span>
                </div>
                {bypasses.overlap > 0 ? (
                  <span className="text-[8px] font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.overlap} Free Pass active`}>
                    <Shield className="w-2.5 h-2.5" /> {bypasses.overlap}
                  </span>
                ) : penalties.overlap > 0 ? (
                  <span className="text-[8px] font-black bg-orange-500 text-orange-950 px-1 py-0.2 rounded-full font-mono">
                    ERR
                  </span>
                ) : null}
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className={`font-black ${penalties.overlap > 0 ? 'text-orange-300 text-xs' : ''}`}>
                  {penalties.overlap}
                </span>
                <span className="text-[9px] text-slate-500">(-100)</span>
              </div>
            </div>

            {/* Off-Map */}
            <div
              className={`p-2 rounded-2xl border flex flex-col justify-between ${
                penalties.offMap > 0
                  ? 'bg-red-950/50 border-red-500/60 text-red-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <MapPinOff className={`w-3 h-3 ${penalties.offMap > 0 ? 'text-red-400' : 'text-slate-500'}`} />
                  <span className="font-bold truncate">Off-Map</span>
                </div>
                {bypasses.offMap > 0 && (
                  <span className="text-[8px] font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.offMap} Free Pass active`}>
                    <Shield className="w-2.5 h-2.5" /> {bypasses.offMap}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className={`font-black ${penalties.offMap > 0 ? 'text-red-300 text-xs' : ''}`}>{penalties.offMap}</span>
                <span className="text-[9px] text-slate-500">(-80)</span>
              </div>
            </div>
          </div>

          {/* Falsehood Penalty Tile for Level 21+ */}
          {levelId >= 21 && (
            <div
              className={`p-2 rounded-2xl border flex items-center justify-between text-[10px] mt-0.5 transition-all ${
                isFalsehoodTriggered
                  ? 'bg-rose-950 border-rose-500 text-white ring-2 ring-rose-400 shadow animate-pulse'
                  : 'bg-purple-950/40 border-purple-500/40 text-purple-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🌫️</span>
                <div>
                  <span className="font-bold block leading-none text-purple-200">Falsehood Penalty</span>
                  <span className={`text-[8.5px] ${isFalsehoodTriggered ? 'text-rose-300' : 'text-purple-400'}`}>
                    {isFalsehoodTriggered ? 'Disconnected from safe ground!' : 'Fog must connect to safe ground'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isFalsehoodTriggered ? (
                  <span className="font-mono text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                    ERR-{scrambleNum}
                  </span>
                ) : (
                  <span className="font-mono font-bold text-[9px] text-purple-300 bg-purple-950 border border-purple-500/40 px-1.5 py-0.2 rounded-full">
                    0 Errors
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
