// src/components/journey/JourneyMobile.tsx

import React, { useState } from 'react';
import { ThreeScene, RendererInfo } from '../ThreeScene';
import { JourneyTopBar } from './JourneyTopBar';
import { JourneyBoosterRow } from './JourneyBoosterRow';
import { JourneyPauseSheet } from './JourneyPauseSheet';
import { JourneyTrayMobile } from './JourneyTrayMobile';
import { JourneyMobileLandscape } from './JourneyMobileLandscape';
import { useLayout } from '../../context/LayoutContext';
import type { TileColor, BossZoneType } from '../../types/game';

import { MobileShopSheet } from '../mobile/MobileShopSheet';

import { MobileJourneyTutorial } from './MobileJourneyTutorial';

import { BossBattleModal } from '../BossBattleModal';

// ── Props are identical to JourneyMobileLandscape — parent passes everything ──
import type { JourneySharedProps } from './JourneyTypes';
import { sounds } from '@/src/utils/audio';
import { RotateCw, Swords } from 'lucide-react';

export const JourneyMobile: React.FC<JourneySharedProps> = (props) => {
    const layout = useLayout();

    const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);

    const [roadTooltip, setRoadTooltip] = React.useState<{
        roadKey: string;
        adjacent: number;
        required: number;
        satisfied: boolean;
    } | null>(null);

    const [zoneTooltip, setZoneTooltip] = React.useState<{
        zoneName: string;
        color: TileColor;
        occupied: number;
        total: number;
        bossZoneType?: BossZoneType;
    } | null>(null);

    const [isBossBattleOpen, setIsBossBattleOpen] = React.useState(false);

    // Landscape mobile → different layout
    if (layout.orientation === 'landscape') {
        return <JourneyMobileLandscape {...props} />;
    }

    const {
        playMode,
        levelId,
        roadRequirements,
        mobileTutorialSeenGroups,
        onMarkTutorialSeen,
        rotationsPerformed,
        hasPlacedRoad,
        hasPlacedBridge,
        lightbulbsUsed,
        lightbulbBudget,
        placedCount,
        parCount,
        penalties,
        boosterInventory,
        highestCompletedLevel,
        availablePieces,
        selectedPiece,
        activeDragPiece,
        canCompletePhase,
        isLastPhase,
        phaseIndex,
        onCompletePhase,
        selectedPieceIsCluster,
        hasSelectedPiece,
        onRotateCluster,
        onCancelSelected,
        hasRotationZone,
        onRotateTurntable,
        // scene props
        unlockedCells,
        placedTiles,
        dragPointerPos,
        hoveredCoord,
        pickedUpCoord,
        disconnectedKeys,
        rotationZones,
        onHoverCoordChange,
        onTileDroppedOnBoard,
        onRightClickBoard,
        onRotateZone,
        isExpansionAnimating,
        performanceMode,
        targetFps,
        isLowPowerMode,
        textureQuality,
        threeSceneKey,
        onUpdateRendererInfo,
        // pause
        isPaused,
        onPauseToggle,
        onRestart,
        onOpenSettings,
        onExitToHome,
        // tray
        onSelectPiece,
        onStartDragPiece,
        onEndDragPiece,
        onClearHover,
        // boosters
        onActivateBooster,
        onOpenShop,
        coins,
        onBuyBooster,
        isBossLevel = false,
        bossName,
        bossPopularity,
        bossAmbience,
        bossBattleStats,
        coloredZones,
    } = props;

    const hasAnyPenalty =
        penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood >
        0;
    const penaltyCount =
        penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood;

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#0f0805] flex flex-col">
            {/* ── Top bar ─────────────────────────────────────────── */}
            <JourneyTopBar
                playMode={playMode}
                lightbulbsUsed={lightbulbsUsed}
                lightbulbBudget={lightbulbBudget}
                placedCount={placedCount}
                parCount={parCount}
                hasAnyPenalty={hasAnyPenalty}
                penaltyCount={penaltyCount}
                onPause={onPauseToggle}
            />

            {/* ── Board (~55% of remaining height) ───────────────── */}
            <div className="relative flex-1 min-h-0">
                <ThreeScene
                    key={threeSceneKey}
                    unlockedCells={unlockedCells}
                    placedTiles={placedTiles}
                    activeDragPiece={activeDragPiece || selectedPiece}
                    dragPointerPos={dragPointerPos}
                    hoveredCoord={hoveredCoord}
                    pickedUpCoord={pickedUpCoord}
                    disconnectedKeys={disconnectedKeys}
                    rotationZones={rotationZones}
                    onHoverCoordChange={onHoverCoordChange}
                    onTileDroppedOnBoard={onTileDroppedOnBoard}
                    onRightClickBoard={onRightClickBoard}
                    onRotateZone={onRotateZone}
                    onLongPressHex={(coord) => {
                        // 1. Check pre-placed road trước (giữ nguyên hành vi cũ)
                        const stack = placedTiles.get(`${coord.q},${coord.r}`);
                        const isPrePlacedRoad = stack?.some((t) =>
                            t.clusterId?.startsWith('PREPLACED') && t.type === 'road'
                        );

                        if (isPrePlacedRoad && roadRequirements) {
                            const req = roadRequirements.find((r) =>
                                r.roadKey && (r as any).roadCoords?.some(
                                    (c: any) => c.q === coord.q && c.r === coord.r
                                )
                            );
                            if (req) {
                                setRoadTooltip(req);
                                sounds.playZoneComplete();
                                setTimeout(() => setRoadTooltip(null), 3200);
                                return;
                            }
                        }

                        // 2. Nếu là boss level → check color zone
                        if (!isBossLevel || !coloredZones) return;

                        for (const zone of coloredZones) {
                            const inZone = zone.coords.some(
                                (c) => c.q === coord.q && c.r === coord.r
                            );
                            if (!inZone) continue;

                            // Đếm số cell trong zone đã được tile màu khớp
                            let occupied = 0;
                            for (const c of zone.coords) {
                                const s = placedTiles.get(`${c.q},${c.r}`);
                                if (s && s.length > 0 && s[s.length - 1].color === zone.color) {
                                    occupied++;
                                }
                            }

                            setZoneTooltip({
                                zoneName: zone.name,
                                color: zone.color,
                                occupied,
                                total: zone.coords.length,
                                bossZoneType: zone.bossZoneType,
                            });
                            sounds.playZoneComplete();
                            setTimeout(() => setZoneTooltip(null), 3000);
                            return;
                        }
                    }}
                    isExpansionAnimating={isExpansionAnimating}
                    performanceMode={performanceMode}
                    targetFps={targetFps}
                    isLowPowerMode={isLowPowerMode}
                    textureQuality={textureQuality}
                    onUpdateRendererInfo={onUpdateRendererInfo}
                    hudInsetLeftPx={0}
                    hudInsetRightPx={0}
                    layoutMode="mobile"
                />

                {/* ── Complete Phase CTA — floating over the board ──── */}
                {/* ── Floating CTA row — Rotate / Complete / Spin ──── */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 flex items-center gap-3">
                    {/* Primary slot: Cancel (holding) OR Complete */}
                    {hasSelectedPiece ? (
                        <button
                            data-tutorial-id="mobile-cancel-btn"
                            onClick={() => {
                                sounds.playPickup();
                                onCancelSelected();
                            }}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-b from-[#a85560] to-[#6b1f2b] border-2 border-[#e8a8b3] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_8px_24px_rgba(168,85,96,0.5)] active:translate-y-[3px] active:shadow-[0_3px_0_rgba(0,0,0,0.35)]"
                        >
                            <span className="text-base leading-none">✕</span>
                            <span className="font-rounded text-xs">Cancel</span>
                        </button>
                    ) : isBossLevel && canCompletePhase ? (
                        <button
                            data-tutorial-id="mobile-boss-btn"
                            onClick={() => {
                                sounds.playVictory();
                                setIsBossBattleOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-rose-300 text-white font-black uppercase tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_8px_24px_rgba(244,63,94,0.5)] active:translate-y-[3px] active:shadow-[0_3px_0_rgba(0,0,0,0.35)] animate-bounce"
                            style={{ animationDuration: '1.6s' }}
                        >
                            <Swords className="w-4 h-4" />
                            <span className="font-rounded text-xs">Showdown</span>
                        </button>
                    ) : canCompletePhase ? (
                        <button
                            data-tutorial-id="mobile-complete-btn"
                            onClick={() => {
                                sounds.playVictory();
                                onCompletePhase();
                            }}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-b from-[#8fbc6f] to-[#435e38] border-2 border-[#c8e0b0] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_8px_24px_rgba(16,185,129,0.5)] active:translate-y-[3px] active:shadow-[0_3px_0_rgba(0,0,0,0.35)] animate-bounce"
                            style={{ animationDuration: '1.6s' }}
                        >
                            <span className="text-lg leading-none">✓</span>
                            <span className="font-rounded text-xs">
                                {isLastPhase
                                    ? 'Complete'
                                    : `Expand`}
                            </span>
                        </button>
                    ) : null}

                    {/* Secondary slot: Rotate Cluster OR Spin Turntable */}
                    {hasSelectedPiece && selectedPieceIsCluster ? (
                        <button
                            data-tutorial-id="mobile-rotate-btn"
                            onClick={() => {
                                sounds.playRotate();
                                onRotateCluster();
                            }}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-b from-[#7a9b8e] to-[#435e38] border-2 border-[#a8c7b5] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_8px_24px_rgba(122,155,142,0.5)] active:translate-y-[3px] active:shadow-[0_3px_0_rgba(0,0,0,0.35)]"
                        >
                            <RotateCw className="w-4 h-4" />
                            <span className="font-rounded text-xs">Rotate 60°</span>
                        </button>
                    ) : !hasSelectedPiece && hasRotationZone ? (
                        <button
                            data-tutorial-id="mobile-spin-btn"
                            onClick={() => {
                                sounds.playRotate();
                                onRotateTurntable();
                            }}
                            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-b from-[#5fa8d3] to-[#1e3a8a] border-2 border-[#b8d8ee] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_8px_24px_rgba(95,168,211,0.5)] active:translate-y-[3px] active:shadow-[0_3px_0_rgba(0,0,0,0.35)]"
                        >
                            <RotateCw className="w-4 h-4" />
                            <span className="font-rounded text-xs">Spin</span>
                        </button>
                    ) : null}
                </div>
            </div>

            {/* ── Booster row ──────────────────────────────────────── */}
            <div className="bg-[#1f120a] border-t-2 border-[#5c3d2e]">
                <JourneyBoosterRow
                    boosterInventory={boosterInventory}
                    highestCompletedLevel={highestCompletedLevel}
                    onActivateBooster={onActivateBooster}
                    onOpenShop={() => setIsShopSheetOpen(true)}
                    orientation="horizontal"
                />
            </div>

            {/* ── Wood tray ────────────────────────────────────────── */}
            <div className="shrink-0">
                <JourneyTrayMobile
                    availablePieces={availablePieces}
                    selectedPiece={selectedPiece}
                    activeDragPiece={activeDragPiece}
                    orientation="horizontal"
                    onSelectPiece={onSelectPiece}
                    onStartDragPiece={onStartDragPiece}
                    onEndDragPiece={onEndDragPiece}
                    onClearHover={onClearHover}
                />
            </div>

            {/* ── Pause sheet ──────────────────────────────────────── */}
            <JourneyPauseSheet
                isOpen={isPaused}
                onClose={onPauseToggle}
                onRestart={onRestart}
                onOpenSettings={onOpenSettings}
                onExitToHome={onExitToHome}
            />

            <MobileJourneyTutorial
                levelId={levelId}
                seenGroups={mobileTutorialSeenGroups}
                onComplete={onMarkTutorialSeen}
                hasSelectedPiece={hasSelectedPiece}
                placedCount={placedCount}
                hasPlacedRoad={hasPlacedRoad}
                hasPlacedBridge={hasPlacedBridge}
                rotationsPerformed={rotationsPerformed}
            />

            {roadTooltip && (
                <div className="fixed left-1/2 -translate-x-1/2 bottom-32 z-[60] pointer-events-none animate-in fade-in duration-150">
                    <div className={`px-4 py-2.5 rounded-2xl border-2 backdrop-blur-md shadow-2xl ${roadTooltip.satisfied
                        ? 'bg-emerald-950/90 border-emerald-500/70'
                        : 'bg-slate-950/90 border-amber-500/70'
                        }`}>
                        <div className="text-[10px] font-mono font-black uppercase tracking-widest mb-1">
                            <span className={roadTooltip.satisfied ? 'text-emerald-300' : 'text-amber-300'}>
                                Transit Charter
                            </span>
                        </div>
                        <div className="text-xs font-bold text-white capitalize mb-1">
                            {roadTooltip.roadKey.replace(/-/g, ' ')}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                <div
                                    className={`h-full rounded-full ${roadTooltip.satisfied ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                    style={{ width: `${Math.min(100, (roadTooltip.adjacent / roadTooltip.required) * 100)}%` }}
                                />
                            </div>
                            <span className="text-[11px] text-white font-mono font-bold">
                                {roadTooltip.adjacent}/{roadTooltip.required}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {zoneTooltip && (
                <div className="fixed left-1/2 -translate-x-1/2 bottom-32 z-[60] pointer-events-none animate-in fade-in duration-150">
                    <div className={`px-4 py-2.5 rounded-2xl border-2 backdrop-blur-md shadow-2xl ${zoneTooltip.color === 'amber'
                            ? 'bg-amber-950/90 border-amber-500/70'
                            : zoneTooltip.color === 'emerald'
                                ? 'bg-emerald-950/90 border-emerald-500/70'
                                : zoneTooltip.color === 'sapphire'
                                    ? 'bg-cyan-950/90 border-cyan-500/70'
                                    : zoneTooltip.color === 'ruby'
                                        ? 'bg-rose-950/90 border-rose-500/70'
                                        : 'bg-slate-950/90 border-slate-500/70'
                        }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${zoneTooltip.color === 'amber'
                                    ? 'bg-amber-400'
                                    : zoneTooltip.color === 'emerald'
                                        ? 'bg-emerald-400'
                                        : zoneTooltip.color === 'sapphire'
                                            ? 'bg-cyan-400'
                                            : zoneTooltip.color === 'ruby'
                                                ? 'bg-rose-400'
                                                : 'bg-slate-400'
                                }`} />
                            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-300">
                                {zoneTooltip.color} Zone
                            </span>
                        </div>

                        <div className="text-xs font-bold text-white mb-1.5 capitalize">
                            {zoneTooltip.zoneName}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                <div
                                    className={`h-full rounded-full ${zoneTooltip.occupied >= zoneTooltip.total
                                            ? 'bg-emerald-400'
                                            : 'bg-amber-400'
                                        }`}
                                    style={{
                                        width: `${Math.min(100, (zoneTooltip.occupied / Math.max(1, zoneTooltip.total)) * 100)}%`,
                                    }}
                                />
                            </div>
                            <span className="text-[11px] text-white font-mono font-bold">
                                {zoneTooltip.occupied}/{zoneTooltip.total}
                            </span>
                        </div>

                        {/* Benefit hint */}
                        <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] font-bold text-amber-200">
                            {zoneTooltip.color === 'amber' || zoneTooltip.color === 'ruby'
                                ? '⭐ +35 Popularity'
                                : zoneTooltip.color === 'sapphire'
                                    ? '🕯️ +35 Ambience'
                                    : '🎁 +1 Bonus Slot'}
                        </div>
                    </div>
                </div>
            )}

            <MobileShopSheet
                isOpen={isShopSheetOpen}
                onClose={() => setIsShopSheetOpen(false)}
                coins={coins}
                highestCompletedLevel={highestCompletedLevel}
                boosterInventory={boosterInventory}
                onBuyBooster={onBuyBooster}
            />

            {isBossLevel && bossBattleStats && (
                <BossBattleModal
                    isOpen={isBossBattleOpen}
                    bossName={bossName || 'Tycoon Sterling Vance'}
                    bossPopularity={bossPopularity ?? 180}
                    bossAmbience={bossAmbience ?? 170}
                    playerStats={bossBattleStats}
                    onVictory={() => {
                        setIsBossBattleOpen(false);
                        onCompletePhase();
                    }}
                    onDefeat={() => {
                        setIsBossBattleOpen(false);
                    }}
                    onClose={() => setIsBossBattleOpen(false)}
                />
            )}
        </div>
    );
};