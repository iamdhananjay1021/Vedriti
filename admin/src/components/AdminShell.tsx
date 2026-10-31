'use client';

import React, { useState } from 'react';
import {
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  Smartphone,
  Layers,
  LogOut,
  Menu,
  Moon,
  ScrollText,
  Settings,
  ShoppingBag,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type AdminTab = 'overview' | 'home' | 'bookings' | 'schedule' | 'kundli' | 'orders' | 'catalog' | 'devotees' | 'settings';

export const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'home', label: 'Home Screen', icon: Smartphone },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'schedule', label: 'Schedule & Slots', icon: CalendarClock },
  { id: 'kundli', label: 'Kundli Requests', icon: ScrollText },
  { id: 'orders', label: 'Kit Orders', icon: ShoppingBag },
  { id: 'catalog', label: 'Pujas & Products', icon: Layers },
  { id: 'devotees', label: 'Devotees', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface Props {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  email: string;
  onLogout: () => void;
  badges: Partial<Record<AdminTab, number>>;
  children: React.ReactNode;
}

export function AdminShell({ active, onChange, email, onLogout, badges, children }: Props) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = TABS.find((t) => t.id === active);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        const badge = badges[id];
        return (
          <button
            key={id}
            onClick={() => {
              onChange(id);
              setMenuOpen(false);
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              isActive ? 'bg-[var(--saffron)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {badge ? (
              <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/25' : 'bg-[var(--saffron)] text-white'}`}>{badge}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-3 border-b border-[var(--border-color)] px-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--saffron)] text-2xl text-white">ॐ</div>
      <div>
        <p className="text-lg font-bold leading-tight">VedRit</p>
        <p className="text-xs text-[var(--text-muted)]">Pandit Ji Admin</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)] md:flex">
        {brand}
        <div className="flex-1 overflow-y-auto">{nav}</div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between pr-2">
              {brand}
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 hover:bg-[var(--bg-hover)]" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
          </aside>
        </div>
      ) : null}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 px-4 backdrop-blur">
          <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 hover:bg-[var(--bg-hover)] md:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="flex-1 truncate text-lg font-bold">{current?.label}</h1>
          <span className="hidden text-sm text-[var(--text-muted)] sm:block">{email}</span>
          <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-[var(--bg-hover)]" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={onLogout} className="rounded-lg p-2 hover:bg-[var(--bg-hover)]" aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <main className="mx-auto w-full max-w-7xl p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
