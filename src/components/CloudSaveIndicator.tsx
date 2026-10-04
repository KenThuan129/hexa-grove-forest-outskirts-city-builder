// src/components/CloudSaveIndicator.tsx

import React, { useEffect, useState } from 'react';
import { Cloud, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { SyncStatus } from '../hooks/useCloudSaveSync';

interface CloudSaveIndicatorProps {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

function relativeTime(fromMs: number, nowMs: number): string {
  const s = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export const CloudSaveIndicator: React.FC<CloudSaveIndicatorProps> = ({
  status,
  lastSyncedAt,
  error,
  onRetry,
  className = '',
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (status !== 'synced' || !lastSyncedAt) return;
    const t = setInterval(() => setTick(n => n + 1), 15_000);
    return () => clearInterval(t);
  }, [status, lastSyncedAt]);

  if (status === 'signed-out') return null;

  const base =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl backdrop-blur-md shadow-xl text-xs font-bold border transition-colors';

  if (status === 'syncing') {
    return (
      <div className={`${base} bg-slate-900/90 border-slate-700 text-amber-300 ${className}`}>
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Syncing…</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className={`${base} bg-rose-950/90 border-rose-500/50 text-rose-200 hover:bg-rose-900/90 cursor-pointer ${className}`}
        title={error ?? 'Sync failed'}
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span className="hidden sm:inline">Sync failed — Retry</span>
      </button>
    );
  }

  if (status === 'synced') {
    const label = lastSyncedAt ? relativeTime(lastSyncedAt, Date.now()) : 'Synced';
    return (
      <div
        className={`${base} bg-emerald-950/80 border-emerald-500/40 text-emerald-200 ${className}`}
        title={`Last synced: ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'n/a'}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">{label}</span>
      </div>
    );
  }

  return (
    <div className={`${base} bg-slate-900/80 border-slate-700 text-slate-300 ${className}`}>
      <Cloud className="w-3.5 h-3.5 text-slate-400" />
      <span className="hidden sm:inline">Cloud</span>
    </div>
  );
};