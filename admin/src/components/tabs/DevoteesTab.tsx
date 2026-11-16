'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Globe,
  Grid,
  Heart,
  IndianRupee,
  Info,
  Languages,
  List,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ScrollText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserX,
  Users,
  Video,
  X,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { Devotee, DevoteesListResponse, FamilyMember, UserDetail } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { exportToCsv } from '../../lib/exportCsv';
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
import { Badge, Button, Card, Empty, ErrorBox, Modal, Pagination, Row, Spinner, useToast } from '../ui';

type Lang = 'en' | 'hi';
type FilterStatus = 'all' | 'active' | 'incomplete' | 'blocked';
type SortOption = 'recent' | 'recent_login' | 'name_asc' | 'name_desc' | 'oldest';
type ViewMode = 'table' | 'grid';
type DetailTab = 'overview' | 'family' | 'bookings' | 'orders' | 'kundli';

// ==========================================
// BILINGUAL TRANSLATION DICTIONARY
// ==========================================
const I18N = {
  en: {
    pageTitle: 'Devotee & Yajman Management',
    pageSubtitle: 'Manage devotee records, Gotra, Vedic Kundli details, family members, and puja history.',
    totalDevotees: 'Total Devotees',
    totalSub: 'All registered devotees',
    activeProfiles: 'Active Profiles',
    activeSub: 'Full profile completed',
    incompleteProfiles: 'Incomplete Profiles',
    incompleteSub: 'Pending profile details',
    blockedDevotees: 'Blocked Devotees',
    blockedSub: 'Login restricted',
    searchPlaceholder: 'Search by Name, Phone, Email, City, Gotra, Rashi, Pincode...',
    all: 'All',
    active: 'Active',
    incomplete: 'Incomplete',
    blocked: 'Blocked',
    sortRecent: 'Recently Joined',
    sortRecentLogin: 'Recently Active',
    sortNameAsc: 'Name (A → Z)',
    sortNameDesc: 'Name (Z → A)',
    sortOldest: 'Oldest Joined',
    colDevotee: 'Devotee',
    colGotraRashi: 'Gotra & Rashi',
    colContactCity: 'Contact & Location',
    colSpiritualActivity: 'Spiritual Activity',
    colSpend: 'Dakshina / Spend',
    colJoinedActive: 'Joined / Active',
    colStatus: 'Status',
    colAction: 'Action',
    unnamedDevotee: 'Devotee',
    gotra: 'Gotra',
    rashi: 'Rashi',
    nakshatra: 'Nakshatra',
    newDevotee: 'New Devotee',
    viewProfile: 'View Profile',
    detailsBtn: 'View Details',
    pujasBadge: 'Pujas',
    kundliBadge: 'Kundli',
    ordersBadge: 'Orders',
    membersCount: 'Members',
    noDevoteesFound: 'No devotees found',
    noDevoteesSub: 'Try different search terms or change status filter.',
    modalTitle: 'Devotee Full Profile',
    close: 'Close',
    unblockDevotee: 'Unblock Devotee',
    blockDevotee: 'Block Devotee',
    blockConfirm: 'Are you sure you want to block this devotee? They will not be able to log into the mobile app.',
    blockedOk: 'Devotee blocked successfully',
    unblockedOk: 'Devotee unblocked successfully',
    memberSince: 'Member Since',
    gender: 'Gender',
    accountId: 'Account ID',
    kpiSpend: 'Lifetime Spiritual Spend',
    kpiSpendSub: 'Paid rituals & store items',
    kpiBookings: 'Pujas & Consultations',
    kpiKundli: 'Kundli Inquiries',
    kpiKundliSub: 'Consultation inquiries',
    kpiOrders: 'Samagri Kit Orders',
    kpiOrdersSub: 'Store samagri kits',
    tabVedic: 'Vedic & Astrology Profile',
    tabFamily: 'Family & Kul Members',
    tabBookings: 'Pujas & Rituals History',
    tabOrders: 'Samagri Kit Orders',
    tabKundli: 'Kundli Inquiries History',
    secAstrology: 'Vedic & Astrological Details',
    secAddress: 'Residential Address',
    secAccount: 'Account & Security Details',
    notProvided: 'Not provided',
    dob: 'Date of Birth',
    birthTime: 'Birth Time',
    birthPlace: 'Birth Place',
    phone: 'Mobile Phone',
    email: 'Email Address',
    authMethod: 'Auth Method',
    lastActive: 'Last Active',
    never: 'Never',
    familyHeader: 'Family & Kul Members',
    familySub: 'Registered family members eligible for inclusion in Puja Sankalp rituals.',
    relation: 'Relation',
    sankalpEligible: '✓ Sankalp Eligible',
    noFamily: 'No family members added',
    noFamilySub: 'The devotee has not yet added family members to their Kul profile.',
    bookingsHeader: 'Pujas & Rituals History',
    scheduledDate: 'Scheduled Date',
    duration: 'Duration',
    yajmanName: 'Yajman (Sankalp Name)',
    familyInSankalp: 'Family in Sankalp',
    yajmanOnly: 'Yajman Only',
    sankalpPrayer: 'Sankalp Prayer / Note',
    meetingLink: 'Meeting Link',
    panditNote: 'Pandit Ji Note',
    noBookings: 'No bookings recorded',
    noBookingsSub: 'This devotee has not booked any pujas yet.',
    ordersHeader: 'Samagri Kit Orders',
    placedOn: 'Placed on',
    deliverTo: 'Deliver to',
    qty: 'Qty',
    courier: 'Courier Partner',
    tracking: 'Tracking No.',
    noOrders: 'No orders placed',
    noOrdersSub: 'This devotee has not placed any kit orders yet.',
    kundliHeader: 'Kundli Inquiries History',
    submittedOn: 'Submitted on',
    primaryPerson: 'Primary Person (Jatak)',
    partnerPerson: 'Partner Person',
    questions: 'Questions / Inquiries',
    panditResponse: "Pandit Ji's Response & Remedies",
    noKundli: 'No kundli consultations',
    noKundliSub: 'This devotee has not requested any kundli consultations.',
  },
  hi: {
    pageTitle: 'भक्त एवं यजमान प्रबंधन',
    pageSubtitle: 'भक्तों की सम्पूर्ण प्रोफ़ाइल, गोत्र, वैदिक कुंडली, कुटुंब सदस्य और पूजा अनुष्ठान इतिहास देखें।',
    totalDevotees: 'कुल भक्त',
    totalSub: 'सभी पंजीकृत भक्त',
    activeProfiles: 'सक्रिय प्रोफ़ाइल',
    activeSub: 'सम्पूर्ण प्रोफ़ाइल पूर्ण',
    incompleteProfiles: 'अपूर्ण प्रोफ़ाइल',
    incompleteSub: 'अपूर्ण विवरण',
    blockedDevotees: 'प्रतिबंधित भक्त',
    blockedSub: 'लॉगिन प्रतिबंधित',
    searchPlaceholder: 'नाम, फ़ोन, ईमेल, शहर, गोत्र, राशि, पिनकोड से खोजें...',
    all: 'सभी',
    active: 'सक्रिय',
    incomplete: 'अपूर्ण',
    blocked: 'प्रतिबंधित',
    sortRecent: 'नवीनतम पंजीकृत',
    sortRecentLogin: 'अंतिम सक्रिय',
    sortNameAsc: 'नाम (A → Z)',
    sortNameDesc: 'नाम (Z → A)',
    sortOldest: 'पुरातन पंजीकृत',
    colDevotee: 'भक्त (यजमान)',
    colGotraRashi: 'गोत्र व राशि',
    colContactCity: 'सम्पर्क व स्थान',
    colSpiritualActivity: 'आध्यात्मिक विवरण',
    colSpend: 'दक्षिणा / अर्पण',
    colJoinedActive: 'पंजीकरण / सक्रिय',
    colStatus: 'स्थिति',
    colAction: 'कार्य',
    unnamedDevotee: 'भक्त',
    gotra: 'गोत्र',
    rashi: 'राशि',
    nakshatra: 'नक्षत्र',
    newDevotee: 'नया भक्त',
    viewProfile: 'विवरण देखें',
    detailsBtn: 'विवरण',
    pujasBadge: 'पूजा',
    kundliBadge: 'कुंडली',
    ordersBadge: 'ऑर्डर्स',
    membersCount: 'सदस्य',
    noDevoteesFound: 'कोई भक्त नहीं मिला',
    noDevoteesSub: 'अन्य शब्द खोजें या फ़िल्टर बदलें।',
    modalTitle: 'भक्त सम्पूर्ण विवरण',
    close: 'बंद करें',
    unblockDevotee: 'अनब्लॉक करें',
    blockDevotee: 'ब्लॉक करें',
    blockConfirm: 'क्या आप इस भक्त को ब्लॉक करना चाहते हैं? वे मोबाइल ऐप में लॉगिन नहीं कर पाएंगे।',
    blockedOk: 'भक्त सफलतापूर्वक ब्लॉक किया गया',
    unblockedOk: 'भक्त सफलतापूर्वक अनब्लॉक किया गया',
    memberSince: 'सदस्यता',
    gender: 'लिंग',
    accountId: 'खाता ID',
    kpiSpend: 'कुल आध्यात्मिक अर्पण',
    kpiSpendSub: 'सफल अनुष्ठान व सामग्री',
    kpiBookings: 'पूजा व अनुष्ठान',
    kpiKundli: 'कुंडली परामर्श',
    kpiKundliSub: 'परामर्श प्रश्न',
    kpiOrders: 'सामग्री ऑर्डर्स',
    kpiOrdersSub: 'स्टोर ऑर्डर्स',
    tabVedic: 'वैदिक एवं ज्योतिष विवरण',
    tabFamily: 'कुटुंब व परिवार',
    tabBookings: 'पूजा व अनुष्ठान इतिहास',
    tabOrders: 'सामग्री ऑर्डर्स',
    tabKundli: 'कुंडली परामर्श इतिहास',
    secAstrology: 'वैदिक एवं ज्योतिष विवरण',
    secAddress: 'निवास स्थान व पता',
    secAccount: 'खाता व सम्पर्क विवरण',
    notProvided: 'उपलब्ध नहीं',
    dob: 'जन्म तिथि',
    birthTime: 'जन्म समय',
    birthPlace: 'जन्म स्थान',
    phone: 'मोबाइल फ़ोन',
    email: 'ईमेल पता',
    authMethod: 'लॉगिन माध्यम',
    lastActive: 'अंतिम सक्रियता',
    never: 'कभी नहीं',
    familyHeader: 'परिवार एवं कुल सदस्य',
    familySub: 'पंजीकृत परिवार के सदस्य जो पूजा संकल्प में सम्मिलित होने हेतु पात्र हैं।',
    relation: 'संबंध',
    sankalpEligible: '✓ संकल्प पात्र',
    noFamily: 'कोई परिवार सदस्य नहीं जोड़ा गया',
    noFamilySub: 'भक्त ने अभी तक अपने कुटुंब में परिवार सदस्य नहीं जोड़े हैं।',
    bookingsHeader: 'पूजा व अनुष्ठान इतिहास',
    scheduledDate: 'निर्धारित तिथि',
    duration: 'अवधि',
    yajmanName: 'यजमान (संकल्प नाम)',
    familyInSankalp: 'संकल्प में परिवार',
    yajmanOnly: 'केवल यजमान',
    sankalpPrayer: 'संकल्प प्रार्थना / मनोकामना',
    meetingLink: 'मीटिंग लिंक',
    panditNote: 'पंडित जी की टिप्पणी',
    noBookings: 'कोई बुकिंग उपलब्ध नहीं',
    noBookingsSub: 'इस भक्त ने अभी तक कोई पूजा बुक नहीं की है।',
    ordersHeader: 'सामग्री किट ऑर्डर्स',
    placedOn: 'ऑर्डर दिनांक',
    deliverTo: 'डिलिवरी पता',
    qty: 'मात्रा',
    courier: 'कूरियर पार्टनर',
    tracking: 'ट्रैकिंग नम्बर',
    noOrders: 'कोई ऑर्डर उपलब्ध नहीं',
    noOrdersSub: 'इस भक्त ने अभी तक कोई सामग्री किट ऑर्डर नहीं की है।',
    kundliHeader: 'कुंडली परामर्श इतिहास',
    submittedOn: 'प्रस्तुत दिनांक',
    primaryPerson: 'जातक (प्राथमिक व्यक्ति)',
    partnerPerson: 'वर / वधू (जीवनसाथी)',
    questions: 'प्रार्थना / प्रश्न',
    panditResponse: 'पंडित जी का उत्तर एवं उपाय',
    noKundli: 'कोई कुंडली परामर्श नहीं',
    noKundliSub: 'इस भक्त ने कोई कुंडली परामर्श अनुरोध नहीं किया है।',
  },
};

