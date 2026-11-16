'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  MapPin,
  Plus,
  Printer,
  RefreshCw,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { SamuhikPujaItem, SamuhikBookingItem, SamuhikPujaTier } from '../../lib/types';
import { Button, Input, Modal, Badge, Spinner } from '../ui';

const DEFAULT_TIERS: SamuhikPujaTier[] = [
  { id: 'single', name: 'एकल संकल्प (1 Devotee)', dakshina: 101, maxFamilyMembers: 1, prasadIncluded: false, description: '1 नाम व गोत्र से विशेष आहुति' },
  { id: 'couple', name: 'दम्पत्ति संकल्प (Couple)', dakshina: 251, maxFamilyMembers: 2, prasadIncluded: true, description: 'पति-पत्नी दोनों के नाम व गोत्र से आहुति' },
  { id: 'family', name: 'सपरिवार संकल्प (Family 4)', dakshina: 501, maxFamilyMembers: 4, prasadIncluded: true, description: 'पूरे परिवार (4 सदस्य) के नाम व गोत्र से पूजा' },
  { id: 'mukhya', name: 'विशेष मुख्य यजमान', dakshina: 1100, maxFamilyMembers: 6, prasadIncluded: true, description: 'सर्वोच्च संकल्प, विशेष रुद्राभिषेक व प्रसाद' },
];

