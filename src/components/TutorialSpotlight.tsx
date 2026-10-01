import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sparkles, ChevronRight, Check, Crown, Waves, AlertTriangle } from 'lucide-react';
import { HexPiece, PlacedTile, PenaltyRecord } from '../types/game';
import { sounds } from '../utils/audio';

interface TutorialSpotlightProps {
  levelId: number;
  currentPhaseIndex?: number;
  totalPhases?: number;
  selectedPiece: HexPiece | null;
  placedTiles: Map<string, PlacedTile[]>;
  canCompletePhase: boolean;
  penalties?: PenaltyRecord;
  onCompleteTutorialStep?: () => void;
  onAutoDemoBuild?: (coord: { q: number; r: number }, pieceId: string) => void;
}

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

interface ExtraFocalItem {
  rect: TargetRect;
  color?: string;
  label?: string;
}

type PointerDirection = 'down' | 'left' | 'right' | 'up';

const isRectDifferent = (a: TargetRect | null, b: TargetRect | null): boolean => {
  if (!a && !b) return false;
  if (!a || !b) return true;
  return (
    Math.abs(a.left - b.left) > 0.5 ||
    Math.abs(a.top - b.top) > 0.5 ||
    Math.abs(a.width - b.width) > 0.5 ||
    Math.abs(a.height - b.height) > 0.5
  );
};

