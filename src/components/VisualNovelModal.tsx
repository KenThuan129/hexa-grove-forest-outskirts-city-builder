import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StoryChapter, DialogueSlide, SpeakerType } from '../types/story';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  FastForward,
  MessageSquare,
  Eye,
  EyeOff,
  LogOut,
  Shield,
  Crown,
  Volume2,
  VolumeX,
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
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Playback states
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isSkip, setIsSkip] = useState(false);
  const [isHideUI, setIsHideUI] = useState(false);
  const [showHistoryLog, setShowHistoryLog] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Selected Option
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(null);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = chapter?.slides || [];
  const currentSlide: DialogueSlide | undefined = slides[currentSlideIndex] || slides[0];
  const isLastSlide = slides.length > 0 && currentSlideIndex === slides.length - 1;

  // Typewriter Text Effect
  useEffect(() => {
    if (!isOpen || !currentSlide) return;

    setDisplayedText('');
    setIsTyping(true);

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);

    const fullText = currentSlide.text;
    let charIndex = 0;
    const speed = isSkip ? 5 : 25; // Speed up when skipping

    typingTimerRef.current = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));

      if (charIndex >= fullText.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, speed);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [currentSlideIndex, currentSlide, isSkip, isOpen]);

  // Handle Next Slide progression
  const advanceToNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      sounds.playClick();
    } else {
      setIsAutoPlay(false);
      setIsSkip(false);
      onClose();
    }
  }, [currentSlideIndex, slides.length, onClose]);

  // Handle Auto-Play & Skip Timers
  useEffect(() => {
    if (!isOpen || isTyping || !currentSlide) return;

    // Stop auto-advance if choice modal is present and not chosen
    if (currentSlide.optionChoice && chosenOptionIndex === null && !selectedAceBond) {
      setIsAutoPlay(false);
      setIsSkip(false);
      return;
    }

    if (isSkip) {
      autoPlayTimerRef.current = setTimeout(() => {
        advanceToNextSlide();
      }, 250);
    } else if (isAutoPlay) {
      autoPlayTimerRef.current = setTimeout(() => {
        advanceToNextSlide();
      }, 2800);
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isTyping, isAutoPlay, isSkip, currentSlide, chosenOptionIndex, selectedAceBond, advanceToNextSlide, isOpen]);

  // Click on dialogue area: finish typing immediately, or advance slide
  const handleDialogueBoxClick = () => {
    if (!currentSlide) return;
    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(currentSlide.text);
      setIsTyping(false);
    } else {
      advanceToNextSlide();
    }
  };

  // Reset when chapter opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      setChosenOptionIndex(null);
      setIsAutoPlay(false);
      setIsSkip(false);
      setIsHideUI(false);
      setShowHistoryLog(false);
      setShowQuitConfirm(false);
      sounds.playClick();
    }
  }, [isOpen, chapter]);

  if (!isOpen || !chapter || !currentSlide) return null;

  // Standing Sprites Configuration based on speaker
  const renderStandingSprites = () => {
    const speaker = currentSlide.speakerType;

    // Determine positions for active character sprites
    const isKidActive = speaker === 'kid';
    const isNatureActive = speaker === 'nature';
    const isPeopleActive = speaker === 'people' || speaker === 'traveler';
    const isDamActive = speaker === 'dam';

    return (
      <div className="absolute inset-0 pointer-events-none flex items-end justify-between px-6 sm:px-16 bottom-24 z-10">
        {/* Left Character Sprite: The Young Pioneer (Kid) */}
        <div
          className={`flex flex-col items-center transition-all duration-500 transform origin-bottom ${
            isKidActive
              ? 'scale-105 opacity-100 filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.4)] z-20'
              : 'scale-95 opacity-50 grayscale-[30%] z-10'
          }`}
        >
          <div className="relative w-40 sm:w-56 h-64 sm:h-80 flex flex-col items-center justify-end">
            {/* SVG Illustrated Pioneer Standing Sprite */}
            <div className="relative w-full h-full flex flex-col items-center justify-end">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-t from-amber-600/30 to-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl backdrop-blur-md">
                👦
              </div>
              <div className="w-32 sm:w-44 h-36 sm:h-48 bg-gradient-to-t from-[#3d2215] via-[#2a170d] to-transparent rounded-t-3xl border-t-2 border-x-2 border-amber-500/40 mt-[-1rem] flex items-center justify-center">
                <span className="text-3xl font-serif text-amber-300/80">✦</span>
              </div>
            </div>
            {isKidActive && (
              <div className="absolute top-2 px-3 py-1 rounded-full bg-amber-500 text-amber-950 font-black text-[10px] tracking-widest uppercase shadow-lg animate-bounce">
                Speaking
              </div>
            )}
          </div>
        </div>

        {/* Center / Right Character Sprite: Nature / Traveler / Dam Guardian */}
        <div
          className={`flex flex-col items-center transition-all duration-500 transform origin-bottom ${
            !isKidActive
              ? 'scale-105 opacity-100 filter drop-shadow-[0_10px_25px_rgba(16,185,129,0.4)] z-20'
              : 'scale-95 opacity-50 grayscale-[30%] z-10'
          }`}
        >
          <div className="relative w-44 sm:w-60 h-64 sm:h-80 flex flex-col items-center justify-end">
            <div className="relative w-full h-full flex flex-col items-center justify-end">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl backdrop-blur-md ${
                isDamActive
                  ? 'bg-gradient-to-t from-rose-900/40 to-red-600/10 border-rose-500/50'
                  : isPeopleActive
                  ? 'bg-gradient-to-t from-sky-900/40 to-cyan-500/10 border-cyan-400/50'
                  : 'bg-gradient-to-t from-emerald-900/40 to-teal-500/10 border-emerald-400/50'
              }`}>
                {currentSlide.avatarIcon}
              </div>
              <div className={`w-36 sm:w-48 h-36 sm:h-48 rounded-t-3xl border-t-2 border-x-2 mt-[-1rem] flex items-center justify-center ${
                isDamActive
                  ? 'bg-gradient-to-t from-[#2a0808] via-[#1c0505] to-transparent border-rose-500/40'
                  : isPeopleActive
                  ? 'bg-gradient-to-t from-[#0a1824] via-[#061018] to-transparent border-cyan-500/40'
                  : 'bg-gradient-to-t from-[#091f14] via-[#05140d] to-transparent border-emerald-500/40'
              }`}>
                <span className="text-3xl font-serif text-emerald-300/80">🌿</span>
              </div>
            </div>
            {!isKidActive && (
              <div className="absolute top-2 px-3 py-1 rounded-full bg-cyan-400 text-cyan-950 font-black text-[10px] tracking-widest uppercase shadow-lg animate-bounce">
                Speaking
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Background Environment Styling
  const getEnvironmentStyle = (mood: string) => {
    switch (mood) {
      case 'dream_forest':
        return 'from-[#0d1f12] via-[#08120b] to-[#030704] border-emerald-500/30';
      case 'sunlit_clearing':
        return 'from-[#2b1d0c] via-[#1a1107] to-[#090502] border-amber-500/30';
      case 'elder_monolith':
        return 'from-[#102424] via-[#091414] to-[#040808] border-teal-500/30';
      case 'rotary_river':
        return 'from-[#0b1c28] via-[#061018] to-[#02060a] border-sky-500/30';
      case 'storm_dam':
        return 'from-[#2c0808] via-[#180404] to-[#080101] border-rose-500/40';
      case 'highland_sanctuary':
        return 'from-[#1e0a24] via-[#100514] to-[#050208] border-purple-500/30';
      case 'sovereign_dawn':
        return 'from-[#281806] via-[#180d02] to-[#080400] border-amber-400/40';
      default:
        return 'from-[#1f1008] via-[#120904] to-[#060301] border-amber-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-fade-in font-sans select-none overflow-hidden">
      {/* Visual Novel Full Screen Container */}
      <div
        className={`relative w-full max-w-6xl h-[95vh] max-h-[820px] rounded-3xl border ${getEnvironmentStyle(
          currentSlide.backgroundMood
        )} bg-gradient-to-b shadow-2xl overflow-hidden flex flex-col justify-between transition-colors duration-700`}
      >
        {/* Background Environment Art Texture */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          {currentSlide.backgroundMood === 'storm_dam' && (
            <div className="absolute inset-0 bg-red-950/30 animate-pulse" />
          )}
        </div>

        {/* Top Right Control Cluster (Matching Screenshot Layout) */}
        {!isHideUI && (
          <header className="relative z-30 p-4 sm:p-6 flex items-center justify-between w-full">
            {/* Chapter Badge */}
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-xl">{chapter.sketchIcon}</span>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                  Chapter {chapter.chapterNumber} · {chapter.title}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  Slide {currentSlideIndex + 1} / {slides.length}
                </span>
              </div>
            </div>

            {/* Quick Action Button Bar */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-xl">
              {/* Dialogue History Log */}
              <button
                onClick={() => setShowHistoryLog(true)}
                title="Dialogue History Log"
                className="p-2.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Auto Play Toggle */}
              <button
                onClick={() => {
                  setIsAutoPlay(!isAutoPlay);
                  setIsSkip(false);
                  sounds.playClick();
                }}
                title="Auto Play"
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAutoPlay
                    ? 'bg-cyan-500 text-cyan-950 shadow-lg font-black'
                    : 'hover:bg-white/15 text-slate-300 hover:text-white'
                }`}
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="text-[11px]">AUTO</span>
              </button>

              {/* Fast Forward / Skip */}
              <button
                onClick={() => {
                  setIsSkip(!isSkip);
                  setIsAutoPlay(false);
                  sounds.playClick();
                }}
                title="Fast Forward / Skip"
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSkip
                    ? 'bg-amber-400 text-amber-950 shadow-lg font-black'
                    : 'hover:bg-white/15 text-slate-300 hover:text-white'
                }`}
              >
                <FastForward className="w-3.5 h-3.5" />
                <span className="text-[11px]">SKIP</span>
              </button>

              {/* Hide UI */}
              <button
                onClick={() => setIsHideUI(true)}
                title="Hide UI"
                className="p-2.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Quit Story */}
              <button
                onClick={() => setShowQuitConfirm(true)}
                title="Quit Story"
                className="p-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/30 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>
        )}

        {/* Unhide UI Floating Button when UI is hidden */}
        {isHideUI && (
          <button
            onClick={() => setIsHideUI(false)}
            className="absolute top-4 right-4 z-40 p-3 rounded-2xl bg-black/80 text-cyan-300 border border-cyan-500/40 shadow-2xl flex items-center gap-2 text-xs font-bold hover:bg-cyan-950 transition-all cursor-pointer"
          >
            <EyeOff className="w-4 h-4" />
            <span>Show Interface</span>
          </button>
        )}

        {/* Center Stage: Character Standing Sprites */}
        {!isHideUI && renderStandingSprites()}

        {/* Bottom Dialogue Box (Matching Screenshot Translucent Glass Box Layout) */}
        {!isHideUI && (
          <div className="relative z-30 p-4 sm:p-8 w-full max-w-4xl mx-auto mb-2">
            <div
              onClick={handleDialogueBoxClick}
              className="relative p-6 sm:p-8 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer hover:border-cyan-400/60 transition-all group overflow-hidden"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
              }}
            >
              {/* Sci-Fi Chamfered Glow Borders */}
              <div className="absolute top-0 left-0 w-8 h-1 bg-gradient-to-r from-cyan-400 to-transparent" />
              <div className="absolute bottom-0 right-0 w-8 h-1 bg-gradient-to-l from-cyan-400 to-transparent" />

              {/* Speaker Name Badge attached top-left */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 font-bold text-xs tracking-wider uppercase font-mono">
                  {currentSlide.speakerName}
                </span>
                <span className="text-xs font-serif italic text-slate-400">
                  — {currentSlide.speakerRole}
                </span>
              </div>

              {/* Animating Dialogue Text */}
              <p className="text-sm sm:text-lg font-serif text-slate-100 leading-relaxed tracking-wide min-h-[64px] font-medium">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />}
              </p>

              {/* Interactive Choice Modal Overlay inside Dialogue Box */}
              {currentSlide.optionChoice && (
                <div className="mt-4 pt-4 border-t border-cyan-500/20 flex flex-col gap-3 animate-fade-in">
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
                          onClick={e => {
                            e.stopPropagation();
                            setChosenOptionIndex(idx);
                            sounds.playVictory();
                            if (opt.aceBond && onSelectAceBond) {
                              onSelectAceBond(chapter.id, opt.aceBond);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                            isSelected
                              ? 'bg-amber-500 text-amber-950 border-amber-200 font-bold shadow-lg scale-[1.02]'
                              : 'bg-black/60 text-amber-200 border-cyan-500/30 hover:border-amber-400 hover:bg-amber-950/50'
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

              {/* Pulsing Next Arrow Indicator in Bottom Right */}
              {!isTyping && (
                <div className="absolute bottom-3 right-4 flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400 animate-pulse">
                  <span>CLICK TO CONTINUE</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* History Dialogue Log Modal */}
      {showHistoryLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Dialogue Transcript Log</span>
              </div>
              <button
                onClick={() => setShowHistoryLog(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {slides.slice(0, currentSlideIndex + 1).map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                    {s.speakerName} ({s.speakerRole})
                  </span>
                  <p className="text-slate-200 italic font-serif">"{s.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quit Story Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Leave Visual Novel Chapter?</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-serif">
              You can return to read Chapter {chapter.chapterNumber} anytime from the Memories Gallery.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Continue Reading
              </button>
              <button
                onClick={() => {
                  setShowQuitConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg"
              >
                Exit Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
