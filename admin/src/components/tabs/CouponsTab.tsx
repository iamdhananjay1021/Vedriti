'use client';

import React, { useCallback, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Copy,
  Percent,
  Plus,
  RefreshCw,
  Tag,
  Ticket,
  Trash2,
  XCircle,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { CouponItem } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDate, rupees } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Select, Spinner, Textarea, Toggle, useToast } from '../ui';

const APPLICABLE_OPTIONS = [
  { value: 'ALL', label: 'All Services & Store (Universal)' },
  { value: 'PUJA', label: 'Puja & Ritual Bookings Only' },
  { value: 'STORE', label: 'Spiritual Store & Kit Orders Only' },
  { value: 'KUNDLI', label: 'Kundli & Jyotish Requests Only' },
];

export function CouponsTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'FLAT' as CouponItem['discountType'],
    discountValue: 108,
    minOrderValue: 500,
    maxDiscount: 0,
    applicableTo: 'ALL' as CouponItem['applicableTo'],
    validFrom: '',
    validTill: '',
    usageLimit: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetcher = useCallback(() => adminApi.coupons(), []);
  const { data: coupons, error, reload: load } = useLoader(fetcher);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: '',
      title: '',
      description: '',
      discountType: 'FLAT',
      discountValue: 108,
      minOrderValue: 500,
      maxDiscount: 0,
      applicableTo: 'ALL',
      validFrom: new Date().toISOString().slice(0, 10),
      validTill: '',
      usageLimit: 100,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      title: c.title,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount || 0,
      applicableTo: c.applicableTo,
      validFrom: c.validFrom || '',
      validTill: c.validTill || '',
      usageLimit: c.usageLimit || 0,
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveCoupon({
        ...(editingCoupon ? { id: editingCoupon._id || editingCoupon.id } : {}),
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue),
        maxDiscount: Number(form.maxDiscount),
        applicableTo: form.applicableTo,
        validFrom: form.validFrom,
        validTill: form.validTill,
        usageLimit: Number(form.usageLimit),
        isActive: form.isActive,
      });
      toast.ok(editingCoupon ? 'Coupon updated' : 'Coupon created');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: CouponItem) => {
    const id = c._id || c.id!;
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      await adminApi.deleteCoupon(id);
      toast.ok('Coupon deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleToggleActive = async (c: CouponItem) => {
    const id = c._id || c.id!;
    try {
      await adminApi.saveCoupon({ id, isActive: !c.isActive });
      toast.ok(`Coupon ${!c.isActive ? 'activated' : 'paused'}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              Coupons & Festival Discount Offers
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Create promotional discount codes for Diwali, Shivratri, Navratri, or first-time devotees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal} className="text-xs py-2.5 font-bold shadow-md">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Coupon
          </Button>

          <Button variant="outline" onClick={load} className="text-xs py-2.5 font-bold shadow-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!coupons && !error ? <Spinner /> : null}
      {coupons && !coupons.length ? <Empty title="No promotional coupons found" /> : null}

      {/* Coupons Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((c) => (
          <Card key={c.code} className="flex flex-col justify-between p-5 sm:p-6 shadow-sm rounded-2xl hover:border-[var(--saffron)] hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-[var(--saffron)]">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-base font-black tracking-wider text-[var(--saffron)]">
                      {c.code}
                    </span>
                    <h3 className="font-bold text-xs text-[var(--text-primary)]">{c.title}</h3>
                  </div>
                </div>

                <Badge tone={c.isActive ? 'green' : 'gray'}>
                  {c.isActive ? 'Active' : 'Paused'}
                </Badge>
              </div>

              {c.description ? (
                <p className="mt-2 text-xs font-medium text-[var(--text-secondary)] line-clamp-2">
                  {c.description}
                </p>
              ) : null}

              <div className="mt-3.5 space-y-1.5 border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-secondary)]">
                <p className="flex justify-between font-semibold">
                  <span>Benefit:</span>
                  <strong className="text-[var(--text-primary)] font-black">
                    {c.discountType === 'FLAT' ? `${rupees(c.discountValue)} OFF` : `${c.discountValue}% OFF`}
                  </strong>
                </p>
                {c.minOrderValue ? (
                  <p className="flex justify-between">
                    <span>Min Booking:</span>
                    <span>{rupees(c.minOrderValue)}</span>
                  </p>
                ) : null}
                <p className="flex justify-between">
                  <span>Category:</span>
                  <strong className="text-[var(--text-primary)]">{c.applicableTo}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Usage:</span>
                  <span>{c.usedCount} used {c.usageLimit ? `/ ${c.usageLimit} max` : ''}</span>
                </p>
                {c.validTill ? (
                  <p className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Valid Till:</span>
                    <span>{formatDate(c.validTill)}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => openEditModal(c)}
                className="text-xs py-1.5 font-bold"
              >
                Edit
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleToggleActive(c)}
                  className="text-xs py-1.5 font-bold"
                >
                  {c.isActive ? 'Pause' : 'Activate'}
                </Button>

                <button
                  type="button"
                  onClick={() => handleDelete(c)}
                  className="p-1.5 text-red-600 hover:text-red-800 transition"
                  title="Delete coupon"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {modalOpen ? (
        <Modal
          open
          onClose={() => setModalOpen(false)}
          title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="font-bold">
                Cancel
              </Button>
              <Button form="coupon-form" type="submit" loading={saving} className="font-bold shadow-md">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </>
          }
        >
          <form id="coupon-form" onSubmit={handleSave} className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Coupon Code (e.g. DIWALI108)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SHIVRATRI108"
                required
              />

              <Input
                label="Offer Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Diwali Sacred Puja Discount"
                required
              />
            </div>

            <Textarea
              label="Description (Devotee Benefit)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Flat ₹108 discount on all Rudrabhishek & Griha Pravesh pujas"
              rows={2}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <Select
                label="Discount Type"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as CouponItem['discountType'] })}
                options={[
                  { value: 'FLAT', label: 'Flat Rupee Discount (₹)' },
                  { value: 'PERCENTAGE', label: 'Percentage (%)' },
                ]}
              />

              <Input
                label={form.discountType === 'FLAT' ? 'Discount Amount (₹)' : 'Discount (%)'}
                type="number"
                min={1}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                required
              />

              <Input
                label="Min. Booking Amount (₹)"
                type="number"
                min={0}
                value={form.minOrderValue}
                onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Select
                label="Applicable Category"
                value={form.applicableTo}
                onChange={(e) => setForm({ ...form, applicableTo: e.target.value as CouponItem['applicableTo'] })}
                options={APPLICABLE_OPTIONS}
              />

              <Input
                label="Valid From (YYYY-MM-DD)"
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              />

              <Input
                label="Valid Till (Optional)"
                type="date"
                value={form.validTill}
                onChange={(e) => setForm({ ...form, validTill: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Usage Limit (0 for unlimited)"
                type="number"
                min={0}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
              />

              <div className="pt-6">
                <Toggle
                  label="Coupon Active"
                  checked={form.isActive}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            </div>
          </form>
        </Modal>
      ) : null}

      {toast.node}
    </div>
  );
}

