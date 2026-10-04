// src/components/journey/JourneyPauseSheet.tsx

import React from 'react';
import {
  Play,
  RotateCcw,
  Settings,
  Home,
  ChevronRight,
} from 'lucide-react';
import { BottomSheet } from '../mobile/BottomSheet';
import { sounds } from '../../utils/audio';

interface JourneyPauseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onExitToHome: () => void;
}

export const JourneyPauseSheet: React.FC<JourneyPauseSheetProps> = ({
  isOpen,
  onClose,
  onRestart,
  onOpenSettings,
  onExitToHome,
}) => {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      initialSnap="peek"
      showHandle
      title="Paused"
    >
      <div className="flex flex-col gap-2 pb-6">
        {/* Resume — primary CTA */}
        <button
          onClick={() => {
            sounds.playVictory();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-b from-[#8fbc6f] to-[#435e38] border-2 border-[#c8e0b0] text-[#f4ecd8] font-black uppercase tracking-wider shadow-lg active:translate-y-[2px] transition-transform"
        >
          <Play className="w-4 h-4 fill-[#f4ecd8]" />
          <span className="font-rounded">Resume</span>
        </button>

        {/* Divider */}
        <div className="h-px bg-[#5c3d2e]/60 my-1" />

        {/* Restart */}
        <PauseRow
          icon={<RotateCcw className="w-4 h-4" />}
          label="Restart Level"
          onTap={() => {
            sounds.playClick();
            onRestart();
            onClose();
          }}
        />

        {/* Settings */}
        <PauseRow
          icon={<Settings className="w-4 h-4" />}
          label="Settings"
          onTap={() => {
            sounds.playClick();
            onOpenSettings();
            onClose();
          }}
        />

        {/* Exit to Home */}
        <PauseRow
          icon={<Home className="w-4 h-4" />}
          label="Exit to Home"
          danger
          onTap={() => {
            sounds.playWarning();
            onExitToHome();
            onClose();
          }}
        />
      </div>
    </BottomSheet>
  );
};

const PauseRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onTap: () => void;
}> = ({ icon, label, danger = false, onTap }) => (
  <button
    onClick={onTap}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border-2 transition-all active:scale-[0.98] ${
      danger
        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        : 'bg-[#2b1a11]/80 border-[#5c3d2e] text-[#f4ecd8]'
    }`}
  >
    <span className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</span>
    <span className="flex-1 text-left text-xs font-bold font-rounded">{label}</span>
    <ChevronRight className="w-4 h-4 text-[#a8b89a] shrink-0" />
  </button>
);