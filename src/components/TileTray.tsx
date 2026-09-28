import React, { useState, useEffect, useRef } from 'react';
import { HexPiece, TileColor, AcePerkId } from '../types/game';
import { getHex3DThumbnail } from '../utils/thumbnailGenerator';
import { Shield, Sun, Leaf, Droplets, Flame, MousePointerClick, RotateCw, Layers, Dices } from 'lucide-react';

interface TileTrayProps {
  availablePieces: HexPiece[];
  selectedPiece: HexPiece | null;
  activeDragPiece: HexPiece | null;
  hasRotationZones?: boolean;
  equippedAce?: AcePerkId | null;
  onSelectPiece: (piece: HexPiece | null) => void;
  onRightClickPiece: (piece: HexPiece) => void;
  onStartDragPiece: (piece: HexPiece, clientX: number, clientY: number) => void;
  onEndDragPiece: () => void;
  onClearHover?: () => void;
  onRotateCluster?: () => void;
  onRecombulate?: () => void;
}

type ColorFilter = 'all' | TileColor;

const FILTER_ITEMS: { id: ColorFilter; label: string; colorClass: string; dotClass: string }[] = [
  { id: 'all', label: 'All Hexes', colorClass: 'border-slate-700 text-slate-200', dotClass: 'bg-slate-400' },
  { id: 'neutral', label: 'Safe Gray', colorClass: 'border-slate-700 text-slate-200', dotClass: 'bg-slate-300' },
  { id: 'amber', label: 'Amber', colorClass: 'border-amber-500/40 text-amber-300', dotClass: 'bg-amber-400' },
  { id: 'emerald', label: 'Emerald', colorClass: 'border-emerald-500/40 text-emerald-300', dotClass: 'bg-emerald-400' },
  { id: 'sapphire', label: 'Sapphire', colorClass: 'border-cyan-500/40 text-cyan-300', dotClass: 'bg-cyan-400' },
  { id: 'ruby', label: 'Ruby', colorClass: 'border-rose-500/40 text-rose-300', dotClass: 'bg-rose-400' },
];

const COLOR_THEMES: Record<TileColor, { border: string; bg: string; text: string; icon: React.ReactNode; label: string }> = {
  neutral: {
    border: 'border-slate-700/80 hover:border-slate-500',
    bg: 'bg-slate-900/90',
    text: 'text-slate-300',
    icon: <Shield className="w-3 h-3 text-slate-400" />,
    label: 'Safe Gray',
  },
  amber: {
    border: 'border-amber-500/40 hover:border-amber-400',
    bg: 'bg-amber-950/30',
    text: 'text-amber-300',
    icon: <Sun className="w-3 h-3 text-amber-400" />,
    label: 'Amber Zone',
  },
  emerald: {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-300',
    icon: <Leaf className="w-3 h-3 text-emerald-400" />,
    label: 'Emerald Zone',
  },
  sapphire: {
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bg: 'bg-cyan-950/30',
    text: 'text-cyan-300',
    icon: <Droplets className="w-3 h-3 text-cyan-400" />,
    label: 'Sapphire Zone',
  },
  ruby: {
    border: 'border-rose-500/40 hover:border-rose-400',
    bg: 'bg-rose-950/30',
    text: 'text-rose-300',
    icon: <Flame className="w-3 h-3 text-rose-400" />,
    label: 'Ruby Zone',
  },
};

