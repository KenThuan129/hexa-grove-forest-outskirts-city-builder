// src/components/journey/JourneyTrayMobile.tsx

import React, { useMemo, useRef, useState } from 'react';
import { HexPiece, TileColor } from '../../types/game';
import { getHex3DThumbnail } from '../../utils/thumbnailGenerator';
import { sounds } from '../../utils/audio';
import { Lightbulb } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Filter chips
// ─────────────────────────────────────────────────────────────────

type ColorFilter = 'all' | TileColor;

const FILTER_ORDER: ColorFilter[] = ['all', 'neutral', 'amber', 'emerald', 'sapphire', 'ruby'];

const FILTER_LABEL: Record<ColorFilter, string> = {
  all: 'All',
  neutral: 'Gray',
  amber: 'Amber',
  emerald: 'Emerald',
  sapphire: 'Sapphire',
  ruby: 'Ruby',
};

const FILTER_DOT: Record<ColorFilter, string> = {
  all: 'bg-slate-300',
  neutral: 'bg-slate-400',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
  sapphire: 'bg-cyan-400',
  ruby: 'bg-rose-400',
};

// ─────────────────────────────────────────────────────────────────
// Tile card
// ─────────────────────────────────────────────────────────────────

interface TileCardProps {
  piece: HexPiece;
  isSelected: boolean;
  isFirst?: boolean;
  orientation: 'horizontal' | 'vertical';
  onSelect: (piece: HexPiece) => void;
  onStartDrag: (piece: HexPiece, clientX: number, clientY: number) => void;
}

