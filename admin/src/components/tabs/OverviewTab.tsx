'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  Heart,
  IndianRupee,
  Layers,
  MessageCircle,
  Moon,
  Package,
  Phone,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { PanchangData, Stats } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import {
  BOOKING_STATUS,
  formatDate,
  formatDateTime,
  formatTime,
  KUNDLI_STATUS,
  KUNDLI_TYPES,
  MODE_LABELS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  rupees,
  telLink,
  TONE,
  waLink,
} from '../../lib/format';
import { Badge, Button, Card, ErrorBox, Spinner } from '../ui';
import type { AdminTab } from '../AdminShell';

type Lang = 'en' | 'hi';

const I18N = {
  en: {
    pageTitle: 'Temple & Rituals Dashboard',
    pageSubtitle: 'Real-time daily operations, upcoming ritual slots, devotee offerings, and live Vedic panchang.',
    refreshBtn: 'Refresh',
    panchangTitle: 'Daily Vedic Panchang & Muhurat',
    activeMuhurat: 'Active Auspicious Period',
    tithi: 'Tithi (Lunar Day)',
    nakshatra: 'Nakshatra (Constellation)',
    yoga: 'Auspicious Yoga',
    pakshaSamvat: 'Paksha & Samvat',
    abhijit: 'Abhijit Muhurat',
    rahuKaal: 'Rahu Kaal (Inauspicious)',
    todaysBookings: "Today's Bookings",
    todaysBookingsSub: 'Rituals scheduled today',
    awaitingConfirm: 'Awaiting Confirm',
    awaitingConfirmSub: 'Pending bookings to review',
    upcomingBookings: 'Upcoming Rituals',
    upcomingBookingsSub: 'Future scheduled pujas',
    openKundli: 'Open Kundli',
    openKundliSub: 'Awaiting Pandit Ji reply',
    ordersToShip: 'Orders to Ship',
    ordersToShipSub: 'Kit orders pending dispatch',
    totalDevotees: 'Total Devotees',
    totalDevoteesSub: 'Registered yajman community',
    financialOverview: 'Spiritual Offerings & Revenue',
    monthOfferings: 'This Month Offerings',
    todayOfferings: "Today's Collection",
    allTimeTotal: 'All-Time Total Offerings',
    pujasAppointments: 'Pujas & Consultations',
    samagriKits: 'Samagri & Puja Kits',
    kundliAstro: 'Kundli & Jyotish',
    quickActions: 'Operational Shortcuts',
    actionSchedule: 'Manage Daily Slots & Day Off',
    actionBookings: 'Confirm Pending Bookings',
    actionKundli: 'Answer Kundli Inquiries',
    actionOrders: 'Process Store Shipments',
    actionDevotees: 'Browse Devotee Records',
    nextBookingsTitle: 'Imminent & Next Rituals',
    viewAll: 'View all',
    noUpcoming: 'No upcoming bookings scheduled.',
    recentOrdersTitle: 'Kit Orders Needing Dispatch',
    noOrders: 'No open orders waiting for shipment.',
    openKundliTitle: 'Kundli Inquiries Awaiting Response',
    noKundli: 'All kundli inquiries have been answered.',
    answerNow: 'Answer Now',
    lowStockTitle: 'Low Stock Samagri Warning',
    lowStockSub: 'Items requiring restock soon.',
    catalogPlatform: 'Catalog & System Health',
    activePujas: 'Active Pujas',
    activeProducts: 'Spiritual Products',
    activeDevoteesRatio: 'Profile Completed Devotees',
    manageBooking: 'Manage',
  },
  hi: {
    pageTitle: 'मंदिर एवं अनुष्ठान डैशबोर्ड',
    pageSubtitle: 'दैनिक पूजा संचालन, आगामी स्लॉट्स, यजमान अर्पण एवं लाइव वैदिक पंचांग अवलोकन।',
    refreshBtn: 'ताज़ा करें',
    panchangTitle: 'दैनिक वैदिक पंचांग एवं शुभ मुहूर्त',
    activeMuhurat: 'शुभ काल सक्रिय',
    tithi: 'दैनिक तिथि',
    nakshatra: 'नक्षत्र',
    yoga: 'शुभ योग',
    pakshaSamvat: 'पक्ष एवं संवत',
    abhijit: 'अभिजीत मुहूर्त',
    rahuKaal: 'राहुकाल (वर्जित)',
    todaysBookings: 'आज के अनुष्ठान',
    todaysBookingsSub: 'आज निर्धारित पूजा स्लॉट्स',
    awaitingConfirm: 'अनुमोदन प्रतीक्षारत',
    awaitingConfirmSub: 'समीक्षा हेतु लंबित बुकिंग',
    upcomingBookings: 'आगामी अनुष्ठान',
    upcomingBookingsSub: 'भविष्य के निर्धारित स्लॉट्स',
    openKundli: 'लंबित कुंडली परामर्श',
    openKundliSub: 'पंडित जी के उत्तर हेतु प्रतीक्षारत',
    ordersToShip: 'सामग्री डिस्पैच',
    ordersToShipSub: 'भेजने हेतु तैयार किट ऑर्डर्स',
    totalDevotees: 'पंजीकृत यजमान',
    totalDevoteesSub: 'कुल वेदरीति समुदाय',
    financialOverview: 'आध्यात्मिक अर्पण व आय विवरण',
    monthOfferings: 'इस माह का अर्पण (मासिक)',
    todayOfferings: 'आज का अर्पण (दैनिक)',
    allTimeTotal: 'कुल समग्र अर्पण (All-time)',
    pujasAppointments: 'पूजा व अनुष्ठान',
    samagriKits: 'सामग्री व किट ऑर्डर्स',
    kundliAstro: 'कुंडली व ज्योतिष',
    quickActions: 'त्वरित संचालन शॉर्टकट',
    actionSchedule: 'दैनिक स्लॉट व अवकाश प्रबंधन',
    actionBookings: 'लंबित पूजा बुकिंग पुष्ट करें',
    actionKundli: 'कुंडली प्रश्नों का उत्तर दें',
    actionOrders: 'सामग्री ऑर्डर्स डिस्पैच करें',
    actionDevotees: 'यजमान सूची देखें',
    nextBookingsTitle: 'आसन्न एवं आगामी पूजा अनुष्ठान',
    viewAll: 'सभी देखें',
    noUpcoming: 'कोई आगामी बुकिंग उपलब्ध नहीं है।',
    recentOrdersTitle: 'डिस्पैच हेतु लंबित सामग्री ऑर्डर्स',
    noOrders: 'कोई लंबित किट ऑर्डर नहीं है।',
    openKundliTitle: 'परामर्श प्रतीक्षा में कुंडली प्रश्न',
    noKundli: 'सभी कुंडली प्रश्नों का उत्तर दिया जा चुका है।',
    answerNow: 'उत्तर दें',
    lowStockTitle: 'सामग्री कम स्टॉक चेतावनी',
    lowStockSub: 'ये वस्तुएं शीघ्र समाप्त होने वाली हैं।',
    catalogPlatform: 'कैटलॉग एवं सिस्टम स्थिति',
    activePujas: 'सक्रिय पूजा अनुष्ठान',
    activeProducts: 'सामग्री व आध्यात्मिक उत्पाद',
    activeDevoteesRatio: 'पूर्ण प्रोफ़ाइल वाले यजमान',
    manageBooking: 'प्रबंधन',
  },
};

