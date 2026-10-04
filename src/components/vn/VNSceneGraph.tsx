// src/components/vn/VNSceneGraph.tsx

import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { VNChapter, VNScene } from '../../types/vn';
import { VNSceneNode, SCENE_NODE_WIDTH, SCENE_NODE_HEIGHT, type VNSceneNodePosition } from './VNSceneNode';

interface VNSceneGraphProps {
  chapter: VNChapter;
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onChange: (updater: (draft: VNChapter) => void) => void;
  onCreateScene: () => void;
  onDeleteScene: (sceneId: string) => void;
}

/**
 * Auto-layout: places scenes in a column-flow, left to right.
 * Uses a simple BFS from the first scene, incrementing x per depth level
 * and y per scene in that level.
 */
function computeInitialLayout(chapter: VNChapter): Record<string, VNSceneNodePosition> {
  const positions: Record<string, VNSceneNodePosition> = {};
  const depthById: Record<string, number> = {};
  const queue: string[] = [];
  const visited = new Set<string>();

  const first = chapter.scenes[0];
  if (!first) return positions;

  // BFS from the first scene.
  depthById[first.id] = 0;
  queue.push(first.id);
  visited.add(first.id);

  // Build an adjacency list from both scene.nextSceneId and any line /
  // choice-target scene references.
  const adjacency: Record<string, string[]> = {};
  const ensure = (id: string) => {
    if (!adjacency[id]) adjacency[id] = [];
  };
  chapter.scenes.forEach((s) => {
    ensure(s.id);
    if (s.nextSceneId) adjacency[s.id].push(s.nextSceneId);
    s.lines.forEach((l) => {
      if (l.nextSceneId) adjacency[s.id].push(l.nextSceneId);
      if (l.choice) {
        l.choice.options.forEach((opt) => {
          if (opt.nextSceneId) adjacency[s.id].push(opt.nextSceneId);
        });
      }
    });
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const depth = depthById[current] ?? 0;
    (adjacency[current] || []).forEach((next) => {
      if (!visited.has(next) && chapter.scenes.some((s) => s.id === next)) {
        visited.add(next);
        depthById[next] = depth + 1;
        queue.push(next);
      }
    });
  }

  // Any unvisited scene gets depth 0 and is placed after the visited ones.
  chapter.scenes.forEach((s, idx) => {
    if (!visited.has(s.id)) {
      depthById[s.id] = 0;
      // offset by index so they don't overlap
      positions[s.id] = { x: 40, y: 40 + idx * (SCENE_NODE_HEIGHT + 40) };
    }
  });

  // Bucket by depth.
  const buckets: Record<number, string[]> = {};
  Object.entries(depthById).forEach(([id, depth]) => {
    if (!buckets[depth]) buckets[depth] = [];
    buckets[depth].push(id);
  });

  const COLUMN_GAP = SCENE_NODE_WIDTH + 120;
  const ROW_GAP = SCENE_NODE_HEIGHT + 60;

  Object.entries(buckets).forEach(([depthStr, ids]) => {
    const depth = parseInt(depthStr, 10);
    ids.forEach((id, rowIdx) => {
      if (positions[id]) return; // skip if already assigned
      positions[id] = {
        x: 60 + depth * COLUMN_GAP,
        y: 60 + rowIdx * ROW_GAP,
      };
    });
  });

  return positions;
}

export const VNSceneGraph: React.FC<VNSceneGraphProps> = ({
  chapter,
  selectedSceneId,
  onSelectScene,
  onChange,
  onCreateScene,
  onDeleteScene,
}) => {
  // ── Node positions — stored on the chapter as `_graphPosition` in a
  // non-typed side-channel. We keep them in local state to avoid
  // round-tripping through the parent on every mouse move.
  const [positions, setPositions] = useState<Record<string, VNSceneNodePosition>>(
    () => computeInitialLayout(chapter)
  );
  const [draggingSceneId, setDraggingSceneId] = useState<string | null>(null);

  // ── Edge-draw state ─────────────────────────────────────────
  const [edgeDrawFrom, setEdgeDrawFrom] = useState<string | null>(null);
  const [edgeDrawCursor, setEdgeDrawCursor] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Recompute layout if the chapter changes materially ──────
  const sceneIdsKey = useMemo(
    () => chapter.scenes.map((s) => s.id).join('|'),
    [chapter.scenes]
  );

  React.useEffect(() => {
    setPositions((prev) => {
      const next: Record<string, VNSceneNodePosition> = {};
      const fallback = computeInitialLayout(chapter);
      chapter.scenes.forEach((s) => {
        next[s.id] = prev[s.id] ?? fallback[s.id] ?? { x: 60, y: 60 };
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdsKey]);

  // ── Drag handlers ───────────────────────────────────────────
  const handleNodeDrag = useCallback(
    (sceneId: string, dx: number, dy: number) => {
      setPositions((prev) => ({
        ...prev,
        [sceneId]: {
          x: (prev[sceneId]?.x ?? 0) + dx,
          y: (prev[sceneId]?.y ?? 0) + dy,
        },
      }));
    },
    []
  );

  const handleNodeDragStart = useCallback((sceneId: string) => {
    setDraggingSceneId(sceneId);
  }, []);

  const handleNodeDragEnd = useCallback(() => {
    setDraggingSceneId(null);
  }, []);

  // ── Edge-draw handlers ──────────────────────────────────────
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!edgeDrawFrom || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setEdgeDrawCursor({
        x: e.clientX - rect.left + canvasRef.current.scrollLeft,
        y: e.clientY - rect.top + canvasRef.current.scrollTop,
      });
    },
    [edgeDrawFrom]
  );

  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!edgeDrawFrom) return;
      // Check if the pointer was released over a node's body.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const sceneNode = el?.closest('[data-port="output"]') as HTMLElement | null;
      const sceneBody = el?.closest('[data-scene-id]') as HTMLElement | null;
      const targetId =
        sceneNode?.dataset.sceneId ??
        sceneBody?.dataset.sceneId ??
        null;

      if (targetId && targetId !== edgeDrawFrom) {
        // Set next-scene of source to target.
        onChange((draft) => {
          const src = draft.scenes.find((s) => s.id === edgeDrawFrom);
          if (src) src.nextSceneId = targetId;
        });
      }
      setEdgeDrawFrom(null);
      setEdgeDrawCursor(null);
    },
    [edgeDrawFrom, onChange]
  );

  // ── Port-click to start edge-draw ───────────────────────────
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = e.target as HTMLElement;
      const port = el.closest('[data-port="output"]') as HTMLElement | null;
      if (port && port.dataset.sceneId) {
        e.stopPropagation();
        setEdgeDrawFrom(port.dataset.sceneId);
        const rect = canvasRef.current!.getBoundingClientRect();
        setEdgeDrawCursor({
          x: e.clientX - rect.left + canvasRef.current!.scrollLeft,
          y: e.clientY - rect.top + canvasRef.current!.scrollTop,
        });
      } else if (!el.closest('[data-scene-id]')) {
        // Click on empty canvas deselects.
        onSelectScene('');
      }
    },
    [onSelectScene]
  );

  // ── Compute all edges to render ─────────────────────────────
  interface GraphEdge {
    id: string;
    fromId: string;
    toId: string;
    fromPos: VNSceneNodePosition;
    toPos: VNSceneNodePosition;
    kind: 'next' | 'line' | 'choice';
    label?: string;
    optionId?: string;
  }

  const edges: GraphEdge[] = useMemo(() => {
    const list: GraphEdge[] = [];
    const posOf = (id: string) => positions[id] ?? { x: 0, y: 0 };

    chapter.scenes.forEach((scene) => {
      const fromPos = posOf(scene.id);

      // Scene-level nextSceneId
      if (scene.nextSceneId && positions[scene.nextSceneId]) {
        list.push({
          id: `${scene.id}->${scene.nextSceneId}`,
          fromId: scene.id,
          toId: scene.nextSceneId,
          fromPos,
          toPos: posOf(scene.nextSceneId),
          kind: 'next',
        });
      }

      // Line-level nextSceneId and choice options
      scene.lines.forEach((line) => {
        if (line.nextSceneId && positions[line.nextSceneId]) {
          list.push({
            id: `${scene.id}:${line.id}->${line.nextSceneId}`,
            fromId: scene.id,
            toId: line.nextSceneId,
            fromPos,
            toPos: posOf(line.nextSceneId),
            kind: 'line',
          });
        }
        if (line.choice) {
          line.choice.options.forEach((opt) => {
            if (opt.nextSceneId && positions[opt.nextSceneId]) {
              list.push({
                id: `${scene.id}:${line.id}:${opt.id}->${opt.nextSceneId}`,
                fromId: scene.id,
                toId: opt.nextSceneId,
                fromPos,
                toPos: posOf(opt.nextSceneId),
                kind: 'choice',
                label: opt.label.slice(0, 18),
                optionId: opt.id,
              });
            }
          });
        }
      });
    });

    return list;
  }, [chapter.scenes, positions]);

  // ── Auto-size the canvas to fit all nodes ───────────────────
  const canvasSize = useMemo(() => {
    let maxX = 800;
    let maxY = 600;
    Object.values(positions).forEach((p) => {
      maxX = Math.max(maxX, p.x + SCENE_NODE_WIDTH + 200);
      maxY = Math.max(maxY, p.y + SCENE_NODE_HEIGHT + 200);
    });
    return { width: maxX, height: maxY };
  }, [positions]);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-auto select-none"
      style={{
        backgroundImage:
          'radial-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onPointerDown={handleCanvasPointerDown}
    >
      {/* ── Canvas toolbar overlay ────────────────────────────── */}
      <div className="sticky top-0 left-0 z-30 flex items-center gap-2 p-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-2xl px-3 py-1.5">
          <button
            onClick={onCreateScene}
            className="text-[11px] font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-3 py-1 rounded-lg shadow"
          >
            + Add Scene
          </button>
          {selectedSceneId && (
            <button
              onClick={() => onDeleteScene(selectedSceneId)}
              className="text-[11px] font-bold text-rose-300 hover:text-rose-200 px-3 py-1 rounded-lg border border-rose-500/40"
            >
              Delete Selected
            </button>
          )}
        </div>
        <div className="pointer-events-auto text-[10px] font-mono text-slate-500 bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-1.5">
          {chapter.scenes.length} scene{chapter.scenes.length !== 1 ? 's' : ''} · {edges.length} edge{edges.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── SVG edges layer ───────────────────────────────────── */}
      <svg
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <marker
            id="vn-arrow-next"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker
            id="vn-arrow-choice"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const x1 = edge.fromPos.x + SCENE_NODE_WIDTH;
          const y1 = edge.fromPos.y + SCENE_NODE_HEIGHT / 2;
          const x2 = edge.toPos.x;
          const y2 = edge.toPos.y + SCENE_NODE_HEIGHT / 2;

          // Cubic bezier — smooth, cinematic arcs.
          const midX = (x1 + x2) / 2;
          const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

          const stroke =
            edge.kind === 'choice'
              ? '#22d3ee'
              : edge.kind === 'line'
              ? '#a78bfa'
              : '#64748b';

          const markerId =
            edge.kind === 'choice' ? 'vn-arrow-choice' : 'vn-arrow-next';

          return (
            <g key={edge.id}>
              <path
                d={path}
                fill="none"
                stroke={stroke}
                strokeWidth={edge.kind === 'choice' ? 2 : 1.6}
                strokeDasharray={edge.kind === 'line' ? '5 3' : undefined}
                markerEnd={`url(#${markerId})`}
                opacity={0.75}
              />
              {edge.label && (
                <text
                  x={midX}
                  y={(y1 + y2) / 2 - 6}
                  fill="#67e8f9"
                  fontSize={9}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Edge being drawn */}
        {edgeDrawFrom && edgeDrawCursor && positions[edgeDrawFrom] && (
          <line
            x1={positions[edgeDrawFrom].x + SCENE_NODE_WIDTH}
            y1={positions[edgeDrawFrom].y + SCENE_NODE_HEIGHT / 2}
            x2={edgeDrawCursor.x}
            y2={edgeDrawCursor.y}
            stroke="#22d3ee"
            strokeWidth={2}
            strokeDasharray="4 4"
            opacity={0.9}
          />
        )}
      </svg>

      {/* ── Nodes layer ───────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          zIndex: 5,
        }}
      >
        {chapter.scenes.map((scene, idx) => (
          <VNSceneNode
            key={scene.id}
            scene={scene}
            index={idx}
            position={positions[scene.id] ?? { x: 60, y: 60 }}
            isSelected={scene.id === selectedSceneId}
            isEntry={idx === 0}
            isTerminal={!scene.nextSceneId && !scene.lines.some((l) => l.nextSceneId || l.choice)}
            onSelect={() => onSelectScene(scene.id)}
            onDragStart={handleNodeDragStart}
            onDrag={handleNodeDrag}
            onDragEnd={handleNodeDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default VNSceneGraph;