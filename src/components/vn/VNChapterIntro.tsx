// src/components/vn/VNChapterIntro.tsx

import React, { useEffect, useState } from 'react';

interface VNChapterIntroProps {
  chapterNumber: number;
  chapterTitle: string;
  onComplete: () => void;
}

export const VNChapterIntro: React.FC<VNChapterIntroProps> = ({
  chapterNumber,
  chapterTitle,
  onComplete,
}) => {
  // Staged reveal: glow → "Chapter N" → title → underline → out
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  // 0 = nothing (initial frame)
  // 1 = glow visible
  // 2 = "Chapter N" visible
  // 3 = chapter title visible
  // 4 = underline visible
  // 5 = everything fading out
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    // Frame 0 → 1: mount → glow in (next frame)
    const raf = requestAnimationFrame(() => setStage(1));

    const t2 = window.setTimeout(() => setStage(2), 700);
    const t3 = window.setTimeout(() => setStage(3), 1300);
    const t4 = window.setTimeout(() => setStage(4), 1900);
    const t5 = window.setTimeout(() => setStage(5), 1900 + 1400); // hold after all revealed
    const t6 = window.setTimeout(() => onComplete(), 1900 + 1400 + 900); // fade-out complete

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
      window.clearTimeout(t6);
    };
  }, [onComplete]);

  const isOut = stage === 5;
  const glowVisible = stage >= 1 && !isOut;
  const chapterLabelVisible = stage >= 2 && !isOut;
  const titleVisible = stage >= 3 && !isOut;
  const underlineVisible = stage >= 4 && !isOut;

  return (
    <div
      className="absolute inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none"
      style={{
        background: '#000000',
        // Entrance: fade in from transparent → opaque over 700ms.
        // Exit: fade to 0 over 900ms, driven by `isOut`.
        transition: isOut
          ? 'opacity 900ms ease'
          : 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: isOut ? 0 : mounted ? 1 : 0,
      }}
    >
      {/* ── Bottom-edge blue glow ─────────────────────────────── */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          height: '18%',
          background:
            'linear-gradient(to top, rgba(96, 165, 250, 0.28) 0%, rgba(96, 165, 250, 0.10) 35%, rgba(96, 165, 250, 0) 100%)',
          filter: 'blur(2px)',
          opacity: glowVisible ? 1 : 0,
          transform: glowVisible ? 'translateY(0)' : 'translateY(20%)',
          transition:
            'opacity 1400ms cubic-bezier(0.22, 1, 0.36, 1), transform 1400ms cubic-bezier(0.22, 1, 0.36, 1)',
          animation: glowVisible ? 'vn-intro-glow-pulse 2.6s ease-in-out infinite' : undefined,
        }}
      />

      {/* Wide, soft bloom above the edge */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none"
        style={{
          width: '80%',
          height: '10%',
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(96, 165, 250, 0.22) 0%, rgba(96, 165, 250, 0) 70%)',
          opacity: glowVisible ? 1 : 0,
          transition: 'opacity 1400ms cubic-bezier(0.22, 1, 0.36, 1) 200ms',
        }}
      />

      {/* ── Center text block ─────────────────────────────────── */}
      <div className="relative flex flex-col items-center text-center px-6">
        {/* Chapter N */}
        <span
          className="font-mono text-[11px] sm:text-xs tracking-[0.45em] uppercase mb-5"
          style={{
            color: '#93c5fd',
            textShadow: '0 0 24px rgba(96, 165, 250, 0.35)',
            opacity: chapterLabelVisible ? 1 : 0,
            transform: chapterLabelVisible ? 'translateY(0)' : 'translateY(10px)',
            transition:
              'opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1), transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          Chapter {chapterNumber}
        </span>

        {/* Chapter title */}
        <h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide"
          style={{
            color: '#f1f5f9',
            textShadow: '0 2px 24px rgba(0, 0, 0, 0.9), 0 0 40px rgba(96, 165, 250, 0.15)',
            maxWidth: 720,
            lineHeight: 1.25,
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(14px)',
            transition:
              'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1), transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {chapterTitle}
        </h1>

        {/* Ornamental underline — draws outward from center */}
        <div
          className="mt-7"
          style={{
            width: 96,
            height: 1,
            background:
              'linear-gradient(to right, rgba(96, 165, 250, 0), rgba(96, 165, 250, 0.85), rgba(96, 165, 250, 0))',
            opacity: underlineVisible ? 1 : 0,
            transform: underlineVisible ? 'scaleX(1)' : 'scaleX(0.2)',
            transition:
              'opacity 900ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      <style>{`
        @keyframes vn-intro-glow-pulse {
          0%, 100% { filter: blur(2px) brightness(0.9); }
          50%      { filter: blur(2px) brightness(1.15); }
        }
      `}</style>
    </div>
  );
};

export default VNChapterIntro;