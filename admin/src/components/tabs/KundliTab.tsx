'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileText, MessageCircle, Paperclip, Phone, ScrollText, Trash2, UploadCloud } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { KundliPerson, KundliRequest } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import {
  formatDate,
  formatDateTime,
  formatTime,
  KUNDLI_STATUS,
  KUNDLI_TYPES,
  PAYMENT_STATUS,
  rupees,
  telLink,
  TONE,
  waLink,
} from '../../lib/format';
import { exportToCsv } from '../../lib/exportCsv';
import { Badge, Button, Card, Empty, ErrorBox, Modal, Pagination, Row, Select, Spinner, Textarea, useToast } from '../ui';

export function KundliTab({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<KundliRequest | null>(null);
  const toast = useToast();

  const fetcher = useCallback(() => adminApi.kundli({ status, search: query, page, limit: 20 }), [status, query, page]);
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
      'vedrit_kundli_inquiries',
      [
        { header: 'Request ID', accessor: (r) => r.requestId },
        { header: 'Type', accessor: (r) => KUNDLI_TYPES[r.type] || r.type },
        { header: 'Devotee Name', accessor: (r) => r.primaryPerson.fullName },
        { header: 'Gender', accessor: (r) => r.primaryPerson.gender },
        { header: 'Date of Birth', accessor: (r) => r.primaryPerson.dateOfBirth },
        { header: 'Time of Birth', accessor: (r) => r.primaryPerson.timeUnknown ? 'Unknown' : r.primaryPerson.timeOfBirth || '' },
        { header: 'Place of Birth', accessor: (r) => r.primaryPerson.placeOfBirth },
        { header: 'Partner Name', accessor: (r) => r.partnerPerson?.fullName || '' },
        { header: 'Partner DOB', accessor: (r) => r.partnerPerson?.dateOfBirth || '' },
        { header: 'Phone', accessor: (r) => r.contactPhone },
        { header: 'Language', accessor: (r) => r.preferredLanguage },
        { header: 'Questions', accessor: (r) => r.questions || '' },
        { header: 'Amount (INR)', accessor: (r) => r.amount },
        { header: 'Payment Method', accessor: (r) => r.paymentMethod },
        { header: 'Payment Status', accessor: (r) => r.paymentStatus },
        { header: 'Inquiry Status', accessor: (r) => r.status },
        { header: 'Pandit Response', accessor: (r) => r.panditResponse || '' },
        { header: 'Report URL', accessor: (r) => r.reportUrl || '' },
        { header: 'Requested At', accessor: (r) => r.createdAt },
        { header: 'Responded At', accessor: (r) => r.respondedAt || '' },
      ],
      data.items
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              Vedic Kundli & Jyotish Inquiries
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Review devotee birth charts, prepare astrological remedies, and upload Janampatri PDF charts.
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
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Operational Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card
          onClick={() => { setStatus('ALL'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500 ${status === 'ALL' ? 'border-2 border-purple-500 bg-purple-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Total Requests</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 shadow-xs">
              <ScrollText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[var(--text-primary)]">
            {data?.total ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Devotee horoscope inquiries</p>
        </Card>

        <Card
          onClick={() => { setStatus('SUBMITTED'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 ${status === 'SUBMITTED' ? 'border-2 border-amber-500 bg-amber-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Awaiting Review</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-amber-700 dark:text-amber-400">
            {data?.items.filter(k => k.status === 'SUBMITTED' || k.status === 'IN_REVIEW').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Pending Pandit Ji analysis</p>
        </Card>

        <Card
          onClick={() => { setStatus('ANSWERED'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 ${status === 'ANSWERED' ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Faladesh Delivered</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 shadow-xs">
              <ScrollText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-emerald-700 dark:text-emerald-400">
            {data?.items.filter(k => k.status === 'ANSWERED' || k.status === 'CLOSED').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Answered & PDF sent</p>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">With PDF Attached</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 shadow-xs">
              <Paperclip className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-purple-700 dark:text-purple-400">
            {data?.items.filter(k => Boolean(k.reportUrl)).length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Charts uploaded for app</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request ID, devotee name, phone..."
            className="flex-1 min-w-[240px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-2.5 sm:py-3 text-sm font-semibold outline-none focus:border-[var(--saffron)] text-[var(--text-primary)] shadow-xs"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[{ value: 'ALL', label: 'All statuses' }, ...Object.entries(KUNDLI_STATUS).map(([value, label]) => ({ value, label }))]}
          />
        </div>
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? <Empty title="No kundli requests" /> : null}

      <div className="grid gap-4 sm:gap-5">
        {data?.items.map((k) => (
          <button key={k.id} onClick={() => setSelected(k)} className="text-left group transition">
            <Card className="p-5 sm:p-6 transition group-hover:border-[var(--saffron)] group-hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-[var(--text-primary)]">
                      {KUNDLI_TYPES[k.type]} • {k.primaryPerson.fullName}
                      {k.partnerPerson ? ` & ${k.partnerPerson.fullName}` : ''}
                    </p>
                    {k.reportUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                        <Paperclip className="h-3 w-3" /> Report PDF Attached
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                    <strong className="text-purple-700 dark:text-purple-400">#{k.requestId}</strong> • {k.contactPhone} • {formatDateTime(k.createdAt)}
                  </p>
                  {k.questions ? (
                    <p className="mt-1.5 line-clamp-2 text-xs italic font-medium text-[var(--text-secondary)]">
                      &ldquo;{k.questions}&rdquo;
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={TONE[k.status]}>{KUNDLI_STATUS[k.status]}</Badge>
                  <Badge tone={TONE[k.paymentStatus]}>
                    {rupees(k.amount)} • {PAYMENT_STATUS[k.paymentStatus]}
                  </Badge>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}

      {selected ? (
        <KundliDetail
          request={selected}
          onClose={() => setSelected(null)}
          onSaved={(k, msg) => {
            setSelected(k);
            toast.ok(msg);
            load();
            onChanged();
          }}
          onError={toast.error}
        />
      ) : null}
      {toast.node}
    </div>
  );
}

function Person({ title, p }: { title: string; p: KundliPerson }) {
  return (
    <div>
      <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">{title}</h4>
      <div className="divide-y divide-[var(--border-color)] text-xs">
        <Row label="Full Name">{p.fullName}</Row>
        <Row label="Gender">{p.gender}</Row>
        <Row label="Date of Birth">{formatDate(p.dateOfBirth)}</Row>
        <Row label="Time of Birth">{p.timeUnknown ? 'Unknown (समय ज्ञात नहीं)' : formatTime(p.timeOfBirth)}</Row>
        <Row label="Place of Birth">{p.placeOfBirth}</Row>
      </div>
    </div>
  );
}

function KundliDetail({
  request,
  onClose,
  onSaved,
  onError,
}: {
  request: KundliRequest;
  onClose: () => void;
  onSaved: (k: KundliRequest, msg: string) => void;
  onError: (m: string) => void;
}) {
  const [response, setResponse] = useState(request.panditResponse || '');
  const [reportUrl, setReportUrl] = useState(request.reportUrl || '');
  const [reportName, setReportName] = useState(request.reportName || '');
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = async (key: string, body: Partial<KundliRequest>, msg: string) => {
    setBusy(key);
    try {
      onSaved(await adminApi.updateKundli(request.id, body), msg);
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      setReportUrl(res.url);
      setReportName(file.name);
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveReport = () => {
    setReportUrl('');
    setReportName('');
  };

  const handleSendReply = () => {
    update(
      'answer',
      {
        panditResponse: response.trim(),
        reportUrl,
        reportName,
      },
      'Reply & Kundli report sent to devotee'
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={`${KUNDLI_TYPES[request.type]} • #${request.requestId}`}
      footer={
        <>
          {request.status === 'SUBMITTED' ? (
            <Button variant="outline" loading={busy === 'review'} onClick={() => update('review', { status: 'IN_REVIEW' }, 'Marked in review')}>
              Start review
            </Button>
          ) : null}
          {request.paymentStatus !== 'PAID' ? (
            <Button variant="outline" loading={busy === 'paid'} onClick={() => update('paid', { paymentStatus: 'PAID' }, 'Marked as paid')}>
              Mark paid
            </Button>
          ) : null}
          {request.status !== 'CLOSED' ? (
            <Button variant="ghost" loading={busy === 'close'} onClick={() => update('close', { status: 'CLOSED' }, 'Request closed')}>
              Close
            </Button>
          ) : null}
          <Button
            disabled={response.trim().length < 3 && !reportUrl}
            loading={busy === 'answer'}
            onClick={handleSendReply}
            className="font-bold shadow-md"
          >
            Send Reply to Devotee
          </Button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone={TONE[request.status]}>{KUNDLI_STATUS[request.status]}</Badge>
        <Badge tone={TONE[request.paymentStatus]}>
          {rupees(request.amount)} • {PAYMENT_STATUS[request.paymentStatus]}
        </Badge>
        <Badge>Reply in {request.preferredLanguage === 'HINDI' ? 'Hindi' : 'English'}</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 p-4">
        <Person title={request.partnerPerson ? 'Person 1 (Devotee)' : 'Birth Details'} p={request.primaryPerson} />
        {request.partnerPerson ? <Person title="Person 2 (Partner)" p={request.partnerPerson} /> : null}
      </div>

      {request.questions ? (
        <div className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Devotee Questions / Inquiries</p>
          <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-[var(--text-primary)]">{request.questions}</p>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <a href={telLink(request.contactPhone)} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
          <Phone className="h-3.5 w-3.5" /> Call Devotee
        </a>
        <a
          href={waLink(request.contactPhone, `नमस्ते ${request.primaryPerson.fullName} जी! वेदरीति से आपकी कुंडली परामर्श #${request.requestId} के संदर्भ में...`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-700 dark:text-green-300 hover:bg-green-500/20"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Devotee
        </a>
      </div>

      {/* Kundli PDF / Janampatri Report Attachment */}
      <div className="mt-4 rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/40 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              <Paperclip className="h-4 w-4 text-[var(--saffron)]" />
              Kundli Chart & Janampatri Document (PDF / Image)
            </h4>
            <p className="text-[11px] font-medium text-[var(--text-secondary)]">
              Attach detailed horoscope report, dasha table, or janampatri PDF for devotee to download in app.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs py-1.5 font-bold shadow-xs whitespace-nowrap"
            >
              <UploadCloud className="mr-1.5 h-3.5 w-3.5 text-[var(--saffron)]" />
              {reportUrl ? 'Replace Document' : 'Upload Kundli PDF'}
            </Button>
          </div>
        </div>

        {reportUrl ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-purple-500/40 bg-purple-500/10 p-2.5 text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 text-purple-700 dark:text-purple-400 shrink-0" />
              <span className="font-bold text-purple-900 dark:text-purple-200 truncate">
                {reportName || 'Attached Kundli Report'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={reportUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-purple-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-purple-800"
              >
                Preview / Open
              </a>
              <button
                type="button"
                onClick={handleRemoveReport}
                className="p-1 text-red-600 hover:text-red-800"
                title="Remove attachment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Textarea
        className="mt-4"
        label="Pandit Ji's Astrological Guidance & Remedy"
        hint="(Devotee reads this directly in the VedRit app)"
        rows={7}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Grah dosha analysis, auspicious gemstones, mantra remedies, recommended pujas..."
      />

      {request.respondedAt ? (
        <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">Last replied on {formatDateTime(request.respondedAt)}</p>
      ) : null}
    </Modal>
  );
}
