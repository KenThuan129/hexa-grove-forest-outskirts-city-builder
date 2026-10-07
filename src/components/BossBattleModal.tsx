import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  Star,
  Trophy,
  X,
  Play,
  Pause,
  Building,
  Crown,
  Check,
  Zap,
  BarChart3,
  Target,
  ArrowUpRight,
  Gift,
  ArrowDownRight,
  Briefcase,
  Flame,
  CheckCircle2,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { BossBattleStats } from '../types/game';
import { sounds } from '../utils/audio';
import { useLayout } from '../context/LayoutContext';

interface BossBattleModalProps {
  isOpen: boolean;
  bossName: string;
  bossMaxHp?: number;
  bossAtk?: number;
  bossDef?: number;
  bossPopularity?: number;
  bossAmbience?: number;
  playerStats: BossBattleStats;
  onVictory: () => void;
  onDefeat: () => void;
  onClose: () => void;
}

interface CommercialLogEntry {
  id: string;
  round: number;
  category: 'guest' | 'bonus' | 'pace' | 'rival' | 'system';
  title: string;
  description: string;
  revenueDelta?: number;
  guestDelta?: number;
}

type BenefitCategory = 'boost' | 'reduction' | 'pace';

interface BonusOption {
  id: string;
  category: BenefitCategory;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  colorClass: string;
  apply: (ctx: {
    setPlayerPop: React.Dispatch<React.SetStateAction<number>>;
    setPlayerAmb: React.Dispatch<React.SetStateAction<number>>;
    setBossPop: React.Dispatch<React.SetStateAction<number>>;
    setBossAmb: React.Dispatch<React.SetStateAction<number>>;
    setActivePaceEffect: React.Dispatch<React.SetStateAction<string | null>>;
    setPacePhaseActivated: React.Dispatch<React.SetStateAction<number>>;
    currentPhase: number;
  }) => { logTitle: string; logDesc: string };
}

