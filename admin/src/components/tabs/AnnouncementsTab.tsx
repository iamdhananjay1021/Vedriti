'use client';

import React, { useCallback, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Flame,
  Plus,
  Radio,
  RefreshCw,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { AnnouncementItem } from '../../lib/types';
import { useLoader } from '../../lib/useLoader';
import { formatDate } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Input, Modal, Select, Spinner, Textarea, Toggle, useToast } from '../ui';

const CATEGORIES = [
  { value: 'FESTIVAL', label: 'Festivals & Vrats (पर्व व व्रत)' },
  { value: 'PUJA_ALERT', label: 'Auspicious Puja Booking (अनुष्ठान सूचना)' },
  { value: 'MUHURAT', label: 'Special Muhurat (विशेष मुहूर्त)' },
  { value: 'TEMPLE_NOTICE', label: 'Temple & Darshan Notice (मंदिर सूचना)' },
];

const PRIORITIES = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High Priority (Prominent Banner)' },
  { value: 'URGENT', label: 'Urgent Alert' },
];

const ACTIONS = [
  { value: 'NONE', label: 'No Action (Notice Only)' },
  { value: 'PUJAS', label: 'Link to Pujas Catalog' },
  { value: 'STORE', label: 'Link to Puja Kit Store' },
  { value: 'KUNDLI', label: 'Link to Kundli Request' },
];

export function AnnouncementsTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    message: '',
    category: 'FESTIVAL' as AnnouncementItem['category'],
    priority: 'NORMAL' as AnnouncementItem['priority'],
    actionType: 'NONE' as AnnouncementItem['actionType'],
    actionRef: '',
    actionLabel: 'Book Puja Now',
    startsOn: '',
    endsOn: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetcher = useCallback(() => adminApi.announcements(), []);
  const { data: list, error, reload: load } = useLoader(fetcher);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      message: '',
      category: 'FESTIVAL',
      priority: 'NORMAL',
      actionType: 'PUJAS',
      actionRef: '',
      actionLabel: 'Book Puja Now',
      startsOn: new Date().toISOString().slice(0, 10),
      endsOn: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      message: item.message,
      category: item.category,
      priority: item.priority,
      actionType: item.actionType,
      actionRef: item.actionRef || '',
      actionLabel: item.actionLabel || 'Book Puja Now',
      startsOn: item.startsOn || '',
      endsOn: item.endsOn || '',
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveAnnouncement({
        ...(editingItem ? { id: editingItem._id || editingItem.id } : {}),
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        priority: form.priority,
        actionType: form.actionType,
        actionRef: form.actionRef.trim(),
        actionLabel: form.actionLabel.trim(),
        startsOn: form.startsOn,
        endsOn: form.endsOn,
        isActive: form.isActive,
      });
      toast.ok(editingItem ? 'Announcement updated' : 'Announcement broadcasted');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AnnouncementItem) => {
    const id = item._id || item.id!;
    if (!window.confirm(`Delete announcement "${item.title}"?`)) return;
    try {
      await adminApi.deleteAnnouncement(id);
      toast.ok('Announcement removed');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleToggleActive = async (item: AnnouncementItem) => {
    const id = item._id || item.id!;
    try {
      await adminApi.saveAnnouncement({ id, isActive: !item.isActive });
      toast.ok(`Broadcast ${!item.isActive ? 'resumed' : 'paused'}`);
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
              Temple Broadcasts & Festival Push Alerts
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Send auspicious festival notices, Somwar Pradosh alerts, and special muhurats to all devotee mobile apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal} className="text-xs py-2.5 font-bold shadow-md">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Broadcast
          </Button>

          <Button variant="outline" onClick={load} className="text-xs py-2.5 font-bold shadow-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!list && !error ? <Spinner /> : null}
      {list && !list.length ? <Empty title="No broadcasts or announcements found" /> : null}

      {/* Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {list?.map((item) => (
          <Card key={item.title} className="flex flex-col justify-between p-5 sm:p-6 shadow-sm rounded-2xl hover:border-[var(--saffron)] hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--saffron-light)] text-[var(--saffron)]">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <Badge tone={item.priority === 'HIGH' || item.priority === 'URGENT' ? 'amber' : 'gray'}>
                      {item.category}
                    </Badge>
                  </div>
                </div>

                <Badge tone={item.isActive ? 'green' : 'gray'}>
                  {item.isActive ? 'Broadcasting' : 'Paused'}
                </Badge>
              </div>

              <h3 className="mt-3 font-extrabold text-sm text-[var(--text-primary)]">{item.title}</h3>
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                {item.message}
              </p>

              {item.actionType !== 'NONE' ? (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-2.5 py-1 text-xs font-bold text-[var(--saffron)]">
                  <ExternalLink className="h-3 w-3" />
                  Action: {item.actionLabel} ({item.actionType})
                </div>
              ) : null}

              {item.startsOn || item.endsOn ? (
                <div className="mt-3 flex items-center gap-2 border-t border-[var(--border-color)] pt-2.5 text-[11px] text-[var(--text-muted)] font-medium">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Schedule: {item.startsOn ? formatDate(item.startsOn) : 'Immediate'}
                    {item.endsOn ? ` to ${formatDate(item.endsOn)}` : ''}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => openEditModal(item)}
                className="text-xs py-1.5 font-bold"
              >
                Edit
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleToggleActive(item)}
                  className="text-xs py-1.5 font-bold"
                >
                  {item.isActive ? 'Pause' : 'Broadcast'}
                </Button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1.5 text-red-600 hover:text-red-800 transition"
                  title="Delete announcement"
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
          title={editingItem ? 'Edit Broadcast Announcement' : 'Create Festival & Temple Broadcast'}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="font-bold">
                Cancel
              </Button>
              <Button form="broadcast-form" type="submit" loading={saving} className="font-bold shadow-md">
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {editingItem ? 'Update Broadcast' : 'Broadcast to Devotees'}
              </Button>
            </>
          }
        >
          <form id="broadcast-form" onSubmit={handleSave} className="space-y-3.5">
            <Input
              label="Broadcast Headline / Title"
              placeholder="e.g. कल सोम प्रदोष व्रत - रुद्राभिषेक विशेष मुहूर्त"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <Textarea
              label="Notice Message (Displayed in App)"
              placeholder="Write the auspicious date, significance, and rituals guidance for devotees..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              required
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementItem['category'] })}
                options={CATEGORIES}
              />

              <Select
                label="Priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementItem['priority'] })}
                options={PRIORITIES}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Devotee Tap Action"
                value={form.actionType}
                onChange={(e) => setForm({ ...form, actionType: e.target.value as AnnouncementItem['actionType'] })}
                options={ACTIONS}
              />

              <Input
                label="Button Label"
                placeholder="e.g. Book Special Puja"
                value={form.actionLabel}
                onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Starts On (YYYY-MM-DD)"
                type="date"
                value={form.startsOn}
                onChange={(e) => setForm({ ...form, startsOn: e.target.value })}
              />

              <Input
                label="Expires On (Optional)"
                type="date"
                value={form.endsOn}
                onChange={(e) => setForm({ ...form, endsOn: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <Toggle
                label="Active & Broadcasting Now"
                checked={form.isActive}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </form>
        </Modal>
      ) : null}

      {toast.node}
    </div>
  );
}

