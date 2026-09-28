import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Sparkles, Lock, CheckCircle2, ArrowRight, X, Star, Hammer } from 'lucide-react';
import { ConstructionItem } from '../types/economy';
import { sounds } from '../utils/audio';

interface GoldenTicketModalProps {
  isOpen: boolean;
  hasGoldenTicket: boolean;
  maxedBuildingsCount: number;
  constructions: ConstructionItem[];
  onClaimTicket: () => void;
  onClose: () => void;
}

export const GoldenTicketModal: React.FC<GoldenTicketModalProps> = ({
  isOpen,
  hasGoldenTicket,
  maxedBuildingsCount,
  constructions,
  onClaimTicket,
  onClose,
}) => {
  const isReadyToClaim = maxedBuildingsCount >= 10;

  useEffect(() => {
    if (isOpen && (hasGoldenTicket || isReadyToClaim)) {
      sounds.playVictory();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#ffffff'],
      });
    }
  }, [isOpen, hasGoldenTicket, isReadyToClaim]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl border-2 border-amber-500/40 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center gap-4 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Ambient Gold / Emerald Background Aura */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-2 mt-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border ${
            hasGoldenTicket || isReadyToClaim
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-yellow-200 text-amber-950 animate-bounce'
              : 'bg-slate-800 border-slate-700 text-amber-400'
          }`}>
            {hasGoldenTicket || isReadyToClaim ? <Crown className="w-7 h-7" /> : <Lock className="w-6 h-6 text-amber-400" />}
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              {hasGoldenTicket
                ? 'Apex Masterpiece Awarded'
                : isReadyToClaim
                ? 'Ready to Claim!'
                : 'Resort Architecture Milestone'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight mt-0.5">
              {hasGoldenTicket ? 'The Legendary Golden Ticket' : 'Golden Ticket Vault'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
              {hasGoldenTicket
                ? 'You have conquered all 10 resort wonders, establishing a timeless island sanctuary for all pioneers.'
                : isReadyToClaim
                ? 'Magnificent! All 10 resort buildings have reached maximum Level 3. Claim your Golden Ticket now!'
                : 'Max out all 10 resort constructions to Level 3 using Leaves to unlock and claim the legendary Golden Ticket.'}
            </p>
          </div>
        </div>

        {/* Progress Tracker Card */}
        <div className="w-full bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resort Progress</span>
            </span>
            <span className={`font-mono font-black ${isReadyToClaim ? 'text-emerald-400' : 'text-amber-400'}`}>
              {maxedBuildingsCount}/10 Maxed ★
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isReadyToClaim
                  ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(100, (maxedBuildingsCount / 10) * 100)}%` }}
            />
          </div>

          {/* 10 Constructions Mini Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
            {constructions.map((c) => {
              const isMax = c.currentLevel >= c.maxLevel;
              return (
                <div
                  key={c.id}
                  className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 text-center transition-all ${
                    isMax
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : c.currentLevel > 0
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="text-[9.5px] font-bold truncate max-w-full leading-tight">{c.name.split(' ')[0]}</span>
                  <span className={`text-[8.5px] font-mono font-bold ${isMax ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isMax ? '★ MAX' : `Lvl ${c.currentLevel}/3`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Golden Ticket Card Display */}
        <div className={`relative w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
          hasGoldenTicket || isReadyToClaim
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 border-yellow-200 shadow-xl'
            : 'bg-slate-950/80 border-slate-800 text-slate-400 opacity-75'
        }`}>
          <div className="w-full flex items-center justify-between border-b border-current/20 pb-1.5">
            <span className="text-[9px] font-black tracking-widest uppercase font-mono">
              ✦ ARCHIPELAGO SANCTUARY PASS ✦
            </span>
            <span className="text-[10px] font-mono font-black">№ 0001-GOLD</span>
          </div>

          <div className="py-1 flex flex-col items-center">
            <span className="text-3xl filter drop-shadow">🎟️</span>
            <h3 className="text-base sm:text-lg font-black tracking-wider uppercase font-serif mt-0.5">
              THE GOLDEN TICKET
            </h3>
            <span className="text-[10px] font-bold opacity-90 mt-0.5">
              Supreme Architectural Mastery & 100% Resort Island Completion
            </span>
          </div>

          <div className="w-full border-t border-dashed border-current/20 pt-1.5 flex items-center justify-between text-[9px] font-mono font-bold">
            <span>RESORT: 10/10 MAXED</span>
            <span>{hasGoldenTicket ? 'STATUS: ACTIVE VIP' : isReadyToClaim ? 'STATUS: UNCLAIMED' : 'STATUS: LOCKED'}</span>
          </div>
        </div>

        {/* Action Button */}
        {isReadyToClaim && !hasGoldenTicket ? (
          <button
            onClick={() => {
              onClaimTicket();
              sounds.playVictory();
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8', '#ffffff'],
              });
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-amber-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-amber-950" />
            <span>Claim Legendary Golden Ticket!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              hasGoldenTicket
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {hasGoldenTicket ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Return to Island Sanctuary</span>
              </>
            ) : (
              <span>Return & Continue Building ({maxedBuildingsCount}/10)</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
