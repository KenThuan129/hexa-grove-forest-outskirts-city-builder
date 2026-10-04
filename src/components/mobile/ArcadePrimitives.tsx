// src/components/mobile/ArcadePrimitives.tsx

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

// ─────────────────────────────────────────────────────────────────
// TopBar — currencies row
// ─────────────────────────────────────────────────────────────────

export interface TopBarCurrency {
  icon: React.ReactNode;
  value: string | number;
  color: 'gold' | 'green' | 'blue' | 'purple';
  onTap?: () => void;
}

interface TopBarProps {
  currencies: TopBarCurrency[];
}

const CURRENCY_COLORS: Record<TopBarCurrency['color'], string> = {
  gold: 'bg-gradient-to-b from-[#f0c674] to-[#d49b38] border-[#fce8ad] text-[#2b1a11]',
  green: 'bg-gradient-to-b from-[#8fbc6f] to-[#435e38] border-[#c8e0b0] text-[#f4ecd8]',
  blue: 'bg-gradient-to-b from-[#5fa8d3] to-[#1e3a8a] border-[#b8d8ee] text-[#f4ecd8]',
  purple: 'bg-gradient-to-b from-[#c084fc] to-[#7e22ce] border-[#e9d5ff] text-white',
};

export const TopBar: React.FC<TopBarProps> = ({ currencies }) => {
  return (
    <div
      className="flex items-center justify-center gap-2 px-3 py-2"
      style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}
    >
      {currencies.map((c, idx) => (
        <button
          key={idx}
          onClick={
            c.onTap
              ? () => {
                  sounds.playClick();
                  c.onTap?.();
                }
              : undefined
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 shadow-lg min-w-0 ${CURRENCY_COLORS[c.color]} ${c.onTap ? 'cursor-pointer active:scale-95' : ''}`}
        >
          <span className="w-4 h-4 flex items-center justify-center shrink-0">{c.icon}</span>
          <span className="font-mono font-black text-xs tabular-nums truncate">{c.value}</span>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PlayerCard — avatar + name + right-side actions
// ─────────────────────────────────────────────────────────────────

interface PlayerCardProps {
  avatarEmoji: string;
  name: string;
  subtitle: string;
  rightActions: React.ReactNode;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  avatarEmoji,
  name,
  subtitle,
  rightActions,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#2b1a11]/90 border-2 border-[#5c3d2e] shadow-lg min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b8e5a] to-[#435e38] border-2 border-[#8fbc6f] flex items-center justify-center text-lg shadow-inner shrink-0">
          {avatarEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black text-[#f4ecd8] font-rounded truncate">
            {name}
          </div>
          <div className="text-[10px] font-bold text-[#a8b89a] truncate">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">{rightActions}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// FloatingIconButton — small circular button (hamburger, sync, etc.)
// ─────────────────────────────────────────────────────────────────

interface FloatingIconButtonProps {
  icon: React.ReactNode;
  onTap: () => void;
  variant?: 'default' | 'accent' | 'danger';
  badge?: number;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

const SIZE_CLASS: Record<NonNullable<FloatingIconButtonProps['size']>, string> = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
};

const VARIANT_CLASS: Record<NonNullable<FloatingIconButtonProps['variant']>, string> = {
  default: 'bg-[#2b1a11]/95 border-[#5c3d2e] text-[#f4ecd8]',
  accent: 'bg-gradient-to-b from-[#6b8e5a] to-[#435e38] border-[#8fbc6f] text-[#f4ecd8]',
  danger: 'bg-gradient-to-b from-[#ef4444] to-[#991b1b] border-[#fca5a5] text-white',
};

export const FloatingIconButton: React.FC<FloatingIconButtonProps> = ({
  icon,
  onTap,
  variant = 'default',
  badge,
  size = 'md',
  title,
}) => {
  return (
    <button
      onClick={() => {
        sounds.playClick();
        onTap();
      }}
      title={title}
      className={`relative rounded-full border-2 shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all active:scale-90 ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]}`}
    >
      {icon}
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-[#2b1a11]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────
// BannerRow — Golden Ticket / event banner
// ─────────────────────────────────────────────────────────────────

interface BannerRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient?: string;
  onTap?: () => void;
}

export const BannerRow: React.FC<BannerRowProps> = ({
  icon,
  label,
  value,
  gradient = 'from-[#f0c674]/20 via-[#d49b38]/10 to-[#f0c674]/20',
  onTap,
}) => {
  return (
    <button
      onClick={
        onTap
          ? () => {
              sounds.playClick();
              onTap();
            }
          : undefined
      }
      className={`w-full flex items-center gap-3 px-4 py-2.5 mx-3 rounded-2xl bg-gradient-to-r ${gradient} border-2 border-[#f0c674]/60 shadow-lg ${onTap ? 'cursor-pointer active:scale-[0.98]' : ''}`}
      style={{ width: 'calc(100% - 24px)' }}
    >
      <div className="w-8 h-8 rounded-xl bg-[#2b1a11]/70 border border-[#f0c674]/60 flex items-center justify-center shrink-0 text-base">
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#f0c674]">
          {label}
        </div>
        <div className="text-xs font-black text-[#f4ecd8] truncate">{value}</div>
      </div>
      {onTap && <ChevronRight className="w-4 h-4 text-[#f0c674] shrink-0" />}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────
// BigActionButton — Play / Build
// ─────────────────────────────────────────────────────────────────

interface BigActionButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  variant?: 'primary' | 'secondary';
  onTap: () => void;
  disabled?: boolean;
}

export const BigActionButton: React.FC<BigActionButtonProps> = ({
  icon,
  label,
  sublabel,
  variant = 'primary',
  onTap,
  disabled = false,
}) => {
  const palette =
    variant === 'primary'
      ? 'from-[#8fbc6f] via-[#6b8e5a] to-[#435e38] border-[#c8e0b0]'
      : 'from-[#d49b38] via-[#a87828] to-[#5c3d2e] border-[#fce8ad]';

  return (
    <button
      onClick={() => {
        if (disabled) return;
        sounds.playVictory();
        onTap();
      }}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 px-3 rounded-2xl bg-gradient-to-b ${palette} border-2 shadow-[0_6px_0_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.4)] transition-all active:translate-y-[3px] active:shadow-[0_3px_0_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed`}
    >
       <div className="flex items-center gap-1.5">
        <span className="flex items-center justify-center">{icon}</span>
        <span className="text-base font-black text-[#f4ecd8] uppercase tracking-wider font-rounded drop-shadow">
          {label}
        </span>
      </div>
      {sublabel && (
        <span className="text-xs font-bold text-[#f4ecd8]/80 uppercase tracking-wider">
          {sublabel}
        </span>
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────
// ChestSlot
// ─────────────────────────────────────────────────────────────────

interface ChestSlotProps {
  state: 'ready' | 'claimed' | 'locked';
  icon?: React.ReactNode;
  label?: string;
  onTap?: () => void;
}

export const ChestSlot: React.FC<ChestSlotProps> = ({
  state,
  icon = '🎁',
  label,
  onTap,
}) => {
  const palette =
    state === 'ready'
      ? 'from-[#f0c674] to-[#d49b38] border-[#fce8ad]'
      : state === 'claimed'
      ? 'from-[#3a2519] to-[#2b1a11] border-[#5c3d2e] opacity-60'
      : 'from-[#1f120a] to-[#0f0805] border-[#3a2519] opacity-70';

  return (
    <button
      onClick={
        onTap
          ? () => {
              sounds.playClick();
              onTap();
            }
          : undefined
      }
      className={`relative aspect-square rounded-2xl bg-gradient-to-b ${palette} border-2 shadow-lg flex flex-col items-center justify-center gap-0.5 ${state === 'ready' ? 'animate-pulse' : ''} ${onTap ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <span className="text-2xl">{state === 'locked' ? '🔒' : icon}</span>
      {label && (
        <span
          className={`text-[9px] font-black uppercase tracking-wider ${state === 'ready' ? 'text-[#2b1a11]' : 'text-[#a8b89a]'}`}
        >
          {label}
        </span>
      )}
      {state === 'ready' && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-[#2b1a11]">
          !
        </span>
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────
// BottomNav — 5 tabs
// ─────────────────────────────────────────────────────────────────

export interface NavTab {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface BottomNavProps {
  tabs: NavTab[];
  activeTab: string;
  onSelect: (id: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ tabs, activeTab, onSelect }) => {
  return (
    <nav
      className="flex items-stretch justify-around bg-[#1f120a] border-t-2 border-[#5c3d2e] shadow-[0_-6px_20px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              onSelect(tab.id);
            }}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
              isActive ? 'text-[#f0c674]' : 'text-[#a8b89a] active:text-[#f4ecd8]'
            }`}
          >
            <span className="relative">
              {tab.icon}
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center border border-[#1f120a]">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider font-rounded">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#f0c674]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────────
// BoosterIconButton — journey booster row
// ─────────────────────────────────────────────────────────────────

interface BoosterIconButtonProps {
  icon: React.ReactNode;
  count: number;
  locked?: boolean;
  onTap: () => void;
}

export const BoosterIconButton: React.FC<BoosterIconButtonProps> = ({
  icon,
  count,
  locked = false,
  onTap,
}) => {
  const canUse = !locked && count > 0;
  return (
    <button
      onClick={() => {
        if (!canUse) sounds.playWarning();
        else sounds.playVictory();
        onTap();
      }}
      className={`relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all active:scale-90 ${
        canUse
          ? 'bg-gradient-to-b from-[#f0c674] to-[#d49b38] border-[#fce8ad] text-[#2b1a11]'
          : 'bg-[#1f120a] border-[#3a2519] text-[#5c3d2e]'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {typeof count === 'number' && (
        <span
          className={`absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center border-2 ${
            canUse
              ? 'bg-[#2b1a11] text-[#f0c674] border-[#f0c674]'
              : 'bg-[#0f0805] text-[#5c3d2e] border-[#3a2519]'
          }`}
        >
          {count}
        </span>
      )}
      {locked && (
        <span className="absolute -top-1 -left-1 text-[10px]">🔒</span>
      )}
    </button>
  );
};