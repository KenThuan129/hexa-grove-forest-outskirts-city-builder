import React from 'react';
import { PenaltyType, PenaltyBypassRecord, MemoryPicture } from '../types/game';
import { Shield, Sparkles, Copy, Layers, Unlink2, MapPinOff, X, Check } from 'lucide-react';

interface ChooseBypassModalProps {
  isOpen: boolean;
  picture: MemoryPicture | null;
  currentBypasses: PenaltyBypassRecord;
  onSelectBypass: (pictureId: number, penalty: PenaltyType) => void;
  onClose: () => void;
}

export const ChooseBypassModal: React.FC<ChooseBypassModalProps> = ({
  isOpen,
  picture,
  currentBypasses,
  onSelectBypass,
  onClose,
}) => {
  if (!isOpen || !picture) return null;

  const PENALTY_OPTIONS: {
    type: PenaltyType;
    name: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }[] = [
    {
      type: 'overlap',
      name: 'Overlap Error Bypass',
      description: 'Ignores 1 Overlap penalty (-100 pts) per level. Keep building even with stacked hexes.',
      icon: <Copy className="w-5 h-5 text-orange-500" />,
      colorClass: 'text-orange-950',
      bgClass: 'bg-orange-50/80 hover:bg-orange-100/90',
      borderClass: 'border-orange-300',
    },
    {
      type: 'overuse',
      name: 'Overuse Quota Bypass',
      description: 'Grants +1 Free tile beyond the Par Limit with zero overuse penalty (-150 pts).',
      icon: <Layers className="w-5 h-5 text-amber-500" />,
      colorClass: 'text-amber-950',
      bgClass: 'bg-amber-50/80 hover:bg-amber-100/90',
      borderClass: 'border-amber-300',
    },
    {
      type: 'disconnect',
      name: 'Disconnect Bypass',
      description: 'Ignores 1 Disconnected island (-120 pts) per level. Isolated outposts remain valid.',
      icon: <Unlink2 className="w-5 h-5 text-rose-500" />,
      colorClass: 'text-rose-950',
      bgClass: 'bg-rose-50/80 hover:bg-rose-100/90',
      borderClass: 'border-rose-300',
    },
    {
      type: 'offMap',
      name: 'Off-Map Bypass',
      description: 'Ignores 1 Off-Map placement error (-80 pts) per level for flexible exploration.',
      icon: <MapPinOff className="w-5 h-5 text-red-500" />,
      colorClass: 'text-red-950',
      bgClass: 'bg-red-50/80 hover:bg-red-100/90',
      borderClass: 'border-red-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-[#3b2014] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
              {picture.sketchIcon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                Memory Milestone {picture.id}
              </span>
              <h2 className="text-base font-black tracking-tight leading-tight">
                Choose a Penalty to "Bypass"
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 text-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-900 flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Completing <strong>"{picture.title}"</strong> grants you <strong>1 Free Pass</strong> per level for your chosen penalty. Each penalty type can only be bypassed <strong>3 times max</strong>.
            </p>
          </div>

          {/* 4 Penalty Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PENALTY_OPTIONS.map(opt => {
              const currentCount = currentBypasses[opt.type] || 0;
              const isMaxed = currentCount >= 3;
              const isCurrentlySelected = picture.chosenBypass === opt.type;

              return (
                <button
                  key={opt.type}
                  disabled={isMaxed && !isCurrentlySelected}
                  onClick={() => {
                    onSelectBypass(picture.id, opt.type);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                    isCurrentlySelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 shadow-md'
                      : isMaxed
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : `${opt.bgClass} ${opt.borderClass}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {opt.icon}
                      <span className={opt.colorClass}>{opt.name}</span>
                    </div>

                    {isCurrentlySelected ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isMaxed
                            ? 'bg-slate-300 text-slate-700'
                            : 'bg-white/80 border border-slate-300 text-slate-700'
                        }`}
                      >
                        {currentCount}/3 {isMaxed ? 'MAX' : ''}
                      </span>
                    )}
                  </div>

                  <p className="text-[10.5px] text-slate-600 leading-snug">
                    {opt.description}
                  </p>

                  <div className="w-full flex items-center justify-between text-[9.5px] font-bold border-t border-slate-200/60 pt-1.5 mt-0.5">
                    <span className={isMaxed && !isCurrentlySelected ? 'text-slate-400' : 'text-emerald-700'}>
                      {isCurrentlySelected
                        ? 'Active for all future levels'
                        : isMaxed
                        ? 'Max limit reached (3/3)'
                        : `+1 Free Pass (${currentCount + 1}/3)`}
                    </span>
                    {!isMaxed && !isCurrentlySelected && (
                      <span className="text-amber-700 font-black">Choose →</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
