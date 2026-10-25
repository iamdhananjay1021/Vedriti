'use client';

import React from 'react';
import {
  TrendingUp,
  Flame,
  ShoppingBag,
  CalendarCheck,
  Users,
  ArrowUpRight,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  Shield,
  Send,
} from 'lucide-react';
import { AdminPujaBooking, AdminStoreOrder, AdminTab } from '../types/admin';

interface OverviewTabProps {
  bookings: AdminPujaBooking[];
  orders: AdminStoreOrder[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenSankalpModal: (booking: AdminPujaBooking) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  bookings,
  orders,
  onNavigateTab,
  onOpenSankalpModal,
}) => {
  const pendingBookings = bookings.filter((b) => b.status === 'Pending Sankalp');
  const inProgressBookings = bookings.filter((b) => b.status === 'In Progress');
  const shippedOrders = orders.filter((o) => o.status === 'Shipped');

  const stats = [
    {
      title: 'Total Dakshina Revenue',
      value: '₹4,82,500',
      change: '+18.4%',
      period: 'vs last month',
      icon: TrendingUp,
      accent: 'var(--saffron)',
      lightBg: 'var(--saffron-light)',
    },
    {
      title: 'Vedic Store Orders',
      value: '₹2,18,900',
      change: '+24.1%',
      period: 'festive surge',
      icon: ShoppingBag,
      accent: '#2563EB',
      lightBg: 'rgba(37, 99, 235, 0.08)',
    },
    {
      title: 'Active Puja Sankalps',
      value: `${bookings.length}`,
      subValue: `${pendingBookings.length} awaiting Acharya`,
      change: '+32 this week',
      period: '',
      icon: CalendarCheck,
      accent: '#16A34A',
      lightBg: 'rgba(22, 163, 74, 0.08)',
    },
    {
      title: 'Verified Kashi Acharyas',
      value: '18 Online',
      subValue: 'Kashi • Ayodhya • Ujjain',
      change: '100% Certified',
      period: '',
      icon: Users,
      accent: '#9333EA',
      lightBg: 'rgba(147, 51, 234, 0.08)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Festive Alert Banner */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--saffron-light)',
              color: 'var(--saffron)',
            }}
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                धनतेरस एवं दीपावली महा संकल्प सत्र २०२६ सक्रिय
              </span>
              <span
                className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--saffron)',
                  color: '#FFFFFF',
                }}
              >
                High Demand
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              कुबेर अष्टलक्ष्मी महायज्ञ एवं 51-सामग्री गृह किट की मांग में 40% की वृद्धि। समस्त पार्सल BlueDart एयर से डिस्पैच किए जा रहे हैं।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('bookings')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--saffron)',
              color: '#FFFFFF',
            }}
          >
            Assign Acharyas <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl border transition-all hover:border-amber-600/40"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {stat.title}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: stat.lightBg,
                    color: stat.accent,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </span>
                {stat.change && (
                  <span className="text-[10.5px] font-bold text-emerald-600 flex items-center">
                    {stat.change}
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {stat.subValue || stat.period}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Live Sankalp Queue & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Sankalp Queue (2/3 width) */}
        <div
          className="lg:col-span-2 p-5 rounded-2xl border space-y-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Live Puja Sankalp Operations
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-semibold hover:underline flex items-center gap-1"
              style={{ color: 'var(--saffron)' }}
            >
              View All ({bookings.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table / Cards */}
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {bookings.slice(0, 4).map((booking) => (
              <div
                key={booking.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--saffron)',
                    }}
                  >
                    <Flame className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {booking.pujaTitle}
                      </span>
                      <span
                        className="text-[9.5px] px-2 py-0.5 rounded-full font-bold"
                        style={{
                          backgroundColor:
                            booking.status === 'Completed'
                              ? 'var(--green-bg)'
                              : booking.status === 'In Progress'
                              ? 'rgba(37, 99, 235, 0.1)'
                              : 'var(--saffron-light)',
                          color:
                            booking.status === 'Completed'
                              ? 'var(--green)'
                              : booking.status === 'In Progress'
                              ? '#2563EB'
                              : 'var(--saffron)',
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-medium">{booking.devoteeName}</span>
                      <span>•</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">{booking.gotra}</span>
                      <span>•</span>
                      <span>{booking.muhuratTime}</span>
                    </div>

                    {booking.assignedAcharya && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        आचार्य: {booking.assignedAcharya}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    ₹{booking.dakshinaAmount}
                  </span>
                  <button
                    onClick={() => onOpenSankalpModal(booking)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all hover:border-amber-600"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Inspect Gotra
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sanctum Operations & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Operations Box */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
              Sanctum Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigateTab('bookings')}
                className="p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:border-amber-600/50"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Flame className="w-4 h-4 mb-2" style={{ color: 'var(--saffron)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Assign Acharya
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {pendingBookings.length} awaiting
                </span>
              </button>

              <button
                onClick={() => onNavigateTab('orders')}
                className="p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:border-amber-600/50"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Truck className="w-4 h-4 mb-2 text-blue-600" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  BlueDart AWB
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Dispatch Prasad
                </span>
              </button>

              <button
                onClick={() => onNavigateTab('catalog')}
                className="p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:border-amber-600/50"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Sparkles className="w-4 h-4 mb-2 text-emerald-600" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Update Catalog
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Prices & Samagri
                </span>
              </button>

              <button
                onClick={() => onNavigateTab('devotees')}
                className="p-3 rounded-xl border text-left flex flex-col justify-between transition-all hover:border-amber-600/50"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Shield className="w-4 h-4 mb-2 text-purple-600" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Acharya Payouts
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Settlement Ready
                </span>
              </button>
            </div>
          </div>

          {/* Delivery & Consecration Status Card */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                BlueDart Express Sanctum Track
              </span>
              <Truck className="w-4 h-4 text-blue-500" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Live Dispatches</span>
                <span className="font-bold text-emerald-600">3/3 on schedule</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full rounded-full" />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                All consecrated Prasad & Rudraksha parcels are dispatched in tamper-evident gold sanctum pouches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
