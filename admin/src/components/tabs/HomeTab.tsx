'use client';

import React, { useCallback, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import { useLoader } from '../../lib/useLoader';
import type { Banner, BannerTarget, HomeSettings } from '../../lib/types';
import { formatDate, todayIst } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Select, Spinner, Textarea, Toggle, useToast } from '../ui';
import { ImageField } from '../ImageField';

const TARGETS: { value: BannerTarget; label: string }[] = [
  { value: 'NONE', label: 'No action (display only)' },
  { value: 'PUJAS', label: 'Open all pujas' },
  { value: 'PUJA', label: 'Open a specific puja' },
  { value: 'STORE', label: 'Open puja kit store' },
  { value: 'KUNDLI', label: 'Open kundli form' },
  { value: 'APPOINTMENT', label: 'Open appointment booking' },
];

const emptyBanner = (): Banner => ({
  title: '',
  subtitle: '',
  imageUrl: '',
  ctaLabel: 'Book now',
  targetType: 'PUJAS',
  targetRef: '',
  startsOn: '',
  endsOn: '',
  isActive: true,
  sortOrder: 0,
});

const SECTION_LABELS: { key: keyof HomeSettings['sections']; label: string }[] = [
  { key: 'popularPujas', label: 'Popular pujas' },
  { key: 'kits', label: 'Puja kits' },
  { key: 'kundli', label: 'Kundli promo' },
  { key: 'pandit', label: 'Pandit Ji profile card' },
  { key: 'japa', label: 'Mantra japa counter' },
];

