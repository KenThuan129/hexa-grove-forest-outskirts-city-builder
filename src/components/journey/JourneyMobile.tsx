// src/components/journey/JourneyMobile.tsx

import React, { useState } from 'react';
import { ThreeScene, RendererInfo } from '../ThreeScene';
import { JourneyTopBar } from './JourneyTopBar';
import { JourneyBoosterRow } from './JourneyBoosterRow';
import { JourneyPauseSheet } from './JourneyPauseSheet';
import { JourneyTrayMobile } from './JourneyTrayMobile';
import { JourneyMobileLandscape } from './JourneyMobileLandscape';
import { useLayout } from '../../context/LayoutContext';

import { MobileShopSheet } from '../mobile/MobileShopSheet';

import { MobileJourneyTutorial } from './MobileJourneyTutorial';

// ── Props are identical to JourneyMobileLandscape — parent passes everything ──
import type { JourneySharedProps } from './JourneyTypes';
import { sounds } from '@/src/utils/audio';
import { RotateCw } from 'lucide-react';

export const JourneyMobile: React.FC<JourneySharedProps> = (props) => {
    const layout = useLayout();

    const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);

    const [roadTooltip, setRoadTooltip] = React.useState<{
        roadKey: string;
        adjacent: number;
        required: number;
        satisfied: boolean;
    } | null>(null);

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
                        // Check if coord is a pre-placed road
                        const stack = placedTiles.get(`${coord.q},${coord.r}`);
                        const isPrePlacedRoad = stack?.some((t) =>
                            t.clusterId?.startsWith('PREPLACED') && t.type === 'road'
                        );
                        if (!isPrePlacedRoad || !roadRequirements) return;

                        // Find which requirement this road belongs to
                        const req = roadRequirements.find((r) =>
                            r.roadKey && (r as any).roadCoords?.some(
                                (c: any) => c.q === coord.q && c.r === coord.r
                            )
                        );
                        if (req) {
                            setRoadTooltip(req);
                            sounds.playZoneComplete();
                            setTimeout(() => setRoadTooltip(null), 3200);
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
                                    ? 'Complete Level'
                                    : `Expand to Phase ${phaseIndex + 2}`}
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

            <MobileShopSheet
                isOpen={isShopSheetOpen}
                onClose={() => setIsShopSheetOpen(false)}
                coins={coins}
                highestCompletedLevel={highestCompletedLevel}
                boosterInventory={boosterInventory}
                onBuyBooster={onBuyBooster}
            />


        </div>
    );
};