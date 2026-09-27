import React, { useState, useEffect, useRef } from 'react';
import { HexPiece, TileColor } from '../types/game';
import { getHex3DThumbnail } from '../utils/thumbnailGenerator';
import { Shield, Sun, Leaf, Droplets, Flame, MousePointerClick, RotateCw, Layers } from 'lucide-react';

interface TileTrayProps {
  availablePieces: HexPiece[];
  selectedPiece: HexPiece | null;
  activeDragPiece: HexPiece | null;
  hasRotationZones?: boolean;
  onSelectPiece: (piece: HexPiece | null) => void;
  onRightClickPiece: (piece: HexPiece) => void;
  onStartDragPiece: (piece: HexPiece, clientX: number, clientY: number) => void;
  onEndDragPiece: () => void;
  onClearHover?: () => void;
}

type ColorFilter = 'all' | TileColor;

const FILTER_ITEMS: { id: ColorFilter; label: string; colorClass: string; dotClass: string }[] = [
  { id: 'all', label: 'All Hexes', colorClass: 'border-slate-300 text-slate-700', dotClass: 'bg-slate-400' },
  { id: 'neutral', label: 'Safe Gray', colorClass: 'border-slate-300 text-slate-700', dotClass: 'bg-slate-300' },
  { id: 'amber', label: 'Amber', colorClass: 'border-amber-300 text-amber-800', dotClass: 'bg-amber-400' },
  { id: 'emerald', label: 'Emerald', colorClass: 'border-emerald-300 text-emerald-800', dotClass: 'bg-emerald-500' },
  { id: 'sapphire', label: 'Sapphire', colorClass: 'border-blue-300 text-blue-800', dotClass: 'bg-blue-500' },
  { id: 'ruby', label: 'Ruby', colorClass: 'border-rose-300 text-rose-800', dotClass: 'bg-rose-500' },
];

const COLOR_THEMES: Record<TileColor, { border: string; bg: string; text: string; icon: React.ReactNode; label: string }> = {
  neutral: {
    border: 'border-slate-200 hover:border-slate-400',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    icon: <Shield className="w-3 h-3 text-slate-400" />,
    label: 'Safe Gray',
  },
  amber: {
    border: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50/60',
    text: 'text-amber-800',
    icon: <Sun className="w-3 h-3 text-amber-600" />,
    label: 'Amber Zone',
  },
  emerald: {
    border: 'border-emerald-200 hover:border-emerald-400',
    bg: 'bg-emerald-50/60',
    text: 'text-emerald-800',
    icon: <Leaf className="w-3 h-3 text-emerald-600" />,
    label: 'Emerald Zone',
  },
  sapphire: {
    border: 'border-blue-200 hover:border-blue-400',
    bg: 'bg-blue-50/60',
    text: 'text-blue-800',
    icon: <Droplets className="w-3 h-3 text-blue-600" />,
    label: 'Sapphire Zone',
  },
  ruby: {
    border: 'border-rose-200 hover:border-rose-400',
    bg: 'bg-rose-50/60',
    text: 'text-rose-800',
    icon: <Flame className="w-3 h-3 text-rose-600" />,
    label: 'Ruby Zone',
  },
};

