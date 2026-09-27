import React, { useState, useEffect } from 'react';
import { StoryChapter, DialogueSlide } from '../types/story';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Feather,
  Heart,
  Shield,
  Compass,
  Play,
  Pause,
  AlertTriangle,
  Crown,
  BookOpen,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface VisualNovelModalProps {
  isOpen: boolean;
  chapter: StoryChapter | null;
  onClose: () => void;
  onSelectAceBond?: (chapterId: number, aceBond: 'nature' | 'people' | 'self') => void;
  selectedAceBond?: 'nature' | 'people' | 'self';
}

export const VisualNovelModal: React.FC<VisualNovelModalProps> = ({
  isOpen,
  chapter,
  onClose,
  onSelectAceBond,
  selectedAceBond,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [soundOn, setSoundEnabled] = useState(true);

  // Reset slide index when chapter changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      setChosenOptionIndex(null);
      setIsAutoPlaying(false);
      sounds.playClick();
    }
  }, [isOpen, chapter]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying || !chapter) return;
    const slides = chapter.slides;
    const isLastSlide = currentSlideIndex >= slides.length - 1;

    if (isLastSlide) {
      setIsAutoPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentSlideIndex(prev => prev + 1);
    }, 4500);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentSlideIndex, chapter]);

  if (!isOpen || !chapter) return null;

  const slides = chapter.slides;
  const currentSlide: DialogueSlide = slides[currentSlideIndex] || slides[0];
  const isLastSlide = currentSlideIndex === slides.length - 1;

  const handleNextSlide = () => {
    sounds.playClick();
    if (isLastSlide) {
      onClose();
    } else {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    sounds.playClick();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // Background Mood Gradient Map
  const getMoodBackground = (mood: string) => {
    switch (mood) {
      case 'dream_forest':
        return 'from-[#132415] via-[#0d180f] to-[#060a07] border-emerald-800/50';
      case 'sunlit_clearing':
        return 'from-[#2e2010] via-[#1f1208] to-[#0d0703] border-amber-800/50';
      case 'elder_monolith':
        return 'from-[#182828] via-[#0e1818] to-[#070b0b] border-teal-800/50';
      case 'rotary_river':
        return 'from-[#102230] via-[#0a141d] to-[#04080b] border-sky-800/50';
      case 'storm_dam':
        return 'from-[#300c0c] via-[#1a0505] to-[#0a0202] border-rose-800/60';
      case 'highland_sanctuary':
        return 'from-[#241228] via-[#150a1b] to-[#08030b] border-purple-800/50';
      case 'sovereign_dawn':
        return 'from-[#301e08] via-[#1f1003] to-[#0a0501] border-amber-600/60';
      default:
        return 'from-[#24140b] via-[#140b05] to-[#080502] border-amber-900/50';
    }
  };

  // Speaker Badge Styles
  const getSpeakerStyle = (type: string) => {
    switch (type) {
      case 'kid':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/50';
      case 'nature':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50';
      case 'people':
        return 'bg-orange-950/90 text-orange-300 border-orange-500/50';
      case 'self':
        return 'bg-rose-950/90 text-rose-300 border-rose-500/50';
      case 'traveler':
        return 'bg-sky-950/90 text-sky-300 border-sky-500/50';
      case 'dam':
        return 'bg-red-950/90 text-red-300 border-red-500/50';
      case 'system':
      default:
        return 'bg-purple-950/90 text-purple-300 border-purple-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans select-none">
      {/* Visual Novel Theater Window */}
      <div
        className={`relative w-full max-w-4xl h-[90vh] max-h-[720px] rounded-3xl border-2 bg-gradient-to-b ${getMoodBackground(
          currentSlide.backgroundMood
        )} shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-700`}
      >
        {/* Ambient Animated Particles / Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          {currentSlide.backgroundMood === 'storm_dam' && (
            <div className="absolute inset-0 bg-red-950/20 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Top VN Header Bar */}
        <header className="relative z-10 p-4 sm:p-5 border-b border-amber-500/20 bg-black/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              {chapter.sketchIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                  Chapter {chapter.chapterNumber} · Visual Novel Memory
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-amber-100 font-serif tracking-wide">
                {chapter.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isAutoPlaying
                  ? 'bg-amber-500 text-amber-950 border-amber-300'
                  : 'bg-black/40 text-amber-300 border-amber-500/30 hover:bg-amber-950/60'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAutoPlaying ? 'Auto On' : 'Auto'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-rose-950/80 text-amber-200 hover:text-white border border-amber-500/30 hover:border-rose-500/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Center Stage: Character Portrait & Scene Atmosphere */}
        <main className="relative z-10 flex-1 p-4 sm:p-6 flex flex-col justify-end gap-4 overflow-y-auto">
          {/* Speaker Character Avatar Badge */}
          <div className="flex items-end gap-4 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-900/90 to-amber-950/90 border-2 border-amber-400/50 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl relative z-10">
                {currentSlide.avatarIcon}
              </div>
              <div className="absolute -inset-1 rounded-3xl bg-amber-400/20 blur-md pointer-events-none" />
            </div>

            <div className="flex flex-col gap-1">
              <div
                className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-lg ${getSpeakerStyle(
                  currentSlide.speakerType
                )}`}
              >
                <Feather className="w-3.5 h-3.5" />
                <span>{currentSlide.speakerName}</span>
              </div>
              <span className="text-[11px] font-serif italic text-amber-300/80 px-1">
                {currentSlide.speakerRole}
              </span>
            </div>
          </div>

          {/* Dialogue Text Frame */}
          <div className="w-full p-5 sm:p-7 rounded-3xl bg-black/75 border-2 border-amber-500/40 shadow-2xl backdrop-blur-md relative flex flex-col gap-4">
            {/* Story Quote Line */}
            <p className="font-serif text-sm sm:text-lg text-amber-100 leading-relaxed tracking-wide min-h-[70px]">
              "{currentSlide.text}"
            </p>

            {/* Reflection Choice (if present on slide) */}
            {currentSlide.optionChoice && (
              <div className="mt-2 p-4 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex flex-col gap-2.5 animate-fade-in">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {currentSlide.optionChoice.prompt}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentSlide.optionChoice.options.map((opt, idx) => {
                    const isSelected =
                      chosenOptionIndex === idx || (opt.aceBond && selectedAceBond === opt.aceBond);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setChosenOptionIndex(idx);
                          sounds.playVictory();
                          if (opt.aceBond && onSelectAceBond) {
                            onSelectAceBond(chapter.id, opt.aceBond);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-amber-500 text-amber-950 border-amber-200 font-bold shadow-lg scale-[1.02]'
                            : 'bg-black/50 text-amber-200 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/40'
                        }`}
                      >
                        <span className="font-bold flex items-center justify-between">
                          <span>{opt.text}</span>
                          {isSelected && <Crown className="w-3.5 h-3.5 shrink-0" />}
                        </span>
                        {isSelected && (
                          <span className="text-[10.5px] italic opacity-90 mt-1">
                            "{opt.reflectionResponse}"
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Core Philosophy Banner Note */}
            <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-amber-400/80">
              <div className="flex items-center gap-1.5 font-serif italic">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  "Trust in one bond is greater than the bless of all others — only you can build everything."
                </span>
              </div>
              <div className="font-mono text-amber-300/60">
                Slide {currentSlideIndex + 1} of {slides.length}
              </div>
            </div>
          </div>
        </main>

        {/* Bottom VN Navigation Footer */}
        <footer className="relative z-10 p-4 sm:p-5 border-t border-amber-500/20 bg-black/50 backdrop-blur-md flex items-center justify-between gap-3">
          <button
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              currentSlideIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-black/20 border-amber-900/30 text-amber-500/40'
                : 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-500/40'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <div
                key={idx}
                onClick={() => {
                  sounds.playClick();
                  setCurrentSlideIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-amber-900/60 hover:bg-amber-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextSlide}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-amber-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
          >
            <span>{isLastSlide ? 'Complete Chapter' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
};
