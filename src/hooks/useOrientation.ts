// src/hooks/useOrientation.ts

import { useEffect, useState } from 'react';
import type { Orientation } from '../context/LayoutContext';

/**
 * Lightweight orientation hook. For most cases, prefer `useLayout()`
 * since the descriptor already includes orientation — this exists for
 * components that only care about portrait vs landscape.
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    let raf: number | null = null;

    const update = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setOrientation(window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape');
      });
    };

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return orientation;
}