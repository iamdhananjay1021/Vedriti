'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Sparkles,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  Package,
  Flame,
  Check,
} from 'lucide-react';
import { AdminCatalogItem } from '../types/admin';

interface CatalogTabProps {
  catalog: AdminCatalogItem[];
  onAddCatalogItem: (item: AdminCatalogItem) => void;
  onUpdateCatalogItem: (item: AdminCatalogItem) => void;
  onDeleteCatalogItem: (id: string) => void;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  catalog,
  onAddCatalogItem,
  onUpdateCatalogItem,
  onDeleteCatalogItem,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'puja' | 'product'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminCatalogItem | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<AdminCatalogItem>>({
    title: '',
    category: 'Shiva Pujas',
    price: 2100,
    originalPrice: 2800,
    stock: 50,
    type: 'puja',
    badge: 'Festive Special',
    certified: true,
  });

  const filteredCatalog = catalog.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const handleAdjustStock = (item: AdminCatalogItem, delta: number) => {
    const nextStock = Math.max(0, item.stock + delta);
    onUpdateCatalogItem({ ...item, stock: nextStock });
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Shiva Pujas',
      price: 2100,
      originalPrice: 2800,
      stock: 50,
      type: 'puja',
      badge: 'Festive Special',
      certified: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: AdminCatalogItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingItem) {
      onUpdateCatalogItem({
        ...editingItem,
        title: formData.title || editingItem.title,
        category: formData.category || editingItem.category,
        price: Number(formData.price) || editingItem.price,
        originalPrice: Number(formData.originalPrice) || editingItem.originalPrice,
        stock: Number(formData.stock) || editingItem.stock,
        type: (formData.type as 'puja' | 'product') || editingItem.type,
        badge: formData.badge || editingItem.badge,
        certified: formData.certified ?? editingItem.certified,
      });
    } else {
      const newItem: AdminCatalogItem = {
        id: `cat-${Date.now()}`,
        title: formData.title || 'New Item',
        category: formData.category || 'Vedic Services',
        price: Number(formData.price) || 999,
        originalPrice: Number(formData.originalPrice) || 1499,
        stock: Number(formData.stock) || 20,
        rating: 5.0,
        certified: formData.certified ?? true,
        type: (formData.type as 'puja' | 'product') || 'puja',
        badge: formData.badge,
      };
      onAddCatalogItem(newItem);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter, Search & Add Button */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Type Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'all' ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: typeFilter === 'all' ? 'var(--saffron)' : 'var(--bg-hover)',
              color: typeFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            All Items ({catalog.length})
          </button>
          <button
            onClick={() => setTypeFilter('puja')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'puja' ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: typeFilter === 'puja' ? 'var(--saffron)' : 'var(--bg-hover)',
              color: typeFilter === 'puja' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            Pujas & Hawans
          </button>
          <button
            onClick={() => setTypeFilter('product')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 'product' ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: typeFilter === 'product' ? 'var(--saffron)' : 'var(--bg-hover)',
              color: typeFilter === 'product' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            Spiritual Store Samagri
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border w-full md:w-60"
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
              placeholder="Search catalog..."
              className="w-full text-xs bg-transparent focus:outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* Add Item Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white cursor-pointer hover:opacity-90 shrink-0"
            style={{ backgroundColor: 'var(--saffron)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Catalog Item
          </button>
        </div>
      </div>

      {/* Catalog Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border flex flex-col justify-between transition-all hover:border-amber-600/40"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div>
              {/* Badge & Type */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: item.type === 'puja' ? 'var(--saffron-light)' : 'rgba(37, 99, 235, 0.08)',
                    color: item.type === 'puja' ? 'var(--saffron)' : '#2563EB',
                  }}
                >
                  {item.type === 'puja' ? <Flame className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                  {item.type === 'puja' ? 'Vedic Puja' : 'Consecrated Samagri'}
                </span>

                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Title & Category */}
              <h3 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {item.category}
              </span>

              {/* Price & Rating */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  ₹{item.price}
                </span>
                {item.originalPrice && (
                  <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                    ₹{item.originalPrice}
                  </span>
                )}
                {item.certified && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Certified
                  </span>
                )}
              </div>
            </div>

            {/* Bottom: Stock adjuster & Edit / Delete */}
            <div className="pt-4 mt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  Slots / Stock:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustStock(item, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold border hover:opacity-75"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    -
                  </button>
                  <span className="text-xs font-bold px-1" style={{ color: 'var(--text-primary)' }}>
                    {item.stock}
                  </span>
                  <button
                    onClick={() => handleAdjustStock(item, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold border hover:opacity-75"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 rounded-lg border hover:opacity-75 transition-opacity"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteCatalogItem(item.id)}
                  className="p-1.5 rounded-lg border hover:opacity-75 transition-opacity text-red-500 border-red-200 dark:border-red-900/50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingItem ? 'Edit Catalog Item' : 'Add New Vedic Item'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:opacity-75"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="py-4 space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. महा मृत्युंजय अनुष्ठान"
                  className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'puja' | 'product' })}
                    className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="puja">Puja / Hawan</option>
                    <option value="product">Spiritual Product</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Shiva Pujas, Yantras"
                    className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Stock / Slots
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Festive Special, Most Popular"
                  className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: 'var(--saffron)' }}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
