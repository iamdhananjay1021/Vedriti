'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { Order, OrderStatus } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDateTime, ORDER_STATUS, PAYMENT_STATUS, rupees, telLink, TONE, waLink } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Pagination, Row, Select, Spinner, Textarea, useToast } from '../ui';

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  PLACED: { status: 'CONFIRMED', label: 'Confirm order' },
  CONFIRMED: { status: 'SHIPPED', label: 'Mark shipped' },
  SHIPPED: { status: 'DELIVERED', label: 'Mark delivered' },
};

export function OrdersTab({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const toast = useToast();

  const fetcher = useCallback(() => adminApi.orders({ status, search: query, page, limit: 20 }), [status, query, page]);
  const { data, error, reload: load } = useLoader(fetcher);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order ID, name, phone, product"
          className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--saffron)] sm:col-span-2"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[{ value: 'ALL', label: 'All statuses' }, ...Object.entries(ORDER_STATUS).map(([value, label]) => ({ value, label }))]}
        />
      </div>
      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? <Empty title="No orders found" /> : null}
      <div className="grid gap-3">
        {data?.items.map((o) => (
          <button key={o.id} onClick={() => setSelected(o)} className="text-left">
            <Card className="transition hover:border-[var(--saffron)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {o.orderId} • {o.name}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatDateTime(o.createdAt)} • {o.city} {o.pinCode}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={TONE[o.status]}>{ORDER_STATUS[o.status]}</Badge>
                  <span className="text-sm font-semibold">{rupees(o.totalAmount)}</span>
                  <Badge tone={TONE[o.paymentStatus]}>{o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID' ? 'COD' : PAYMENT_STATUS[o.paymentStatus]}</Badge>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}
      {selected ? (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onSaved={(o, msg) => {
            setSelected(o);
            toast.ok(msg);
            load();
            onChanged();
          }}
          onError={toast.error}
        />
      ) : null}
      {toast.node}
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
  onSaved,
  onError,
}: {
  order: Order;
  onClose: () => void;
  onSaved: (o: Order, msg: string) => void;
  onError: (m: string) => void;
}) {
  const [courierPartner, setCourier] = useState(order.courierPartner);
  const [trackingNumber, setTracking] = useState(order.trackingNumber);
  const [adminNote, setNote] = useState(order.adminNote);
  const [busy, setBusy] = useState<string | null>(null);
  const next = NEXT[order.status];

  const update = async (key: string, body: Partial<Order>, msg: string) => {
    setBusy(key);
    try {
      onSaved(await adminApi.updateOrder(order.id, body), msg);
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const advance = () => {
    if (!next) return;
    if (next.status === 'SHIPPED' && !trackingNumber.trim() && !window.confirm('Ship without a tracking number?')) return;
    update('next', { status: next.status, courierPartner, trackingNumber, adminNote }, `Order ${ORDER_STATUS[next.status].toLowerCase()}`);
  };

  const cancel = () => {
    if (!window.confirm('Cancel this order? Stock will be added back.')) return;
    update('cancel', { status: 'CANCELLED', cancelReason: 'Cancelled by store' }, 'Order cancelled');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={order.orderId}
      wide
      footer={
        <>
          {order.status === 'PLACED' || order.status === 'CONFIRMED' ? (
            <Button variant="danger" loading={busy === 'cancel'} onClick={cancel}>
              Cancel order
            </Button>
          ) : null}
          {order.paymentStatus === 'PAID' && order.status === 'CANCELLED' ? (
            <Button variant="outline" loading={busy === 'refund'} onClick={() => update('refund', { paymentStatus: 'REFUNDED' }, 'Marked refunded')}>
              Mark refunded
            </Button>
          ) : null}
          <Button variant="outline" loading={busy === 'save'} onClick={() => update('save', { courierPartner, trackingNumber, adminNote }, 'Saved')}>
            Save details
          </Button>
          {next ? (
            <Button loading={busy === 'next'} onClick={advance}>
              {next.label}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone={TONE[order.status]}>{ORDER_STATUS[order.status]}</Badge>
        <Badge tone={TONE[order.paymentStatus]}>
          {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online'} • {PAYMENT_STATUS[order.paymentStatus]}
        </Badge>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="font-bold">Items</h4>
          <div className="divide-y divide-[var(--border-color)]">
            {order.items.map((i) => (
              <Row key={i.productId} label={`${i.quantity} × ${i.name}`}>
                {rupees(i.totalPrice)}
              </Row>
            ))}
            <Row label="Delivery">{order.deliveryCharge ? rupees(order.deliveryCharge) : 'Free'}</Row>
            <Row label="Total">{rupees(order.totalAmount)}</Row>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Ship to</h4>
          <p className="text-sm">{order.name}</p>
          <p className="text-sm">{order.address}</p>
          <p className="text-sm">
            {order.city}, {order.state} {order.pinCode}
          </p>
          <div className="mt-2 flex gap-2">
            <a href={telLink(order.phone)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm font-semibold">
              <Phone className="h-4 w-4" /> {order.phone}
            </a>
            <a
              href={waLink(order.phone, `Pranam ${order.name} ji, regarding your VedRit order ${order.orderId}.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm font-semibold text-green-600"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input label="Courier" value={courierPartner} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. India Post, Delhivery" />
        <Input label="Tracking number" value={trackingNumber} onChange={(e) => setTracking(e.target.value)} />
        <Textarea className="sm:col-span-2" label="Note for customer" value={adminNote} onChange={(e) => setNote(e.target.value)} />
      </div>
      {order.cancelReason ? <p className="mt-3 text-sm text-[var(--red)]">{order.cancelReason}</p> : null}
    </Modal>
  );
}
