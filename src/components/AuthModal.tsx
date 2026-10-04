// src/components/AuthModal.tsx

import React, { useCallback, useState } from 'react';
import {
  X,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/audio';

type AuthTab = 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  /**
   * 'guest' — the modal is being used to unlock a feature.
   * 'idle' — the idle timer fired and the player must re-enter credentials.
   */
  mode?: 'guest' | 'idle';
  /** Optional message shown at the top of the modal. */
  prompt?: string;
  onClose: () => void;
  /** Called after a successful sign-in or sign-up. */
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode = 'guest',
  prompt,
  onClose,
  onSuccess,
}) => {
  const { signIn, signUp, clearIdleSignedOut } = useAuth();

  const [tab, setTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const reset = useCallback(() => {
    setEmail('');
    setPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    // In idle mode, the player must not dismiss — they have to sign in.
    if (mode === 'idle') return;
    reset();
    onClose();
  }, [mode, reset, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        sounds.playWarning();
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        sounds.playWarning();
        return;
      }

      setIsSubmitting(true);
      setErrorMsg(null);

      if (tab === 'signin') {
        const res = await signIn(trimmedEmail, password);
        setIsSubmitting(false);
        if (!res.ok) {
          setErrorMsg(res.error ?? 'Sign in failed.');
          sounds.playWarning();
          return;
        }
        sounds.playVictory();
        clearIdleSignedOut();
        reset();
        onSuccess?.();
        onClose();
      } else {
        const res = await signUp(trimmedEmail, password);
        setIsSubmitting(false);
        if (!res.ok) {
          setErrorMsg(res.error ?? 'Sign up failed.');
          sounds.playWarning();
          return;
        }
        sounds.playVictory();
        setSuccessMsg('Account created! Signing you in…');
        // The auth state subscription will pick up the new session automatically.
        setTimeout(() => {
          clearIdleSignedOut();
          reset();
          onSuccess?.();
          onClose();
        }, 600);
      }
    },
    [
      isSubmitting,
      email,
      password,
      tab,
      signIn,
      signUp,
      clearIdleSignedOut,
      onSuccess,
      onClose,
      reset,
    ]
  );

  if (!isOpen) return null;

  const heading =
    mode === 'idle'
      ? 'Session Timed Out'
      : tab === 'signin'
      ? 'Sign In'
      : 'Create Account';

  const subtitle =
    mode === 'idle'
      ? 'You have been idle for a while. Sign in to resume your save.'
      : prompt ?? 'Sign in to unlock all features and sync your save to the cloud.';

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans"
      onClick={mode === 'idle' ? undefined : handleClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/40">
              {mode === 'idle' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : tab === 'signin' ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">
                {heading}
              </h2>
              <p className="text-[11px] text-slate-400">{subtitle}</p>
            </div>
          </div>

          {mode !== 'idle' && (
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabs (only in guest mode, not in idle mode) */}
        {mode !== 'idle' && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setTab('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'signin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'signup'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-2xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-lg transition-all cursor-pointer mt-1"
          >
            {isSubmitting
              ? 'Please wait…'
              : mode === 'idle'
              ? 'Resume Session'
              : tab === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          Your progress is stored securely in the cloud and synced across devices.
          {mode === 'idle' && ' You must sign in to continue — your in-game state is paused.'}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;