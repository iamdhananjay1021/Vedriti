'use client';

import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  ShoppingBag,
  Layers,
  Users,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AdminTab } from '../types/admin';

interface SidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingBookingsCount: number;
  activeOrdersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  pendingBookingsCount,
  activeOrdersCount,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Puja Bookings', icon: CalendarCheck, badge: pendingBookingsCount },
    { id: 'orders', label: 'Store Orders', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'catalog', label: 'Catalog & Samagri', icon: Layers },
    { id: 'devotees', label: 'Devotees & Payouts', icon: Users },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen transition-all duration-300 z-30 flex flex-col justify-between border-r ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Top Brand Header */}
      <div>
        <div
          className="h-16 flex items-center justify-between px-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: 'var(--saffron-light)',
                border: '1px solid var(--border-color)',
              }}
            >
              <Flame className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-extrabold text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>
                    VedRiti
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase"
                    style={{
                      backgroundColor: 'var(--saffron-light)',
                      color: 'var(--saffron)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    Admin
                  </span>
                </div>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  Kashi Sanctum Portal
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
            }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all relative ${
                  isActive ? 'shadow-sm font-semibold' : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--saffron)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className="w-4 h-4 shrink-0 transition-transform"
                  style={{ color: isActive ? '#FFFFFF' : 'var(--text-secondary)' }}
                />

                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Badge Count */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      collapsed ? 'absolute -top-1 -right-1' : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? '#FFFFFF' : 'var(--saffron)',
                      color: isActive ? 'var(--saffron)' : '#FFFFFF',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sanctum Health Indicator */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          style={{
            backgroundColor: 'var(--bg-hover)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  Kashi Sanctum Live
                </span>
              </div>
              <span className="text-[9.5px]" style={{ color: 'var(--text-muted)' }}>
                API & BlueDart Synced
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
