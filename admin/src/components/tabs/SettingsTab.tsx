'use client';

import React, { useCallback, useState } from 'react';
import { useLoader } from '../../lib/useLoader';
import { adminApi, errorMessage } from '../../lib/api';
import type { ConsultationMode, KundliType, Settings } from '../../lib/types';
import { DAY_NAMES, formatDate, KUNDLI_TYPES, MODE_LABELS } from '../../lib/format';
import { Button, Card, ErrorBox, Input, Label, Select, Spinner, Textarea, Toggle, useToast } from '../ui';

export function SettingsTab() {
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState('');
  const toast = useToast();
  const fetcher = useCallback(() => adminApi.settings(), []);
  const { data: s, error, reload: load, setData: setS } = useLoader<Settings>(fetcher);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!s) return <Spinner />;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    const bad = s.schedule.find((d) => d.enabled && d.start >= d.end);
    if (bad) return toast.error(`${DAY_NAMES[bad.day]}: end time must be after start time`);
    if (!s.consultation.modes.length) return toast.error('Select at least one consultation mode');
    setSaving(true);
    try {
      const { panditName, panditTitle, panditBio, experienceYears, templeAddress, supportPhone, whatsappNumber, supportEmail, schedule, slotIntervalMinutes, bufferMinutes, bookingWindowDays, minLeadHours, blockedDates, consultation, kundliFees, deliveryCharge, freeDeliveryAbove, allowPayLater, allowCod, userCancelHours } = s;
      setS(
        await adminApi.saveSettings({
          panditName, panditTitle, panditBio, experienceYears, templeAddress, supportPhone, whatsappNumber, supportEmail, schedule,
          slotIntervalMinutes, bufferMinutes, bookingWindowDays, minLeadHours, blockedDates, consultation, kundliFees,
          deliveryCharge, freeDeliveryAbove, allowPayLater, allowCod, userCancelHours,
        })
      );
      toast.ok('Settings saved');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="space-y-4 pb-20">
      <Card>
        <h2 className="mb-3 font-bold">Pandit Ji profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={s.panditName} onChange={(e) => set('panditName', e.target.value)} />
          <Input label="Title" value={s.panditTitle} onChange={(e) => set('panditTitle', e.target.value)} />
          <Input label="Experience (years)" type="number" min={0} value={s.experienceYears} onChange={(e) => set('experienceYears', num(e.target.value))} />
          <Input label="Temple / office address" value={s.templeAddress} onChange={(e) => set('templeAddress', e.target.value)} />
          <Textarea className="sm:col-span-2" label="About" value={s.panditBio} onChange={(e) => set('panditBio', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold">Contact shown in app</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Phone" value={s.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} placeholder="+91 98XXXXXXXX" />
          <Input label="WhatsApp" value={s.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="+91 98XXXXXXXX" />
          <Input label="Email" type="email" value={s.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-bold">Working hours</h2>
        <p className="mb-3 text-sm text-[var(--text-muted)]">Devotees can book slots only within these hours.</p>
        <div className="space-y-2">
          {s.schedule.map((d, i) => (
            <div key={d.day} className="grid grid-cols-[110px_1fr_1fr] items-center gap-2 sm:grid-cols-[140px_160px_160px]">
              <Toggle
                checked={d.enabled}
                label={DAY_NAMES[d.day]}
                onChange={(enabled) => set('schedule', s.schedule.map((x, j) => (j === i ? { ...x, enabled } : x)))}
              />
              <input
                type="time"
                disabled={!d.enabled}
                value={d.start}
                onChange={(e) => set('schedule', s.schedule.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-1.5 text-sm disabled:opacity-40"
              />
              <input
                type="time"
                disabled={!d.enabled}
                value={d.end}
                onChange={(e) => set('schedule', s.schedule.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-1.5 text-sm disabled:opacity-40"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Select
            label="Slot start every"
            value={String(s.slotIntervalMinutes)}
            onChange={(e) => set('slotIntervalMinutes', Number(e.target.value) as 30 | 60)}
            options={[
              { value: '30', label: '30 minutes' },
              { value: '60', label: '60 minutes' },
            ]}
          />
          <Input label="Gap after each booking (min)" type="number" min={0} max={240} value={s.bufferMinutes} onChange={(e) => set('bufferMinutes', num(e.target.value))} />
          <Input label="Book up to (days ahead)" type="number" min={1} max={180} value={s.bookingWindowDays} onChange={(e) => set('bookingWindowDays', num(e.target.value))} />
          <Input label="Minimum notice (hours)" type="number" min={0} max={168} value={s.minLeadHours} onChange={(e) => set('minLeadHours', num(e.target.value))} />
        </div>
        <div className="mt-4">
          <Label>Days off</Label>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-1.5 text-sm"
            />
            <Button
              variant="outline"
              disabled={!newDate}
              onClick={() => {
                if (!s.blockedDates.includes(newDate)) set('blockedDates', [...s.blockedDates, newDate].sort());
                setNewDate('');
              }}
            >
              Add day off
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {s.blockedDates.map((d) => (
              <button
                key={d}
                onClick={() => set('blockedDates', s.blockedDates.filter((x) => x !== d))}
                className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs hover:border-[var(--red)]"
                title="Remove"
              >
                {formatDate(d)} ✕
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold">Appointment (consultation)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle checked={s.consultation.enabled} onChange={(enabled) => set('consultation', { ...s.consultation, enabled })} label="Accept appointments" />
          <Input label="Title" value={s.consultation.title} onChange={(e) => set('consultation', { ...s.consultation, title: e.target.value })} />
          <Input label="Fee (₹)" type="number" min={0} value={s.consultation.fee} onChange={(e) => set('consultation', { ...s.consultation, fee: num(e.target.value) })} />
          <Input
            label="Duration (minutes)"
            type="number"
            min={15}
            max={240}
            value={s.consultation.durationMinutes}
            onChange={(e) => set('consultation', { ...s.consultation, durationMinutes: num(e.target.value) })}
          />
          <div className="sm:col-span-2">
            <Label>Modes</Label>
            <div className="flex flex-wrap gap-4">
              {(['AUDIO_CALL', 'VIDEO_CALL', 'IN_PERSON'] as ConsultationMode[]).map((m) => (
                <Toggle
                  key={m}
                  checked={s.consultation.modes.includes(m)}
                  label={MODE_LABELS[m]}
                  onChange={(on) =>
                    set('consultation', {
                      ...s.consultation,
                      modes: on ? [...s.consultation.modes, m] : s.consultation.modes.filter((x) => x !== m),
                    })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold">Kundli fees (₹)</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {(Object.keys(KUNDLI_TYPES) as KundliType[]).map((t) => (
            <Input
              key={t}
              label={KUNDLI_TYPES[t]}
              type="number"
              min={0}
              value={s.kundliFees[t]}
              onChange={(e) => set('kundliFees', { ...s.kundliFees, [t]: num(e.target.value) })}
            />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold">Payments & store</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Delivery charge (₹)" type="number" min={0} value={s.deliveryCharge} onChange={(e) => set('deliveryCharge', num(e.target.value))} />
          <Input label="Free delivery above (₹)" type="number" min={0} value={s.freeDeliveryAbove} onChange={(e) => set('freeDeliveryAbove', num(e.target.value))} />
          <Input label="Devotee can cancel paid booking until (hours before)" type="number" min={0} value={s.userCancelHours} onChange={(e) => set('userCancelHours', num(e.target.value))} />
          <Toggle checked={s.allowPayLater} onChange={(v) => set('allowPayLater', v)} label="Allow pay later for bookings & kundli" />
          <Toggle checked={s.allowCod} onChange={(v) => set('allowCod', v)} label="Allow cash on delivery" />
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border-color)] bg-[var(--bg-surface)] p-3 md:left-64">
        <div className="mx-auto flex max-w-7xl justify-end">
          <Button loading={saving} onClick={save}>
            Save settings
          </Button>
        </div>
      </div>
      {toast.node}
    </div>
  );
}
