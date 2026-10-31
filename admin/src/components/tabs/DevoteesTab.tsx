'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, errorMessage } from '../../lib/api';
import type { UserDetail } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { BOOKING_STATUS, formatDate, formatDateTime, formatTime, KUNDLI_STATUS, KUNDLI_TYPES, ORDER_STATUS, rupees, TONE } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Modal, Pagination, Row, Spinner, useToast } from '../ui';

export function DevoteesTab() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetcher = useCallback(() => adminApi.users({ search: query, page, limit: 25 }), [query, page]);
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
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name, phone, email, city"
        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--saffron)]"
      />
      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!data && !error ? <Spinner /> : null}
      {data && !data.items.length ? <Empty title="No devotees yet" /> : null}
      {data?.items.length ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-[var(--text-muted)]">
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id} onClick={() => setSelectedId(u.id)} className="cursor-pointer border-b border-[var(--border-color)] hover:bg-[var(--bg-hover)]">
                  <td className="px-4 py-3 font-semibold">{u.name || '—'}</td>
                  <td className="px-4 py-3">
                    <div>{u.phone}</div>
                    <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{u.city}</td>
                  <td className="px-4 py-3">{u.bookingsCount ?? 0}</td>
                  <td className="px-4 py-3">{formatDateTime(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.isBlocked ? <Badge tone="red">Blocked</Badge> : u.profileCompleted ? <Badge tone="green">Active</Badge> : <Badge tone="amber">Profile incomplete</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
      {data ? <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} /> : null}
      {selectedId ? <DevoteeDetail id={selectedId} onClose={() => setSelectedId(null)} onChanged={load} /> : null}
    </div>
  );
}

function DevoteeDetail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const fetcher = useCallback(() => adminApi.user(id), [id]);
  const { data: detail, error, setData: setDetail } = useLoader<UserDetail>(fetcher);

  const toggleBlock = async () => {
    if (!detail) return;
    const blocking = !detail.user.isBlocked;
    if (blocking && !window.confirm('Block this devotee? They will not be able to login.')) return;
    setBusy(true);
    try {
      const user = await adminApi.updateUser(id, blocking);
      setDetail({ ...detail, user: { ...detail.user, isBlocked: user.isBlocked } });
      toast.ok(blocking ? 'Devotee blocked' : 'Devotee unblocked');
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const u = detail?.user;

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={u?.name || 'Devotee'}
      footer={
        u ? (
          <Button variant={u.isBlocked ? 'outline' : 'danger'} loading={busy} onClick={toggleBlock}>
            {u.isBlocked ? 'Unblock' : 'Block devotee'}
          </Button>
        ) : null
      }
    >
      {error ? <ErrorBox message={error} /> : null}
      {!detail && !error ? <Spinner /> : null}
      {u && detail ? (
        <div className="space-y-5">
          {u.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.avatarUrl} alt="" className="h-20 w-20 rounded-full border border-[var(--border-color)] object-cover" />
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="divide-y divide-[var(--border-color)]">
              <Row label="Phone">{u.phone || '—'}</Row>
              <Row label="Email">{u.email || '—'}</Row>
              <Row label="Gender">{u.gender || '—'}</Row>
              <Row label="Date of birth">{u.dateOfBirth ? formatDate(u.dateOfBirth) : '—'}</Row>
              <Row label="Time / place of birth">
                {u.timeOfBirth ? formatTime(u.timeOfBirth) : '—'} {u.placeOfBirth ? `• ${u.placeOfBirth}` : ''}
              </Row>
              <Row label="Gotra / Rashi">
                {u.gotra || '—'} {u.rashi ? `• ${u.rashi}` : ''}
              </Row>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)]">Address</p>
              <p className="text-sm">
                {u.address}
                <br />
                {u.city}
                {u.state ? `, ${u.state}` : ''} {u.pinCode}
              </p>
              {u.familyMembers.length ? (
                <>
                  <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">Family</p>
                  <ul className="text-sm">
                    {u.familyMembers.map((m) => (
                      <li key={m.id}>
                        {m.name} ({m.relation}){m.gotra ? ` • ${m.gotra}` : ''}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>

          <section>
            <h4 className="mb-2 font-bold">Bookings ({detail.bookings.length})</h4>
            {detail.bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-[var(--border-color)] py-2 text-sm">
                <span>
                  {formatDate(b.date)} {formatTime(b.startTime)} • {b.title} • {rupees(b.amount)}
                </span>
                <Badge tone={TONE[b.status]}>{BOOKING_STATUS[b.status]}</Badge>
              </div>
            ))}
          </section>
          <section>
            <h4 className="mb-2 font-bold">Orders ({detail.orders.length})</h4>
            {detail.orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between border-b border-[var(--border-color)] py-2 text-sm">
                <span>
                  {o.orderId} • {rupees(o.totalAmount)}
                </span>
                <Badge tone={TONE[o.status]}>{ORDER_STATUS[o.status]}</Badge>
              </div>
            ))}
          </section>
          <section>
            <h4 className="mb-2 font-bold">Kundli ({detail.kundli.length})</h4>
            {detail.kundli.map((k) => (
              <div key={k.id} className="flex items-center justify-between border-b border-[var(--border-color)] py-2 text-sm">
                <span>
                  {k.requestId} • {KUNDLI_TYPES[k.type]}
                </span>
                <Badge tone={TONE[k.status]}>{KUNDLI_STATUS[k.status]}</Badge>
              </div>
            ))}
          </section>
        </div>
      ) : null}
      {toast.node}
    </Modal>
  );
}
