// src/components/journey/JourneyMobileLandscape.tsx

import React, { useState } from 'react';
import { ThreeScene } from '../ThreeScene';
import { JourneyTopBar } from './JourneyTopBar';
import { JourneyBoosterRow } from './JourneyBoosterRow';
import { JourneyPauseSheet } from './JourneyPauseSheet';
import { JourneyTrayMobile } from './JourneyTrayMobile';
import type { JourneySharedProps } from './JourneyTypes';
import { MobileShopSheet } from '../mobile/MobileShopSheet';
import { MobileJourneyTutorial } from './MobileJourneyTutorial';
import { sounds } from '@/src/utils/audio';
import { RotateCw } from 'lucide-react';

export const JourneyMobileLandscape: React.FC<JourneySharedProps> = (props) => {
    const {
        playMode,
        levelId,
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
        mobileTutorialSeenGroups,
        onMarkTutorialSeen,
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
        isPaused,
        onPauseToggle,
        onRestart,
        onOpenSettings,
        onExitToHome,
        onSelectPiece,
        onStartDragPiece,
        onEndDragPiece,
        onClearHover,
        onActivateBooster,
        onOpenShop,
        coins,
        onBuyBooster,
    } = props;

    const [isShopSheetOpen, setIsShopSheetOpen] = useState(false);

    const hasAnyPenalty =
        penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood >
        0;
    const penaltyCount =
        penalties.overuse + penalties.disconnect + penalties.overlap + penalties.offMap + penalties.falsehood;

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#0f0805] flex flex-col">
            {/* Top bar */}
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

            {/* Three-column body: tray-left | board-center | boosters-right */}
            <div className="flex-1 min-h-0 flex">
                {/* Left: vertical tray */}
                <div className="shrink-0 h-full">
                    <JourneyTrayMobile
                        availablePieces={availablePieces}
                        selectedPiece={selectedPiece}
                        activeDragPiece={activeDragPiece}
                        orientation="vertical"
                        onSelectPiece={onSelectPiece}
                        onStartDragPiece={onStartDragPiece}
                        onEndDragPiece={onEndDragPiece}
                        onClearHover={onClearHover}
                    />
                </div>

                {/* Center: board */}
                <div className="relative flex-1 min-w-0">
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
                        isExpansionAnimating={isExpansionAnimating}
                        performanceMode={performanceMode}
                        targetFps={targetFps}
                        isLowPowerMode={isLowPowerMode}
                        textureQuality={textureQuality}
                        onUpdateRendererInfo={onUpdateRendererInfo}
                        hudInsetLeftPx={72}
                        hudInsetRightPx={56}
                        layoutMode="mobile"
                    />

                    {/* ── Complete Phase CTA — floating over the board ── */}
                    {/* ── Floating CTA row — Rotate / Complete / Spin ── */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-3 z-20 flex items-center gap-2">
                        {/* Primary slot */}
                        {hasSelectedPiece ? (
                            <button
                                data-tutorial-id="mobile-cancel-btn"
                                onClick={() => {
                                    sounds.playPickup();
                                    onCancelSelected();
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-b from-[#a85560] to-[#6b1f2b] border-2 border-[#e8a8b3] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.35)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)]"
                            >
                                <span className="text-sm leading-none">✕</span>
                                <span className="font-rounded text-[10px]">Cancel</span>
                            </button>
                        ) : canCompletePhase ? (
                            <button
                                data-tutorial-id="mobile-complete-btn"
                                onClick={() => {
                                    sounds.playVictory();
                                    onCompletePhase();
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-b from-[#8fbc6f] to-[#435e38] border-2 border-[#c8e0b0] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.35)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)] animate-bounce"
                                style={{ animationDuration: '1.6s' }}
                            >
                                <span className="text-sm leading-none">✓</span>
                                <span className="font-rounded text-[10px]">
                                    {isLastPhase
                                        ? 'Complete'
                                        : `Phase ${phaseIndex + 2}`}
                                </span>
                            </button>
                        ) : null}

                        {/* Secondary slot */}
                        {hasSelectedPiece && selectedPieceIsCluster ? (
                            <button
                                data-tutorial-id="mobile-rotate-btn"
                                onClick={() => {
                                    sounds.playRotate();
                                    onRotateCluster();
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-b from-[#7a9b8e] to-[#435e38] border-2 border-[#a8c7b5] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.35)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)]"
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span className="font-rounded text-[10px]">Rotate</span>
                            </button>
                        ) : !hasSelectedPiece && hasRotationZone ? (
                            <button
                                data-tutorial-id="mobile-spin-btn"
                                onClick={() => {
                                    sounds.playRotate();
                                    onRotateTurntable();
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-b from-[#5fa8d3] to-[#1e3a8a] border-2 border-[#b8d8ee] text-[#f4ecd8] font-black uppercase tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.35)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)]"
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span className="font-rounded text-[10px]">Spin</span>
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Right: vertical boosters */}
                <div
                    className="shrink-0 h-full flex items-start justify-center py-3"
                    style={{
                        width: '56px',
                        background:
                            'linear-gradient(180deg, #5c3d2e 0%, #3a2519 20%, #2b1a11 60%, #1a0f07 100%)',
                        borderLeft: '2px solid #8fbc6f',
                        boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
                    }}
                >
                    <JourneyBoosterRow
                        boosterInventory={boosterInventory}
                        highestCompletedLevel={highestCompletedLevel}
                        onActivateBooster={onActivateBooster}
                        onOpenShop={() => setIsShopSheetOpen(true)}
                        orientation="vertical"
                    />
                </div>
            </div>

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