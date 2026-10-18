import React from 'react';
import { X, Shield, Sun, Leaf, Droplets, Flame, AlertCircle, Sparkles, Navigation, Layers, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorialLibrary?: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onOpenTutorialLibrary }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">How to Play Hexa Grove</h2>
            <p className="text-xs text-slate-500">Master building on the outskirts of the procedural forest</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-sm text-slate-700">
          {/* Tutorial Library shortcut */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-amber-950">
                Tutorial Library
              </div>
              <div className="text-[10.5px] text-amber-800">
                Replay any tutorial you've encountered. Progress tracks automatically.
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenTutorialLibrary?.();
                onClose();
              }}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-[11px] shadow-md transition-colors cursor-pointer"
            >
              Open
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-colors cursor-pointer"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
