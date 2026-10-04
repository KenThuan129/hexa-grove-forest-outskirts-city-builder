// src/hooks/useCloudSaveSync.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CloudSaveBlob } from '../types/save';
import {
  blobsAreMeaningfullyDifferent,
  decideSyncDirection,
  readCloudBlob,
  readLocalBlob,
  readLocalDirty,
  writeCloudBlob,
  writeLocalBlob,
  writeLocalDirty,
} from '../utils/cloudSave';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'signed-out';

const DEBOUNCE_MS = 2000;
const RETRY_BASE_MS = 2000;
const RETRY_MAX_MS = 60_000;
const BROADCAST_CHANNEL = 'hexa_save_sync';

interface UseCloudSaveSyncOptions {
  userId: string | null;
  saveState: CloudSaveBlob;
  /** Called when a cloud blob should be applied to React state. */
  applyRemote: (blob: CloudSaveBlob) => void;
  /**
   * Called when the local and cloud blob are within the LWW tie window
   * and differ meaningfully. The consumer should render a modal and
   * call the provided `resolve` callback with the chosen blob.
   */
  onConflict?: (
    local: CloudSaveBlob,
    cloud: CloudSaveBlob,
    resolve: (chosen: 'local' | 'cloud') => void
  ) => void;
  onSynced?: (blob: CloudSaveBlob) => void;
}

interface UseCloudSaveSyncReturn {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
  /** Trigger an immediate push regardless of debounce. */
  flush: () => Promise<void>;
  /** Alias used by the indicator pill — retries the current blob. */
  forceSync: () => Promise<void>;
}

