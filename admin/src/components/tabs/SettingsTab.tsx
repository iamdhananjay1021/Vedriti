'use client';

import React, { useCallback, useState } from 'react';
import { useLoader } from '../../lib/useLoader';
import { adminApi, errorMessage } from '../../lib/api';
import type { ConsultationMode, KundliType, Settings } from '../../lib/types';
import { DAY_NAMES, formatDate, KUNDLI_TYPES, MODE_LABELS, rupees } from '../../lib/format';
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Flame,
  HelpCircle,
  KeyRound,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  Video,
  X,
} from 'lucide-react';
import { Button, Card, ErrorBox, Input, Label, Select, Spinner, Textarea, Toggle, useToast } from '../ui';

export function SettingsTab() {
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState('');
  const toast = useToast();
  const fetcher = useCallback(() => adminApi.settings(), []);
  const { data: s, error, reload: load, setData: setS } = useLoader<Settings>(fetcher);
  const statusFetcher = useCallback(() => adminApi.authStatus(), []);
  const { data: authStatus } = useLoader(statusFetcher);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!s) return <Spinner />;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    const bad = s.schedule.find((d) => d.enabled && d.start >= d.end);
    if (bad) return toast.error(`${DAY_NAMES[bad.day]}: End time must be after start time`);
    if (s.consultation.enabled && !s.consultation.modes.length) return toast.error('Select at least one consultation mode');
    setSaving(true);
    try {
      const {
        panditName,
        panditTitle,
        panditBio,
        experienceYears,
        templeAddress,
        supportPhone,
        whatsappNumber,
        supportEmail,
        schedule,
        slotIntervalMinutes,
        bufferMinutes,
        bookingWindowDays,
        minLeadHours,
        blockedDates,
        consultation,
        kundliFees,
        deliveryCharge,
        freeDeliveryAbove,
        allowPayLater,
        allowCod,
        userCancelHours,
        auth,
      } = s;

      const updated = await adminApi.saveSettings({
        panditName,
        panditTitle,
        panditBio,
        experienceYears,
        templeAddress,
        supportPhone,
        whatsappNumber,
        supportEmail,
        schedule,
        slotIntervalMinutes,
        bufferMinutes,
        bookingWindowDays,
        minLeadHours,
        blockedDates,
        consultation,
        kundliFees,
        deliveryCharge,
        freeDeliveryAbove,
        allowPayLater,
        allowCod,
        userCancelHours,
        ...(auth ? { auth } : {}),
      });

      setS(updated);
      toast.ok('Settings updated successfully');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="space-y-7 pb-28">
      {/* Page Header with Save Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              Temple & Pandit Ji Settings
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Configure Pandit Ji profile, consultation modes, darshan working hours, kundli fees, and store policies.
          </p>
        </div>

        <Button
          loading={saving}
          onClick={save}
          className="text-xs font-bold py-2.5 px-5 shadow-sm self-start sm:self-auto"
        >
          <Save className="h-4 w-4 mr-1.5" /> Save All Settings
        </Button>
      </div>

      {/* CARD 1: PANDIT JI PROFILE */}
      <Card className="space-y-5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--saffron-light)] text-[var(--saffron)] shadow-xs">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">
              Pandit Ji Profile & Sacred Bio
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Displayed on mobile app home screen, bookings confirmation, and consultation screens.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Acharya / Pandit Ji Full Name *"
            value={s.panditName}
            onChange={(e) => set('panditName', e.target.value)}
            placeholder="e.g. Rajneesh Ji"
          />
          <Input
            label="Spiritual Title / Designation *"
            value={s.panditTitle}
            onChange={(e) => set('panditTitle', e.target.value)}
            placeholder="e.g. Vedic Acharya • Jyotish Martand"
          />
          <Input
            label="Experience in Vedic Rituals (Years)"
            type="number"
            min={0}
            value={s.experienceYears}
            onChange={(e) => set('experienceYears', num(e.target.value))}
          />
          <Input
            label="Temple / Ashram / Office Address"
            value={s.templeAddress}
            onChange={(e) => set('templeAddress', e.target.value)}
            placeholder="e.g. Tadiya Hanuman Mandir, Lucknow, Uttar Pradesh"
          />
          <Textarea
            className="sm:col-span-2"
            label="About Pandit Ji (Bio displayed to Devotees)"
            hint="(150-300 characters recommended)"
            value={s.panditBio}
            onChange={(e) => set('panditBio', e.target.value)}
          />
        </div>
      </Card>

      {/* CARD 2: CONTACT SHOWN IN APP */}
      <Card className="space-y-5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-xs">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">
              Official Devotee Support Contacts
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Direct hotline numbers and email displayed in the mobile app help drawer.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Support Calling Hotline"
            value={s.supportPhone}
            onChange={(e) => set('supportPhone', e.target.value)}
            placeholder="+91 98XXXXXXXX"
          />
          <Input
            label="Official WhatsApp Support"
            value={s.whatsappNumber}
            onChange={(e) => set('whatsappNumber', e.target.value)}
            placeholder="+91 98XXXXXXXX"
          />
          <Input
            label="Support Email Address"
            type="email"
            value={s.supportEmail}
            onChange={(e) => set('supportEmail', e.target.value)}
            placeholder="officialvedrit@gmail.com"
          />
        </div>
      </Card>

      {/* CARD 3: WORKING HOURS & DARSHAN TIMINGS */}
      <Card className="space-y-5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">
              Daily Operational Hours & Slot Generation
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Devotees can book ritual and consultation slots only within these operational windows.
            </p>
          </div>
        </div>

        {/* Weekly Day Schedule Rows */}
        <div className="space-y-2.5">
          {s.schedule.map((d, i) => (
            <div
              key={d.day}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition ${
                d.enabled
                  ? 'border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xs'
                  : 'border-[var(--border-color)]/60 bg-[var(--bg-primary)]/40 opacity-70'
              }`}
            >
              <div className="w-36">
                <Toggle
                  checked={d.enabled}
                  label={DAY_NAMES[d.day]}
                  onChange={(enabled) =>
                    set(
                      'schedule',
                      s.schedule.map((x, j) => (j === i ? { ...x, enabled } : x))
                    )
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-secondary)]">From:</span>
                <input
                  type="time"
                  disabled={!d.enabled}
                  value={d.start}
                  onChange={(e) =>
                    set(
                      'schedule',
                      s.schedule.map((x, j) => (j === i ? { ...x, start: e.target.value } : x))
                    )
                  }
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] shadow-2xs disabled:opacity-40 outline-none focus:border-[var(--saffron)]"
                />

                <span className="text-xs font-bold text-[var(--text-secondary)]">To:</span>
                <input
                  type="time"
                  disabled={!d.enabled}
                  value={d.end}
                  onChange={(e) =>
                    set(
                      'schedule',
                      s.schedule.map((x, j) => (j === i ? { ...x, end: e.target.value } : x))
                    )
                  }
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] shadow-2xs disabled:opacity-40 outline-none focus:border-[var(--saffron)]"
                />
              </div>

              <div className="w-28 text-right">
                {d.enabled ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-green-700 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--text-muted)]">
                    Day Off
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Operational Interval Controls */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-[var(--border-color)] pt-5">
          <Select
            label="Slot Start Interval"
            value={String(s.slotIntervalMinutes)}
            onChange={(e) => set('slotIntervalMinutes', Number(e.target.value) as 30 | 60)}
            options={[
              { value: '30', label: 'Every 30 Minutes' },
              { value: '60', label: 'Every 60 Minutes (1 Hour)' },
            ]}
          />
          <Input
            label="Buffer After Ritual (Minutes)"
            type="number"
            min={0}
            max={240}
            value={s.bufferMinutes}
            onChange={(e) => set('bufferMinutes', num(e.target.value))}
          />
          <Input
            label="Booking Window (Days Ahead)"
            type="number"
            min={1}
            max={180}
            value={s.bookingWindowDays}
            onChange={(e) => set('bookingWindowDays', num(e.target.value))}
          />
          <Input
            label="Minimum Advance Notice (Hours)"
            type="number"
            min={0}
            max={168}
            value={s.minLeadHours}
            onChange={(e) => set('minLeadHours', num(e.target.value))}
          />
        </div>

        {/* Blocked Dates / Festival Holidays */}
        <div className="mt-5 border-t border-[var(--border-color)] pt-5 space-y-3">
          <Label hint="(Pandit Ji will not be available for rituals on these dates)">
            Temple Festivals & Pandit Ji Scheduled Days Off
          </Label>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--saffron)] shadow-xs"
            />
            <Button
              variant="outline"
              disabled={!newDate}
              onClick={() => {
                if (!s.blockedDates.includes(newDate)) set('blockedDates', [...s.blockedDates, newDate].sort());
                setNewDate('');
              }}
              className="font-bold text-xs"
            >
              + Add Day Off
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {s.blockedDates.map((d) => (
              <button
                key={d}
                onClick={() => set('blockedDates', s.blockedDates.filter((x) => x !== d))}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-500/20 transition"
                title="Remove Day Off"
              >
                <span>{formatDate(d)}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* CARD 4: APPOINTMENT / CONSULTATION */}
      <Card className="space-y-5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-xs">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">
              Personal Astrology & Jyotish Consultations
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Direct phone or video call consultation sessions booked by devotees.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <Toggle
              checked={s.consultation.enabled}
              onChange={(enabled) => set('consultation', { ...s.consultation, enabled })}
              label="Accept Personal Consultation Appointments"
            />
          </div>

          <Input
            label="Service Title"
            value={s.consultation.title}
            onChange={(e) => set('consultation', { ...s.consultation, title: e.target.value })}
            placeholder="Pandit Ji Consultation"
          />

          <Input
            label="Dakshina / Fee (₹) *"
            type="number"
            min={0}
            value={s.consultation.fee}
            onChange={(e) => set('consultation', { ...s.consultation, fee: num(e.target.value) })}
          />

          <Input
            label="Session Duration (Minutes)"
            type="number"
            min={15}
            max={240}
            value={s.consultation.durationMinutes}
            onChange={(e) => set('consultation', { ...s.consultation, durationMinutes: num(e.target.value) })}
          />

          <div className="sm:col-span-3">
            <Label>Supported Consultation Modes</Label>
            <div className="flex flex-wrap gap-4 mt-2">
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

      {/* CARD 5: KUNDLI FEES */}
      <Card className="space-y-5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">
              Vedic Kundli & Jyotish Faladesh Fees (₹)
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Dakshina charged for detailed horoscope charts, matchmaking, and planetary remedy reports.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(KUNDLI_TYPES) as KundliType[]).map((t) => (
            <div
              key={t}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 shadow-xs"
            >
              <Input
                label={KUNDLI_TYPES[t]}
                type="number"
                min={0}
                value={s.kundliFees[t]}
                onChange={(e) => set('kundliFees', { ...s.kundliFees, [t]: num(e.target.value) })}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* CARD: LOGIN & OTP */}
      <Card className="space-y-5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400 shadow-xs">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black">Login &amp; OTP</h2>
            <p className="text-xs text-[var(--text-secondary)]">Choose how devotees can sign in. Changes apply to the app immediately.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border-color)] p-4">
            <p className="text-xs font-bold text-[var(--text-secondary)]">Email OTP provider (Resend)</p>
            <p className="mt-1 text-sm font-black">{authStatus ? (authStatus.email.enabled ? 'Connected' : 'Not configured') : '...'}</p>
            {authStatus?.email.from ? <p className="mt-1 text-[11px] text-[var(--text-muted)]">Sends from {authStatus.email.from}</p> : null}
          </div>
          <div className="rounded-xl border border-[var(--border-color)] p-4">
            <p className="text-xs font-bold text-[var(--text-secondary)]">Mobile OTP provider</p>
            <p className="mt-1 text-sm font-black">
              {authStatus ? (authStatus.sms.enabled ? `Connected (${authStatus.sms.provider})` : 'Not configured') : '...'}
            </p>
            {authStatus?.sms.balance ? (
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                {authStatus.sms.balance.error ? authStatus.sms.balance.error : `SMS credits left: ${authStatus.sms.balance.credits}`}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <Toggle
            checked={s.auth?.emailLogin !== false}
            onChange={(v) => set('auth', { emailLogin: v, smsLogin: s.auth?.smsLogin !== false, passwordLogin: s.auth?.passwordLogin !== false })}
            label="Allow login with Email OTP"
          />
          <Toggle
            checked={s.auth?.smsLogin !== false}
            onChange={(v) => set('auth', { emailLogin: s.auth?.emailLogin !== false, smsLogin: v, passwordLogin: s.auth?.passwordLogin !== false })}
            label="Allow login with Mobile OTP"
          />
          <Toggle
            checked={s.auth?.passwordLogin !== false}
            onChange={(v) => set('auth', { emailLogin: s.auth?.emailLogin !== false, smsLogin: s.auth?.smsLogin !== false, passwordLogin: v })}
            label="Allow login with password"
          />
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">Turn off a method only if you are sure users have another way to sign in. Remember to press Save changes below.</p>
      </Card>

      {/* CARD 6: PAYMENTS & STORE RULES */}
      <Card className="space-y-5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-700 dark:text-green-400 shadow-xs">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">
              Spiritual Store, Kit Shipping & App Policies
            </h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Delivery thresholds, courier fee, devotee cancellation cutoff, and payment policies.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Standard Courier / Delivery Charge (₹)"
            type="number"
            min={0}
            value={s.deliveryCharge}
            onChange={(e) => set('deliveryCharge', num(e.target.value))}
          />
          <Input
            label="Free Delivery on Store Orders Above (₹)"
            type="number"
            min={0}
            value={s.freeDeliveryAbove}
            onChange={(e) => set('freeDeliveryAbove', num(e.target.value))}
          />
          <Input
            label="Devotee Can Cancel Booking Until (Hours Before)"
            type="number"
            min={0}
            value={s.userCancelHours}
            onChange={(e) => set('userCancelHours', num(e.target.value))}
          />

          <div className="sm:col-span-3 flex flex-wrap gap-6 pt-2">
            <Toggle
              checked={s.allowPayLater}
              onChange={(v) => set('allowPayLater', v)}
              label="Allow 'Pay After Puja' for Bookings & Consultations"
            />
            <Toggle
              checked={s.allowCod}
              onChange={(v) => set('allowCod', v)}
              label="Allow Cash on Delivery (COD) for Spiritual Kits"
            />
          </div>
        </div>
      </Card>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md p-3.5 md:left-64 shadow-lg">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Changes will reflect immediately across Mobile App and Web Portal.</span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              variant="outline"
              onClick={load}
              disabled={saving}
              className="text-xs font-bold py-2 px-4"
            >
              Reset
            </Button>
            <Button
              loading={saving}
              onClick={save}
              className="text-xs font-bold py-2.5 px-6 shadow-sm"
            >
              <Save className="h-4 w-4 mr-1.5" /> Save All Settings
            </Button>
          </div>
        </div>
      </div>

      {toast.node}
    </div>
  );
}