export const TileTray: React.FC<TileTrayProps> = ({
  availablePieces,
  selectedPiece,
  activeDragPiece,
  hasRotationZones = false,
  onSelectPiece,
  onRightClickPiece,
  onStartDragPiece,
  onClearHover,
}) => {
  const [activeFilter, setActiveFilter] = useState<ColorFilter>('all');
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const pendingDragRef = useRef<{ piece: HexPiece; startX: number; startY: number } | null>(null);

  // Generate 3D static visual demos for each piece (including clusters)
  useEffect(() => {
    const urls: Record<string, string> = {};
    availablePieces.forEach(p => {
      const url = getHex3DThumbnail(p.type, p.color, p.clusterShape);
      if (url) {
        urls[p.id] = url;
      }
    });
    setThumbnails(urls);
  }, [availablePieces]);

  // Filter available pieces based on active filter
  const filteredPieces = availablePieces.filter(piece => {
    if (activeFilter === 'all') return true;
    return piece.color === activeFilter;
  });

  // Calculate counts for each color
  const countByColor: Record<string, number> = { all: availablePieces.length };
  availablePieces.forEach(p => {
    countByColor[p.color] = (countByColor[p.color] || 0) + 1;
  });

  const handlePiecePointerDown = (piece: HexPiece, e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
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
      // Deliberate click to select / pick up
      pendingDragRef.current = null;
      onSelectPiece(selectedPiece?.id === piece.id ? null : piece);
    }
  };

  const isHoldingCluster = Boolean(selectedPiece?.clusterShape && selectedPiece.clusterShape.length > 1);

  return (
    <div
      data-tutorial-id="tile-tray-container"
      className="w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl px-3 py-2 sm:px-6 sm:py-3 transition-all select-none"
      onPointerEnter={onClearHover}
      onPointerDown={e => e.stopPropagation()}
      onPointerUp={e => e.stopPropagation()}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2">
        {/* Top Control Bar: Color Filter Tabs & Action hints */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          {/* Color Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
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
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive && filter.id === 'all' ? 'bg-emerald-400' : filter.dotClass
                    }`}
                  />
                  <span>{filter.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Helper & Keyboard Rotate Helper */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            {hasRotationZones && (
              <span className="flex items-center gap-1.5 font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 px-2.5 py-0.5 rounded-lg shadow-xs">
                <RotateCw className="w-3.5 h-3.5 text-cyan-600 animate-spin-slow" />
                <span>Press [R] to Rotate Turntable</span>
              </span>
            )}

            <span className="flex items-center gap-1 font-medium bg-slate-100/80 px-2 py-0.5 rounded-md text-slate-600">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
              <span>Left-Click: Place · Right-Click: Cancel</span>
            </span>

            {selectedPiece && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onSelectPiece(null);
                }}
                className="text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer text-xs ml-0.5"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* 3D Cell Visual Demo Tray with Clusters */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar scroll-smooth">
          {filteredPieces.map((piece, idx) => {
            const theme = COLOR_THEMES[piece.color];
            const isSelected = selectedPiece?.id === piece.id;
            const isDragging = activeDragPiece?.id === piece.id;
            const thumbUrl = thumbnails[piece.id];
            const isCluster = Boolean(piece.clusterShape && piece.clusterShape.length > 1);
            const clusterCount = piece.clusterShape ? piece.clusterShape.length : 1;

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
                className={`group shrink-0 relative flex flex-col items-center justify-between p-1.5 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none w-24 sm:w-28 bg-white ${
                  theme.border
                } ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 ring-offset-1 scale-105 shadow-lg -translate-y-1 border-emerald-500 bg-emerald-50/20'
                    : 'hover:shadow-md hover:-translate-y-0.5'
                } ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}`}
              >
                {/* 3D Visual Demo Container */}
                <div
                  className={`w-full h-14 rounded-lg flex items-center justify-center ${theme.bg} overflow-hidden relative shadow-inner mb-1 transition-transform duration-200 group-hover:scale-105 pointer-events-none`}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={piece.name}
                      className="w-14 h-14 object-contain drop-shadow pointer-events-none transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
                  )}

                  {/* Multi-Hex Cluster badge */}
                  {isCluster && (
                    <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-slate-900/85 backdrop-blur-xs text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-slate-700">
                      <Layers className="w-2.5 h-2.5 text-amber-400" />
                      <span>{clusterCount}H</span>
                    </div>
                  )}

                  {/* Picked-up lift badge indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-emerald-600 text-white text-[8px] font-black uppercase px-1 py-0.2 rounded shadow">
                      Held
                    </div>
                  )}
                </div>

                {/* Piece Title */}
                <span className="text-[11px] font-bold text-slate-800 text-center truncate w-full px-0.5 pointer-events-none">
                  {piece.name}
                </span>

                {/* Subtitle / Color badge */}
                <div className="flex items-center justify-center gap-1 mt-0.5 w-full pointer-events-none">
                  {theme.icon}
                  <span className={`text-[9px] font-semibold truncate ${theme.text}`}>
                    {piece.clusterType ? `${piece.clusterType.toUpperCase()}` : theme.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
