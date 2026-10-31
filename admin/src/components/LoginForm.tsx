'use client';

import React, { useState } from 'react';
import { adminApi, tokenStore, errorMessage } from '../lib/api';
import { Button, Input } from './ui';

export function LoginForm({ onLoggedIn }: { onLoggedIn: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminApi.login(email.trim(), password);
      tokenStore.set(res.token);
      onLoggedIn(res.email);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--saffron)] text-4xl text-white">ॐ</div>
          <h1 className="mt-3 text-2xl font-bold">VedRit Admin</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage bookings, slots, kundli & orders</p>
        </div>
        <div className="space-y-3">
          <Input label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--red)]">{error}</p> : null}
        <Button type="submit" loading={loading} className="mt-5 w-full py-2.5">
          Login
        </Button>
      </form>
    </div>
  );
}
