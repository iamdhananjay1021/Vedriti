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
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
        />
        <Button variant="outline" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={() => setDate(todayIst())}>
          Today
        </Button>
        <span className="ml-auto font-semibold">{formatDate(date)}</span>
      </Card>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!view && !error ? <Spinner /> : null}

      {view ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold">Bookings</h2>
                {view.dayAvailability ? <Badge tone="amber">{view.dayAvailability}</Badge> : <Badge tone="green">Open for booking</Badge>}
              </div>
              {view.bookings.length ? (
                <div className="divide-y divide-[var(--border-color)]">
                  {view.bookings.map((b) => (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div>
                        <p className="font-semibold">
                          {formatTime(b.startTime)} - {formatTime(b.endTime)} • {b.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {b.devoteeName} • {b.phone} • {MODE_LABELS[b.mode]}
                        </p>
                      </div>
                      <Badge tone={TONE[b.status]}>{BOOKING_STATUS[b.status]}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-[var(--text-muted)]">No bookings on this day</p>
              )}
            </Card>

            <Card>
              <h2 className="mb-1 font-bold">Slot availability</h2>
              <p className="mb-3 text-xs text-[var(--text-muted)]">Based on appointment length. Longer pujas need more free time after the start.</p>
              {view.slots.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {view.slots.map((s) => (
                    <div
                      key={s.startTime}
                      className={`rounded-lg border px-2 py-1.5 text-center text-xs font-semibold ${
                        s.available ? 'border-green-500/40 text-green-700 dark:text-green-400' : 'border-[var(--border-color)] text-[var(--text-muted)] line-through'
                      }`}
                    >
                      {formatTime(s.startTime)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">{view.dayAvailability || 'No slots on this day'}</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h2 className="font-bold">Day off</h2>
              <p className="mb-3 mt-1 text-sm text-[var(--text-muted)]">
                {isDayOff ? 'This whole day is closed for new bookings.' : 'Close the whole day (travel, festival, personal).'}
              </p>
              <Button variant={isDayOff ? 'outline' : 'danger'} loading={busy === 'day'} onClick={toggleDayOff} className="w-full">
                {isDayOff ? 'Open this day' : 'Mark whole day off'}
              </Button>
            </Card>

            <Card>
              <h2 className="mb-3 font-bold">Block time</h2>
              <div className="grid grid-cols-2 gap-2">
                <Input label="From" type="time" value={block.startTime} onChange={(e) => setBlock({ ...block, startTime: e.target.value })} />
                <Input label="To" type="time" value={block.endTime} onChange={(e) => setBlock({ ...block, endTime: e.target.value })} />
              </div>
              <Input className="mt-2" label="Reason" hint="(private)" value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value })} />
              <Button className="mt-3 w-full" loading={busy === 'block'} onClick={addBlock}>
                Block this time
              </Button>

              {view.blocks.length ? (
                <div className="mt-4 space-y-2">
                  {view.blocks.map((b) => (
                    <div key={b.group} className="flex items-center justify-between rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm">
                      <div>
                        <p className="font-semibold">
                          {formatTime(b.blocks[0])} - {formatTime(endOf(b.blocks[b.blocks.length - 1]))}
                        </p>
                        {b.reason ? <p className="text-xs text-[var(--text-muted)]">{b.reason}</p> : null}
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
