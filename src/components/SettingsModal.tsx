import React from 'react';
import { Volume2, VolumeX, RotateCcw, X, HelpCircle, Sliders, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetTutorial?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  soundEnabled,
  onToggleSound,
  onResetTutorial,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide">Settings</h3>
              <p className="text-[10px] text-slate-400">Audio, Controls & Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 text-slate-800 text-xs">
          {/* Sound Setting */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  soundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-bold block">Sound Effects</span>
                <span className="text-[10px] text-slate-500">Audio cues for placement, victory & alerts</span>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Controls Quick Ref */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
            <span className="font-bold text-[11px] text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
              <span>Control Shortcuts</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-600">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-900 block">Left-Click:</strong> Place / Pick up tile
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-900 block">Right-Click:</strong> Return tile / cluster
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-900 block">'R' Key:</strong> Rotate giant cluster
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-900 block">Drag & Pan:</strong> Orbit & zoom camera
              </div>
            </div>
          </div>

          {/* Tutorial Reset */}
          {onResetTutorial && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div>
                <span className="font-bold text-amber-950 block">Replay Tutorials</span>
                <span className="text-[10px] text-amber-800">Jump back to Level 1 with full interactive guidance</span>
              </div>
              <button
                onClick={() => {
                  onResetTutorial();
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            </div>
          )}

          {/* Done Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Save & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
