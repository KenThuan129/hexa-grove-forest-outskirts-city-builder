// src/hooks/useLongPress.ts

import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  /** Duration in ms before firing onLongPress. Default 400. */
  threshold?: number;
  /** If the pointer moves more than this (px), cancel the long-press. Default 12. */
  moveThreshold?: number;
  /** Called when long press threshold is reached. */
  onLongPress: () => void;
  /** Optional: called on normal (short) press — usually a tap. */
  onClick?: () => void;
}

interface LongPressHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
}

/**
 * Returns pointer event handlers for long-press detection.
 *
 * Usage:
 *   const handlers = useLongPress({
 *     onLongPress: () => openZonePreview(coord),
 *     onClick: () => selectTile(coord),
 *   });
 *   <div {...handlers} />
 */
export function useLongPress({
  threshold = 400,
  moveThreshold = 12,
  onLongPress,
  onClick,
}: UseLongPressOptions): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only primary button / touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      startPosRef.current = { x: e.clientX, y: e.clientY };
      firedRef.current = false;

      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, threshold);
    },
    [threshold, onLongPress, clear]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPosRef.current) return;
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      if (Math.hypot(dx, dy) > moveThreshold) {
        // Moved too far — cancel long press
        clear();
        startPosRef.current = null;
      }
    },
    [moveThreshold, clear]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      clear();
      const wasLongPress = firedRef.current;
      firedRef.current = false;
      startPosRef.current = null;

      // Only fire onClick if we never fired the long-press
      if (!wasLongPress && onClick) {
        onClick();
      }
    },
    [onClick, clear]
  );

  const onPointerCancel = useCallback(() => {
    clear();
    firedRef.current = false;
    startPosRef.current = null;
  }, [clear]);

  const onPointerLeave = useCallback(() => {
    clear();
    firedRef.current = false;
    startPosRef.current = null;
  }, [clear]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
  };
}