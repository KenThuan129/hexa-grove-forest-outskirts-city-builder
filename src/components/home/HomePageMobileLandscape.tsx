// src/components/home/HomePageMobileLandscape.tsx

import React, { useMemo, useState } from 'react';
import {
  Compass,
  Play,
  Settings,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Coins,
  Leaf,
  ShoppingBag,
  Crown,
  Sparkles,
  Hammer,
  Trophy,
  LogIn,
  Menu,
  Ticket,
  RefreshCw,
} from 'lucide-react';
import { LevelConfig, GameMode, PlayMode } from '../../types/game';
import { ConstructionItem, ConstructionId } from '../../types/economy';
import { Resort3DScene } from '../Resort3DScene';
import {
  TopBar,
  BannerRow,
  BigActionButton,
  ChestSlot,
  BottomNav,
  type NavTab,
  type TopBarCurrency,
} from '../mobile/ArcadePrimitives';
import { BottomSheet } from '../mobile/BottomSheet';
import { sounds } from '../../utils/audio';
import { MobileShopSheet } from '../mobile/MobileShopSheet';
import { MobileVaultSheet } from '../mobile/MobileVaultSheet';
import { JOURNEY_CHESTS } from '../../data/economyData';

interface HomePageMobileLandscapeProps {
  levels: LevelConfig[];
  currentLevelIndex: number;
  isOpenShowcase?: boolean;
  gameMode?: GameMode;
  playMode?: PlayMode;
  performanceMode?: 'low' | 'high';
  highestCompletedLevel?: number;
  coins: number;
  leaves: number;
  constructions: ConstructionItem[];
  hasGoldenTicket: boolean;
  isAdminUnlocked?: boolean;
  unclaimedChestsCount?: number;
  isGuest?: boolean;
  guestTrialIndex?: number;
  nextPlayableIndex?: number;
  cloudSaveStatus?: 'idle' | 'syncing' | 'synced' | 'error' | 'signed-out';
  lastSyncedAt?: number | null;
  cloudSaveError?: string | null;
  claimedChestIds?: number[];
  boosterInventory?: Record<string, number>;
  onClaimChest?: (chestId: number) => void;
  onBuyBooster?: (booster: any) => void;
  onForceCloudSync?: () => void;
  onUpgradeConstruction: (id: ConstructionId) => void;
  onCloseShowcase?: () => void;
  onSelectLevel: (index: number) => void;
  onStartJourney: () => void;
  onNavigateMemories: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenLevelEditor: () => void;
  onOpenAdminAuth?: (featureName?: string) => void;
  onChangeGameMode?: (mode: GameMode) => void;
  onChangePlayMode?: (mode: PlayMode) => void;
  onOpenShop: () => void;
  onShowGoldenTicket: () => void;
  onPlayIntro?: () => void;
}

