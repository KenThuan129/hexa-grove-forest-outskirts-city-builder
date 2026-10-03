// src/components/vn/VNChapterOutro.tsx

import React, { useEffect, useState } from 'react';

interface VNChapterOutroProps {
  onComplete: () => void;
}

type OutroPhase = 'in' | 'hold' | 'out';

/**
 * Full-screen cinematic chapter outro overlay.
 *
 * Sequence:
 *  1. Frame has just faded out (parent's responsibility).
 *  2. Bottom-right blue bloom fades in from the corner edge.
 *  3. "To be continued" fades in just above the bloom.
 *  4. Holds.
 *  5. onComplete fires — the parent then triggers the transition loader
 *     and returns to the Memories hub.
 */
export const VNChapterOutro: React.FC<VNChapterOutroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<OutroPhase>('in');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('hold'), 900);   // after bloom + text in
    const t2 = window.setTimeout(() => setPhase('out'), 900 + 1400); // hold duration
    const t3 = window.setTimeout(() => onComplete(), 900 + 1400 + 400); // fade-out

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  const visible = phase === 'in' || phase === 'hold';

  return (
    <div
      className="absolute inset-0 z-[200] pointer-events-none"
      style={{
        // Solid black — hides the frame entirely while the outro plays.
        background: '#000000',
        transition: 'opacity 400ms ease',
        opacity: phase === 'out' ? 0 : 1,
      }}
    >
      {/* ── Bottom-right bloom rising from the corner ─────────── */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none"
        style={{
          width: '46%',
          height: '46%',
          background:
            'radial-gradient(ellipse at 100% 100%, rgba(96, 165, 250, 0.30) 0%, rgba(96, 165, 250, 0.10) 40%, rgba(96, 165, 250, 0) 75%)',
          filter: 'blur(4px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          transformOrigin: '100% 100%',
          transition: 'opacity 900ms ease, transform 900ms ease',
          animation: visible ? 'vn-outro-bloom 3.2s ease-in-out infinite' : undefined,
        }}
      />

      {/* A thin blue hairline tracing the bottom-right corner */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: '22%',
          height: '2px',
          background:
            'linear-gradient(to left, rgba(96, 165, 250, 0.65) 0%, rgba(96, 165, 250, 0) 100%)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 900ms ease',
        }}
      />
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: '2px',
          height: '22%',
          background:
            'linear-gradient(to top, rgba(96, 165, 250, 0.65) 0%, rgba(96, 165, 250, 0) 100%)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 900ms ease',
        }}
      />

      {/* ── "To be continued" text, sitting near the bloom ────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '5%',
          bottom: '12%',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 800ms ease 300ms, transform 800ms ease 300ms',
        }}
      >
        <span
          className="font-serif italic text-base sm:text-lg md:text-xl tracking-wide"
          style={{
            color: '#bfdbfe', // blue-200
            textShadow:
              '0 2px 16px rgba(0, 0, 0, 0.9), 0 0 32px rgba(96, 165, 250, 0.35)',
          }}
        >
          To be continued
        </span>
      </div>

      {/* ── Scoped keyframes ──────────────────────────────────── */}
      <style>{`
        @keyframes vn-outro-bloom {
          0%, 100% { opacity: 0.9; }
          50%      { opacity: 1.0; }
        }
      `}</style>
    </div>
  );
};

export default VNChapterOutro;