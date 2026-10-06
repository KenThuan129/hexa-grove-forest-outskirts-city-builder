// src/components/journey/GhostHand.tsx

import React, { useEffect, useState } from 'react';

interface GhostHandProps {
  /** Target center X (px, viewport) */
  x: number;
  /** Target center Y (px, viewport) */
  y: number;
  /** Gesture hint — affects animation style. */
  gesture?: 'tap' | 'drag' | 'long-press' | 'shake';
  /** Render an error-colored ring behind the hand. */
  isError?: boolean;
  /** Render scale. Default 1. */
  scale?: number;
}

/**
 * Animated ghost hand icon that pulses over a target.
 * Renders as an SVG so we control color independent of OS emoji font.
 */
export const GhostHand: React.FC<GhostHandProps> = ({
  x,
  y,
  gesture = 'tap',
  isError = false,
  scale = 1,
}) => {
  const [rippleKey, setRippleKey] = useState(0);

  // Trigger ripple every 1.4s
  useEffect(() => {
    const t = setInterval(() => setRippleKey((k) => k + 1), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[48]"
      style={{
        left: x,
        top: y,
        transform: `translate(-40%, -30%) scale(${scale})`,
        transformOrigin: 'bottom left',
      }}
    >
      {/* Ripple rings — key change recreates them to restart animation */}
      {gesture !== 'shake' && (
        <div key={rippleKey} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute block w-12 h-12 -left-6 -top-6 rounded-full border-2 border-[#f0c674]/70 animate-[ghost-ripple_1.4s_ease-out_forwards]" />
          <span className="absolute block w-12 h-12 -left-6 -top-6 rounded-full border-2 border-[#f0c674]/50 animate-[ghost-ripple_1.4s_ease-out_0.3s_forwards]" />
        </div>
      )}

      {/* Hand SVG */}
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        className={`relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
          gesture === 'shake'
            ? 'animate-[ghost-shake_0.9s_ease-in-out_infinite]'
            : 'animate-[ghost-pulse_1.4s_ease-in-out_infinite]'
        }`}
      >
        {/* Hand outline */}
        <g>
          {/* Index finger (up) */}
          <path
            d="M 20 8 Q 22 6 24 8 L 24 24 L 20 24 Z"
            fill="#f4ecd8"
            stroke={isError ? '#ef4444' : '#2b1a11'}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Palm */}
          <path
            d="M 14 22 Q 14 20 16 20 L 32 20 Q 34 20 34 22 L 34 34 Q 34 40 28 40 L 18 40 Q 14 40 14 34 Z"
            fill="#f4ecd8"
            stroke="#2b1a11"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Middle/ring/pinky knuckles (simplified) */}
          <path
            d="M 26 20 L 26 14 Q 28 12 30 14 L 30 20"
            fill="#f4ecd8"
            stroke="#2b1a11"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M 32 20 L 32 16 Q 34 14 36 16 L 36 22"
            fill="#f4ecd8"
            stroke="#2b1a11"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {/* Cuff */}
          <rect
            x="16"
            y="40"
            width="18"
            height="6"
            fill="#6b8e5a"
            stroke="#2b1a11"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      {/* Inline keyframes — scoped to component tree */}
      <style>{`
        @keyframes ghost-pulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-4px) scale(1.06); }
        }
        @keyframes ghost-ripple {
          0%   { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ghost-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20%      { transform: translateX(-5px) rotate(-6deg); }
          40%      { transform: translateX(5px) rotate(6deg); }
          60%      { transform: translateX(-4px) rotate(-4deg); }
          80%      { transform: translateX(4px) rotate(4deg); }
        }
      `}</style>
    </div>
  );
};