export function OverviewTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [lang, setLang] = useState<Lang>('en');
  const [panchang, setPanchang] = useState<PanchangData | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vedrit_admin_lang');
      if (saved === 'hi' || saved === 'en') setLang(saved);
    } catch {}
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem('vedrit_admin_lang', l);
    } catch {}
  };

  const t = I18N[lang];

  const fetcher = useCallback(async () => {
    const statsData = await adminApi.stats();
    return statsData;
  }, []);

  const { data: stats, error, reload: loadStats } = useLoader(fetcher);

  useEffect(() => {
    adminApi.panchang().then(setPanchang).catch(() => {});
  }, []);

  if (error) return <ErrorBox message={error} onRetry={loadStats} />;
  if (!stats) return <Spinner />;

  const totalRev = stats.revenue.total || 1;
  const bookingShare = Math.round(((stats.revenue.bookings || 0) / totalRev) * 100);
  const orderShare = Math.round(((stats.revenue.orders || 0) / totalRev) * 100);
  const kundliShare = Math.round(((stats.revenue.kundli || 0) / totalRev) * 100);

  // Helper to remove redundant english brackets when displaying in hindi/clean format
  const cleanPanchangText = (text?: string) => {
    if (!text) return '—';
    if (lang === 'hi') {
      return text.replace(/\s*\([^)]*\)/g, '').trim();
    }
    return text.trim();
  };

  const tiles = [
    {
      label: t.todaysBookings,
      sub: t.todaysBookingsSub,
      value: stats.todaysBookings,
      icon: CalendarCheck,
      tab: 'bookings' as AdminTab,
      highlight: stats.todaysBookings > 0,
      badgeColor: 'text-[var(--saffron)]',
      bgColor: 'bg-[var(--saffron)]/15 border border-[var(--saffron)]/30',
    },
    {
      label: t.awaitingConfirm,
      sub: t.awaitingConfirmSub,
      value: stats.pendingBookings,
      icon: Clock,
      tab: 'bookings' as AdminTab,
      highlight: stats.pendingBookings > 0,
      badgeColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/15 border border-amber-500/30',
    },
    {
      label: t.upcomingBookings,
      sub: t.upcomingBookingsSub,
      value: stats.upcomingBookings,
      icon: Flame,
      tab: 'bookings' as AdminTab,
      highlight: false,
      badgeColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/15 border border-emerald-500/30',
    },
    {
      label: t.openKundli,
      sub: t.openKundliSub,
      value: stats.openKundli,
      icon: ScrollText,
      tab: 'kundli' as AdminTab,
      highlight: stats.openKundli > 0,
      badgeColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/15 border border-purple-500/30',
    },
    {
      label: t.ordersToShip,
      sub: t.ordersToShipSub,
      value: stats.openOrders,
      icon: ShoppingBag,
      tab: 'orders' as AdminTab,
      highlight: stats.openOrders > 0,
      badgeColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/15 border border-blue-500/30',
    },
    {
      label: t.totalDevotees,
      sub: `+${stats.newUsersThisMonth || 0} this month`,
      value: stats.totalUsers,
      icon: Users,
      tab: 'devotees' as AdminTab,
      highlight: false,
      badgeColor: 'text-[var(--gold)]',
      bgColor: 'bg-amber-500/15 border border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              {t.pageTitle}
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            {t.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Bilingual Switcher */}
          <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 text-xs font-bold shadow-xs">
            <button
              onClick={() => changeLang('en')}
              className={`rounded-lg px-3.5 py-1.5 transition ${
                lang === 'en'
                  ? 'bg-[var(--saffron)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLang('hi')}
              className={`rounded-lg px-3.5 py-1.5 transition ${
                lang === 'hi'
                  ? 'bg-[var(--saffron)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              हिंदी
            </button>
          </div>

          <Button variant="outline" onClick={loadStats} className="text-xs py-2 font-bold shadow-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[var(--saffron)]" />
            {t.refreshBtn}
          </Button>
        </div>
      </div>

      {/* Auspicious Daily Vedic Panchang Banner (Redesigned with 4 Structured Glass Cards) */}
      {panchang ? (
        <Card className="relative overflow-hidden border-2 border-[var(--gold)]/40 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-card)] to-[var(--bg-surface)] p-5 sm:p-6 shadow-md">
          {/* Header Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color)] pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--gold)]/20 text-[var(--gold)]">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-heading font-black uppercase tracking-wider text-[var(--saffron)]">
                {t.panchangTitle}
              </span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                • {panchang.date}
              </span>
            </div>

            {panchang.isAbhijitActiveNow ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/15 px-3 py-1 text-xs font-extrabold text-green-800 dark:text-green-300 shadow-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                {t.activeMuhurat}
              </span>
            ) : null}
          </div>

          {/* 4 Dedicated Vedic Cards */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Tithi Card */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-xs transition hover:border-[var(--gold)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                <Moon className="h-3.5 w-3.5 text-[var(--gold)]" />
                <span>{t.tithi}</span>
              </div>
              <p className="mt-1.5 text-sm sm:text-base font-heading font-extrabold text-[var(--text-primary)]">
                {cleanPanchangText(panchang.tithi)}
              </p>
            </div>

            {/* Nakshatra Card */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-xs transition hover:border-[var(--saffron)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--saffron)]" />
                <span>{t.nakshatra}</span>
              </div>
              <p className="mt-1.5 text-sm sm:text-base font-heading font-extrabold text-[var(--saffron)]">
                {cleanPanchangText(panchang.nakshatra)}
              </p>
            </div>

            {/* Yoga Card */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-xs transition hover:border-emerald-500">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                <Flame className="h-3.5 w-3.5 text-emerald-500" />
                <span>{t.yoga}</span>
              </div>
              <p className="mt-1.5 text-sm sm:text-base font-heading font-extrabold text-emerald-700 dark:text-emerald-300">
                {cleanPanchangText(panchang.yoga)}
              </p>
            </div>

            {/* Paksha & Samvat Card */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-xs transition hover:border-purple-500">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                <Sun className="h-3.5 w-3.5 text-purple-500" />
                <span>{t.pakshaSamvat}</span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-heading font-bold text-[var(--text-primary)] truncate">
                {cleanPanchangText(panchang.paksha)} • {cleanPanchangText(panchang.vikramSamvat)}
              </p>
            </div>
          </div>

          {/* Muhurat Bar with Distinct Capsules */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-1 text-xs">
            {/* Abhijit Muhurat Capsule */}
            <div className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-3.5 py-2 font-bold text-green-900 dark:text-green-200 shadow-xs">
              <Sun className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>
                {t.abhijit}: <strong className="font-extrabold">{panchang.abhijitMuhurat}</strong>
              </span>
            </div>

            {/* Rahu Kaal Capsule */}
            <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 font-bold text-red-900 dark:text-red-200 shadow-xs">
              <Moon className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>
                {t.rahuKaal}: <strong className="font-extrabold">{panchang.rahuKaal}</strong>
              </span>
            </div>

            {/* Sunrise & Sunset */}
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-2 font-semibold text-[var(--text-secondary)] shadow-xs">
              <span className="flex items-center gap-1.5">
                <Sunrise className="h-4 w-4 text-amber-500" /> {panchang.sunrise}
              </span>
              <span className="text-[var(--border-color)]">|</span>
              <span className="flex items-center gap-1.5">
                <Sunset className="h-4 w-4 text-orange-500" /> {panchang.sunset}
              </span>
            </div>
          </div>

          {/* Auspicious Blessing Quote */}
          {panchang.auspiciousMessage ? (
            <div className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]/60 px-4 py-3 text-xs font-medium italic text-[var(--text-secondary)] shadow-xs">
              &ldquo;{panchang.auspiciousMessage}&rdquo;
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* 6 Executive KPI Operation Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map(({ label, sub, value, icon: Icon, tab, highlight, badgeColor, bgColor }) => (
          <button key={label} onClick={() => onNavigate(tab)} className="text-left group transition focus:outline-none">
            <Card
              className={`h-full p-4 sm:p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--saffron)] ${
                highlight ? 'border-2 border-[var(--saffron)] bg-[var(--saffron-light)]/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${bgColor}`}>
                  <Icon className={`h-5 w-5 ${badgeColor}`} />
                </div>
                {highlight ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--saffron)] animate-pulse" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" />
                )}
              </div>
              <p className="mt-3.5 text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
                {value}
              </p>
              <p className="mt-1 font-bold text-xs text-[var(--text-primary)] truncate">{label}</p>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--text-secondary)] truncate">{sub}</p>
            </Card>
          </button>
        ))}
      </div>

      {/* Financial Offerings & Revenue Breakdown */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Revenue Card */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-2 uppercase tracking-wider font-heading">
                <IndianRupee className="h-4 w-4 text-[var(--gold)]" />
                {t.financialOverview}
              </span>
              <span className="rounded-full border border-green-500/30 bg-green-500/15 px-3 py-0.5 text-[11px] font-extrabold text-green-800 dark:text-green-300">
                Active
              </span>
            </div>

            <div className="mt-5">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">{t.monthOfferings}</span>
              <p className="mt-1 text-3xl sm:text-4xl font-heading font-black tracking-tight text-[var(--text-primary)]">
                {rupees(stats.revenue.month)}
              </p>
              {stats.revenue.today ? (
                <p className="mt-2 text-xs font-bold text-green-700 dark:text-green-400">
                  + {rupees(stats.revenue.today)} {t.todayOfferings}
                </p>
              ) : null}
            </div>

            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="font-semibold text-[var(--text-secondary)]">{t.allTimeTotal}</span>
                <span className="text-base font-heading font-black text-[var(--gold)]">{rupees(stats.revenue.total)}</span>
              </div>
            </div>
          </div>

          {/* Revenue Stream Progress Bars */}
          <div className="mt-6 space-y-4 border-t border-[var(--border-color)] pt-5 text-xs">
            <div>
              <div className="flex justify-between font-bold">
                <span className="text-[var(--text-secondary)]">{t.pujasAppointments}</span>
                <span className="text-[var(--text-primary)] font-extrabold">{rupees(stats.revenue.bookings)} ({bookingShare}%)</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--saffron)] transition-all" style={{ width: `${bookingShare}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold">
                <span className="text-[var(--text-secondary)]">{t.samagriKits}</span>
                <span className="text-[var(--text-primary)] font-extrabold">{rupees(stats.revenue.orders)} ({orderShare}%)</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${orderShare}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold">
                <span className="text-[var(--text-secondary)]">{t.kundliAstro}</span>
                <span className="text-[var(--text-primary)] font-extrabold">{rupees(stats.revenue.kundli)} ({kundliShare}%)</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
                <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${kundliShare}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Imminent & Next Bookings (Upgraded Layout) */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg text-[var(--text-primary)]">{t.nextBookingsTitle}</h2>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">Upcoming rituals requiring preparations & sankalp</p>
            </div>
            <button
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--saffron)] hover:underline"
              onClick={() => onNavigate('bookings')}
            >
              {t.viewAll} ({stats.upcomingBookings})
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {stats.nextBookings.length ? (
            <div className="space-y-3.5">
              {stats.nextBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-xs transition hover:border-[var(--saffron)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-[var(--saffron)]">#{b.bookingId}</span>
                        <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">{b.title}</h4>
                        {b.packageName ? (
                          <span className="rounded-md bg-[var(--bg-hover)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                            {b.packageName}
                          </span>
                        ) : null}
                        <Badge tone={TONE[b.status]}>{BOOKING_STATUS[b.status]}</Badge>
                      </div>

                      {/* Structured Metadata Chips */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 font-semibold text-[var(--text-primary)]">
                          <Calendar className="h-3.5 w-3.5 text-[var(--saffron)]" />
                          {formatDate(b.date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 font-semibold text-[var(--text-primary)]">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          {formatTime(b.startTime)} ({b.durationMinutes}m)
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 font-semibold text-[var(--text-secondary)]">
                          <Users className="h-3.5 w-3.5 text-[var(--gold)]" />
                          {b.devoteeName}
                        </span>
                        {b.gotra ? (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                            गोत्र: {b.gotra}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:self-center">
                      <span className="font-heading font-black text-sm sm:text-base text-[var(--gold)]">{rupees(b.amount)}</span>
                      {b.phone ? (
                        <a
                          href={waLink(b.phone, `नमस्ते ${b.devoteeName} जी! वेदरीति से आपकी आगामी पूजा ${b.title} के संदर्भ में...`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-700 dark:text-green-300 hover:border-green-600 hover:bg-green-500/20"
                          title="WhatsApp devotee"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      ) : null}
                      <Button
                        variant="outline"
                        onClick={() => onNavigate('bookings')}
                        className="text-xs py-1.5 px-3 font-bold"
                      >
                        {t.manageBooking}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-[var(--text-secondary)] font-medium">
              <Calendar className="mx-auto h-8 w-8 text-[var(--border-color)]" />
              <p className="mt-2 font-bold">{t.noUpcoming}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Two Column Section: Open Kundli & Store Orders */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Open Kundli Requests Awaiting Response */}
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <h3 className="font-heading font-black text-base text-[var(--text-primary)]">{t.openKundliTitle}</h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">Questions and birth charts submitted by devotees</p>
            </div>
            <button
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
              onClick={() => onNavigate('kundli')}
            >
              {t.viewAll} ({stats.openKundli})
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {stats.pendingKundlis && stats.pendingKundlis.length ? (
            <div className="space-y-3">
              {stats.pendingKundlis.map((k) => (
                <div
                  key={k.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-purple-700 dark:text-purple-400">#{k.requestId}</span>
                      <span className="font-bold text-xs text-[var(--text-primary)]">
                        {KUNDLI_TYPES[k.type] || k.type}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {k.primaryPerson?.fullName} ({k.primaryPerson?.gender}) • DOB: {k.primaryPerson?.dateOfBirth}
                    </p>
                    {k.questions ? (
                      <p className="line-clamp-1 text-xs italic text-[var(--text-secondary)] font-medium">
                        &ldquo;{k.questions}&rdquo;
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('kundli')}
                      className="rounded-xl bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-800"
                    >
                      {t.answerNow}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-[var(--text-secondary)] font-medium">
              <ScrollText className="mx-auto h-8 w-8 text-[var(--border-color)]" />
              <p className="mt-2 font-bold">{t.noKundli}</p>
            </div>
          )}
        </Card>

        {/* Recent Kit Orders Needing Shipment */}
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <h3 className="font-heading font-black text-base text-[var(--text-primary)]">{t.recentOrdersTitle}</h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">Spiritual samagri orders awaiting packing & dispatch</p>
            </div>
            <button
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
              onClick={() => onNavigate('orders')}
            >
              {t.viewAll} ({stats.openOrders})
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {stats.recentOrders && stats.recentOrders.length ? (
            <div className="space-y-3">
              {stats.recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700 dark:text-blue-400">#{o.orderId}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{o.name}</span>
                    </div>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {o.items?.length || 0} items • Deliver to {o.city} ({o.pinCode})
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-heading font-black text-xs text-[var(--gold)]">{rupees(o.totalAmount)}</span>
                    <Badge tone={TONE[o.status]}>{ORDER_STATUS[o.status]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-[var(--text-secondary)] font-medium">
              <ShoppingBag className="mx-auto h-8 w-8 text-[var(--border-color)]" />
              <p className="mt-2 font-bold">{t.noOrders}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Low Stock & Catalog Health Status */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Low Stock Warning */}
        {stats.lowStock && stats.lowStock.length ? (
          <Card className="border-2 border-red-500/40 bg-red-500/5 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h3 className="font-heading font-black text-sm text-red-700 dark:text-red-400">{t.lowStockTitle}</h3>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">• {t.lowStockSub}</span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {stats.lowStock.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 text-xs shadow-xs"
                >
                  <span className="font-bold text-[var(--text-primary)]">{p.name}</span>
                  <Badge tone={p.stockQuantity === 0 ? 'red' : 'amber'}>
                    {p.stockQuantity === 0 ? 'Out of Stock' : `${p.stockQuantity} left`}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2.5 text-green-800 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="font-heading font-black text-sm">Spiritual Samagri Stock Healthy</h3>
            </div>
            <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">All catalog puja kits and items have sufficient inventory.</p>
          </Card>
        )}

        {/* Quick Operational Shortcuts */}
        <Card className="p-6">
          <h3 className="font-heading font-black text-sm text-[var(--text-primary)] mb-3">{t.quickActions}</h3>
          <div className="space-y-1 text-xs font-bold">
            <button
              onClick={() => onNavigate('schedule')}
              className="flex w-full items-center justify-between rounded-xl p-2.5 transition hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
            >
              <span className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 text-[var(--saffron)]" />
                {t.actionSchedule}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </button>

            <button
              onClick={() => onNavigate('bookings')}
              className="flex w-full items-center justify-between rounded-xl p-2.5 transition hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
            >
              <span className="flex items-center gap-2.5">
                <Flame className="h-4 w-4 text-[var(--saffron)]" />
                {t.actionBookings}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </button>

            <button
              onClick={() => onNavigate('kundli')}
              className="flex w-full items-center justify-between rounded-xl p-2.5 transition hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
            >
              <span className="flex items-center gap-2.5">
                <ScrollText className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                {t.actionKundli}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </button>

            <button
              onClick={() => onNavigate('orders')}
              className="flex w-full items-center justify-between rounded-xl p-2.5 transition hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                {t.actionOrders}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </button>

            <button
              onClick={() => onNavigate('devotees')}
              className="flex w-full items-center justify-between rounded-xl p-2.5 transition hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]"
            >
              <span className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-[var(--gold)]" />
                {t.actionDevotees}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
export { OverviewTab as DashboardTab };
