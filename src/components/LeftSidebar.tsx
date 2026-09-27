import React from 'react';
import { PenaltyRecord, PenaltyBypassRecord } from '../types/game';
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
} from 'lucide-react';

interface LeftSidebarProps {
  placedCount: number;
  parCount: number;
  matchedZonesCount: number;
  totalZonesCount: number;
  penalties: PenaltyRecord;
  starsEarned: number;
  hidePenalties?: boolean;
  highlightPenalties?: boolean;
  bypasses?: PenaltyBypassRecord;
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
  hidePenalties = false,
  highlightPenalties = false,
  bypasses = { overlap: 0, overuse: 0, disconnect: 0, offMap: 0 },
  onClickPanel,
  isPanelHighlighted = false,
}) => {
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

  // Win / Loss Condition State
  const settlementStatus =
    starsEarned >= 3
      ? { label: 'Flourishing', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : starsEarned === 2
      ? { label: 'Prospering', color: 'text-teal-700 bg-teal-50 border-teal-200' }
      : starsEarned === 1
      ? { label: 'Fragile', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      : { label: 'At Risk', color: 'text-rose-700 bg-rose-50 border-rose-200' };

  return (
    <aside
      data-tutorial-id="left-sidebar-panel"
      className="pointer-events-auto w-64 sm:w-72 flex flex-col gap-2.5 p-1 select-none"
    >
      {/* 1. Building & Expanding Progress Bars */}
      <div
        onClick={onClickPanel}
        className={`bg-white/95 backdrop-blur-xl border shadow-xl rounded-2xl p-3 flex flex-col gap-2.5 transition-all ${
          isPanelHighlighted
            ? 'ring-4 ring-emerald-400 border-emerald-500 shadow-emerald-500/30 scale-105 cursor-pointer animate-pulse'
            : 'border-slate-200/90'
        }`}
      >
        {isPanelHighlighted && (
          <div className="bg-emerald-600 text-white font-black text-[9.5px] uppercase tracking-widest px-2 py-0.5 rounded-full text-center shadow animate-bounce">
            👆 CLICK THIS PANEL TO ACKNOWLEDGE
          </div>
        )}
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              Frontier Progress
            </h2>
          </div>

          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${settlementStatus.color}`}
          >
            {settlementStatus.label}
          </span>
        </div>

        {/* Building Progress */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Hammer className="w-3 h-3 text-slate-400" />
              <span>Building Quota</span>
            </span>
            <span
              className={`font-mono font-bold tabular-nums ${
                isOveruse ? 'text-amber-600' : 'text-slate-800'
              }`}
            >
              {placedCount} / {parCount} Par
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isOveruse ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, buildingPercent)}%` }}
            />
          </div>
        </div>

        {/* Expanding Progress */}
        <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Maximize2 className="w-3 h-3 text-emerald-600" />
              <span>Expanding Progress</span>
            </span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">
              {matchedZonesCount} / {totalZonesCount} Zones
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${expandingPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Penalties 2x2 Grid (Ultra Compact & High Visibility) */}
      {!hidePenalties && (
        <div
          className={`bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl rounded-2xl p-3 flex flex-col gap-2 transition-all ${
            highlightPenalties ? 'ring-4 ring-rose-400/80 animate-bounce' : ''
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                Penalties
              </h3>
            </div>
            {totalDeductions > 0 ? (
              <span className="text-[11px] font-black text-rose-600 font-mono tabular-nums">
                -{totalDeductions} pts
              </span>
            ) : (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                Clean
              </span>
            )}
          </div>

        {/* 2x2 Grid of Penalties */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {/* Overuse */}
          <div
            className={`p-1.5 rounded-xl border flex flex-col justify-between ${
              penalties.overuse > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-300'
                : 'bg-slate-50 border-slate-200/70 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <Layers className={`w-3 h-3 ${penalties.overuse > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="font-bold truncate">Overuse</span>
              </div>
              {bypasses.overuse > 0 && (
                <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.overuse} Free Pass active`}>
                  <Shield className="w-2.5 h-2.5" /> {bypasses.overuse}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="font-bold">{penalties.overuse}</span>
              <span className="text-[9px] text-slate-400">(-150)</span>
            </div>
          </div>

          {/* Disconnect */}
          <div
            className={`p-1.5 rounded-xl border flex flex-col justify-between ${
              penalties.disconnect > 0
                ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                : 'bg-slate-50 border-slate-200/70 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <Unlink2 className={`w-3 h-3 ${penalties.disconnect > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
                <span className="font-bold truncate">Disconnect</span>
              </div>
              {bypasses.disconnect > 0 && (
                <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.disconnect} Free Pass active`}>
                  <Shield className="w-2.5 h-2.5" /> {bypasses.disconnect}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="font-bold">{penalties.disconnect}</span>
              <span className="text-[9px] text-slate-400">(-120)</span>
            </div>
          </div>

          {/* Overlap */}
          <div
            className={`p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
              penalties.overlap > 0
                ? 'bg-orange-50 border-orange-400 text-orange-950 ring-1 ring-orange-400 animate-pulse'
                : 'bg-slate-50 border-slate-200/70 text-slate-500'
            }`}
            title={
              penalties.overlap > 0
                ? 'Active Overlap Error! Remove the top tile to avoid -100 penalty'
                : 'No overlapping tiles'
            }
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <Copy className={`w-3 h-3 ${penalties.overlap > 0 ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className="font-bold truncate">Overlap</span>
              </div>
              {bypasses.overlap > 0 ? (
                <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.overlap} Free Pass active`}>
                  <Shield className="w-2.5 h-2.5" /> {bypasses.overlap}
                </span>
              ) : penalties.overlap > 0 ? (
                <span className="text-[8px] font-black bg-orange-200 text-orange-900 px-1 py-0.2 rounded-full">
                  ERR
                </span>
              ) : null}
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className={`font-bold ${penalties.overlap > 0 ? 'text-orange-700' : ''}`}>
                {penalties.overlap}
              </span>
              <span className="text-[9px] text-slate-400">(-100)</span>
            </div>
          </div>

          {/* Off-Map */}
          <div
            className={`p-1.5 rounded-xl border flex flex-col justify-between ${
              penalties.offMap > 0
                ? 'bg-red-50 border-red-300 text-red-900 ring-1 ring-red-400'
                : 'bg-slate-50 border-slate-200/70 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <MapPinOff className={`w-3 h-3 ${penalties.offMap > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                <span className="font-bold truncate">Off-Map</span>
              </div>
              {bypasses.offMap > 0 && (
                <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded-md flex items-center gap-0.5" title={`🛡️ ${bypasses.offMap} Free Pass active`}>
                  <Shield className="w-2.5 h-2.5" /> {bypasses.offMap}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="font-bold">{penalties.offMap}</span>
              <span className="text-[9px] text-slate-400">(-80)</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </aside>
  );
};
