// src/components/vn/VNChapterOutro.tsx

import React, { useEffect, useState } from 'react';

interface VNChapterOutroProps {
    onComplete: () => void;
}

export const VNChapterOutro: React.FC<VNChapterOutroProps> = ({ onComplete }) => {
    // Staged reveal: bloom → hairlines → text → hold → out
    const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
    // 0 = nothing
    // 1 = bloom visible
    // 2 = hairlines visible
    // 3 = "To be continued" visible
    // 4 = fading out
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setStage(1));
        const t2 = window.setTimeout(() => setStage(2), 600);
        const t3 = window.setTimeout(() => setStage(3), 1200);
        const t4 = window.setTimeout(() => setStage(4), 1200 + 1800); // hold
        const t5 = window.setTimeout(() => onComplete(), 1200 + 1800 + 700);

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(t2);
            window.clearTimeout(t3);
            window.clearTimeout(t4);
            window.clearTimeout(t5);
        };
    }, [onComplete]);

    const isOut = stage === 4;
    const bloomVisible = stage >= 1 && !isOut;
    const hairlinesVisible = stage >= 2 && !isOut;
    const textVisible = stage >= 3 && !isOut;

    return (
        <div
        className="absolute inset-0 z-[200] pointer-events-none"
        style={{
            background: '#000000',
            transition: isOut
            ? 'opacity 700ms ease'
            : 'opacity 650ms cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: isOut ? 0 : mounted ? 1 : 0,
        }}
        >
            {/* ── Bottom-right bloom, scaled up from the corner ─────── */}
            <div
                className="absolute right-0 bottom-0 pointer-events-none"
                style={{
                    width: '55%',
                    height: '55%',
                    background:
                        'radial-gradient(ellipse at 100% 100%, rgba(96, 165, 250, 0.32) 0%, rgba(96, 165, 250, 0.12) 38%, rgba(96, 165, 250, 0) 72%)',
                    filter: 'blur(4px)',
                    opacity: bloomVisible ? 1 : 0,
                    transform: bloomVisible ? 'scale(1)' : 'scale(0.82)',
                    transformOrigin: '100% 100%',
                    transition:
                        'opacity 1500ms cubic-bezier(0.22, 1, 0.36, 1), transform 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                    animation: bloomVisible ? 'vn-outro-bloom 3.6s ease-in-out infinite' : undefined,
                }}
            />

            {/* ── Corner hairlines drawing outward ──────────────────── */}
            {/* Horizontal */}
            <div
                className="absolute bottom-0 right-0 pointer-events-none"
                style={{
                    width: '26%',
                    height: '2px',
                    background:
                        'linear-gradient(to left, rgba(96, 165, 250, 0.7) 0%, rgba(96, 165, 250, 0) 100%)',
                    opacity: hairlinesVisible ? 1 : 0,
                    transform: hairlinesVisible ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: '100% 50%',
                    transition:
                        'opacity 900ms ease, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            />
            {/* Vertical */}
            <div
                className="absolute bottom-0 right-0 pointer-events-none"
                style={{
                    width: '2px',
                    height: '26%',
                    background:
                        'linear-gradient(to top, rgba(96, 165, 250, 0.7) 0%, rgba(96, 165, 250, 0) 100%)',
                    opacity: hairlinesVisible ? 1 : 0,
                    transform: hairlinesVisible ? 'scaleY(1)' : 'scaleY(0)',
                    transformOrigin: '50% 100%',
                    transition:
                        'opacity 900ms ease, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            />

            {/* ── "To be continued" ─────────────────────────────────── */}
            <div
                className="absolute pointer-events-none"
                style={{
                    right: '5%',
                    bottom: '12%',
                    opacity: textVisible ? 1 : 0,
                    transform: textVisible ? 'translateY(0)' : 'translateY(16px)',
                    transition:
                        'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1), transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            >
                <span
                    className="font-serif italic text-base sm:text-lg md:text-xl tracking-wide"
                    style={{
                        color: '#bfdbfe',
                        textShadow:
                            '0 2px 16px rgba(0, 0, 0, 0.9), 0 0 32px rgba(96, 165, 250, 0.35)',
                    }}
                >
                    To be continued
                </span>
            </div>

            <style>{`
        @keyframes vn-outro-bloom {
          0%, 100% { filter: blur(4px) brightness(0.9); }
          50%      { filter: blur(4px) brightness(1.1); }
        }
      `}</style>
        </div>
    );
};

export default VNChapterOutro;