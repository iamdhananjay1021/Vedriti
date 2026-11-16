'use client';

import React, { useCallback, useState } from 'react';
import { useLoader } from '../../lib/useLoader';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { DayView, Settings } from '../../lib/types';
import { addDays, BOOKING_STATUS, formatDate, formatTime, MODE_LABELS, todayIst, TONE } from '../../lib/format';
import { Badge, Button, Card, ErrorBox, Input, Spinner, useToast } from '../ui';

export function ScheduleTab() {
  const [date, setDate] = useState(todayIst());
  const [block, setBlock] = useState({ startTime: '09:00', endTime: '12:00', reason: '' });
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();

  const fetcher = useCallback(() => Promise.all([adminApi.day(date), adminApi.settings()]), [date]);
  const { data, error, reload: load, setData } = useLoader<[DayView, Settings]>(fetcher);
  const view = data && data[0].date === date ? data[0] : null;
  const settings = data ? data[1] : null;
  const setSettings = (next: Settings) => {
    if (data) setData([data[0], next]);
  };

  const toggleDayOff = async () => {
    if (!settings) return;
    const blocked = settings.blockedDates.includes(date);
    if (!blocked && view?.bookings.some((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')) {
      if (!window.confirm('There are active bookings on this day. They will NOT be cancelled automatically. Mark day off anyway?')) return;
    }
    setBusy('day');
    try {
      const blockedDates = blocked ? settings.blockedDates.filter((d) => d !== date) : [...settings.blockedDates, date];
      setSettings(await adminApi.saveSettings({ blockedDates }));
      toast.ok(blocked ? 'Day opened for bookings' : 'Day marked as off');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const addBlock = async () => {
    if (block.endTime <= block.startTime) {
      toast.error('End time must be after start time');
      return;
    }
    setBusy('block');
    try {
      await adminApi.block({ date, ...block });
      toast.ok('Time blocked');
      setBlock((b) => ({ ...b, reason: '' }));
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const removeBlock = async (group: string) => {
    setBusy(group);
    try {
      await adminApi.unblock(group);
      toast.ok('Block removed');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const isDayOff = settings?.blockedDates.includes(date);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
            ॐ
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
            Schedule & Slots Management
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
          Manage Pandit Ji daily ritual slots, blocked intervals, holiday closures, and live calendar availability.
        </p>
      </div>

      {/* Date Navigator Card */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day" className="p-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-xs sm:text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--saffron)] shadow-2xs"
          />
          <Button variant="outline" onClick={() => setDate(addDays(date, 1))} aria-label="Next day" className="p-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => setDate(todayIst())} className="font-bold text-xs py-2 px-3">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isDayOff ? (
            <Badge tone="red">● Day Off (Closed)</Badge>
          ) : view?.dayAvailability ? (
            <Badge tone="amber">{view.dayAvailability}</Badge>
          ) : (
            <Badge tone="green">● Open for Rituals</Badge>
          )}
          <span className="font-heading font-bold text-sm sm:text-base text-[var(--text-primary)]">
            {formatDate(date)}
          </span>
        </div>
      </Card>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!view && !error ? <Spinner /> : null}

      {view ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card className="space-y-4 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">
                  Scheduled Bookings on this Day
                </h2>
                <span className="rounded-full bg-[var(--saffron)]/15 px-3 py-0.5 text-xs font-bold text-[var(--saffron)]">
                  {view.bookings.length} Bookings
                </span>
              </div>
              {view.bookings.length ? (
                <div className="space-y-3">
                  {view.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-2xs transition hover:border-[var(--saffron)]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[var(--saffron)]">#{b.bookingId}</span>
                          <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">{b.title}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                          <span className="text-blue-600 font-bold">
                            {formatTime(b.startTime)} - {formatTime(b.endTime)}
                          </span>
                          <span>•</span>
                          <span>यजमान: <strong className="text-[var(--text-primary)]">{b.devoteeName}</strong></span>
                          <span>•</span>
                          <span className="font-mono">{b.phone}</span>
                          <span>•</span>
                          <span>{MODE_LABELS[b.mode]}</span>
                        </div>
                      </div>
                      <Badge tone={TONE[b.status]}>{BOOKING_STATUS[b.status]}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-medium text-[var(--text-muted)]">
                  No ritual bookings scheduled for {formatDate(date)}.
                </div>
              )}
            </Card>

            <Card className="space-y-4 p-5 sm:p-6 shadow-sm">
              <div className="border-b border-[var(--border-color)] pb-3">
                <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">Live Slot Availability</h2>
                <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
                  Green indicates active available booking slots. Cross indicates booked, buffered or blocked slots.
                </p>
              </div>
              {view.slots.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {view.slots.map((s) => (
                    <div
                      key={s.startTime}
                      className={`rounded-xl border px-2.5 py-2 text-center text-xs font-bold transition shadow-2xs ${
                        s.available
                          ? 'border-green-500/40 bg-green-500/10 text-green-800 dark:text-green-300'
                          : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-muted)] line-through opacity-60'
                      }`}
                    >
                      {formatTime(s.startTime)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-xs font-medium text-[var(--text-muted)]">{view.dayAvailability || 'No slots configured on this day'}</p>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="space-y-3 p-5 sm:p-6 shadow-sm">
              <h2 className="font-heading font-bold text-base text-[var(--text-primary)]">Full Day Off / Closure</h2>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {isDayOff
                  ? 'This entire day is marked as closed. No new ritual slots will be offered in the app.'
                  : 'Close this whole day for travel, temple festival duty, or personal reasons.'}
              </p>
              <Button
                variant={isDayOff ? 'outline' : 'danger'}
                loading={busy === 'day'}
                onClick={toggleDayOff}
                className="w-full font-bold text-xs py-2.5"
              >
                {isDayOff ? 'Re-open this Day for Bookings' : 'Mark Whole Day as Off'}
              </Button>
            </Card>

            <Card className="space-y-4 p-5 sm:p-6 shadow-sm">
              <h2 className="font-heading font-bold text-base text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2.5">
                Block Specific Time Interval
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Input label="From Time" type="time" value={block.startTime} onChange={(e) => setBlock({ ...block, startTime: e.target.value })} />
                <Input label="To Time" type="time" value={block.endTime} onChange={(e) => setBlock({ ...block, endTime: e.target.value })} />
              </div>
              <Input label="Reason (Private Note)" placeholder="e.g. Personal sankalp, lunch break" value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value })} />
              <Button className="w-full font-bold text-xs py-2.5" loading={busy === 'block'} onClick={addBlock}>
                Block This Time Slot
              </Button>

              {view.blocks.length ? (
                <div className="mt-4 space-y-2 border-t border-[var(--border-color)] pt-3">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)]">Currently Blocked Intervals:</h4>
                  {view.blocks.map((b) => (
                    <div key={b.group} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-xs shadow-2xs">
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">
                          {formatTime(b.blocks[0])} - {formatTime(endOf(b.blocks[b.blocks.length - 1]))}
                        </p>
                        {b.reason ? <p className="text-[11px] text-[var(--text-muted)] italic">{b.reason}</p> : null}
                      </div>
                      <button onClick={() => removeBlock(b.group)} disabled={busy === b.group} className="rounded p-1.5 hover:bg-[var(--bg-hover)]" aria-label="Remove block">
                        <Trash2 className="h-4 w-4 text-[var(--red)]" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      ) : null}
      {toast.node}
    </div>
  );
}

const endOf = (block: string) => {
  const [h, m] = block.split(':').map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
