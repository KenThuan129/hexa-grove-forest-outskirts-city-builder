import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, AlertCircle, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface AdminAuthModalProps {
  isOpen: boolean;
  featureName?: string;
  onAuthenticate: (code: string) => boolean;
  onClose: () => void;
}

const VALID_ADMIN_CODES = ['252324442', 'ADMIN', 'admin', 'ADMIN2026', '8888'];

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  featureName = 'Admin Features',
  onAuthenticate,
  onClose,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = passcode.trim();

    if (!cleanCode) {
      setErrorMsg('Please enter the Admin Passcode');
      sounds.playWarning();
      return;
    }

    const isValid = VALID_ADMIN_CODES.includes(cleanCode) || onAuthenticate(cleanCode);

    if (isValid) {
      setErrorMsg(null);
      setIsSuccess(true);
      sounds.playVictory();
      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onClose();
      }, 700);
    } else {
      setErrorMsg('Invalid Passcode! Key required for Admin features.');
      sounds.playWarning();
    }
  };

  const handleQuickDemoUnlock = () => {
    setPasscode('252324442');
    setTimeout(() => {
      onAuthenticate('252324442');
      setIsSuccess(true);
      sounds.playVictory();
      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onClose();
      }, 700);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2">
                <span>ADMIN ACCESS REQUIRED</span>
                <span className="px-2 py-0.5 text-[9px] bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full font-mono">
                  Locked
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Enter Admin Code to unlock <strong className="text-amber-300">{featureName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State Overlay */}
        {isSuccess ? (
          <div className="p-6 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl text-emerald-200 flex flex-col items-center gap-2 text-center animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            <h3 className="text-sm font-extrabold text-white">ADMIN ACCESS UNLOCKED</h3>
            <p className="text-xs text-emerald-300/90">
              Granted full access to Level Editor, Challenger Mode, Try-Hard &amp; Golden Ticket!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="admin-code-input" className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Passcode</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Code: 252324442 or ADMIN</span>
              </div>

              <div className="relative">
                <input
                  id="admin-code-input"
                  type="password"
                  value={passcode}
                  onChange={e => {
                    setPasscode(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter passcode..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none font-mono tracking-widest transition-colors shadow-inner"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Lock Notice Info */}
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300">Feature Lock System</span>
                <span>
                  Challenger Mode, Try-Hard Mode, Golden Ticket, Level Editor, and Developer Utilities are protected by Admin Authentication.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleQuickDemoUnlock}
                className="px-3.5 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
              >
                Quick Unlock (Demo)
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>UNLOCK ADMIN ACCESS</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
