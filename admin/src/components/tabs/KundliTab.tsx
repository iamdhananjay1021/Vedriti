'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { KundliPerson, KundliRequest } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDate, formatDateTime, formatTime, KUNDLI_STATUS, KUNDLI_TYPES, PAYMENT_STATUS, rupees, telLink, TONE, waLink } from '../../lib/format';
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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search request ID, name, phone"
          className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--saffron)] sm:col-span-2"
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
      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? <Empty title="No kundli requests" /> : null}
      <div className="grid gap-3">
        {data?.items.map((k) => (
          <button key={k.id} onClick={() => setSelected(k)} className="text-left">
            <Card className="transition hover:border-[var(--saffron)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {KUNDLI_TYPES[k.type]} • {k.primaryPerson.fullName}
                    {k.partnerPerson ? ` & ${k.partnerPerson.fullName}` : ''}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {k.requestId} • {k.contactPhone} • {formatDateTime(k.createdAt)}
                  </p>
                  {k.questions ? <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{k.questions}</p> : null}
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
      <h4 className="font-bold">{title}</h4>
      <div className="divide-y divide-[var(--border-color)]">
        <Row label="Name">{p.fullName}</Row>
        <Row label="Gender">{p.gender}</Row>
        <Row label="Date of birth">{formatDate(p.dateOfBirth)}</Row>
        <Row label="Time of birth">{p.timeUnknown ? 'Unknown' : formatTime(p.timeOfBirth)}</Row>
        <Row label="Place of birth">{p.placeOfBirth}</Row>
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
  const [busy, setBusy] = useState<string | null>(null);

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

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={`${KUNDLI_TYPES[request.type]} • ${request.requestId}`}
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
          <Button disabled={response.trim().length < 5} loading={busy === 'answer'} onClick={() => update('answer', { panditResponse: response.trim() }, 'Reply sent to devotee')}>
            Send reply
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
      <div className="grid gap-5 md:grid-cols-2">
        <Person title={request.partnerPerson ? 'Person 1' : 'Birth details'} p={request.primaryPerson} />
        {request.partnerPerson ? <Person title="Person 2" p={request.partnerPerson} /> : null}
      </div>
      {request.questions ? (
        <div className="mt-4">
          <p className="text-xs font-semibold text-[var(--text-muted)]">Questions</p>
          <p className="whitespace-pre-wrap text-sm">{request.questions}</p>
        </div>
      ) : null}
      <div className="mt-3 flex gap-2">
        <a href={telLink(request.contactPhone)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm font-semibold">
          <Phone className="h-4 w-4" /> {request.contactPhone}
        </a>
        <a
          href={waLink(request.contactPhone, `Pranam, regarding your kundli request ${request.requestId}.`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm font-semibold text-green-600"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
      <Textarea
        className="mt-4"
        label="Pandit Ji's reply"
        hint="(devotee sees this in the app)"
        rows={8}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Analysis, dosha, remedies, recommended puja..."
      />
      {request.respondedAt ? <p className="mt-1 text-xs text-[var(--text-muted)]">Last replied {formatDateTime(request.respondedAt)}</p> : null}
    </Modal>
  );
}
