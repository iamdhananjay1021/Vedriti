'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { ChatMessageItem, ChatSessionItem } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDateTime, formatDate, formatTime, telLink, waLink } from '../../lib/format';
import { exportToCsv } from '../../lib/exportCsv';
import { Badge, Button, Card, Empty, ErrorBox, Modal, Pagination, Row, Select, Spinner, useToast } from '../ui';

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'Festival', label: 'Festivals & Vrat' },
  { value: 'Panchang', label: 'Panchang & Muhurat' },
  { value: 'Kundali', label: 'Kundli & Jyotish' },
  { value: 'Remedy', label: 'Upay & Remedies' },
  { value: 'Puja', label: 'Puja Vidhi' },
  { value: 'Gotra', label: 'Gotra & Lineage' },
  { value: 'General', label: 'General Spiritual' },
];

export function InquiriesTab() {
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const toast = useToast();

  const fetcher = useCallback(
    () => adminApi.chatSessions({ category: category === 'ALL' ? undefined : category, search: query, page, limit: 20 }),
    [category, query, page]
  );
  const { data, error, reload: load } = useLoader(fetcher);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleExportCsv = () => {
    if (!data?.items?.length) return;
    exportToCsv(
      'vedrit_vedic_inquiries',
      [
        { header: 'Session ID', accessor: (s) => s.sessionId },
        { header: 'Devotee Name', accessor: (s) => s.devoteeContext?.name || 'Devotee' },
        { header: 'Phone', accessor: (s) => s.userPhone || '' },
        { header: 'Gotra', accessor: (s) => s.devoteeContext?.gotra || '' },
        { header: 'Rashi', accessor: (s) => s.devoteeContext?.rashi || '' },
        { header: 'City', accessor: (s) => s.devoteeContext?.city || '' },
        { header: 'Topic Title', accessor: (s) => s.title },
        { header: 'Category', accessor: (s) => s.category },
        { header: 'Total Messages', accessor: (s) => s.messageCount },
        { header: 'Last Active', accessor: (s) => s.lastInteractionAt },
        { header: 'Started At', accessor: (s) => s.createdAt },
      ],
      data.items
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              Vedic AI Devotee Inquiries & Spiritual Chat Logs
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Monitor real-time devotee queries on Muhurat, Kundli, Festivals, and offer Pandit Ji guidance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={!data?.items?.length}
            className="text-xs font-bold py-2.5 shadow-xs whitespace-nowrap"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[var(--saffron)]" />
            Export CSV ({data?.total ?? 0})
          </Button>

          <Button variant="outline" onClick={load} className="text-xs py-2.5 font-bold shadow-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card
          onClick={() => { setCategory('ALL'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--saffron)] ${category === 'ALL' ? 'border-2 border-[var(--saffron)] bg-[var(--saffron-light)]/20 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Total Inquiries</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-[var(--saffron)] shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[var(--text-primary)]">
            {data?.total ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">All interactive conversations</p>
        </Card>

        <Card
          onClick={() => { setCategory('Panchang'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 ${category === 'Panchang' ? 'border-2 border-amber-500 bg-amber-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Panchang Queries</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-amber-700 dark:text-amber-400">
            {data?.items.filter(s => s.category === 'Panchang').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Muhurat & Tithi queries</p>
        </Card>

        <Card
          onClick={() => { setCategory('Kundali'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500 ${category === 'Kundali' ? 'border-2 border-purple-500 bg-purple-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Kundli & Upay</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 shadow-xs">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-purple-700 dark:text-purple-400">
            {data?.items.filter(s => s.category === 'Kundali' || s.category === 'Remedy').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Astrology guidance</p>
        </Card>

        <Card
          onClick={() => { setCategory('Festival'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 ${category === 'Festival' ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Festival & Vrats</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 shadow-xs">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-emerald-700 dark:text-emerald-400">
            {data?.items.filter(s => s.category === 'Festival' || s.category === 'Puja').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Puja vidhi & sacred days</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiry, devotee phone, name, gotra, topic..."
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] py-2.5 sm:py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--saffron)] text-[var(--text-primary)] shadow-xs"
          />
        </div>

        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          options={CATEGORIES}
        />
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? (
        <Empty title="No inquiries found" subtitle="Devotee questions submitted in the app will appear here." />
      ) : null}

      {/* Sessions Grid */}
      <div className="grid gap-4 sm:gap-5">
        {data?.items.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedSessionId(s.sessionId)}
            className="cursor-pointer rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm transition hover:border-[var(--saffron)] hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[var(--saffron-light)] px-2 py-0.5 text-xs font-bold text-[var(--saffron)]">
                    {s.category}
                  </span>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{s.title}</h3>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <span>
                    Devotee: <strong className="text-[var(--text-primary)]">{s.devoteeContext?.name || 'Devotee'}</strong>
                  </span>
                  {s.userPhone ? (
                    <>
                      <span>•</span>
                      <span className="font-mono">{s.userPhone}</span>
                    </>
                  ) : null}
                  {s.devoteeContext?.gotra ? (
                    <>
                      <span>•</span>
                      <span>Gotra: <strong className="text-[var(--text-primary)]">{s.devoteeContext.gotra}</strong></span>
                    </>
                  ) : null}
                  {s.devoteeContext?.rashi ? (
                    <>
                      <span>•</span>
                      <span>Rashi: <strong>{s.devoteeContext.rashi}</strong></span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center text-xs">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-bold text-[var(--text-primary)]">
                    <MessageSquare className="h-3.5 w-3.5 text-[var(--saffron)]" />
                    {s.messageCount} messages
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium">
                    {formatDateTime(s.lastInteractionAt)}
                  </p>
                </div>
                <Button variant="outline" className="text-xs py-1.5 font-bold">
                  View Chat
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}

      {/* Chat Session Conversation Modal */}
      {selectedSessionId ? (
        <ChatSessionModal sessionId={selectedSessionId} onClose={() => setSelectedSessionId(null)} />
      ) : null}

      {toast.node}
    </div>
  );
}

function ChatSessionModal({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const fetcher = useCallback(() => adminApi.chatSessionDetail(sessionId), [sessionId]);
  const { data, error, reload } = useLoader(fetcher);

  if (error) {
    return (
      <Modal open onClose={onClose} title="Vedic Inquiry Transcript">
        <ErrorBox message={error} onRetry={reload} />
      </Modal>
    );
  }

  if (!data) {
    return (
      <Modal open onClose={onClose} title="Vedic Inquiry Transcript">
        <Spinner />
      </Modal>
    );
  }

  const { session, messages } = data;

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={`Vedic Chat: ${session.title}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {session.userPhone ? (
              <>
                <a
                  href={telLink(session.userPhone)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  <Phone className="h-3.5 w-3.5" /> Call Devotee
                </a>
                <a
                  href={waLink(
                    session.userPhone,
                    `नमस्ते ${session.devoteeContext?.name || ''} जी! वेदरीति से आपके प्रश्न "${session.title}" के संदर्भ में पंडित जी द्वारा परामर्श...`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-700 dark:text-green-300 hover:bg-green-500/20"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Guidance
                </a>
              </>
            ) : null}
          </div>

          <Button variant="outline" onClick={onClose} className="text-xs font-bold">
            Close Transcript
          </Button>
        </div>
      }
    >
      {/* Devotee Info Banner */}
      <div className="mb-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 p-3.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-extrabold text-[var(--text-primary)]">
              Devotee: {session.devoteeContext?.name || 'Anonymous Yajman'}
              {session.userPhone ? ` • ${session.userPhone}` : ''}
            </p>
            <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">
              Gotra: <strong>{session.devoteeContext?.gotra || 'Not provided'}</strong> • Rashi: <strong>{session.devoteeContext?.rashi || 'Not provided'}</strong> • City: <strong>{session.devoteeContext?.city || 'Not provided'}</strong>
            </p>
          </div>
          <Badge tone="amber">{session.category}</Badge>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-xs ${
                  isUser
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-[11px] uppercase tracking-wider opacity-80">
                    {isUser ? 'Devotee Query' : 'VedRit Vedic AI / Acharya'}
                  </span>
                  <span className="text-[10px] opacity-70">{formatDateTime(m.createdAt)}</span>
                </div>

                <p className="whitespace-pre-wrap font-medium leading-relaxed">{m.text}</p>

                {m.sanskritVerse ? (
                  <div className="mt-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                    <p className="italic">{m.sanskritVerse}</p>
                    {m.shastraReference ? (
                      <p className="mt-1 text-[10px] font-bold text-[var(--saffron)]">— {m.shastraReference}</p>
                    ) : null}
                  </div>
                ) : null}

                {m.remedy ? (
                  <div className="mt-2 rounded-lg border border-purple-500/30 bg-purple-500/10 p-2 text-[11px] font-semibold text-purple-900 dark:text-purple-200">
                    <strong>शास्त्रसम्मत उपाय:</strong> {m.remedy}
                  </div>
                ) : null}

                {m.action && m.action.type !== 'none' ? (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[var(--saffron)] px-2.5 py-1 text-[11px] font-bold text-white">
                    <Flame className="h-3 w-3" />
                    Recommended: {m.action.title}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