const MODE_I18N: Record<string, { en: string; hi: string }> = {
  ONLINE: { en: 'Online (Video)', hi: 'ऑनलाइन (वीडियो)' },
  AT_HOME: { en: 'At Devotee Home', hi: 'यजमान के घर पर' },
  AT_TEMPLE: { en: 'At Temple', hi: 'मंदिर में' },
  AUDIO_CALL: { en: 'Phone Call', hi: 'फ़ोन कॉल' },
  VIDEO_CALL: { en: 'Video Call', hi: 'वीडियो कॉल' },
  IN_PERSON: { en: 'In Person', hi: 'प्रत्यक्ष भेंट' },
};

const STATUS_I18N: Record<string, { en: string; hi: string }> = {
  PENDING: { en: 'Pending', hi: 'प्रतीक्षारत' },
  CONFIRMED: { en: 'Confirmed', hi: 'पुष्टीकृत' },
  COMPLETED: { en: 'Completed', hi: 'सम्पन्न' },
  CANCELLED: { en: 'Cancelled', hi: 'रद्द' },
  PLACED: { en: 'Placed', hi: 'प्राप्त' },
  SHIPPED: { en: 'Shipped', hi: 'भेज दिया' },
  DELIVERED: { en: 'Delivered', hi: 'वितरित' },
  SUBMITTED: { en: 'Submitted', hi: 'प्रस्तुत' },
  IN_REVIEW: { en: 'In Review', hi: 'समीक्षाधीन' },
  ANSWERED: { en: 'Answered', hi: 'उत्तर दिया गया' },
  CLOSED: { en: 'Closed', hi: 'समाप्त' },
  PAID: { en: 'Paid', hi: 'भुगतान सफल' },
  FAILED: { en: 'Failed', hi: 'असफल' },
  PAY_LATER: { en: 'Pay Later', hi: 'बाद में भुगतान' },
};

