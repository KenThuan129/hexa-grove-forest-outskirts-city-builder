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

// ── Props are identical to JourneyMobileLandscape — parent passes everything ──
import type { JourneySharedProps } from './JourneyTypes';
import { sounds } from '@/src/utils/audio';
import { RotateCw } from 'lucide-react';

export const JourneyMobile: React.FC<JourneySharedProps> = (props) => {
    const layout = useLayout();

    const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);

    // Landscape mobile → different layout
    if (layout.orientation === 'landscape') {
        return <JourneyMobileLandscape {...props} />;
    }

    const {
        playMode,
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