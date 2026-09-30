import React, { useState } from 'react';
import { LevelConfig, PhaseConfig, HexPiece, TileColor, BossZoneType, MasteryChallenge, HexCoord } from '../types/game';
import { PIECE_PALETTE } from '../data/levels';
import { coordKey } from '../utils/hexMath';
import { getHex3DThumbnail } from '../utils/thumbnailGenerator';
import {
  Hammer,
  X,
  Plus,
  Trash2,
  Save,
  Play,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  Layers,
  Compass,
  Sun,
  Leaf,
  Droplets,
  Flame,
  Shield,
  Lightbulb,
  Swords,
  RotateCw,
  Copy,
  FileCode,
  Sliders,
  AlertTriangle,
  RotateCcw,
  FolderOpen,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface LevelEditorModalProps {
  isOpen: boolean;
  onSaveLevel: (level: LevelConfig) => void;
  onTestLevel: (level: LevelConfig) => void;
  existingLevels: LevelConfig[];
  onClose: () => void;
}

type BrushTool = 'unlocked' | 'amber' | 'emerald' | 'sapphire' | 'ruby' | 'fog' | 'river' | 'turntable' | 'erase';

export const LevelEditorModal: React.FC<LevelEditorModalProps> = ({
  isOpen,
  onSaveLevel,
  onTestLevel,
  existingLevels,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'grid' | 'inventory' | 'mastery' | 'manage'>('info');

  // Filter out tutorial levels 1 and 2
  const editableLevels = existingLevels.filter(l => l.id > 2);

  // Active Draft Level State
  const [levelId, setLevelId] = useState<number>(3);
  const [levelName, setLevelName] = useState('Frontier Outpost');
  const [levelSubtitle, setLevelSubtitle] = useState('Mechanic: Forest Expansion');
  const [levelDescription, setLevelDescription] = useState('A hand-crafted settlement frontier built with the Level Editor.');
  const [lightbulbBudget, setLightbulbBudget] = useState(30);
  const [star1, setStar1] = useState(1000);
  const [star2, setStar2] = useState(3500);
  const [star3, setStar3] = useState(5000);
  const [strictPenaltyLimit, setStrictPenaltyLimit] = useState<number | undefined>(undefined);

  // Boss Config
  const [isBossLevel, setIsBossLevel] = useState(false);
  const [bossName, setBossName] = useState('Ancient Granite Titan');
  const [bossMaxHp, setBossMaxHp] = useState(400);
  const [bossAtk, setBossAtk] = useState(45);
  const [bossDef, setBossDef] = useState(25);

  // Phases Config
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [phases, setPhases] = useState<PhaseConfig[]>([
    {
      phaseNumber: 1,
      title: 'Phase 1: Foundation Settlement',
      objective: 'Build structures on the safe clearings and match colored zones.',
      targetTilesCount: 8,
      unlockedCoords: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 1 },
        { q: -1, r: 0 },
        { q: 0, r: -1 },
        { q: 1, r: -1 },
      ],
      coloredZones: [
        {
          name: 'Sunstone Plaza',
          color: 'amber',
          coords: [{ q: 1, r: 0 }, { q: 0, r: 1 }],
          bossZoneType: 'power',
        },
      ],
      fogCoords: [{ q: 0, r: 2 }, { q: -1, r: 2 }],
      riverCoords: [],
      rotationZones: [],
    },
  ]);

  // Inventory / Available Pieces
  const [selectedPieceIds, setSelectedPieceIds] = useState<string[]>([
    'p-house-gray',
    'p-duo-gray',
    'p-triad-amber',
    'p-quad-emerald',
    'p-duo-ruby',
  ]);
  const [pieceStocks, setPieceStocks] = useState<Record<string, number | undefined>>({});

  // Mastery Challenge Config
  const [hasMastery, setHasMastery] = useState(false);
  const [masteryType, setMasteryType] = useState<MasteryChallenge['type']>('min_score');
  const [masteryTitle, setMasteryTitle] = useState('Frontier Mastery');
  const [masteryDesc, setMasteryDescription] = useState('Complete the settlement with zero disconnects or high score.');
  const [masteryValue, setMasteryValue] = useState(2000);

  // Brush Tool state for Grid Editor
  const [selectedBrush, setSelectedBrush] = useState<BrushTool>('unlocked');
  const [jsonImportText, setJsonImportText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPhase = phases[activePhaseIndex] || phases[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper to compile draft LevelConfig
  const buildCurrentLevelConfig = (): LevelConfig => {
    const availablePieces: HexPiece[] = [];
    for (const id of selectedPieceIds) {
      const base = PIECE_PALETTE.find(p => p.id === id);
      if (!base) continue;
      const stock = pieceStocks[id];
      const piece: HexPiece = {
        ...base,
        lightbulbCost: base.clusterShape ? base.clusterShape.length : 1,
      };
      if (stock !== undefined && stock > 0) {
        piece.stock = stock;
      }
      availablePieces.push(piece);
    }

    const mastery: MasteryChallenge | undefined = hasMastery
      ? {
          id: `mc-custom-${levelId}`,
          title: masteryTitle,
          description: masteryDesc,
          type: masteryType,
          targetValue: masteryValue,
        }
      : undefined;

    return {
      id: levelId,
      name: levelName,
      subtitle: levelSubtitle,
      description: levelDescription,
      lightbulbBudget,
      phases,
      availablePieces,
      targetScore: {
        star1,
        star2,
        star3,
      },
      strictPenaltyLimit,
      isBossLevel,
      bossName: isBossLevel ? bossName : undefined,
      bossMaxHp: isBossLevel ? bossMaxHp : undefined,
      bossAtk: isBossLevel ? bossAtk : undefined,
      bossDef: isBossLevel ? bossDef : undefined,
      masteryChallenge: mastery,
    };
  };

  // Grid Cell Click Handler
  const handleGridHexClick = (coord: HexCoord) => {
    const key = coordKey(coord.q, coord.r);

    setPhases(prevPhases => {
      const newPhases = [...prevPhases];
      const ph = { ...newPhases[activePhaseIndex] };

      let unlocked = [...ph.unlockedCoords];
      let fog = [...(ph.fogCoords || [])];
      let river = [...(ph.riverCoords || [])];
      let zones = ph.coloredZones ? [...ph.coloredZones] : [];
      let rotations = ph.rotationZones ? [...ph.rotationZones] : [];

      // Remove coord from all lists first
      unlocked = unlocked.filter(c => coordKey(c.q, c.r) !== key);
      fog = fog.filter(c => coordKey(c.q, c.r) !== key);
      river = river.filter(c => coordKey(c.q, c.r) !== key);
      zones = zones.map(z => ({
        ...z,
        coords: z.coords.filter(c => coordKey(c.q, c.r) !== key),
      })).filter(z => z.coords.length > 0);
      rotations = rotations.filter(r => coordKey(r.center.q, r.center.r) !== key);

      if (selectedBrush === 'unlocked') {
        unlocked.push(coord);
        sounds.playPlace(false);
      } else if (selectedBrush === 'amber' || selectedBrush === 'emerald' || selectedBrush === 'sapphire' || selectedBrush === 'ruby') {
        unlocked.push(coord);
        const colorName = `${selectedBrush.toUpperCase()} Zone`;
        let existingZone = zones.find(z => z.color === selectedBrush);
        if (existingZone) {
          existingZone.coords.push(coord);
        } else {
          zones.push({
            name: colorName,
            color: selectedBrush as TileColor,
            coords: [coord],
            bossZoneType: selectedBrush === 'amber' || selectedBrush === 'ruby' ? 'power' : selectedBrush === 'sapphire' ? 'defend' : 'traits',
          });
        }
        sounds.playPlace(true);
      } else if (selectedBrush === 'fog') {
        fog.push(coord);
        sounds.playPickup();
      } else if (selectedBrush === 'river') {
        river.push(coord);
        sounds.playPickup();
      } else if (selectedBrush === 'turntable') {
        unlocked.push(coord);
        rotations.push({
          id: `rot-${key}`,
          name: `Turntable Hub (${coord.q},${coord.r})`,
          center: coord,
          radius: 1,
        });
        sounds.playRotate();
      } else if (selectedBrush === 'erase') {
        sounds.playPickup();
      }

      ph.unlockedCoords = unlocked;
      ph.fogCoords = fog;
      ph.riverCoords = river;
      ph.coloredZones = zones;
      ph.rotationZones = rotations;

      newPhases[activePhaseIndex] = ph;
      return newPhases;
    });
  };

  // Phase Controls
  const handleAddPhase = () => {
    const nextNum = phases.length + 1;
    const newPhase: PhaseConfig = {
      phaseNumber: nextNum,
      title: `Phase ${nextNum}: Frontier Expansion`,
      objective: 'Expand land boundaries to cover newly unlocked zones.',
      targetTilesCount: 12 + nextNum * 4,
      unlockedCoords: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
      ],
      coloredZones: [],
    };
    setPhases(prev => [...prev, newPhase]);
    setActivePhaseIndex(phases.length);
    sounds.playVictory();
    showToast(`Phase ${nextNum} added!`);
  };

  const handleRemovePhase = (index: number) => {
    if (phases.length <= 1) {
      showToast('Level must have at least 1 phase!');
      return;
    }
    setPhases(prev => prev.filter((_, i) => i !== index));
    setActivePhaseIndex(Math.max(0, index - 1));
    sounds.playWarning();
  };

  const handleSaveDraft = () => {
    const levelConfig = buildCurrentLevelConfig();
    onSaveLevel(levelConfig);
    sounds.playVictory();
    showToast(`Level "${levelName}" (ID: ${levelId}) saved!`);
  };

  const handleTestDraft = () => {
    const levelConfig = buildCurrentLevelConfig();
    onSaveLevel(levelConfig);
    onTestLevel(levelConfig);
    sounds.playVictory();
    onClose();
  };

  const handleExportJSON = () => {
    const levelConfig = buildCurrentLevelConfig();
    const jsonStr = JSON.stringify(levelConfig, null, 2);
    navigator.clipboard.writeText(jsonStr);
    sounds.playVictory();
    showToast(`Level ${levelConfig.id} JSON copied to clipboard!`);
  };

  const handleDownloadJSONFile = () => {
    const levelConfig = buildCurrentLevelConfig();
    const jsonStr = JSON.stringify(levelConfig, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `level_${levelConfig.id}_${levelConfig.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sounds.playVictory();
    showToast(`Level ${levelConfig.id} JSON file downloaded!`);
  };

  const handleExportAllCustomJSON = () => {
    try {
      const rawCustom = localStorage.getItem('hexa_custom_levels');
      const customArr = rawCustom ? JSON.parse(rawCustom) : [];
      if (!customArr.length) {
        showToast('No custom levels saved yet! Save some levels first.');
        return;
      }
      const jsonStr = JSON.stringify(customArr, null, 2);
      navigator.clipboard.writeText(jsonStr);
      sounds.playVictory();
      showToast(`Copied ${customArr.length} Custom Level(s) JSON to clipboard!`);
    } catch {
      showToast('Failed to export custom levels.');
    }
  };

  const handleDownloadAllCustomJSONFile = () => {
    try {
      const rawCustom = localStorage.getItem('hexa_custom_levels');
      const customArr = rawCustom ? JSON.parse(rawCustom) : [];
      if (!customArr.length) {
        showToast('No custom levels saved yet! Save some levels first.');
        return;
      }
      const jsonStr = JSON.stringify(customArr, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'custom_levels_all.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      sounds.playVictory();
      showToast(`Downloaded all ${customArr.length} custom levels as file!`);
    } catch {
      showToast('Failed to download custom levels file.');
    }
  };

  const handleExportAllActiveLevelsJSON = () => {
    try {
      const jsonStr = JSON.stringify(existingLevels, null, 2);
      navigator.clipboard.writeText(jsonStr);
      sounds.playVictory();
      showToast(`Copied all ${existingLevels.length} Game Levels JSON to clipboard!`);
    } catch {
      showToast('Failed to export all levels.');
    }
  };

  const handleParseJSONAndLoad = (parsed: any, sourceText?: string) => {
    if (parsed.id <= 2) {
      throw new Error('Levels 1 & 2 are protected tutorial levels.');
    }
    setLevelId(parsed.id);
    setLevelName(parsed.name);
    setLevelSubtitle(parsed.subtitle || '');
    setLevelDescription(parsed.description || '');
    setLightbulbBudget(parsed.lightbulbBudget || 25);
    setPhases(parsed.phases);
    
    if (parsed.targetScore) {
      setStar1(parsed.targetScore.star1 || 1000);
      setStar2(parsed.targetScore.star2 || 2000);
      setStar3(parsed.targetScore.star3 || 3000);
    }

    if (parsed.availablePieces) {
      const ids = parsed.availablePieces.map((p: any) => p.id);
      setSelectedPieceIds(ids);
      const stocks: Record<string, number | undefined> = {};
      parsed.availablePieces.forEach((p: any) => {
        if (p.stock !== undefined) {
          stocks[p.id] = p.stock;
        }
      });
      setPieceStocks(stocks);
    }

    if (parsed.masteryChallenge) {
      setHasMastery(true);
      setMasteryTitle(parsed.masteryChallenge.title || 'Frontier Mastery');
      setMasteryDescription(parsed.masteryChallenge.description || 'Complete the settlement with zero disconnects.');
      setMasteryType(parsed.masteryChallenge.type || 'min_score');
      setMasteryValue(parsed.masteryChallenge.targetValue || 2000);
    } else {
      setHasMastery(false);
    }

    setIsBossLevel(Boolean(parsed.isBossLevel));
    if (parsed.bossName) setBossName(parsed.bossName);
    if (parsed.bossMaxHp) setBossMaxHp(parsed.bossMaxHp);
    if (parsed.bossAtk) setBossAtk(parsed.bossAtk);
    if (parsed.bossDef) setBossDef(parsed.bossDef);

    if (sourceText) {
      setJsonImportText(sourceText);
    } else {
      setJsonImportText(JSON.stringify(parsed, null, 2));
    }
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonImportText.trim());
      if (Array.isArray(parsed)) {
        // Bulk import multiple levels
        let count = 0;
        parsed.forEach((lvl: LevelConfig) => {
          if (lvl && lvl.id && lvl.id > 2 && lvl.name && lvl.phases) {
            onSaveLevel(lvl);
            count++;
          }
        });
        sounds.playVictory();
        showToast(`Successfully imported & saved ${count} level(s)!`);
        return;
      }

      if (!parsed.id || !parsed.name || !parsed.phases) {
        throw new Error('Invalid level configuration schema');
      }

      handleParseJSONAndLoad(parsed);
      sounds.playVictory();
      showToast('Level JSON imported into editor! Click "Save Changes" to apply.');
    } catch (err: any) {
      sounds.playWarning();
      showToast(err?.message || 'Failed to import JSON! Ensure valid LevelConfig syntax.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text.trim());

        if (Array.isArray(parsed)) {
          let count = 0;
          parsed.forEach((lvl: LevelConfig) => {
            if (lvl && lvl.id && lvl.id > 2 && lvl.name && lvl.phases) {
              onSaveLevel(lvl);
              count++;
            }
          });
          sounds.playVictory();
          showToast(`Successfully uploaded and saved ${count} level(s)!`);
          return;
        }

        if (!parsed.id || !parsed.name || !parsed.phases) {
          throw new Error('Invalid level configuration schema');
        }

        handleParseJSONAndLoad(parsed, text);
        sounds.playVictory();
        showToast(`Uploaded & loaded level "${parsed.name}" into editor!`);
      } catch (err: any) {
        sounds.playWarning();
        showToast(err?.message || 'Failed to upload/parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadLevelForEdit = (targetLevel: LevelConfig) => {
    if (targetLevel.id <= 2) {
      sounds.playWarning();
      showToast('Tutorial Levels 1 & 2 are protected from direct edits.');
      return;
    }
    setLevelId(targetLevel.id);
    setLevelName(targetLevel.name);
    setLevelSubtitle(targetLevel.subtitle);
    setLevelDescription(targetLevel.description);
    setLightbulbBudget(targetLevel.lightbulbBudget || 30);
    setPhases(JSON.parse(JSON.stringify(targetLevel.phases)));
    setStar1(targetLevel.targetScore.star1);
    setStar2(targetLevel.targetScore.star2);
    setStar3(targetLevel.targetScore.star3);
    setStrictPenaltyLimit(targetLevel.strictPenaltyLimit);
    setIsBossLevel(Boolean(targetLevel.isBossLevel));
    if (targetLevel.bossName) setBossName(targetLevel.bossName);
    if (targetLevel.bossMaxHp) setBossMaxHp(targetLevel.bossMaxHp);
    if (targetLevel.bossAtk) setBossAtk(targetLevel.bossAtk);
    if (targetLevel.bossDef) setBossDef(targetLevel.bossDef);
    setSelectedPieceIds(targetLevel.availablePieces.map(p => p.id));
    const stocks: Record<string, number | undefined> = {};
    targetLevel.availablePieces.forEach(p => {
      if (p.stock !== undefined) stocks[p.id] = p.stock;
    });
    setPieceStocks(stocks);
    if (targetLevel.masteryChallenge) {
      setHasMastery(true);
      setMasteryType(targetLevel.masteryChallenge.type);
      setMasteryTitle(targetLevel.masteryChallenge.title);
      setMasteryDescription(targetLevel.masteryChallenge.description);
      setMasteryValue(targetLevel.masteryChallenge.targetValue || 2000);
    } else {
      setHasMastery(false);
    }
    setActivePhaseIndex(0);

    sounds.playVictory();
    showToast(`Loaded Level ${targetLevel.id}: "${targetLevel.name}" for editing!`);
  };

  // Generate 2D Hex Grid coordinates in axial radius 3 (-3..3)
  const hexRadius = 25;
  const gridCoords: HexCoord[] = [];
  for (let q = -3; q <= 3; q++) {
    for (let r = -3; r <= 3; r++) {
      if (Math.abs(q + r) <= 3) {
        gridCoords.push({ q, r });
      }
    }
  }

  // Calculate SVG polygon points for a regular pointy-topped hexagon
  const getHexPolygonPoints = (cx: number, cy: number, radius: number): string => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 30;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = cx + radius * Math.cos(angleRad);
      const y = cy + radius * Math.sin(angleRad);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 font-sans select-none text-slate-100">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-wide flex items-center gap-2 font-rounded">
                <span>HEX LEVEL EDITOR &amp; MAP BUILDER</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full font-mono font-bold">
                  Editing Lvl {levelId}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Design hexagonal frontiers, paint color zones, configure 1v1 boss encounters &amp; test instantly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestDraft}
              className="px-3.5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl cursor-pointer shadow-lg flex items-center gap-1.5 font-rounded"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>TEST LEVEL</span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 font-rounded"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Changes</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Quick-Load Toolbar (Levels 3..40 & Custom Levels) */}
        <div className="px-4 py-2 bg-[#1e3520] border-b border-[#5c3d2e] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#f0c674]" />
            <span className="text-xs font-bold text-[#f4ecd8] font-rounded">Load Existing Level:</span>
            <select
              value={levelId}
              onChange={e => {
                const id = parseInt(e.target.value, 10);
                const lvl = existingLevels.find(l => l.id === id);
                if (lvl) handleLoadLevelForEdit(lvl);
              }}
              className="bg-[#2b1a11] border border-[#f0c674]/50 text-[#f4ecd8] text-xs font-bold rounded-xl px-2.5 py-1 outline-none cursor-pointer"
            >
              <option value="" disabled>Choose Level to Edit (Levels 3..40)...</option>
              {editableLevels.map(lvl => (
                <option key={lvl.id} value={lvl.id}>
                  Level {lvl.id}: {lvl.name} ({lvl.phases.length} Phases{lvl.isBossLevel ? ' · 👹 Boss' : ''})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[10px] text-[#a8b89a] italic hidden sm:block">
            * Levels 1 &amp; 2 are protected tutorials. All other levels 3..40+ are fully editable!
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. Level Info &amp; Boss</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'grid'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2. Hex Phase Grid Painter</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. 3D Tile Inventory ({selectedPieceIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mastery')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mastery'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Mastery Challenge</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>5. Export &amp; Templates</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-900/80 text-xs">
          {/* TAB 1: Level Metadata & Boss Settings */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {/* Basic Meta Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>General Level Attributes</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-bold text-slate-400">Level ID Number</label>
                    <input
                      type="number"
                      value={levelId}
                      onChange={e => setLevelId(parseInt(e.target.value, 10) || 3)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-bold text-amber-400">Lightbulb Budget 💡</label>
                    <input
                      type="number"
                      value={lightbulbBudget}
                      onChange={e => setLightbulbBudget(parseInt(e.target.value, 10) || 20)}
                      className="bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-1.5 text-amber-300 font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-bold text-slate-400">Level Name</label>
                  <input
                    type="text"
                    value={levelName}
                    onChange={e => setLevelName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-bold text-slate-400">Subtitle Tagline</label>
                  <input
                    type="text"
                    value={levelSubtitle}
                    onChange={e => setLevelSubtitle(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-xs outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-bold text-slate-400">Description Lore</label>
                  <textarea
                    rows={2}
                    value={levelDescription}
                    onChange={e => setLevelDescription(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-xs outline-none resize-none"
                  />
                </div>

                {/* Difficulty Modifier Presets */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10.5px] font-bold text-cyan-300 flex items-center gap-1 font-rounded">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Difficulty Modifier Presets:</span>
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStar1(500);
                        setStar2(1500);
                        setStar3(3000);
                        setLightbulbBudget(40);
                        setStrictPenaltyLimit(undefined);
                        sounds.playClick();
                        showToast('Applied "Gentle / Easy" Difficulty Preset!');
                      }}
                      className="py-1 px-1.5 rounded-lg text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 cursor-pointer"
                    >
                      Gentle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStar1(1000);
                        setStar2(3500);
                        setStar3(5000);
                        setLightbulbBudget(25);
                        setStrictPenaltyLimit(undefined);
                        sounds.playClick();
                        showToast('Applied "Balanced / Standard" Difficulty Preset!');
                      }}
                      className="py-1 px-1.5 rounded-lg text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 cursor-pointer"
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStar1(1800);
                        setStar2(5000);
                        setStar3(8000);
                        setLightbulbBudget(20);
                        setStrictPenaltyLimit(3);
                        setHasMastery(true);
                        sounds.playClick();
                        showToast('Applied "Challenging" Difficulty Preset!');
                      }}
                      className="py-1 px-1.5 rounded-lg text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 hover:bg-amber-900 cursor-pointer"
                    >
                      Challenge
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStar1(2500);
                        setStar2(7500);
                        setStar3(12000);
                        setLightbulbBudget(15);
                        setStrictPenaltyLimit(1);
                        setHasMastery(true);
                        sounds.playClick();
                        showToast('Applied "Master / Extreme" Difficulty Preset!');
                      }}
                      className="py-1 px-1.5 rounded-lg text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900 cursor-pointer"
                    >
                      Master
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-bold text-amber-400">★1 Score</label>
                    <input
                      type="number"
                      value={star1}
                      onChange={e => setStar1(parseInt(e.target.value, 10) || 500)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-bold text-amber-400">★2 Score</label>
                    <input
                      type="number"
                      value={star2}
                      onChange={e => setStar2(parseInt(e.target.value, 10) || 2000)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-bold text-amber-400">★3 Score</label>
                    <input
                      type="number"
                      value={star3}
                      onChange={e => setStar3(parseInt(e.target.value, 10) || 3500)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Boss Encounters & Restrictions */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-extrabold text-sm text-rose-400 flex items-center gap-2">
                    <Swords className="w-4 h-4 text-rose-500" />
                    <span>Boss Encounter Mechanics</span>
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBossLevel}
                      onChange={e => setIsBossLevel(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-white">Enable Boss Stage</span>
                  </label>
                </div>

                {isBossLevel ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10.5px] font-bold text-rose-300">Boss Name</label>
                      <input
                        type="text"
                        value={bossName}
                        onChange={e => setBossName(e.target.value)}
                        className="bg-slate-900 border border-rose-500/50 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9.5px] font-bold text-rose-400">Max HP</label>
                        <input
                          type="number"
                          value={bossMaxHp}
                          onChange={e => setBossMaxHp(parseInt(e.target.value, 10) || 300)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9.5px] font-bold text-amber-400">ATK Stat</label>
                        <input
                          type="number"
                          value={bossAtk}
                          onChange={e => setBossAtk(parseInt(e.target.value, 10) || 40)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-white font-mono text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9.5px] font-bold text-cyan-400">DEF Stat</label>
                        <input
                          type="number"
                          value={bossDef}
                          onChange={e => setBossDef(parseInt(e.target.value, 10) || 20)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200">
                      Boss levels prompt a 1v1 turn-based battle modal using hero stats derived from tiles built on Power, Defend &amp; Traits Zones!
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-center italic">
                    Standard Level (No Boss Encounter). Check "Enable Boss Stage" to turn this into a Boss Level.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Interactive SVG Hexagonal Map Painter */}
          {activeTab === 'grid' && (
            <div className="flex flex-col gap-4 max-w-5xl mx-auto">
              {/* Phase Switcher Header */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono mr-1">Phases:</span>
                  {phases.map((ph, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhaseIndex(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        idx === activePhaseIndex
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      Phase {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={handleAddPhase}
                    className="p-1 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:text-white cursor-pointer"
                    title="Add new phase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {phases.length > 1 && (
                  <button
                    onClick={() => handleRemovePhase(activePhaseIndex)}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Phase</span>
                  </button>
                )}
              </div>

              {/* Brush Tools Bar */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-2">
                <span className="font-bold text-xs text-amber-300 mr-2 flex items-center gap-1 font-rounded">
                  <Hammer className="w-3.5 h-3.5" /> Brush Tool:
                </span>

                <button
                  onClick={() => setSelectedBrush('unlocked')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'unlocked' ? 'bg-slate-200 text-slate-950 border-white font-black' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <span>Land</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('amber')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'amber' ? 'bg-amber-400 text-slate-950 border-amber-300 font-black' : 'bg-slate-900 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>Amber</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('emerald')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'emerald' ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-black' : 'bg-slate-900 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>Emerald</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('sapphire')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'sapphire' ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black' : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                  <span>Sapphire</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('ruby')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'ruby' ? 'bg-rose-500 text-white border-rose-300 font-black' : 'bg-slate-900 text-rose-300 border-rose-500/40'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
                  <span>Ruby</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('fog')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'fog' ? 'bg-purple-600 text-white border-purple-300 font-black' : 'bg-slate-900 text-purple-300 border-purple-500/40'
                  }`}
                >
                  <span>🌫️ Fog</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('river')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'river' ? 'bg-blue-600 text-white border-blue-300 font-black' : 'bg-slate-900 text-blue-300 border-blue-500/40'
                  }`}
                >
                  <span>🌊 River</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('turntable')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'turntable' ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black' : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Turntable</span>
                </button>

                <button
                  onClick={() => setSelectedBrush('erase')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                    selectedBrush === 'erase' ? 'bg-rose-600 text-white border-rose-300 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Eraser</span>
                </button>
              </div>

              {/* Authentic Hexagonal Honeycomb Canvas Map */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
                  <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5 font-rounded">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hexagonal Phase {activePhaseIndex + 1} Canvas Map</span>
                    {activePhaseIndex > 0 && (
                      <span className="text-[9.5px] text-emerald-300 bg-emerald-950 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold">
                        Phase 1..{activePhaseIndex} Base Layout Visible
                      </span>
                    )}
                  </div>

                  {activePhaseIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const allPrevUnlocked: HexCoord[] = [];
                        const allPrevZones: typeof currentPhase.coloredZones = [];

                        for (let i = 0; i < activePhaseIndex; i++) {
                          const ph = phases[i];
                          if (!ph) continue;
                          ph.unlockedCoords.forEach(c => {
                            if (!allPrevUnlocked.some(x => coordKey(x.q, x.r) === coordKey(c.q, c.r))) {
                              allPrevUnlocked.push(c);
                            }
                          });
                          if (ph.coloredZones) {
                            ph.coloredZones.forEach(z => {
                              allPrevZones.push(JSON.parse(JSON.stringify(z)));
                            });
                          }
                        }

                        setPhases(prev => {
                          const updated = [...prev];
                          const activePh = { ...updated[activePhaseIndex] };
                          
                          const mergedUnlocked = [...activePh.unlockedCoords];
                          allPrevUnlocked.forEach(c => {
                            if (!mergedUnlocked.some(x => coordKey(x.q, x.r) === coordKey(c.q, c.r))) {
                              mergedUnlocked.push(c);
                            }
                          });
                          activePh.unlockedCoords = mergedUnlocked;

                          const mergedZones = [...(activePh.coloredZones || [])];
                          allPrevZones.forEach(z => {
                            let existing = mergedZones.find(x => x.name === z.name || x.color === z.color);
                            if (existing) {
                              z.coords.forEach(c => {
                                if (!existing!.coords.some(x => coordKey(x.q, x.r) === coordKey(c.q, c.r))) {
                                  existing!.coords.push(c);
                                }
                              });
                            } else {
                              mergedZones.push(z);
                            }
                          });
                          activePh.coloredZones = mergedZones;

                          updated[activePhaseIndex] = activePh;
                          return updated;
                        });

                        sounds.playVictory();
                        showToast(`Copied layout & zones from Phases 1..${activePhaseIndex} into Phase ${activePhaseIndex + 1}!`);
                      }}
                      className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-white rounded-xl text-[10.5px] font-bold shadow flex items-center gap-1.5 cursor-pointer font-rounded"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inherit Previous Phases ({activePhaseIndex}) Layout</span>
                    </button>
                  )}
                </div>

                {/* SVG Hexagon Honeycomb Canvas */}
                <div className="w-full max-w-lg flex items-center justify-center p-2">
                  <svg
                    viewBox="0 0 520 450"
                    className="w-full h-auto max-h-[380px] drop-shadow-2xl"
                  >
                    <g transform="translate(260, 225)">
                      {gridCoords.map(coord => {
                        const key = coordKey(coord.q, coord.r);
                        const cx = hexRadius * Math.sqrt(3) * (coord.q + coord.r / 2);
                        const cy = hexRadius * 1.5 * coord.r;

                        const isUnlocked = currentPhase.unlockedCoords.some(c => coordKey(c.q, c.r) === key);
                        const isFog = currentPhase.fogCoords?.some(c => coordKey(c.q, c.r) === key);
                        const isRiver = currentPhase.riverCoords?.some(c => coordKey(c.q, c.r) === key);
                        const isTurntable = currentPhase.rotationZones?.some(r => coordKey(r.center.q, r.center.r) === key);

                        // Check if unlocked in previous phases
                        let isUnlockedInPrev = false;
                        if (activePhaseIndex > 0 && !isUnlocked) {
                          for (let i = 0; i < activePhaseIndex; i++) {
                            if (phases[i]?.unlockedCoords.some(c => coordKey(c.q, c.r) === key)) {
                              isUnlockedInPrev = true;
                              break;
                            }
                          }
                        }

                        let zoneColor: TileColor | null = null;
                        if (currentPhase.coloredZones) {
                          for (const z of currentPhase.coloredZones) {
                            if (z.coords.some(c => coordKey(c.q, c.r) === key)) {
                              zoneColor = z.color;
                              break;
                            }
                          }
                        }

                        // Determine fill and stroke styling
                        let fill = '#0f172a';
                        let stroke = '#334155';
                        let strokeWidth = 1.5;
                        let strokeDasharray = undefined;

                        if (zoneColor === 'amber') {
                          fill = '#f59e0b';
                          stroke = '#fef08a';
                          strokeWidth = 2.5;
                        } else if (zoneColor === 'emerald') {
                          fill = '#10b981';
                          stroke = '#a7f3d0';
                          strokeWidth = 2.5;
                        } else if (zoneColor === 'sapphire') {
                          fill = '#06b6d4';
                          stroke = '#a5f3fc';
                          strokeWidth = 2.5;
                        } else if (zoneColor === 'ruby') {
                          fill = '#f43f5e';
                          stroke = '#fecdd3';
                          strokeWidth = 2.5;
                        } else if (isTurntable) {
                          fill = '#083344';
                          stroke = '#22d3ee';
                          strokeWidth = 2.5;
                        } else if (isFog) {
                          fill = '#3b0764';
                          stroke = '#a855f7';
                          strokeWidth = 2;
                        } else if (isRiver) {
                          fill = '#1e3a8a';
                          stroke = '#60a5fa';
                          strokeWidth = 2;
                        } else if (isUnlocked) {
                          fill = '#2d4a2b';
                          stroke = '#8fbc6f';
                          strokeWidth = 2;
                        } else if (isUnlockedInPrev) {
                          fill = '#142918';
                          stroke = '#6b8e5a';
                          strokeWidth = 2;
                          strokeDasharray = '4 3';
                        }

                        return (
                          <g
                            key={key}
                            onClick={() => handleGridHexClick(coord)}
                            className="cursor-pointer group transition-transform hover:scale-110"
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                          >
                            <polygon
                              points={getHexPolygonPoints(cx, cy, hexRadius - 1.5)}
                              fill={fill}
                              stroke={stroke}
                              strokeWidth={strokeWidth}
                              strokeDasharray={strokeDasharray}
                              className="transition-colors duration-200"
                            />

                            {/* Center Icon / Label */}
                            {zoneColor === 'amber' && (
                              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="bold">☀️</text>
                            )}
                            {zoneColor === 'emerald' && (
                              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="bold">🌿</text>
                            )}
                            {zoneColor === 'sapphire' && (
                              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="bold">💧</text>
                            )}
                            {zoneColor === 'ruby' && (
                              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="bold">🔥</text>
                            )}
                            {isTurntable && !zoneColor && (
                              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11" fill="#22d3ee" fontWeight="bold">🔄</text>
                            )}
                            {isFog && !zoneColor && (
                              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11">🌫️</text>
                            )}
                            {isRiver && !zoneColor && (
                              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11">🌊</text>
                            )}
                            {!zoneColor && !isTurntable && !isFog && !isRiver && (
                              <text
                                x={cx}
                                y={cy + 3}
                                textAnchor="middle"
                                fontSize="7.5"
                                fill={isUnlockedInPrev ? '#8fbc6f' : isUnlocked ? '#f4ecd8' : '#64748b'}
                                fontFamily="monospace"
                                fontWeight={isUnlocked ? 'bold' : 'normal'}
                              >
                                {isUnlockedInPrev ? 'P1' : `${coord.q},${coord.r}`}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Tile Palette & Stock with 3D Snapshots */}
          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              <div className="font-bold text-xs text-slate-300 flex items-center justify-between font-rounded">
                <span>Select Available Pieces &amp; Preview 3D Models:</span>
                <span className="text-[10.5px] font-mono text-amber-400">
                  {selectedPieceIds.length} Pieces Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {PIECE_PALETTE.map(piece => {
                  const isSelected = selectedPieceIds.includes(piece.id);
                  const isCluster = Boolean(piece.clusterShape && piece.clusterShape.length > 1);
                  const clusterCount = piece.clusterShape ? piece.clusterShape.length : 1;
                  const thumb = getHex3DThumbnail(piece.type, piece.color, piece.clusterShape);

                  return (
                    <div
                      key={piece.id}
                      onClick={() => {
                        setSelectedPieceIds(prev =>
                          isSelected ? prev.filter(id => id !== piece.id) : [...prev, piece.id]
                        );
                        sounds.playClick();
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate text-white font-rounded">{piece.name}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* 3D Visual Snapshot */}
                      <div className="w-full h-20 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center relative overflow-hidden my-2 shadow-inner group-hover:scale-105 transition-transform">
                        <img
                          src={thumb}
                          alt={piece.name}
                          className="w-16 h-16 object-contain drop-shadow pointer-events-none"
                        />
                        {isCluster && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40 shadow">
                            {clusterCount}H
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {piece.description}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono">
                        <span className="text-amber-300 font-bold">
                          {isCluster ? `${clusterCount}-Hex Cluster` : 'Single Hex'}
                        </span>
                        <span className="text-emerald-400 font-bold">💡 {clusterCount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Mastery Challenge */}
          {activeTab === 'mastery' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-xl mx-auto flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-2 font-rounded">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Mastery Challenge Configuration</span>
                </h3>

                <label className="flex items-center gap-2 cursor-pointer font-rounded">
                  <input
                    type="checkbox"
                    checked={hasMastery}
                    onChange={e => setHasMastery(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-white">Enable Mastery Objective</span>
                </label>
              </div>

              {hasMastery ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-bold text-slate-400 font-rounded">Challenge Type</label>
                    <select
                      value={masteryType}
                      onChange={e => setMasteryType(e.target.value as MasteryChallenge['type'])}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none"
                    >
                      <option value="min_score">Minimum Score Target</option>
                      <option value="zero_disconnect">Zero Disconnects</option>
                      <option value="zero_overuse">Zero Par Overuse</option>
                      <option value="zero_overlap">Zero Overlap Errors</option>
                      <option value="rotate_zone">Rotate Turntables At Least Once</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-bold text-slate-400 font-rounded">Challenge Title</label>
                    <input
                      type="text"
                      value={masteryTitle}
                      onChange={e => setMasteryTitle(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-bold text-slate-400 font-rounded">Challenge Description</label>
                    <textarea
                      rows={2}
                      value={masteryDesc}
                      onChange={e => setMasteryDescription(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-xs outline-none resize-none"
                    />
                  </div>

                  {masteryType === 'min_score' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10.5px] font-bold text-amber-400 font-rounded">Target Score Requirement</label>
                      <input
                        type="number"
                        value={masteryValue}
                        onChange={e => setMasteryValue(parseInt(e.target.value, 10) || 2000)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-center italic">
                  Mastery Objective is currently disabled for this level. Check "Enable Mastery Objective" to create a custom mastery condition.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Export & JSON Import */}
          {activeTab === 'manage' && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              {/* File Export Downloads Section */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-rounded">Export & Download Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col gap-2 shadow-inner">
                    <span className="text-[10px] font-bold text-slate-500 font-rounded">Single Level ({levelId})</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleExportJSON}
                        className="flex-1 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10.5px] text-white cursor-pointer shadow transition-all font-rounded"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copy Clipboard</span>
                      </button>
                      <button
                        onClick={handleDownloadJSONFile}
                        className="flex-1 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10.5px] text-cyan-300 cursor-pointer shadow transition-all font-rounded"
                        title="Download .json file"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Download .json</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col gap-2 shadow-inner">
                    <span className="text-[10px] font-bold text-amber-500/80 font-rounded">All Custom Levels</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleExportAllCustomJSON}
                        className="flex-1 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10.5px] text-white cursor-pointer shadow transition-all font-rounded"
                        title="Copy all custom levels to Clipboard"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Clipboard</span>
                      </button>
                      <button
                        onClick={handleDownloadAllCustomJSONFile}
                        className="flex-1 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[10.5px] text-amber-300 cursor-pointer shadow transition-all font-rounded"
                        title="Download all custom levels .json file"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download .json</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload JSON Files Section */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-rounded">Upload & Load JSON File</h4>
                <div className="p-4 bg-slate-950 border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all">
                  <Upload className="w-8 h-8 text-emerald-400 animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-slate-300 font-rounded">Drag & drop or browse to upload .json file</p>
                    <p className="text-[10px] text-slate-500">Supports single level or bulk custom levels array</p>
                  </div>
                  <label className="mt-1 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 hover:border-emerald-700 text-emerald-300 font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all font-rounded">
                    Browse File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* JSON Paste Area as safe fallback */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 font-rounded">Paste Raw JSON Fallback:</label>
                  <button
                    onClick={handleImportJSON}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-extrabold text-[10.5px] rounded-lg shadow cursor-pointer transition-all font-rounded flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Load/Import Pasted</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={jsonImportText}
                  onChange={e => setJsonImportText(e.target.value)}
                  placeholder='Paste {"id": 101, "name": "Custom", "phases": [...]} here...'
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-[11px] font-mono text-cyan-300 outline-none resize-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Floating Toast Notice */}
        {toastMsg && (
          <div className="absolute bottom-4 right-4 bg-emerald-950 border border-emerald-500/80 text-emerald-300 font-bold px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2 duration-150 z-50 font-rounded">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