export function SamuhikTab() {
  const [pujas, setPujas] = useState<SamuhikPujaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');

  // Devotees & Sankalp Patra modal state
  const [selectedPujaForDevotees, setSelectedPujaForDevotees] = useState<SamuhikPujaItem | null>(null);
  const [devoteesLoading, setDevoteesLoading] = useState(false);
  const [devoteesList, setDevoteesList] = useState<SamuhikBookingItem[]>([]);
  const [isSankalpPatraOpen, setIsSankalpPatraOpen] = useState(false);

  // Upload proof modal state
  const [proofPuja, setProofPuja] = useState<SamuhikPujaItem | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [photoUrls, setPhotoUrls] = useState('');
  const [proofStatus, setProofStatus] = useState<string>('COMPLETED');
  const [savingProof, setSavingProof] = useState(false);

  // Add / Edit puja modal state
  const [editPuja, setEditPuja] = useState<Partial<SamuhikPujaItem> | null>(null);
  const [savingPuja, setSavingPuja] = useState(false);

  const loadPujas = async () => {
    setLoading(true);
    try {
      const data = await adminApi.samuhikPujas();
      setPujas(data || []);
    } catch (err) {
      console.error('Failed to load samuhik pujas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPujas();
  }, []);

  const openDevoteesModal = async (puja: SamuhikPujaItem) => {
    setSelectedPujaForDevotees(puja);
    setIsSankalpPatraOpen(true);
    setDevoteesLoading(true);
    try {
      const res = await adminApi.samuhikDevotees(puja._id || puja.id || '');
      setDevoteesList(res.devotees || []);
    } catch (err) {
      console.error('Failed to load devotees:', err);
      setDevoteesList([]);
    } finally {
      setDevoteesLoading(false);
    }
  };

  const openProofModal = (puja: SamuhikPujaItem) => {
    setProofPuja(puja);
    setVideoUrl(puja.sankalpVideoUrl || '');
    setPhotoUrls((puja.sankalpPhotos || []).join('\n'));
    setProofStatus(puja.status || 'COMPLETED');
  };

  const handleSaveProof = async () => {
    if (!proofPuja) return;
    setSavingProof(true);
    try {
      const photos = photoUrls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      await adminApi.uploadSamuhikProof(proofPuja._id || proofPuja.id || '', {
        sankalpVideoUrl: videoUrl.trim(),
        sankalpPhotos: photos,
        status: proofStatus,
      });
      setProofPuja(null);
      await loadPujas();
    } catch (err) {
      alert('Failed to save proof: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSavingProof(false);
    }
  };

  const handleSavePuja = async () => {
    if (!editPuja || !editPuja.title || !editPuja.templeVenue || !editPuja.eventDate) {
      alert('Please fill in required fields: Title, Temple Venue, Event Date');
      return;
    }
    setSavingPuja(true);
    try {
      const payload: Partial<SamuhikPujaItem> = {
        ...editPuja,
        tiers: editPuja.tiers && editPuja.tiers.length ? editPuja.tiers : DEFAULT_TIERS,
        maxDevotees: Number(editPuja.maxDevotees) || 108,
      };
      await adminApi.saveSamuhikPuja(payload);
      setEditPuja(null);
      await loadPujas();
    } catch (err) {
      alert('Failed to save puja: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSavingPuja(false);
    }
  };

  const handlePrintSankalpPatra = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!devoteesList.length || !selectedPujaForDevotees) return;
    const headers = ['Sr', 'Booking ID', 'Devotee Name', 'Gotra', 'Rashi', 'Family Members', 'Sankalp Wish', 'Dakshina Tier', 'Amount (₹)', 'Payment Status', 'Date'];
    const rows = devoteesList.map((d, i) => [
      i + 1,
      d.bookingId,
      `"${d.devoteeName}"`,
      `"${d.gotra || 'Kashyap'}"`,
      `"${d.rashi || '-'}"`,
      `"${(d.familyMembers || []).map((m) => `${m.name} (${m.relation})`).join(', ')}"`,
      `"${d.sankalpWish || 'सुख, शांति एवं समृद्धि'}"`,
      `"${d.tierName}"`,
      d.amount,
      d.paymentStatus,
      new Date(d.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sankalp_Patra_${selectedPujaForDevotees.slug || 'Samuhik'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPujas = useMemo(() => {
    return pujas.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.templeVenue.toLowerCase().includes(search.toLowerCase()) ||
        p.deity.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pujas, search, statusFilter]);

  // Aggregate stats
  const totalDevotees = pujas.reduce((acc, p) => acc + (p.enrolledCount || 0), 0);
  const activeCount = pujas.filter((p) => p.status === 'ACTIVE' || p.status === 'UPCOMING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Flame className="h-5 w-5" />
            </span>
            <h1 className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
              सामूहिक महापर्व पूजा (Samuhik Festival Pujas)
            </h1>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            ₹101 / ₹251 Micro-Dakshina festival rituals, live devotee registrations, and Pandit Ji Sankalp Patra printable sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadPujas} disabled={loading} className="px-3 py-1.5 text-xs">
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button
            onClick={() =>
              setEditPuja({
                title: '',
                subtitle: '',
                deity: 'Lord Shiva',
                templeVenue: 'काशी विश्वनाथ धाम, वाराणसी',
                eventDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
                muhuratTime: 'प्रातः 07:15 AM - 10:30 AM',
                maxDevotees: 108,
                status: 'ACTIVE',
                isFeatured: true,
                tiers: DEFAULT_TIERS,
              })
            }
            className="px-3 py-1.5 text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Festival Puja
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Total Festival Pujas</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--text-primary)]">{pujas.length}</p>
          <p className="mt-1 text-[11px] text-green-500">{activeCount} active & booking</p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Enrolled Devotees</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--text-primary)]">{totalDevotees}</p>
          <p className="mt-1 text-[11px] text-amber-500">Live sankalp registrations</p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Starting Dakshina</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--text-primary)]">₹101</p>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Affordable for every devotee</p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Sankalp Patra Ready</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--text-primary)]">Print Ready</p>
          <p className="mt-1 text-[11px] text-blue-500">Gotra & Family name sheets</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Input
            placeholder="Search by festival title, venue, or deity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-orange-500 text-white'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {st === 'ALL' ? 'All Pujas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Pujas List */}
      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <Spinner />
        </div>
      ) : filteredPujas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-12 text-center">
          <Flame className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
          <h3 className="mt-3 font-heading text-sm font-bold text-[var(--text-primary)]">No Festival Pujas Found</h3>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {search ? 'Try modifying your search terms.' : 'Create your first grand festival puja to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredPujas.map((p) => {
            const enrolled = p.enrolledCount || 0;
            const max = p.maxDevotees || 108;
            const pct = Math.min(100, Math.round((enrolled / max) * 100));

            const badgeTone =
              p.status === 'ACTIVE'
                ? 'green'
                : p.status === 'UPCOMING'
                ? 'amber'
                : p.status === 'COMPLETED'
                ? 'blue'
                : 'red';

            return (
              <div
                key={p._id || p.id}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-sm transition hover:border-orange-500/50 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Deity & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                      <Sparkles className="h-3 w-3" /> {p.deity}
                    </span>
                    <Badge tone={badgeTone}>{p.status}</Badge>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="mt-3 font-heading text-base font-bold text-[var(--text-primary)] leading-snug">
                    {p.title}
                  </h3>
                  {p.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{p.subtitle}</p>
                  ) : null}

                  {/* Venue & Muhurat Info */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[var(--bg-hover)] p-3 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                      <span className="truncate">{p.templeVenue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Calendar className="h-4 w-4 shrink-0 text-amber-500" />
                      <span>{new Date(p.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-[var(--text-secondary)]">
                      <Clock className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{p.muhuratTime}</span>
                    </div>
                  </div>

                  {/* Progress Bar of Devotees Enrolled */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-secondary)]">Devotees Enrolled:</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {enrolled} / {max} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-hover)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Micro-Dakshina Tiers Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(p.tiers || DEFAULT_TIERS).map((t) => (
                      <span
                        key={t.id}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
                      >
                        {t.name.split('(')[0]}: <strong className="text-orange-600">₹{t.dakshina}</strong>
                      </span>
                    ))}
                  </div>

                  {/* Sankalp Video / Photo Proof indicator */}
                  {p.sankalpVideoUrl ? (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Sankalp video proof uploaded</span>
                    </div>
                  ) : null}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border-color)] pt-3">
                  <Button
                    className="flex-1 px-3 py-1.5 text-xs"
                    onClick={() => openDevoteesModal(p)}
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Sankalp Patra ({enrolled})
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => openProofModal(p)}
                  >
                    <Video className="mr-1.5 h-3.5 w-3.5" /> Upload Proof
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setEditPuja(p)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DEVOTEES & SANKALP PATRA PRINT MODAL */}
      <Modal
        open={isSankalpPatraOpen}
        onClose={() => setIsSankalpPatraOpen(false)}
        title="पंडित जी संकल्प पत्र (Pandit Ji Sankalp Patra)"
        extraWide
      >
        {selectedPujaForDevotees && (
          <div className="space-y-4">
            {/* Action Bar inside Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-orange-500/10 p-3 text-xs text-orange-900 dark:text-orange-200">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-orange-600" />
                <span>
                  यह सूची विशेष हवन व संकल्प वेदी पर आहुति हेतु पंडित जी के लिए तैयार की गई है।
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportCsv} disabled={!devoteesList.length} className="px-3 py-1.5 text-xs">
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
                </Button>
                <Button onClick={handlePrintSankalpPatra} disabled={!devoteesList.length} className="px-3 py-1.5 text-xs">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Sheet (A4)
                </Button>
              </div>
            </div>

            {/* Printable Sankalp Patra Document Container */}
            <div id="printable-sankalp-patra" className="rounded-xl border border-[var(--border-color)] bg-white p-6 text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100">
              {/* Header with Om & Sacred Mantras */}
              <div className="border-b-2 border-orange-500 pb-4 text-center">
                <div className="font-heading text-2xl font-black text-orange-600">ॐ श्री गणेशाय नमः</div>
                <h2 className="mt-1 font-heading text-lg font-bold">
                  {selectedPujaForDevotees.title}
                </h2>
                <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  तीर्थ क्षेत्र: <strong>{selectedPujaForDevotees.templeVenue}</strong> | तिथि:{' '}
                  <strong>
                    {new Date(selectedPujaForDevotees.eventDate).toLocaleDateString('hi-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>{' '}
                  | मुहूर्त: <strong>{selectedPujaForDevotees.muhuratTime}</strong>
                </div>
                <div className="mt-2 text-[11px] italic text-orange-700 dark:text-orange-300">
                  "मम आत्मनः सकलदुरितक्षयद्वारा श्री परमेश्वरप्रीत्यर्थं देवताप्रीत्यर्थं यजमान संकल्प नामावली"
                </div>
              </div>

              {/* Devotees Count Summary */}
              <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                <span>कुल पंजीकृत यजमान: {devoteesList.length}</span>
                <span>संपूर्ण दक्षिणा संकल्प सूची</span>
              </div>

              {/* Table */}
              {devoteesLoading ? (
                <div className="flex min-h-[180px] items-center justify-center">
                  <Spinner />
                </div>
              ) : devoteesList.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  इस अनुष्ठान में अभी कोई यजमान पंजीकृत नहीं है।
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 bg-orange-50 font-bold text-stone-700 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300">
                        <th className="py-2.5 px-3">क्र.</th>
                        <th className="py-2.5 px-3">यजमान का नाम</th>
                        <th className="py-2.5 px-3">गोत्र</th>
                        <th className="py-2.5 px-3">राशि / परिवार सदस्य</th>
                        <th className="py-2.5 px-3">मनोकामना / संकल्प</th>
                        <th className="py-2.5 px-3">संकल्प वर्ग</th>
                        <th className="py-2.5 px-3">स्थिति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {devoteesList.map((d, index) => (
                        <tr key={d.bookingId || index} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                          <td className="py-2.5 px-3 font-semibold text-stone-500">{index + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-stone-100">
                            {d.devoteeName}
                            <div className="text-[10px] font-normal text-stone-500">ID: {d.bookingId}</div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-orange-600 dark:text-orange-400">
                            {d.gotra || 'कश्यप'}
                          </td>
                          <td className="py-2.5 px-3">
                            {d.rashi ? <span className="font-medium text-stone-700 dark:text-stone-300">राशि: {d.rashi}</span> : null}
                            {d.familyMembers && d.familyMembers.length > 0 ? (
                              <div className="text-[11px] text-stone-600 dark:text-stone-400">
                                {d.familyMembers.map((m) => `${m.name} (${m.relation})`).join(', ')}
                              </div>
                            ) : null}
                          </td>
                          <td className="py-2.5 px-3 text-stone-700 dark:text-stone-300">
                            {d.sankalpWish || 'सुख, शांति एवं आरोग्य'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-stone-900 dark:text-stone-100">{d.tierName}</span>
                            <div className="text-[10px] text-stone-500">₹{d.amount}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              {d.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pandit Ji Signature Box on Printable Form */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-dashed border-stone-300 pt-6 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400">
                <div>
                  <p className="font-medium">वेदिक आचार्य / मुख्य पुरोहित हस्ताक्षर:</p>
                  <div className="mt-8 border-b border-stone-400 w-48"></div>
                  <p className="mt-1 text-[11px]">पं. रजनीश जी (वेदिक आचार्य)</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">सत्यापन व आहुति सम्पन्न तिथि:</p>
                  <div className="mt-8 border-b border-stone-400 w-48 ml-auto"></div>
                  <p className="mt-1 text-[11px]">वेदरीति (VedRiti) पावन संकल्प</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* UPLOAD PROOF MODAL */}
      <Modal
        open={!!proofPuja}
        onClose={() => setProofPuja(null)}
        title="संकल्प वीडियो व प्रमाण अपलोड करें (Sankalp Proof)"
        wide
      >
        {proofPuja && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              पूजा सम्पन्न होने के बाद पंडित जी द्वारा लिया गया संकल्प वीडियो (YouTube/Google Drive लिंक) और फ़ोटो साझा करें ताकि पंजीकृत यजमान अपने मोबाइल ऐप में दर्शन कर सकें।
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Sankalp Video URL (YouTube / Google Drive)
              </label>
              <Input
                placeholder="https://youtu.be/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Sankalp Photos (Image URLs, one per line)
              </label>
              <textarea
                rows={3}
                placeholder="https://.../photo1.jpg&#10;https://.../photo2.jpg"
                value={photoUrls}
                onChange={(e) => setPhotoUrls(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)]">Puja Status</label>
              <select
                value={proofStatus}
                onChange={(e) => setProofStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-orange-500"
              >
                <option value="ACTIVE">ACTIVE (Ongoing)</option>
                <option value="COMPLETED">COMPLETED (पूजा सम्पन्न)</option>
                <option value="UPCOMING">UPCOMING</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setProofPuja(null)} className="px-3 py-1.5 text-xs">
                Cancel
              </Button>
              <Button onClick={handleSaveProof} disabled={savingProof} className="px-3 py-1.5 text-xs">
                {savingProof ? 'Saving...' : 'Save & Publish Proof'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE / EDIT PUJA MODAL */}
      <Modal
        open={!!editPuja}
        onClose={() => setEditPuja(null)}
        title={editPuja?._id || editPuja?.id ? 'Edit Festival Puja' : 'New Grand Festival Puja'}
        wide
      >
        {editPuja && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  Puja Title (हिन्दी / English) *
                </label>
                <Input
                  placeholder="e.g. महाशिवरात्रि 1008 महामृत्युंजय व बेलपत्र महा-अनुष्ठान"
                  value={editPuja.title || ''}
                  onChange={(e) => setEditPuja({ ...editPuja, title: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Deity *</label>
                <Input
                  placeholder="e.g. Lord Shiva / Mahadev"
                  value={editPuja.deity || ''}
                  onChange={(e) => setEditPuja({ ...editPuja, deity: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Temple Venue *</label>
                <Input
                  placeholder="e.g. काशी विश्वनाथ धाम, वाराणसी"
                  value={editPuja.templeVenue || ''}
                  onChange={(e) => setEditPuja({ ...editPuja, templeVenue: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Event Date *</label>
                <Input
                  type="date"
                  value={(editPuja.eventDate || '').slice(0, 10)}
                  onChange={(e) => setEditPuja({ ...editPuja, eventDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Muhurat Time *</label>
                <Input
                  placeholder="e.g. प्रातः 07:15 AM - 10:30 AM"
                  value={editPuja.muhuratTime || ''}
                  onChange={(e) => setEditPuja({ ...editPuja, muhuratTime: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Max Devotee Capacity</label>
                <Input
                  type="number"
                  placeholder="108"
                  value={editPuja.maxDevotees || 108}
                  onChange={(e) => setEditPuja({ ...editPuja, maxDevotees: Number(e.target.value) })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Status</label>
                <select
                  value={editPuja.status || 'ACTIVE'}
                  onChange={(e) => setEditPuja({ ...editPuja, status: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-orange-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Subtitle / Short Tagline</label>
                <Input
                  placeholder="e.g. आपके नाम व गोत्र से 1008 महामृत्युंजय मंत्रों के साथ विशेष रुद्राभिषेक"
                  value={editPuja.subtitle || ''}
                  onChange={(e) => setEditPuja({ ...editPuja, subtitle: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">Banner Image URL</label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={editPuja.imageUrl || ''}
                  onChange={(e) => setEditPuja({ ...editPuja, imageUrl: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditPuja(null)} className="px-3 py-1.5 text-xs">
                Cancel
              </Button>
              <Button onClick={handleSavePuja} disabled={savingPuja} className="px-3 py-1.5 text-xs">
                {savingPuja ? 'Saving...' : 'Save Festival Puja'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
