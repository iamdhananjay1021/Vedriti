'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Download, MessageCircle, Package, Phone, Printer, ShoppingBag, Truck } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { Order, OrderStatus } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDate, formatDateTime, ORDER_STATUS, PAYMENT_STATUS, rupees, telLink, TONE, waLink } from '../../lib/format';
import { exportToCsv } from '../../lib/exportCsv';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Pagination, Row, Select, Spinner, Textarea, useToast } from '../ui';

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  PLACED: { status: 'CONFIRMED', label: 'Confirm Order' },
  CONFIRMED: { status: 'SHIPPED', label: 'Mark Shipped' },
  SHIPPED: { status: 'DELIVERED', label: 'Mark Delivered' },
};

export function OrdersTab({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
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

  const handleExportCsv = () => {
    if (!data?.items?.length) return;
    exportToCsv(
      'vedrit_kit_orders',
      [
        { header: 'Order ID', accessor: (o) => o.orderId },
        { header: 'Customer Name', accessor: (o) => o.name },
        { header: 'Phone', accessor: (o) => o.phone },
        { header: 'Address', accessor: (o) => o.address },
        { header: 'City', accessor: (o) => o.city },
        { header: 'State', accessor: (o) => o.state },
        { header: 'Pin Code', accessor: (o) => o.pinCode },
        { header: 'Items', accessor: (o) => o.items.map((i) => `${i.quantity}x ${i.name}`).join(' | ') },
        { header: 'Subtotal (INR)', accessor: (o) => o.subtotal },
        { header: 'Delivery Charge', accessor: (o) => o.deliveryCharge },
        { header: 'Total Amount (INR)', accessor: (o) => o.totalAmount },
        { header: 'Payment Method', accessor: (o) => o.paymentMethod },
        { header: 'Payment Status', accessor: (o) => o.paymentStatus },
        { header: 'Order Status', accessor: (o) => o.status },
        { header: 'Courier Partner', accessor: (o) => o.courierPartner || '' },
        { header: 'Tracking Number', accessor: (o) => o.trackingNumber || '' },
        { header: 'Placed At', accessor: (o) => o.createdAt },
      ],
      data.items
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              Puja Kits & Samagri Orders
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Track devotee orders, dispatch statuses, courier AWB tracking numbers, and print shipping invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={!data?.items?.length}
            className="text-xs font-bold py-2.5 shadow-xs whitespace-nowrap"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[var(--saffron)]" />
            Export CSV ({data?.total ?? 0})
          </Button>

          <Button variant="outline" onClick={load} className="text-xs py-2.5 font-bold shadow-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card
          onClick={() => { setStatus('ALL'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--saffron)] ${status === 'ALL' ? 'border-2 border-[var(--saffron)] bg-[var(--saffron-light)]/20 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Total Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-[var(--saffron)] shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[var(--text-primary)]">
            {data?.total ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">All-time kit store purchases</p>
        </Card>

        <Card
          onClick={() => { setStatus('PLACED'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 ${status === 'PLACED' ? 'border-2 border-amber-500 bg-amber-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Awaiting Dispatch</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-xs">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-amber-700 dark:text-amber-400">
            {data?.items.filter(o => o.status === 'PLACED' || o.status === 'CONFIRMED').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Kits to be packed & shipped</p>
        </Card>

        <Card
          onClick={() => { setStatus('SHIPPED'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 ${status === 'SHIPPED' ? 'border-2 border-blue-500 bg-blue-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">In Transit</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-blue-700 dark:text-blue-400">
            {data?.items.filter(o => o.status === 'SHIPPED').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">With courier partners</p>
        </Card>

        <Card
          onClick={() => { setStatus('DELIVERED'); setPage(1); }}
          className={`cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 ${status === 'DELIVERED' ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-md' : 'shadow-sm'}`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="font-heading uppercase tracking-wider">Delivered</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-emerald-700 dark:text-emerald-400">
            {data?.items.filter(o => o.status === 'DELIVERED').length ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Safely received by devotees</p>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, name, phone, product..."
            className="flex-1 min-w-[240px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-2.5 sm:py-3 text-sm font-semibold outline-none focus:border-[var(--saffron)] text-[var(--text-primary)] shadow-xs"
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
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? <Empty title="No orders found" /> : null}

      <div className="grid gap-4 sm:gap-5">
        {data?.items.map((o) => (
          <div
            key={o.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm transition hover:border-[var(--saffron)] hover:shadow-md"
          >
            <div className="flex-1 cursor-pointer" onClick={() => setSelected(o)}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-700 dark:text-blue-400">#{o.orderId}</span>
                <span className="font-extrabold text-sm text-[var(--text-primary)]">{o.name}</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">• {o.city} ({o.pinCode})</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                {formatDateTime(o.createdAt)}
                {o.trackingNumber ? ` • ${o.courierPartner || 'Courier'}: ${o.trackingNumber}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <span className="block font-black text-sm text-[var(--gold)]">{rupees(o.totalAmount)}</span>
                <Badge tone={TONE[o.status]}>{ORDER_STATUS[o.status]}</Badge>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPrintingOrder(o)}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 text-[var(--text-secondary)] transition hover:border-[var(--saffron)] hover:text-[var(--saffron)]"
                  title="Print Shipping Slip & Invoice"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <Button variant="outline" onClick={() => setSelected(o)} className="text-xs py-1.5 font-bold">
                  Manage
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}

      {selected ? (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onPrint={() => {
            setPrintingOrder(selected);
          }}
          onSaved={(o, msg) => {
            setSelected(o);
            toast.ok(msg);
            load();
            onChanged();
          }}
          onError={toast.error}
        />
      ) : null}

      {printingOrder ? (
        <PrintShippingSlipModal order={printingOrder} onClose={() => setPrintingOrder(null)} />
      ) : null}

      {toast.node}
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
  onPrint,
  onSaved,
  onError,
}: {
  order: Order;
  onClose: () => void;
  onPrint: () => void;
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
      title={`Order #${order.orderId}`}
      wide
      footer={
        <>
          <Button type="button" variant="outline" onClick={onPrint} className="mr-auto font-bold">
            <Printer className="mr-1.5 h-4 w-4" />
            Print Shipping Slip / Invoice
          </Button>
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
            <Button loading={busy === 'next'} onClick={advance} className="font-bold shadow-md">
              {next.label}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone={TONE[order.status]}>{ORDER_STATUS[order.status]}</Badge>
        <Badge tone={TONE[order.paymentStatus]}>
          {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online'} • {PAYMENT_STATUS[order.paymentStatus]}
        </Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 p-4">
        <div>
          <h4 className="font-extrabold text-sm text-[var(--text-primary)] mb-2">Samagri Kit Items</h4>
          <div className="divide-y divide-[var(--border-color)] text-xs">
            {order.items.map((i) => (
              <Row key={i.productId} label={`${i.quantity} × ${i.name}`}>
                {rupees(i.totalPrice)}
              </Row>
            ))}
            <Row label="Delivery Charge">{order.deliveryCharge ? rupees(order.deliveryCharge) : 'Free Sacred Delivery'}</Row>
            <Row label="Grand Total"><strong className="text-sm text-[var(--gold)]">{rupees(order.totalAmount)}</strong></Row>
          </div>
        </div>

        <div>
          <h4 className="font-extrabold text-sm text-[var(--text-primary)] mb-2">Delivery Address</h4>
          <div className="text-xs space-y-1 font-medium text-[var(--text-secondary)]">
            <p className="font-bold text-sm text-[var(--text-primary)]">{order.name}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.state} - <strong>{order.pinCode}</strong></p>
          </div>
          <div className="mt-3 flex gap-2">
            <a href={telLink(order.phone)} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
              <Phone className="h-3.5 w-3.5" /> {order.phone}
            </a>
            <a
              href={waLink(order.phone, `नमस्ते ${order.name} जी! वेदरीति से आपके सामग्री किट ऑर्डर #${order.orderId} के संदर्भ में...`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-700 dark:text-green-300 hover:bg-green-500/20"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
        <Input label="Courier Partner" value={courierPartner} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. India Post, Delhivery, DTDC, BlueDart" />
        <Input label="Tracking / AWB Number" value={trackingNumber} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. DEL784910283" />
        <Textarea className="sm:col-span-2" label="Note for Devotee" value={adminNote} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Dispatched with Ganga Jal and sacred prasad from Kashi Vishwanath" />
      </div>

      {order.cancelReason ? <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">Cancellation Reason: {order.cancelReason}</p> : null}
    </Modal>
  );
}

/**
 * Printable Packing Slip & Tax Invoice Modal
 * Styled with native print CSS for 1-click clean thermal or A4 printing
 */
function PrintShippingSlipModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 text-black shadow-2xl">
        {/* Screen Header Controls (hidden when printed) */}
        <div className="mb-6 flex items-center justify-between border-b pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-orange-600" />
            <h3 className="font-black text-lg text-slate-900">Print Shipping Slip & Tax Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2">
              <Printer className="mr-1.5 h-4 w-4" /> Print Document
            </Button>
            <Button variant="outline" onClick={onClose} className="text-xs py-2 font-bold text-slate-800">
              Close
            </Button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="border-2 border-slate-900 p-6 rounded-lg bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-2xl font-black text-white">
                ॐ
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase">VedRit Vedic Sanctum</h1>
                <p className="text-xs font-medium text-slate-600">Pure Sacred Puja Samagri & Temple Kits</p>
                <p className="text-[11px] text-slate-500">Kashi Vishwanath Corridor, Varanasi • contact@vedrit.in</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block border border-slate-900 px-3 py-1 font-mono text-sm font-black uppercase">
                SHIPPING SLIP
              </span>
              <p className="mt-1 font-mono text-xs font-bold">#{order.orderId}</p>
              <p className="text-[11px] text-slate-600">Date: {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Delivery & Payment Badges */}
          <div className="my-4 grid grid-cols-2 gap-4 border-b pb-4 text-xs">
            <div>
              <p className="font-black uppercase tracking-wider text-slate-500 text-[10px]">SHIP TO (DEVOTEE):</p>
              <p className="mt-1 font-black text-sm text-slate-900">{order.name}</p>
              <p className="font-semibold text-slate-700 leading-relaxed mt-0.5">{order.address}</p>
              <p className="font-bold text-slate-800">{order.city}, {order.state} - {order.pinCode}</p>
              <p className="font-bold text-slate-900 mt-1">Mobile: {order.phone}</p>
            </div>

            <div className="border-l pl-4 space-y-1">
              <p className="font-black uppercase tracking-wider text-slate-500 text-[10px]">DISPATCH DETAILS:</p>
              <p><strong>Courier:</strong> {order.courierPartner || 'Standard Courier'}</p>
              <p><strong>AWB / Tracking:</strong> <span className="font-mono font-bold">{order.trackingNumber || 'Pending'}</span></p>
              <div className="mt-2 rounded border border-slate-400 p-2 bg-slate-50 text-[11px]">
                <p className="font-bold">
                  PAYMENT METHOD: {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD)' : 'PREPAID ONLINE (PAID)'}
                </p>
                <p className="font-black text-sm text-orange-700">
                  {order.paymentMethod === 'COD' ? `COLLECT: ${rupees(order.totalAmount)}` : `TOTAL PAID: ${rupees(order.totalAmount)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y-2 border-slate-900 bg-slate-100">
                <th className="py-2 px-2 font-black">#</th>
                <th className="py-2 px-2 font-black">Item Description</th>
                <th className="py-2 px-2 text-center font-black">Qty</th>
                <th className="py-2 px-2 text-right font-black">Unit Price</th>
                <th className="py-2 px-2 text-right font-black">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-2 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2 px-2 font-bold">{item.name}</td>
                  <td className="py-2 px-2 text-center font-black">{item.quantity}</td>
                  <td className="py-2 px-2 text-right">{rupees(item.unitPrice)}</td>
                  <td className="py-2 px-2 text-right font-black">{rupees(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-900 font-bold">
              <tr>
                <td colSpan={3}></td>
                <td className="py-1 px-2 text-right">Subtotal:</td>
                <td className="py-1 px-2 text-right">{rupees(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3}></td>
                <td className="py-1 px-2 text-right">Delivery:</td>
                <td className="py-1 px-2 text-right">{order.deliveryCharge ? rupees(order.deliveryCharge) : 'FREE'}</td>
              </tr>
              <tr className="text-sm font-black bg-slate-100">
                <td colSpan={3} className="py-1.5 px-2">Total Amount Payable:</td>
                <td colSpan={2} className="py-1.5 px-2 text-right text-base text-orange-700">
                  {rupees(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Packing & Sanctum Checklist */}
          <div className="mt-4 border-t pt-3 flex items-center justify-between text-[11px] text-slate-600">
            <div>
              <p className="font-bold text-slate-800">Quality & Packing Checklist:</p>
              <div className="mt-1 flex flex-wrap gap-3">
                <span>[ ] Vedic Consecration</span>
                <span>[ ] Ganga Jal Checked</span>
                <span>[ ] Prasad Packed</span>
                <span>[ ] Box Sealed</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Verified by VedRit Store</p>
              <p className="text-[10px] text-slate-500">Har Har Mahadev • शुभम् भवतु</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
