import React, { useState } from 'react';
import { MemoryPicture, PenaltyBypassRecord, BypassablePenaltyType } from '../types/game';
import { VN_CHAPTERS } from '../data/vn';
import type { VNChapter } from '../types/vn';
import { loadCustomVNChapters } from '../utils/vnStorage';
import { ChooseBypassModal } from './ChooseBypassModal';
import { VNPlayer } from './vn/VNPlayer';
import { VNStudioModal } from './vn/VNStudioModal';
import { convertLegacyChapter } from '../data/vn/legacyAdapter';
import {
  Sparkles,
  ArrowLeft,
  Heart,
  Compass,
  Feather,
  Shield,
  Lock,
  ChevronRight,
  BookOpen,
  Crown,
  AlertTriangle,
  Flame,
  Trees,
  Users,
} from 'lucide-react';

interface MemoriesPageProps {
  memories: MemoryPicture[];
  highestCompletedLevel: number;
  currentLevelIndex: number;
  bypasses: PenaltyBypassRecord;
  isAdminUnlocked?: boolean;
  onSelectBypass: (pictureId: number, penalty: BypassablePenaltyType) => void;
  onNavigateHome: () => void;
  onNavigateJourney: () => void;
  /** Optional: request opening the admin gate for the studio. */
  onRequestAdminAuth?: (featureName?: string) => void;
  /** Optional: called when the studio finishes a preview and wants to
   *  show the VN player. */
  onRequestHubReturn?: () => void;
}

