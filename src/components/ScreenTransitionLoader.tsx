import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, Home, BookOpen, MapPin } from 'lucide-react';
import { sounds } from '../utils/audio';

export type ScreenDestination = 'home' | 'journey' | 'memories';

interface ScreenTransitionLoaderProps {
  destination: ScreenDestination;
  destinationTitle?: string;
  destinationSubtitle?: string;
  onTransitionMidpoint?: () => void;
  onComplete: () => void;
  durationMs?: number;
}

export const ScreenTransitionLoader: React.FC<ScreenTransitionLoaderProps> = ({
  destination,
  destinationTitle,
  destinationSubtitle,
  onTransitionMidpoint,
  onComplete,
  durationMs = 650,
}) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    sounds.playTransitWhoosh();

    // Trigger midpoint callback to switch actual router/DOM state underneath
    const midTimer = setTimeout(() => {
      setPhase('hold');
      if (onTransitionMidpoint) {
        onTransitionMidpoint();
      }
    }, durationMs * 0.45);

    // Trigger exit fade
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, durationMs * 0.75);

    // Finish transition
    const endTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(midTimer);
      clearTimeout(exitTimer);
      clearTimeout(endTimer);
    };
  }, [durationMs, onComplete, onTransitionMidpoint]);

  // Determine dynamic visual icon and text based on destination
  const getDestinationContent = () => {
    switch (destination) {
      case 'home':
        return {
          icon: <Home className="w-5 h-5 text-emerald-400" />,
          badge: 'Sanctuary Route',
          title: destinationTitle || 'Returning to Island Sanctuary',
          subtitle: destinationSubtitle || 'Archipelago Resort & Construction Hub',
        };
      case 'memories':
        return {
          icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
          badge: 'Chronicle Vault',
          title: destinationTitle || 'Unfurling Memories Gallery',
          subtitle: destinationSubtitle || 'Photographic relics & ancient bypasses',
        };
      case 'journey':
      default:
        return {
          icon: <Compass className="w-5 h-5 text-amber-400" />,
          badge: 'Frontier Expedition',
          title: destinationTitle || 'Charting Frontier Coordinates',
          subtitle: destinationSubtitle || 'Hexagonal territory awaiting mastery',
        };
    }
  };

  const content = getDestinationContent();

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl transition-opacity duration-200 select-none ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Ambient Background Light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Center Stage Modal Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full animate-in zoom-in-95 duration-200">
        {/* Animated Portal Astrolabe */}
        <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
          {/* Rotating Outer Hex Ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-400/40 animate-spin [animation-duration:8s]" />
          
          {/* Inner Counter-Rotating Hex */}
          <div className="absolute inset-2 rounded-xl border border-cyan-400/30 animate-spin [animation-duration:6s] [animation-direction:reverse]" />

          {/* Central Portal Icon */}
          <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 shadow-xl flex items-center justify-center">
            {content.icon}
          </div>
        </div>

        {/* Destination Category Pill */}
        <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold mb-1.5">
          {content.badge}
        </span>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          {content.title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-slate-400 mt-1 max-w-xs font-medium">
          {content.subtitle}
        </p>

        {/* Rapid Micro Transit Line */}
        <div className="w-32 h-1 bg-slate-900 rounded-full border border-slate-800 overflow-hidden mt-4 relative">
          <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full animate-[shimmer_1s_infinite] w-full" />
        </div>
      </div>
    </div>
  );
};
