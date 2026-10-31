'use client';

import React, { useCallback, useEffect } from 'react';
import { AlertTriangle, CalendarDays, Clock, IndianRupee, ScrollText, ShoppingBag, Users } from 'lucide-react';
import { adminApi } from '../../lib/api';
import type { Stats } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { BOOKING_STATUS, formatDate, formatTime, MODE_LABELS, rupees, TONE } from '../../lib/format';
import { Badge, Card, ErrorBox, Spinner } from '../ui';
import type { AdminTab } from '../AdminShell';

export function OverviewTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const fetcher = useCallback(() => adminApi.stats(), []);
  const { data: stats, error, reload: load } = useLoader<Stats>(fetcher);

  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!stats) return <Spinner />;

  const tiles: { label: string; value: string | number; icon: React.ElementType; tab: AdminTab; highlight?: boolean }[] = [
    { label: "Today's bookings", value: stats.todaysBookings, icon: CalendarDays, tab: 'schedule' },
    { label: 'Awaiting confirmation', value: stats.pendingBookings, icon: Clock, tab: 'bookings', highlight: stats.pendingBookings > 0 },
    { label: 'Upcoming bookings', value: stats.upcomingBookings, icon: CalendarDays, tab: 'bookings' },
    { label: 'Open kundli requests', value: stats.openKundli, icon: ScrollText, tab: 'kundli', highlight: stats.openKundli > 0 },
    { label: 'Orders to ship', value: stats.openOrders, icon: ShoppingBag, tab: 'orders', highlight: stats.openOrders > 0 },
    { label: 'Devotees', value: `${stats.totalUsers} (+${stats.newUsersThisMonth})`, icon: Users, tab: 'devotees' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {tiles.map(({ label, value, icon: Icon, tab, highlight }) => (
          <button key={label} onClick={() => onNavigate(tab)} className="text-left">
            <Card className={`h-full transition hover:border-[var(--saffron)] ${highlight ? 'border-[var(--saffron)]' : ''}`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]">
            <IndianRupee className="h-4 w-4" />
            Revenue received
          </div>
          <p className="mt-2 text-3xl font-bold">{rupees(stats.revenue.month)}</p>
          <p className="text-xs text-[var(--text-muted)]">This month</p>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">All time</span><span className="font-semibold">{rupees(stats.revenue.total)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Pujas & appointments</span><span>{rupees(stats.revenue.bookings)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Kit orders</span><span>{rupees(stats.revenue.orders)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Kundli</span><span>{rupees(stats.revenue.kundli)}</span></div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Next bookings</h2>
            <button className="text-sm font-semibold text-[var(--saffron)]" onClick={() => onNavigate('bookings')}>
              View all
            </button>
          </div>
          {stats.nextBookings.length ? (
            <div className="divide-y divide-[var(--border-color)]">
              {stats.nextBookings.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="font-semibold">{b.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDate(b.date)} • {formatTime(b.startTime)} • {MODE_LABELS[b.mode]} • {b.devoteeName}
                    </p>
                  </div>
                  <Badge tone={TONE[b.status]}>{BOOKING_STATUS[b.status]}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">No upcoming bookings</p>
          )}
        </Card>
      </div>

      {stats.lowStock.length ? (
        <Card>
          <div className="mb-2 flex items-center gap-2 font-bold text-[var(--red)]">
            <AlertTriangle className="h-4 w-4" />
            Low stock
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStock.map((p) => (
              <Badge key={p._id} tone={p.stockQuantity === 0 ? 'red' : 'amber'}>
                {p.name}: {p.stockQuantity}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
