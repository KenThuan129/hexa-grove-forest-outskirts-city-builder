// src/components/journey/Journey.tsx

import React from 'react';
import { JourneyMobile } from './JourneyMobile';
import { useLayout } from '../../context/LayoutContext';
import type { JourneySharedProps } from './JourneyTypes';


/**
 * Journey entry point. Dispatches to mobile (portrait or landscape)
 * or falls back to a null render for desktop — the desktop layout is
 * still owned by App.tsx (unchanged, monolithic).
 */
export const JourneyMobileOnly: React.FC<JourneySharedProps> = (props) => {
  const layout = useLayout();

  if (!layout.useMobileLayout) {
    // Desktop path is handled elsewhere in App.tsx
    return null;
  }

  return <JourneyMobile {...props} />;
};