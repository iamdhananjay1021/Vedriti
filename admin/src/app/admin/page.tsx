'use client';

import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AdminShell, AdminTab, TABS } from '../../components/AdminShell';
import { LoginForm } from '../../components/LoginForm';
import { Spinner } from '../../components/ui';
import { DashboardTab } from '../../components/tabs/OverviewTab';
import { HomeTab } from '../../components/tabs/HomeTab';
import { BookingsTab } from '../../components/tabs/BookingsTab';
import { SamuhikTab } from '../../components/tabs/SamuhikTab';
import { ScheduleTab } from '../../components/tabs/ScheduleTab';
import { KundliTab } from '../../components/tabs/KundliTab';
import { OrdersTab } from '../../components/tabs/OrdersTab';
import { CatalogTab } from '../../components/tabs/CatalogTab';
import { DevoteesTab } from '../../components/tabs/DevoteesTab';
import { InquiriesTab } from '../../components/tabs/InquiriesTab';
import { CouponsTab } from '../../components/tabs/CouponsTab';
import { AnnouncementsTab } from '../../components/tabs/AnnouncementsTab';
import { BroadcastsTab } from '../../components/tabs/BroadcastsTab';
import { StaffTab } from '../../components/tabs/StaffTab';
import { SettingsTab } from '../../components/tabs/SettingsTab';
import { adminApi, setUnauthorizedHandler, tokenStore } from '../../lib/api';

type AuthState = { status: 'checking' } | { status: 'out' } | { status: 'in'; email: string };

const readTab = (): AdminTab => {
  const hash = window.location.hash.slice(1);
  if (hash === 'overview') return 'dashboard';
  return (TABS.find((t) => t.id === hash)?.id ?? 'dashboard') as AdminTab;
};

const subscribeHash = (callback: () => void) => {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
};

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState>({ status: 'checking' });
  const tab = useSyncExternalStore(subscribeHash, readTab, () => 'dashboard' as AdminTab);
  const [badges, setBadges] = useState<Partial<Record<AdminTab, number>>>({});
  const [badgeTick, setBadgeTick] = useState(0);

  const logout = useCallback(() => {
    tokenStore.clear();
    setAuth({ status: 'out' });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    let active = true;
    const check = tokenStore.get() ? adminApi.me().then((me) => me.email).catch(() => null) : Promise.resolve(null);
    check.then((email) => {
      if (!active) return;
      if (email) setAuth({ status: 'in', email });
      else logout();
    });
    return () => {
      active = false;
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  const refreshBadges = useCallback(() => setBadgeTick((t) => t + 1), []);

  useEffect(() => {
    if (auth.status !== 'in') return;
    let active = true;
    adminApi
      .stats()
      .then((s) => {
        if (active) setBadges({ bookings: s.pendingBookings, kundli: s.openKundli, orders: s.openOrders });
      })
      .catch(() => {});
    const t = setTimeout(refreshBadges, 60000);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [auth.status, badgeTick, refreshBadges]);

  const changeTab = (next: AdminTab) => {
    window.location.hash = next;
  };

  if (auth.status === 'checking') return <Spinner className="min-h-screen items-center" />;
  if (auth.status === 'out') return <LoginForm onLoggedIn={(email) => setAuth({ status: 'in', email })} />;

  return (
    <AdminShell active={tab} onChange={changeTab} email={auth.email} onLogout={logout} badges={badges}>
      {tab === 'dashboard' && <DashboardTab onNavigate={changeTab} />}
      {tab === 'home' && <HomeTab />}
      {tab === 'bookings' && <BookingsTab onChanged={refreshBadges} />}
      {tab === 'samuhik' && <SamuhikTab />}
      {tab === 'schedule' && <ScheduleTab />}
      {tab === 'kundli' && <KundliTab onChanged={refreshBadges} />}
      {tab === 'orders' && <OrdersTab onChanged={refreshBadges} />}
      {tab === 'catalog' && <CatalogTab />}
      {tab === 'devotees' && <DevoteesTab />}
      {tab === 'inquiries' && <InquiriesTab />}
      {tab === 'coupons' && <CouponsTab />}
      {tab === 'announcements' && <AnnouncementsTab />}
      {tab === 'broadcasts' && <BroadcastsTab />}
      {tab === 'staff' && <StaffTab />}
      {tab === 'settings' && <SettingsTab />}
    </AdminShell>
  );
}
