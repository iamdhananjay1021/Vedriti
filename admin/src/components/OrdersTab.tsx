'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Search,
  Package,
  Sparkles,
  MapPin,
  ExternalLink,
  Check,
  Send,
  AlertCircle,
} from 'lucide-react';
import { AdminStoreOrder, OrderStatus } from '../types/admin';

interface OrdersTabProps {
  orders: AdminStoreOrder[];
  onUpdateOrder: (updated: AdminStoreOrder) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, onUpdateOrder }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [justDispatchedId, setJustDispatchedId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.devoteeName.toLowerCase().includes(q) ||
      (o.awbNumber && o.awbNumber.toLowerCase().includes(q)) ||
      o.shippingAddress.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleConsecrateOrder = (order: AdminStoreOrder) => {
    const updated: AdminStoreOrder = {
      ...order,
      status: 'Consecrated',
    };
    onUpdateOrder(updated);
  };

  const handleGenerateAWBAndShip = (order: AdminStoreOrder) => {
    const newAwb = `BD-VR-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const updated: AdminStoreOrder = {
      ...order,
      status: 'Shipped',
      awbNumber: newAwb,
      courier: 'BlueDart Express Consecrated Air Track',
    };
    onUpdateOrder(updated);
    setJustDispatchedId(order.id);
    setTimeout(() => setJustDispatchedId(null), 4000);
  };

  const handleMarkDelivered = (order: AdminStoreOrder) => {
    const updated: AdminStoreOrder = {
      ...order,
      status: 'Delivered',
    };
    onUpdateOrder(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Order Confirmed', 'Consecrated', 'Shipped', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st ? 'shadow-sm' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: statusFilter === st ? 'var(--saffron)' : 'var(--bg-hover)',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border w-full md:w-72"
          style={{
            backgroundColor: 'var(--bg-hover)',
            borderColor: 'var(--border-color)',
          }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order #, AWB, Devotee..."
            className="w-full text-xs bg-transparent focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {justDispatchedId && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Truck className="w-4 h-4 shrink-0" />
          <span>BlueDart AWB generate ho chuka hai aur courier manifest me add ho gaya hai!</span>
        </div>
      )}

      {/* Orders List / Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="p-5 rounded-2xl border transition-all hover:border-amber-600/40"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Top Row: Order Number, Date, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs" style={{ color: 'var(--saffron)' }}>
                  {order.orderNumber}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {order.orderDate}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      order.status === 'Delivered'
                        ? 'var(--green-bg)'
                        : order.status === 'Shipped'
                        ? 'rgba(37, 99, 235, 0.1)'
                        : order.status === 'Consecrated'
                        ? 'rgba(147, 51, 234, 0.1)'
                        : 'var(--saffron-light)',
                    color:
                      order.status === 'Delivered'
                        ? 'var(--green)'
                        : order.status === 'Shipped'
                        ? '#2563EB'
                        : order.status === 'Consecrated'
                        ? '#9333EA'
                        : 'var(--saffron)',
                  }}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Middle Grid: Items & Shipping Info */}
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Items purchased */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
                  Ordered Spiritual Samagri ({order.items.length})
                </span>
                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Devotee & Address */}
              <div
                className="p-3.5 rounded-xl border space-y-1.5"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {order.devoteeName}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {order.devoteePhone}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                  <span>{order.shippingAddress}</span>
                </div>

                {order.awbNumber ? (
                  <div className="pt-2 mt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      AWB: {order.awbNumber}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {order.courier}
                    </span>
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] italic text-amber-600">
                    AWB pending dispatch assignment
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Order Total:
                </span>
                <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  ₹{order.totalAmount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {order.status === 'Order Confirmed' && (
                  <button
                    onClick={() => handleConsecrateOrder(order)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all hover:border-purple-600 cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(147, 51, 234, 0.08)',
                      borderColor: 'rgba(147, 51, 234, 0.3)',
                      color: '#9333EA',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Mark Consecrated (गंगाजल शुद्धि)
                  </button>
                )}

                {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                  <button
                    onClick={() => handleGenerateAWBAndShip(order)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--saffron)',
                      color: '#FFFFFF',
                    }}
                  >
                    <Truck className="w-3.5 h-3.5" /> Generate BlueDart AWB & Dispatch
                  </button>
                )}

                {order.status === 'Shipped' && (
                  <button
                    onClick={() => handleMarkDelivered(order)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all text-emerald-600 border-emerald-500/30 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center rounded-2xl border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            No orders found matching this filter or search query.
          </div>
        )}
      </div>
    </div>
  );
};
