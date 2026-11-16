'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Clock, Mail, MessageSquare, Pencil, Plus, RefreshCw, RotateCcw, Send, Smartphone, Trash2, Users, XCircle } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type {
  AudiencePreview,
  BroadcastAudience,
  BroadcastChannel,
  BroadcastInput,
  BroadcastItem,
  BroadcastStatus,
  BroadcastTemplate,
  BroadcastType,
  DeliveryCounts,
} from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDateTime } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Pagination, Select, Spinner, Textarea, useToast } from '../ui';

const TYPES: { value: BroadcastType; label: string; hint: string }[] = [
  { value: 'ANNOUNCEMENT', label: 'Announcement', hint: 'News and updates. Respects unsubscribe.' },
  { value: 'OFFER', label: 'Offer / Promotion', hint: 'Discounts and kits. Respects unsubscribe.' },
  { value: 'FESTIVAL', label: 'Festival greeting', hint: 'Wishes and special pujas. Respects unsubscribe.' },
  { value: 'REMINDER', label: 'Reminder', hint: 'Booking and puja reminders. Always delivered.' },
  { value: 'NOTICE', label: 'Important notice', hint: 'Schedule changes and alerts. Always delivered.' },
];

const STATUS_TONE: Record<BroadcastStatus, 'amber' | 'green' | 'blue' | 'gray' | 'red'> = {
  DRAFT: 'gray',
  SCHEDULED: 'blue',
  SENDING: 'amber',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const CHANNEL_LABEL: Record<BroadcastChannel, string> = { EMAIL: 'Email', SMS: 'SMS', INAPP: 'In-app' };

const TRI = [
  { value: 'any', label: 'Any' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const emptyAudience = (): BroadcastAudience => ({
  mode: 'ALL',
  cities: [],
  states: [],
  gender: 'any',
  profileCompleted: 'any',
  hasBooking: 'any',
  hasOrder: 'any',
  joinedWithinDays: 0,
  inactiveForDays: 0,
  emails: [],
  phones: [],
});

interface FormState {
  name: string;
  type: BroadcastType;
  channels: BroadcastChannel[];
  subject: string;
  body: string;
  smsText: string;
  ctaLabel: string;
  ctaUrl: string;
  audience: BroadcastAudience;
  scheduleMode: 'draft' | 'now' | 'later';
  scheduleAt: string;
}

const emptyForm = (): FormState => ({
  name: '',
  type: 'ANNOUNCEMENT',
  channels: ['EMAIL', 'INAPP'],
  subject: '',
  body: '',
  smsText: '',
  ctaLabel: '',
  ctaUrl: '',
  audience: emptyAudience(),
  scheduleMode: 'now',
  scheduleAt: '',
});

const splitList = (value: string) => value.split(/[\s,;]+/).map((v) => v.trim()).filter(Boolean);
const splitCsv = (value: string) => value.split(',').map((v) => v.trim()).filter(Boolean);

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const sum = (counts?: DeliveryCounts) => (counts ? counts.PENDING + counts.SENT + counts.FAILED + counts.SKIPPED : 0);

const toInput = (form: FormState): BroadcastInput => ({
  name: form.name.trim(),
  type: form.type,
  channels: form.channels,
  subject: form.subject.trim(),
  body: form.body.trim(),
  smsText: form.smsText.trim(),
  ctaLabel: form.ctaLabel.trim(),
  ctaUrl: form.ctaUrl.trim(),
  audience: form.audience,
  schedule: { mode: form.scheduleMode, at: form.scheduleMode === 'later' && form.scheduleAt ? new Date(form.scheduleAt).toISOString() : undefined },
});

function ChannelStats({ channel, counts }: { channel: BroadcastChannel; counts?: DeliveryCounts }) {
  if (!counts) return null;
  const total = sum(counts);
  if (!total) return null;
  const done = counts.SENT + counts.FAILED + counts.SKIPPED;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)]">
        <span>{CHANNEL_LABEL[channel]}</span>
        <span>
          {counts.SENT}/{total}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg-hover)]">
        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-0.5 flex gap-2 text-[10px] text-[var(--text-muted)]">
        {counts.PENDING > 0 ? <span>{counts.PENDING} pending</span> : null}
        {counts.FAILED > 0 ? <span className="text-red-600">{counts.FAILED} failed</span> : null}
        {counts.SKIPPED > 0 ? <span>{counts.SKIPPED} skipped</span> : null}
      </div>
    </div>
  );
}

