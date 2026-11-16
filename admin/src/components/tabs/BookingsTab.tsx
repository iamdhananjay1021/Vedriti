'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Globe,
  Heart,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { Booking, DayView, Stats } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import {
  BOOKING_STATUS,
  formatDate,
  formatDateTime,
  formatTime,
  MODE_LABELS,
  PAYMENT_STATUS,
  rupees,
  telLink,
  todayIst,
  TONE,
  waLink,
} from '../../lib/format';
import { exportToCsv } from '../../lib/exportCsv';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Pagination, Row, Select, Spinner, Textarea, useToast } from '../ui';

type Lang = 'en' | 'hi';
type Scope = 'upcoming' | 'today' | 'past' | 'all';

const SCOPES: { value: Scope; en: string; hi: string }[] = [
  { value: 'upcoming', en: 'Upcoming Rituals', hi: 'आगामी अनुष्ठान' },
  { value: 'today', en: "Today's Pujas", hi: 'आज के अनुष्ठान' },
  { value: 'past', en: 'Past / Completed', hi: 'पूर्व अनुष्ठान' },
  { value: 'all', en: 'All Bookings', hi: 'समग्र रिकॉर्ड्स' },
];

const I18N = {
  en: {
    pageTitle: 'Rituals & Puja Bookings',
    pageSubtitle: 'Manage devotee sankalp, upcoming puja slots, confirmations, video call links, and rescheduling.',
    todayPujas: "Today's Rituals",
    todaySub: 'Pujas scheduled today',
    pendingConfirm: 'Awaiting Confirm',
    pendingSub: 'Needs Pandit review',
    upcomingConfirmed: 'Upcoming Scheduled',
    upcomingSub: 'Confirmed future pujas',
    totalOfferings: 'Puja Offerings',
    totalOfferingsSub: 'Total booking dakshina',
    searchPlaceholder: 'Search booking ID, devotee name, phone, puja, gotra...',
    allStatuses: 'All Statuses',
    allServices: 'Pujas & Consultations',
    pujasOnly: 'Pujas Only',
    appointmentsOnly: 'Appointments Only',
    exportCsv: 'Export CSV',
    noBookingsFound: 'No ritual bookings found.',
    noBookingsSub: 'Bookings matching your current filter will appear here.',
    printReceipt: 'Print Sankalp Patra / Receipt',
    manageBtn: 'Manage Booking',
    whatsappBtn: 'WhatsApp Devotee',
    callBtn: 'Call Devotee',
  },
  hi: {
    pageTitle: 'पूजा एवं अनुष्ठान बुकिंग प्रबंधन',
    pageSubtitle: 'यजमान संकल्प, आगामी पूजा स्लॉट्स, वीडियो लिंक, एवं समय पुनर्निर्धारण (Reschedule) प्रबंधन।',
    todayPujas: 'आज के अनुष्ठान',
    todaySub: 'आज निर्धारित पूजा स्लॉट्स',
    pendingConfirm: 'अनुमोदन प्रतीक्षारत',
    pendingSub: 'समीक्षा हेतु लंबित बुकिंग',
    upcomingConfirmed: 'आगामी निर्धारित',
    upcomingSub: 'पुष्टीकृत भविष्य के स्लॉट्स',
    totalOfferings: 'कुल पूजा अर्पण',
    totalOfferingsSub: 'समग्र पूजा दक्षिणा',
    searchPlaceholder: 'बुकिंग ID, यजमान नाम, मोबाइल, पूजा या गोत्र खोजें...',
    allStatuses: 'सभी स्थितियां (All Statuses)',
    allServices: 'पूजा एवं परामर्श दोनों',
    pujasOnly: 'केवल पूजा अनुष्ठान',
    appointmentsOnly: 'केवल व्यक्तिगत परामर्श',
    exportCsv: 'CSV निर्यात',
    noBookingsFound: 'कोई पूजा बुकिंग नहीं मिली।',
    noBookingsSub: 'आपके चुने गए फ़िल्टर के अनुसार बुकिंग यहाँ दिखाई देंगी।',
    printReceipt: 'संकल्प पत्र / रसीद प्रिंट करें',
    manageBtn: 'बुकिंग विवरण व प्रबंधन',
    whatsappBtn: 'व्हाट्सएप संपर्क',
    callBtn: 'कॉल करें',
  },
};

