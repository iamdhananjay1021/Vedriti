'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail, Sparkles } from 'lucide-react';
import { adminApi, tokenStore, errorMessage } from '../lib/api';
import { Button } from './ui';

export function LoginForm({ onLoggedIn }: { onLoggedIn: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const res = await adminApi.login(cleanEmail, cleanPass);
      tokenStore.set(res.token);
      onLoggedIn(res.email);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('admin8485@#');
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl transition"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#B84E18] to-[#E06E2E] text-3xl font-bold text-white shadow-md">
            ॐ
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[var(--text-primary)]">VedRit Admin</h1>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Manage bookings, rituals, devotees & orders</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <Mail className="h-3.5 w-3.5 text-[var(--saffron)]" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adminved7084@gmail.com"
              required
              className="w-full rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--saffron)] focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <KeyRound className="h-3.5 w-3.5 text-[var(--saffron)]" />
                <span>Password</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--saffron)] hover:underline"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin8485@#"
                required
                className="w-full rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-2.5 pr-10 text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--saffron)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={loading} className="mt-5 w-full py-2.5 text-sm font-bold shadow-md">
          Sign In to Dashboard
        </Button>

        {/* Quick autofill helper chips */}
        <div className="mt-5 border-t border-[var(--border-color)] pt-3 text-center">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Quick Fill Verified Credentials:</p>
          <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => handleQuickFill('adminved7084@gmail.com')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--saffron)] hover:text-[var(--saffron)]"
            >
              <Sparkles className="h-3 w-3 text-[var(--saffron)]" />
              adminved7084
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin7084@gmail.com')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--saffron)] hover:text-[var(--saffron)]"
            >
              <Sparkles className="h-3 w-3 text-[var(--saffron)]" />
              admin7084
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[10.5px] font-semibold text-[var(--text-muted)]">
          Managed by Urbexon Software Solutions LLP
        </p>
      </form>
    </div>
  );
}