export const MemoriesPage: React.FC<MemoriesPageProps> = ({
  memories,
  highestCompletedLevel,
  currentLevelIndex,
  bypasses,
  isAdminUnlocked = false,
  onSelectBypass,
  onNavigateHome,
  onNavigateJourney,
  onRequestAdminAuth,
  onRequestHubReturn,
}) => {
  const [selectedPictureForBypass, setSelectedPictureForBypass] = useState<MemoryPicture | null>(null);
  const [activeStoryChapter, setActiveStoryChapter] = useState<VNChapter | null>(null);
  const [chapterAceBonds, setChapterAceBonds] = useState<Record<number, 'nature' | 'people' | 'self'>>({});
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Merge built-in and custom chapters. Custom chapters override by id.
  const allChapters: VNChapter[] = (() => {
    const custom = loadCustomVNChapters();
    const customIds = new Set(custom.map((c) => c.id));
    return [
      ...VN_CHAPTERS.map((c) => (customIds.has(c.id) ? custom.find((x) => x.id === c.id)! : c)),
      ...custom.filter((c) => !VN_CHAPTERS.some((b) => b.id === c.id)),
    ];
  })();

  const handleSelectAceBond = (chapterId: number, aceBond: 'nature' | 'people' | 'self') => {
    setChapterAceBonds(prev => ({
      ...prev,
      [chapterId]: aceBond,
    }));
  };

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
          <span>The Pioneer's Visual Novel & Memories Gallery</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isAdminUnlocked) {
                onRequestAdminAuth?.('VN Studio');
                return;
              }
              setIsStudioOpen(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border shadow-lg font-bold text-xs transition-all cursor-pointer ${isAdminUnlocked
                ? 'bg-[#3d2317]/90 hover:bg-[#4d2d1e] text-cyan-200 border-cyan-500/50 hover:border-cyan-400'
                : 'bg-[#3d2317]/70 text-amber-300/80 border-[#5a3624] hover:border-amber-500/60'
              }`}
            title={isAdminUnlocked ? 'Open VN Studio' : 'Requires Admin Passcode'}
          >
            <Feather className="w-4 h-4" />
            <span>Author Chapter</span>
          </button>

          <button
            onClick={onNavigateJourney}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg font-bold text-xs transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Resume Journey</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-2 flex flex-col gap-6 items-center">
        {/* Story Philosophy & Lore Plaque */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#3a2115]/95 to-[#24130b]/95 border-2 border-[#6c4028] shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#4e2b1b] border border-[#7a492f] flex items-center justify-center text-amber-400 shadow-inner">
            <Heart className="w-6 h-6 fill-amber-400/20 text-amber-400" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 font-mono">
              The Lore of the Dream Forest
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-wide">
              The Journey of the Runaway Boy & The Paradise for All
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed font-serif italic">
            Fleeing burnout and grey skyscrapers, a young kid ran away to the mythical Dream Forest to build his dream city. As travelers arrived carrying emotional breakdowns and work-life struggles, his purpose ignited — to build the ultimate sanctuary for everyone.
          </p>

          {/* ACE Bonds Banner Note */}
          <div className="w-full max-w-2xl p-3.5 rounded-2xl bg-[#1e1009]/80 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Trees className="w-4 h-4" />
                <span>Nature</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Users className="w-4 h-4" />
                <span>People</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Flame className="w-4 h-4" />
                <span>Self</span>
              </div>
            </div>

            <div className="text-[11px] text-amber-300/80 font-serif italic">
              ✦ "One ACE per chapter — trust in one bond matters more than passive blessings."
            </div>
          </div>
        </div>

        {/* Visual Novel Chapters Section */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-200">
                Visual Novel Story Chapters
              </h2>
            </div>
            <span className="text-[11px] font-mono text-amber-400/80">
              Highest Level Cleared: Level {highestCompletedLevel} / 40
            </span>
          </div>

          {/* Visual Novel Chapter Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allChapters.map(chapter => {
              const isUnlocked = highestCompletedLevel >= chapter.levelReq;
              const chosenAce = chapterAceBonds[chapter.id];

              return (
                <div
                  key={chapter.id}
                  className={`relative rounded-3xl p-5 border-2 transition-all duration-300 flex flex-col justify-between gap-4 ${isUnlocked
                      ? 'bg-gradient-to-br from-[#2d180f] to-[#1d0d08] border-[#7c482c] shadow-xl hover:border-amber-400/80'
                      : 'bg-[#180c07]/80 border-[#3a2014] opacity-70'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#3d2115] border border-[#6c3b24] flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {chapter.sketchIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                            Chapter {chapter.chapterNumber}
                          </span>
                          {chapter.id === 8 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/50 text-rose-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Dam Collapse
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black text-amber-100 font-serif">
                          {chapter.title}
                        </h3>
                      </div>
                    </div>

                    {chosenAce && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold capitalize flex items-center gap-1 shrink-0">
                        <Crown className="w-3 h-3 text-amber-400" />
                        ACE of {chosenAce}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-amber-200/80 font-serif italic line-clamp-2">
                    "{chapter.summary}"
                  </p>

                  <div className="pt-2 border-t border-[#4a2b1a] flex items-center justify-between">
                    {isUnlocked ? (
                      <button
                        onClick={() => setActiveStoryChapter(chapter)}
                        className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Experience Visual Novel</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-2xl bg-[#1a0c06] border border-[#3a2014] text-[11px] font-mono text-amber-500/50 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Requires Level {chapter.levelReq} Victory</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Penalty Bypasses & Memories Gallery Section */}
        <div className="w-full flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-200">
                Memory Pictures & Penalty Bypass Perks
              </h2>
            </div>
            <span className="text-[11px] font-mono text-amber-400/80">
              Active Perks: Overlap ({bypasses.overlap}/3) · Overuse ({bypasses.overuse}/3) · Disconnect ({bypasses.disconnect}/3)
            </span>
          </div>

          {/* Picture Frames Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map(picture => {
              const isUnlocked = highestCompletedLevel >= picture.levelReq;
              const hasBypass = Boolean(picture.chosenBypass);

              return (
                <div
                  key={picture.id}
                  className={`relative rounded-3xl p-4 flex flex-col justify-between min-h-[220px] border-2 transition-all duration-300 ${isUnlocked
                      ? 'bg-[#2a170e]/95 border-[#7c482c] shadow-xl text-amber-100 hover:border-amber-500/80'
                      : 'bg-[#1e1009]/70 border-[#4a2b1a]/60 text-amber-400/40 opacity-75'
                    }`}
                >
                  <div className="flex-1 rounded-2xl flex flex-col items-center justify-center p-3 mb-2.5 border border-dashed border-amber-500/30 bg-[#1c0f09]/80 text-center gap-1.5">
                    {isUnlocked ? (
                      <>
                        <span className="text-3xl filter drop-shadow">{picture.sketchIcon}</span>
                        <h4 className="text-xs font-black text-amber-200">{picture.title}</h4>
                        <p className="text-[10px] text-amber-300/70 italic line-clamp-2 px-1">
                          "{picture.lore}"
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Lock className="w-5 h-5 text-amber-600/50" />
                        <span className="text-[9px] font-mono text-amber-500/40">
                          Level {picture.levelReq} Lock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#4a2b1a] pt-2">
                    {isUnlocked ? (
                      hasBypass ? (
                        <div className="flex items-center justify-between bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-1.5 text-[10.5px]">
                          <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="capitalize">{picture.chosenBypass} Pass Active</span>
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
                          <span>Choose Penalty Pass</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )
                    ) : (
                      <div className="text-[10px] text-amber-500/50 text-center py-1">
                        Unlocks at Level {picture.levelReq}
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
        <p>Hexa Pioneer · Memories & Visual Novel Lore · The Dream Forest City</p>
      </footer>

      {/* Choose Bypass Modal */}
      <ChooseBypassModal
        isOpen={Boolean(selectedPictureForBypass)}
        picture={selectedPictureForBypass}
        currentBypasses={bypasses}
        onSelectBypass={onSelectBypass}
        onClose={() => setSelectedPictureForBypass(null)}
      />

      {/* Visual Novel Modal */}
      {activeStoryChapter && (
        <VNPlayer
          chapter={activeStoryChapter}
          onClose={() => setActiveStoryChapter(null)}
          onChapterComplete={() => {
            setActiveStoryChapter(null);
            onRequestHubReturn?.();
          }}
          onSelectAceBond={handleSelectAceBond}
          selectedAceBond={
            activeStoryChapter ? chapterAceBonds[activeStoryChapter.id] : undefined
          }
        />
      )}

      {/* VN Studio Editor */}
      <VNStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onPreviewChapter={(chapter) => {
          // Close the studio and open the preview in the VN player.
          setIsStudioOpen(false);
          setActiveStoryChapter(chapter);
        }}
      />
    </div>
  );
};