export const BossBattleModal: React.FC<BossBattleModalProps> = ({
  isOpen,
  bossName,
  bossPopularity = 180,
  bossAmbience = 170,
  playerStats,
  onVictory,
  onDefeat,
  onClose,
}) => {
  // Total Market Guests pool
  const TOTAL_MARKET_GUESTS = 500;

  // Player Commercial Vitals
  const [playerPop, setPlayerPop] = useState(playerStats.popularity || 120);
  const [playerAmb, setPlayerAmb] = useState(playerStats.ambience || 110);
  const [playerGuests, setPlayerGuests] = useState(200);
  const [playerRevenue, setPlayerRevenue] = useState(2500);

  // Rival Boss Commercial Vitals
  const [bossPop, setBossPop] = useState(bossPopularity);
  const [bossAmb, setBossAmb] = useState(bossAmbience);
  const [bossGuests, setBossGuests] = useState(300);
  const [bossRevenue, setBossRevenue] = useState(3000);

  // Progress & Round Simulation
  const [round, setRound] = useState(1);
  const [battleProgress, setBattleProgress] = useState(0); // 0 to 100%
  const [battleState, setBattleState] = useState<'ready' | 'running' | 'paused' | 'bonus_modal' | 'victory' | 'defeat'>('ready');
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);

  // Milestone triggers tracking (25%, 55%, 85%)
  const [triggeredMilestones, setTriggeredMilestones] = useState<{ [key: number]: boolean }>({
    25: false,
    55: false,
    85: false,
  });
  const [currentBonusMilestone, setCurrentBonusMilestone] = useState<number | null>(null);

  // Active Pace Definder effects
  // 'off_peak': triggers boost in phases EXCEPT current phase
  // 'rush_hour': triggers strong boost WHILE in current phase
  const [activePaceEffect, setActivePaceEffect] = useState<string | null>(null);
  const [pacePhaseActivated, setPacePhaseActivated] = useState<number>(0);

  // Floating feedback popups
  const [playerFloatText, setPlayerFloatText] = useState<{ text: string; color: string } | null>(null);
  const [bossFloatText, setBossFloatText] = useState<{ text: string; color: string } | null>(null);

  // Commercial Logs
  const [logs, setLogs] = useState<CommercialLogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Bonus selection state (allows picking primary benefit AND Pace Definder synergy)
  const [selectedPrimaryOption, setSelectedPrimaryOption] = useState<BonusOption | null>(null);
  const [selectedPaceOption, setSelectedPaceOption] = useState<BonusOption | null>(null);

  // ── Boss Counter-Attack Tracking (fires once each at 40% and 70%) ──
  const [triggeredBossCounters, setTriggeredBossCounters] = useState<{ [key: number]: boolean }>({
    40: false,
    70: false,
  });

  // Rounds remaining where Executive Order doubles the boss's drain on player vitals
  const [bossPressureRoundsLeft, setBossPressureRoundsLeft] = useState(0);

  // ── Stable refs for countdown auto-return ──────────────────────
  const onVictoryRef = useRef(onVictory);
  onVictoryRef.current = onVictory;
  const onDefeatRef = useRef(onDefeat);
  onDefeatRef.current = onDefeat;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [autoReturnCountdown, setAutoReturnCountdown] = useState<number | null>(null);

  // Initialize or Reset Battle
  useEffect(() => {
    if (isOpen) {
      const initPlayerPop = Math.max(60, playerStats.popularity || 120);
      const initPlayerAmb = Math.max(60, playerStats.ambience || 110);
      setPlayerPop(initPlayerPop);
      setPlayerAmb(initPlayerAmb);

      // Compute initial guest market share from initial stats
      const pRating = initPlayerPop * 1.25 + initPlayerAmb * 0.95;
      const bRating = bossPopularity * 1.25 + bossAmbience * 0.95;
      const initialPlayerShare = Math.round(TOTAL_MARKET_GUESTS * (pRating / (pRating + bRating)));
      const clampedPlayerGuests = Math.max(100, Math.min(TOTAL_MARKET_GUESTS - 100, initialPlayerShare));
      const clampedBossGuests = TOTAL_MARKET_GUESTS - clampedPlayerGuests;

      setPlayerGuests(clampedPlayerGuests);
      setBossGuests(clampedBossGuests);
      setPlayerRevenue(3000);

      setBossPop(bossPopularity);
      setBossAmb(bossAmbience);
      setBossRevenue(3500);

      setRound(1);
      setBattleProgress(0);
      setTriggeredMilestones({ 25: false, 55: false, 85: false });
      setCurrentBonusMilestone(null);
      setActivePaceEffect(null);
      setPacePhaseActivated(0);
      setSelectedPrimaryOption(null);
      setSelectedPaceOption(null);
      setBattleState('ready');

      setLogs([
        {
          id: 'init-1',
          round: 0,
          category: 'system',
          title: 'Commercial Revenue Showdown Commenced!',
          description: `Market rivalry begins vs ${bossName}! Attract staying guests with high Popularity & Ambience. Drop rival Popularity or Ambience to 0 to claim total victory!`,
        },
      ]);

      // Reset boss counter-attack state
      setTriggeredBossCounters({ 40: false, 70: false });
      setBossPressureRoundsLeft(0);
    }
  }, [isOpen, bossName, bossPopularity, bossAmbience, playerStats]);

  // ── Auto-return countdown on victory/defeat ────────────────────
  useEffect(() => {
    if (battleState !== 'victory' && battleState !== 'defeat') {
      setAutoReturnCountdown(null);
      return;
    }

    setAutoReturnCountdown(4);

    const interval = setInterval(() => {
      setAutoReturnCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (battleState === 'victory') {
            onVictoryRef.current();
          } else {
            onDefeatRef.current();
          }
          onCloseRef.current();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [battleState]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Bonus Options Catalog
  // Ordered so the base 3 slots include 1 Boost, 1 Reduction, and 1 Pace Definder,
  // and each extra inspected bonus slot (+1 slot) adds another powerful choice up to 8!
  const ALL_BONUS_OPTIONS: BonusOption[] = [
    // 1. Boost Category: Boost Popularity
    {
      id: 'boost-pop',
      category: 'boost',
      name: 'Celebrity Endorsement',
      subtitle: 'Boost Popularity',
      description: 'Sign high-profile brand ambassadors to draw massive tourist crowds.',
      icon: '⭐',
      badge: '+50 Popularity',
      colorClass: 'border-amber-400 bg-amber-950/70 text-amber-200',
      apply: ({ setPlayerPop }) => {
        setPlayerPop(p => p + 50);
        return {
          logTitle: 'Celebrity Endorsement Signed!',
          logDesc: 'Tourist wave arrives! Player Popularity surged by +50.',
        };
      },
    },
    // 2. Reduction Category: Opponent's Popularity Decrease
    {
      id: 'reduce-pop',
      category: 'reduction',
      name: 'Poach Master Merchants',
      subtitle: "Opponent's Popularity Decrease",
      description: "Recruit the rival's most celebrated artisans and head chefs to your plaza.",
      icon: '📉',
      badge: '-40 Rival Pop',
      colorClass: 'border-rose-400 bg-rose-950/70 text-rose-200',
      apply: ({ setBossPop }) => {
        setBossPop(p => Math.max(0, p - 40));
        return {
          logTitle: 'Head Chefs Poached!',
          logDesc: `Rival lost key attractions! ${bossName}'s Popularity plummeted by -40.`,
        };
      },
    },
    // 3. Pace Definder: While in this phase, trigger Boost
    {
      id: 'pace-rush-hour',
      category: 'pace',
      name: 'Rush Hour Momentum',
      subtitle: 'While in this phase, trigger Boost',
      description: 'Ignites an immediate commercial surge while battling in this specific phase.',
      icon: '🔥',
      badge: 'Phase Surge (+45 Pop & Amb)',
      colorClass: 'border-amber-500 bg-amber-950/90 text-amber-200',
      apply: ({ setPlayerPop, setPlayerAmb, setActivePaceEffect, setPacePhaseActivated, currentPhase }) => {
        setPlayerPop(p => p + 45);
        setPlayerAmb(a => a + 45);
        setActivePaceEffect('rush_hour');
        setPacePhaseActivated(currentPhase);
        return {
          logTitle: 'Rush Hour Momentum Unleashed!',
          logDesc: 'Pace Definder active: Immediate +45 Popularity & +45 Ambience surge during this phase!',
        };
      },
    },
    // 4. Boost Category: Boost Ambience
    {
      id: 'boost-amb',
      category: 'boost',
      name: 'Luxury Fragrance & Acoustics',
      subtitle: 'Boost Ambience',
      description: 'Install crystalline fountains, grand live orchestrations and scenic lighting.',
      icon: '🕯️',
      badge: '+50 Ambience',
      colorClass: 'border-cyan-400 bg-cyan-950/70 text-cyan-200',
      apply: ({ setPlayerAmb }) => {
        setPlayerAmb(a => a + 50);
        return {
          logTitle: 'Ambience Renovation Completed!',
          logDesc: 'Mesmerizing environment created! Player Ambience surged by +50.',
        };
      },
    },
    // 5. Reduction Category: Opponent's Ambience decrease
    {
      id: 'reduce-amb',
      category: 'reduction',
      name: 'Negative Review Campaign',
      subtitle: "Opponent's Ambience decrease",
      description: "Expose maintenance flaws and subpar services at the rival's establishment.",
      icon: '🥀',
      badge: '-40 Rival Amb',
      colorClass: 'border-purple-400 bg-purple-950/70 text-purple-200',
      apply: ({ setBossAmb }) => {
        setBossAmb(a => Math.max(0, a - 40));
        return {
          logTitle: 'Rival Facilities Exposed!',
          logDesc: `Guest complaints surge! ${bossName}'s Ambience plummeted by -40.`,
        };
      },
    },
    // 6. Pace Definder: Except current phase, trigger Boost
    {
      id: 'pace-off-peak',
      category: 'pace',
      name: 'Off-Peak Catalyst',
      subtitle: 'Except current phase, trigger Boost',
      description: 'Seeds a compounding strategic pipeline that boosts your stats in all phases except this one.',
      icon: '⚡',
      badge: 'Other Phases (+12 Pop & Amb)',
      colorClass: 'border-indigo-400 bg-indigo-950/80 text-indigo-200',
      apply: ({ setActivePaceEffect, setPacePhaseActivated, currentPhase }) => {
        setActivePaceEffect('off_peak');
        setPacePhaseActivated(currentPhase);
        return {
          logTitle: 'Off-Peak Catalyst Primed!',
          logDesc: `Pace Definder active: +12 Pop & Amb will trigger every round in all phases except Phase ${currentPhase}%!`,
        };
      },
    },
    // 7. Boost Category: Boost both
    {
      id: 'boost-both',
      category: 'boost',
      name: 'Grand Imperial Fair',
      subtitle: 'Boost both',
      description: 'Host an extravagant district-wide carnival uniting shopping and luxury.',
      icon: '✨',
      badge: '+35 Pop & +35 Amb',
      colorClass: 'border-emerald-400 bg-emerald-950/70 text-emerald-200',
      apply: ({ setPlayerPop, setPlayerAmb }) => {
        setPlayerPop(p => p + 35);
        setPlayerAmb(a => a + 35);
        return {
          logTitle: 'Grand Imperial Fair Launched!',
          logDesc: 'Both Popularity (+35) and Ambience (+35) boosted simultaneously!',
        };
      },
    },
    // 8. Reduction Category: Opponent's Popularity and Ambience decrease
    {
      id: 'reduce-both',
      category: 'reduction',
      name: 'Hostile Market Squeeze',
      subtitle: "Opponent's Popularity and Ambience decrease",
      description: 'Corner vital local supply chains to undermine your competitor across all fronts.',
      icon: '💥',
      badge: '-28 Rival Pop & Amb',
      colorClass: 'border-red-500 bg-red-950/80 text-red-200',
      apply: ({ setBossPop, setBossAmb }) => {
        setBossPop(p => Math.max(0, p - 28));
        setBossAmb(a => Math.max(0, a - 28));
        return {
          logTitle: 'Hostile Market Squeeze Executed!',
          logDesc: `${bossName}'s Popularity and Ambience both decreased by -28!`,
        };
      },
    },
  ];

  // Number of selectable options presented (base 3, +1 for each inspected bonus slot)
  const availableSlotsCount = Math.min(ALL_BONUS_OPTIONS.length, playerStats.bonusSlots || 3);
  const currentBonusPool = ALL_BONUS_OPTIONS.slice(0, availableSlotsCount);

  // Check Victory / Defeat Conditions (Rule 1 & Rule 3)
  useEffect(() => {
    if (battleState !== 'running' && battleState !== 'ready') return;

    // Rule 3: Conclude the battle once Popularity or Ambience value reaches 0. If BOSS's value drop to 0, player wins!
    if (bossPop <= 0 || bossAmb <= 0) {
      setBattleState('victory');
      sounds.playVictory();
      setLogs(prev => [
        ...prev,
        {
          id: `vic-${Date.now()}`,
          round,
          category: 'system',
          title: '🏆 Commercial Victory Achieved!',
          description: `${bossName}'s ${bossPop <= 0 ? 'Popularity' : 'Ambience'} dropped to 0! Commercial hegemony secured.`,
        },
      ]);
      return;
    }

    if (playerPop <= 0 || playerAmb <= 0) {
      setBattleState('defeat');
      sounds.playWarning();
      setLogs(prev => [
        ...prev,
        {
          id: `def-${Date.now()}`,
          round,
          category: 'system',
          title: '❌ Market Defeat!',
          description: `Your resort's ${playerPop <= 0 ? 'Popularity' : 'Ambience'} dropped to 0! Inspect more colored zones before re-engaging.`,
        },
      ]);
      return;
    }

    // Rule 1: Whoever attracts all guests in staying will win!
    if (playerGuests >= TOTAL_MARKET_GUESTS) {
      setBattleState('victory');
      sounds.playVictory();
      setLogs(prev => [
        ...prev,
        {
          id: `vic-all-${Date.now()}`,
          round,
          category: 'system',
          title: '🏆 Complete Market Monopoly!',
          description: `You attracted 100% of all staying guests in the market (${TOTAL_MARKET_GUESTS}/${TOTAL_MARKET_GUESTS})! Total Victory!`,
        },
      ]);
      return;
    }

    if (bossGuests >= TOTAL_MARKET_GUESTS) {
      setBattleState('defeat');
      sounds.playWarning();
      setLogs(prev => [
        ...prev,
        {
          id: `def-all-${Date.now()}`,
          round,
          category: 'system',
          title: '❌ Total Market Loss!',
          description: `${bossName} captured all market guests (${TOTAL_MARKET_GUESTS}/${TOTAL_MARKET_GUESTS})!`,
        },
      ]);
      return;
    }

    // Conclude at 100% progress based on guests staying
    if (battleProgress >= 100) {
      if (playerGuests > bossGuests) {
        setBattleState('victory');
        sounds.playVictory();
      } else {
        setBattleState('defeat');
        sounds.playWarning();
      }
    }
  }, [bossPop, bossAmb, playerPop, playerAmb, battleProgress, playerGuests, bossGuests, bossName, round, battleState]);

  // Execute a Simulation Turn / Round
  const executeSimulationTurn = () => {
    if (battleState !== 'running') return;

    // Check Milestone Triggers: 25%, 55%, 85% (Rule 2)
    const nextProgress = Math.min(100, battleProgress + 5);

    const milestones = [25, 55, 85];
    for (const ms of milestones) {
      if (battleProgress < ms && nextProgress >= ms && !triggeredMilestones[ms]) {
        setBattleProgress(ms);
        setTriggeredMilestones(prev => ({ ...prev, [ms]: true }));
        setCurrentBonusMilestone(ms);
        setBattleState('bonus_modal');
        setSelectedPrimaryOption(null);
        setSelectedPaceOption(null);
        sounds.playZoneComplete();
        return;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // BOSS COUNTER-ATTACKS (40% and 70%)
    // ══════════════════════════════════════════════════════════════════
    const bossCounterThresholds = [40, 70];
    for (const threshold of bossCounterThresholds) {
      if (battleProgress < threshold && nextProgress >= threshold && !triggeredBossCounters[threshold]) {
        // Freeze progress at the threshold so the counter lands on the mark
        setBattleProgress(threshold);
        setTriggeredBossCounters(prev => ({ ...prev, [threshold]: true }));

        const nextRound = round + 1;
        setRound(nextRound);

        if (threshold === 40) {
          // ── Counter 1: Executive Order ──
          // Boss gains +50 Pop & +50 Amb, and doubles drain pressure for 3 rounds
          setBossPop(p => p + 50);
          setBossAmb(a => a + 50);
          setBossPressureRoundsLeft(3);

          setBossFloatText({
            text: '⚡ EXECUTIVE ORDER! +50 Pop / +50 Amb',
            color: 'text-rose-300 font-black',
          });
          setTimeout(() => setBossFloatText(null), 1400);

          sounds.playWarning();

          setLogs(prev => [
            ...prev,
            {
              id: `boss-counter-40-${Date.now()}`,
              round: nextRound,
              category: 'rival',
              title: `👑 ${bossName} — Executive Order!`,
              description: `Global partnership announced! Rival gains +50 Popularity and +50 Ambience. Market pressure doubles for the next 3 rounds.`,
            },
          ]);
        } else if (threshold === 70) {
          // ── Counter 2: Hostile Takeover ──
          // Boss steals 40 guests and cancels any active Pace Definder
          const stolenGuests = 40;
          setPlayerGuests(g => Math.max(0, g - stolenGuests));
          setBossGuests(g => Math.min(TOTAL_MARKET_GUESTS, g + stolenGuests));

          const hadPace = Boolean(activePaceEffect);
          setActivePaceEffect(null);
          setPacePhaseActivated(0);

          setPlayerFloatText({
            text: `💀 -${stolenGuests} Guests stolen!`,
            color: 'text-rose-300 font-black',
          });
          setBossFloatText({
            text: `+${stolenGuests} Guests!`,
            color: 'text-emerald-300 font-black',
          });
          setTimeout(() => {
            setPlayerFloatText(null);
            setBossFloatText(null);
          }, 1400);

          sounds.playWarning();

          setLogs(prev => [
            ...prev,
            {
              id: `boss-counter-70-${Date.now()}`,
              round: nextRound,
              category: 'rival',
              title: `👑 ${bossName} — Hostile Takeover!`,
              description: `Aggressive acquisition! ${stolenGuests} of your guests were poached${hadPace ? ' and your active Pace Definder was cancelled' : ''
                }.`,
            },
          ]);
        }

        // Exit the tick — the counter resolves this round on its own
        return;
      }
    }
    // ══════════════════════════════════════════════════════════════════

    setBattleProgress(nextProgress);
    const nextRound = round + 1;
    setRound(nextRound);

    // Current phase category: 0-25% = Phase 1, 26-55% = Phase 2, 56-85% = Phase 3, 86-100% = Phase 4
    const currentBattleMilestoneZone =
      nextProgress < 25 ? 0 : nextProgress < 55 ? 25 : nextProgress < 85 ? 55 : 85;

    // 1. Guest Migration Calculation based on Popularity & Ambience (Rule 1)
    const playerTotalRating = playerPop * 1.25 + playerAmb * 0.95;
    const bossTotalRating = bossPop * 1.25 + bossAmb * 0.95;
    const totalMarketRating = Math.max(1, playerTotalRating + bossTotalRating);

    const targetPlayerGuestShare = Math.round(TOTAL_MARKET_GUESTS * (playerTotalRating / totalMarketRating));
    const guestShiftSpeed = 16;
    const guestDelta = Math.round((targetPlayerGuestShare - playerGuests) * 0.32);
    const clampedGuestDelta = Math.max(-guestShiftSpeed, Math.min(guestShiftSpeed, guestDelta));

    const newPlayerGuests = Math.max(0, Math.min(TOTAL_MARKET_GUESTS, playerGuests + clampedGuestDelta));
    const newBossGuests = TOTAL_MARKET_GUESTS - newPlayerGuests;

    setPlayerGuests(newPlayerGuests);
    setBossGuests(newBossGuests);

    // 2. Revenue Generation based on staying guests
    const roundRevenue = Math.round(newPlayerGuests * 25 + playerAmb * 5);
    const bossRoundRevenue = Math.round(newBossGuests * 25 + bossAmb * 5);

    setPlayerRevenue(r => r + roundRevenue);
    setBossRevenue(r => r + bossRoundRevenue);

    // 3. Ambience & Popularity Competitive Pressure
    // Higher values erode opponent's vitals toward 0 (Rule 3)
    let bossPopDrain = 0;
    let bossAmbDrain = 0;
    if (playerAmb > bossAmb) {
      const ambAdvantage = Math.round((playerAmb - bossAmb) * 0.08);
      bossAmbDrain = Math.max(1, ambAdvantage);
      setBossAmb(b => Math.max(0, b - bossAmbDrain));
    }
    if (playerPop > bossPop) {
      const popAdvantage = Math.round((playerPop - bossPop) * 0.08);
      bossPopDrain = Math.max(1, popAdvantage);
      setBossPop(b => Math.max(0, b - bossPopDrain));
    }

    // Rival Counter-action
    const pressureMultiplier = bossPressureRoundsLeft > 0 ? 2 : 1;

    let playerPopDrain = 0;
    if (bossPop > playerPop) {
      playerPopDrain = Math.max(1, Math.round((bossPop - playerPop) * 0.06 * pressureMultiplier));
      setPlayerPop(p => Math.max(0, p - playerPopDrain));
    }

    let playerAmbDrain = 0;
    if (bossAmb > playerAmb) {
      playerAmbDrain = Math.max(1, Math.round((bossAmb - playerAmb) * 0.06 * pressureMultiplier));
      setPlayerAmb(a => Math.max(0, a - playerAmbDrain));
    }

    // Decrement pressure counter at end of round
    if (bossPressureRoundsLeft > 0) {
      setBossPressureRoundsLeft(r => r - 1);
    }

    // 4. Pace Definder Passive Processing
    let paceDescription = '';
    if (activePaceEffect === 'off_peak') {
      // Triggers boost in phases EXCEPT current phase it was activated in
      if (currentBattleMilestoneZone !== pacePhaseActivated) {
        setPlayerPop(p => p + 6);
        setPlayerAmb(a => a + 6);
        paceDescription = ' · [Off-Peak Catalyst: +6 Pop & Amb]';
      }
    } else if (activePaceEffect === 'rush_hour') {
      // While in current phase, triggers extra momentum
      if (currentBattleMilestoneZone === pacePhaseActivated) {
        setPlayerPop(p => p + 4);
        setPlayerAmb(a => a + 4);
        paceDescription = ' · [Rush Hour Surge: +4 Pop & Amb]';
      }
    }

    // Float notifications
    if (clampedGuestDelta > 0) {
      setPlayerFloatText({ text: `+${clampedGuestDelta} Guests · +$${roundRevenue.toLocaleString()}`, color: 'text-emerald-400' });
      setBossFloatText({ text: `-${clampedGuestDelta} Guests`, color: 'text-rose-400' });
    } else if (clampedGuestDelta < 0) {
      setPlayerFloatText({ text: `${clampedGuestDelta} Guests · +$${roundRevenue.toLocaleString()}`, color: 'text-amber-400' });
      setBossFloatText({ text: `+${Math.abs(clampedGuestDelta)} Guests`, color: 'text-emerald-400' });
    } else {
      setPlayerFloatText({ text: `+$${roundRevenue.toLocaleString()}`, color: 'text-amber-300' });
    }

    setTimeout(() => {
      setPlayerFloatText(null);
      setBossFloatText(null);
    }, 1100);

    sounds.playPlace(true);

    // Log Entry
    const newLog: CommercialLogEntry = {
      id: `round-${nextRound}-${Date.now()}`,
      round: nextRound,
      category: 'guest',
      title: `Quarterly Ticker · Round ${nextRound}`,
      description: `Guests staying: You ${newPlayerGuests} vs Rival ${newBossGuests}. Revenue earned: +$${roundRevenue.toLocaleString()}.${bossAmbDrain > 0 || bossPopDrain > 0 ? ` Luxury pressure eroded Rival ratings (-${bossPopDrain + bossAmbDrain} pts).` : ''
        }${bossPressureRoundsLeft > 0 ? ` ⚠️ Executive Order pressure active (${bossPressureRoundsLeft} rounds left).` : ''
        }${playerPopDrain > 0 || playerAmbDrain > 0 ? ` Rival counter-pressure eroded your ratings (-${playerPopDrain + playerAmbDrain} pts).` : ''
        }${paceDescription}`,
      revenueDelta: roundRevenue,
      guestDelta: clampedGuestDelta,
    };

    setLogs(prev => [...prev, newLog]);
  };

  // Timer loop for simulation
  useEffect(() => {
    if (battleState !== 'running') return;
    const intervalTime = 1000 / speedMultiplier;
    const timer = setInterval(() => {
      executeSimulationTurn();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [battleState, speedMultiplier, battleProgress, round, playerPop, playerAmb, bossPop, bossAmb, playerGuests, bossGuests, activePaceEffect, pacePhaseActivated]);

  // Handle Confirming Bonus Phase Choices (Rule 2)
  const handleConfirmBonus = () => {
    if (!selectedPrimaryOption && !selectedPaceOption) return;

    const appliedDescriptions: string[] = [];

    // Apply Primary Benefit (Boost or Reduction)
    if (selectedPrimaryOption) {
      const res = selectedPrimaryOption.apply({
        setPlayerPop,
        setPlayerAmb,
        setBossPop,
        setBossAmb,
        setActivePaceEffect,
        setPacePhaseActivated,
        currentPhase: currentBonusMilestone || 25,
      });
      appliedDescriptions.push(`${selectedPrimaryOption.name}: ${res.logDesc}`);
    }

    // Apply Pace Definder Synergy (can coexist with Boost/Reduction)
    if (selectedPaceOption) {
      const res = selectedPaceOption.apply({
        setPlayerPop,
        setPlayerAmb,
        setBossPop,
        setBossAmb,
        setActivePaceEffect,
        setPacePhaseActivated,
        currentPhase: currentBonusMilestone || 25,
      });
      appliedDescriptions.push(`${selectedPaceOption.name}: ${res.logDesc}`);
    }

    sounds.playVictory();

    setLogs(prev => [
      ...prev,
      {
        id: `bonus-${Date.now()}`,
        round,
        category: 'bonus',
        title: `🎁 ${currentBonusMilestone}% Milestone Bonus Activated!`,
        description: appliedDescriptions.join(' | '),
      },
    ]);

    // Resume Battle
    setBattleState('running');
    setCurrentBonusMilestone(null);
  };

  const layout = useLayout();
  const isMobile = layout.useMobileLayout;

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
        <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c120c] via-[#241710] to-[#120b07] rounded-3xl border-2 border-[#e6b15c]/60 shadow-[0_0_50px_rgba(230,177,92,0.25)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#2c1a0e] via-[#3a2213] to-[#2c1a0e] border-b border-[#e6b15c]/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="text-[9px] text-amber-400 font-mono font-black uppercase tracking-widest">
                  BUSINESS SHOWDOWN
                </div>
                <h2 className="text-xs font-black text-[#f4ecd8] truncate max-w-[180px]">
                  vs. {bossName}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/40 hover:bg-black/70 text-[#f4ecd8]/80 hover:text-white transition-all cursor-pointer border border-amber-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-4 py-2 bg-[#140d08] border-b border-[#5c3d2e] shrink-0">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
              <span className="text-amber-400">Battle Progress</span>
              <span className="text-slate-300">{battleProgress}%</span>
            </div>
            <div className="relative w-full h-2.5 bg-black/60 rounded-full border border-amber-900/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${battleProgress}%` }}
              />
            </div>
          </div>

          {/* Cards area */}
          <div className="p-4 flex flex-col gap-3">
            {/* Player card */}
            <div className="relative p-3 rounded-2xl bg-gradient-to-b from-[#1e3520] to-[#122214] border-2 border-emerald-500/60 shadow-lg">
              {playerFloatText && (
                <div className={`absolute -top-2 right-3 text-[11px] font-black animate-bounce ${playerFloatText.color}`}>
                  {playerFloatText.text}
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏰</span>
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
                    YOUR RESORT
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-300 font-mono text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{playerGuests}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] text-amber-300 font-mono font-bold flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> POP
                  </span>
                  <span className="text-sm font-black text-white font-mono">{playerPop}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-cyan-300 font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AMB
                  </span>
                  <span className="text-sm font-black text-white font-mono">{playerAmb}</span>
                </div>
              </div>

              {activePaceEffect && (
                <div className="mt-2 px-2 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/50 text-[9px] font-bold text-indigo-300">
                  ⚡ {activePaceEffect === 'off_peak' ? 'Off-Peak' : 'Rush Hour'} active
                </div>
              )}
            </div>

            {/* Rival card */}
            <div className="relative p-3 rounded-2xl bg-gradient-to-b from-[#3a1812] to-[#200c08] border-2 border-rose-500/60 shadow-lg">
              {bossFloatText && (
                <div className={`absolute -top-2 right-3 text-[11px] font-black animate-bounce ${bossFloatText.color}`}>
                  {bossFloatText.text}
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎩</span>
                  <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-wider truncate max-w-[140px]">
                    {bossName.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-rose-300 font-mono text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{bossGuests}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] text-amber-300 font-mono font-bold flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> POP
                  </span>
                  <span className="text-sm font-black text-white font-mono">{bossPop}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-cyan-300 font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AMB
                  </span>
                  <span className="text-sm font-black text-white font-mono">{bossAmb}</span>
                </div>
              </div>

              {bossPressureRoundsLeft > 0 && (
                <div className="mt-2 px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-500/60 text-[9px] font-bold text-rose-300 animate-pulse">
                  ⚡ Executive Order Active · {bossPressureRoundsLeft}r
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 pb-4 flex items-center gap-2 shrink-0">
            {battleState === 'running' ? (
              <button
                onClick={() => setBattleState('paused')}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg active:translate-y-[1px] transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : battleState === 'ready' || battleState === 'paused' ? (
              <button
                onClick={() => setBattleState('running')}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black shadow-lg active:translate-y-[1px] transition-all cursor-pointer animate-pulse"
              >
                <Play className="w-4 h-4" />
                <span>{battleState === 'ready' ? 'Start Battle' : 'Resume'}</span>
              </button>
            ) : null}

            <button
              onClick={() => setSpeedMultiplier(speedMultiplier === 4 ? 1 : 4)}
              className={`px-4 py-3 rounded-2xl font-black text-xs shadow-lg active:translate-y-[1px] transition-all cursor-pointer ${speedMultiplier === 4
                ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white'
                : 'bg-[#2b1a11] border-2 border-[#5c3d2e] text-amber-300'
                }`}
            >
              <Zap className="w-4 h-4 inline" />
              <span className="ml-1 font-mono">{speedMultiplier}x</span>
            </button>
          </div>

          {/* Milestone overlay */}
          {battleState === 'bonus_modal' && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
              {/* Header — fixed */}
              <div className="shrink-0 px-4 pt-4 pb-3 text-center border-b border-amber-500/30">
                <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest mb-1">
                  Milestone {currentBonusMilestone}% Reached
                </div>
                <h3 className="text-base font-black text-white">Choose Your Benefits</h3>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Swipe to browse · Tap to select
                </p>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-3">
                {/* ── Primary Benefit carousel ── */}
                <div>
                  <div className="text-[9.5px] font-mono font-black text-amber-300 uppercase tracking-widest mb-2">
                    Primary Benefit
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-3 px-3 no-scrollbar">
                    {currentBonusPool
                      .filter(o => o.category !== 'pace')
                      .map(opt => {
                        const isSelected = selectedPrimaryOption?.id === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSelectedPrimaryOption(prev => prev?.id === opt.id ? null : opt);
                              sounds.playPlace(true);
                            }}
                            className={`snap-center shrink-0 w-[78vw] max-w-[300px] p-3 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all active:scale-[0.98] ${isSelected
                              ? 'border-amber-400 bg-amber-950/90 shadow-[0_0_18px_rgba(251,191,36,0.45)]'
                              : `${opt.colorClass} hover:border-white/60`
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-3xl shrink-0">{opt.icon}</span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-[9px] font-mono font-black uppercase tracking-wider text-amber-300">
                                {opt.subtitle}
                              </div>
                              <div className="text-sm font-black text-white mt-0.5">
                                {opt.name}
                              </div>
                            </div>
                            <div className="text-[10.5px] text-slate-300 leading-snug line-clamp-2">
                              {opt.description}
                            </div>
                            <div className="mt-auto pt-1.5 border-t border-white/10 text-[10px] font-mono font-bold text-amber-300">
                              {opt.badge}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* ── Pace Definder carousel ── */}
                <div>
                  <div className="text-[9.5px] font-mono font-black text-indigo-300 uppercase tracking-widest mb-2">
                    Pace Definder (Optional)
                  </div>
                  {currentBonusPool.filter(o => o.category === 'pace').length > 0 ? (
                    <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-3 px-3 no-scrollbar">
                      {currentBonusPool
                        .filter(o => o.category === 'pace')
                        .map(opt => {
                          const isSelected = selectedPaceOption?.id === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setSelectedPaceOption(prev => prev?.id === opt.id ? null : opt);
                                sounds.playPlace(true);
                              }}
                              className={`snap-center shrink-0 w-[78vw] max-w-[300px] p-3 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all active:scale-[0.98] ${isSelected
                                ? 'border-indigo-400 bg-indigo-950/90 shadow-[0_0_18px_rgba(99,102,241,0.45)]'
                                : `${opt.colorClass} hover:border-white/60`
                                }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="text-3xl shrink-0">{opt.icon}</span>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-indigo-400 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-[9px] font-mono font-black uppercase tracking-wider text-indigo-300">
                                  {opt.subtitle}
                                </div>
                                <div className="text-sm font-black text-white mt-0.5">
                                  {opt.name}
                                </div>
                              </div>
                              <div className="text-[10.5px] text-slate-300 leading-snug line-clamp-2">
                                {opt.description}
                              </div>
                              <div className="mt-auto pt-1.5 border-t border-white/10 text-[10px] font-mono font-bold text-indigo-300">
                                {opt.badge}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 italic text-center py-3">
                      No Pace options available this milestone
                    </div>
                  )}
                </div>
              </div>

              {/* Footer — fixed confirm button */}
              <div className="shrink-0 px-3 py-3 border-t border-amber-500/30 bg-black/60">
                <div className="text-[10px] font-mono text-slate-300 mb-2 flex items-center gap-1.5 flex-wrap">
                  <span>Selected:</span>
                  <span className="font-bold text-amber-300">
                    {[selectedPrimaryOption?.name, selectedPaceOption?.name].filter(Boolean).join(' + ') || 'None'}
                  </span>
                  {selectedPrimaryOption && selectedPaceOption && (
                    <span className="text-[9px] text-emerald-400 font-bold">
                      · Synergy ✓
                    </span>
                  )}
                </div>
                <button
                  onClick={handleConfirmBonus}
                  disabled={!selectedPrimaryOption && !selectedPaceOption}
                  className={`w-full py-3 rounded-2xl text-xs font-black shadow-lg active:translate-y-[1px] transition-all ${selectedPrimaryOption || selectedPaceOption
                    ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Confirm & Resume
                </button>
              </div>
            </div>
          )}

          {/* Victory overlay */}
          {battleState === 'victory' && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-gradient-to-b from-[#1e3520] via-[#162718] to-[#0c160e] border-2 border-emerald-400 rounded-3xl p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-2xl animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest">
                    COMMERCIAL HEGEMONY
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">Victory!</h3>
                  <p className="text-[11px] text-emerald-200/90 mt-1">
                    {bossPop <= 0 || bossAmb <= 0
                      ? `${bossName}'s commercial standing collapsed to 0.`
                      : `You captured the entire market with ${playerGuests} guests!`}
                  </p>
                </div>
                <div className="w-full grid grid-cols-2 gap-2 text-[10px] font-mono bg-black/50 p-2.5 rounded-2xl border border-emerald-500/30">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400">Revenue</span>
                    <span className="text-xs font-black text-amber-300">${playerRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400">Guests</span>
                    <span className="text-xs font-black text-emerald-400">{playerGuests}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onVictory();
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-400 text-slate-950 font-black text-sm shadow-xl active:translate-y-[1px] transition-all cursor-pointer"
                >
                  Claim Victory & Advance
                  {autoReturnCountdown !== null && (
                    <span className="ml-1.5 text-[10px] bg-slate-950/30 px-1.5 py-0.5 rounded-full">
                      {autoReturnCountdown}s
                    </span>
                  )}
                </button>

                <div className="text-[9.5px] text-emerald-300/70 font-serif italic">
                  Auto-advancing in {autoReturnCountdown ?? 4}s…
                </div>
              </div>
            </div>
          )}

          {/* Defeat overlay */}
          {battleState === 'defeat' && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-gradient-to-b from-[#3a1510] via-[#240c09] to-[#120504] border-2 border-rose-500 rounded-3xl p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-3xl bg-rose-600 flex items-center justify-center text-white shadow-2xl">
                  <X className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest">
                    MARKET OVERWHELMED
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">Defeat</h3>
                  <p className="text-[11px] text-rose-200/90 mt-1">
                    {bossName} captured market dominance.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onDefeat();
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-xs shadow-xl active:translate-y-[1px] transition-all cursor-pointer"
                >
                  Return to Board
                  {autoReturnCountdown !== null && (
                    <span className="ml-1.5 text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded-full">
                      {autoReturnCountdown}s
                    </span>
                  )}
                </button>

                <div className="text-[9.5px] text-rose-300/70 font-serif italic">
                  Auto-returning in {autoReturnCountdown ?? 4}s…
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#1c120c] via-[#241710] to-[#120b07] rounded-3xl border-2 border-[#e6b15c]/60 shadow-[0_0_50px_rgba(230,177,92,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-[#f4ecd8]">

        {/* TOP BANNER */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#2c1a0e] via-[#3a2213] to-[#2c1a0e] border-b border-[#e6b15c]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg text-slate-950 font-black">
              <Briefcase className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-mono font-bold">
                <span className="uppercase tracking-widest">BUSINESS SHOWDOWN</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-200/90 font-medium">REVENUE BATTLE</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#f4ecd8] tracking-tight">
                Commercial Supremacy vs. {bossName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/70 text-[#f4ecd8]/80 hover:text-white transition-all cursor-pointer border border-amber-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BATTLE PROGRESS BAR (With 25%, 55%, 85% Milestone Bonus Flags) */}
        <div className="px-6 py-2.5 bg-[#140d08] border-b border-[#5c3d2e] flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Battle Progress</span>
            </span>
            <span className="text-slate-300">{battleProgress}%</span>
          </div>

          <div className="relative w-full h-3 bg-black/60 rounded-full border border-amber-900/60 overflow-visible">
            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${battleProgress}%` }}
            />

            {/* 25% Flag */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[25%] -translate-x-1/2 flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${triggeredMilestones[25]
                  ? 'bg-emerald-500 border-white text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-amber-900 border-amber-400 text-amber-200'
                  }`}
                title="Bonus Phase 1 (25%)"
              >
                <Gift className="w-2.5 h-2.5" />
              </div>
              <span className="text-[8px] font-mono font-bold text-amber-400/90 mt-2">25%</span>
            </div>

            {/* 55% Flag */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[55%] -translate-x-1/2 flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${triggeredMilestones[55]
                  ? 'bg-emerald-500 border-white text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-amber-900 border-amber-400 text-amber-200'
                  }`}
                title="Bonus Phase 2 (55%)"
              >
                <Gift className="w-2.5 h-2.5" />
              </div>
              <span className="text-[8px] font-mono font-bold text-amber-400/90 mt-2">55%</span>
            </div>

            {/* 85% Flag */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[85%] -translate-x-1/2 flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${triggeredMilestones[85]
                  ? 'bg-emerald-500 border-white text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-amber-900 border-amber-400 text-amber-200'
                  }`}
                title="Bonus Phase 3 (85%)"
              >
                <Gift className="w-2.5 h-2.5" />
              </div>
              <span className="text-[8px] font-mono font-bold text-amber-400/90 mt-2">85%</span>
            </div>
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMNS (Showdown Arena & Live Logs) */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* LEFT: 1v1 COMMERCIAL SHOWDOWN ARENA (7 Cols) */}
          <div className="md:col-span-7 flex flex-col gap-4">

            {/* GUEST ATTRACTION BAR (Rule 1: Whoever attracts all guests in staying wins) */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Your Guests: {playerGuests}</span>
                </span>
                <span className="text-slate-400 text-[10px]">
                  Total Market: {TOTAL_MARKET_GUESTS} Guests
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <span>Rival Guests: {bossGuests}</span>
                  <Users className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Guest Distribution Bar */}
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-amber-500/20 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 flex items-center justify-end px-1.5 text-[9px] font-black text-slate-950"
                  style={{ width: `${(playerGuests / TOTAL_MARKET_GUESTS) * 100}%` }}
                >
                  {Math.round((playerGuests / TOTAL_MARKET_GUESTS) * 100)}%
                </div>
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-500 flex items-center justify-start px-1.5 text-[9px] font-black text-white"
                  style={{ width: `${(bossGuests / TOTAL_MARKET_GUESTS) * 100}%` }}
                >
                  {Math.round((bossGuests / TOTAL_MARKET_GUESTS) * 100)}%
                </div>
              </div>

              <div className="text-[9.5px] font-mono text-center text-amber-200/80">
                Rule 1: Attract all {TOTAL_MARKET_GUESTS} staying guests to win immediately!
              </div>
            </div>

            {/* DUAL COMBATANTS: PLAYER vs RIVAL */}
            <div className="grid grid-cols-2 gap-3.5">

              {/* PLAYER CARD */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#1e3520] to-[#122214] border-2 border-emerald-500/60 shadow-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏰</span>
                    <div>
                      <div className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
                        YOUR RESORT
                      </div>
                      <div className="text-xs font-bold text-white">Grand Pioneer Plaza</div>
                    </div>
                  </div>
                </div>

                {playerStats.zonesFulfilled > 0 && (
                  <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/60 text-[10px] font-black text-amber-200 flex items-center justify-between animate-pulse">
                    <span>🔮 SYNTHESIA ×{playerStats.synthesiaMultiplier.toFixed(2)}</span>
                    <span className="font-mono text-emerald-300">
                      {playerStats.zonesFulfilled} zone{playerStats.zonesFulfilled === 1 ? '' : 's'}
                    </span>
                  </div>
                )}

                {/* Floating Feedback */}
                {playerFloatText && (
                  <div className={`absolute top-2 right-2 text-xs font-black animate-bounce ${playerFloatText.color}`}>
                    {playerFloatText.text}
                  </div>
                )}

                {/* Revenue Counter */}
                <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Revenue</span>
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    ${playerRevenue.toLocaleString()}
                  </span>
                </div>

                {/* Popularity Gauge */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono font-bold">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>Popularity</span>
                    </span>
                    <span className="text-white">{playerPop}</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-amber-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (playerPop / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Ambience Gauge */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono font-bold">
                    <span className="text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Ambience</span>
                    </span>
                    <span className="text-white">{playerAmb}</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (playerAmb / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Bonus Slots Info */}
                <div className="text-[10px] font-mono text-emerald-200/80 flex items-center justify-between pt-1 border-t border-emerald-500/20">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3 text-emerald-400" />
                    <span>Bonus Slots:</span>
                  </span>
                  <span className="font-bold text-amber-300">{playerStats.bonusSlots || 3} Slots</span>
                </div>
              </div>

              {/* RIVAL BOSS CARD */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#3a1812] to-[#200c08] border-2 border-rose-500/60 shadow-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎩</span>
                    <div>
                      <div className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-wider">
                        RIVAL BUSINESS
                      </div>
                      <div className="text-xs font-bold text-white">{bossName}</div>
                    </div>
                  </div>
                </div>

                {/* Floating Feedback */}
                {bossFloatText && (
                  <div className={`absolute top-2 right-2 text-xs font-black animate-bounce ${bossFloatText.color}`}>
                    {bossFloatText.text}
                  </div>
                )}

                {/* Revenue Counter */}
                <div className="p-2 rounded-xl bg-black/40 border border-rose-500/30 flex items-center justify-between">
                  <span className="text-[10px] text-rose-300 font-mono font-bold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                    <span>Revenue</span>
                  </span>
                  <span className="text-sm font-mono font-black text-rose-200">
                    ${bossRevenue.toLocaleString()}
                  </span>
                </div>

                {/* Popularity Gauge */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono font-bold">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>Popularity</span>
                    </span>
                    <span className="text-white">{bossPop}</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-amber-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (bossPop / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Ambience Gauge */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono font-bold">
                    <span className="text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Ambience</span>
                    </span>
                    <span className="text-white">{bossAmb}</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (bossAmb / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Rule 3 Note */}
                <div className="text-[9px] font-mono text-rose-300/80 flex items-center justify-between pt-1 border-t border-rose-500/20">
                  <span>Win Condition:</span>
                  <span className="font-bold text-amber-300">Drop Boss Pop or Amb to 0</span>
                </div>
                {bossPressureRoundsLeft > 0 && (
                  <div className="mt-1.5 px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 text-[9.5px] font-bold animate-pulse">
                    ⚡ Executive Order Active · {bossPressureRoundsLeft} rounds of doubled drain!
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLS & SPEED BAR */}
            <div className="p-3 rounded-2xl bg-[#1a110a] border border-[#5c3d2e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {battleState === 'running' ? (
                  <button
                    onClick={() => setBattleState('paused')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black shadow transition-all cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : battleState === 'ready' || battleState === 'paused' ? (
                  <button
                    onClick={() => setBattleState('running')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer animate-pulse"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{battleState === 'ready' ? 'Start Revenue Battle' : 'Resume'}</span>
                  </button>
                ) : null}

                {/* Manual Step Next Round */}
                {(battleState === 'ready' || battleState === 'paused') && (
                  <button
                    onClick={() => {
                      setBattleState('running');
                      setTimeout(() => executeSimulationTurn(), 50);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-xs font-mono font-bold text-slate-300 border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <span>Next Round ➔</span>
                  </button>
                )}
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-amber-500/20">
                <span className="text-[10px] font-mono text-slate-400 px-1">Speed:</span>
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s as 1 | 2 | 4)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${speedMultiplier === s
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIVE PACE DEFINDER STATUS (if active) */}
            {activePaceEffect && (
              <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-500/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <span className="font-bold text-indigo-300">
                      Pace Definder Synergy Active: {activePaceEffect === 'off_peak' ? 'Off-Peak Catalyst' : 'Rush Hour Momentum'}
                    </span>
                    <p className="text-[10.5px] text-indigo-200/80">
                      {activePaceEffect === 'off_peak'
                        ? `Triggers +12 Pop & Amb in all phases except Phase ${pacePhaseActivated}%.`
                        : 'Immediate massive phase surge activated!'}
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-mono font-bold text-indigo-300">
                  COEXISTING WITH BENEFIT
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE COMMERCIAL LOGS (5 Cols) */}
          <div className="md:col-span-5 flex flex-col gap-2.5 bg-black/40 rounded-2xl border border-amber-500/20 p-3.5 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-[#5c3d2e]">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Commercial Market Ticker</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Round {round}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {logs.map(log => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${log.category === 'bonus'
                    ? 'bg-amber-950/80 border-amber-400/70 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : log.category === 'system'
                      ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
                      : 'bg-[#18110b] border-amber-900/40 text-[#f4ecd8]/90'
                    }`}
                >
                  <div className="flex items-center justify-between font-bold mb-0.5">
                    <span className="text-amber-300 font-mono text-[10px]">{log.title}</span>
                    {log.revenueDelta && (
                      <span className="text-emerald-400 font-mono text-[9.5px]">
                        +${log.revenueDelta.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-snug">{log.description}</p>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE BONUS BREAKTHROUGH MODAL (25%, 55%, 85%) (Rule 2) */}
        {/* ========================================================================= */}
        {battleState === 'bonus_modal' && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#241710] to-[#140c08] border-2 border-amber-400 rounded-3xl p-5 shadow-[0_0_40px_rgba(251,191,36,0.35)] flex flex-col gap-3.5 text-[#f4ecd8] max-h-[92vh] overflow-y-auto">

              {/* Header */}
              <div className="text-center flex flex-col items-center gap-1 pb-2 border-b border-amber-500/30">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center shadow-lg">
                  <Gift className="w-6 h-6 text-slate-950" />
                </div>
                <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                  MILESTONE REACHED: {currentBonusMilestone}% BATTLE PROGRESS
                </div>
                <h3 className="text-xl font-black text-white">Commercial Bonus Breakthrough!</h3>
                <p className="text-xs text-slate-300 max-w-lg">
                  Choose your market benefits from the 3 main categories. You have{' '}
                  <span className="font-bold text-amber-300">{availableSlotsCount} Bonus Slots</span> available!
                </p>
                <div className="text-[10.5px] font-mono text-emerald-300 font-medium">
                  Rule 2: You can choose 1 Primary Benefit (Boost or Reduction) <span className="font-bold text-white">AND</span> 1 Pace Definder to coexist and synergize!
                </div>
              </div>

              {/* CATEGORIES SELECTION GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {currentBonusPool.map(opt => {
                  const isPrimarySelected = selectedPrimaryOption?.id === opt.id;
                  const isPaceSelected = selectedPaceOption?.id === opt.id;
                  const isSelected = isPrimarySelected || isPaceSelected;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (opt.category === 'pace') {
                          setSelectedPaceOption(prev => (prev?.id === opt.id ? null : opt));
                        } else {
                          setSelectedPrimaryOption(prev => (prev?.id === opt.id ? null : opt));
                        }
                        sounds.playPlace(true);
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${isSelected
                        ? 'border-amber-400 bg-amber-950/90 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-2 ring-amber-400/80'
                        : `${opt.colorClass} hover:border-white/60`
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{opt.icon}</span>
                          <div>
                            <span className="text-[9px] font-mono uppercase font-black tracking-wider text-amber-300 block">
                              {opt.subtitle}
                            </span>
                            <h4 className="text-xs font-black text-white">{opt.name}</h4>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                            ? 'bg-amber-400 border-white text-slate-950'
                            : 'border-slate-500 bg-black/40'
                            }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-300 leading-tight">{opt.description}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[9px] font-mono font-bold">
                        <span className="text-amber-300">{opt.badge}</span>
                        <span className="text-slate-400 uppercase">
                          {opt.category === 'pace' ? '⚡ Pace Definder' : opt.category === 'boost' ? '📈 Boost' : '📉 Reduction'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION FOOTER */}
              <div className="flex items-center justify-between pt-3 border-t border-amber-500/30">
                <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 flex-wrap">
                  <span>Selected:</span>
                  <span className="font-bold text-amber-300">
                    {[selectedPrimaryOption?.name, selectedPaceOption?.name].filter(Boolean).join(' + ') || 'None (Select at least 1)'}
                  </span>
                  {selectedPrimaryOption && selectedPaceOption && (
                    <span className="text-[9.5px] text-emerald-400 font-bold">
                      · Coexisting Synergy Active ✓
                    </span>
                  )}
                </div>

                <button
                  onClick={handleConfirmBonus}
                  disabled={!selectedPrimaryOption && !selectedPaceOption}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg ${selectedPrimaryOption || selectedPaceOption
                    ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 hover:from-amber-300 hover:to-amber-200'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate Selected Benefits ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VICTORY OVERLAY (Rule 3) */}
        {/* ========================================================================= */}
        {battleState === 'victory' && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-gradient-to-b from-[#1e3520] via-[#162718] to-[#0c160e] border-2 border-emerald-400 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-2xl animate-bounce">
                <Trophy className="w-9 h-9" />
              </div>

              <div>
                <div className="text-xs font-mono font-black text-amber-300 uppercase tracking-widest">
                  COMMERCIAL HEGEMONY ACHIEVED
                </div>
                <h3 className="text-2xl font-black text-white mt-1">Total Market Victory!</h3>
                <p className="text-xs text-emerald-200/90 mt-1 max-w-sm">
                  {bossPop <= 0 || bossAmb <= 0
                    ? `${bossName}'s commercial standing reached 0! You have successfully established supreme market dominance.`
                    : `You captured 100% of all guests staying in the market! Total revenue supremacy achieved.`}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono bg-black/50 p-3 rounded-2xl border border-emerald-500/30">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Total Revenue</span>
                  <span className="text-sm font-black text-amber-300">${playerRevenue.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Guests Captured</span>
                  <span className="text-sm font-black text-emerald-400">{playerGuests} Guests</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onVictory();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-400 text-slate-950 font-black text-sm shadow-xl hover:from-emerald-300 hover:to-amber-300 transition-all cursor-pointer"
              >
                Claim Settlement Victory &amp; Advance ➔
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DEFEAT OVERLAY (Rule 3) */}
        {/* ========================================================================= */}
        {battleState === 'defeat' && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-gradient-to-b from-[#3a1510] via-[#240c09] to-[#120504] border-2 border-rose-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.4)] flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-600 flex items-center justify-center text-white shadow-2xl">
                <X className="w-9 h-9" />
              </div>

              <div>
                <div className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest">
                  MARKET SHOWDOWN OVERWHELMED
                </div>
                <h3 className="text-2xl font-black text-white mt-1">Rival Commercial Monopoly</h3>
                <p className="text-xs text-rose-200/90 mt-1 max-w-sm">
                  {bossName} captured market dominance. Hover over colored zones on the board without picking up tiles to inspect Popularity, Ambience, and +1 Bonus Slots before re-engaging!
                </p>
              </div>

              <button
                onClick={() => {
                  onDefeat();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-sm shadow-xl hover:from-amber-400 hover:to-rose-500 transition-all cursor-pointer"
              >
                Return to Board &amp; Inspect Sections ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
