'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Phone, Search } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { Booking, DayView } from '../../lib/types';
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
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Pagination, Row, Select, Spinner, Textarea, useToast } from '../ui';

type Scope = 'upcoming' | 'today' | 'past' | 'all';

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
];

export function BookingsTab({ onChanged }: { onChanged: () => void }) {
  const [scope, setScope] = useState<Scope>('upcoming');
  const [status, setStatus] = useState('ALL');
  const [serviceType, setServiceType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const toast = useToast();

  const fetcher = useCallback(() => {
    const today = todayIst();
    const range =
      scope === 'upcoming' ? { from: today } : scope === 'today' ? { from: today, to: today } : scope === 'past' ? { to: today } : {};
    return adminApi.bookings({ ...range, status, serviceType, search: query, page, limit: 20 });
  }, [scope, status, serviceType, query, page]);
  const { data, error, reload: load } = useLoader(fetcher);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const onSaved = (b: Booking, message: string) => {
    setSelected(b);
    toast.ok(message);
    load();
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SCOPES.map((s) => (
          <Button
            key={s.value}
            variant={scope === s.value ? 'primary' : 'outline'}
            onClick={() => {
              setScope(s.value);
              setPage(1);
            }}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking ID, name, phone, puja"
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--saffron)]"
          />
        </label>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[{ value: 'ALL', label: 'All statuses' }, ...Object.entries(BOOKING_STATUS).map(([value, label]) => ({ value, label }))]}
        />
        <Select
          value={serviceType}
          onChange={(e) => {
            setServiceType(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'Pujas & appointments' },
            { value: 'PUJA', label: 'Pujas only' },
            { value: 'CONSULTATION', label: 'Appointments only' },
          ]}
        />
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? <Empty title="No bookings found" /> : null}

      {data?.items.length ? (
        <div className="grid gap-3">
          {data.items.map((b) => (
            <button key={b.id} onClick={() => setSelected(b)} className="text-left">
              <Card className="transition hover:border-[var(--saffron)]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{b.title}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {formatDate(b.date)} • {formatTime(b.startTime)} - {formatTime(b.endTime)} • {MODE_LABELS[b.mode]}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {b.bookingId} • {b.devoteeName} • {b.phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={TONE[b.status]}>{BOOKING_STATUS[b.status]}</Badge>
                    <span className="text-sm font-semibold">{rupees(b.amount)}</span>
                    <Badge tone={TONE[b.paymentStatus]}>{PAYMENT_STATUS[b.paymentStatus]}</Badge>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : null}
      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}

      {selected ? <BookingDetail booking={selected} onClose={() => setSelected(null)} onSaved={onSaved} onError={toast.error} /> : null}
      {toast.node}
    </div>
  );
}

function BookingDetail({
  booking,
  onClose,
  onSaved,
  onError,
}: {
  booking: Booking;
  onClose: () => void;
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
      title={booking.bookingId}
      wide
      footer={
        <>
          {booking.status === 'PENDING' ? (
            <Button loading={busy === 'confirm'} onClick={() => update('confirm', { status: 'CONFIRMED', meetingLink, panditNote }, 'Booking confirmed')}>
              Confirm booking
            </Button>
          ) : null}
          {booking.status === 'CONFIRMED' ? (
            <Button loading={busy === 'complete'} onClick={() => update('complete', { status: 'COMPLETED' }, 'Marked as completed')}>
              Mark completed
            </Button>
          ) : null}
          {active ? (
            <Button variant="outline" onClick={() => setRescheduleOpen(true)}>
              Reschedule
            </Button>
          ) : null}
          {active ? (
            <Button variant="danger" loading={busy === 'cancel'} onClick={cancel}>
              Cancel booking
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone={TONE[booking.status]}>{BOOKING_STATUS[booking.status]}</Badge>
            <Badge tone={TONE[booking.paymentStatus]}>{PAYMENT_STATUS[booking.paymentStatus]}</Badge>
            <Badge>{booking.serviceType === 'PUJA' ? 'Puja' : 'Appointment'}</Badge>
          </div>
          <h4 className="text-lg font-bold">{booking.title}</h4>
          {booking.packageName ? <p className="text-sm text-[var(--text-secondary)]">{booking.packageName}</p> : null}
          <div className="mt-3 divide-y divide-[var(--border-color)]">
            <Row label="Date">{formatDate(booking.date)}</Row>
            <Row label="Time">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </Row>
            <Row label="Mode">{MODE_LABELS[booking.mode]}</Row>
            <Row label="Amount">{rupees(booking.amount)}</Row>
            <Row label="Payment">{booking.paymentMethod === 'ONLINE' ? 'Online' : 'Pay later'}</Row>
            <Row label="Booked on">{formatDateTime(booking.createdAt)}</Row>
          </div>
          {booking.cancelReason ? <p className="mt-3 rounded-lg bg-[var(--red-bg)] p-2 text-sm text-[var(--red)]">{booking.cancelReason}</p> : null}
        </div>

        <div>
          <h4 className="font-bold">Devotee</h4>
          <div className="divide-y divide-[var(--border-color)]">
            <Row label="Name">{booking.devoteeName}</Row>
            <Row label="Phone">{booking.phone}</Row>
            {booking.gotra ? <Row label="Gotra">{booking.gotra}</Row> : null}
            {booking.user?.email ? <Row label="Email">{booking.user.email}</Row> : null}
          </div>
          <div className="mt-2 flex gap-2">
            <a href={telLink(booking.phone)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm font-semibold">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href={waLink(booking.phone, `Pranam ${booking.devoteeName} ji, regarding your booking ${booking.bookingId} on ${formatDate(booking.date)} at ${formatTime(booking.startTime)}.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm font-semibold text-green-600"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          {booking.familyMembers.length ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Family in sankalp</p>
              <p className="text-sm">{booking.familyMembers.join(', ')}</p>
            </div>
          ) : null}
          {booking.sankalpNote ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">{booking.serviceType === 'PUJA' ? 'Sankalp / wish' : 'Topic'}</p>
              <p className="whitespace-pre-wrap text-sm">{booking.sankalpNote}</p>
            </div>
          ) : null}
          {booking.address ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Address</p>
              <p className="text-sm">
                {booking.address}
                {booking.city ? `, ${booking.city}` : ''} {booking.pinCode}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-[var(--border-color)] pt-4">
        {isOnline ? (
          <Input
            label="Meeting link"
            hint="(shown to devotee after confirmation)"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
          />
        ) : null}
        <Textarea label="Note for devotee" value={panditNote} onChange={(e) => setPanditNote(e.target.value)} placeholder="e.g. Keep kalash and fresh flowers ready" />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" loading={busy === 'note'} onClick={() => update('note', { meetingLink, panditNote }, 'Saved')}>
            Save link & note
          </Button>
          {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' ? (
            <Button variant="outline" loading={busy === 'paid'} onClick={() => update('paid', { paymentStatus: 'PAID' }, 'Marked as paid')}>
              Mark paid (cash / UPI)
            </Button>
          ) : null}
          {booking.paymentStatus === 'PAID' && booking.status === 'CANCELLED' ? (
            <Button variant="outline" loading={busy === 'refund'} onClick={() => update('refund', { paymentStatus: 'REFUNDED' }, 'Marked as refunded')}>
              Mark refunded
            </Button>
          ) : null}
        </div>
        {active ? <Input label="Cancel reason" hint="(optional, shown to devotee)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} /> : null}
      </div>

      {rescheduleOpen ? (
        <RescheduleModal
          booking={booking}
          onClose={() => setRescheduleOpen(false)}
          onDone={(b) => {
            setRescheduleOpen(false);
            onSaved({ ...booking, ...b }, 'Booking rescheduled');
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
      title="Reschedule booking"
      footer={
        <Button disabled={!time} loading={saving} onClick={save}>
          Move to {time ? formatTime(time) : '...'}
        </Button>
      }
    >
      <Input
        label="New date"
        type="date"
        value={date}
        min={todayIst()}
        onChange={(e) => {
          if (!e.target.value) return;
          setDate(e.target.value);
          setTime('');
        }}
      />
      {viewError ? <p className="mt-2 text-sm text-[var(--red)]">{viewError}</p> : null}
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Showing start times where {booking.durationMinutes} free minutes are available. The current slot of this booking shows as booked.
      </p>
      {!view && !viewError ? <Spinner /> : null}
      {view?.dayAvailability && !view.slots.length ? <p className="mt-3 text-sm text-[var(--red)]">{view.dayAvailability}</p> : null}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {view?.slots.map((s) => (
          <button
            key={s.startTime}
            onClick={() => setTime(s.startTime)}
            className={`rounded-lg border px-2 py-2 text-sm font-semibold ${
              time === s.startTime ? 'border-[var(--saffron)] bg-[var(--saffron)] text-white' : 'border-[var(--border-color)]'
            } ${s.available ? '' : 'opacity-40'}`}
          >
            {formatTime(s.startTime)}
          </button>
        ))}
      </div>
    </Modal>
  );
}