export const TileTray: React.FC<TileTrayProps> = ({
  availablePieces,
  selectedPiece,
  activeDragPiece,
  hasRotationZones = false,
  equippedAce,
  onSelectPiece,
  onRightClickPiece,
  onStartDragPiece,
  onEndDragPiece,
  onClearHover,
  onRotateCluster,
  onRecombulate,
}) => {
  const [activeFilter, setActiveFilter] = useState<ColorFilter>('all');
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const pendingDragRef = useRef<{ piece: HexPiece; startX: number; startY: number } | null>(null);

  useEffect(() => {
    const thumbs: Record<string, string> = {};
    availablePieces.forEach(piece => {
      try {
        thumbs[piece.id] = getHex3DThumbnail(piece.type, piece.color, piece.clusterShape);
      } catch {
        // fallback
      }
    });
    setThumbnails(thumbs);
  }, [availablePieces]);

  const filteredPieces = availablePieces.filter(piece => {
    if (activeFilter === 'all') return true;
    return piece.color === activeFilter;
  });

  const countByColor: Record<string, number> = {
    all: availablePieces.length,
    neutral: 0,
    amber: 0,
    emerald: 0,
    sapphire: 0,
    ruby: 0,
  };

  availablePieces.forEach(p => {
    countByColor[p.color] = (countByColor[p.color] || 0) + 1;
  });

  const handlePiecePointerDown = (piece: HexPiece, e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (piece.stock !== undefined && piece.stock <= 0) return;
    pendingDragRef.current = { piece, startX: e.clientX, startY: e.clientY };
  };

  const handlePiecePointerMove = (e: React.PointerEvent) => {
    if (!pendingDragRef.current) return;
    const dist = Math.hypot(e.clientX - pendingDragRef.current.startX, e.clientY - pendingDragRef.current.startY);
    if (dist > 12) {
      onStartDragPiece(pendingDragRef.current.piece, e.clientX, e.clientY);
      pendingDragRef.current = null;
    }
  };

  const handlePiecePointerUp = (piece: HexPiece, e: React.PointerEvent) => {
    e.stopPropagation();
    if (pendingDragRef.current) {
      pendingDragRef.current = null;
      if (piece.stock !== undefined && piece.stock <= 0) return;
      onSelectPiece(selectedPiece?.id === piece.id ? null : piece);
    }
  };

  const isHoldingCluster = Boolean(selectedPiece?.clusterShape && selectedPiece.clusterShape.length > 1);

  return (
    <div
      data-tutorial-id="tile-tray-container"
      className="w-full bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] px-3 py-2 sm:px-6 sm:py-3 transition-all select-none font-sans text-slate-100"
      onPointerEnter={onClearHover}
      onPointerDown={e => e.stopPropagation()}
      onPointerUp={e => e.stopPropagation()}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2">
        {/* Top Control Bar: Color Filter Tabs & Action hints */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          {/* Color Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline font-mono">
              Filter:
            </span>
            {FILTER_ITEMS.map(filter => {
              const count = countByColor[filter.id] || 0;
              if (filter.id !== 'all' && count === 0) return null;

              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={e => {
                    e.stopPropagation();
                    setActiveFilter(filter.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive && filter.id === 'all' ? 'bg-white' : filter.dotClass
                    }`}
                  />
                  <span>{filter.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Helper & Keyboard Rotate Helper */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            {equippedAce === 'recombulation' && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onRecombulate?.();
                }}
                className="flex items-center gap-1.5 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-2.5 py-1 rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
                title="Recombulate Inventory: Reroll available pieces for optimal 3-star synergy"
              >
                <Dices className="w-3.5 h-3.5 text-purple-200" />
                <span>Recombulate [Ace]</span>
              </button>
            )}

            {isHoldingCluster && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onRotateCluster?.();
                }}
                className="flex items-center gap-1.5 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 px-2.5 py-1 rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
                title="Rotate the held multi-hex cluster by 60° (or press R key)"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-950" />
                <span>Rotate Cluster [R]</span>
              </button>
            )}

            {hasRotationZones && !isHoldingCluster && (
              <span className="flex items-center gap-1.5 font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-xl text-[10.5px]">
                <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                <span>Turntable: Spins Single Hexes Only</span>
              </span>
            )}

            <span className="flex items-center gap-1.5 font-medium bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300 text-[10.5px]">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
              <span>Left-Click: Place · Right-Click: Cancel</span>
            </span>

            {selectedPiece && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onSelectPiece(null);
                }}
                className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer text-xs ml-0.5"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* 3D Cell Visual Demo Tray with Clusters */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar scroll-smooth">
          {filteredPieces.map((piece, idx) => {
            const theme = COLOR_THEMES[piece.color];
            const isSelected = selectedPiece?.id === piece.id;
            const isDragging = activeDragPiece?.id === piece.id;
            const thumbUrl = thumbnails[piece.id];
            const isCluster = Boolean(piece.clusterShape && piece.clusterShape.length > 1);
            const clusterCount = piece.clusterShape ? piece.clusterShape.length : 1;
            const isOutOfStock = piece.stock !== undefined && piece.stock <= 0;

            return (
              <div
                key={piece.id}
                data-tutorial-id={`tray-piece-${piece.id}`}
                data-piece-id={piece.id}
                data-piece-index={idx}
                onPointerDown={e => handlePiecePointerDown(piece, e)}
                onPointerMove={handlePiecePointerMove}
                onPointerUp={e => handlePiecePointerUp(piece, e)}
                onContextMenu={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRightClickPiece(piece);
                }}
                className={`group shrink-0 relative flex flex-col items-center justify-between p-2 rounded-2xl border transition-all ${
                  isOutOfStock ? 'opacity-30 grayscale cursor-not-allowed bg-slate-950' : 'cursor-grab active:cursor-grabbing bg-slate-950/70 hover:bg-slate-800/80'
                } select-none w-24 sm:w-28 ${
                  theme.border
                } ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 border-emerald-400 scale-105 shadow-xl shadow-emerald-950/60 -translate-y-1 bg-emerald-950/40'
                    : 'hover:shadow-lg hover:-translate-y-0.5'
                } ${isDragging ? 'opacity-30 scale-95' : ''}`}
              >
                {/* 3D Visual Demo Container */}
                <div
                  className={`w-full h-14 rounded-xl flex items-center justify-center ${theme.bg} overflow-hidden relative shadow-inner mb-1 transition-transform duration-200 group-hover:scale-105 pointer-events-none border border-slate-800/80`}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={piece.name}
                      className="w-14 h-14 object-contain drop-shadow pointer-events-none transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
                  )}

                  {/* Multi-Hex Cluster badge */}
                  {isCluster && (
                    <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-slate-900/90 text-amber-300 text-[8.5px] font-black font-mono px-1.5 py-0.2 rounded-full border border-amber-500/40 shadow">
                      <Layers className="w-2.5 h-2.5 text-amber-400" />
                      <span>{clusterCount}H</span>
                    </div>
                  )}

                  {/* Infinite Stock Indicator */}
                  {piece.stock === undefined && (
                    <div className="absolute bottom-1 right-1 font-mono text-[9px] font-black text-slate-400 bg-slate-950/80 px-1 py-0.2 rounded-md">
                      ∞
                    </div>
                  )}
                </div>

                {/* Piece Meta */}
                <div className="w-full flex items-center justify-between text-[10.5px]">
                  <span className="font-bold truncate text-slate-200 text-left group-hover:text-white">
                    {piece.name}
                  </span>
                  {piece.stock !== undefined && (
                    <span
                      className={`font-mono font-bold text-[10px] px-1 rounded ${
                        piece.stock > 0 ? 'text-emerald-400 bg-emerald-950' : 'text-slate-600 bg-slate-900'
                      }`}
                    >
                      x{piece.stock}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
