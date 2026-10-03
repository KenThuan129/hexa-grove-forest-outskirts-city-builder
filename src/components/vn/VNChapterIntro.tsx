// src/components/vn/VNChapterIntro.tsx

import React, { useEffect, useState } from 'react';

interface VNChapterIntroProps {
  chapterNumber: number;
  chapterTitle: string;
  onComplete: () => void;
}

type IntroPhase = 'in' | 'hold' | 'out';

/**
 * Full-screen cinematic chapter intro overlay.
 *
 * Sequence:
 *  1. Glow blooms along the bottom edge (fade-in).
 *  2. Center text "Chapter N" + chapter title fades in.
 *  3. Holds.
 *  4. Text and glow fade out.
 *  5. onComplete fires.
 *
 * The black base and film grain come from the parent VNStage — this
 * component only adds the glow and the text.
 */
export const VNChapterIntro: React.FC<VNChapterIntroProps> = ({
  chapterNumber,
  chapterTitle,
  onComplete,
}) => {
  const [phase, setPhase] = useState<IntroPhase>('in');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('hold'), 1250);   // after fade-in
    const t2 = window.setTimeout(() => setPhase('out'), 1250 + 1600); // hold duration
    const t3 = window.setTimeout(() => onComplete(), 1250 + 1600 + 900); // fade-out

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  const textVisible = phase === 'in' || phase === 'hold';
  const glowVisible = textVisible; // glow stays through hold, dims during out

  return (
    <div
      className="absolute inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none"
      style={{
        // The base is pure black — the parent VNStage has already laid
        // down the noise. This overlay covers the frame entirely, so we
        // paint a solid black to hide it while the intro plays.
        background: '#000000',
        transition: 'opacity 900ms ease',
        opacity: phase === 'out' ? 0 : 1,
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
          transition: 'opacity 900ms ease',
          animation: glowVisible ? 'vn-intro-glow-pulse 2.6s ease-in-out infinite' : undefined,
        }}
      />

      {/* Very soft, wide bloom just above the bottom edge */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none"
        style={{
          width: '80%',
          height: '10%',
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(96, 165, 250, 0.22) 0%, rgba(96, 165, 250, 0) 70%)',
          opacity: glowVisible ? 1 : 0,
          transition: 'opacity 900ms ease',
        }}
      />

      {/* ── Center text block ─────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center text-center px-6"
        style={{
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 900ms ease, transform 900ms ease',
        }}
      >
        {/* Chapter N */}
        <span
          className="font-mono text-[11px] sm:text-xs tracking-[0.45em] uppercase mb-4"
          style={{
            color: '#93c5fd', // blue-300
            textShadow: '0 0 24px rgba(96, 165, 250, 0.35)',
          }}
        >
          Chapter {chapterNumber}
        </span>

        {/* Chapter title */}
        <h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide"
          style={{
            color: '#f1f5f9', // slate-100
            textShadow: '0 2px 24px rgba(0, 0, 0, 0.9), 0 0 40px rgba(96, 165, 250, 0.15)',
            maxWidth: 720,
            lineHeight: 1.25,
          }}
        >
          {chapterTitle}
        </h1>

        {/* Thin ornamental underline */}
        <div
          className="mt-6"
          style={{
            width: 64,
            height: 1,
            background:
              'linear-gradient(to right, rgba(96, 165, 250, 0), rgba(96, 165, 250, 0.75), rgba(96, 165, 250, 0))',
            opacity: textVisible ? 1 : 0,
            transition: 'opacity 900ms ease 300ms',
          }}
        />
      </div>

      {/* ── Scoped keyframes ──────────────────────────────────── */}
      <style>{`
        @keyframes vn-intro-glow-pulse {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1.0; }
        }
      `}</style>
    </div>
  );
};

export default VNChapterIntro;