// src/context/LayoutContext.tsx

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type DeviceClass = 'phone' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface LayoutDescriptor {
  /** Broad device bucket */
  device: DeviceClass;
  /** Current screen orientation */
  orientation: Orientation;

  /** True when the primary input is touch */
  isTouch: boolean;
  /** True when we have a precise pointer (mouse/stylus/trackpad) */
  isPrecise: boolean;

  /** Phone in landscape mode — special case for game UI */
  isPhoneLandscape: boolean;

  /** Fraction of vertical space the board should get */
  boardFraction: number;
  /** Camera zoom multiplier relative to desktop baseline */
  cameraZoomMultiplier: number;

  /** Sidebar strategy */
  sidebarStyle: 'full' | 'compact' | 'sheet' | 'hidden';
  showLeftSidebar: boolean;
  showRightSidebar: boolean;

  /** Tray orientation on the journey screen */
  trayOrientation: 'horizontal' | 'vertical';

  /** Tray placement: bottom (portrait) or left rail (landscape phone) */
  trayPlacement: 'bottom' | 'left-rail' | 'right-rail';

  /** Booster bar placement */
  boosterPlacement: 'inline' | 'right-rail';

  /** Tile interaction model */
  interactionMode: 'drag-drop' | 'hybrid';

  /** Whether to render mobile-specific layouts */
  useMobileLayout: boolean;
}

interface LayoutContextValue {
  layout: LayoutDescriptor;
  /** Raw viewport dimensions (updated on resize) */
  viewport: { width: number; height: number };
}

// ─────────────────────────────────────────────────────────────────
// Compute descriptor from raw inputs
// ─────────────────────────────────────────────────────────────────

function computeDescriptor(
  width: number,
  height: number,
  isTouch: boolean
): LayoutDescriptor {
  const orientation: Orientation = height >= width ? 'portrait' : 'landscape';
  const isPrecise = !isTouch;

  // Device classification
  let device: DeviceClass;
  if (width < 768) {
    device = 'phone';
  } else if (width < 1280) {
    device = isTouch ? 'tablet' : 'desktop';
  } else {
    device = 'desktop';
  }

  // iPad Pro 12.9" landscape is ~1366px — force tablet for touch.
  if (width >= 1280 && width < 1600 && isTouch) {
    device = 'tablet';
  }

  // ── Safety net ───────────────────────────────────────────────
  // DevTools often fails to report `pointer: coarse` when custom
  // dimensions are typed manually. If both dimensions are clearly
  // below desktop-class, treat it as phone-class regardless.
  if (device === 'desktop' && width < 900 && height < 900) {
    device = 'phone';
  }

  const isPhoneLandscape = device === 'phone' && orientation === 'landscape';
  const useMobileLayout = device === 'phone' || device === 'tablet';

  // ── Per-device/orientation tuning ─────────────────────────────
  let boardFraction = 1.0;
  let cameraZoomMultiplier = 1.0;
  let sidebarStyle: LayoutDescriptor['sidebarStyle'] = 'full';
  let showLeftSidebar = true;
  let showRightSidebar = true;
  let trayOrientation: LayoutDescriptor['trayOrientation'] = 'horizontal';
  let trayPlacement: LayoutDescriptor['trayPlacement'] = 'bottom';
  let boosterPlacement: LayoutDescriptor['boosterPlacement'] = 'inline';
  let interactionMode: LayoutDescriptor['interactionMode'] = 'drag-drop';

  if (device === 'desktop') {
    // Desktop baseline — everything as-is
    boardFraction = 1.0;
    cameraZoomMultiplier = 1.0;
    sidebarStyle = 'full';
    trayPlacement = 'bottom';
    boosterPlacement = 'inline';
    interactionMode = 'drag-drop';
  } else if (device === 'tablet') {
    // Tablet: narrower sidebars, same layout skeleton
    boardFraction = 1.0;
    cameraZoomMultiplier = orientation === 'portrait' ? 1.20 : 1.10;
    sidebarStyle = 'compact';
    trayPlacement = 'bottom';
    boosterPlacement = 'inline';
    interactionMode = 'drag-drop';
  } else {
    // Phone
    if (orientation === 'portrait') {
      boardFraction = 0.55;
      cameraZoomMultiplier = 1.30;
      sidebarStyle = 'sheet';
      showLeftSidebar = false;
      showRightSidebar = false;
      trayOrientation = 'horizontal';
      trayPlacement = 'bottom';
      boosterPlacement = 'inline';
      interactionMode = 'drag-drop';
    } else {
      // Phone landscape — special case
      boardFraction = 0.75;
      cameraZoomMultiplier = 1.15;
      sidebarStyle = 'sheet';
      showLeftSidebar = false;
      showRightSidebar = false;
      trayOrientation = 'vertical';
      trayPlacement = 'left-rail';
      boosterPlacement = 'right-rail';
      interactionMode = 'drag-drop';
    }
  }

  return {
    device,
    orientation,
    isTouch,
    isPrecise,
    isPhoneLandscape,
    boardFraction,
    cameraZoomMultiplier,
    sidebarStyle,
    showLeftSidebar,
    showRightSidebar,
    trayOrientation,
    trayPlacement,
    boosterPlacement,
    interactionMode,
    useMobileLayout,
  };
}

// ─────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────

const LayoutContext = createContext<LayoutContextValue | null>(null);

const DESKTOP_FALLBACK: LayoutContextValue = {
  layout: computeDescriptor(1440, 900, false),
  viewport: { width: 1440, height: 900 },
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => {
    if (typeof window === 'undefined') return { width: 1440, height: 900 };
    return { width: window.innerWidth, height: window.innerHeight };
  });

  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  // ── Resize + orientation listeners ────────────────────────────
  useEffect(() => {
    let raf: number | null = null;

    const update = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
        setIsTouch(window.matchMedia('(pointer: coarse)').matches);
      });
    };

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    // visualViewport handles mobile browser chrome (address bar collapse)
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const value = useMemo<LayoutContextValue>(() => {
    return {
      layout: computeDescriptor(viewport.width, viewport.height, isTouch),
      viewport,
    };
  }, [viewport, isTouch]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

export function useLayoutContext(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) return DESKTOP_FALLBACK;
  return ctx;
}

/** Convenience: just the descriptor. */
export function useLayout(): LayoutDescriptor {
  return useLayoutContext().layout;
}

/** Convenience: just the viewport size. */
export function useViewport(): { width: number; height: number } {
  return useLayoutContext().viewport;
}