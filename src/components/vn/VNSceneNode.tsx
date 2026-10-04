// src/components/vn/VNSceneNode.tsx

import React, { useCallback, useRef } from 'react';
import type { VNScene } from '../../types/vn';

export interface VNSceneNodePosition {
  x: number;
  y: number;
}

interface VNSceneNodeProps {
  scene: VNScene;
  index: number;
  position: VNSceneNodePosition;
  isSelected: boolean;
  isEntry: boolean;
  isTerminal: boolean;
  onSelect: () => void;
  onDragStart: (sceneId: string) => void;
  onDrag: (sceneId: string, dx: number, dy: number) => void;
  onDragEnd: () => void;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 110;

/**
 * A single scene rendered as a draggable node on the graph canvas.
 *
 * Layout:
 *   ┌────────────────────────────────────┐
 *   │ ● Scene 3                    4 lines│
 *   │                                    │
 *   │ Opening                            │
 *   │ "Begin writing here..."            │
 *   │                                    │
 *   │ ─────────────►                     │
 *   └────────────────────────────────────┘
 */
export const VNSceneNode: React.FC<VNSceneNodeProps> = ({
  scene,
  index,
  position,
  isSelected,
  isEntry,
  isTerminal,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const dragStateRef = useRef<{ startX: number; startY: number; dragging: boolean }>({
    startX: 0,
    startY: 0,
    dragging: false,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Left-click only.
      if (e.button !== 0) return;

      // Ignore if the user clicked inside an input/textarea.
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON'
      ) {
        return;
      }

      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);

      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        dragging: false,
      };
      onSelect();
    },
    [onSelect]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.buttons === 0) return;
      const state = dragStateRef.current;
      if (state.startX === 0 && state.startY === 0) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (!state.dragging) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        state.dragging = true;
        onDragStart(scene.id);
      }

      onDrag(scene.id, dx, dy);
      state.startX = e.clientX;
      state.startY = e.clientY;
    },
    [scene.id, onDragStart, onDrag]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragStateRef.current.dragging) {
        onDragEnd();
      }
      dragStateRef.current = { startX: 0, startY: 0, dragging: false };
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    },
    [onDragEnd]
  );

  // ── Preview text — first line's text, truncated ─────────────
  const firstLine = scene.lines[0];
  const previewText = firstLine
    ? firstLine.text.length > 60
      ? firstLine.text.slice(0, 57) + '…'
      : firstLine.text
    : '(empty scene)';

  // ── Count lines with choices as "branch points" ─────────────
  const branchCount = scene.lines.filter((l) => l.choice).length;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
        zIndex: isSelected ? 20 : 10,
        cursor: 'grab',
        userSelect: 'none',
      }}
      className={`rounded-2xl border-2 shadow-xl transition-shadow ${
        isSelected
          ? 'border-cyan-400 bg-cyan-950/85 shadow-[0_0_28px_rgba(34,211,238,0.35)]'
          : 'border-slate-700 bg-slate-900/95 hover:border-slate-500 hover:shadow-2xl'
      }`}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-block w-2 h-2 rounded-full shrink-0 ${
              isEntry ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
            title={isEntry ? 'Entry scene' : 'Scene'}
          />
          <span className="text-[10px] font-mono font-black text-cyan-300 uppercase tracking-wider truncate">
            Scene {index + 1}
          </span>
          {isTerminal && (
            <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 uppercase">
              Terminal
            </span>
          )}
        </div>
        <span className="text-[9.5px] font-mono text-slate-500 shrink-0">
          {scene.lines.length} line{scene.lines.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="px-3 py-2">
        <div className="text-xs font-bold text-white truncate mb-1">
          {scene.title || '(untitled scene)'}
        </div>
        <div className="text-[10.5px] text-slate-400 italic leading-snug line-clamp-2">
          {previewText}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-800/80 text-[9px] font-mono">
        <span className="text-slate-500 truncate max-w-[140px]" title={scene.id}>
          {scene.id}
        </span>
        {branchCount > 0 && (
          <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
            {branchCount} choice{branchCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Output port (for edge-draw on the right edge) ───── */}
      <div
        data-port="output"
        data-scene-id={scene.id}
        className="absolute top-1/2 -right-2 w-4 h-4 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-slate-950 cursor-crosshair hover:scale-125 transition-transform"
        title="Drag from this port to another scene to set next-scene"
      />
    </div>
  );
};

export const SCENE_NODE_WIDTH = NODE_WIDTH;
export const SCENE_NODE_HEIGHT = NODE_HEIGHT;