export function HomeTab() {
  const [editing, setEditing] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [home, setHome] = useState<HomeSettings | null>(null);
  const toast = useToast();

  const fetcher = useCallback(async () => {
    const [banners, settings, pujas] = await Promise.all([adminApi.banners(), adminApi.settings(), adminApi.pujas()]);
    return { banners, settings, pujas };
  }, []);
  const { data, error, reload } = useLoader(fetcher);

  const current = home ?? data?.settings.home ?? null;
  const update = (next: HomeSettings) => setHome(next);

  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data || !current) return <Spinner />;

  const saveHome = async () => {
    setSaving(true);
    try {
      await adminApi.saveSettings({ home: current });
      toast.ok('Home screen updated');
      setHome(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const removeBanner = async (b: Banner) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    try {
      await adminApi.deleteBanner(b.id!);
      toast.ok('Banner deleted');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const toggleBanner = async (b: Banner) => {
    try {
      await adminApi.saveBanner({ ...b, isActive: !b.isActive });
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const today = todayIst();
  const pg = current.panchang;
  const setPanchang = (patch: Partial<HomeSettings['panchang']>) => update({ ...current, panchang: { ...pg, ...patch } });

  return (
    <div className="space-y-6 pb-28">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              Home Screen & Banners Management
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Manage mobile app sliding hero banners, announcement flashes, live panchang data, and section visibility.
          </p>
        </div>

        <Button
          onClick={() => setEditing(emptyBanner())}
          className="text-xs font-bold py-2.5 px-4 shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add New Banner
        </Button>
      </div>

      <Card className="space-y-4 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3.5">
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">Hero Sliding Banners</h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Displayed as an interactive carousel at the top of the mobile home screen.
            </p>
          </div>
          <span className="rounded-full bg-[var(--saffron)]/15 px-3 py-1 text-xs font-bold text-[var(--saffron)]">
            {data.banners.length} Active Banners
          </span>
        </div>
        {data.banners.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {data.banners.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs transition hover:shadow-md hover:border-[var(--saffron)]">
                <div className="relative aspect-[16/8] bg-gradient-to-br from-[var(--saffron)] to-[#7a2410]">
                  {b.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                    <p className="font-heading font-bold text-base leading-snug">{b.title}</p>
                    {b.subtitle ? <p className="mt-0.5 text-xs opacity-90 font-medium line-clamp-1">{b.subtitle}</p> : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 p-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={b.isActive ? 'green' : 'gray'}>{b.isActive ? 'Live' : 'Hidden'}</Badge>
                    <Badge>Order {b.sortOrder}</Badge>
                    {b.startsOn || b.endsOn ? (
                      <Badge tone="amber">
                        {b.startsOn ? formatDate(b.startsOn) : 'Now'} → {b.endsOn ? formatDate(b.endsOn) : 'No end'}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]" onClick={() => toggleBanner(b)} aria-label={b.isActive ? 'Hide' : 'Show'}>
                      {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]" onClick={() => setEditing(b)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-600" onClick={() => removeBanner(b)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-[var(--red)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Add Banner Card */}
            <button
              onClick={() => setEditing(emptyBanner())}
              className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-color)] p-6 text-center transition hover:border-[var(--saffron)] hover:bg-[var(--bg-hover)]/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--saffron-light)] text-[var(--saffron)] shadow-xs">
                <Plus className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-heading font-black text-[var(--text-primary)]">
                + Add Another Banner
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)] max-w-xs">
                Upload 16:9 banner to highlight festivals, vrat rituals, or special offers in mobile app.
              </p>
            </button>
          </div>
        ) : (
          <Empty title="No banners yet" subtitle="The app shows a default welcome banner until you add one." />
        )}
      </Card>

      <Card className="space-y-3.5 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">Flash Announcement Strip</h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">Marquee or highlight banner on top of the home screen</p>
          </div>
          <Toggle
            checked={current.announcement.enabled}
            onChange={(enabled) => update({ ...current, announcement: { ...current.announcement, enabled } })}
            label="Active"
          />
        </div>
        <Input
          className="mt-2"
          label="Announcement Message"
          hint="(max 160 characters)"
          maxLength={160}
          value={current.announcement.text}
          onChange={(e) => update({ ...current, announcement: { ...current.announcement, text: e.target.value } })}
          placeholder="e.g. Pandit Ji will be available at Tadiya Hanuman Mandir on Shivratri for special Sankalp."
        />
      </Card>

      <Card className="space-y-4 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">Live Vedic Panchang Override</h2>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Manual Panchang data shown in app on the specified date. {pg.date && pg.date !== today ? 'Current saved date is not today.' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs py-1.5 px-3 font-bold" onClick={() => setPanchang({ date: today })}>
              Set to Today
            </Button>
            <Button
              variant="ghost"
              className="text-xs py-1.5 px-3 font-bold text-red-600 hover:bg-red-500/10"
              onClick={() => update({ ...current, panchang: { date: '', paksha: '', tithi: '', nakshatra: '', yoga: '', abhijitMuhurat: '', rahuKaal: '', sunrise: '', sunset: '', note: '' } })}
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Date" type="date" value={pg.date} onChange={(e) => setPanchang({ date: e.target.value })} />
          <Input label="Tithi" value={pg.tithi} onChange={(e) => setPanchang({ tithi: e.target.value })} placeholder="Shukla Dashami" />
          <Input label="Paksha" value={pg.paksha} onChange={(e) => setPanchang({ paksha: e.target.value })} placeholder="Shukla Paksha" />
          <Input label="Nakshatra" value={pg.nakshatra} onChange={(e) => setPanchang({ nakshatra: e.target.value })} />
          <Input label="Yoga" value={pg.yoga} onChange={(e) => setPanchang({ yoga: e.target.value })} />
          <Input label="Abhijit Muhurat" value={pg.abhijitMuhurat} onChange={(e) => setPanchang({ abhijitMuhurat: e.target.value })} placeholder="11:45 AM - 12:35 PM" />
          <Input label="Rahu Kaal" value={pg.rahuKaal} onChange={(e) => setPanchang({ rahuKaal: e.target.value })} />
          <Input label="Sunrise" value={pg.sunrise} onChange={(e) => setPanchang({ sunrise: e.target.value })} placeholder="06:21 AM" />
          <Input label="Sunset" value={pg.sunset} onChange={(e) => setPanchang({ sunset: e.target.value })} placeholder="05:54 PM" />
          <Textarea className="sm:col-span-3" label="Auspicious Note / Blessing" maxLength={200} value={pg.note} onChange={(e) => setPanchang({ note: e.target.value })} />
        </div>
      </Card>

      <Card className="space-y-4 p-5 sm:p-6 shadow-sm">
        <h2 className="font-heading font-bold text-lg text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
          Mobile App Home Sections Visibility
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {SECTION_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 shadow-2xs">
              <Toggle
                checked={current.sections[key]}
                onChange={(v) => update({ ...current, sections: { ...current.sections, [key]: v } })}
                label={label}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Floating Save Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md p-3.5 md:left-64 shadow-lg">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <span className="hidden sm:inline text-xs font-semibold text-[var(--text-secondary)]">
            Configure sections, announcements and live panchang across mobile devices.
          </span>
          <Button loading={saving} onClick={saveHome} className="text-xs font-bold py-2.5 px-6 shadow-sm ml-auto">
            Save Home Configuration
          </Button>
        </div>
      </div>

      {editing ? (
        <BannerEditor
          initial={editing}
          pujas={data.pujas.map((p) => ({ value: p.slug, label: p.name }))}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            toast.ok('Banner saved');
            reload();
          }}
          onError={toast.error}
        />
      ) : null}
      {toast.node}
    </div>
  );
}

function BannerEditor({
  initial,
  pujas,
  onClose,
  onSaved,
  onError,
}: {
  initial: Banner;
  pujas: { value: string; label: string }[];
  onClose: () => void;
  onSaved: () => void;
  onError: (m: string) => void;
}) {
  const [b, setB] = useState<Banner>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Banner>(k: K, v: Banner[K]) => setB((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (b.title.trim().length < 2) return onError('Title is required');
    if (b.targetType === 'PUJA' && !b.targetRef) return onError('Select which puja the banner opens');
    if (b.startsOn && b.endsOn && b.startsOn > b.endsOn) return onError('End date must be after start date');
    setSaving(true);
    try {
      await adminApi.saveBanner({ ...b, targetRef: b.targetType === 'PUJA' ? b.targetRef : '' });
      onSaved();
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
      title={b.id ? 'Edit banner' : 'Add banner'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={save}>
            Save banner
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        <ImageField label="Banner image" hint="(shown full width in the app exactly as uploaded, e.g. 1200×600; title and button are only used when there is no image)" aspect="aspect-[16/9]" value={b.imageUrl} onChange={(v) => set('imageUrl', v)} />
        <Input label="Title *" maxLength={80} value={b.title} onChange={(e) => set('title', e.target.value)} />
        <Input label="Subtitle" maxLength={160} value={b.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="When tapped" value={b.targetType} onChange={(e) => set('targetType', e.target.value as BannerTarget)} options={TARGETS} />
          <Input label="Button text" hint="(leave empty for no button)" maxLength={30} value={b.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} />
        </div>
        {b.targetType === 'PUJA' ? (
          <Select
            label="Puja"
            value={b.targetRef}
            onChange={(e) => set('targetRef', e.target.value)}
            options={[{ value: '', label: 'Select a puja' }, ...pujas]}
          />
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Show from" type="date" value={b.startsOn} onChange={(e) => set('startsOn', e.target.value)} />
          <Input label="Show until" type="date" value={b.endsOn} onChange={(e) => set('endsOn', e.target.value)} />
          <Input label="Order" type="number" value={b.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        </div>
        <Toggle checked={b.isActive} onChange={(v) => set('isActive', v)} label="Live in app" />
      </div>
    </Modal>
  );
}
