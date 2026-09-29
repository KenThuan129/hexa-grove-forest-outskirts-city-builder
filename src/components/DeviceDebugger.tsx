import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Activity,
  Cpu,
  Gauge,
  Lock,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
  Monitor,
  Key,
  ShieldCheck,
  RefreshCw,
  Coins,
  Compass,
  HardDrive,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { RendererInfo } from './ThreeScene';

interface DeviceDebuggerProps {
  isOpen: boolean;
  isUnlocked: boolean;
  targetFps: 60 | 30 | 24;
  performanceMode: 'low' | 'high';
  isLowPowerMode?: boolean;
  currentLevelId: number;
  currentLevelName: string;
  phaseIndex: number;
  unlockedHexCount: number;
  placedTilesCount: number;
  rendererInfo?: RendererInfo;
  onAuthenticate: (password: string) => boolean;
  onChangeTargetFps: (fps: 60 | 30 | 24) => void;
  onTogglePerformanceMode: (mode: 'low' | 'high') => void;
  onToggleLowPowerMode?: (enabled: boolean) => void;
  onRequestGraphicsReload?: (newMode: 'low' | 'high', newFps: 60 | 30 | 24) => void;
  onUnlockAllLevels?: () => void;
  onAddDevCurrency?: () => void;
  onClose: () => void;
}