const MODE_ICONS: Record<string, React.ElementType> = {
  ONLINE: Video,
  VIDEO_CALL: Video,
  PHONE_CALL: Phone,
  AT_HOME: Flame,
  TEMPLE: Sparkles,
};

export function BookingsTab({ onChanged }: { onChanged: () => void }) {
  const [lang, setLang] = useState<Lang>('en');
  const [scope, setScope] = useState<Scope>('upcoming');
  const [status, setStatus] = useState('ALL');
  const [serviceType, setServiceType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);
  const toast = useToast();

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

  const fetcher = useCallback(() => {
    const today = todayIst();
    const range =
      scope === 'upcoming' ? { from: today } : scope === 'today' ? { from: today, to: today } : scope === 'past' ? { to: today } : {};
    return Promise.all([
      adminApi.bookings({ ...range, status, serviceType, search: query, page, limit: 20 }),
      adminApi.stats().catch(() => null),
    ]);
  }, [scope, status, serviceType, query, page]);

  const { data: result, error, reload: load } = useLoader(fetcher);
  const data = result ? result[0] : null;
  const stats = result ? result[1] : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const onSaved = (b: Booking, message: string) => {
    setSelected(b);
    toast.ok(message);
    load();
    onChanged();
  };

  const handleExportCsv = () => {
    if (!data?.items?.length) return;
    exportToCsv(
      'vedrit_puja_bookings',
      [
        { header: 'Booking ID', accessor: (b) => b.bookingId },
        { header: 'Service Type', accessor: (b) => b.serviceType },
        { header: 'Puja / Consultation Title', accessor: (b) => b.title },
        { header: 'Package', accessor: (b) => b.packageName || '' },
        { header: 'Mode', accessor: (b) => MODE_LABELS[b.mode] || b.mode },
        { header: 'Date', accessor: (b) => b.date },
        { header: 'Time Slot', accessor: (b) => `${b.startTime} - ${b.endTime}` },
        { header: 'Duration (Mins)', accessor: (b) => b.durationMinutes },
        { header: 'Devotee Name', accessor: (b) => b.devoteeName },
        { header: 'Phone', accessor: (b) => b.phone },
        { header: 'Gotra', accessor: (b) => b.gotra || '' },
        { header: 'Family in Sankalp', accessor: (b) => b.familyMembers.join('; ') },
        { header: 'Sankalp Note / Wish', accessor: (b) => b.sankalpNote || '' },
        { header: 'Address', accessor: (b) => b.address ? `${b.address}, ${b.city || ''} ${b.pinCode || ''}` : '' },
        { header: 'Amount (INR)', accessor: (b) => b.amount },
        { header: 'Payment Method', accessor: (b) => b.paymentMethod },
        { header: 'Payment Status', accessor: (b) => b.paymentStatus },
        { header: 'Booking Status', accessor: (b) => b.status },
        { header: 'Meeting Link', accessor: (b) => b.meetingLink || '' },
        { header: 'Pandit Note', accessor: (b) => b.panditNote || '' },
        { header: 'Booked On', accessor: (b) => b.createdAt },
      ],
      data.items
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--saffron)] text-lg font-bold text-white shadow-xs">
              ॐ
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">{t.pageTitle}</h1>
          </div>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bilingual Switcher */}
          <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 text-xs font-bold shadow-xs">
            <button
              onClick={() => changeLang('en')}
              className={`rounded-lg px-3 py-1.5 transition ${
                lang === 'en'
                  ? 'bg-[var(--saffron)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLang('hi')}
              className={`rounded-lg px-3 py-1.5 transition ${
                lang === 'hi'
                  ? 'bg-[var(--saffron)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              हिंदी
            </button>
          </div>

          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={!data?.items?.length}
            className="text-xs font-bold py-2 shadow-xs whitespace-nowrap"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[var(--saffron)]" />
            {t.exportCsv} ({data?.total ?? 0})
          </Button>

          <Button variant="outline" onClick={load} className="text-xs py-2 font-bold shadow-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card
          onClick={() => {
            setScope('today');
            setPage(1);
          }}
          className={`cursor-pointer p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--saffron)] ${
            scope === 'today' ? 'border-2 border-[var(--saffron)] bg-[var(--saffron-light)]/30 shadow-md' : 'shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">{t.todayPujas}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--saffron-light)] text-[var(--saffron)] shadow-xs">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[var(--text-primary)]">
            {stats?.todaysBookings ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.todaySub}</p>
        </Card>

        <Card
          onClick={() => {
            setStatus('PENDING');
            setPage(1);
          }}
          className={`cursor-pointer p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 ${
            status === 'PENDING' ? 'border-2 border-amber-500 bg-amber-500/10 shadow-md' : 'shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">{t.pendingConfirm}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-amber-700 dark:text-amber-400">
            {stats?.pendingBookings ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.pendingSub}</p>
        </Card>

        <Card
          onClick={() => {
            setScope('upcoming');
            setStatus('CONFIRMED');
            setPage(1);
          }}
          className={`cursor-pointer p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-500 ${
            scope === 'upcoming' && status === 'CONFIRMED' ? 'border-2 border-green-500 bg-green-500/10 shadow-md' : 'shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">{t.upcomingConfirmed}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15 text-green-700 dark:text-green-400 shadow-xs">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-green-700 dark:text-green-400">
            {stats?.upcomingBookings ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.upcomingSub}</p>
        </Card>

        <Card className="p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">{t.totalOfferings}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-[var(--gold)] shadow-xs">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[var(--gold)]">
            {rupees(stats?.revenue?.bookings ?? 0)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.totalOfferingsSub}</p>
        </Card>
      </div>

      {/* Scope Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 shadow-xs">
        {SCOPES.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setScope(s.value);
              setPage(1);
            }}
            className={`rounded-xl px-4 sm:px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              scope === s.value
                ? 'bg-[var(--saffron)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            {lang === 'hi' ? s.hi : s.en}
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid gap-3.5 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] py-2.5 sm:py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--saffron)] text-[var(--text-primary)] shadow-xs"
          />
        </div>

        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: t.allStatuses },
            ...Object.entries(BOOKING_STATUS).map(([value, label]) => ({ value, label })),
          ]}
        />

        <Select
          value={serviceType}
          onChange={(e) => {
            setServiceType(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: t.allServices },
            { value: 'PUJA', label: t.pujasOnly },
            { value: 'CONSULTATION', label: t.appointmentsOnly },
          ]}
        />
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? (
        <Empty title={t.noBookingsFound} subtitle={t.noBookingsSub} />
      ) : null}

      {/* High-Contrast Vedic Bookings List */}
      <div className="grid gap-4 sm:gap-5">
        {data?.items.map((b) => {
          const ModeIcon = MODE_ICONS[b.mode] || Flame;
          const isPending = b.status === 'PENDING';

          return (
            <div
              key={b.id}
              className={`rounded-2xl border-2 bg-[var(--bg-card)] p-5 sm:p-6 md:p-7 shadow-sm transition hover:shadow-md ${
                isPending
                  ? 'border-amber-400/80 bg-amber-500/5 dark:bg-amber-950/15'
                  : 'border-[var(--border-color)] hover:border-[var(--saffron)]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Info Column */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[var(--saffron)]">
                      #{b.bookingId}
                    </span>
                    <Badge tone={TONE[b.status]}>{BOOKING_STATUS[b.status]}</Badge>
                    <Badge tone={TONE[b.paymentStatus]}>{PAYMENT_STATUS[b.paymentStatus]}</Badge>
                    {b.serviceType === 'PUJA' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/15 px-2 py-0.5 text-[11px] font-bold text-orange-700 dark:text-orange-300">
                        <Flame className="h-3 w-3" /> Puja Ritual
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                        <Phone className="h-3 w-3" /> Consultation
                      </span>
                    )}
                    {b.packageName ? (
                      <span className="rounded-md bg-[var(--bg-hover)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                        {b.packageName}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-heading font-black text-[var(--text-primary)]">
                      {b.title}
                    </h3>

                    {/* Date, Time & Mode Structured Chips */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 font-bold text-[var(--text-primary)] shadow-2xs">
                        <Calendar className="h-3.5 w-3.5 text-[var(--saffron)]" />
                        {formatDate(b.date)}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 font-bold text-[var(--text-primary)] shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        {formatTime(b.startTime)} - {formatTime(b.endTime)} ({b.durationMinutes}m)
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 font-bold text-purple-700 dark:text-purple-300 shadow-2xs">
                        <ModeIcon className="h-3.5 w-3.5" />
                        {MODE_LABELS[b.mode] || b.mode}
                      </span>
                    </div>

                    {/* Devotee, Gotra & Sankalp Chips */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 font-bold text-[var(--text-primary)] shadow-2xs">
                        <Users className="h-3.5 w-3.5 text-[var(--gold)]" />
                        <span>यजमान: <strong>{b.devoteeName}</strong></span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono font-bold text-[var(--text-secondary)] shadow-2xs">
                        <Phone className="h-3 w-3 text-[var(--text-muted)]" />
                        {b.phone}
                      </span>

                      {b.gotra ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-bold text-amber-800 dark:text-amber-300 shadow-2xs">
                          <Flame className="h-3 w-3 text-[var(--saffron)]" />
                          गोत्र: {b.gotra}
                        </span>
                      ) : null}

                      {b.familyMembers?.length ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--saffron)]/30 bg-[var(--saffron-light)]/40 px-2.5 py-1 font-bold text-[var(--saffron)] shadow-2xs">
                          <Heart className="h-3 w-3" />
                          सपरिवार: +{b.familyMembers.length} सदस्य
                        </span>
                      ) : null}
                    </div>

                    {/* Sankalp Note / Wish */}
                    {b.sankalpNote ? (
                      <div className="mt-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]/80 p-3 text-xs text-[var(--text-secondary)] shadow-2xs">
                        <span className="font-bold text-[var(--text-primary)]">मनोकामना / संकल्प विषय: </span>
                        <span className="italic font-medium">&ldquo;{b.sankalpNote}&rdquo;</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Right Action & Pricing Column */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3.5 border-t lg:border-t-0 border-[var(--border-color)] pt-3 lg:pt-0 lg:border-l lg:border-[var(--border-color)] lg:pl-6 lg:min-w-[260px]">
                  <div className="text-left lg:text-right">
                    <span className="block text-xl sm:text-2xl font-black text-[var(--gold)]">
                      {rupees(b.amount)}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                      {b.paymentMethod === 'ONLINE' ? 'Prepaid Online' : 'Pay After Puja'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={waLink(
                        b.phone,
                        `नमस्ते ${b.devoteeName} जी! वेदरीति से आपकी आगामी पूजा "${b.title}" दिनांक ${formatDate(b.date)} समय ${formatTime(b.startTime)} के संदर्भ में...`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-700 dark:text-green-300 hover:bg-green-500/20 shadow-xs"
                      title={t.whatsappBtn}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    <a
                      href={telLink(b.phone)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] shadow-xs"
                      title={t.callBtn}
                    >
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline">Call</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setPrintingBooking(b)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--saffron)] hover:text-[var(--saffron)] shadow-xs"
                      title={t.printReceipt}
                    >
                      <Printer className="h-4 w-4" />
                    </button>

                    <Button
                      onClick={() => setSelected(b)}
                      className="text-xs py-2 px-3.5 font-extrabold shadow-sm"
                    >
                      {t.manageBtn}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}

      {/* Booking Detail Modal */}
      {selected ? (
        <BookingDetail
          booking={selected}
          onClose={() => setSelected(null)}
          onPrint={() => setPrintingBooking(selected)}
          onSaved={onSaved}
          onError={toast.error}
        />
      ) : null}

      {/* Printable Sankalp Patra / Booking Receipt */}
      {printingBooking ? (
        <PrintSankalpPatraModal booking={printingBooking} onClose={() => setPrintingBooking(null)} />
      ) : null}

      {toast.node}
    </div>
  );
}

function BookingDetail({
  booking,
  onClose,
  onPrint,
  onSaved,
  onError,
}: {
  booking: Booking;
  onClose: () => void;
  onPrint: () => void;
  onSaved: (b: Booking, message: string) => void;
  onError: (message: string) => void;
}) {
  const [meetingLink, setMeetingLink] = useState(booking.meetingLink || '');
  const [panditNote, setPanditNote] = useState(booking.panditNote || '');
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const active = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const isOnline = booking.mode === 'ONLINE' || booking.mode === 'VIDEO_CALL';

  const update = async (key: string, body: Partial<Booking>, message: string) => {
    setBusy(key);
    try {
      const saved = await adminApi.updateBooking(booking.id, body);
      onSaved({ ...booking, ...saved }, message);
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const cancel = () => {
    if (!window.confirm('Cancel this booking? The slot will be released for others.')) return;
    update('cancel', { status: 'CANCELLED', cancelReason: cancelReason || 'Cancelled by Pandit Ji' }, 'Booking cancelled');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Booking #${booking.bookingId}`}
      wide
      footer={
        <>
          <Button type="button" variant="outline" onClick={onPrint} className="mr-auto font-bold">
            <Printer className="mr-1.5 h-4 w-4" />
            Print Sankalp Patra / Receipt
          </Button>

          {booking.status === 'PENDING' ? (
            <Button
              loading={busy === 'confirm'}
              onClick={() => update('confirm', { status: 'CONFIRMED', meetingLink, panditNote }, 'Booking confirmed')}
              className="bg-green-700 hover:bg-green-800 text-white font-bold"
            >
              Confirm Booking
            </Button>
          ) : null}

          {booking.status === 'CONFIRMED' ? (
            <Button
              loading={busy === 'complete'}
              onClick={() => update('complete', { status: 'COMPLETED' }, 'Marked as completed')}
              className="bg-[var(--saffron)] font-bold shadow-md"
            >
              Mark Completed (सम्पन्न)
            </Button>
          ) : null}

          {active ? (
            <Button variant="outline" onClick={() => setRescheduleOpen(true)} className="font-bold">
              Reschedule Slot
            </Button>
          ) : null}

          {active ? (
            <Button variant="danger" loading={busy === 'cancel'} onClick={cancel} className="font-bold">
              Cancel Booking
            </Button>
          ) : null}
        </>
      }
    >
      <div className="mb-3.5 flex flex-wrap gap-2">
        <Badge tone={TONE[booking.status]}>{BOOKING_STATUS[booking.status]}</Badge>
        <Badge tone={TONE[booking.paymentStatus]}>{PAYMENT_STATUS[booking.paymentStatus]}</Badge>
        <Badge>{booking.serviceType === 'PUJA' ? 'Puja Ritual' : 'Consultation'}</Badge>
        <span className="rounded-md border border-[var(--border-color)] px-2.5 py-0.5 text-xs font-bold text-[var(--text-secondary)]">
          {MODE_LABELS[booking.mode] || booking.mode}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 p-4">
        {/* Ritual Details */}
        <div>
          <h4 className="font-extrabold text-sm text-[var(--text-primary)] mb-2">Ritual & Muhurat Details</h4>
          <div className="divide-y divide-[var(--border-color)] text-xs font-medium">
            <Row label="Puja Title">{booking.title}</Row>
            {booking.packageName ? <Row label="Package">{booking.packageName}</Row> : null}
            <Row label="Date">{formatDate(booking.date)}</Row>
            <Row label="Muhurat Time">
              <strong className="text-[var(--text-primary)]">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)} ({booking.durationMinutes}m)
              </strong>
            </Row>
            <Row label="Ritual Mode">{MODE_LABELS[booking.mode]}</Row>
            <Row label="Dakshina / Amount">
              <strong className="text-sm text-[var(--gold)] font-black">{rupees(booking.amount)}</strong>
            </Row>
            <Row label="Payment Mode">{booking.paymentMethod === 'ONLINE' ? 'Prepaid Online' : 'Pay After Puja'}</Row>
            <Row label="Booked On">{formatDateTime(booking.createdAt)}</Row>
          </div>
        </div>

        {/* Devotee & Vedic Sankalp Details */}
        <div>
          <h4 className="font-extrabold text-sm text-[var(--text-primary)] mb-2">Yajman (Devotee) & Sankalp</h4>
          <div className="divide-y divide-[var(--border-color)] text-xs font-medium">
            <Row label="Devotee Name"><strong className="text-[var(--text-primary)]">{booking.devoteeName}</strong></Row>
            <Row label="Mobile">{booking.phone}</Row>
            {booking.gotra ? <Row label="Gotra"><strong className="text-[var(--saffron)]">{booking.gotra}</strong></Row> : null}
            {booking.user?.email ? <Row label="Email">{booking.user.email}</Row> : null}
          </div>

          <div className="mt-3 flex gap-2">
            <a href={telLink(booking.phone)} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
            <a
              href={waLink(booking.phone, `नमस्ते ${booking.devoteeName} जी! वेदरीति से आपकी आगामी पूजा ${booking.title} के संदर्भ में...`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-700 dark:text-green-300 hover:bg-green-500/20"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>

          {booking.familyMembers?.length ? (
            <div className="mt-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-xs">
              <p className="font-bold text-[var(--text-secondary)]">सपरिवार संकल्प सदस्य ({booking.familyMembers.length}):</p>
              <p className="mt-1 font-semibold text-[var(--text-primary)]">{booking.familyMembers.join(', ')}</p>
            </div>
          ) : null}

          {booking.sankalpNote ? (
            <div className="mt-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-xs">
              <p className="font-bold text-[var(--text-secondary)]">संकल्प विषय / विशेष मनोकामना:</p>
              <p className="mt-1 italic font-semibold text-[var(--text-primary)]">&ldquo;{booking.sankalpNote}&rdquo;</p>
            </div>
          ) : null}

          {booking.address ? (
            <div className="mt-2.5 text-xs">
              <p className="font-bold text-[var(--text-secondary)]">Address (Puja Location):</p>
              <p className="text-[var(--text-primary)]">{booking.address}, {booking.city} {booking.pinCode}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Online Link & Pandit Note Section */}
      <div className="mt-4 grid gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 text-xs">
        {isOnline ? (
          <Input
            label="Live Puja / Video Call Meeting Link"
            hint="(Devotee sees this button directly in the app to join the havan / aarti)"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij or Zoom Link"
          />
        ) : null}

        <Textarea
          label="Preparation Note for Devotee"
          hint="(Instructions: what to keep ready e.g. flowers, ganga jal, ghee, janeu)"
          value={panditNote}
          onChange={(e) => setPanditNote(e.target.value)}
          placeholder="e.g. Keep fresh mango leaves, copper kalash, and yellow cloth ready before muhurat."
          rows={3}
        />

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            loading={busy === 'note'}
            onClick={() => update('note', { meetingLink, panditNote }, 'Link and notes saved')}
            className="font-bold"
          >
            Save Link & Instructions
          </Button>

          {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' ? (
            <Button
              type="button"
              variant="outline"
              loading={busy === 'paid'}
              onClick={() => update('paid', { paymentStatus: 'PAID' }, 'Marked as paid')}
              className="font-bold text-green-700 hover:text-green-800"
            >
              Mark Paid (Cash / Offline UPI)
            </Button>
          ) : null}

          {booking.paymentStatus === 'PAID' && booking.status === 'CANCELLED' ? (
            <Button
              type="button"
              variant="outline"
              loading={busy === 'refund'}
              onClick={() => update('refund', { paymentStatus: 'REFUNDED' }, 'Marked refunded')}
              className="font-bold text-amber-700 hover:text-amber-800"
            >
              Mark Refunded
            </Button>
          ) : null}
        </div>

        {active ? (
          <Input
            label="Cancellation Reason (Optional)"
            hint="(Shown to devotee if booking is cancelled)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Inauspicious tithi conflict or devotee requested reschedule"
          />
        ) : null}
      </div>

      {rescheduleOpen ? (
        <RescheduleModal
          booking={booking}
          onClose={() => setRescheduleOpen(false)}
          onDone={(b) => {
            setRescheduleOpen(false);
            onSaved({ ...booking, ...b }, 'Booking rescheduled successfully');
          }}
          onError={onError}
        />
      ) : null}
    </Modal>
  );
}

function RescheduleModal({
  booking,
  onClose,
  onDone,
  onError,
}: {
  booking: Booking;
  onClose: () => void;
  onDone: (b: Booking) => void;
  onError: (m: string) => void;
}) {
  const [date, setDate] = useState(booking.date >= todayIst() ? booking.date : todayIst());
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);
  const dayFetcher = useCallback(() => adminApi.day(date, booking.durationMinutes), [date, booking.durationMinutes]);
  const { data: loadedView, error: viewError } = useLoader(dayFetcher);
  const view: DayView | null = loadedView?.date === date ? loadedView : null;

  const save = async () => {
    setSaving(true);
    try {
      onDone(await adminApi.rescheduleBooking(booking.id, date, time));
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Reschedule Ritual Slot"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="font-bold">
            Cancel
          </Button>
          <Button disabled={!time} loading={saving} onClick={save} className="font-bold shadow-md">
            Confirm Reschedule
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <Input label="New Ritual Date" type="date" min={todayIst()} value={date} onChange={(e) => setDate(e.target.value)} />
        {viewError ? <ErrorBox message={viewError} /> : null}
        {!view && !viewError ? <Spinner /> : null}
        {view ? (
          <div>
            <span className="block font-bold text-[var(--text-secondary)] mb-2">Select Auspicious Time Slot:</span>
            <div className="grid grid-cols-3 gap-2">
              {view.slots.map((s) => (
                <button
                  key={s.startTime}
                  disabled={!s.available}
                  onClick={() => setTime(s.startTime)}
                  className={`rounded-xl border p-2 text-center text-xs font-bold transition ${
                    time === s.startTime
                      ? 'border-[var(--saffron)] bg-[var(--saffron)] text-white shadow-xs'
                      : s.available
                      ? 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--saffron)]'
                      : 'cursor-not-allowed border-transparent bg-stone-200 text-stone-400 dark:bg-stone-900 dark:text-stone-600'
                  }`}
                >
                  {formatTime(s.startTime)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

/**
 * Printable Sacred Sankalp Patra & Ritual Receipt
 */
function PrintSankalpPatraModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 text-black shadow-2xl">
        {/* Controls (hidden on print) */}
        <div className="mb-6 flex items-center justify-between border-b pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-orange-600" />
            <h3 className="font-black text-lg text-slate-900">Print Sacred Sankalp Patra</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2">
              <Printer className="mr-1.5 h-4 w-4" /> Print Sankalp Patra
            </Button>
            <Button variant="outline" onClick={onClose} className="text-xs py-2 font-bold text-slate-800">
              Close
            </Button>
          </div>
        </div>

        {/* Printable Container */}
        <div id="printable-sankalp" className="border-4 border-amber-800/80 p-6 sm:p-8 rounded-lg bg-[#FFFDF8] text-slate-900 font-serif">
          {/* Sacred Header */}
          <div className="text-center border-b-2 border-amber-800/40 pb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-3xl font-black text-white shadow-md">
              ॐ
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-wider text-amber-950 uppercase">
              वेदरीति वैदिक संकल्प पत्रम्
            </h1>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-0.5">
              VedRit Sacred Consecration & Puja Receipt
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              श्री काशी विश्वनाथ पावन धाम, वाराणसी • www.vedrit.in
            </p>
          </div>

          {/* Booking Meta */}
          <div className="my-4 flex items-center justify-between border-b border-amber-800/20 pb-3 text-xs">
            <div>
              <p><strong>संकल्प क्रमांक (Booking ID):</strong> <span className="font-mono font-bold">#{booking.bookingId}</span></p>
              <p><strong>पंजीकरण तिथि:</strong> {formatDate(booking.createdAt)}</p>
            </div>
            <div className="text-right">
              <span className="inline-block border border-amber-800 px-3 py-1 font-bold text-xs text-amber-900 uppercase">
                {BOOKING_STATUS[booking.status] || booking.status}
              </span>
              <p className="mt-1 font-bold text-orange-700">{rupees(booking.amount)} ({booking.paymentStatus})</p>
            </div>
          </div>

          {/* Main Sankalp Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-amber-800/20 pb-4">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">यजमान विवरण (Devotee):</p>
              <p className="text-base font-black text-slate-900">{booking.devoteeName}</p>
              {booking.gotra ? <p><strong>गोत्र (Gotra):</strong> {booking.gotra}</p> : null}
              <p><strong>मोबाइल:</strong> {booking.phone}</p>
              {booking.address ? <p><strong>स्थान:</strong> {booking.address}, {booking.city}</p> : null}
            </div>

            <div className="border-l border-amber-800/20 pl-4 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">अनुष्ठान एवं मुहूर्त विवरण:</p>
              <p className="text-sm font-black text-orange-800">{booking.title}</p>
              {booking.packageName ? <p className="font-semibold">{booking.packageName}</p> : null}
              <p><strong>पूजा तिथि:</strong> {formatDate(booking.date)}</p>
              <p><strong>शुभ समय:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
              <p><strong>विधि:</strong> {MODE_LABELS[booking.mode]}</p>
            </div>
          </div>

          {/* Family in Sankalp */}
          {booking.familyMembers?.length ? (
            <div className="my-3 border-b border-amber-800/20 pb-3 text-xs">
              <p className="font-bold text-amber-900">सपरिवार संकल्प सदस्य:</p>
              <p className="mt-1 font-bold text-slate-800">{booking.familyMembers.join(' • ')}</p>
            </div>
          ) : null}

          {/* Wish / Sankalp Purpose */}
          {booking.sankalpNote ? (
            <div className="my-3 rounded border border-amber-600/40 bg-amber-500/10 p-3 text-xs">
              <p className="font-bold text-amber-950">विशेष मनोकामना / संकल्प उद्देश्य:</p>
              <p className="mt-1 italic font-semibold text-slate-800">&ldquo;{booking.sankalpNote}&rdquo;</p>
            </div>
          ) : null}

          {/* Pandit Note */}
          {booking.panditNote ? (
            <div className="my-3 text-xs">
              <p className="font-bold text-slate-700">पंडित जी निर्देश (Instructions):</p>
              <p className="mt-0.5 text-slate-800 font-medium">{booking.panditNote}</p>
            </div>
          ) : null}

          {/* Blessing Footer */}
          <div className="mt-6 border-t-2 border-amber-800/40 pt-4 flex items-center justify-between text-xs">
            <div>
              <p className="font-serif italic text-amber-900 font-bold">
                ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।<br />
                सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">वेदरीति तीर्थ पुरोहित परिषद</p>
              <p className="text-[10px] text-slate-500">हर हर महादेव • काशी वाराणसी</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
