// src/components/mobile/settings/SettingsRow.tsx

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { sounds } from '../../../utils/audio';

type RowKind = 'toggle' | 'navigate' | 'action';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  /** Optional subtitle shown under label */
  subtitle?: string;
  /** Row type determines interaction + right-side content */
  kind: RowKind;
  /** For 'toggle' — current state */
  toggleValue?: boolean;
  /** For 'navigate' — current value shown before arrow */
  value?: string;
  /** For 'navigate' — value accent (e.g. 'Building Mode' colored) */
  valueAccent?: string;
  /** For 'action' — right-side badge */
  badge?: React.ReactNode;
  /** Called on tap. For 'toggle', state is passed flipped. */
  onTap: (nextToggle?: boolean) => void;
  /** Disable interaction (e.g. Level Editor when locked shows arrow but gates) */
  disabled?: boolean;
  /** Show small pulse to draw attention */
  highlight?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  subtitle,
  kind,
  toggleValue = false,
  value,
  valueAccent,
  badge,
  onTap,
  disabled = false,
  highlight = false,
}) => {
  const handleClick = () => {
    if (disabled) return;
    if (kind === 'toggle') {
      sounds.playClick();
      onTap(!toggleValue);
    } else {
      sounds.playClick();
      onTap();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
        disabled
          ? 'bg-[#2b1a11]/60 border-[#3a2519] opacity-60 cursor-not-allowed'
          : 'bg-[#2b1a11]/80 border-[#5c3d2e] hover:border-[#8fbc6f] cursor-pointer'
      } ${highlight ? 'animate-pulse' : ''}`}
    >
      {/* Left icon */}
      <div className="w-9 h-9 rounded-xl bg-[#1f120a] border border-[#5c3d2e] flex items-center justify-center text-[#f4ecd8] shrink-0">
        {icon}
      </div>

      {/* Center: label + optional subtitle */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-black text-[#f4ecd8] font-rounded truncate">
          {label}
        </div>
        {subtitle && (
          <div className="text-[10px] text-[#a8b89a] font-medium truncate mt-0.5">
            {subtitle}
          </div>
        )}
      </div>

      {/* Right side */}
      {kind === 'toggle' && (
        <div
          className={`relative w-14 h-7 rounded-full border-2 transition-all shrink-0 ${
            toggleValue
              ? 'bg-[#8fbc6f]/30 border-[#8fbc6f]'
              : 'bg-[#1f120a] border-[#3a2519]'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
              toggleValue
                ? 'left-[30px] bg-[#8fbc6f] shadow-[0_0_10px_rgba(143,188,111,0.6)]'
                : 'left-0.5 bg-[#5c3d2e]'
            }`}
          />
        </div>
      )}

      {kind === 'navigate' && (
        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <span
              className={`text-[10.5px] font-bold font-mono ${
                valueAccent ?? 'text-[#a8b89a]'
              }`}
            >
              {value}
            </span>
          )}
          {badge}
          <ChevronRight className="w-4 h-4 text-[#a8b89a] shrink-0" />
        </div>
      )}

      {kind === 'action' && (
        <div className="flex items-center gap-1.5 shrink-0">
          {badge}
        </div>
      )}
    </button>
  );
};