export const DeviceDebugger: React.FC<DeviceDebuggerProps> = ({
  isOpen,
  isUnlocked,
  targetFps,
  performanceMode,
  isLowPowerMode = false,
  currentLevelId,
  currentLevelName,
  phaseIndex,
  unlockedHexCount,
  placedTilesCount,
  rendererInfo,
  onAuthenticate,
  onChangeTargetFps,
  onTogglePerformanceMode,
  onToggleLowPowerMode,
  onRequestGraphicsReload,
  onUnlockAllLevels,
  onAddDevCurrency,
  onClose,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Live Performance Tracking (FPS & Frame Time)
  const [fps, setFps] = useState(60);
  const [frameTimeMs, setFrameTimeMs] = useState(16.6);
  const [cpuCores, setCpuCores] = useState<number | string>('N/A');
  const [deviceMemoryGb, setDeviceMemoryGb] = useState<number | string>('N/A');
  const [gpuRenderer, setGpuRenderer] = useState<string>('Detecting GPU...');
  const [pixelRatio, setPixelRatio] = useState<number>(1);
  const [screenRes, setScreenRes] = useState<string>('');

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastFrameTimestampRef = useRef(performance.now());

  // Detect Hardware & WebGL Capabilities on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCpuCores(navigator.hardwareConcurrency || 'Unknown');
      // @ts-ignore
      setDeviceMemoryGb(navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown');
      setPixelRatio(window.devicePixelRatio || 1);
      setScreenRes(`${window.innerWidth}x${window.innerHeight}`);

      // Probe WebGL Unmasked Renderer
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            setGpuRenderer(`${renderer} (${vendor})`);
          } else {
            setGpuRenderer(gl.getParameter(gl.RENDERER) || 'WebGL Supported');
          }
        }
      } catch {
        setGpuRenderer('Standard Graphics Accelerator');
      }
    }
  }, []);

  // Real-time FPS Monitor loop
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const measureFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimestampRef.current;
      lastFrameTimestampRef.current = now;

      frameCountRef.current += 1;

      if (now - lastTimeRef.current >= 500) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(measuredFps);
        setFrameTimeMs(parseFloat(delta.toFixed(1)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthenticate(passwordInput);
    if (success) {
      setPasswordInput('');
      setAuthError(false);
      sounds.playVictory();
    } else {
      setAuthError(true);
      sounds.playWarning();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 pointer-events-none select-none font-sans">
      {/* If Developer Mode is locked, present password prompt modal */}
      {!isUnlocked ? (
        <div className="pointer-events-auto relative w-full max-w-sm bg-slate-950/90 text-slate-100 rounded-3xl p-5 shadow-2xl border border-cyan-500/40 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm tracking-wide text-white">Developer Access Required</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Press <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 rounded border border-slate-700 font-mono text-cyan-300">Tab</kbd> to toggle the Device Debugger overlay anytime. Enter developer passcode to authenticate this device:
          </p>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={e => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/60 p-2 rounded-xl border border-rose-800/60 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Invalid Passcode. Access denied!</span>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Unlock Debugger
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Semi-Transparent Floating Device Debugger HUD (Top Right) */
        <div className="pointer-events-auto absolute top-3 right-3 w-80 sm:w-96 bg-slate-950/85 backdrop-blur-md text-slate-200 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 text-xs font-mono animate-in slide-in-from-top-4 duration-200 max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Terminal className="w-4 h-4 animate-pulse" />
              <span className="font-bold text-xs text-white">DEVICE DEBUGGER HUD</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded">
                [TAB]
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/80 cursor-pointer"
              title="Close Debugger (Press TAB)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Realtime FPS & Frame Delta */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-400" /> Live FPS
              </span>
              <span className={`text-lg font-black ${
                fps >= 50 ? 'text-emerald-400' : fps >= 25 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {fps} <span className="text-[10px] font-normal text-slate-400">/ {targetFps} Max</span>
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> Frame Time
              </span>
              <span className="text-lg font-black text-cyan-300">
                {frameTimeMs} <span className="text-[10px] font-normal text-slate-400">ms</span>
              </span>
            </div>
          </div>

          {/* FPS Cap & Performance Mode Controls */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10.5px] font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Frame Rate Limit</span>
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              {([60, 30, 24] as const).map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    sounds.playClick();
                    if (targetFps !== rate) {
                      if (onRequestGraphicsReload) onRequestGraphicsReload(performanceMode, rate);
                      else onChangeTargetFps(rate);
                    }
                  }}
                  className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    targetFps === rate
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {rate} FPS
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-1">
              <span className="text-[10px] text-slate-400">Preset Quality:</span>
              <button
                onClick={() => {
                  sounds.playClick();
                  const nextMode = performanceMode === 'low' ? 'high' : 'low';
                  if (onRequestGraphicsReload) onRequestGraphicsReload(nextMode, targetFps);
                  else onTogglePerformanceMode(nextMode);
                }}
                className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
                  performanceMode === 'low'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
              >
                {performanceMode === 'low' ? '⚡ Ultra-Perf' : '✨ High FX Quality'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">Low-Power Scale:</span>
              <button
                onClick={() => {
                  sounds.playClick();
                  onToggleLowPowerMode?.(!isLowPowerMode);
                }}
                className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
                  isLowPowerMode
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {isLowPowerMode ? '⚡ 0.75x Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Hardware & GPU Diagnostics */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1 text-[10.5px]">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hardware & GPU Info</span>
            </span>

            <div className="text-slate-400 truncate" title={gpuRenderer}>
              <strong className="text-slate-200">GPU:</strong> {gpuRenderer}
            </div>
            <div className="flex justify-between text-slate-400">
              <span><strong className="text-slate-200">CPU Cores:</strong> {cpuCores}</span>
              <span><strong className="text-slate-200">RAM:</strong> {deviceMemoryGb}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span><strong className="text-slate-200">DPR:</strong> {pixelRatio}x</span>
              <span><strong className="text-slate-200">Res:</strong> {screenRes}</span>
            </div>
          </div>

          {/* 3D Asset Memory Budget (RAM/VRAM) */}
          {rendererInfo && (
            <div className={`p-2.5 rounded-xl border flex flex-col gap-2 text-[10.5px] transition-all ${
              rendererInfo.isOverBudget || (rendererInfo.budgetUsagePercent ?? 0) >= 85
                ? 'bg-rose-950/70 border-rose-500/60 text-rose-100 shadow-lg shadow-rose-950/50 animate-pulse'
                : (rendererInfo.budgetUsagePercent ?? 0) >= 60
                ? 'bg-slate-900/90 border-amber-500/50 text-slate-200'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D ASSET MEMORY BUDGET</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                  rendererInfo.isOverBudget || (rendererInfo.budgetUsagePercent ?? 0) >= 85
                    ? 'bg-rose-950 text-rose-300 border-rose-600'
                    : (rendererInfo.budgetUsagePercent ?? 0) >= 60
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                }`}>
                  {rendererInfo.isOverBudget || (rendererInfo.budgetUsagePercent ?? 0) >= 85
                    ? 'CRITICAL RISK'
                    : (rendererInfo.budgetUsagePercent ?? 0) >= 60
                    ? 'ELEVATED'
                    : 'NOMINAL'}
                </span>
              </div>

              {/* Memory Usage Meter Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-300 font-semibold">Budget Meter ({rendererInfo.budgetUsagePercent ?? 0}%)</span>
                  <span className="text-slate-400 font-mono">VRAM Cap: {rendererInfo.vramBudgetCapMb ?? 64} MB</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800 flex">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (rendererInfo.budgetUsagePercent ?? 0) >= 85
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : (rendererInfo.budgetUsagePercent ?? 0) >= 60
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, rendererInfo.budgetUsagePercent ?? 0))}%` }}
                  />
                </div>
              </div>

              {/* RAM & VRAM Breakdowns */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 border-t border-slate-800/80 text-slate-300">
                <div className="flex flex-col">
                  <span className="text-[9.5px] text-slate-400 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-cyan-400" /> VRAM Usage
                  </span>
                  <span className="font-bold text-cyan-200">
                    {rendererInfo.totalVramMb ?? 0} <span className="text-[9px] text-slate-400">MB</span>
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9.5px] text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-amber-400" /> JS Heap / RAM
                  </span>
                  <span className="font-bold text-amber-200">
                    {rendererInfo.jsHeapMemoryMb ?? 0} <span className="text-[9px] text-slate-400">MB / {rendererInfo.ramBudgetCapMb ?? 256} MB</span>
                  </span>
                </div>

                <div className="text-[9.5px] text-slate-400">
                  Geo Buffers: <strong className="text-slate-200">{rendererInfo.geometriesMemoryMb ?? 0} MB</strong>
                </div>
                <div className="text-[9.5px] text-slate-400">
                  Textures VRAM: <strong className="text-slate-200">{rendererInfo.texturesVramMb ?? 0} MB</strong>
                </div>
              </div>

              {/* Warning Advice Badge for Low-End Device Crashes */}
              {(rendererInfo.isOverBudget || (rendererInfo.budgetUsagePercent ?? 0) >= 85) && (
                <div className="flex items-start gap-1.5 p-1.5 bg-rose-950/80 rounded-lg border border-rose-700/60 text-[9.5px] text-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                  <span>High VRAM/RAM pressure detected! Enable <strong>Low-Power Mode (0.75x)</strong> or <strong>Ultra-Perf</strong> to prevent WebGL crash on low-end devices.</span>
                </div>
              )}
            </div>
          )}

          {/* WebGL Scene Metrics */}
          {rendererInfo && (
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1 text-[10.5px]">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>3D Render Call Metrics</span>
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400">
                <div><strong className="text-slate-200">Draw Calls:</strong> {rendererInfo.drawCalls}</div>
                <div><strong className="text-slate-200">Triangles:</strong> {rendererInfo.triangles.toLocaleString()}</div>
                <div><strong className="text-slate-200">Geometries:</strong> {rendererInfo.geometries}</div>
                <div><strong className="text-slate-200">Textures:</strong> {rendererInfo.textures}</div>
              </div>
            </div>
          )}

          {/* Game State Diagnostics */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1 text-[10.5px]">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Game State</span>
            </span>
            <div className="text-slate-400">
              <strong className="text-slate-200">Level {currentLevelId}:</strong> {currentLevelName} (Phase {phaseIndex + 1})
            </div>
            <div className="flex justify-between text-slate-400">
              <span><strong className="text-slate-200">Board Hexes:</strong> {unlockedHexCount}</span>
              <span><strong className="text-slate-200">Placed Tiles:</strong> {placedTilesCount}</span>
            </div>
          </div>

          {/* Developer Quick Actions */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-bold">Developer Utilities</span>
            <div className="grid grid-cols-2 gap-1.5">
              {onUnlockAllLevels && (
                <button
                  onClick={onUnlockAllLevels}
                  className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                >
                  ★ Unlock All 40 Lvls
                </button>
              )}
              {onAddDevCurrency && (
                <button
                  onClick={onAddDevCurrency}
                  className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                >
                  +1000 Coins & Leaves
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