const KUNDLI_TYPE_I18N: Record<string, { en: string; hi: string }> = {
  JANAM_KUNDLI: { en: 'Janam Kundli', hi: 'जन्म कुंडली' },
  GUNA_MILAN: { en: 'Guna Milan (Matchmaking)', hi: 'गुण मिलान' },
  DOSHA_NIVARAN: { en: 'Dosha Nivaran', hi: 'दोष निवारण' },
  GENERAL_QUERY: { en: 'General Astro Query', hi: 'सामान्य प्रश्न' },
};

const RELATION_I18N: Record<string, string> = {
  Father: 'पिता',
  Mother: 'माता',
  Husband: 'पति',
  Wife: 'पत्नी',
  Son: 'पुत्र',
  Daughter: 'पुत्री',
  Brother: 'भाई',
  Sister: 'बहन',
  Grandfather: 'दादा/नाना',
  Grandmother: 'दादी/नानी',
};

export function DevoteesTab() {
  const [lang, setLang] = useState<Lang>('en');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Initialize language from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vedrit_devotee_lang');
      if (saved === 'hi' || saved === 'en') setLang(saved);
    } catch {}
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem('vedrit_devotee_lang', l);
    } catch {}
  };

  const t = I18N[lang];

  const fetcher = useCallback(
    () =>
      adminApi.users({
        search: query,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sort: sortOption,
        page,
        limit: 25,
      }),
    [query, statusFilter, sortOption, page]
  );

  const { data, error, reload: load } = useLoader<DevoteesListResponse>(fetcher);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const summary = data?.summary || {
    total: data?.total ?? 0,
    active: 0,
    incomplete: 0,
    blocked: 0,
  };

  const handleExportCsv = () => {
    if (!data?.items?.length) return;
    exportToCsv(
      'vedrit_devotees',
      [
        { header: 'Devotee ID', accessor: (d) => d.id },
        { header: 'Devotee Name', accessor: (d) => d.name || 'Unnamed' },
        { header: 'Phone', accessor: (d) => d.phone || '' },
        { header: 'Email', accessor: (d) => d.email || '' },
        { header: 'Gender', accessor: (d) => d.gender || '' },
        { header: 'Date of Birth', accessor: (d) => d.dateOfBirth || '' },
        { header: 'Time of Birth', accessor: (d) => d.timeOfBirth || '' },
        { header: 'Place of Birth', accessor: (d) => d.placeOfBirth || '' },
        { header: 'Gotra', accessor: (d) => d.gotra || '' },
        { header: 'Rashi', accessor: (d) => d.rashi || '' },
        { header: 'Nakshatra', accessor: (d) => d.nakshatra || '' },
        { header: 'City', accessor: (d) => d.city || '' },
        { header: 'State', accessor: (d) => d.state || '' },
        { header: 'Pin Code', accessor: (d) => d.pinCode || '' },
        { header: 'Address', accessor: (d) => d.address || '' },
        { header: 'Profile Completed', accessor: (d) => (d.profileCompleted ? 'YES' : 'NO') },
        { header: 'Family Members Count', accessor: (d) => d.familyCount || 0 },
        { header: 'Bookings Count', accessor: (d) => d.bookingsCount || 0 },
        { header: 'Orders Count', accessor: (d) => d.ordersCount || 0 },
        { header: 'Kundli Count', accessor: (d) => d.kundliCount || 0 },
        { header: 'Total Spent (INR)', accessor: (d) => d.totalSpent || 0 },
        { header: 'Status', accessor: (d) => (d.isBlocked ? 'BLOCKED' : 'ACTIVE') },
        { header: 'Registered On', accessor: (d) => d.createdAt || '' },
        { header: 'Last Login', accessor: (d) => d.lastLoginAt || '' },
      ],
      data.items
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Page Header with Language Switcher */}
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Automatic Bilingual Language Switcher */}
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

          {/* View Switcher (Table vs Grid) */}
          <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-[var(--saffron)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-[var(--saffron)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Grid Cards View"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={!data?.items?.length}
            className="text-xs font-bold py-2 shadow-xs whitespace-nowrap"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[var(--saffron)]" />
            Export CSV ({data?.total ?? 0})
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards (Executive Styling with Luxury Elevation) */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-4">
        {/* Total Devotees */}
        <Card
          onClick={() => {
            setStatusFilter('all');
            setPage(1);
          }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--saffron)] ${
            statusFilter === 'all'
              ? 'border-2 border-[var(--saffron)] bg-[var(--saffron-light)]/20 shadow-md'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-black uppercase tracking-wider text-[var(--text-secondary)]">
              {t.totalDevotees}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-[var(--saffron)] shadow-xs">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3.5 text-3xl sm:text-4xl font-heading font-black tracking-tight text-[var(--text-primary)]">
            {summary.total}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.totalSub}</p>
        </Card>

        {/* Active Profiles */}
        <Card
          onClick={() => {
            setStatusFilter('active');
            setPage(1);
          }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 ${
            statusFilter === 'active'
              ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-md'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-black uppercase tracking-wider text-[var(--text-secondary)]">
              {t.activeProfiles}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3.5 text-3xl sm:text-4xl font-heading font-black tracking-tight text-emerald-700 dark:text-emerald-400">
            {summary.active}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.activeSub}</p>
        </Card>

        {/* Incomplete Profiles */}
        <Card
          onClick={() => {
            setStatusFilter('incomplete');
            setPage(1);
          }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 ${
            statusFilter === 'incomplete'
              ? 'border-2 border-amber-500 bg-amber-500/10 shadow-md'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-black uppercase tracking-wider text-[var(--text-secondary)]">
              {t.incompleteProfiles}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3.5 text-3xl sm:text-4xl font-heading font-black tracking-tight text-amber-600 dark:text-amber-400">
            {summary.incomplete}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.incompleteSub}</p>
        </Card>

        {/* Blocked Devotees */}
        <Card
          onClick={() => {
            setStatusFilter('blocked');
            setPage(1);
          }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500 ${
            statusFilter === 'blocked'
              ? 'border-2 border-red-500 bg-red-500/10 shadow-md'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-black uppercase tracking-wider text-[var(--text-secondary)]">
              {t.blockedDevotees}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 shadow-xs">
              <UserX className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3.5 text-3xl sm:text-4xl font-heading font-black tracking-tight text-red-600 dark:text-red-400">
            {summary.blocked}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{t.blockedSub}</p>
        </Card>
      </div>

      {/* Search, Filter Tabs & Sorting Toolbar */}
      <Card className="p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-10 text-xs sm:text-sm font-semibold outline-none focus:border-[var(--saffron)] focus:ring-2 focus:ring-[var(--saffron)]/15 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills with Exact Counts */}
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 text-xs shadow-xs">
              {(
                [
                  { id: 'all', label: t.all, count: summary.total },
                  { id: 'active', label: t.active, count: summary.active },
                  { id: 'incomplete', label: t.incomplete, count: summary.incomplete },
                  { id: 'blocked', label: t.blocked, count: summary.blocked },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                    statusFilter === tab.id
                      ? 'bg-[var(--saffron)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      statusFilter === tab.id
                        ? 'bg-white/25 text-white'
                        : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <ArrowUpDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setPage(1);
                }}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--saffron)] shadow-xs"
              >
                <option value="recent">{t.sortRecent}</option>
                <option value="recent_login">{t.sortRecentLogin}</option>
                <option value="name_asc">{t.sortNameAsc}</option>
                <option value="name_desc">{t.sortNameDesc}</option>
                <option value="oldest">{t.sortOldest}</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? (
        <Empty
          title={t.noDevoteesFound}
          subtitle={search ? `${t.noDevoteesFound}: "${search}".` : t.noDevoteesSub}
        />
      ) : null}

      {/* Table View (Spacious, Clear Hierarchy, Soft Borders) */}
      {data?.items.length && viewMode === 'table' ? (
        <Card className="overflow-x-auto p-0 shadow-sm border border-[var(--border-color)]">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-4">{t.colDevotee}</th>
                <th className="px-5 py-4">{t.colGotraRashi}</th>
                <th className="px-5 py-4">{t.colContactCity}</th>
                <th className="px-5 py-4 text-center">{t.colSpiritualActivity}</th>
                <th className="px-5 py-4 text-right">{t.colSpend}</th>
                <th className="px-5 py-4">{t.colJoinedActive}</th>
                <th className="px-5 py-4">{t.colStatus}</th>
                <th className="px-5 py-4 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {data.items.map((u) => {
                const initials = (u.name || u.phone || 'D')
                  .split(' ')
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                // Format clean location string (strip unformatted long noise)
                const locationDisplay = [u.city, u.state].filter(Boolean).join(', ');

                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className="group cursor-pointer transition hover:bg-[var(--bg-hover)]"
                  >
                    {/* Devotee Info with Avatar */}
                    <td className="px-5 py-4.5">
                      <div className="flex items-center gap-3.5">
                        {u.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-full border-2 border-[var(--saffron)]/40 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--saffron)] to-amber-500 text-xs font-black text-white shadow-sm">
                            {initials}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <div className="font-heading font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--saffron)] transition">
                            {u.name || t.unnamedDevotee}
                          </div>
                          <div className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                            #{u.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Gotra & Rashi Pills */}
                    <td className="px-5 py-4.5">
                      <div className="flex flex-col gap-1.5">
                        {u.gotra ? (
                          <span className="inline-flex w-fit items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <Flame className="h-3 w-3 text-[var(--saffron)]" />
                            {u.gotra}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] font-medium">— {t.gotra}</span>
                        )}

                        {u.rashi ? (
                          <span className="inline-flex w-fit items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                            <span>🌙</span>
                            {u.rashi}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] font-medium">— {t.rashi}</span>
                        )}
                      </div>
                    </td>

                    {/* Contact & Location (Cleaned and Formatted with Quick Action Icons) */}
                    <td className="px-5 py-4.5">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[var(--text-primary)]">{u.phone || '—'}</span>
                          {u.phone ? (
                            <div className="flex items-center gap-1">
                              <a
                                href={waLink(
                                  u.phone,
                                  lang === 'hi'
                                    ? `नमस्ते ${u.name || ''} जी! वेदरीति से आपको सादर प्रणाम...`
                                    : `Hello ${u.name || ''}, greetings from VedRiti...`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-md p-1 text-green-600 hover:bg-green-500/15"
                                title="WhatsApp devotee"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={telLink(u.phone)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-md p-1 text-blue-600 hover:bg-blue-500/15"
                                title="Call devotee"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          ) : null}
                        </div>

                        {u.email ? (
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                            <Mail className="h-3 w-3 text-[var(--text-muted)]" />
                            <span className="truncate max-w-[170px]" title={u.email}>{u.email}</span>
                          </div>
                        ) : null}

                        {locationDisplay ? (
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <MapPin className="h-3 w-3 text-[var(--saffron)]" />
                            <span className="truncate max-w-[170px]" title={locationDisplay}>
                              {locationDisplay}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* Spiritual Activity (Bookings, Kundli, Orders, Family - Clear Labeled Badges) */}
                    <td className="px-5 py-4.5 text-center">
                      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                        <span
                          title={`${u.bookingsCount ?? 0} ${t.pujasBadge}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--saffron)]/30 bg-[var(--saffron-light)]/40 px-2.5 py-1 text-xs font-bold text-[var(--saffron)] shadow-2xs"
                        >
                          <Flame className="h-3.5 w-3.5" />
                          <span>{u.bookingsCount ?? 0} {t.pujasBadge}</span>
                        </span>

                        <span
                          title={`${u.ordersCount ?? 0} ${t.ordersBadge}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs"
                        >
                          <Package className="h-3.5 w-3.5" />
                          <span>{u.ordersCount ?? 0} {t.ordersBadge}</span>
                        </span>

                        <span
                          title={`${u.kundliCount ?? 0} ${t.kundliBadge}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs"
                        >
                          <ScrollText className="h-3.5 w-3.5" />
                          <span>{u.kundliCount ?? 0} {t.kundliBadge}</span>
                        </span>

                        {u.familyCount ? (
                          <span
                            title={`${u.familyCount} ${t.membersCount}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-2xs"
                          >
                            <Heart className="h-3.5 w-3.5" />
                            <span>{u.familyCount} {t.membersCount}</span>
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Lifetime Offerings / Spend */}
                    <td className="px-5 py-4.5 text-right">
                      <span className="font-heading font-black text-sm sm:text-base text-[var(--gold)]">
                        {u.totalSpent ? rupees(u.totalSpent) : '₹0'}
                      </span>
                    </td>

                    {/* Joined / Last Active */}
                    <td className="px-5 py-4.5 text-xs">
                      <div className="font-semibold text-[var(--text-primary)]">
                        {formatDate(u.createdAt.slice(0, 10))}
                      </div>
                      <div className="mt-0.5 text-[var(--text-muted)] font-medium">
                        {u.lastLoginAt ? `${t.lastActive}: ${formatDate(u.lastLoginAt.slice(0, 10))}` : t.newDevotee}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4.5">
                      {u.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs font-extrabold text-red-700 dark:text-red-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {t.blocked}
                        </span>
                      ) : u.profileCompleted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-0.5 text-xs font-extrabold text-green-800 dark:text-green-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          {t.active}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {t.incomplete}
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="px-5 py-4.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(u.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--saffron)] hover:text-[var(--saffron)] shadow-xs"
                      >
                        <span>{t.detailsBtn}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : null}

      {/* Grid Cards View (Executive Profile Cards) */}
      {data?.items.length && viewMode === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((u) => {
            const initials = (u.name || u.phone || 'D')
              .split(' ')
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const locationDisplay = [u.city, u.state].filter(Boolean).join(', ');

            return (
              <Card
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                className="group flex cursor-pointer flex-col justify-between p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--saffron)] hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="h-13 w-13 rounded-2xl border-2 border-[var(--saffron)]/40 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--saffron)] to-amber-500 text-sm font-black text-white shadow-sm">
                          {initials}
                        </div>
                      )}
                      <div>
                        <h3 className="font-heading font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--saffron)] transition">
                          {u.name || t.unnamedDevotee}
                        </h3>
                        <p className="font-mono text-xs font-semibold text-[var(--text-muted)]">ID: #{u.id.slice(-6)}</p>
                      </div>
                    </div>
                    {u.isBlocked ? (
                      <Badge tone="red">{t.blocked}</Badge>
                    ) : u.profileCompleted ? (
                      <Badge tone="green">{t.active}</Badge>
                    ) : (
                      <Badge tone="amber">{t.incomplete}</Badge>
                    )}
                  </div>

                  {/* Badges Row */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5 text-xs">
                    {u.gotra ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-bold text-amber-800 dark:text-amber-300">
                        <Flame className="h-3 w-3 text-[var(--saffron)]" />
                        {u.gotra}
                      </span>
                    ) : null}
                    {u.rashi ? (
                      <span className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-hover)] px-2.5 py-0.5 font-semibold text-[var(--text-secondary)]">
                        🌙 {u.rashi}
                      </span>
                    ) : null}
                    {locationDisplay ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-hover)] px-2.5 py-0.5 text-[var(--text-secondary)]">
                        <MapPin className="h-3 w-3 text-[var(--saffron)]" />
                        <span className="truncate max-w-[140px]">{locationDisplay}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Contact Row with Quick Actions */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-xs shadow-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-[var(--text-primary)]">{u.phone || '—'}</span>
                      {u.email ? <p className="truncate max-w-[160px] text-[11px] text-[var(--text-muted)]">{u.email}</p> : null}
                    </div>
                    {u.phone ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={waLink(u.phone, `नमस्ते ${u.name || ''} जी! वेदरीति से प्रणाम...`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg bg-green-500/15 p-1.5 text-green-700 dark:text-green-300 hover:bg-green-500/25"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <a
                          href={telLink(u.phone)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg bg-blue-500/15 p-1.5 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25"
                          title="Call"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      </div>
                    ) : null}
                  </div>

                  {/* 4-Item Metric Counters */}
                  <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-center text-xs shadow-xs">
                    <div>
                      <span className="block font-heading font-black text-sm text-[var(--saffron)]">{u.bookingsCount ?? 0}</span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">{t.pujasBadge}</span>
                    </div>
                    <div>
                      <span className="block font-heading font-black text-sm text-purple-600">{u.kundliCount ?? 0}</span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">{t.kundliBadge}</span>
                    </div>
                    <div>
                      <span className="block font-heading font-black text-sm text-blue-600">{u.ordersCount ?? 0}</span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">{t.ordersBadge}</span>
                    </div>
                    <div>
                      <span className="block font-heading font-black text-sm text-[var(--gold)]">
                        {u.totalSpent ? rupees(u.totalSpent) : '₹0'}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">{t.colSpend}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-3 text-xs">
                  <span className="text-[var(--text-muted)] font-medium">
                    {t.memberSince}: {formatDate(u.createdAt.slice(0, 10))}
                  </span>
                  <span className="font-bold text-[var(--saffron)] group-hover:underline inline-flex items-center gap-1">
                    {t.viewProfile} →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Pagination */}
      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}

      {/* Exhaustive Bilingual Devotee Detail Modal */}
      {selectedId ? (
        <DevoteeDetail
          id={selectedId}
          lang={lang}
          onClose={() => setSelectedId(null)}
          onChanged={load}
        />
      ) : null}
    </div>
  );
}

// ==========================================
// FULL DEVOTEE DETAIL DRAWER / MODAL
// ==========================================

function DevoteeDetail({
  id,
  lang,
  onClose,
  onChanged,
}: {
  id: string;
  lang: Lang;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const toast = useToast();
  const fetcher = useCallback(() => adminApi.user(id), [id]);
  const { data: detail, error, setData: setDetail } = useLoader<UserDetail>(fetcher);

  const t = I18N[lang];

  const toggleBlock = async () => {
    if (!detail) return;
    const blocking = !detail.user.isBlocked;
    if (blocking && !window.confirm(t.blockConfirm)) return;
    setBusy(true);
    try {
      const user = await adminApi.updateUser(id, blocking);
      setDetail({ ...detail, user: { ...detail.user, isBlocked: user.isBlocked } });
      toast.ok(blocking ? t.blockedOk : t.unblockedOk);
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const copyPhone = () => {
    if (!detail?.user.phone) return;
    navigator.clipboard.writeText(detail.user.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const u = detail?.user;
  const stats = detail?.stats || {
    totalSpent: detail
      ? detail.bookings
          .filter((b) => b.paymentStatus === 'PAID')
          .reduce((s, b) => s + b.amount, 0) +
        detail.orders
          .filter((o) => o.paymentStatus === 'PAID')
          .reduce((s, o) => s + o.totalAmount, 0) +
        detail.kundli
          .filter((k) => k.paymentStatus === 'PAID')
          .reduce((s, k) => s + k.amount, 0)
      : 0,
    bookingsCount: detail?.bookings.length ?? 0,
    completedBookings: detail?.bookings.filter((b) => b.status === 'COMPLETED').length ?? 0,
    activeBookings: detail?.bookings.filter((b) => ['PENDING', 'CONFIRMED'].includes(b.status)).length ?? 0,
    ordersCount: detail?.orders.length ?? 0,
    kundliCount: detail?.kundli.length ?? 0,
    familyCount: u?.familyMembers?.length ?? 0,
  };

  const initials = (u?.name || u?.phone || 'D')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getStatusLabel = (code: string) => {
    return STATUS_I18N[code]?.[lang] || code;
  };

  const getModeLabel = (code: string) => {
    return MODE_I18N[code]?.[lang] || MODE_LABELS[code] || code;
  };

  const getKundliTypeLabel = (code: string) => {
    return KUNDLI_TYPE_I18N[code]?.[lang] || KUNDLI_TYPES[code as keyof typeof KUNDLI_TYPES] || code;
  };

  const getRelationLabel = (rel: string) => {
    if (lang === 'hi') {
      return RELATION_I18N[rel] || rel;
    }
    return rel;
  };

  return (
    <Modal
      open
      onClose={onClose}
      extraWide
      title={
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--gold)]/20 text-sm font-bold text-[var(--gold)]">
            ॐ
          </span>
          <span className="font-heading font-bold text-lg">{t.modalTitle}</span>
        </div>
      }
      footer={
        u ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[var(--text-muted)] font-medium">
              {t.accountId}: <span className="font-mono font-bold text-[var(--text-primary)]">{u.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} className="font-bold">
                {t.close}
              </Button>
              <Button variant={u.isBlocked ? 'outline' : 'danger'} loading={busy} onClick={toggleBlock} className="font-bold">
                {u.isBlocked ? <ShieldCheck className="mr-1.5 h-4 w-4" /> : <ShieldAlert className="mr-1.5 h-4 w-4" />}
                {u.isBlocked ? t.unblockDevotee : t.blockDevotee}
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {error ? <ErrorBox message={error} /> : null}
      {!detail && !error ? <Spinner /> : null}

      {u && detail ? (
        <div className="space-y-6">
          {/* Devotee Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-hover)] to-[var(--bg-surface)] p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Avatar + Main Info */}
              <div className="flex items-center gap-4">
                {u.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.avatarUrl}
                    alt=""
                    className="h-20 w-20 rounded-2xl border-2 border-[var(--saffron)] object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--saffron)] to-amber-500 text-2xl font-black text-white shadow-md">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-2xl font-heading font-black tracking-tight text-[var(--text-primary)]">
                      {u.name || t.unnamedDevotee}
                    </h2>
                    {u.isBlocked ? (
                      <Badge tone="red">{t.blocked}</Badge>
                    ) : u.profileCompleted ? (
                      <Badge tone="green">{t.active}</Badge>
                    ) : (
                      <Badge tone="amber">{t.incomplete}</Badge>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                    {u.gotra ? (
                      <span className="flex items-center gap-1 font-bold text-[var(--saffron)]">
                        <Flame className="h-3.5 w-3.5" />
                        {t.gotra}: {u.gotra}
                      </span>
                    ) : null}
                    {u.rashi ? <span className="font-semibold">🌙 {t.rashi}: {u.rashi}</span> : null}
                    {u.nakshatra ? <span>{t.nakshatra}: {u.nakshatra}</span> : null}
                    {u.gender ? <span>{t.gender}: {u.gender}</span> : null}
                    <span>•</span>
                    <span>{t.memberSince}: {formatDate(u.createdAt.slice(0, 10))}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions (Call, WhatsApp, Email, Copy) */}
              <div className="flex flex-wrap items-center gap-2">
                {u.phone ? (
                  <>
                    <a
                      href={waLink(
                        u.phone,
                        lang === 'hi'
                          ? `नमस्ते ${u.name || ''} जी! वेदरीति (VedRiti) की ओर से सादर प्रणाम। हम आपकी किस प्रकार सहायता कर सकते हैं?`
                          : `Hello ${u.name || ''}, greetings from VedRiti! How may we assist you today?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                    <a
                      href={telLink(u.phone)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-bold transition hover:border-[var(--saffron)] hover:text-[var(--saffron)] shadow-xs"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                    <button
                      onClick={copyPhone}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 text-xs text-[var(--text-secondary)] transition hover:border-[var(--saffron)] shadow-xs"
                      title="Copy phone"
                    >
                      {copiedPhone ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </>
                ) : null}
                {u.email ? (
                  <a
                    href={`mailto:${u.email}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-bold transition hover:border-[var(--saffron)] hover:text-[var(--saffron)] shadow-xs"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Devotee KPI Metric Cards */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <Card className="p-4 shadow-xs">
              <span className="text-xs font-bold text-[var(--text-secondary)]">{t.kpiSpend}</span>
              <p className="mt-1.5 text-2xl font-heading font-black text-[var(--gold)]">{rupees(stats.totalSpent)}</p>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">{t.kpiSpendSub}</span>
            </Card>

            <Card className="p-4 shadow-xs">
              <span className="text-xs font-bold text-[var(--text-secondary)]">{t.kpiBookings}</span>
              <p className="mt-1.5 text-2xl font-heading font-black text-[var(--saffron)]">{stats.bookingsCount}</p>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                {stats.completedBookings} {STATUS_I18N.COMPLETED[lang]} • {stats.activeBookings} {STATUS_I18N.CONFIRMED[lang]}
              </span>
            </Card>

            <Card className="p-4 shadow-xs">
              <span className="text-xs font-bold text-[var(--text-secondary)]">{t.kpiKundli}</span>
              <p className="mt-1.5 text-2xl font-heading font-black text-purple-600">{stats.kundliCount}</p>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">{t.kpiKundliSub}</span>
            </Card>

            <Card className="p-4 shadow-xs">
              <span className="text-xs font-bold text-[var(--text-secondary)]">{t.kpiOrders}</span>
              <p className="mt-1.5 text-2xl font-heading font-black text-blue-600">{stats.ordersCount}</p>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">{t.kpiOrdersSub}</span>
            </Card>
          </div>

          {/* Tabs Navigation Inside Devotee Detail */}
          <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
            {(
              [
                { id: 'overview', label: t.tabVedic, icon: Sparkles },
                { id: 'family', label: `${t.tabFamily} (${u.familyMembers?.length ?? 0})`, icon: Heart },
                { id: 'bookings', label: `${t.tabBookings} (${detail.bookings.length})`, icon: Flame },
                { id: 'orders', label: `${t.tabOrders} (${detail.orders.length})`, icon: Package },
                { id: 'kundli', label: `${t.tabKundli} (${detail.kundli.length})`, icon: ScrollText },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition sm:text-sm ${
                    isActive
                      ? 'border-[var(--saffron)] text-[var(--saffron)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: VEDIC & ASTROLOGY PROFILE + CONTACT / ADDRESS INFO */}
          {activeTab === 'overview' ? (
            <div className="grid gap-5 md:grid-cols-2">
              {/* Vedic Astrology Profile Card */}
              <Card className="space-y-4 p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                  <Sparkles className="h-4 w-4 text-[var(--gold)]" />
                  <h3 className="font-heading font-bold text-[var(--text-primary)]">{t.secAstrology}</h3>
                </div>
                <div className="divide-y divide-[var(--border-color)] text-sm">
                  <Row label={t.gotra}>
                    <span className="font-bold text-[var(--saffron)]">{u.gotra || t.notProvided}</span>
                  </Row>
                  <Row label={t.rashi}>
                    <span className="font-bold">{u.rashi || t.notProvided}</span>
                  </Row>
                  <Row label={t.nakshatra}>{u.nakshatra || t.notProvided}</Row>
                  <Row label={t.dob}>
                    {u.dateOfBirth ? formatDate(u.dateOfBirth) : t.notProvided}
                  </Row>
                  <Row label={t.birthTime}>
                    {u.timeOfBirth ? formatTime(u.timeOfBirth) : t.notProvided}
                  </Row>
                  <Row label={t.birthPlace}>{u.placeOfBirth || t.notProvided}</Row>
                  <Row label={t.gender}>{u.gender || t.notProvided}</Row>
                </div>
              </Card>

              {/* Address & Account Information */}
              <div className="space-y-4">
                <Card className="space-y-4 p-5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                    <MapPin className="h-4 w-4 text-[var(--saffron)]" />
                    <h3 className="font-heading font-bold text-[var(--text-primary)]">{t.secAddress}</h3>
                  </div>
                  <div className="text-sm">
                    {u.address ? (
                      <p className="font-medium text-[var(--text-primary)]">{u.address}</p>
                    ) : (
                      <p className="text-[var(--text-muted)]">{t.notProvided}</p>
                    )}
                    <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                      {u.city ? `${u.city}` : ''}
                      {u.state ? `, ${u.state}` : ''}
                      {u.pinCode ? ` - ${u.pinCode}` : ''}
                    </p>
                  </div>
                </Card>

                <Card className="space-y-4 p-5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                    <Info className="h-4 w-4 text-[var(--text-muted)]" />
                    <h3 className="font-heading font-bold text-[var(--text-primary)]">{t.secAccount}</h3>
                  </div>
                  <div className="divide-y divide-[var(--border-color)] text-sm">
                    <Row label={t.phone}>{u.phone || '—'}</Row>
                    <Row label={t.email}>
                      <span className="flex items-center gap-1">
                        {u.email || '—'}
                        {u.emailVerified ? (
                          <span title="Verified" className="text-xs font-bold text-green-600">
                            ✓
                          </span>
                        ) : null}
                      </span>
                    </Row>
                    <Row label={t.authMethod}>{u.authProvider ? u.authProvider.toUpperCase() : 'PHONE'}</Row>
                    <Row label={t.memberSince}>{formatDateTime(u.createdAt)}</Row>
                    <Row label={t.lastActive}>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : t.never}</Row>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {/* TAB 2: FAMILY / KUL MEMBERS */}
          {activeTab === 'family' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">
                    {t.familyHeader}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">{t.familySub}</p>
                </div>
                <span className="rounded-full bg-[var(--saffron)]/15 px-3 py-1 text-xs font-bold text-[var(--saffron)]">
                  {u.familyMembers?.length ?? 0} {t.membersCount}
                </span>
              </div>

              {u.familyMembers && u.familyMembers.length > 0 ? (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {u.familyMembers.map((m: FamilyMember, idx: number) => (
                    <Card key={m.id || idx} className="p-4 shadow-xs transition hover:border-[var(--saffron)]">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--saffron-light)] font-bold text-[var(--saffron)]">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-[var(--text-primary)]">{m.name}</h4>
                            <span className="inline-block rounded-md bg-[var(--bg-hover)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                              {t.relation}: {getRelationLabel(m.relation)}
                            </span>
                          </div>
                        </div>
                        {m.gotra ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <Flame className="h-3 w-3" />
                            {m.gotra}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-secondary)]">
                        <div>
                          <span className="text-[var(--text-muted)]">{t.dob}: </span>
                          <span className="font-medium">{m.dateOfBirth ? formatDate(m.dateOfBirth) : '—'}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">{t.rashi}: </span>
                          <span className="font-medium">{m.rashi || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">{t.nakshatra}: </span>
                          <span className="font-medium">{m.nakshatra || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-bold">
                          <span>{t.sankalpEligible}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty title={t.noFamily} subtitle={t.noFamilySub} />
              )}
            </div>
          ) : null}

          {/* TAB 3: BOOKINGS HISTORY */}
          {activeTab === 'bookings' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">
                  {t.bookingsHeader} ({detail.bookings.length})
                </h3>
              </div>

              {detail.bookings.length > 0 ? (
                <div className="space-y-3">
                  {detail.bookings.map((b) => (
                    <Card key={b.id} className="space-y-3 p-4 shadow-xs">
                      {/* Booking Top Info */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-[var(--saffron)]">
                              #{b.bookingId}
                            </span>
                            <h4 className="font-heading font-bold text-[var(--text-primary)]">{b.title}</h4>
                            {b.packageName ? (
                              <span className="rounded-md bg-[var(--bg-hover)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                                {b.packageName}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                            <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                              <Calendar className="h-3.5 w-3.5 text-[var(--saffron)]" />
                              {formatDate(b.date)}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-[var(--text-secondary)]">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(b.startTime)} - {formatTime(b.endTime)} ({b.durationMinutes} min)
                            </span>
                            <span className="flex items-center gap-1 font-bold text-[var(--text-secondary)]">
                              {getModeLabel(b.mode)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base font-heading font-black text-[var(--gold)]">{rupees(b.amount)}</span>
                          <Badge tone={TONE[b.paymentStatus]}>{getStatusLabel(b.paymentStatus)}</Badge>
                          <Badge tone={TONE[b.status]}>{getStatusLabel(b.status)}</Badge>
                        </div>
                      </div>

                      {/* Sankalp / Devotee Details */}
                      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 text-xs shadow-2xs">
                        <div className="grid gap-2 sm:grid-cols-3">
                          <div>
                            <span className="text-[var(--text-muted)]">{t.yajmanName}: </span>
                            <span className="font-bold text-[var(--text-primary)]">{b.devoteeName}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)]">{t.gotra}: </span>
                            <span className="font-bold text-[var(--saffron)]">{b.gotra || '—'}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)]">{t.familyInSankalp}: </span>
                            <span className="font-semibold">
                              {b.familyMembers && b.familyMembers.length ? b.familyMembers.join(', ') : t.yajmanOnly}
                            </span>
                          </div>
                        </div>

                        {b.sankalpNote ? (
                          <div className="mt-2.5 border-t border-[var(--border-color)] pt-2">
                            <span className="font-bold text-[var(--saffron)]">{t.sankalpPrayer}: </span>
                            <span className="italic font-medium text-[var(--text-primary)]">&ldquo;{b.sankalpNote}&rdquo;</span>
                          </div>
                        ) : null}

                        {b.meetingLink ? (
                          <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--border-color)] pt-2 text-xs">
                            <Video className="h-3.5 w-3.5 text-blue-600" />
                            <span className="font-bold">{t.meetingLink}: </span>
                            <a
                              href={b.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-mono"
                            >
                              {b.meetingLink}
                            </a>
                          </div>
                        ) : null}

                        {b.panditNote ? (
                          <div className="mt-2 text-xs text-[var(--text-muted)]">
                            <span className="font-bold">{t.panditNote}: </span>
                            {b.panditNote}
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty title={t.noBookings} subtitle={t.noBookingsSub} />
              )}
            </div>
          ) : null}

          {/* TAB 4: KIT & SAMAGRI STORE ORDERS */}
          {activeTab === 'orders' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">
                  {t.ordersHeader} ({detail.orders.length})
                </h3>
              </div>

              {detail.orders.length > 0 ? (
                <div className="space-y-3">
                  {detail.orders.map((o) => (
                    <Card key={o.id} className="space-y-3 p-4 shadow-xs">
                      {/* Order Header */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-blue-600">#{o.orderId}</span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {t.placedOn} {formatDateTime(o.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {t.deliverTo}: <span className="font-bold text-[var(--text-primary)]">{o.name}</span> • {o.address}, {o.city} ({o.pinCode})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-heading font-black text-[var(--gold)]">{rupees(o.totalAmount)}</span>
                          <Badge tone={TONE[o.paymentStatus]}>{getStatusLabel(o.paymentStatus)}</Badge>
                          <Badge tone={TONE[o.status]}>{getStatusLabel(o.status)}</Badge>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-[var(--border-color)] rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 shadow-2xs">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 text-xs">
                            <div className="flex items-center gap-2.5">
                              {it.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={it.imageUrl}
                                  alt=""
                                  className="h-10 w-10 rounded-lg border border-[var(--border-color)] object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-hover)] text-[var(--text-muted)]">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-[var(--text-primary)]">{it.name}</span>
                                <div className="text-[var(--text-muted)]">
                                  {t.qty}: {it.quantity} × {rupees(it.unitPrice)}
                                </div>
                              </div>
                            </div>
                            <span className="font-black text-sm">{rupees(it.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Courier / Tracking */}
                      {o.trackingNumber || o.courierPartner ? (
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>{t.courier}: <strong className="text-[var(--text-primary)]">{o.courierPartner || '—'}</strong></span>
                          <span>{t.tracking}: <strong className="font-mono text-[var(--text-primary)]">{o.trackingNumber}</strong></span>
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty title={t.noOrders} subtitle={t.noOrdersSub} />
              )}
            </div>
          ) : null}

          {/* TAB 5: KUNDLI INQUIRIES & CONSULTATIONS */}
          {activeTab === 'kundli' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">
                  {t.kundliHeader} ({detail.kundli.length})
                </h3>
              </div>

              {detail.kundli.length > 0 ? (
                <div className="space-y-3">
                  {detail.kundli.map((k) => (
                    <Card key={k.id} className="space-y-3 p-4 shadow-xs">
                      {/* Kundli Header */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-purple-600">#{k.requestId}</span>
                            <h4 className="font-heading font-bold text-[var(--text-primary)]">
                              {getKundliTypeLabel(k.type)}
                            </h4>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">
                            {t.submittedOn} {formatDateTime(k.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-heading font-black text-[var(--gold)]">{rupees(k.amount)}</span>
                          <Badge tone={TONE[k.paymentStatus]}>{getStatusLabel(k.paymentStatus)}</Badge>
                          <Badge tone={TONE[k.status]}>{getStatusLabel(k.status)}</Badge>
                        </div>
                      </div>

                      {/* Birth Details */}
                      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 text-xs shadow-2xs">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">{t.primaryPerson}: </span>
                            <span className="font-semibold">{k.primaryPerson?.fullName} ({k.primaryPerson?.gender})</span>
                            <div className="mt-0.5 text-[var(--text-muted)]">
                              {t.dob}: {k.primaryPerson?.dateOfBirth} • {k.primaryPerson?.timeOfBirth || 'Time unknown'} • {k.primaryPerson?.placeOfBirth}
                            </div>
                          </div>

                          {k.partnerPerson ? (
                            <div>
                              <span className="font-bold text-[var(--text-primary)]">{t.partnerPerson}: </span>
                              <span className="font-semibold">{k.partnerPerson?.fullName} ({k.partnerPerson?.gender})</span>
                              <div className="mt-0.5 text-[var(--text-muted)]">
                                {t.dob}: {k.partnerPerson?.dateOfBirth} • {k.partnerPerson?.timeOfBirth || 'Time unknown'} • {k.partnerPerson?.placeOfBirth}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {k.questions ? (
                          <div className="mt-2.5 border-t border-[var(--border-color)] pt-2">
                            <span className="font-bold text-purple-700 dark:text-purple-400">{t.questions}: </span>
                            <p className="mt-1 text-[var(--text-primary)]">{k.questions}</p>
                          </div>
                        ) : null}

                        {k.panditResponse ? (
                          <div className="mt-2.5 rounded-xl border border-[var(--gold)]/30 bg-[var(--saffron-light)]/40 p-3">
                            <span className="font-bold text-[var(--saffron)]">{t.panditResponse}: </span>
                            <p className="mt-1 whitespace-pre-wrap text-[var(--text-primary)]">{k.panditResponse}</p>
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty title={t.noKundli} subtitle={t.noKundliSub} />
              )}
            </div>
          ) : null}
        </div>
      ) : null}
      {toast.node}
    </Modal>
  );
}
