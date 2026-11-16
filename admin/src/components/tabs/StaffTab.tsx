'use client';

import React, { useCallback, useState } from 'react';
import {
  CheckCircle2,
  Phone,
  RefreshCw,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { StaffMember } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDateTime } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Select, Spinner, Toggle, useToast } from '../ui';

const ROLES = [
  { value: 'super_admin', label: 'Super Admin (Full Access)' },
  { value: 'admin', label: 'Admin (Operations & Bookings)' },
  { value: 'astrologer', label: 'Astrologer / Pandit Ji (Kundli & Rituals)' },
  { value: 'store_manager', label: 'Store Manager (Kit Orders & Inventory)' },
];

const ROLE_BADGES: Record<string, { label: string; tone: 'amber' | 'green' | 'blue' | 'gray' }> = {
  super_admin: { label: 'Super Admin', tone: 'amber' },
  admin: { label: 'Admin', tone: 'green' },
  astrologer: { label: 'Astrologer', tone: 'blue' },
  store_manager: { label: 'Store Manager', tone: 'gray' },
};

export function StaffTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin' as StaffMember['role'],
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetcher = useCallback(() => adminApi.staff(), []);
  const { data: staffList, error, reload: load } = useLoader(fetcher);

  const openCreateModal = () => {
    setEditingStaff(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'admin',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setForm({
      name: staff.name || '',
      email: staff.email,
      phone: staff.phone || '',
      password: '',
      role: staff.role,
      isActive: staff.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStaff) {
        const id = String(editingStaff._id || editingStaff.id || '');
        if (!id) throw new Error('Staff ID missing');
        await adminApi.updateStaff(id, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          role: form.role,
          isActive: form.isActive,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        });
        toast.ok('Staff member updated');
      } else {
        await adminApi.createStaff({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password.trim(),
          role: form.role,
          isActive: form.isActive,
        });
        toast.ok('New staff member added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (staff: StaffMember) => {
    const id = String(staff._id || staff.id || '');
    if (!id) return;
    if (!window.confirm(`Are you sure you want to remove staff member "${staff.email}"?`)) return;
    try {
      await adminApi.deleteStaff(id);
      toast.ok('Staff member removed');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleToggleActive = async (staff: StaffMember) => {
    const id = String(staff._id || staff.id || '');
    if (!id) return;
    try {
      await adminApi.updateStaff(id, { isActive: !staff.isActive });
      toast.ok(`Staff member ${!staff.isActive ? 'activated' : 'deactivated'}`);
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
              Admin Team & Role-Based Access Control
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Manage Pandit Ji admins, astrologers, and order dispatch staff credentials and permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal} className="text-xs py-2.5 font-bold shadow-md">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Add Team Member
          </Button>

          <Button variant="outline" onClick={load} className="text-xs py-2.5 font-bold shadow-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!staffList && !error ? <Spinner /> : null}
      {staffList && !staffList.length ? <Empty title="No staff members found" /> : null}

      {/* Staff Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {staffList?.map((member) => {
          const roleBadge = ROLE_BADGES[member.role] || { label: member.role, tone: 'gray' as const };
          const cardKey = member._id || member.id || member.email;

          return (
            <Card key={cardKey} className="flex flex-col justify-between p-5 sm:p-6 shadow-sm rounded-2xl hover:border-[var(--saffron)] hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--saffron-light)] font-bold text-[var(--saffron)] text-base">
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                        {member.name || 'Staff Member'}
                      </h3>
                      <p className="text-xs font-medium text-[var(--text-secondary)]">{member.email}</p>
                    </div>
                  </div>

                  <Badge tone={roleBadge.tone}>{roleBadge.label}</Badge>
                </div>

                <div className="mt-3.5 space-y-1.5 border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-secondary)]">
                  {member.phone ? (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-[var(--text-muted)]" />
                      <span>{member.phone}</span>
                    </p>
                  ) : null}
                  <p className="flex items-center gap-1.5 font-medium">
                    <span className="text-[var(--text-muted)]">Status:</span>
                    {member.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </p>
                  {member.lastLoginAt ? (
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Last Login: {formatDateTime(member.lastLoginAt)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openEditModal(member)}
                  className="text-xs py-1.5 font-bold"
                >
                  Edit / Role
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleToggleActive(member)}
                    className={`text-xs py-1.5 font-bold ${
                      member.isActive ? 'text-amber-700 hover:text-amber-800' : 'text-green-700 hover:text-green-800'
                    }`}
                  >
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleDelete(member)}
                    className="p-1.5 text-red-600 hover:text-red-800 transition"
                    title="Remove staff member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Staff Modal */}
      {modalOpen ? (
        <Modal
          open
          onClose={() => setModalOpen(false)}
          title={editingStaff ? `Edit Staff: ${editingStaff.email}` : 'Add New Admin / Staff Member'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Acharya Ramanand Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="acharya.ramanand@vedrit.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!editingStaff}
              required
            />

            <Input
              label="Contact Mobile"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <Input
              label={editingStaff ? 'New Password (leave blank to keep unchanged)' : 'Login Password'}
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingStaff}
            />

            <Select
              label="Staff Role & Permissions"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as StaffMember['role'] })}
              options={ROLES}
            />

            <div className="pt-2">
              <Toggle
                label="Account Active (allowed to login)"
                checked={form.isActive}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="font-bold">
                Cancel
              </Button>
              <Button type="submit" loading={saving} className="font-bold shadow-md">
                {editingStaff ? 'Update Member' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {toast.node}
    </div>
  );
}