export function BroadcastsTab() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<BroadcastItem | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const providersFetcher = useCallback(() => adminApi.broadcastStatus(), []);
  const { data: providers } = useLoader(providersFetcher);
  const listFetcher = useCallback(() => adminApi.broadcasts({ status: statusFilter, page }), [statusFilter, page]);
  const { data: list, error, reload } = useLoader(listFetcher);

  useEffect(() => {
    if (!list?.items.some((b) => b.status === 'SENDING')) return;
    const t = setInterval(reload, 4000);
    return () => clearInterval(t);
  }, [list, reload]);

  const totals = useMemo(() => {
    const acc = { email: 0, sms: 0, inapp: 0 };
    for (const b of list?.items || []) {
      acc.email += b.stats.EMAIL?.SENT || 0;
      acc.sms += b.stats.SMS?.PENDING || 0;
      acc.inapp += b.stats.INAPP?.SENT || 0;
    }
    return acc;
  }, [list]);

  const openCreate = () => {
    setEditing(null);
    setComposerOpen(true);
  };

  const openEdit = (b: BroadcastItem) => {
    setEditing(b);
    setComposerOpen(true);
  };

  const act = async (b: BroadcastItem, fn: () => Promise<unknown>, done: string) => {
    setBusyId(b.id);
    try {
      await fn();
      toast.ok(done);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const remove = (b: BroadcastItem) => {
    if (!window.confirm(`Delete "${b.name}" and its delivery log?`)) return;
    act(b, () => adminApi.deleteBroadcast(b.id), 'Broadcast deleted');
  };

  const send = (b: BroadcastItem) => {
    if (!window.confirm(`Send "${b.name}" now?`)) return;
    act(b, () => adminApi.sendBroadcast(b.id), 'Sending started');
  };

  const cancel = (b: BroadcastItem) => {
    if (!window.confirm(`Stop "${b.name}"? Messages not yet sent will be skipped.`)) return;
    act(b, () => adminApi.cancelBroadcast(b.id), 'Broadcast cancelled');
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black">Email &amp; SMS Broadcast</h1>
        <ErrorBox message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Email &amp; SMS Broadcast</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Send announcements, offers, festival wishes, reminders and notices to your devotees by email, in-app notification and SMS. Super admin only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={reload}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New broadcast
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
            <Mail className="h-4 w-4 text-[var(--saffron)]" /> Email provider
          </div>
          <div className="mt-2">{providers ? <Badge tone={providers.email.enabled ? 'green' : 'red'}>{providers.email.enabled ? 'Connected' : 'Not configured'}</Badge> : <Spinner />}</div>
          <p className="mt-2 text-[11px] text-[var(--text-muted)]">
            {providers?.email.dailyLimit ? `Daily limit: ${providers.email.dailyLimit} emails` : 'No daily cap set (BROADCAST_EMAIL_DAILY_LIMIT)'}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
            <Smartphone className="h-4 w-4 text-[var(--saffron)]" /> SMS provider
          </div>
          <div className="mt-2">{providers ? <Badge tone={providers.sms.enabled ? 'green' : 'amber'}>{providers.sms.enabled ? 'Connected' : 'Pending'}</Badge> : <Spinner />}</div>
          <p className="mt-2 text-[11px] text-[var(--text-muted)]">{providers?.sms.enabled ? 'SMS goes out automatically.' : 'SMS messages queue as pending until the provider is connected.'}</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-[var(--text-secondary)]">Sent on this page</div>
          <div className="mt-2 text-2xl font-black">{totals.email}</div>
          <p className="text-[11px] text-[var(--text-muted)]">emails • {totals.inapp} in-app</p>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-[var(--text-secondary)]">SMS waiting</div>
          <div className="mt-2 text-2xl font-black">{totals.sms}</div>
          <p className="text-[11px] text-[var(--text-muted)]">pending delivery</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          options={[{ value: 'ALL', label: 'All statuses' }, ...(['DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'CANCELLED'] as BroadcastStatus[]).map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))]}
          className="w-48"
        />
      </div>

      {!list ? (
        <Spinner />
      ) : list.items.length === 0 ? (
        <Empty title="No broadcasts yet" subtitle="Create your first broadcast to reach your devotees." />
      ) : (
        <div className="space-y-3">
          {list.items.map((b) => {
            const busy = busyId === b.id;
            return (
              <Card key={b.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setDetailId(b.id)} className="truncate text-left text-base font-black hover:text-[var(--saffron)]">
                        {b.name}
                      </button>
                      <Badge tone={STATUS_TONE[b.status]}>{b.status.charAt(0) + b.status.slice(1).toLowerCase()}</Badge>
                      <Badge>{TYPES.find((t) => t.value === b.type)?.label}</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{b.subject || b.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {b.audience.mode === 'ALL' ? 'All users' : b.audience.mode === 'SEGMENT' ? 'Segment' : 'Custom list'}
                        {b.recipientCount ? ` • ${b.recipientCount}` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {b.channels.map((c) => CHANNEL_LABEL[c]).join(' + ')}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {b.status === 'SCHEDULED' ? `Scheduled ${formatDateTime(b.scheduledAt)}` : b.completedAt ? `Done ${formatDateTime(b.completedAt)}` : formatDateTime(b.createdAt)}
                      </span>
                    </div>
                    {b.pausedReason ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5" /> {b.pausedReason}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-start gap-4">
                    <ChannelStats channel="EMAIL" counts={b.stats.EMAIL} />
                    <ChannelStats channel="SMS" counts={b.stats.SMS} />
                    <ChannelStats channel="INAPP" counts={b.stats.INAPP} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border-color)] pt-3">
                  <Button variant="outline" onClick={() => setDetailId(b.id)}>
                    Details
                  </Button>
                  {['DRAFT', 'SCHEDULED'].includes(b.status) ? (
                    <>
                      <Button variant="outline" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button loading={busy} onClick={() => send(b)}>
                        <Send className="h-3.5 w-3.5" /> Send now
                      </Button>
                    </>
                  ) : null}
                  {['SCHEDULED', 'SENDING'].includes(b.status) ? (
                    <Button variant="outline" loading={busy} onClick={() => cancel(b)}>
                      <XCircle className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  ) : null}
                  {b.status !== 'SENDING' ? (
                    <Button variant="ghost" loading={busy} onClick={() => remove(b)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
          <Pagination page={page} total={list.total} limit={20} onPage={setPage} />
        </div>
      )}

      {composerOpen ? (
        <Composer
          key={editing?.id || 'new'}
          editing={editing}
          smsEnabled={Boolean(providers?.sms.enabled)}
          emailEnabled={Boolean(providers?.email.enabled)}
          variables={providers?.variables || ['name', 'firstName', 'email', 'phone', 'city']}
          onClose={() => setComposerOpen(false)}
          onSaved={(message) => {
            setComposerOpen(false);
            toast.ok(message);
            reload();
          }}
          onError={toast.error}
          onOk={toast.ok}
        />
      ) : null}

      {detailId ? (
        <Detail
          id={detailId}
          smsEnabled={Boolean(providers?.sms.enabled)}
          onClose={() => setDetailId(null)}
          onChanged={reload}
          onError={toast.error}
          onOk={toast.ok}
        />
      ) : null}

      {toast.node}
    </div>
  );
}

function Composer({
  editing,
  smsEnabled,
  emailEnabled,
  variables,
  onClose,
  onSaved,
  onError,
  onOk,
}: {
  editing: BroadcastItem | null;
  smsEnabled: boolean;
  emailEnabled: boolean;
  variables: string[];
  onClose: () => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
  onOk: (message: string) => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          name: editing.name,
          type: editing.type,
          channels: editing.channels,
          subject: editing.subject,
          body: editing.body,
          smsText: editing.smsText,
          ctaLabel: editing.ctaLabel,
          ctaUrl: editing.ctaUrl,
          audience: { ...emptyAudience(), ...editing.audience },
          scheduleMode: editing.status === 'SCHEDULED' ? 'later' : 'draft',
          scheduleAt: toLocalInput(editing.scheduledAt),
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [audience, setAudience] = useState<AudiencePreview | null>(null);
  const [audienceBusy, setAudienceBusy] = useState(false);
  const [preview, setPreview] = useState<{ email: { subject: string; html: string }; sms: string; inApp: { title: string; body: string } } | null>(null);
  const [previewTab, setPreviewTab] = useState<'email' | 'sms' | 'inapp'>('email');
  const bodyRef = useRef<HTMLDivElement>(null);

  const templatesFetcher = useCallback(() => adminApi.broadcastTemplates(), []);
  const { data: templates, reload: reloadTemplates } = useLoader(templatesFetcher);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setAud = <K extends keyof BroadcastAudience>(key: K, value: BroadcastAudience[K]) => setForm((f) => ({ ...f, audience: { ...f.audience, [key]: value } }));

  const hasEmail = form.channels.includes('EMAIL');
  const hasSms = form.channels.includes('SMS');
  const hasInApp = form.channels.includes('INAPP');

  const toggleChannel = (channel: BroadcastChannel) =>
    setForm((f) => ({ ...f, channels: f.channels.includes(channel) ? f.channels.filter((c) => c !== channel) : [...f.channels, channel] }));

  const insertVariable = (name: string) => {
    const el = bodyRef.current?.querySelector('textarea') ?? null;
    const token = `{{${name}}}`;
    if (!el) return set('body', `${form.body}${token}`);
    const start = el.selectionStart ?? form.body.length;
    const end = el.selectionEnd ?? form.body.length;
    const next = `${form.body.slice(0, start)}${token}${form.body.slice(end)}`;
    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const audienceKey = JSON.stringify([form.audience, form.type]);
  useEffect(() => {
    setAudienceBusy(true);
    const t = setTimeout(() => {
      adminApi
        .audiencePreview(form.audience, form.type)
        .then(setAudience)
        .catch(() => setAudience(null))
        .finally(() => setAudienceBusy(false));
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceKey]);

  const previewKey = JSON.stringify([form.type, form.subject, form.body, form.smsText, form.ctaLabel, form.ctaUrl, form.name]);
  useEffect(() => {
    const t = setTimeout(() => {
      const { schedule: _schedule, ...rest } = toInput(form);
      void _schedule;
      adminApi
        .previewBroadcast({ ...rest, ctaUrl: /^https?:\/\//.test(rest.ctaUrl) ? rest.ctaUrl : '' })
        .then(setPreview)
        .catch(() => undefined);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey]);

  const applyTemplate = (id: string) => {
    const t = templates?.find((x) => x.id === id);
    if (!t) return;
    setForm((f) => ({
      ...f,
      type: t.type,
      subject: t.subject,
      body: t.body,
      smsText: t.smsText,
      ctaLabel: t.ctaLabel,
      ctaUrl: t.ctaUrl,
      name: f.name || t.name,
    }));
  };

  const saveTemplate = async () => {
    const name = window.prompt('Template name');
    if (!name || name.trim().length < 2) return;
    try {
      await adminApi.saveBroadcastTemplate({ name: name.trim(), type: form.type, subject: form.subject, body: form.body, smsText: form.smsText, ctaLabel: form.ctaLabel, ctaUrl: form.ctaUrl });
      onOk('Template saved');
      reloadTemplates();
    } catch (e) {
      onError(errorMessage(e));
    }
  };

  const deleteTemplate = async (t: BroadcastTemplate) => {
    if (!window.confirm(`Delete template "${t.name}"?`)) return;
    try {
      await adminApi.deleteBroadcastTemplate(t.id);
      reloadTemplates();
    } catch (e) {
      onError(errorMessage(e));
    }
  };

  const validate = () => {
    if (form.name.trim().length < 2) return 'Give the broadcast a name';
    if (!form.channels.length) return 'Choose at least one channel';
    if ((hasEmail || hasInApp) && !form.subject.trim()) return 'Add a subject (also used as the in-app title)';
    if (form.body.trim().length < 5) return 'Write the message';
    if (form.ctaUrl.trim() && !/^https?:\/\//.test(form.ctaUrl.trim())) return 'Link must start with https://';
    if (form.ctaUrl.trim() && !form.ctaLabel.trim()) return 'Add a button label for the link';
    if (form.audience.mode === 'CUSTOM' && !form.audience.emails.length && !form.audience.phones.length) return 'Add at least one email or mobile number';
    if (form.scheduleMode === 'later') {
      const at = new Date(form.scheduleAt);
      if (!form.scheduleAt || Number.isNaN(at.getTime()) || at.getTime() < Date.now() + 60000) return 'Pick a schedule time at least a minute from now';
    }
    return null;
  };

  const submit = async () => {
    const problem = validate();
    setErrors(problem);
    if (problem) return;
    if (form.scheduleMode === 'now') {
      const total = audience?.total;
      if (!window.confirm(`Send "${form.name.trim()}" now${total !== undefined ? ` to ${total} people` : ''}?`)) return;
    }
    setSaving(true);
    try {
      const input = toInput(form);
      if (editing) await adminApi.updateBroadcast(editing.id, input);
      else await adminApi.createBroadcast(input);
      onSaved(form.scheduleMode === 'now' ? 'Broadcast is being sent' : form.scheduleMode === 'later' ? 'Broadcast scheduled' : 'Draft saved');
    } catch (e) {
      setErrors(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (form.body.trim().length < 5 || !form.subject.trim()) {
      setErrors('Add a subject and message before sending a test');
      return;
    }
    setTesting(true);
    try {
      const { schedule: _schedule, ...rest } = toInput(form);
      void _schedule;
      const res = await adminApi.testBroadcast(rest);
      onOk(res.message);
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setTesting(false);
    }
  };

  const typeHint = TYPES.find((t) => t.value === form.type)?.hint;
  const smsLength = (form.smsText || form.body).length;

  return (
    <Modal
      open
      extraWide
      onClose={onClose}
      title={editing ? 'Edit broadcast' : 'New broadcast'}
      footer={
        <>
          {errors ? <p className="mr-auto self-center text-xs font-semibold text-red-600">{errors}</p> : null}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {hasEmail ? (
            <Button variant="outline" loading={testing} onClick={sendTest}>
              <Mail className="h-4 w-4" /> Send test to me
            </Button>
          ) : null}
          <Button loading={saving} onClick={submit}>
            {form.scheduleMode === 'now' ? 'Send now' : form.scheduleMode === 'later' ? 'Schedule' : 'Save draft'}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Select
              label="Start from a template"
              value=""
              onChange={(e) => applyTemplate(e.target.value)}
              options={[{ value: '', label: 'Choose a template…' }, ...(templates || []).map((t) => ({ value: t.id, label: `${t.name}${t.isSystem ? '' : ' (mine)'}` }))]}
            />
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={saveTemplate}>
                Save as template
              </Button>
            </div>
          </div>
          {templates?.some((t) => !t.isSystem) ? (
            <div className="flex flex-wrap gap-2">
              {templates
                .filter((t) => !t.isSystem)
                .map((t) => (
                  <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-hover)] px-2.5 py-1 text-xs font-semibold">
                    {t.name}
                    <button onClick={() => deleteTemplate(t)} aria-label={`Delete template ${t.name}`} className="text-[var(--text-muted)] hover:text-red-600">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Broadcast name (internal)" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={120} placeholder="Diwali greetings 2026" />
            <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value as BroadcastType)} options={TYPES.map((t) => ({ value: t.value, label: t.label }))} />
          </div>
          {typeHint ? <p className="-mt-3 text-xs text-[var(--text-muted)]">{typeHint}</p> : null}

          <div>
            <p className="mb-2 text-xs font-bold text-[var(--text-secondary)]">Channels</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  { id: 'EMAIL', icon: Mail, title: 'Email', note: emailEnabled ? 'Via Resend' : 'Provider not configured' },
                  { id: 'INAPP', icon: Bell, title: 'In-app', note: 'Bell icon in the app' },
                  { id: 'SMS', icon: MessageSquare, title: 'SMS', note: smsEnabled ? 'Sent automatically' : 'Pending: queued until provider is connected' },
                ] as { id: BroadcastChannel; icon: React.ElementType; title: string; note: string }[]
              ).map(({ id, icon: Icon, title, note }) => {
                const on = form.channels.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleChannel(id)}
                    className={`rounded-xl border p-3 text-left transition ${on ? 'border-[var(--saffron)] bg-[var(--saffron-light)]' : 'border-[var(--border-color)] hover:bg-[var(--bg-hover)]'}`}
                    aria-pressed={on}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <Icon className="h-4 w-4 text-[var(--saffron)]" /> {title}
                      {on ? <CheckCircle2 className="ml-auto h-4 w-4 text-[var(--saffron)]" /> : null}
                    </span>
                    <span className={`mt-1 block text-[11px] ${id === 'SMS' && !smsEnabled ? 'font-semibold text-amber-700 dark:text-amber-300' : 'text-[var(--text-muted)]'}`}>{note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input label="Subject / title" value={form.subject} onChange={(e) => set('subject', e.target.value)} maxLength={150} placeholder="Happy Diwali from VedRit" />

          <div ref={bodyRef}>
            <Textarea
              label="Message"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              maxLength={5000}
              rows={7}
              placeholder="Write your message. Leave a blank line between paragraphs."
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-[var(--text-muted)]">Insert:</span>
              {variables.map((v) => (
                <button key={v} type="button" onClick={() => insertVariable(v)} className="rounded-full border border-[var(--border-color)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--saffron)] hover:bg-[var(--saffron-light)]">
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          {hasSms ? (
            <div>
              <Input
                label="SMS text (optional, short)"
                value={form.smsText}
                onChange={(e) => set('smsText', e.target.value)}
                maxLength={320}
                placeholder="Leave empty to use the subject and message"
                hint={`${smsLength} characters. SMS is not personalised per person.`}
              />
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Button label (optional)" value={form.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} maxLength={40} placeholder="Book a puja" />
            <Input label="Button link (optional)" value={form.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} maxLength={400} placeholder="https://vedrit.in" />
          </div>

          <div className="rounded-xl border border-[var(--border-color)] p-4">
            <p className="mb-3 text-sm font-black">Who should get it?</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  { id: 'ALL', title: 'All users', note: 'Everyone with an account' },
                  { id: 'SEGMENT', title: 'Segment', note: 'Filter by city, activity…' },
                  { id: 'CUSTOM', title: 'Custom list', note: 'Paste emails or numbers' },
                ] as { id: BroadcastAudience['mode']; title: string; note: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAud('mode', m.id)}
                  aria-pressed={form.audience.mode === m.id}
                  className={`rounded-xl border p-3 text-left transition ${form.audience.mode === m.id ? 'border-[var(--saffron)] bg-[var(--saffron-light)]' : 'border-[var(--border-color)] hover:bg-[var(--bg-hover)]'}`}
                >
                  <span className="block text-sm font-bold">{m.title}</span>
                  <span className="block text-[11px] text-[var(--text-muted)]">{m.note}</span>
                </button>
              ))}
            </div>

            {form.audience.mode === 'SEGMENT' ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input label="Cities" hint="Comma separated" value={form.audience.cities.join(', ')} onChange={(e) => setAud('cities', splitCsv(e.target.value))} placeholder="Varanasi, Lucknow" />
                <Input label="States" hint="Comma separated" value={form.audience.states.join(', ')} onChange={(e) => setAud('states', splitCsv(e.target.value))} placeholder="Uttar Pradesh" />
                <Select label="Gender" value={form.audience.gender} onChange={(e) => setAud('gender', e.target.value as BroadcastAudience['gender'])} options={[{ value: 'any', label: 'Any' }, { value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} />
                <Select label="Profile completed" value={form.audience.profileCompleted} onChange={(e) => setAud('profileCompleted', e.target.value as BroadcastAudience['profileCompleted'])} options={TRI} />
                <Select label="Has booked a puja" value={form.audience.hasBooking} onChange={(e) => setAud('hasBooking', e.target.value as BroadcastAudience['hasBooking'])} options={TRI} />
                <Select label="Has ordered a kit" value={form.audience.hasOrder} onChange={(e) => setAud('hasOrder', e.target.value as BroadcastAudience['hasOrder'])} options={TRI} />
                <Input label="Joined in last N days" type="number" min={0} value={form.audience.joinedWithinDays || ''} onChange={(e) => setAud('joinedWithinDays', Number(e.target.value) || 0)} placeholder="0 = any time" />
                <Input label="Not opened the app for N days" type="number" min={0} value={form.audience.inactiveForDays || ''} onChange={(e) => setAud('inactiveForDays', Number(e.target.value) || 0)} placeholder="0 = ignore" />
              </div>
            ) : null}

            {form.audience.mode === 'CUSTOM' ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Textarea label="Emails" hint="One per line or comma separated" value={form.audience.emails.join('\n')} onChange={(e) => setAud('emails', splitList(e.target.value))} rows={5} />
                <Textarea label="Mobile numbers" hint="10-digit Indian numbers" value={form.audience.phones.join('\n')} onChange={(e) => setAud('phones', splitList(e.target.value))} rows={5} />
              </div>
            ) : null}

            <div className="mt-4 rounded-lg bg-[var(--bg-hover)] p-3 text-xs">
              {audienceBusy && !audience ? (
                <Spinner />
              ) : audience ? (
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 font-bold">
                    <span>{audience.total} people</span>
                    {hasEmail ? <span>{audience.emailReachable} reachable by email</span> : null}
                    {hasInApp ? <span>{audience.inAppReachable} in-app</span> : null}
                    {hasSms ? <span>{audience.smsReachable} by SMS</span> : null}
                    {audience.optedOut > 0 ? <span className="text-[var(--text-muted)]">{audience.optedOut} unsubscribed (excluded)</span> : null}
                  </div>
                  {audience.sample.length ? (
                    <p className="text-[var(--text-muted)]">e.g. {audience.sample.map((s) => s.name || s.email || s.phone).join(', ')}</p>
                  ) : (
                    <p className="text-[var(--text-muted)]">No one matches this audience yet.</p>
                  )}
                </div>
              ) : (
                <p className="text-[var(--text-muted)]">Could not load the audience preview.</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="When to send"
              value={form.scheduleMode}
              onChange={(e) => set('scheduleMode', e.target.value as FormState['scheduleMode'])}
              options={[
                { value: 'now', label: 'Send now' },
                { value: 'later', label: 'Schedule for later' },
                { value: 'draft', label: 'Save as draft' },
              ]}
            />
            {form.scheduleMode === 'later' ? <Input label="Send at" type="datetime-local" value={form.scheduleAt} onChange={(e) => set('scheduleAt', e.target.value)} /> : null}
          </div>
        </div>

        <div className="space-y-3 lg:sticky lg:top-0 lg:self-start">
          <div className="flex gap-1 rounded-xl bg-[var(--bg-hover)] p-1">
            {(
              [
                { id: 'email', label: 'Email' },
                { id: 'sms', label: 'SMS' },
                { id: 'inapp', label: 'In-app' },
              ] as const
            ).map((t) => (
              <button key={t.id} onClick={() => setPreviewTab(t.id)} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold ${previewTab === t.id ? 'bg-[var(--bg-surface)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {!preview ? (
            <Spinner />
          ) : previewTab === 'email' ? (
            <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
              <p className="border-b border-[var(--border-color)] bg-[var(--bg-hover)] px-3 py-2 text-xs font-bold">{preview.email.subject || '(no subject)'}</p>
              <iframe title="Email preview" sandbox="" srcDoc={preview.email.html} className="h-[520px] w-full bg-white" />
            </div>
          ) : previewTab === 'sms' ? (
            <div className="rounded-xl border border-[var(--border-color)] p-4">
              <div className="max-w-[260px] rounded-2xl rounded-bl-sm bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm">{preview.sms || '(empty)'}</div>
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">{preview.sms.length} characters</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border-color)] p-4">
              <div className="flex items-start gap-3 rounded-xl bg-[var(--saffron-light)] p-3">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[var(--saffron)]" />
                <div>
                  <p className="text-sm font-black">{preview.inApp.title || '(title)'}</p>
                  <p className="mt-1 whitespace-pre-line text-xs text-[var(--text-secondary)]">{preview.inApp.body}</p>
                </div>
              </div>
            </div>
          )}
          <p className="text-[11px] text-[var(--text-muted)]">Preview uses a sample devotee, so {'{{name}}'} shows as a sample name.</p>
        </div>
      </div>
    </Modal>
  );
}

function Detail({
  id,
  smsEnabled,
  onClose,
  onChanged,
  onError,
  onOk,
}: {
  id: string;
  smsEnabled: boolean;
  onClose: () => void;
  onChanged: () => void;
  onError: (message: string) => void;
  onOk: (message: string) => void;
}) {
  const fetcher = useCallback(() => adminApi.broadcast(id), [id]);
  const { data, error, reload } = useLoader(fetcher);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (data?.status !== 'SENDING') return;
    const t = setInterval(reload, 3000);
    return () => clearInterval(t);
  }, [data?.status, reload]);

  const run = async (key: string, fn: () => Promise<string>) => {
    setBusy(key);
    try {
      onOk(await fn());
      reload();
      onChanged();
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const failedTotal = (Object.values(data?.stats || {}) as DeliveryCounts[]).reduce((a, c) => a + (c?.FAILED || 0), 0);
  const smsPending = data?.stats.SMS?.PENDING || 0;

  return (
    <Modal open onClose={onClose} wide title={data ? data.name : 'Broadcast'}>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[data.status]}>{data.status.charAt(0) + data.status.slice(1).toLowerCase()}</Badge>
            <Badge>{TYPES.find((t) => t.value === data.type)?.label}</Badge>
            {data.channels.map((c) => (
              <Badge key={c} tone="blue">
                {CHANNEL_LABEL[c]}
              </Badge>
            ))}
          </div>

          {data.pausedReason ? (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">{data.pausedReason}</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            {(['EMAIL', 'INAPP', 'SMS'] as BroadcastChannel[])
              .filter((c) => data.channels.includes(c))
              .map((c) => {
                const counts = data.stats[c] || { PENDING: 0, SENT: 0, FAILED: 0, SKIPPED: 0 };
                return (
                  <Card key={c} className="p-4">
                    <p className="text-xs font-bold text-[var(--text-secondary)]">{CHANNEL_LABEL[c]}</p>
                    <p className="mt-1 text-2xl font-black">{counts.SENT}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">sent of {sum(counts)}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 text-[11px]">
                      {counts.PENDING > 0 ? <span className="text-amber-700">{counts.PENDING} pending</span> : null}
                      {counts.FAILED > 0 ? <span className="text-red-600">{counts.FAILED} failed</span> : null}
                      {counts.SKIPPED > 0 ? <span className="text-[var(--text-muted)]">{counts.SKIPPED} skipped</span> : null}
                    </div>
                  </Card>
                );
              })}
          </div>

          <div className="flex flex-wrap gap-2">
            {failedTotal > 0 ? (
              <Button variant="outline" loading={busy === 'retry'} onClick={() => run('retry', async () => (await adminApi.retryBroadcast(id), 'Retrying failed messages'))}>
                <RotateCcw className="h-4 w-4" /> Retry {failedTotal} failed
              </Button>
            ) : null}
            {smsPending > 0 ? (
              <Button
                variant="outline"
                disabled={!smsEnabled}
                loading={busy === 'sms'}
                title={smsEnabled ? '' : 'SMS provider is not connected yet'}
                onClick={() => run('sms', async () => {
                  const r = await adminApi.sendPendingSms(id);
                  return `SMS sent: ${r.sent}, failed: ${r.failed}`;
                })}
              >
                <MessageSquare className="h-4 w-4" /> {smsEnabled ? `Send ${smsPending} pending SMS` : `${smsPending} SMS pending (provider not connected)`}
              </Button>
            ) : null}
          </div>

          <div className="rounded-xl border border-[var(--border-color)] p-4 text-sm">
            <p className="font-black">{data.subject}</p>
            <p className="mt-2 whitespace-pre-line text-[var(--text-secondary)]">{data.body}</p>
            {data.ctaLabel ? (
              <p className="mt-3 text-xs">
                Button: <b>{data.ctaLabel}</b> {data.ctaUrl ? `→ ${data.ctaUrl}` : ''}
              </p>
            ) : null}
            {data.smsText ? <p className="mt-3 text-xs text-[var(--text-muted)]">SMS: {data.smsText}</p> : null}
          </div>

          <div className="grid gap-x-8 text-xs sm:grid-cols-2">
            <p className="py-1">
              <span className="text-[var(--text-muted)]">Audience: </span>
              <b>{data.audience.mode === 'ALL' ? 'All users' : data.audience.mode === 'SEGMENT' ? 'Segment' : 'Custom list'}</b>
              {data.recipientCount ? ` (${data.recipientCount} people)` : ''}
            </p>
            <p className="py-1">
              <span className="text-[var(--text-muted)]">Created: </span>
              <b>{formatDateTime(data.createdAt)}</b> by {data.createdBy || 'admin'}
            </p>
            <p className="py-1">
              <span className="text-[var(--text-muted)]">Started: </span>
              <b>{formatDateTime(data.startedAt) || '-'}</b>
            </p>
            <p className="py-1">
              <span className="text-[var(--text-muted)]">Finished: </span>
              <b>{formatDateTime(data.completedAt) || '-'}</b>
            </p>
          </div>

          {data.problems && data.problems.length ? (
            <div>
              <p className="mb-2 text-sm font-black">Not delivered ({data.problems.length} shown)</p>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-color)]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                    <tr>
                      <th className="px-3 py-2">Channel</th>
                      <th className="px-3 py-2">Recipient</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.problems.map((p, i) => (
                      <tr key={i} className="border-t border-[var(--border-color)]">
                        <td className="px-3 py-2">{CHANNEL_LABEL[p.channel]}</td>
                        <td className="px-3 py-2">{p.name || p.to || '-'}</td>
                        <td className="px-3 py-2">
                          <Badge tone={p.status === 'FAILED' ? 'red' : 'gray'}>{p.status === 'FAILED' ? 'Failed' : 'Skipped'}</Badge>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">{p.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
