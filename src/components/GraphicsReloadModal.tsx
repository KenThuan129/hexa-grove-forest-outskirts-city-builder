import React from 'react';
import { RefreshCw, Zap, Sparkles, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GraphicsReloadModalProps {
  isOpen: boolean;
  currentPerfMode: 'low' | 'high';
  newPerfMode: 'low' | 'high';
  currentTargetFps: 60 | 30 | 24;
  newTargetFps: 60 | 30 | 24;
  currentTextureQuality?: 'high' | 'low';
  newTextureQuality?: 'high' | 'low';
  onConfirm: () => void;
  onCancel: () => void;
}

export const GraphicsReloadModal: React.FC<GraphicsReloadModalProps> = ({
  isOpen,
  currentPerfMode,
  newPerfMode,
  currentTargetFps,
  newTargetFps,
  currentTextureQuality = 'high',
  newTextureQuality = 'high',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    sounds.playVictory();
    onConfirm();
  };

  const handleCancel = () => {
    sounds.playClick();
    onCancel();
  };

  const hasPresetChange = currentPerfMode !== newPerfMode;
  const hasFpsChange = currentTargetFps !== newTargetFps;
  const hasTexChange = currentTextureQuality !== newTextureQuality;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-md bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-cyan-500/40 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                <span>Graphics Engine Reload Required</span>
              </h3>
              <p className="text-[10.5px] text-cyan-300/80">Re-initializing WebGL 3D Pipeline Context</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Full Reload Sequence Trigger</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Applying new graphics quality and frame rate limits requires re-compiling WebGL shaders and resetting scene parameters. A loading screen will trigger to apply these settings immediately.
            </p>
          </div>

          {/* Settings Comparison */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Graphics Preset Box */}
            <div className={`p-2.5 rounded-2xl border flex flex-col gap-1 ${
              hasPresetChange ? 'bg-cyan-950/60 border-cyan-500/50' : 'bg-slate-950/40 border-slate-800'
            }`}>
              <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Preset Quality</span>
              <div className="flex items-center gap-1 font-mono font-bold text-[11px] mt-0.5">
                {newPerfMode === 'low' ? (
                  <span className="text-cyan-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Ultra-Perf</span>
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>High FX</span>
                  </span>
                )}
              </div>
              {hasPresetChange && (
                <span className="text-[9px] text-cyan-400/90 font-mono">
                  ({currentPerfMode === 'low' ? 'Ultra' : 'High'} &rarr; {newPerfMode === 'low' ? 'Ultra' : 'High'})
                </span>
              )}
            </div>

            {/* Target FPS Box */}
            <div className={`p-2.5 rounded-2xl border flex flex-col gap-1 ${
              hasFpsChange ? 'bg-emerald-950/60 border-emerald-500/50' : 'bg-slate-950/40 border-slate-800'
            }`}>
              <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Target FPS Limit</span>
              <div className="flex items-center gap-1 font-mono font-bold text-[11px] mt-0.5 text-emerald-300">
                <span>{newTargetFps} FPS Cap</span>
              </div>
              {hasFpsChange && (
                <span className="text-[9px] text-emerald-400/90 font-mono">
                  ({currentTargetFps} &rarr; {newTargetFps} FPS)
                </span>
              )}
            </div>

            {/* Texture Quality Box */}
            <div className={`p-2.5 rounded-2xl border flex flex-col gap-1 ${
              hasTexChange ? 'bg-amber-950/60 border-amber-500/50' : 'bg-slate-950/40 border-slate-800'
            }`}>
              <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Textures</span>
              <div className="flex items-center gap-1 font-mono font-bold text-[11px] mt-0.5 text-amber-300">
                <span>{newTextureQuality === 'low' ? 'Low VRAM' : 'High Mip'}</span>
              </div>
              {hasTexChange && (
                <span className="text-[9px] text-amber-400/90 font-mono">
                  ({currentTextureQuality === 'low' ? 'Low' : 'High'} &rarr; {newTextureQuality === 'low' ? 'Low' : 'High'})
                </span>
              )}
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer text-xs flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Confirm & Reload Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
