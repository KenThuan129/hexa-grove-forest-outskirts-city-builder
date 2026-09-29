import React, { useState, useEffect, useRef } from 'react';
import { Shield, Swords, Heart, Zap, Sparkles, RefreshCw, Trophy, AlertTriangle, X, Flame, ShieldAlert, Award, Skull } from 'lucide-react';
import { BossBattleStats } from '../types/game';
import { sounds } from '../utils/audio';

interface BossBattleModalProps {
  isOpen: boolean;
  bossName: string;
  bossMaxHp: number;
  bossAtk: number;
  bossDef: number;
  playerStats: BossBattleStats;
  onVictory: () => void;
  onDefeat: () => void;
  onClose: () => void;
}

interface BattleLogEntry {
  id: string;
  turn: number;
  attacker: 'player' | 'boss';
  actionName: string;
  damage: number;
  isCrit?: boolean;
  isDoubleStrike?: boolean;
  healed?: number;
  reflected?: number;
  text: string;
}

export const BossBattleModal: React.FC<BossBattleModalProps> = ({
  isOpen,
  bossName,
  bossMaxHp,
  bossAtk,
  bossDef,
  playerStats,
  onVictory,
  onDefeat,
  onClose,
}) => {
  const [playerHp, setPlayerHp] = useState(200);
  const [playerShield, setPlayerShield] = useState(playerStats.traits.aegisShield || 0);
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [turn, setTurn] = useState(1);
  const [currentTurnOwner, setCurrentTurnOwner] = useState<'player' | 'boss'>('player');
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [battleState, setBattleState] = useState<'ready' | 'fighting' | 'victory' | 'defeat'>('ready');
  const [isAutoFighting, setIsAutoFighting] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(1);

  const [playerFloatingText, setPlayerFloatingText] = useState<{ text: string; color: string } | null>(null);
  const [bossFloatingText, setBossFloatingText] = useState<{ text: string; color: string } | null>(null);

  const battleLogsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Battle
  useEffect(() => {
    if (isOpen) {
      setPlayerHp(200);
      setPlayerShield(playerStats.traits.aegisShield || 0);
      setBossHp(bossMaxHp);
      setTurn(1);
      setCurrentTurnOwner('player');
      setBattleLogs([
        {
          id: 'init-1',
          turn: 0,
          attacker: 'player',
          actionName: 'Battle Engage',
          damage: 0,
          text: `⚔️ 1v1 Boss Showdown commenced! Hero engages ${bossName}!`,
        },
      ]);
      setBattleState('ready');
      setIsAutoFighting(false);
    }
  }, [isOpen, bossMaxHp, bossName, playerStats]);

  // Scroll logs
  useEffect(() => {
    battleLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLogs]);

  // Turn Execution Logic
  const executeTurn = () => {
    if (battleState === 'victory' || battleState === 'defeat') return;

    if (currentTurnOwner === 'player') {
      // Player Turn
      const isCrit = Math.random() < playerStats.traits.criticalRatePct;
      const critMult = isCrit ? 2.0 : 1.0;
      const baseDmg = Math.max(10, Math.round((playerStats.attack - bossDef * 0.4) * critMult));
      
      let totalDmg = baseDmg;
      const isDoubleStrike = Math.random() < playerStats.traits.doubleStrikePct;
      if (isDoubleStrike) {
        totalDmg += Math.round(baseDmg * 0.75);
      }

      // Apply to Boss
      const newBossHp = Math.max(0, bossHp - totalDmg);
      setBossHp(newBossHp);

      // Life Steal
      let healedAmt = 0;
      if (playerStats.traits.lifeStealPct > 0) {
        healedAmt = Math.round(totalDmg * playerStats.traits.lifeStealPct);
        setPlayerHp(hp => Math.min(250, hp + healedAmt));
      }

      // Visual Float text on Boss
      setBossFloatingText({
        text: `-${totalDmg}${isCrit ? ' CRIT!' : ''}${isDoubleStrike ? ' 2x STRIKE!' : ''}`,
        color: isCrit ? 'text-amber-400 font-black' : 'text-rose-400 font-bold',
      });
      setTimeout(() => setBossFloatingText(null), 1000);

      sounds.playPlace(true);

      const newLog: BattleLogEntry = {
        id: `turn-${turn}-p`,
        turn,
        attacker: 'player',
        actionName: isDoubleStrike ? 'Double Blade Flurry' : 'Sanctuary Strike',
        damage: totalDmg,
        isCrit,
        isDoubleStrike,
        healed: healedAmt,
        text: `🛡️ Hero strikes ${bossName} for ${totalDmg} damage!${isCrit ? ' (CRITICAL HIT!)' : ''}${healedAmt > 0 ? ` (Life Steal +${healedAmt} HP)` : ''}`,
      };
      setBattleLogs(logs => [...logs, newLog]);

      if (newBossHp <= 0) {
        setBattleState('victory');
        setIsAutoFighting(false);
        sounds.playVictory();
        return;
      }

      setCurrentTurnOwner('boss');
    } else {
      // Boss Turn
      const rawBossDmg = Math.max(8, Math.round(bossAtk - playerStats.defense * 0.45));
      
      // Damage absorption by Aegis Shield
      let remainingDmg = rawBossDmg;
      let newShield = playerShield;
      if (playerShield > 0) {
        if (playerShield >= rawBossDmg) {
          newShield = playerShield - rawBossDmg;
          remainingDmg = 0;
        } else {
          remainingDmg = rawBossDmg - playerShield;
          newShield = 0;
        }
        setPlayerShield(newShield);
      }

      const newPlayerHp = Math.max(0, playerHp - remainingDmg);
      setPlayerHp(newPlayerHp);

      // Thorn Counter reflection
      let reflectedDmg = 0;
      if (playerStats.traits.thornCounterPct > 0) {
        reflectedDmg = Math.round(rawBossDmg * playerStats.traits.thornCounterPct);
        setBossHp(hp => Math.max(0, hp - reflectedDmg));
      }

      // Visual Float text on Player
      setPlayerFloatingText({
        text: `-${remainingDmg}${newShield > 0 ? ' (Shielded)' : ''}`,
        color: 'text-rose-500 font-bold',
      });
      setTimeout(() => setPlayerFloatingText(null), 1000);

      sounds.playWarning();

      const newLog: BattleLogEntry = {
        id: `turn-${turn}-b`,
        turn,
        attacker: 'boss',
        actionName: 'Boss Devastation',
        damage: rawBossDmg,
        reflected: reflectedDmg,
        text: `👑 ${bossName} attacks for ${rawBossDmg} damage!${reflectedDmg > 0 ? ` (Thorn Counter reflected ${reflectedDmg} dmg!)` : ''}`,
      };
      setBattleLogs(logs => [...logs, newLog]);

      if (newPlayerHp <= 0) {
        setBattleState('defeat');
        setIsAutoFighting(false);
        return;
      }

      setTurn(t => t + 1);
      setCurrentTurnOwner('player');
    }
  };

  // Auto-Fight loop
  useEffect(() => {
    if (!isAutoFighting || battleState === 'victory' || battleState === 'defeat') return;

    const interval = setInterval(() => {
      executeTurn();
    }, 800 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isAutoFighting, battleState, currentTurnOwner, playerHp, bossHp, turn, speedMultiplier]);

  if (!isOpen) return null;

  const playerHpPct = Math.min(100, Math.max(0, (playerHp / 200) * 100));
  const bossHpPct = Math.min(100, Math.max(0, (bossHp / bossMaxHp) * 100));

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Swords className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-wide text-white flex items-center gap-2">
                <span>1v1 BOSS SHOWDOWN</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full font-mono">
                  Turn {turn}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Battle stats derived from your tile placements over Power, Defend &amp; Traits Zones!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1v1 Arena Fighters Box */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          {/* Player Hero Card */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-cyan-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>SANCTUARY HERO</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-200 font-bold">
                {playerHp} / 200 HP {playerShield > 0 && <span className="text-amber-300">(+{playerShield} Aegis)</span>}
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden relative p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${playerHpPct}%` }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono pt-1">
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-amber-300">
                <span>ATK:</span>
                <span className="font-black text-amber-400">{playerStats.attack}</span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-cyan-300">
                <span>DEF:</span>
                <span className="font-black text-cyan-400">{playerStats.defense}</span>
              </div>
            </div>

            {/* Trait Badges */}
            <div className="flex flex-wrap gap-1 mt-1">
              {playerStats.traits.lifeStealPct > 0 && (
                <span className="px-1.5 py-0.5 text-[9.5px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-emerald-400" />
                  Life Steal {Math.round(playerStats.traits.lifeStealPct * 100)}%
                </span>
              )}
              {playerStats.traits.doubleStrikePct > 0 && (
                <span className="px-1.5 py-0.5 text-[9.5px] bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  Double Strike {Math.round(playerStats.traits.doubleStrikePct * 100)}%
                </span>
              )}
              {playerStats.traits.thornCounterPct > 0 && (
                <span className="px-1.5 py-0.5 text-[9.5px] bg-rose-950 text-rose-300 border border-rose-500/40 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
                  Thorns {Math.round(playerStats.traits.thornCounterPct * 100)}%
                </span>
              )}
              {playerStats.traits.criticalRatePct > 0 && (
                <span className="px-1.5 py-0.5 text-[9.5px] bg-purple-950 text-purple-300 border border-purple-500/40 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                  Crit {Math.round(playerStats.traits.criticalRatePct * 100)}%
                </span>
              )}
            </div>

            {/* Floating Damage Text */}
            {playerFloatingText && (
              <div className={`absolute top-2 right-2 text-sm font-extrabold animate-bounce ${playerFloatingText.color}`}>
                {playerFloatingText.text}
              </div>
            )}
          </div>

          {/* Boss Sovereign Card */}
          <div className="flex flex-col gap-2 relative border-l border-slate-800/80 pl-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-rose-400 flex items-center gap-1.5 truncate">
                <Skull className="w-4 h-4 text-rose-500" />
                <span className="truncate">{bossName}</span>
              </span>
              <span className="text-[11px] font-mono text-rose-300 font-bold shrink-0">
                {bossHp} / {bossMaxHp} HP
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden relative p-0.5">
              <div
                className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${bossHpPct}%` }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono pt-1">
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-rose-300">
                <span>ATK:</span>
                <span className="font-black text-rose-400">{bossAtk}</span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-amber-300">
                <span>DEF:</span>
                <span className="font-black text-amber-400">{bossDef}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 italic mt-1">
              Boss Trait: Devastating Sovereign Slam
            </div>

            {/* Floating Damage Text */}
            {bossFloatingText && (
              <div className={`absolute top-2 left-2 text-sm font-extrabold animate-bounce ${bossFloatingText.color}`}>
                {bossFloatingText.text}
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Combat Log */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5 h-36 overflow-y-auto text-xs font-mono">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Combat Log</span>
          {battleLogs.map(log => (
            <div
              key={log.id}
              className={`p-1.5 rounded-lg leading-relaxed text-[11px] ${
                log.attacker === 'player'
                  ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-800/40'
                  : 'bg-rose-950/40 text-rose-200 border border-rose-800/40'
              }`}
            >
              {log.text}
            </div>
          ))}
          <div ref={battleLogsEndRef} />
        </div>

        {/* Battle Controls / Victory Card */}
        {battleState === 'ready' && (
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Ready to engage the Sovereign?</span>
            <button
              onClick={() => {
                setBattleState('fighting');
                setIsAutoFighting(true);
              }}
              className="px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>COMMENCE 1v1 BATTLE</span>
            </button>
          </div>
        )}

        {battleState === 'fighting' && (
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Speed:</span>
              {([1, 2, 4] as const).map(sp => (
                <button
                  key={sp}
                  onClick={() => setSpeedMultiplier(sp)}
                  className={`px-2 py-1 rounded text-xs font-bold font-mono cursor-pointer ${
                    speedMultiplier === sp
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>

            <button
              onClick={executeTurn}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Turn Step</span>
            </button>
          </div>
        )}

        {battleState === 'victory' && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-emerald-200 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            <div className="text-center">
              <h3 className="text-base font-extrabold text-white">VICTORY! SOVEREIGN DEFEATED!</h3>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                Your tile setup mastered the Power, Defend &amp; Traits Zones!
              </p>
            </div>
            <button
              onClick={onVictory}
              className="px-6 py-2.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20"
            >
              CLAIM VICTORY &amp; CONTINUE
            </button>
          </div>
        )}

        {battleState === 'defeat' && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-rose-200 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
            <AlertTriangle className="w-10 h-10 text-rose-400 animate-bounce" />
            <div className="text-center">
              <h3 className="text-base font-extrabold text-white">DEFEATED BY {bossName.toUpperCase()}</h3>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Re-adjust your tile placements to cover more Power &amp; Defend zones for higher ATK &amp; DEF!
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onDefeat}
                className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Re-adjust Tile Setup
              </button>
              <button
                onClick={() => {
                  setPlayerHp(200);
                  setPlayerShield(playerStats.traits.aegisShield || 0);
                  setBossHp(bossMaxHp);
                  setTurn(1);
                  setBattleState('fighting');
                  setIsAutoFighting(true);
                }}
                className="px-5 py-2 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer"
              >
                Retry Battle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
