// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface SignUpResult {
  ok: boolean;
  error?: string;
}

export interface SignInResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  /** The current Supabase user, or null if signed out. */
  user: User | null;
  /** The current session, or null if signed out. */
  session: Session | null;
  /** True while the initial session is being restored from storage. */
  isLoading: boolean;
  /** True when the idle timer has fired and the player must re-auth. */
  isIdleSignedOut: boolean;
  /** Creates a new account with email + password. */
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  /** Signs in an existing account. */
  signIn: (email: string, password: string) => Promise<SignInResult>;
  /** Signs the current user out. Also clears the idle flag. */
  signOut: () => Promise<void>;
  /** Called by the sign-in modal after a successful re-auth to dismiss
   *  the idle prompt. */
  clearIdleSignedOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────
// Idle timeout configuration
// ─────────────────────────────────────────────────────────────────

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Events that reset the idle timer. Anything not in this list counts
// as idle — cursor parking, hovering without motion, time passing.
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'touchmove',
  'scroll',
  'focus',
];

// ─────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIdleSignedOut, setIsIdleSignedOut] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const signedInRef = useRef(false);

  // ── Session bootstrap + auth state subscription ─────────────
  useEffect(() => {
    let active = true;

    // 1. Load the current session (SDK reads it from its own storage).
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      signedInRef.current = Boolean(data.session?.user);
      setIsLoading(false);
    });

    // 2. Subscribe to future auth changes (sign in, sign out, token refresh).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      signedInRef.current = Boolean(nextSession?.user);
      // A successful sign-in clears any stale idle flag.
      if (nextSession?.user) {
        setIsIdleSignedOut(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ── Idle timer ──────────────────────────────────────────────
  // Reset on every user activity event. Fires after IDLE_TIMEOUT_MS
  // of silence, but only when a user is signed in.

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const armIdleTimer = useCallback(() => {
    clearIdleTimer();
    if (!signedInRef.current) return;
    idleTimerRef.current = window.setTimeout(async () => {
      // Idle timeout fired — soft sign-out.
      if (!signedInRef.current) return;
      setIsIdleSignedOut(true);
      signedInRef.current = false;
      try {
        await supabase.auth.signOut();
      } catch {
        // If the network is down, still clear local state.
      }
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimer]);

  useEffect(() => {
    if (!user) {
      clearIdleTimer();
      return;
    }
    armIdleTimer();

    const onActivity = () => {
      // Any tracked activity resets the timer.
      armIdleTimer();
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity);
      });
      clearIdleTimer();
    };
  }, [user, armIdleTimer, clearIdleTimer]);

  // ── Auth actions ────────────────────────────────────────────

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    []
  );

  const signOut = useCallback(async () => {
    clearIdleTimer();
    setIsIdleSignedOut(false);
    signedInRef.current = false;
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore — local state is cleared by onAuthStateChange
    }
  }, [clearIdleTimer]);

  const clearIdleSignedOut = useCallback(() => {
    setIsIdleSignedOut(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isIdleSignedOut,
      signUp,
      signIn,
      signOut,
      clearIdleSignedOut,
    }),
    [user, session, isLoading, isIdleSignedOut, signUp, signIn, signOut, clearIdleSignedOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}