const isExtrasEqual = (a: ExtraFocalItem[], b: ExtraFocalItem[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].color !== b[i].color || a[i].label !== b[i].label) return false;
    if (isRectDifferent(a[i].rect, b[i].rect)) return false;
  }
  return true;
};

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  levelId,
  currentPhaseIndex = 0,
  totalPhases = 1,
  selectedPiece,
  placedTiles,
  canCompletePhase,
  penalties,
  onCompleteTutorialStep,
  onAutoDemoBuild,
}) => {
  // Step state per level
  const [level2Step, setLevel2Step] = useState<number>(1);
  const [level6Step, setLevel6Step] = useState<number>(1);
  const [isLevelPhase2Dismissed, setIsLevelPhase2Dismissed] = useState<boolean>(false);
  const [isPenaltyTutorialDismissed, setIsPenaltyTutorialDismissed] = useState<boolean>(false);

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [extraRects, setExtraRects] = useState<ExtraFocalItem[]>([]);
  const hasTriggeredDemoRef = useRef(false);

  // Reset steps when switching levels or phases
  useEffect(() => {
    if (levelId === 2) {
      if (currentPhaseIndex === 0) {
        setLevel2Step(1);
        hasTriggeredDemoRef.current = false;
        setIsLevelPhase2Dismissed(false);
      }
    } else if (levelId === 6) {
      setLevel6Step(1);
    }
    setIsPenaltyTutorialDismissed(false);
  }, [levelId, currentPhaseIndex]);

  // Step 3 Auto Demo Build Trigger for Level 2
  useEffect(() => {
    if (levelId === 2 && currentPhaseIndex === 0 && level2Step === 3 && !hasTriggeredDemoRef.current) {
      hasTriggeredDemoRef.current = true;
      if (onAutoDemoBuild && !placedTiles.get('1,0')?.length) {
        onAutoDemoBuild({ q: 1, r: 0 }, 'p-house-amber');
      }
    }
  }, [levelId, currentPhaseIndex, level2Step, onAutoDemoBuild, placedTiles]);

  // Level 1 Progress Detection
  const hasPlacedCenter = Boolean(placedTiles.get('0,0')?.length);
  const hasPlacedAmberL1 = Boolean(placedTiles.get('1,0')?.some(t => t.color === 'amber'));
  const isHoldingTimber = selectedPiece?.id === 'p-house-gray';
  const isHoldingAmber = selectedPiece?.color === 'amber';
  const isHoldingEmerald = selectedPiece?.color === 'emerald';

  // Level 2 Progress Detection
  const hasPlacedYellow2_0 = Boolean(placedTiles.get('2,0')?.some(t => t.color === 'amber'));
  const hasPlacedEmerald0_1 = Boolean(placedTiles.get('0,1')?.some(t => t.color === 'emerald'));
  const hasPlacedEmerald0_2 = Boolean(placedTiles.get('0,2')?.some(t => t.color === 'emerald'));
  const isPhase1AllZonesCompleted = hasPlacedYellow2_0 && hasPlacedEmerald0_1 && hasPlacedEmerald0_2;

  // Level 6 Progress Detection (Check if any tile is off map)
  const hasOffMapTileL6 = useMemo(() => {
    // Valid unlocked coords in Level 6 phase 1
    const level6ValidCoords = new Set([
      '0,0', '1,0', '2,0', '0,1', '1,1', '0,2', '-1,1', '-1,0', '-2,0', '0,-1', '1,-1', '-1,2', '2,-1'
    ]);
    for (const [key, stack] of placedTiles.entries()) {
      if (stack && stack.length > 0) {
        const isBridge = stack.some(t => t.type === 'bridge');
        if (!isBridge && !level6ValidCoords.has(key)) {
          return true;
        }
      }
    }
    return false;
  }, [placedTiles]);

  const hasPlacedCenterL6 = Boolean(placedTiles.get('0,0')?.length);
  const hasPlacedAmber1_0 = Boolean(placedTiles.get('1,0')?.some(t => t.color === 'amber'));
  const hasPlacedAmber2_0 = Boolean(placedTiles.get('2,0')?.some(t => t.color === 'amber'));

  // Auto-advance Level 2 steps based on actual placements
  useEffect(() => {
    if (levelId === 2 && currentPhaseIndex === 0) {
      if (level2Step === 4 && hasPlacedYellow2_0) {
        setLevel2Step(5);
        sounds.playZoneComplete();
      } else if (level2Step === 5 && isPhase1AllZonesCompleted) {
        setLevel2Step(6);
        sounds.playVictory();
      }
    }
  }, [levelId, currentPhaseIndex, level2Step, hasPlacedYellow2_0, isPhase1AllZonesCompleted]);

  // Auto-advance Level 6 step based on user actions
  useEffect(() => {
    if (levelId === 6) {
      if (level6Step === 2 && !hasOffMapTileL6) {
        setLevel6Step(3);
        sounds.playPickup();
      } else if (level6Step === 3 && hasPlacedCenterL6 && !hasOffMapTileL6) {
        setLevel6Step(4);
        sounds.playZoneComplete();
      }
    }
  }, [levelId, level6Step, hasOffMapTileL6, hasPlacedCenterL6]);

  // Advance step handler
  const handleAdvanceLevel2 = () => {
    sounds.playPickup();
    setLevel2Step(prev => prev + 1);
  };

  const handleAdvanceLevel6 = () => {
    sounds.playPickup();
    setLevel6Step(prev => prev + 1);
  };

  // Determine current tutorial metadata via useMemo for pure reference stability
  const tutorialMeta = useMemo(() => {
    let targetSelector: string | null = null;
    let targetHex: { q: number; r: number } | null = null;
    let extraFocalSelectors: { selector: string; color?: string; label?: string }[] = [];
    let extraFocalHexes: { q: number; r: number; color?: string; label?: string }[] = [];

    let title = '';
    let description = '';
    let badgeLabel = 'CLICK';
    let themeColor: 'emerald' | 'amber' | 'cyan' | 'purple' | 'rose' = 'emerald';
    let pointerDirection: PointerDirection = 'down';

    // LEVEL 1
    if (levelId === 1) {
      if (!hasPlacedCenter) {
        if (!isHoldingTimber) {
          targetSelector = '[data-tutorial-id="tray-piece-p-house-gray"], [data-piece-index="0"]';
          title = 'Step 1: Select Timber Cottage';
          description = 'Click on the Timber Cottage tile in your inventory tray below to pick it up.';
          badgeLabel = 'CLICK TO HOLD';
          themeColor = 'emerald';
          pointerDirection = 'down';
        } else {
          targetHex = { q: 0, r: 0 };
          title = 'Step 2: Place on Center Hex (0,0)';
          description = 'Click on the central clearing hex in the 3D scene to place your cottage.';
          badgeLabel = 'PLACE HERE';
          themeColor = 'emerald';
          pointerDirection = 'down';
        }
      } else if (!hasPlacedAmberL1) {
        if (!isHoldingAmber) {
          targetSelector = '[data-tutorial-id="tray-piece-p-house-amber"], [data-piece-index="1"]';
          title = 'Step 3: Select Sunlit Townhall (Amber)';
          description = 'Click on the golden Sunlit Townhall to prepare it for the sunlit zone.';
          badgeLabel = 'CLICK TO HOLD';
          themeColor = 'amber';
          pointerDirection = 'down';
        } else {
          targetHex = { q: 1, r: 0 };
          title = 'Step 4: Align with Golden Zone (1,0)';
          description = 'Click on the glowing amber hex on the board to fulfill the color requirement!';
          badgeLabel = 'MATCH AMBER';
          themeColor = 'amber';
          pointerDirection = 'down';
        }
      } else {
        targetSelector = null;
        targetHex = null;
        title = '🎉 Tutorial Step 1 Completed!';
        description = 'All dwellings aligned perfectly! Click "Continue to Level 2" to advance.';
        badgeLabel = 'CONTINUE';
        themeColor = 'emerald';
        pointerDirection = 'down';
      }
    }
    // LEVEL 2
    else if (levelId === 2) {
      if (currentPhaseIndex === 0) {
        if (level2Step === 1) {
          targetSelector = '[data-tutorial-id="tutorial-lightbulb-budget"]';
          title = '1. Lightbulb Building Limit';
          description = 'Look at your Lightbulb Budget! Every dwelling placed consumes lightbulbs. Once exhausted, you cannot place more — building has strict limits!';
          badgeLabel = 'CHECK 💡 LIMIT';
          themeColor = 'amber';
          pointerDirection = 'left';
        } else if (level2Step === 2) {
          targetSelector = '[data-tutorial-id="tutorial-expanding-progress"]';
          extraFocalSelectors = [{ selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'cyan', label: 'Target Zones' }];
          extraFocalHexes = [
            { q: 1, r: 0, color: 'amber', label: 'Amber Zone' },
            { q: 2, r: 0, color: 'amber', label: 'Amber Zone' },
            { q: 0, r: 1, color: 'emerald', label: 'Emerald Zone' },
            { q: 0, r: 2, color: 'emerald', label: 'Emerald Zone' },
          ];
          title = '2. Expanding Progress & Target Color Zones';
          description = 'Look at the Target Color Zones checklist in the right sidebar and the glowing zones on the board (Amber Sunlit Meadow & Emerald Verdant Grove). Matching tiles to these designated zones is your goal!';
          badgeLabel = 'TARGET ZONES';
          themeColor = 'cyan';
          pointerDirection = 'left';
        } else if (level2Step === 3) {
          targetHex = { q: 1, r: 0 };
          extraFocalSelectors = [{ selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'amber', label: 'Amber 1/2' }];
          extraFocalHexes = [
            { q: 2, r: 0, color: 'amber', label: 'Next Amber Zone' },
          ];
          title = '3. Sunlit Meadow (Amber) Auto-Placed!';
          description = 'A Sunlit Townhall was auto-built on Amber Zone (1,0)! Notice the Target Color Zones checklist (Right) now tracks 1/2 Amber filled. Your goal is to fill all required Colored Zones!';
          badgeLabel = 'MATCH AMBER (1,0)';
          themeColor = 'amber';
          pointerDirection = 'down';
        } else if (level2Step === 4) {
          if (!isHoldingAmber) {
            targetSelector = '[data-tutorial-id="tray-piece-p-house-amber"]';
            extraFocalSelectors = [{ selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'amber', label: 'Amber 1/2' }];
            extraFocalHexes = [{ q: 2, r: 0, color: 'amber', label: 'Target (2,0)' }];
            title = '4. Select Sunlit Townhall';
            description = 'Click the Sunlit Townhall in your tray to prepare the second Amber dwelling for the Sunlit Meadow zone.';
            badgeLabel = 'SELECT YELLOW';
            themeColor = 'amber';
            pointerDirection = 'down';
          } else {
            targetHex = { q: 2, r: 0 };
            extraFocalSelectors = [{ selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'amber', label: 'Amber Target' }];
            title = '4. Place on Amber Target Zone (2,0)';
            description = 'Place the Sunlit Townhall onto the second glowing Amber hex at (2,0) to complete the Sunlit Meadow objective!';
            badgeLabel = 'PLACE ON (2,0)';
            themeColor = 'amber';
            pointerDirection = 'down';
          }
        } else if (level2Step === 5) {
          if (!isHoldingEmerald) {
            targetSelector = '[data-tutorial-id="tray-piece-p-trees-emerald"]';
            extraFocalSelectors = [{ selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'emerald', label: 'Emerald 0/2' }];
            extraFocalHexes = [
              { q: 0, r: 1, color: 'emerald', label: 'Grove (0,1)' },
              { q: 0, r: 2, color: 'emerald', label: 'Grove (0,2)' },
            ];
            title = '5. Amber Complete! Select Verdant Shelter';
            description = 'Target Zones: Sunlit Meadow is 100% complete! Now select Verdant Shelter (Emerald) from your tray to fill the remaining Verdant Grove target zones.';
            badgeLabel = 'SELECT GREEN';
            themeColor = 'emerald';
            pointerDirection = 'down';
          } else {
            const nextGreenCoord = !hasPlacedEmerald0_1 ? { q: 0, r: 1 } : { q: 0, r: 2 };
            targetHex = nextGreenCoord;
            extraFocalSelectors = [{ selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'emerald', label: 'Emerald Target' }];
            title = `5. Fill Emerald Zone (${nextGreenCoord.q},${nextGreenCoord.r})`;
            description = `Place your Verdant Shelter onto the Emerald Verdant Grove at (${nextGreenCoord.q},${nextGreenCoord.r}).`;
            badgeLabel = 'PLACE ON GREEN';
            themeColor = 'emerald';
            pointerDirection = 'down';
          }
        } else if (level2Step === 6) {
          targetSelector = '[data-tutorial-id="btn-expand-action"]';
          extraFocalSelectors = [
            { selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'emerald', label: 'Zones Complete ✓' },
          ];
          extraFocalHexes = [
            { q: 1, r: 0, color: 'amber', label: 'Sunlit Meadow ✓' },
            { q: 2, r: 0, color: 'amber', label: 'Sunlit Meadow ✓' },
            { q: 0, r: 1, color: 'emerald', label: 'Verdant Grove ✓' },
            { q: 0, r: 2, color: 'emerald', label: 'Verdant Grove ✓' },
          ];
          title = '🌟 All Target Zones Complete! The Expand Button';
          description = 'Both Sunlit Meadow and Verdant Grove are 100% complete! Notice the button below has transformed into "Expand Area". Click Expand to push back boundaries and unlock Phase 2!';
          badgeLabel = 'CLICK EXPAND';
          themeColor = 'cyan';
          pointerDirection = 'right';
        }
      } else if (currentPhaseIndex === 1 && !isLevelPhase2Dismissed) {
        targetSelector = null;
        targetHex = { q: -1, r: 2 };
        title = '🗺️ Expanded Territory Unlocked!';
        description = 'A new area opens with even more challenge! Some levels come with multiple lands to settle. Complete the newly opened Western Terraces to finish the level!';
        badgeLabel = 'EXPANDED LAND';
        themeColor = 'emerald';
        pointerDirection = 'down';
      }
    }
    // LEVEL 6
    else if (levelId === 6) {
      if (level6Step === 1) {
        targetSelector = '[data-tutorial-id="tag-no-off-map"], [data-tutorial-id="tutorial-target-color-zones"]';
        extraFocalSelectors = [
          { selector: '[data-tutorial-id="tag-no-off-map"]', color: 'rose', label: 'No Off-map ✕' },
          { selector: '[data-tutorial-id="tutorial-mastery-challenge"]', color: 'purple', label: 'Mastery Challenge' },
        ];
        extraFocalHexes = [{ q: 0, r: 3, color: 'rose', label: 'Off-Map Tile (0,3)' }];
        title = '👑 Target Color Zones: "No Off-map" Tag';
        description = 'Look at the "No Off-map" tag in the Target Color Zones checklist! Even though color zones look active, the pre-placed green cluster has a piece stranded outside the map border at (0,3), causing an Off-Map violation.';
        badgeLabel = 'CHECK NO OFF-MAP';
        themeColor = 'purple';
        pointerDirection = 'left';
      } else if (level6Step === 2) {
        targetHex = { q: 0, r: 3 };
        extraFocalSelectors = [
          { selector: '[data-tutorial-id="tag-no-off-map"]', color: 'rose', label: 'No Off-map: Active Warning' },
          { selector: '[data-tutorial-id="tutorial-mastery-challenge"]', color: 'purple' },
        ];
        title = 'Pick Up Stray Green Tile (0,3)';
        description = 'Click on the stray green tile stranded at (0,3) outside the valid map boundary to pick it up. Watch the "No Off-map" tag turn green with a checkmark ✓!';
        badgeLabel = 'PICK UP (0,3)';
        themeColor = 'rose';
        pointerDirection = 'down';
      } else if (level6Step === 3) {
        targetHex = { q: 0, r: 0 };
        extraFocalSelectors = [
          { selector: '[data-tutorial-id="tag-no-off-map"]', color: 'emerald', label: 'No Off-map ✓' },
        ];
        extraFocalHexes = [
          { q: 1, r: 0, color: 'amber', label: 'Yellow Zone (1,0)' },
          { q: 2, r: 0, color: 'amber', label: 'Yellow Zone (2,0)' },
        ];
        title = 'Move Green Tile to Center Hex (0,0)';
        description = 'Move the green tile to the neutral center hex at (0,0) instead! Notice that (1,0) and (2,0) are yellow color tiles already, while (0,1) and (0,2) already satisfy Emerald Grove.';
        badgeLabel = 'MOVE TO (0,0)';
        themeColor = 'emerald';
        pointerDirection = 'down';
      } else if (level6Step === 4) {
        if (!isHoldingAmber) {
          targetSelector = '[data-tutorial-id="tray-piece-p-house-amber"]';
          extraFocalSelectors = [
            { selector: '[data-tutorial-id="tag-no-off-map"]', color: 'emerald', label: 'No Off-map ✓' },
            { selector: '[data-tutorial-id="tutorial-target-color-zones"]', color: 'amber', label: 'Target Zones' },
          ];
          extraFocalHexes = [
            { q: 1, r: 0, color: 'amber', label: 'Sunstone Plaza (1,0)' },
            { q: 2, r: 0, color: 'amber', label: 'Sunstone Plaza (2,0)' },
          ];
          title = 'Select Amber Townhall';
          description = 'Select the Sunlit Townhall (Amber) from your tray to fill the remaining Sunstone Plaza target zones at (1,0) and (2,0).';
          badgeLabel = 'SELECT AMBER';
          themeColor = 'amber';
          pointerDirection = 'down';
        } else {
          const nextAmberHex = !hasPlacedAmber1_0 ? { q: 1, r: 0 } : { q: 2, r: 0 };
          targetHex = nextAmberHex;
          extraFocalSelectors = [
            { selector: '[data-tutorial-id="tag-no-off-map"]', color: 'emerald', label: 'No Off-map ✓' },
          ];
          title = `Fill Sunstone Plaza (${nextAmberHex.q},${nextAmberHex.r})`;
          description = `Place your Amber Townhall on the glowing golden Sunstone Plaza zone at (${nextAmberHex.q},${nextAmberHex.r}) to complete all color requirements with 0 penalties!`;
          badgeLabel = 'PLACE ON AMBER';
          themeColor = 'amber';
          pointerDirection = 'down';
        }
      }
    }
    // LEVEL 9
    else if (levelId === 9 && !isPenaltyTutorialDismissed) {
      title = '⚠️ Overlap Penalty Introduced';
      description = 'Giant Multi-Hex Clusters (like the 5-Hex Canopy Pentad) must fit completely into open ground. Stacking tiles over existing ones incurs Overlap errors (-100 pts). Align clusters cleanly without overlapping!';
      badgeLabel = 'NO OVERLAP';
      themeColor = 'amber';
      targetSelector = '[data-tutorial-id="left-sidebar-panel"]';
      pointerDirection = 'left';
    }
    // LEVEL 12
    else if (levelId === 12 && !isPenaltyTutorialDismissed) {
      title = '🔗 Disconnect Penalty Introduced';
      description = 'Colonies must remain contiguous! Placing structures isolated from your existing settlement incurs Disconnect penalties (-120 pts). Connect every hex back to the central outpost!';
      badgeLabel = 'KEEP CONNECTED';
      themeColor = 'cyan';
      targetSelector = '[data-tutorial-id="left-sidebar-panel"]';
      pointerDirection = 'left';
    }
    // LEVEL 15
    else if (levelId === 15 && !isPenaltyTutorialDismissed) {
      title = '💡 Par Limit & Overuse Penalty';
      description = 'Placing more tiles than the allotted Par Limit drains colony stamina and incurs Overuse penalties (-150 pts). Keep your layout efficient to earn all 3 Stars!';
      badgeLabel = 'WATCH PAR QUOTA';
      themeColor = 'amber';
      targetSelector = '[data-tutorial-id="tutorial-lightbulb-budget"]';
      pointerDirection = 'left';
    }
    // LEVEL 16
    else if (levelId === 16 && !isPenaltyTutorialDismissed) {
      title = '🛣️ Road Infrastructure Introduced';
      description = 'Connect your frontier settlement! Place Road pieces across clearings to link structures. Check the "Use Road" badge in the Target Color Zone to verify road construction.';
      badgeLabel = 'BUILD ROADS';
      themeColor = 'amber';
      targetSelector = '[data-tutorial-id="tag-use-road"]';
      pointerDirection = 'left';
    }
    // LEVEL 18
    else if (levelId === 18 && !isPenaltyTutorialDismissed) {
      title = '⚙️ Rotary Turntable Zones';
      description = 'Manage two synchronized Rotary Turntables! Press [T] or click the Spin button in the sidebar to rotate single hexes into aligned color pathways.';
      badgeLabel = 'SPIN TURNTABLE';
      themeColor = 'cyan';
      targetSelector = '[data-tutorial-id="right-sidebar-panel"]';
      pointerDirection = 'right';
    }
    // LEVEL 20
    else if (levelId === 20 && !isPenaltyTutorialDismissed) {
      targetHex = { q: 0, r: -1 };
      title = '🌊 Riverside Blocker!';
      description = 'Try placing a piece on the rushing riverbank — it is blocked! Riverside cells are unbuildable natural water barriers where no structures can be built. Plan your metropolis around the river crossing!';
      badgeLabel = 'RIVERSIDE BARRIER';
      themeColor = 'cyan';
      pointerDirection = 'down';
    }
    // LEVEL 23
    else if (levelId === 23 && !isPenaltyTutorialDismissed) {
      title = '🌉 River Crossing & Bridge Engineering';
      description = 'A rushing river cuts through the valley! Normal structures cannot be placed in water, but Bridge pieces span across the river to connect both riverbanks. Check the "Use Bridge" tag in the Target Color Zone!';
      badgeLabel = 'SPAN BRIDGES';
      themeColor = 'cyan';
      targetSelector = '[data-tutorial-id="tag-use-bridge"]';
      pointerDirection = 'left';
    }
    // LEVEL 25: BUSINESS BATTLE
    else if (levelId === 25 && !isPenaltyTutorialDismissed) {
      title = '💼 Business Battle · Section Inspection & Revenue Showdown';
      description = 'Rival Tycoon Sterling Vance challenges you to a Revenue Battle! Inspect each section by hovering over colored zones without picking up pieces to earn Popularity, Ambience, or +1 Bonus Slot. Then enter the Business Showdown to attract staying guests and dominate the market!';
      badgeLabel = 'BUSINESS SHOWDOWN';
      themeColor = 'amber';
      targetSelector = '[data-tutorial-id="target-color-zones"]';
      pointerDirection = 'left';
    }

    return {
      targetSelector,
      targetHex,
      extraFocalSelectors,
      extraFocalHexes,
      title,
      description,
      badgeLabel,
      themeColor,
      pointerDirection,
    };
  }, [
    levelId,
    currentPhaseIndex,
    level2Step,
    level6Step,
    hasPlacedCenter,
    hasPlacedAmberL1,
    isHoldingTimber,
    isHoldingAmber,
    isHoldingEmerald,
    hasPlacedYellow2_0,
    hasPlacedEmerald0_1,
    hasPlacedEmerald0_2,
    hasOffMapTileL6,
    isLevelPhase2Dismissed,
    isPenaltyTutorialDismissed,
  ]);

  const {
    targetSelector,
    targetHex,
    extraFocalSelectors,
    extraFocalHexes,
    title,
    description,
    badgeLabel,
    themeColor,
  } = tutorialMeta;

  const targetHexQ = targetHex ? targetHex.q : null;
  const targetHexR = targetHex ? targetHex.r : null;

  // Helper to project 3D hex coordinates to screen bounding box
  const getHexTargetRect = useCallback((q: number, r: number): TargetRect | null => {
    const getHexPos = (window as any).__hexaGetHexScreenPos;
    if (typeof getHexPos === 'function') {
      const hexRect = getHexPos(q, r);
      if (hexRect && hexRect.width > 0 && hexRect.height > 0) {
        return {
          left: hexRect.left,
          top: hexRect.top,
          width: hexRect.width,
          height: hexRect.height,
          right: hexRect.right,
          bottom: hexRect.bottom,
          centerX: hexRect.x,
          centerY: hexRect.y,
        };
      }
    }
    return null;
  }, []);

  // Update target bounding boxes dynamically with strict deep equality checks
  const updateTargetRects = useCallback(() => {
    let mainRect: TargetRect | null = null;

    if (targetHexQ !== null && targetHexR !== null) {
      mainRect = getHexTargetRect(targetHexQ, targetHexR);
      if (!mainRect) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2 - 20;
        mainRect = {
          left: cx - 44,
          top: cy - 44,
          width: 88,
          height: 88,
          right: cx + 44,
          bottom: cy + 44,
          centerX: cx,
          centerY: cy,
        };
      }
    } else if (targetSelector) {
      const el = document.querySelector(targetSelector);
      if (el) {
        const domRect = el.getBoundingClientRect();
        if (domRect.width > 0 && domRect.height > 0) {
          mainRect = {
            left: domRect.left,
            top: domRect.top,
            width: domRect.width,
            height: domRect.height,
            right: domRect.right,
            bottom: domRect.bottom,
            centerX: domRect.left + domRect.width / 2,
            centerY: domRect.top + domRect.height / 2,
          };
        }
      }
    }

    setTargetRect(prev => {
      if (!isRectDifferent(prev, mainRect)) return prev;
      return mainRect;
    });

    // Compute extra focal items
    const extras: ExtraFocalItem[] = [];

    // 1. Extra DOM Selectors
    for (const item of extraFocalSelectors) {
      const el = document.querySelector(item.selector);
      if (el) {
        const domRect = el.getBoundingClientRect();
        if (domRect.width > 0 && domRect.height > 0) {
          extras.push({
            rect: {
              left: domRect.left,
              top: domRect.top,
              width: domRect.width,
              height: domRect.height,
              right: domRect.right,
              bottom: domRect.bottom,
              centerX: domRect.left + domRect.width / 2,
              centerY: domRect.top + domRect.height / 2,
            },
            color: item.color,
            label: item.label,
          });
        }
      }
    }

    // 2. Extra 3D Board Hexes
    for (const hex of extraFocalHexes) {
      const hexRect = getHexTargetRect(hex.q, hex.r);
      if (hexRect) {
        extras.push({
          rect: hexRect,
          color: hex.color,
          label: hex.label,
        });
      }
    }

    setExtraRects(prev => {
      if (isExtrasEqual(prev, extras)) return prev;
      return extras;
    });
  }, [targetSelector, targetHexQ, targetHexR, extraFocalSelectors, extraFocalHexes, getHexTargetRect]);

  useEffect(() => {
    updateTargetRects();
    const interval = setInterval(updateTargetRects, 150);

    window.addEventListener('resize', updateTargetRects);
    window.addEventListener('scroll', updateTargetRects, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetRects);
      window.removeEventListener('scroll', updateTargetRects, true);
    };
  }, [updateTargetRects]);

  // Dismiss conditions
  if (levelId === 2 && currentPhaseIndex === 1 && isLevelPhase2Dismissed) return null;
  if (levelId === 6 && level6Step >= 4) return null;
  if ([9, 12, 15, 18, 20].includes(levelId) && isPenaltyTutorialDismissed) return null;
  if (!title) return null;

  const colorStyles =
    themeColor === 'amber'
      ? {
          border: 'border-amber-400',
          glow: 'shadow-[0_0_24px_rgba(245,158,11,0.6)]',
          badge: 'bg-amber-500 text-slate-950 font-black',
          btn: 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950',
          title: 'text-amber-300',
        }
      : themeColor === 'cyan'
      ? {
          border: 'border-cyan-400',
          glow: 'shadow-[0_0_24px_rgba(34,211,238,0.6)]',
          badge: 'bg-cyan-500 text-slate-950 font-black',
          btn: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950',
          title: 'text-cyan-300',
        }
      : themeColor === 'purple'
      ? {
          border: 'border-purple-400',
          glow: 'shadow-[0_0_24px_rgba(168,85,247,0.6)]',
          badge: 'bg-purple-500 text-slate-950 font-black',
          btn: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white',
          title: 'text-purple-300',
        }
      : themeColor === 'rose'
      ? {
          border: 'border-rose-400',
          glow: 'shadow-[0_0_24px_rgba(244,63,94,0.6)]',
          badge: 'bg-rose-500 text-white font-black',
          btn: 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white',
          title: 'text-rose-300',
        }
      : {
          border: 'border-emerald-400',
          glow: 'shadow-[0_0_24px_rgba(52,211,153,0.6)]',
          badge: 'bg-emerald-500 text-slate-950 font-black',
          btn: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950',
          title: 'text-emerald-300',
        };

  // Guidance card position relative to primary target or highlighted 3D board cells
  let cardTop = '50%';
  let cardLeft = '50%';
  let cardTransform = 'translate(-50%, -50%)';

  if (levelId === 2 && level2Step === 6) {
    const hexRect = getHexTargetRect(1, 0) || getHexTargetRect(0, 1);
    if (hexRect) {
      cardTop = `${Math.max(80, Math.min(window.innerHeight - 220, hexRect.top - 100))}px`;
      cardLeft = `${Math.max(320, Math.min(window.innerWidth - 420, hexRect.centerX + 160))}px`;
      cardTransform = 'translateX(-50%)';
    } else {
      cardTop = '32%';
      cardLeft = '54%';
      cardTransform = 'translate(-50%, -50%)';
    }
  } else if (targetRect) {
    if (
      targetSelector?.includes('sidebar') ||
      targetSelector?.includes('lightbulb') ||
      targetSelector?.includes('progress') ||
      targetSelector?.includes('btn-expand') ||
      targetSelector?.includes('mastery')
    ) {
      cardTop = `${Math.max(70, Math.min(window.innerHeight - 220, targetRect.centerY))}px`;
      cardLeft = `${Math.max(310, targetRect.right + 24)}px`;
      cardTransform = 'translateY(-50%)';
    } else if (targetSelector?.includes('tray')) {
      cardTop = `${Math.max(60, targetRect.top - 160)}px`;
      cardLeft = `${Math.max(200, Math.min(window.innerWidth - 400, targetRect.centerX))}px`;
      cardTransform = 'translateX(-50%)';
    } else if (targetHexQ !== null && targetHexR !== null) {
      cardTop = `${Math.max(70, Math.min(window.innerHeight - 220, targetRect.bottom + 16))}px`;
      cardLeft = `${Math.max(300, Math.min(window.innerWidth - 400, targetRect.centerX))}px`;
      cardTransform = 'translateX(-50%)';
    } else {
      cardTop = `${Math.max(70, Math.min(window.innerHeight - 200, targetRect.bottom + 20))}px`;
      cardLeft = `${Math.max(300, Math.min(window.innerWidth - 400, targetRect.centerX))}px`;
      cardTransform = 'translateX(-50%)';
    }
  }

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* Light Clean Ambient Vignette Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />

            {/* Primary Target Cutout */}
            {targetRect && (
              <rect
                x={targetRect.left - 10}
                y={targetRect.top - 10}
                width={targetRect.width + 20}
                height={targetRect.height + 20}
                rx="24"
                ry="24"
                fill="black"
              />
            )}

            {/* Extra Focal Cutouts for Target Zones & Colored Board Hexes */}
            {extraRects.map((focal, idx) => (
              <rect
                key={idx}
                x={focal.rect.left - 8}
                y={focal.rect.top - 8}
                width={focal.rect.width + 16}
                height={focal.rect.height + 16}
                rx="20"
                ry="20"
                fill="black"
              />
            ))}
          </mask>
        </defs>

        {/* Ambient Dimming Overlay (Gentle so HUD is always readable) */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.40)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* Primary Glowing Pulsing Target Halo */}
      {targetRect && (
        <div
          className={`absolute rounded-3xl border-3 ${colorStyles.border} ${colorStyles.glow} pointer-events-none transition-all duration-150 animate-pulse`}
          style={{
            left: targetRect.left - 10,
            top: targetRect.top - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        >
          {/* Target Badge Pin */}
          <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md ${colorStyles.badge} animate-bounce`}
            >
              {badgeLabel}
            </span>
          </div>
        </div>
      )}

      {/* Extra Focal Target Halos (Target Color Zones Checklist & Board Hexes) */}
      {extraRects.map((focal, idx) => (
        <div
          key={idx}
          className={`absolute rounded-2xl border-2 pointer-events-none transition-all duration-150 animate-pulse ${
            focal.color === 'amber'
              ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
              : focal.color === 'emerald'
              ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
              : focal.color === 'purple'
              ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]'
              : focal.color === 'rose'
              ? 'border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.8)]'
              : 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]'
          }`}
          style={{
            left: focal.rect.left - 8,
            top: focal.rect.top - 8,
            width: focal.rect.width + 16,
            height: focal.rect.height + 16,
          }}
        >
          {focal.label && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span
                className={`px-2 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider shadow whitespace-nowrap ${
                  focal.color === 'amber'
                    ? 'bg-amber-400 text-slate-950'
                    : focal.color === 'emerald'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-cyan-400 text-slate-950'
                }`}
              >
                {focal.label}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Floating Guidance Card */}
      <div
        className="absolute pointer-events-auto w-80 sm:w-96 p-4 rounded-3xl bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700 shadow-2xl transition-all duration-200"
        style={{
          top: cardTop,
          left: cardLeft,
          transform: cardTransform,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-slate-800 border border-slate-700 shrink-0">
            {levelId === 6 ? (
              <Crown className="w-5 h-5 text-amber-400" />
            ) : levelId === 20 ? (
              <Waves className="w-5 h-5 text-cyan-400" />
            ) : [9, 12, 15].includes(levelId) ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-black tracking-wide font-rounded ${colorStyles.title}`}>
                {title}
              </h3>
              {levelId === 2 && currentPhaseIndex === 0 && (
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  Step {level2Step}/6
                </span>
              )}
              {levelId === 6 && (
                <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-500/40">
                  Step {level6Step}/3
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Action Buttons inside Card */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            {levelId === 1 && 'Tutorial 1/2'}
            {levelId === 2 && 'Tutorial 2/2'}
            {levelId === 6 && 'Mastery Challenge'}
            {levelId === 20 && 'Riverside Terrain'}
            {[9, 12, 15, 18].includes(levelId) && `Level ${levelId} Mechanic`}
          </span>

          {/* Level 1 Victory Button */}
          {levelId === 1 && hasPlacedCenter && hasPlacedAmberL1 && (
            <button
              onClick={onCompleteTutorialStep}
              className={`px-3.5 py-1.5 ${colorStyles.btn} font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95`}
            >
              <span>Continue to Level 2</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Level 2 Stepper Buttons */}
          {levelId === 2 && currentPhaseIndex === 0 && level2Step < 4 && (
            <button
              onClick={handleAdvanceLevel2}
              className={`px-3.5 py-1.5 ${colorStyles.btn} font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95`}
            >
              <span>
                {level2Step === 1
                  ? 'Next: Target Zones'
                  : level2Step === 2
                  ? 'Next: Watch Auto Demo'
                  : 'Next: Place Yellow (2,0)'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {levelId === 2 && currentPhaseIndex === 1 && (
            <button
              onClick={() => setIsLevelPhase2Dismissed(true)}
              className={`px-3.5 py-1.5 ${colorStyles.btn} font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95`}
            >
              <span>Settle Expansion</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Level 6 Stepper Button */}
          {levelId === 6 && level6Step === 1 && (
            <button
              onClick={handleAdvanceLevel6}
              className={`px-3.5 py-1.5 ${colorStyles.btn} font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95`}
            >
              <span>Remove Stray Tile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {levelId === 6 && level6Step === 3 && (
            <button
              onClick={() => setLevel6Step(4)}
              className={`px-3.5 py-1.5 ${colorStyles.btn} font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95`}
            >
              <span>Start Building</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Penalties & Level 20 Dismiss Buttons */}
          {[9, 12, 15, 18, 20].includes(levelId) && (
            <button
              onClick={() => setIsPenaltyTutorialDismissed(true)}
              className={`px-3.5 py-1.5 ${colorStyles.btn} font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95`}
            >
              <span>Understood</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
