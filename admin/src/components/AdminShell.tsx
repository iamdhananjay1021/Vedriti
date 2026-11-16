'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  CalendarDays,
  Flame,
  Languages,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Radio,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sun,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type AdminTab =
  | 'dashboard'
  | 'home'
  | 'bookings'
  | 'samuhik'
  | 'schedule'
  | 'kundli'
  | 'orders'
  | 'catalog'
  | 'devotees'
  | 'inquiries'
  | 'coupons'
  | 'announcements'
  | 'broadcasts'
  | 'staff'
  | 'settings';

export type AdminLanguage = 'en' | 'hi';

export const TAB_LABELS: Record<AdminLanguage, Record<AdminTab, string>> = {
  en: {
    dashboard: 'Dashboard',
    home: 'Home Screen',
    bookings: 'Bookings',
    samuhik: 'Samuhik Pujas',
    schedule: 'Schedule & Slots',
    kundli: 'Kundli Requests',
    orders: 'Kit Orders',
    catalog: 'Pujas & Products',
    devotees: 'Devotees',
    inquiries: 'Vedic Inquiries',
    coupons: 'Coupons & Offers',
    announcements: 'Broadcast Alerts',
    broadcasts: 'Email & SMS Broadcast',
    staff: 'Admin Team',
    settings: 'Settings',
  },
  hi: {
    dashboard: 'डैशबोर्ड (Dashboard)',
    home: 'होम स्क्रीन (Home)',
    bookings: 'पूजा बुकिंग्स (Bookings)',
    samuhik: 'सामूहिक पूजाएं',
    schedule: 'शेड्यूल व स्लॉट्स',
    kundli: 'कुंडली परामर्श (Kundli)',
    orders: 'सामग्री ऑर्डर (Orders)',
    catalog: 'पूजा व उत्पाद कैटलॉग',
    devotees: 'यजमान (Devotees)',
    inquiries: 'वैदिक पूछताछ (Inquiries)',
    coupons: 'कूपन व छूट (Coupons)',
    announcements: 'घोषणाएं (Broadcast)',
    broadcasts: 'ईमेल व SMS ब्रॉडकास्ट',
    staff: 'प्रबंधन टीम (Staff)',
    settings: 'सेटिंग्स (Settings)',
  },
};

export const TABS: { id: AdminTab; icon: React.ElementType }[] = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'home', icon: Smartphone },
  { id: 'bookings', icon: CalendarDays },
  { id: 'samuhik', icon: Flame },
  { id: 'schedule', icon: CalendarClock },
  { id: 'kundli', icon: ScrollText },
  { id: 'orders', icon: ShoppingBag },
  { id: 'catalog', icon: Layers },
  { id: 'devotees', icon: Users },
  { id: 'inquiries', icon: MessageSquare },
  { id: 'coupons', icon: Ticket },
  { id: 'announcements', icon: Radio },
  { id: 'broadcasts', icon: Send },
  { id: 'staff', icon: ShieldCheck },
  { id: 'settings', icon: Settings },
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
  const [lang, setLang] = useState<AdminLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('vedrit_admin_lang') as AdminLanguage;
    if (saved === 'en' || saved === 'hi') {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const next: AdminLanguage = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    localStorage.setItem('vedrit_admin_lang', next);
  };

  const nav = (
    <nav className="flex flex-col gap-1.5 p-3">
      {TABS.map(({ id, icon: Icon }) => {
        const isActive = id === active;
        const badge = badges[id];
        const label = TAB_LABELS[lang][id];
        return (
          <button
            key={id}
            onClick={() => {
              onChange(id);
              setMenuOpen(false);
            }}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
              isActive
                ? 'bg-gradient-to-r from-[var(--saffron)] to-amber-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left font-heading">{label}</span>
            {badge ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[var(--saffron)] text-white'
                }`}
              >
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-3 border-b border-[var(--border-color)] px-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
        ॐ
      </div>
      <div>
        <p className="text-lg font-heading font-black leading-tight tracking-tight text-[var(--text-primary)]">VedRit</p>
        <p className="text-[11px] font-bold text-[var(--text-muted)]">
          {lang === 'hi' ? 'पंडित जी एडमिन पोर्टल' : 'Pandit Ji Admin'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)] md:flex shadow-xs">
        {brand}
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-[var(--border-color)] p-3 text-center">
          <p className="text-[10.5px] font-semibold text-[var(--text-muted)]">
            Managed by Urbexon Software Solutions LLP
          </p>
        </div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--bg-surface)] shadow-2xl">
            <div className="flex items-center justify-between pr-2">
              {brand}
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-xl p-2 hover:bg-[var(--bg-hover)]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
            <div className="border-t border-[var(--border-color)] p-3 text-center">
              <p className="text-[10.5px] font-semibold text-[var(--text-muted)]">
                Managed by Urbexon Software Solutions LLP
              </p>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 px-5 sm:px-8 lg:px-10 backdrop-blur shadow-2xs">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-xl p-2 hover:bg-[var(--bg-hover)] md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="flex-1 truncate text-lg font-heading font-black tracking-tight text-[var(--text-primary)]">
            {TAB_LABELS[lang][active]}
          </h1>

          {/* Global Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-bold text-[var(--saffron)] hover:bg-[var(--bg-hover)] transition shadow-2xs cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>

          <span className="hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--text-secondary)] sm:block shadow-2xs">
            {email}
          </span>
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 hover:bg-[var(--bg-hover)] transition text-[var(--text-secondary)] cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-stone-600" />}
          </button>
          <button
            onClick={onLogout}
            className="rounded-xl p-2 hover:bg-red-500/10 hover:text-red-600 transition text-[var(--text-secondary)] cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-10 py-6 sm:py-8">
          {children}
          <footer className="mt-14 border-t border-[var(--border-color)] py-6 text-center">
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              {lang === 'hi'
                ? 'वेदरीति • पंडित जी एडमिन पोर्टल'
                : 'VedRit • Pandit Ji Admin Portal'}
            </p>
            <p className="mt-1 text-[11px] font-medium text-[var(--text-muted)]">
              Managed by Urbexon Software Solutions LLP
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
