'use client';

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { OverviewTab } from '../components/OverviewTab';
import { BookingsTab } from '../components/BookingsTab';
import { OrdersTab } from '../components/OrdersTab';
import { CatalogTab } from '../components/CatalogTab';
import { DevoteesTab } from '../components/DevoteesTab';
import {
  INITIAL_BOOKINGS,
  INITIAL_ORDERS,
  INITIAL_CATALOG,
  INITIAL_DEVOTEES,
  INITIAL_ACHARYA_PAYOUTS,
} from '../data/mockAdminData';
import {
  AdminTab,
  AdminPujaBooking,
  AdminStoreOrder,
  AdminCatalogItem,
  AdminDevotee,
  AcharyaPayout,
} from '../types/admin';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Core Data Stores
  const [bookings, setBookings] = useState<AdminPujaBooking[]>(INITIAL_BOOKINGS);
  const [orders, setOrders] = useState<AdminStoreOrder[]>(INITIAL_ORDERS);
  const [catalog, setCatalog] = useState<AdminCatalogItem[]>(INITIAL_CATALOG);
  const [devotees, setDevotees] = useState<AdminDevotee[]>(INITIAL_DEVOTEES);
  const [payouts, setPayouts] = useState<AcharyaPayout[]>(INITIAL_ACHARYA_PAYOUTS);

  // Modal bridge
  const [modalBooking, setModalBooking] = useState<AdminPujaBooking | null>(null);

  // Tab Titles map
  const tabTitles: Record<AdminTab, string> = {
    overview: 'Sanctum Command Center',
    bookings: 'Puja Bookings & Sankalp Management',
    orders: 'Spiritual Store Orders & BlueDart Logistics',
    catalog: 'Vedic Catalog & Hawan Samagri Manager',
    devotees: 'Devotees CRM & Acharya Dakshina Payouts',
    settings: 'Portal Settings',
  };

  // Booking handlers
  const handleUpdateBooking = (updated: AdminPujaBooking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  // Order handlers
  const handleUpdateOrder = (updated: AdminStoreOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Catalog handlers
  const handleAddCatalogItem = (newItem: AdminCatalogItem) => {
    setCatalog((prev) => [newItem, ...prev]);
  };

  const handleUpdateCatalogItem = (updated: AdminCatalogItem) => {
    setCatalog((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCatalogItem = (id: string) => {
    setCatalog((prev) => prev.filter((c) => c.id !== id));
  };

  // Payout handlers
  const handleSettlePayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) => {
        if (p.id === payoutId) {
          return {
            ...p,
            paidDakshina: p.paidDakshina + p.pendingDakshina,
            pendingDakshina: 0,
            status: 'Processed',
          };
        }
        return p;
      })
    );
  };

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending Sankalp').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Collapsible Luxury Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setModalBooking(null);
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        pendingBookingsCount={pendingBookingsCount}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Main Container Offset by Sidebar */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Sticky Header with Search, Dark/Light Mode, Notifications, Avatar */}
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTabTitle={tabTitles[activeTab]}
        />

        {/* Dynamic Tab Content */}
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              bookings={bookings}
              orders={orders}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenSankalpModal={(booking) => {
                setActiveTab('bookings');
                setModalBooking(booking);
              }}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              onUpdateBooking={handleUpdateBooking}
              selectedBookingForModal={modalBooking}
              onCloseModal={() => setModalBooking(null)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab orders={orders} onUpdateOrder={handleUpdateOrder} />
          )}

          {activeTab === 'catalog' && (
            <CatalogTab
              catalog={catalog}
              onAddCatalogItem={handleAddCatalogItem}
              onUpdateCatalogItem={handleUpdateCatalogItem}
              onDeleteCatalogItem={handleDeleteCatalogItem}
            />
          )}

          {activeTab === 'devotees' && (
            <DevoteesTab
              devotees={devotees}
              payouts={payouts}
              onSettlePayout={handleSettlePayout}
            />
          )}
        </main>
      </div>
    </div>
  );
}
