// src/components/vn/VNStage.tsx

import React, { useEffect, useRef, useState } from 'react';
import type { VNAspectRatio, VNBackground } from '../../types/vn';

// ─────────────────────────────────────────────────────────────────
// Aspect ratio lookup
// ─────────────────────────────────────────────────────────────────

const ASPECT_VALUES: Record<VNAspectRatio, number> = {
  '16:9': 16 / 9,
  '21:9': 21 / 9,
  '9:16': 9 / 16,
  '4:3': 4 / 3,
};

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────

export interface VNStageProps {
  /** Aspect ratio of the frame. Default '16:9'. */
  aspect?: VNAspectRatio;
  /** Background definition for this scene. */
  background: VNBackground;
  /** Content rendered inside the frame (character layer, text, etc.). */
  children?: React.ReactNode;
  /** Optional className for the outer black stage wrapper. */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export const VNStage: React.FC<VNStageProps> = ({
  aspect = '16:9',
  background,
  children,
  className,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  // ── Responsive frame sizing ─────────────────────────────────────
  useEffect(() => {
    const updateSize = () => {
      const stage = stageRef.current;
      if (!stage) return;

      const viewportW = stage.clientWidth;
      const viewportH = stage.clientHeight;
      const ratio = ASPECT_VALUES[aspect];

      // Fit the frame to 92% of the smaller dimension, then derive the other.
      const maxW = viewportW * 0.92;
      const maxH = viewportH * 0.92;

      let frameW = maxW;
      let frameH = frameW / ratio;

      if (frameH > maxH) {
        frameH = maxH;
        frameW = frameH * ratio;
      }

      setFrameSize({ w: Math.round(frameW), h: Math.round(frameH) });
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    if (stageRef.current) ro.observe(stageRef.current);

    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [aspect]);

  // ── Fallback gradient from mood when no layers exist ─────────────
  const moodGradient = FALLBACK_MOOD_GRADIENTS[background.mood]
    ?? FALLBACK_MOOD_GRADIENTS.dream_forest;

  const hasLayers = Boolean(background.layers && background.layers.length > 0);

  return (
    <div
      ref={stageRef}
      className={[
        'relative w-full h-full overflow-hidden',
        'bg-black', // pure black base
        'flex items-center justify-center',
        className ?? '',
      ].join(' ')}
    >
      {/* ─── Film-grain noise overlay (0.04 opacity) ─────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        aria-hidden="true"
      >
        <svg width="100%" height="100%">
          <filter id="vn-noise-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves={2}
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#vn-noise-filter)" />
        </svg>
      </div>

      {/* ─── Centered 16:9 frame ─────────────────────────────────── */}
      <div
        className="relative z-10"
        style={{
          width: frameSize.w,
          height: frameSize.h,
        }}
      >
        {/* Frame backdrop */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: moodGradient,
            // Blue-hue hairline border, ~1px. Slightly inward glow only.
            border: '1px solid rgba(96, 165, 250, 0.55)', // tailwind blue-400 @ 55%
            boxShadow:
              '0 0 0 1px rgba(30, 58, 138, 0.25), ' +    // inner blue ring, very soft
              '0 0 24px rgba(59, 130, 246, 0.08)',         // faint blue bloom
          }}
        >
          {/* Layer stack: base illustration and overlays */}
          {hasLayers ? (
            background.layers!.map((layer, idx) => (
              <div
                key={idx}
                className="absolute inset-0 pointer-events-none select-none"
                style={{
                  opacity: layer.opacity ?? 1,
                  mixBlendMode: (layer.blendMode ?? 'normal') as React.CSSProperties['mixBlendMode'],
                }}
              >
                <img
                  src={layer.src}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover"
                  style={{
                    animation: layer.animated === 'pulse'
                      ? 'vn-layer-pulse 6s ease-in-out infinite'
                      : layer.animated === 'drift'
                      ? 'vn-layer-drift 18s ease-in-out infinite'
                      : layer.animated === 'shimmer'
                      ? 'vn-layer-shimmer 4s ease-in-out infinite'
                      : undefined,
                  }}
                />
              </div>
            ))
          ) : (
            // Mood fallback already painted above; nothing else to layer.
            null
          )}

          {/* Optional color wash */}
          {background.colorWash && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: background.colorWash.color,
                opacity: background.colorWash.opacity,
                mixBlendMode: 'soft-light',
              }}
            />
          )}

          {/* Light rays (soft diagonal bloom from top-left) */}
          {background.lightRays && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(120% 120% at 0% 0%, rgba(255, 240, 200, 0.18) 0%, rgba(255, 240, 200, 0) 55%)',
                mixBlendMode: 'screen',
              }}
            />
          )}

          {/* Text gradient — bottom 40% darkens for readability */}
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: '40%',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Vignette */}
          {background.vignette !== false && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
              }}
            />
          )}

          {/* Scene content (characters, text) is composed by the caller */}
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>

      {/* ─── Scoped keyframes for layer animations ────────────────── */}
      <style>{`
        @keyframes vn-layer-pulse {
          0%, 100% { opacity: 0.92; }
          50%      { opacity: 1.0; }
        }
        @keyframes vn-layer-drift {
          0%   { transform: translate(0, 0); }
          50%  { transform: translate(-1.5%, -1%); }
          100% { transform: translate(0, 0); }
        }
        @keyframes vn-layer-shimmer {
          0%, 100% { filter: brightness(1.0); }
          50%      { filter: brightness(1.08); }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Fallback mood gradients (used only when no layer images are set)
// ─────────────────────────────────────────────────────────────────

const FALLBACK_MOOD_GRADIENTS: Record<string, string> = {
  dream_forest:
    'linear-gradient(160deg, #0d1f12 0%, #08120b 55%, #030704 100%)',
  sunlit_clearing:
    'linear-gradient(160deg, #2b1d0c 0%, #1a1107 55%, #090502 100%)',
  elder_monolith:
    'linear-gradient(160deg, #102424 0%, #091414 55%, #040808 100%)',
  rotary_river:
    'linear-gradient(160deg, #0b1c28 0%, #061018 55%, #02060a 100%)',
  storm_dam:
    'linear-gradient(160deg, #2c0808 0%, #180404 55%, #080101 100%)',
  highland_sanctuary:
    'linear-gradient(160deg, #1e0a24 0%, #100514 55%, #050208 100%)',
  sovereign_dawn:
    'linear-gradient(160deg, #281806 0%, #180d02 55%, #080400 100%)',
};

export default VNStage;