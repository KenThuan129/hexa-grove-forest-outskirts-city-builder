import React, { useState } from 'react';
import { MemoryPicture, PenaltyBypassRecord, PenaltyType } from '../types/game';
import { ChooseBypassModal } from './ChooseBypassModal';
import { Sparkles, ArrowLeft, Heart, Compass, Feather, Shield, Check, Lock, ChevronRight } from 'lucide-react';

interface MemoriesPageProps {
  memories: MemoryPicture[];
  highestCompletedLevel: number;
  currentLevelIndex: number;
  bypasses: PenaltyBypassRecord;
  onSelectBypass: (pictureId: number, penalty: PenaltyType) => void;
  onNavigateHome: () => void;
  onNavigateJourney: () => void;
}

export const MemoriesPage: React.FC<MemoriesPageProps> = ({
  memories,
  highestCompletedLevel,
  currentLevelIndex,
  bypasses,
  onSelectBypass,
  onNavigateHome,
  onNavigateJourney,
}) => {
  const [selectedPictureForBypass, setSelectedPictureForBypass] = useState<MemoryPicture | null>(null);

  const totalBypassesEarned =
    bypasses.overlap + bypasses.overuse + bypasses.disconnect + bypasses.offMap;

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-amber-950 font-sans select-none text-amber-100 flex flex-col justify-between">
      {/* Wooden Lodge Background Texture & Fireplace Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2b1810] via-[#1f100a] to-[#120805]" />
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-t from-amber-500/20 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Navigation Header */}
      <header className="relative z-10 w-full p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#3d2317]/90 hover:bg-[#4d2d1e] text-amber-200 hover:text-white border border-[#5a3624] shadow-lg transition-all text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        <div className="flex items-center gap-2 text-amber-300/80 text-xs font-serif italic">
          <Feather className="w-3.5 h-3.5 text-amber-400" />
          <span>The Pioneer's Wooden Gallery</span>
        </div>

        <button
          onClick={onNavigateJourney}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg font-bold text-xs transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>Resume Journey</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-2 flex flex-col gap-5 items-center">
        {/* Core Philosophy Plaque */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#3a2115]/95 to-[#24130b]/95 border-2 border-[#6c4028] shadow-2xl backdrop-blur-md relative overflow-hidden text-center flex flex-col items-center gap-3">
          <div className="absolute top-2 left-2 text-[#6c4028] opacity-60 text-xs font-mono">✦</div>
          <div className="absolute top-2 right-2 text-[#6c4028] opacity-60 text-xs font-mono">✦</div>
          <div className="absolute bottom-2 left-2 text-[#6c4028] opacity-60 text-xs font-mono">✦</div>
          <div className="absolute bottom-2 right-2 text-[#6c4028] opacity-60 text-xs font-mono">✦</div>

          <div className="w-10 h-10 rounded-full bg-[#4e2b1b] border border-[#7a492f] flex items-center justify-center text-amber-400 shadow-inner">
            <Heart className="w-5 h-5 fill-amber-400/20 text-amber-400" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">
            A Quiet Note for the Road
          </span>

          <blockquote className="font-serif italic text-lg sm:text-2xl text-amber-100/95 tracking-wide max-w-2xl leading-relaxed drop-shadow">
            “always remember, to treat yourself well regardless of what you witness ahead”
          </blockquote>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent my-1" />

          <p className="text-xs text-amber-300/60 max-w-lg font-light leading-relaxed">
            Completing memory pictures grants you <strong>Penalty Free Passes</strong> to aid your onward journey.
          </p>
        </div>

        {/* Active Penalty Bypass Perks Summary Banner */}
        <div className="w-full p-4 rounded-2xl bg-[#2e180d]/90 border border-[#5d351e] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-amber-200">Active Penalty Bypass Perks</h3>
              <p className="text-[11px] text-amber-400/70">
                Granted free passes for each level forward (Max 3 bypasses per penalty type):
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-[#1c0f08] border border-orange-500/30 text-orange-300 font-mono font-bold text-[10.5px]">
              Overlap: {bypasses.overlap}/3
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#1c0f08] border border-amber-500/30 text-amber-300 font-mono font-bold text-[10.5px]">
              Overuse: {bypasses.overuse}/3
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#1c0f08] border border-rose-500/30 text-rose-300 font-mono font-bold text-[10.5px]">
              Disconnect: {bypasses.disconnect}/3
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#1c0f08] border border-red-500/30 text-red-300 font-mono font-bold text-[10.5px]">
              Off-Map: {bypasses.offMap}/3
            </span>
          </div>
        </div>

        {/* The Wooden Home Gallery Section */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-200">
                Memory Pictures & Penalty Bypasses
              </h2>
            </div>
            <span className="text-[11px] font-mono text-amber-400/70">
              Highest Level Cleared: {highestCompletedLevel} / 20
            </span>
          </div>

          {/* Wooden Picture Frames Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map(picture => {
              const isUnlocked = highestCompletedLevel >= picture.levelReq;
              const hasBypass = Boolean(picture.chosenBypass);

              return (
                <div
                  key={picture.id}
                  className={`relative rounded-2xl p-4 flex flex-col justify-between min-h-[220px] border-4 transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-[#2a170e]/95 border-[#7c482c] shadow-xl text-amber-100 hover:border-amber-500/80'
                      : 'bg-[#1e1009]/70 border-[#4a2b1a]/60 text-amber-400/40 opacity-75'
                  }`}
                  style={{
                    boxShadow: isUnlocked
                      ? 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.4)'
                      : 'inset 0 0 15px rgba(0,0,0,0.7)',
                  }}
                >
                  {/* Picture Frame Canvas Area */}
                  <div
                    className={`flex-1 rounded-xl flex flex-col items-center justify-center p-3 mb-2.5 border-2 border-dashed transition-colors ${
                      isUnlocked
                        ? 'bg-[#1c0f09]/80 border-amber-500/30'
                        : 'bg-[#150a06]/90 border-[#3a2014]'
                    }`}
                  >
                    {isUnlocked ? (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <span className="text-3xl filter drop-shadow">{picture.sketchIcon}</span>
                        <h4 className="text-xs font-black text-amber-200">{picture.title}</h4>
                        <p className="text-[10px] text-amber-300/70 italic px-2 line-clamp-2">
                          "{picture.lore}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-[#2a170e] border border-[#4a2b1a] flex items-center justify-center text-amber-600/50">
                          <Lock className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono text-amber-500/40">
                          Requires Level {picture.levelReq} Victory
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Frame Footer / Bypass Action */}
                  <div className="border-t border-[#4a2b1a] pt-2 flex flex-col gap-1.5">
                    {isUnlocked ? (
                      hasBypass ? (
                        <div className="flex items-center justify-between bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-1.5 text-[10.5px]">
                          <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="capitalize">{picture.chosenBypass} Bypass (Active)</span>
                          </div>
                          <button
                            onClick={() => setSelectedPictureForBypass(picture)}
                            className="text-[9.5px] text-amber-400 hover:text-amber-200 underline cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPictureForBypass(picture)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-[10.5px] shadow-lg flex items-center justify-center gap-1 animate-pulse cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Choose Penalty to Bypass!</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )
                    ) : (
                      <div className="text-[10px] text-amber-500/50 text-center py-1">
                        Complete Level {picture.levelReq} to unlock picture & perk
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-4 text-center text-[10.5px] text-amber-400/50 border-t border-[#3a2014]">
        <p>Hexa Pioneer · Memories Hearth · Always remember to treat yourself well</p>
      </footer>

      {/* Choose Bypass Modal */}
      <ChooseBypassModal
        isOpen={Boolean(selectedPictureForBypass)}
        picture={selectedPictureForBypass}
        currentBypasses={bypasses}
        onSelectBypass={onSelectBypass}
        onClose={() => setSelectedPictureForBypass(null)}
      />
    </div>
  );
};
