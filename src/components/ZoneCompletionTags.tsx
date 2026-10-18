// src/components/ZoneCompletionTags.tsx

import React, { useEffect, useState } from 'react';
import { coordKey, hexToWorld } from '../utils/hexMath';
import type { PhaseConfig, PlacedTile } from '../types/game';

interface ZoneTagInfo {
  key: string;
  name: string;
  color: string;
  colorHex: string;
  matched: number;
  total: number;
  isComplete: boolean;
  /** Screen-space position of the zone center */
  screenX: number;
  screenY: number;
}

interface ZoneCompletionTagsProps {
  coloredZones: PhaseConfig['coloredZones'] | undefined;
  placedTiles: Map<string, PlacedTile[]>;
  /** Only render when board is interactive (not on menus/modals) */
  isVisible: boolean;
}

const COLOR_HEX: Record<string, string> = {
  amber: '#fbbf24',
  emerald: '#34d399',
  sapphire: '#60a5fa',
  ruby: '#f87171',
  neutral: '#94a3b8',
};

// Throttle interval — 100ms is smooth enough for camera pan while keeping
// CPU cost negligible.
const UPDATE_MS = 100;

export const ZoneCompletionTags: React.FC<ZoneCompletionTagsProps> = ({
  coloredZones,
  placedTiles,
  isVisible,
}) => {
  const [tags, setTags] = useState<ZoneTagInfo[]>([]);

  useEffect(() => {
    if (!isVisible || !coloredZones || coloredZones.length === 0) {
      setTags([]);
      return;
    }

    let cancelled = false;

    const compute = () => {
      if (cancelled) return;

      const getHexPos = (window as any).__hexaGetHexScreenPos;
      if (typeof getHexPos !== 'function') {
        setTags([]);
        return;
      }

      const next: ZoneTagInfo[] = [];

      for (let i = 0; i < coloredZones.length; i++) {
        const zone = coloredZones[i];
        if (zone.coords.length === 0) continue;

        // ── 1. Occupancy (matching color on top of each cell) ─────
        let matched = 0;
        for (const c of zone.coords) {
          const stack = placedTiles.get(coordKey(c.q, c.r));
          if (stack && stack.length > 0) {
            const top = stack[stack.length - 1];
            if (top.type === 'bridge') continue;
            if (top.color === zone.color) matched++;
          }
        }
        const total = zone.coords.length;
        const isComplete = matched === total;

        // ── 2. Center position (average axial → world → screen) ──
        let sumQ = 0;
        let sumR = 0;
        for (const c of zone.coords) {
          sumQ += c.q;
          sumR += c.r;
        }
        const avgQ = sumQ / zone.coords.length;
        const avgR = sumR / zone.coords.length;

        // Snap to nearest hex for stable positioning
        const qSnap = Math.round(avgQ);
        const rSnap = Math.round(avgR);

        const screenPos = getHexPos(qSnap, rSnap);
        if (!screenPos) continue;

        next.push({
          key: `${zone.name}-${i}`,
          name: zone.name,
          color: zone.color,
          colorHex: COLOR_HEX[zone.color] ?? COLOR_HEX.neutral,
          matched,
          total,
          isComplete,
          screenX: screenPos.x,
          screenY: screenPos.y,
        });
      }

      setTags(prev => {
        // Cheap equality check to avoid render storms
        if (prev.length === next.length) {
          let same = true;
          for (let i = 0; i < next.length; i++) {
            if (
              prev[i].key !== next[i].key ||
              prev[i].matched !== next[i].matched ||
              prev[i].total !== next[i].total ||
              Math.abs(prev[i].screenX - next[i].screenX) > 0.5 ||
              Math.abs(prev[i].screenY - next[i].screenY) > 0.5
            ) {
              same = false;
              break;
            }
          }
          if (same) return prev;
        }
        return next;
      });
    };

    compute();
    const interval = setInterval(compute, UPDATE_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [coloredZones, placedTiles, isVisible]);

  if (!isVisible || tags.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {tags.map(tag => (
        <div
          key={tag.key}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: tag.screenX,
            top: tag.screenY,
          }}
        >
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border-2 font-mono font-black text-[11px] whitespace-nowrap backdrop-blur-sm transition-all duration-300 ${
              tag.isComplete
                ? 'animate-pulse'
                : ''
            }`}
            style={{
              backgroundColor: tag.isComplete
                ? `${tag.colorHex}33` // 20% alpha
                : 'rgba(15, 23, 42, 0.85)',
              borderColor: tag.colorHex,
              color: tag.isComplete ? tag.colorHex : '#f1f5f9',
              boxShadow: tag.isComplete
                ? `0 0 16px ${tag.colorHex}aa, 0 0 4px ${tag.colorHex}`
                : `0 2px 8px rgba(0,0,0,0.6), 0 0 6px ${tag.colorHex}66`,
              textShadow: tag.isComplete ? `0 0 8px ${tag.colorHex}` : '0 1px 2px rgba(0,0,0,0.9)',
            }}
            title={tag.name}
          >
            {/* Small hexagon icon */}
            <svg width="10" height="10" viewBox="0 0 12 12" className="shrink-0">
              <polygon
                points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5"
                fill={tag.isComplete ? tag.colorHex : 'transparent'}
                stroke={tag.colorHex}
                strokeWidth="1.5"
              />
            </svg>
            <span className="tabular-nums">
              {tag.matched}/{tag.total}
            </span>
            {tag.isComplete && (
              <svg width="10" height="10" viewBox="0 0 12 12" className="shrink-0">
                <path
                  d="M2 6 L5 9 L10 3"
                  fill="none"
                  stroke={tag.colorHex}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};