export function useCloudSaveSync({
  userId,
  saveState,
  applyRemote,
  onConflict,
  onSynced,
}: UseCloudSaveSyncOptions): UseCloudSaveSyncReturn {
  const [status, setStatus] = useState<SyncStatus>(userId ? 'idle' : 'signed-out');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Refs ────────────────────────────────────────────────────────
  const saveStateRef = useRef(saveState);
  saveStateRef.current = saveState;

  const applyRemoteRef = useRef(applyRemote);
  applyRemoteRef.current = applyRemote;

  const onConflictRef = useRef(onConflict);
  onConflictRef.current = onConflict;

  const onSyncedRef = useRef(onSynced);
  onSyncedRef.current = onSynced;

  const isInitialSyncedRef = useRef(false);
  const hydratedForUserRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  /** Set true during a remote-broadcast pull to prevent re-broadcast loops. */
  const isApplyingRemoteRef = useRef(false);

  // ── BroadcastChannel (cross-tab) ────────────────────────────────
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    broadcastRef.current = channel;

    channel.onmessage = (ev) => {
      if (ev.data?.type !== 'save-updated') return;
      if (ev.data?.userId !== userId) return;
      // Another tab just pushed. Refresh our local state from cloud
      // so this tab sees the newest save.
      (async () => {
        try {
          const cloud = await readCloudBlob(userId!);
          if (cloud) {
            isApplyingRemoteRef.current = true;
            applyRemoteRef.current(cloud);
            writeLocalBlob(cloud);
            writeLocalDirty(false);
            isDirtyRef.current = false;
            setLastSyncedAt(Date.now());
            setStatus('synced');
            setTimeout(() => { isApplyingRemoteRef.current = false; }, 0);
          }
        } catch {
          // Silent — the next local change or focus will retry
        }
      })();
    };

    return () => {
      channel.close();
      broadcastRef.current = null;
    };
  }, [userId]);

  // ── Clear retry timer ───────────────────────────────────────────
  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // ── Push ────────────────────────────────────────────────────────
  const push = useCallback(async (opts?: { isRetry?: boolean }) => {
    if (!userId) return;
    if (inFlightRef.current) {
      pendingRef.current = true;
      return;
    }

    inFlightRef.current = true;
    setStatus('syncing');
    setError(null);

    try {
      const blob = saveStateRef.current;
      await writeCloudBlob(userId, blob);
      writeLocalBlob(blob);
      writeLocalDirty(false);
      isDirtyRef.current = false;
      retryAttemptRef.current = 0;
      clearRetry();

      setLastSyncedAt(Date.now());
      setStatus('synced');
      onSyncedRef.current?.(blob);

      // Notify other tabs (skip if this push itself was triggered by a broadcast apply)
      if (!isApplyingRemoteRef.current && broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'save-updated', userId });
      }
    } catch (e: any) {
      const msg = e?.message ?? 'Sync failed';
      setError(msg);
      setStatus('error');

      // Schedule exponential backoff retry
      if (!opts?.isRetry || retryAttemptRef.current < 6) {
        retryAttemptRef.current += 1;
        const delay = Math.min(RETRY_BASE_MS * 2 ** (retryAttemptRef.current - 1), RETRY_MAX_MS);
        clearRetry();
        retryTimerRef.current = setTimeout(() => {
          void push({ isRetry: true });
        }, delay);
      }
    } finally {
      inFlightRef.current = false;

      // Coalesce a follow-up push if a change arrived mid-flight
      if (pendingRef.current) {
        pendingRef.current = false;
        void push();
      }
    }
  }, [userId, clearRetry]);

  // ── Public flush / forceSync ────────────────────────────────────
  const flush = useCallback(async () => {
    if (!userId) return;
    await push();
  }, [userId, push]);

  const forceSync = flush;

  // ── Initial sync on sign-in (runs once per user) ────────────────
  useEffect(() => {
    if (!userId) {
      setStatus('signed-out');
      isInitialSyncedRef.current = false;
      hydratedForUserRef.current = null;
      return;
    }

    if (hydratedForUserRef.current === userId) {
      isInitialSyncedRef.current = true;
      return;
    }

    let cancelled = false;
    (async () => {
      setStatus('syncing');
      try {
        const [local, cloud] = await Promise.all([
          Promise.resolve(readLocalBlob()),
          readCloudBlob(userId),
        ]);
        if (cancelled) return;

        // Conflict prompt path — timestamps within 60s AND meaningfully different
        if (local && cloud && blobsAreMeaningfullyDifferent(local, cloud)) {
          await new Promise<void>((resolveConflict) => {
            onConflictRef.current?.(local, cloud, (chosen) => {
              (async () => {
                try {
                  if (chosen === 'local') {
                    await writeCloudBlob(userId, local);
                    writeLocalBlob(local);
                    writeLocalDirty(false);
                    setLastSyncedAt(Date.now());
                    setStatus('synced');
                  } else {
                    isApplyingRemoteRef.current = true;
                    applyRemoteRef.current(cloud);
                    writeLocalBlob(cloud);
                    writeLocalDirty(false);
                    setLastSyncedAt(Date.now());
                    setStatus('synced');
                    setTimeout(() => { isApplyingRemoteRef.current = false; }, 0);
                  }
                } catch (e: any) {
                  setError(e?.message ?? 'Conflict resolution failed');
                  setStatus('error');
                } finally {
                  resolveConflict();
                }
              })();
            });
          });

          isInitialSyncedRef.current = true;
          hydratedForUserRef.current = userId;
          return;
        }

        // Check persisted dirty flag from a previous offline session
        const wasDirty = readLocalDirty();
        const dir = wasDirty && local ? 'push' : decideSyncDirection(local, cloud);

        if (dir === 'push' && local) {
          await writeCloudBlob(userId, local);
          writeLocalBlob(local);
          writeLocalDirty(false);
          isDirtyRef.current = false;
          setLastSyncedAt(Date.now());
          setStatus('synced');
        } else if (dir === 'pull' && cloud) {
          isApplyingRemoteRef.current = true;
          applyRemoteRef.current(cloud);
          writeLocalBlob(cloud);
          writeLocalDirty(false);
          setLastSyncedAt(Date.now());
          setStatus('synced');
          setTimeout(() => { isApplyingRemoteRef.current = false; }, 0);
        } else {
          await push();
        }

        isInitialSyncedRef.current = true;
        hydratedForUserRef.current = userId;
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? 'Initial sync failed');
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, push]);

  // ── Debounced push on saveState change ──────────────────────────
  useEffect(() => {
    if (!userId) return;
    if (!isInitialSyncedRef.current) return;

    isDirtyRef.current = true;
    writeLocalDirty(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (inFlightRef.current) {
        pendingRef.current = true;
      } else {
        void push();
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [saveState, userId, push]);

  // ── Flush on tab blur / unload ──────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const flushNow = () => {
      if (isDirtyRef.current && !inFlightRef.current) {
        void push();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushNow();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', flushNow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', flushNow);
    };
  }, [userId, push]);

  // ── Cleanup retry timer on unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      clearRetry();
    };
  }, [clearRetry]);

  return { status, lastSyncedAt, error, flush, forceSync };
}