const TileCard: React.FC<TileCardProps> = ({
  piece,
  isSelected,
  orientation,
  isFirst,
  onSelect,
  onStartDrag,
}) => {
  const thumbRef = useRef<string>('');
  if (!thumbRef.current) {
    try {
      thumbRef.current = getHex3DThumbnail(piece.type, piece.color, piece.clusterShape);
    } catch {
      thumbRef.current = '';
    }
  }

  const isCluster = Boolean(piece.clusterShape && piece.clusterShape.length > 1);
  const clusterCount = piece.clusterShape?.length ?? 1;
  const isOutOfStock = piece.stock !== undefined && piece.stock <= 0;

  const dragStateRef = useRef<{ x: number; y: number; dragged: boolean } | null>(null);

  const size = orientation === 'vertical' ? 'w-14 h-14' : 'w-[72px] h-[88px]';

  return (
    <div
      data-tutorial-id={isFirst ? 'mobile-tray-first-tile' : undefined}
      onPointerDown={(e) => {
        if (isOutOfStock) return;
        dragStateRef.current = { x: e.clientX, y: e.clientY, dragged: false };
        // DO NOT setPointerCapture here — let parent scroll first.
        // We'll capture only after drag threshold is exceeded.
      }}
      onPointerMove={(e) => {
        const s = dragStateRef.current;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;

        // If horizontal movement dominates → treat as scroll, cancel drag
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
          dragStateRef.current = null;
          return;
        }

        // If vertical upward movement exceeds threshold → start drag
        if (dy < -12) {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          s.dragged = true;
          dragStateRef.current = null;
          onStartDrag(piece, e.clientX, e.clientY);
        }
      }}
      onPointerUp={(e) => {
        const s = dragStateRef.current;
        dragStateRef.current = null;
        if (!s) return;
        if (!s.dragged && !isOutOfStock) {
          onSelect(piece);
        }
      }}
      onPointerCancel={() => {
        dragStateRef.current = null;
      }}
      className={`relative shrink-0 rounded-2xl border-2 flex flex-col items-center justify-between p-1 select-none touch-pan-x ${
        size
      } transition-all ${
        isOutOfStock
          ? 'opacity-30 grayscale bg-[#1a0f07] border-[#3a2519]'
          : isSelected
          ? 'bg-[#3a2519] border-[#f0c674] shadow-[0_0_12px_rgba(240,198,116,0.5)] scale-105 -translate-y-1'
          : 'bg-[#2b1a11] border-[#5c3d2e] active:scale-95'
      }`}
    >
      {/* Thumbnail */}
      <div className="flex-1 w-full rounded-xl bg-[#1a0f07] border border-[#3a2519] flex items-center justify-center overflow-hidden">
        {thumbRef.current ? (
          <img
            src={thumbRef.current}
            alt={piece.name}
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-[#2b1a11] animate-pulse" />
        )}

        {/* Cluster badge */}
        {isCluster && orientation === 'horizontal' && (
          <span className="absolute top-1 left-1 text-[8px] font-black font-mono bg-[#1a0f07]/90 text-[#f0c674] border border-[#f0c674]/60 px-1 rounded-full">
            {clusterCount}H
          </span>
        )}

        {/* Lightbulb cost */}
        {orientation === 'horizontal' && (
          <span className="absolute top-1 right-1 flex items-center gap-0.5 text-[9px] font-black font-mono bg-[#3a2519]/95 text-[#f0c674] border border-[#f0c674]/60 px-1 py-0.5 rounded-full">
            <Lightbulb className="w-2 h-2 fill-current" />
            <span>{piece.lightbulbCost ?? clusterCount}</span>
          </span>
        )}

        {/* Stock */}
        {piece.stock !== undefined && orientation === 'horizontal' && (
          <span
            className={`absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 rounded-full ${
              piece.stock > 0
                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                : 'bg-[#1a0f07] text-[#a8b89a] border border-[#3a2519]'
            }`}
          >
            x{piece.stock}
          </span>
        )}
      </div>

      {/* Name label — only in horizontal (portrait) mode */}
      {orientation === 'horizontal' && (
        <span className="text-[9px] font-bold text-[#f4ecd8] truncate max-w-full w-full text-center leading-tight pt-0.5">
          {piece.name}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main tray
// ─────────────────────────────────────────────────────────────────

interface JourneyTrayMobileProps {
  availablePieces: HexPiece[];
  selectedPiece: HexPiece | null;
  activeDragPiece: HexPiece | null;
  orientation?: 'horizontal' | 'vertical';
  onSelectPiece: (piece: HexPiece | null) => void;
  onStartDragPiece: (piece: HexPiece, clientX: number, clientY: number) => void;
  onEndDragPiece: () => void;
  onClearHover?: () => void;
}

export const JourneyTrayMobile: React.FC<JourneyTrayMobileProps> = ({
  availablePieces,
  selectedPiece,
  activeDragPiece,
  orientation = 'horizontal',
  onSelectPiece,
  onStartDragPiece,
  onEndDragPiece,
  onClearHover,
}) => {
  const [filter, setFilter] = useState<ColorFilter>('all');

  const counts = useMemo(() => {
    const c: Record<ColorFilter, number> = {
      all: availablePieces.length,
      neutral: 0,
      amber: 0,
      emerald: 0,
      sapphire: 0,
      ruby: 0,
    };
    for (const p of availablePieces) c[p.color] = (c[p.color] || 0) + 1;
    return c;
  }, [availablePieces]);

  const filteredPieces = useMemo(
    () => (filter === 'all' ? availablePieces : availablePieces.filter((p) => p.color === filter)),
    [availablePieces, filter]
  );

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex flex-col ${
        isVertical ? 'h-full py-2 w-[68px]' : 'w-full pb-2'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #5c3d2e 0%, #3a2519 20%, #2b1a11 60%, #1a0f07 100%)',
        borderTop: isVertical ? undefined : '2px solid #8fbc6f',
        borderRight: isVertical ? '2px solid #8fbc6f' : undefined,
        boxShadow: isVertical
          ? '4px 0 20px rgba(0,0,0,0.5)'
          : '0 -6px 20px rgba(0,0,0,0.5)',
      }}
      onPointerEnter={onClearHover}
    >
      {/* Filter chips — only in horizontal mode */}
      {!isVertical && (
        <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 overflow-x-auto no-scrollbar touch-pan-x">
          {FILTER_ORDER.map((id) => {
            const count = counts[id];
            if (id !== 'all' && count === 0) return null;
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => {
                  sounds.playClick();
                  setFilter(id);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-black shrink-0 transition-all ${
                  active
                    ? 'bg-[#8fbc6f] border-[#c8e0b0] text-[#1a0f07]'
                    : 'bg-[#1a0f07]/70 border-[#3a2519] text-[#a8b89a]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${FILTER_DOT[id]}`} />
                <span>{FILTER_LABEL[id]}</span>
                <span
                  className={`font-mono text-[9px] px-1 rounded ${
                    active ? 'bg-[#1a0f07]/30' : 'bg-[#2b1a11]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tiles rail */}
      <div
        className={`flex gap-2 ${
          isVertical
            ? 'flex-col items-center overflow-y-auto flex-1 px-1 touch-pan-y'
            : 'items-stretch overflow-x-auto px-3 py-1 no-scrollbar touch-pan-x'
        }`}
      >
        {filteredPieces.map((piece, idx) => (
          <TileCard
            key={piece.id}
            piece={piece}
            isFirst={idx === 0}
            isSelected={selectedPiece?.id === piece.id}
            orientation={orientation}
            onSelect={(p) => {
              sounds.playPickup();
              onSelectPiece(selectedPiece?.id === p.id ? null : p);
            }}
            onStartDrag={onStartDragPiece}
          />
        ))}
      </div>
    </div>
  );
};