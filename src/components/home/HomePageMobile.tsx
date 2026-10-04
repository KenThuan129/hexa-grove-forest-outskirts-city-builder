// src/components/home/HomePageMobile.tsx

import React, { useMemo, useState } from 'react';
import {
    Compass,
    Play,
    Settings,
    BookOpen,
    HelpCircle,
    ChevronRight,
    CheckCircle2,
    Award,
    Coins,
    Leaf,
    ShoppingBag,
    Crown,
    Sparkles,
    Hammer,
    Lock,
    Lightbulb,
    Trophy,
    LogIn,
    Menu,
    Ticket,
    X,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';
import { LevelConfig, GameMode, PlayMode } from '../../types/game';
import { ConstructionItem, ConstructionId, BoosterId } from '../../types/economy';
import { Resort3DScene } from '../Resort3DScene';
import {
    TopBar,
    PlayerCard,
    BannerRow,
    BigActionButton,
    ChestSlot,
    BottomNav,
    FloatingIconButton,
    type NavTab,
    type TopBarCurrency,
} from '../mobile/ArcadePrimitives';
import { BottomSheet } from '../mobile/BottomSheet';
import { useLayout } from '../../context/LayoutContext';
import { sounds } from '../../utils/audio';
import { HomePageMobileLandscape } from './HomePageMobileLandscape';
import { MobileShopSheet } from '../mobile/MobileShopSheet';
import { MobileVaultSheet } from '../mobile/MobileVaultSheet';
import { JOURNEY_CHESTS } from '@/src/data/economyData';

// ─────────────────────────────────────────────────────────────────
// Props — mirror HomePageProps
// ─────────────────────────────────────────────────────────────────

interface HomePageMobileProps {
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

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export const HomePageMobile: React.FC<HomePageMobileProps> = (props) => {
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
        onForceCloudSync,
        onCloseShowcase = () => { },
        onSelectLevel,
        onStartJourney,
        onNavigateMemories,
        onOpenSettings,
        onOpenRules,
        onOpenLevelEditor,
        onOpenAdminAuth,
        onOpenShop,
        onShowGoldenTicket,
        onPlayIntro,
        highestCompletedLevel = 0,
        claimedChestIds = [],
        boosterInventory = {},
        onClaimChest,
        onBuyBooster,
    } = props;

    const layout = useLayout();

    const isTablet = layout.device === 'tablet';
    const spacing = isTablet ? 'px-5' : 'px-3';
    const btnGap = isTablet ? 'gap-3' : 'gap-2';

    // Render landscape variant whenever the screen is wider than it is tall
    // AND it isn't a genuine desktop-class window. This covers:
    //   - Phone landscape (e.g. 852×393)
    //   - Small tablet landscape (e.g. 1024×768)
    //   - DevTools emulation with swapped dimensions
    if (layout.orientation === 'landscape' && layout.device !== 'desktop') {
        return <HomePageMobileLandscape {...props} />;
    }

    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
    const [isBuildSheetOpen, setIsBuildSheetOpen] = useState(false);

    const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);
    const [isVaultSheetOpen, setIsVaultSheetOpen] = useState(false);
    const [vaultFocusChestId, setVaultFocusChestId] = useState<number | null>(null);

    const currentLevel = levels[currentLevelIndex] || levels[0];
    const totalMaxedCount = constructions.filter((c) => c.currentLevel === 3).length;

    // ── Display level for Play button ────────────────────────────
    const playTargetLevel = useMemo(() => {
        if (!isGuest && typeof nextPlayableIndex === 'number' && nextPlayableIndex >= 0) {
            return levels[nextPlayableIndex] || currentLevel;
        }
        return currentLevel;
    }, [isGuest, nextPlayableIndex, levels, currentLevel]);

    const guestTrialsDone =
        isGuest && (typeof nextPlayableIndex === 'number' && nextPlayableIndex < 0);

    // ── Currencies row ───────────────────────────────────────────
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

    // ── Bottom nav tabs ──────────────────────────────────────────
    const tabs: NavTab[] = [
        {
            id: 'home',
            icon: <Compass className="w-5 h-5" />,
            label: 'Home',
        },
        {
            id: 'memories',
            icon: <BookOpen className="w-5 h-5" />,
            label: 'Memories',
        },
        {
            id: 'shop',
            icon: <ShoppingBag className="w-5 h-5" />,
            label: 'Shop',
            badge: unclaimedChestsCount,
        },
        {
            id: 'ticket',
            icon: <Ticket className="w-5 h-5" />,
            label: 'Ticket',
        },
        {
            id: 'settings',
            icon: <Settings className="w-5 h-5" />,
            label: 'Settings',
        },
    ];

    const handleTabSelect = (id: string) => {
        switch (id) {
            case 'home':
                // already here
                break;
            case 'memories':
                onNavigateMemories();
                break;
            case 'shop': setIsShopSheetOpen(true); break;
            case 'ticket':
                if (!isAdminUnlocked) onOpenAdminAuth?.('Golden Ticket');
                else onShowGoldenTicket();
                break;
            case 'settings':
                onOpenSettings();
                break;
        }
    };

    // ── Player display ───────────────────────────────────────────
    const playerName = isGuest ? 'Guest Explorer' : 'Pioneer';
    const playerSubtitle = isGuest
        ? 'Sign in to save progress'
        : `Level ${highestCompletedLevel} Explorer`;

    // ── 4 chest slots — pick 4 from JOURNEY_CHESTS state ────────
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
            {/* ── 3D Island Hub (full bleed behind top bar) ─────────── */}
            <div className="absolute inset-0 z-0">
                <Resort3DScene
                    constructions={constructions}
                    selectedConstructionId={null}
                    performanceMode="low"
                    layoutMode="mobile"
                    onSelectConstruction={(id) => {
                        sounds.playClick();
                        setIsBuildSheetOpen(true);
                    }}
                />
            </div>

            {/* ── Foreground chrome ────────────────────────────────── */}
            <div className="relative z-10 flex flex-col h-full pointer-events-none">
                {/* Top currencies */}
                <div className="pointer-events-auto">
                    <TopBar currencies={currencies} />
                </div>

                {/* Player card row */}
                <div className="pointer-events-auto">
                    <PlayerCard
                        avatarEmoji={isGuest ? '👤' : '🧑'}
                        name={playerName}
                        subtitle={playerSubtitle}
                        rightActions={
                            <button
                                onClick={() => {
                                    sounds.playClick();
                                    setIsHamburgerOpen(true);
                                }}
                                className="p-2 text-[#f4ecd8] active:scale-90 transition-transform"
                                title="Menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        }
                    />
                </div>

                {/* Golden Ticket banner */}
                <div className={`pointer-events-auto ${spacing} pt-1`}>
                    <BannerRow
                        icon={<Crown className="w-4 h-4 text-[#f0c674]" />}
                        label="Golden Ticket"
                        value={
                            hasGoldenTicket
                                ? 'Claimed · Master Architect'
                                : `${totalMaxedCount}/10 Maxed`
                        }
                        onTap={() => {
                            if (!isAdminUnlocked) onOpenAdminAuth?.('Golden Ticket');
                            else onShowGoldenTicket();
                        }}
                    />
                </div>

                {/* Spacer — hub shows through */}
                <div className="flex-1" />

                {/* ── Bottom action stack ────────────────────────────── */}
                <div className={`pointer-events-auto ${spacing} pb-3 flex flex-col gap-2`}>
                    {/* Chest slots row — 4 slots */}
                    <div className="grid grid-cols-4 gap-2">
                        {chestSlots.map((slot) => (
                            <ChestSlot
                                key={slot.chest.id}
                                state={slot.state}
                                label={
                                    slot.state === 'ready'
                                        ? 'Ready'
                                        : slot.state === 'claimed'
                                            ? 'Claimed'
                                            : `Lvl ${slot.chest.levelThreshold}`
                                }
                                onTap={() => {
                                    setVaultFocusChestId(slot.chest.id);
                                    setIsVaultSheetOpen(true);
                                }}
                            />
                        ))}
                    </div>

                    {/* Two big buttons: Play + Build */}
                    <div className="flex gap-2">
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
                            sublabel={`${totalMaxedCount}/10 Maxed`}
                            variant="secondary"
                            onTap={() => {
                                sounds.playClick();
                                setIsBuildSheetOpen(true);
                            }}
                        />
                    </div>
                </div>

                {/* Bottom navbar */}
                <div className="pointer-events-auto">
                    <BottomNav tabs={tabs} activeTab="home" onSelect={handleTabSelect} />
                </div>
            </div>

            {/* ── Hamburger menu sheet ─────────────────────────────── */}
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
                            <span className="text-xs font-black text-[#f4ecd8] font-rounded">
                                Cloud Save
                            </span>
                            <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${cloudSaveStatus === 'synced'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                    : cloudSaveStatus === 'syncing'
                                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                        : cloudSaveStatus === 'error'
                                            ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                                            : 'bg-slate-950 text-slate-400 border-slate-800'
                                    }`}
                            >
                                {cloudSaveStatus === 'synced'
                                    ? 'Synced'
                                    : cloudSaveStatus === 'syncing'
                                        ? 'Syncing…'
                                        : cloudSaveStatus === 'error'
                                            ? 'Error'
                                            : cloudSaveStatus === 'signed-out'
                                                ? 'Signed Out'
                                                : 'Idle'}
                            </span>
                        </div>
                        {lastSyncedAt && (
                            <span className="text-[10px] text-[#a8b89a] font-mono">
                                Last: {new Date(lastSyncedAt).toLocaleTimeString()}
                            </span>
                        )}
                        {cloudSaveError && (
                            <span className="text-[10px] text-rose-300 font-mono truncate">
                                {cloudSaveError}
                            </span>
                        )}
                        <button
                            onClick={() => {
                                sounds.playClick();
                                onForceCloudSync?.();
                            }}
                            disabled={cloudSaveStatus === 'syncing' || cloudSaveStatus === 'signed-out'}
                            className="w-full py-2 rounded-xl bg-[#1f120a] border border-[#5c3d2e] text-[#f0c674] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${cloudSaveStatus === 'syncing' ? 'animate-spin' : ''}`} />
                            <span>Sync Now</span>
                        </button>
                    </div>

                    {/* Menu items */}
                    <MenuRow
                        icon={<Settings className="w-4 h-4" />}
                        label="Settings"
                        onTap={() => {
                            setIsHamburgerOpen(false);
                            onOpenSettings();
                        }}
                    />
                    <MenuRow
                        icon={<HelpCircle className="w-4 h-4" />}
                        label="Rules & Guide"
                        onTap={() => {
                            setIsHamburgerOpen(false);
                            onOpenRules();
                        }}
                    />
                    {onPlayIntro && (
                        <MenuRow
                            icon={<Sparkles className="w-4 h-4" />}
                            label="Watch Intro"
                            onTap={() => {
                                setIsHamburgerOpen(false);
                                onPlayIntro();
                            }}
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
                onBuyBooster={onBuyBooster ?? (() => { })}
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
                onClaimChest={onClaimChest ?? (() => { })}
                initialChestId={vaultFocusChestId}
            />

            {/* ── Build sheet ──────────────────────────────────────── */}
            <BottomSheet
                isOpen={isBuildSheetOpen}
                onClose={() => setIsBuildSheetOpen(false)}
                initialSnap="half"
                title="Build Resort"
            >
                <div className="flex flex-col gap-3 pb-6">
                    {constructions.map((item) => {
                        const isMax = item.currentLevel >= item.maxLevel;
                        const upgradeCost = isMax ? 0 : item.upgradeCosts[item.currentLevel];
                        const canAfford = !isMax && leaves >= upgradeCost;

                        return (
                            <div
                                key={item.id}
                                className="p-3 rounded-2xl bg-[#2b1a11]/80 border border-[#5c3d2e] flex items-center gap-3"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#1f120a] border border-[#5c3d2e] flex items-center justify-center text-2xl shrink-0">
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-[#f4ecd8] font-rounded truncate">
                                        {item.name}
                                    </div>
                                    <div className="text-[10px] text-[#a8b89a]">
                                        {item.currentLevel === 0
                                            ? 'Unbuilt'
                                            : item.currentLevel >= item.maxLevel
                                                ? '🌿 Max Level'
                                                : `Level ${item.currentLevel}/3`}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        sounds.playClick();
                                        props.onUpgradeConstruction(item.id);
                                    }}
                                    disabled={isMax || !canAfford}
                                    className={`${spacing} py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 shrink-0 ${isMax
                                        ? 'bg-[#1f120a] text-[#a8b89a] border border-[#5c3d2e]'
                                        : canAfford
                                            ? 'bg-gradient-to-b from-[#8fbc6f] to-[#435e38] text-[#f4ecd8] border border-[#c8e0b0]'
                                            : 'bg-[#1f120a] text-[#a8b89a]/50 border border-[#3a2519]'
                                        }`}
                                >
                                    <Leaf className="w-3 h-3" />
                                    <span>{isMax ? 'MAX' : upgradeCost}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </BottomSheet>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// MenuRow — small helper for hamburger sheet items
// ─────────────────────────────────────────────────────────────────

const MenuRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    accent?: boolean;
    onTap: () => void;
}> = ({ icon, label, accent = false, onTap }) => (
    <button
        onClick={onTap}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all active:scale-[0.98] ${accent
            ? 'bg-[#1f120a] border-[#f0c674]/40 text-[#f0c674]'
            : 'bg-[#2b1a11]/80 border-[#5c3d2e] text-[#f4ecd8]'
            }`}
    >
        <span className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</span>
        <span className="flex-1 text-left text-xs font-bold font-rounded">{label}</span>
        <ChevronRight className="w-4 h-4 text-[#a8b89a] shrink-0" />
    </button>
);