export const HomePageMobileLandscape: React.FC<HomePageMobileLandscapeProps> = (props) => {
  const {
    levels,
    currentLevelIndex,
    coins,
    leaves,
    constructions,
    hasGoldenTicket,
    isAdminUnlocked = false,
    unclaimedChestsCount = 0,
    isGuest = false,
    nextPlayableIndex = 0,
    cloudSaveStatus = 'signed-out',
    lastSyncedAt = null,
    cloudSaveError = null,
    claimedChestIds = [],
    boosterInventory = {},
    onClaimChest,
    onBuyBooster,
    onForceCloudSync,
    onNavigateMemories,
    onStartJourney,
    onOpenShop,
    onOpenSettings,
    onOpenRules,
    onOpenLevelEditor,
    onOpenAdminAuth,
    onShowGoldenTicket,
    onPlayIntro,
    highestCompletedLevel = 0,
  } = props;

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);
  const [isVaultSheetOpen, setIsVaultSheetOpen] = useState(false);
  const [vaultFocusChestId, setVaultFocusChestId] = useState<number | null>(null);

  const currentLevel = levels[currentLevelIndex] || levels[0];
  const totalMaxedCount = constructions.filter((c) => c.currentLevel === 3).length;

  const playTargetLevel = useMemo(() => {
    if (!isGuest && typeof nextPlayableIndex === 'number' && nextPlayableIndex >= 0) {
      return levels[nextPlayableIndex] || currentLevel;
    }
    return currentLevel;
  }, [isGuest, nextPlayableIndex, levels, currentLevel]);

  const guestTrialsDone =
    isGuest && (typeof nextPlayableIndex === 'number' && nextPlayableIndex < 0);

    const currencies: TopBarCurrency[] = [
    { icon: <Trophy className="w-4 h-4" />, value: highestCompletedLevel, color: 'gold' },
    {
      icon: <Coins className="w-4 h-4" />,
      value: coins,
      color: 'gold',
      onTap: () => setIsShopSheetOpen(true),
    },
    {
      icon: <Leaf className="w-4 h-4" />,
      value: leaves,
      color: 'green',
      onTap: () => {
        setVaultFocusChestId(null);
        setIsVaultSheetOpen(true);
      },
    },
  ];

  const tabs: NavTab[] = [
    { id: 'home', icon: <Compass className="w-5 h-5" />, label: 'Home' },
    { id: 'memories', icon: <BookOpen className="w-5 h-5" />, label: 'Memories' },
    { id: 'shop', icon: <ShoppingBag className="w-5 h-5" />, label: 'Shop', badge: unclaimedChestsCount },
    { id: 'ticket', icon: <Ticket className="w-5 h-5" />, label: 'Ticket' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const handleTabSelect = (id: string) => {
    switch (id) {
      case 'home': break;
      case 'memories': onNavigateMemories(); break;
      case 'shop': onOpenShop(); break;
      case 'ticket':
        if (!isAdminUnlocked) onOpenAdminAuth?.('Golden Ticket');
        else onShowGoldenTicket();
        break;
      case 'settings': onOpenSettings(); break;
    }
  };

  // 4 chest slots — respect Q1 = option B (4 locked slots when none ready)
    // 4 chest slots — A1: fixed mapping to the first 4 chests in progression
  const chestSlots = useMemo(() => {
    const sorted = JOURNEY_CHESTS.slice().sort(
      (a, b) => a.levelThreshold - b.levelThreshold
    );
    const firstFour = sorted.slice(0, 4);

    return firstFour.map((chest) => {
      const isClaimed = claimedChestIds.includes(chest.id);
      const isUnlocked = highestCompletedLevel >= chest.levelThreshold;
      const state: 'claimed' | 'ready' | 'locked' = isClaimed
        ? 'claimed'
        : isUnlocked
        ? 'ready'
        : 'locked';
      return { chest, state };
    });
  }, [highestCompletedLevel, claimedChestIds]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex flex-col">
      {/* ── 3D Island (full bleed behind everything) ──────────── */}
      <div className="absolute inset-0 z-0">
        <Resort3DScene
          constructions={constructions}
          selectedConstructionId={null}
          performanceMode="low"
          onSelectConstruction={() => sounds.playClick()}
        />
      </div>

      {/* ── Foreground chrome ─────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Top row: currencies + hamburger + ticket banner inline */}
        <div
          className="pointer-events-auto flex items-center gap-2 px-3"
          style={{
            paddingTop: 'calc(6px + env(safe-area-inset-top, 0px))',
            paddingLeft: 'calc(12px + env(safe-area-inset-left, 0px))',
            paddingRight: 'calc(12px + env(safe-area-inset-right, 0px))',
          }}
        >
          <TopBar currencies={currencies} />
          <div className="flex-1" />
          {/* Banner compressed to a pill in landscape */}
          <button
            onClick={() => {
              sounds.playClick();
              if (!isAdminUnlocked) onOpenAdminAuth?.('Golden Ticket');
              else onShowGoldenTicket();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#f0c674]/30 to-[#d49b38]/20 border border-[#f0c674]/60"
          >
            <Crown className="w-3.5 h-3.5 text-[#f0c674]" />
            <span className="text-[10px] font-black text-[#f4ecd8] font-rounded">
              {hasGoldenTicket ? 'CLAIMED' : `${totalMaxedCount}/10`}
            </span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setIsHamburgerOpen(true);
            }}
            className="p-2 rounded-full text-[#f4ecd8] active:scale-90 transition-transform"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Spacer — hub shows through */}
        <div className="flex-1" />

        {/* Bottom action area — split into two horizontal groups */}
        <div
          className="pointer-events-auto flex items-center gap-3 px-3 pb-2"
          style={{
            paddingLeft: 'calc(12px + env(safe-area-inset-left, 0px))',
            paddingRight: 'calc(12px + env(safe-area-inset-right, 0px))',
          }}
        >
          {/* Left: chest slots (small) */}
          <div className="flex gap-1.5">
            {chestSlots.map((slot) => (
              <div key={slot.chest.id} className="w-12">
                <ChestSlot
                  state={slot.state}
                  label={undefined}
                  onTap={() => {
                    setVaultFocusChestId(slot.chest.id);
                    setIsVaultSheetOpen(true);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Right: Play + Build buttons */}
          <div className="flex gap-2 min-w-[280px]">
            <BigActionButton
              icon={
                guestTrialsDone ? (
                  <LogIn className="w-5 h-5 text-[#f4ecd8]" />
                ) : (
                  <Play className="w-5 h-5 text-[#f4ecd8] fill-[#f4ecd8]" />
                )
              }
              label={guestTrialsDone ? 'Sign In' : 'Play'}
              sublabel={
                isGuest
                  ? guestTrialsDone
                    ? 'Demo Complete'
                    : 'Trial Demo'
                  : `Level ${playTargetLevel.id}`
              }
              variant="primary"
              onTap={onStartJourney}
            />
            <BigActionButton
              icon={<Hammer className="w-5 h-5 text-[#f4ecd8]" />}
              label="Build"
              sublabel={`${totalMaxedCount}/10`}
              variant="secondary"
              onTap={() => {
                sounds.playClick();
                props.onUpgradeConstruction(constructions[0]?.id ?? 'timber_lodge');
              }}
            />
          </div>
        </div>

        {/* Navbar */}
        <div className="pointer-events-auto">
          <BottomNav tabs={tabs} activeTab="home" onSelect={handleTabSelect} />
        </div>
      </div>

      {/* ── Hamburger sheet — same content as portrait ────────── */}
      <BottomSheet
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        initialSnap="half"
        title="Menu"
      >
        <div className="flex flex-col gap-2 pb-6">
          {/* Cloud Save status */}
          <div className="p-3 rounded-2xl bg-[#2b1a11]/80 border border-[#5c3d2e] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#f4ecd8] font-rounded">Cloud Save</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  cloudSaveStatus === 'synced'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : cloudSaveStatus === 'syncing'
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                    : cloudSaveStatus === 'error'
                    ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {cloudSaveStatus === 'synced' ? 'Synced'
                  : cloudSaveStatus === 'syncing' ? 'Syncing…'
                  : cloudSaveStatus === 'error' ? 'Error'
                  : cloudSaveStatus === 'signed-out' ? 'Signed Out'
                  : 'Idle'}
              </span>
            </div>
            {lastSyncedAt && (
              <span className="text-[10px] text-[#a8b89a] font-mono">
                Last: {new Date(lastSyncedAt).toLocaleTimeString()}
              </span>
            )}
            {cloudSaveError && (
              <span className="text-[10px] text-rose-300 font-mono truncate">{cloudSaveError}</span>
            )}
            <button
              onClick={() => { sounds.playClick(); onForceCloudSync?.(); }}
              disabled={cloudSaveStatus === 'syncing' || cloudSaveStatus === 'signed-out'}
              className="w-full py-2 rounded-xl bg-[#1f120a] border border-[#5c3d2e] text-[#f0c674] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cloudSaveStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>

          <MenuRow
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            onTap={() => { setIsHamburgerOpen(false); onOpenSettings(); }}
          />
          <MenuRow
            icon={<HelpCircle className="w-4 h-4" />}
            label="Rules & Guide"
            onTap={() => { setIsHamburgerOpen(false); onOpenRules(); }}
          />
          {onPlayIntro && (
            <MenuRow
              icon={<Sparkles className="w-4 h-4" />}
              label="Watch Intro"
              onTap={() => { setIsHamburgerOpen(false); onPlayIntro(); }}
            />
          )}
          {!isGuest && (
            <MenuRow
              icon={<Hammer className="w-4 h-4" />}
              label={isAdminUnlocked ? 'Level Editor' : 'Level Editor (Locked)'}
              accent={!isAdminUnlocked}
              onTap={() => {
                setIsHamburgerOpen(false);
                if (!isAdminUnlocked) onOpenAdminAuth?.('Level Editor');
                else onOpenLevelEditor();
              }}
            />
          )}
        </div>
      </BottomSheet>

      {/* ── Mobile Shop Sheet ─────────────────────────────── */}
      <MobileShopSheet
        isOpen={isShopSheetOpen}
        onClose={() => setIsShopSheetOpen(false)}
        coins={coins}
        highestCompletedLevel={highestCompletedLevel}
        boosterInventory={boosterInventory as any}
        onBuyBooster={onBuyBooster ?? (() => {})}
      />

      {/* ── Mobile Journey Vault Sheet ────────────────────── */}
      <MobileVaultSheet
        isOpen={isVaultSheetOpen}
        onClose={() => {
          setIsVaultSheetOpen(false);
          setVaultFocusChestId(null);
        }}
        highestCompletedLevel={highestCompletedLevel}
        claimedChestIds={claimedChestIds}
        onClaimChest={onClaimChest ?? (() => {})}
        initialChestId={vaultFocusChestId}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Reuse the same MenuRow helper
// ─────────────────────────────────────────────────────────────────

const MenuRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  onTap: () => void;
}> = ({ icon, label, accent = false, onTap }) => (
  <button
    onClick={onTap}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all active:scale-[0.98] ${
      accent
        ? 'bg-[#1f120a] border-[#f0c674]/40 text-[#f0c674]'
        : 'bg-[#2b1a11]/80 border-[#5c3d2e] text-[#f4ecd8]'
    }`}
  >
    <span className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</span>
    <span className="flex-1 text-left text-xs font-bold font-rounded">{label}</span>
    <ChevronRight className="w-4 h-4 text-[#a8b89a] shrink-0" />
  </button>
);