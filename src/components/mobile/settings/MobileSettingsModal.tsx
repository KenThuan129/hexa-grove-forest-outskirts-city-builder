// src/components/mobile/settings/MobileSettingsModal.tsx

import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, Settings } from 'lucide-react';
import {
  SettingsMenuScreen,
  PlayModeScreen,
  ChallengeScreen,
  GraphicsScreen,
  AccountScreen,
  IntroScreen,
  TutorialScreen,
  EditorScreen,
  type SettingsScreenCommonProps,
} from './SettingsScreens';
import { sounds } from '../../../utils/audio';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type Screen =
  | 'menu'
  | 'playMode'
  | 'challenge'
  | 'graphics'
  | 'account'
  | 'intro'
  | 'tutorial'
  | 'editor';

const SCREEN_TITLES: Record<Screen, string> = {
  menu: 'Settings',
  playMode: 'Play Mode',
  challenge: 'Challenge Mode',
  graphics: 'Graphics & FPS',
  account: 'Account',
  intro: 'Cinematic Intro',
  tutorial: 'Tutorial Guides',
  editor: 'Editor Tools',
};

interface MobileSettingsModalProps extends SettingsScreenCommonProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export const MobileSettingsModal: React.FC<MobileSettingsModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const [screen, setScreen] = useState<Screen>('menu');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset to menu when closed
  useEffect(() => {
    if (!isOpen) {
      setScreen('menu');
      setPrevScreen(null);
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (screen !== 'menu') {
        handleBack();
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, screen, onClose]);

  const handleNavigate = (next: string) => {
    setPrevScreen(screen);
    setScreen(next as Screen);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 260);
  };

  const handleBack = () => {
    setPrevScreen(screen);
    setScreen('menu');
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 260);
  };

  if (!isOpen) return null;

  const isSubScreen = screen !== 'menu';

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full sm:max-w-md h-full sm:h-auto sm:max-h-[85vh] bg-[#1f120a] sm:rounded-3xl border-0 sm:border-2 sm:border-[#5c3d2e] shadow-2xl flex flex-col overflow-hidden"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex items-center gap-2 px-3 py-3 bg-[#2b1a11] border-b-2 border-[#5c3d2e] shrink-0">
          {/* Back button (sub-screen) OR gear icon (menu) */}
          {isSubScreen ? (
            <button
              onClick={() => {
                sounds.playClick();
                handleBack();
              }}
              className="w-9 h-9 rounded-xl bg-[#1f120a] border-2 border-[#5c3d2e] text-[#f4ecd8] flex items-center justify-center active:scale-90 transition-transform shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#f0c674]/15 border-2 border-[#f0c674]/40 text-[#f0c674] flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
          )}

          {/* Title */}
          <h2 className="flex-1 text-sm font-black text-[#f4ecd8] font-rounded truncate">
            {SCREEN_TITLES[screen]}
          </h2>

          {/* Close button (always) */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#a85560] border-2 border-[#e8a8b3] text-[#f4ecd8] flex items-center justify-center active:scale-90 transition-transform shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <div
            className="h-full overflow-y-auto overscroll-contain px-3 py-4"
            style={{
              transform: isAnimating ? 'translateX(0)' : 'translateX(0)',
              transition: 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              key={screen}
              className="animate-in fade-in slide-in-from-right-4 duration-200"
            >
              {screen === 'menu' && (
                <SettingsMenuScreen {...props} onNavigate={handleNavigate} />
              )}
              {screen === 'playMode' && <PlayModeScreen {...props} />}
              {screen === 'challenge' && <ChallengeScreen {...props} />}
              {screen === 'graphics' && <GraphicsScreen {...props} />}
              {screen === 'account' && <AccountScreen {...props} />}
              {screen === 'intro' && <IntroScreen {...props} />}
              {screen === 'tutorial' && <TutorialScreen {...props} />}
              {screen === 'editor' && <EditorScreen {...props} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};