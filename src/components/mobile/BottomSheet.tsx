// src/components/mobile/BottomSheet.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type SheetSnapPoint = 'peek' | 'half' | 'full' | 'closed';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Initial snap position when opened. Default 'half'. */
  initialSnap?: Exclude<SheetSnapPoint, 'closed'>;
  /** Allow backdrop click to dismiss. Default true. */
  dismissOnBackdrop?: boolean;
  /** Show drag handle at top. Default true. */
  showHandle?: boolean;
  /** Optional title rendered in a header row. */
  title?: string;
  /** Extra classNames for the sheet content wrapper. */
  className?: string;
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// Snap percentages (of viewport height)
// ─────────────────────────────────────────────────────────────────

const SNAP_PERCENT: Record<Exclude<SheetSnapPoint, 'closed'>, number> = {
  peek: 0.25,
  half: 0.55,
  full: 0.92,
};

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  initialSnap = 'half',
  dismissOnBackdrop = true,
  showHandle = true,
  title,
  className = '',
  children,
}) => {
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [translateY, setTranslateY] = useState<number>(viewportHeight);
  const [isDragging, setIsDragging] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    startY: number;
    startTranslate: number;
    lastY: number;
    lastTime: number;
    velocity: number;
  } | null>(null);

  // ── Viewport tracking ──────────────────────────────────────────
  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    const vv = window.visualViewport;
    if (vv) vv.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (vv) vv.removeEventListener('resize', update);
    };
  }, []);

  // ── Open/close animation ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const target = viewportHeight * (1 - SNAP_PERCENT[initialSnap]);
      setTranslateY(target);
    } else {
      setTranslateY(viewportHeight);
    }
  }, [isOpen, initialSnap, viewportHeight]);

  // ── Prevent body scroll when open ─────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // ── Escape key close ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Drag handlers ─────────────────────────────────────────────
  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (!isOpen) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      dragStateRef.current = {
        startY: e.clientY,
        startTranslate: translateY,
        lastY: e.clientY,
        lastTime: performance.now(),
        velocity: 0,
      };
      setIsDragging(true);
    },
    [isOpen, translateY]
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    const state = dragStateRef.current;
    if (!state) return;

    const now = performance.now();
    const dt = now - state.lastTime;
    const dy = e.clientY - state.lastY;
    if (dt > 0) {
      state.velocity = dy / dt; // px per ms
    }
    state.lastY = e.clientY;
    state.lastTime = now;

    const delta = e.clientY - state.startY;
    const next = Math.max(0, state.startTranslate + delta);
    setTranslateY(next);
  }, []);

  const handleDragEnd = useCallback(() => {
    const state = dragStateRef.current;
    dragStateRef.current = null;
    setIsDragging(false);
    if (!state) return;

    const velocity = state.velocity; // px/ms
    const currentY = translateY;
    const closedThreshold = viewportHeight * 0.65;

    // Fast downward fling → close
    if (velocity > 1.2) {
      onClose();
      return;
    }
    // Fast upward fling → snap full
    if (velocity < -1.2) {
      setTranslateY(viewportHeight * (1 - SNAP_PERCENT.full));
      return;
    }

    // Otherwise snap to nearest
    if (currentY > closedThreshold) {
      onClose();
      return;
    }

    const candidates: Exclude<SheetSnapPoint, 'closed'>[] = ['peek', 'half', 'full'];
    let best: Exclude<SheetSnapPoint, 'closed'> = 'half';
    let bestDist = Infinity;
    for (const c of candidates) {
      const targetY = viewportHeight * (1 - SNAP_PERCENT[c]);
      const d = Math.abs(currentY - targetY);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    setTranslateY(viewportHeight * (1 - SNAP_PERCENT[best]));
  }, [translateY, viewportHeight, onClose]);

  // ── Render nothing when closed and off-screen ─────────────────
  if (!isOpen && translateY >= viewportHeight - 1) return null;
  if (typeof document === 'undefined') return null;

  const content = (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-200"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={dismissOnBackdrop ? onClose : undefined}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute left-0 right-0 bottom-0 bg-[#1e1509] border-t-2 border-[#8fbc6f]/60 rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.6)] ${className}`}
        style={{
          height: viewportHeight * SNAP_PERCENT.full,
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        {showHandle && (
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
          >
            <div className="w-12 h-1.5 bg-[#a8b89a]/60 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="px-5 pb-3 border-b border-[#5c3d2e]/60">
            <h3 className="text-sm font-black text-[#f4ecd8] tracking-wide font-rounded uppercase">
              {title}
            </h3>
          </div>
        )}

        {/* Content — scrollable */}
        <div
          className="overflow-y-auto overscroll-contain px-4 pt-3"
          style={{
            maxHeight: `calc(${viewportHeight * SNAP_PERCENT.full}px - ${title ? 100 : 60}px)`,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};