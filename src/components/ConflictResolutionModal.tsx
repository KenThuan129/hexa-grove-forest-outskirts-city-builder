// src/components/ConflictResolutionModal.tsx

import React from 'react';
import { AlertTriangle, Cloud, HardDrive, Clock } from 'lucide-react';
import type { CloudSaveBlob } from '../types/save';
import { sounds } from '../utils/audio';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  local: CloudSaveBlob | null;
  cloud: CloudSaveBlob | null;
  onChoose: (chosen: 'local' | 'cloud') => void;
}

function fmtTime(ms?: number): string {
  if (!ms) return '—';
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '—';
  }
}

function fmtRel(ms?: number): string {
  if (!ms) return '—';
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const BlobPanel: React.FC<{
  title: string;
  icon: React.ReactNode;
  blob: CloudSaveBlob | null;
  accent: string;
  onPick: () => void;
  pickLabel: string;
}> = ({ title, icon, blob, accent, onPick, pickLabel }) => (
  <div
    className={`flex-1 rounded-2xl border-2 ${accent} bg-slate-950/70 p-4 flex flex-col gap-2`}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-black text-sm text-white">{title}</span>
    </div>

    {!blob ? (
      <div className="text-xs text-slate-400 italic py-4 text-center">
        (no save)
      </div>
    ) : (
      <>
        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-mono">
          <Clock className="w-3 h-3" />
          <span>{fmtTime(blob.updatedAt)}</span>
          <span className="text-slate-500">·</span>
          <span>{fmtRel(blob.updatedAt)}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono text-slate-300 mt-1">
          <span className="text-slate-500">Level</span>
          <span className="text-right text-white">{blob.highestCompletedLevel}</span>

          <span className="text-slate-500">Coins</span>
          <span className="text-right text-amber-300">{blob.coins}</span>

          <span className="text-slate-500">Leaves</span>
          <span className="text-right text-emerald-300">{blob.leaves}</span>

          <span className="text-slate-500">Chests</span>
          <span className="text-right text-white">{blob.claimedChestIds?.length ?? 0}</span>

          <span className="text-slate-500">Ticket</span>
          <span className="text-right text-white">{blob.hasGoldenTicket ? 'Yes' : 'No'}</span>
        </div>
      </>
    )}

    <button
      onClick={onPick}
      disabled={!blob}
      className={`mt-auto py-2 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
        blob
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
      }`}
    >
      {pickLabel}
    </button>
  </div>
);

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  local,
  cloud,
  onChoose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base text-white tracking-wide">
              Conflicting Saves Detected
            </h2>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Your local device save and cloud save diverged while offline. Choose which one to keep.
            </p>
          </div>
        </div>

        {/* Two-panel comparison */}
        <div className="flex flex-col sm:flex-row gap-3">
          <BlobPanel
            title="This Device (Local)"
            icon={<HardDrive className="w-4 h-4 text-cyan-300" />}
            blob={local}
            accent="border-cyan-500/60"
            onPick={() => {
              sounds.playVictory();
              onChoose('local');
            }}
            pickLabel="Keep Local Save"
          />

          <BlobPanel
            title="Cloud Save"
            icon={<Cloud className="w-4 h-4 text-emerald-300" />}
            blob={cloud}
            accent="border-emerald-500/60"
            onPick={() => {
              sounds.playVictory();
              onChoose('cloud');
            }}
            pickLabel="Keep Cloud Save"
          />
        </div>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          Whichever you choose will overwrite the other. This cannot be undone.
        </p>
      </div>
    </div>
  );
};