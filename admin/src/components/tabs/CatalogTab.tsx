'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useLoader } from '../../lib/useLoader';
import {
  Clock,
  Flame,
  Layers,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { Product, ProductCategory, Puja, PujaMode, PujaPackage } from '../../lib/types';
import { MODE_LABELS, rupees } from '../../lib/format';
import { ImageField } from '../ImageField';
import {
  Badge,
  Button,
  Card,
  Empty,
  ErrorBox,
  Input,
  Label,
  Modal,
  Select,
  Spinner,
  Textarea,
  Toggle,
  useToast,
} from '../ui';

const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);
const joinLines = (v: string[]) => v.join('\n');

const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'PUJA_KIT', label: 'Puja Kit' },
  { value: 'RUDRAKSHA', label: 'Rudraksha' },
  { value: 'YANTRA', label: 'Yantra' },
  { value: 'SAMAGRI', label: 'Samagri' },
  { value: 'DHOOP', label: 'Dhoop & Diya' },
  { value: 'OTHER', label: 'Other' },
];

const emptyPackage = (name: string): PujaPackage => ({ enabled: true, name, tagline: '', price: 0, features: [] });

const emptyPuja = (): Puja => ({
  slug: '',
  name: '',
  subtitle: '',
  sanskritMantra: '',
  category: '',
  deity: '',
  durationMinutes: 120,
  description: '',
  significance: '',
  items: [],
  suitableOccasions: [],
  occasionTags: [],
  preparationSteps: [],
  whatIsIncluded: { panditServices: '', guidance: '', samagriDetails: '', instructions: '' },
  packages: { panditOnly: emptyPackage('Pandit Ji Only'), withSamagri: emptyPackage('Pandit Ji + Samagri') },
  modes: ['ONLINE', 'AT_HOME'],
  imageUrl: '',
  rating: 5,
  reviewsCount: 0,
  isPopular: false,
  isActive: true,
  sortOrder: 0,
});

const emptyProduct = (): Product => ({
  slug: '',
  name: '',
  tagline: '',
  category: 'PUJA_KIT',
  price: 0,
  originalPrice: 0,
  description: '',
  itemsIncluded: [],
  stockQuantity: 0,
  imageUrl: '',
  badge: '',
  rating: 5,
  reviewsCount: 0,
  isActive: true,
  sortOrder: 0,
});

export function CatalogTab() {
  const [section, setSection] = useState<'pujas' | 'products'>('pujas');
  const [search, setSearch] = useState('');
  const [editingPuja, setEditingPuja] = useState<Puja | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const toast = useToast();

  const fetcher = useCallback(() => Promise.all([adminApi.pujas(), adminApi.products()]), []);
  const { data, error, reload: load } = useLoader(fetcher);
  const pujas = data ? data[0] : null;
  const products = data ? data[1] : null;

  const remove = async (kind: 'puja' | 'product', id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? If it has bookings/orders it will be hidden instead.`)) return;
    try {
      const res = kind === 'puja' ? await adminApi.deletePuja(id) : await adminApi.deleteProduct(id);
      toast.ok(res.message || 'Deleted');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const filteredPujas = useMemo(() => {
    if (!pujas) return [];
    if (!search.trim()) return pujas;
    const q = search.toLowerCase();
    return pujas.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.deity && p.deity.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q))
    );
  }, [pujas, search]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--saffron)] to-amber-600 text-xl font-bold text-white shadow-md">
              ॐ
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[var(--text-primary)]">
              Pujas & Spiritual Store Catalog
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Manage ritual dakshina packages, samagri inclusions, categories, inventory, and pricing.
          </p>
        </div>

        <Button
          variant="primary"
          className="text-xs font-bold py-2.5 px-4 shadow-sm self-start sm:self-auto"
          onClick={() => (section === 'pujas' ? setEditingPuja(emptyPuja()) : setEditingProduct(emptyProduct()))}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add {section === 'pujas' ? 'New Puja Ritual' : 'New Product / Kit'}
        </Button>
      </div>

      {/* Segmented Switcher & Search Bar */}
      <Card className="p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 text-xs font-bold shadow-xs">
            <button
              onClick={() => setSection('pujas')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
                section === 'pujas'
                  ? 'bg-[var(--saffron)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Pujas & Rituals</span>
              <span className={`rounded-full px-2 py-0.2 text-[11px] ${section === 'pujas' ? 'bg-white/25 text-white' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>
                {pujas?.length ?? 0}
              </span>
            </button>
            <button
              onClick={() => setSection('products')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
                section === 'products'
                  ? 'bg-[var(--saffron)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Puja Kits & Samagri</span>
              <span className={`rounded-full px-2 py-0.2 text-[11px] ${section === 'products' ? 'bg-white/25 text-white' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}>
                {products?.length ?? 0}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${section === 'pujas' ? 'pujas, deities...' : 'products, kits...'}`}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] py-2 pl-9 pr-9 text-xs sm:text-sm font-semibold outline-none focus:border-[var(--saffron)] focus:ring-2 focus:ring-[var(--saffron)]/15 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-xs transition"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </Card>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!pujas && !error ? <Spinner /> : null}

      {/* PUJAS LIST SECTION (Responsive 2-4 Column Grid with Images & Badges) */}
      {section === 'pujas' && pujas ? (
        filteredPujas.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredPujas.map((p) => {
              return (
                <Card
                  key={p.id}
                  className="flex flex-col justify-between p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--saffron)] hover:shadow-md"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Thumbnail + Titles + Actions */}
                    <div className="flex items-start gap-3.5">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-2xl border-2 border-[var(--border-color)] object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--saffron)] to-amber-500 text-2xl font-black text-white shadow-sm">
                          ॐ
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                            <Flame className="h-3 w-3 text-[var(--saffron)]" />
                            {p.category || 'Vedic Puja'}
                          </span>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--saffron)] transition"
                              onClick={() => setEditingPuja(p)}
                              title="Edit Puja"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-600 transition"
                              onClick={() => remove('puja', p.id!, p.name)}
                              title="Delete Puja"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="mt-1 font-heading font-bold text-base sm:text-lg text-[var(--text-primary)] leading-snug line-clamp-2">
                          {p.name}
                        </h3>

                        {p.deity ? (
                          <p className="mt-0.5 text-xs font-semibold text-[var(--text-muted)] truncate">
                            देवता: {p.deity}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Metadata Badges: Duration & Modes */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 font-bold text-[var(--text-primary)] shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        {p.durationMinutes} min
                      </span>

                      {p.modes.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 shadow-2xs"
                        >
                          <Video className="h-3 w-3" />
                          {MODE_LABELS[m] || m}
                        </span>
                      ))}
                    </div>

                    {/* Pricing Breakdown Box */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 text-xs shadow-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pandit Ji Dakshina</span>
                        <p className="mt-0.5 font-heading font-black text-base text-[var(--gold)]">
                          {p.packages.panditOnly.enabled ? rupees(p.packages.panditOnly.price) : 'N/A'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">With Samagri Kit</span>
                        <p className="mt-0.5 font-heading font-black text-base text-[var(--saffron)]">
                          {p.packages.withSamagri.enabled ? rupees(p.packages.withSamagri.price) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-green-800 dark:text-green-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Visible in App
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-red-700 dark:text-red-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Hidden
                        </span>
                      )}

                      {p.isPopular ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                          ★ Popular
                        </span>
                      ) : null}
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                      Order #{p.sortOrder}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Empty title="No pujas found" subtitle={search ? `No results for "${search}"` : 'Add the pujas Pandit Ji performs.'} />
        )
      ) : null}

      {/* PRODUCTS LIST SECTION (Responsive 2-4 Column Grid with Images & Stock) */}
      {section === 'products' && products ? (
        filteredProducts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((p) => {
              const categoryLabel = PRODUCT_CATEGORIES.find((c) => c.value === p.category)?.label || p.category;
              const hasDiscount = p.originalPrice > p.price;
              const discountPct = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

              return (
                <Card
                  key={p.id}
                  className="flex flex-col justify-between p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--saffron)] hover:shadow-md"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Thumbnail + Titles + Actions */}
                    <div className="flex items-start gap-3.5">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-18 w-18 shrink-0 rounded-2xl border-2 border-[var(--border-color)] object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                          <Package className="h-8 w-8" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                            {categoryLabel}
                          </span>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--saffron)] transition"
                              onClick={() => setEditingProduct(p)}
                              title="Edit Product"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-600 transition"
                              onClick={() => remove('product', p.id!, p.name)}
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="mt-1 font-heading font-bold text-base sm:text-lg text-[var(--text-primary)] leading-snug line-clamp-2">
                          {p.name}
                        </h3>

                        {p.tagline ? (
                          <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)] truncate">
                            {p.tagline}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Price and Stock Box */}
                    <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 shadow-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Selling Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading font-black text-xl text-[var(--gold)]">
                            {rupees(p.price)}
                          </span>
                          {hasDiscount ? (
                            <>
                              <span className="text-xs text-[var(--text-muted)] line-through">
                                {rupees(p.originalPrice)}
                              </span>
                              <span className="rounded-md bg-green-500/15 px-1.5 py-0.2 text-[10px] font-extrabold text-green-700 dark:text-green-300">
                                {discountPct}% OFF
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Inventory</span>
                        <p className="mt-0.5">
                          {p.stockQuantity === 0 ? (
                            <span className="font-bold text-xs text-red-600 dark:text-red-400">Out of Stock</span>
                          ) : p.stockQuantity <= 5 ? (
                            <span className="font-bold text-xs text-amber-600 dark:text-amber-400">Low Stock ({p.stockQuantity})</span>
                          ) : (
                            <span className="font-bold text-xs text-green-600 dark:text-green-400">{p.stockQuantity} in Stock</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-green-800 dark:text-green-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-red-700 dark:text-red-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Hidden
                        </span>
                      )}

                      {p.badge ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 dark:text-blue-300">
                          {p.badge}
                        </span>
                      ) : null}
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                      Order #{p.sortOrder}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Empty title="No products found" subtitle={search ? `No results for "${search}"` : 'Add puja kits and samagri to sell.'} />
        )
      ) : null}

      {/* Puja Modal Editor */}
      {editingPuja ? (
        <PujaEditor
          initial={editingPuja}
          onClose={() => setEditingPuja(null)}
          onSaved={() => {
            setEditingPuja(null);
            toast.ok('Puja saved');
            load();
          }}
          onError={toast.error}
        />
      ) : null}

      {/* Product Modal Editor */}
      {editingProduct ? (
        <ProductEditor
          initial={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            setEditingProduct(null);
            toast.ok('Product saved');
            load();
          }}
          onError={toast.error}
        />
      ) : null}

      {toast.node}
    </div>
  );
}

function PackageEditor({ title, value, onChange }: { title: string; value: PujaPackage; onChange: (p: PujaPackage) => void }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
        <p className="font-heading font-bold text-sm text-[var(--text-primary)]">{title}</p>
        <Toggle checked={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} label="Enable Package" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Name" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        <Input label="Dakshina / Price (₹)" type="number" min={0} value={value.price} onChange={(e) => onChange({ ...value, price: Number(e.target.value) })} />
        <Input className="sm:col-span-2" label="Tagline" value={value.tagline} onChange={(e) => onChange({ ...value, tagline: e.target.value })} />
        <Textarea className="sm:col-span-2" label="Package Inclusions & Features" hint="(one per line)" value={joinLines(value.features)} onChange={(e) => onChange({ ...value, features: lines(e.target.value) })} />
      </div>
    </div>
  );
}

function PujaEditor({ initial, onClose, onSaved, onError }: { initial: Puja; onClose: () => void; onSaved: () => void; onError: (m: string) => void }) {
  const [p, setP] = useState<Puja>(initial);
  const [text, setText] = useState({
    items: joinLines(initial.items),
    suitableOccasions: joinLines(initial.suitableOccasions),
    occasionTags: initial.occasionTags.join(', '),
    preparationSteps: joinLines(initial.preparationSteps),
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Puja>(k: K, v: Puja[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const toggleMode = (m: PujaMode) => set('modes', p.modes.includes(m) ? p.modes.filter((x) => x !== m) : [...p.modes, m]);

  const save = async () => {
    if (!p.name.trim() || !p.category.trim()) return onError('Name and category are required');
    if (!p.modes.length) return onError('Select at least one mode');
    if (!p.packages.panditOnly.enabled && !p.packages.withSamagri.enabled) return onError('Enable at least one package');
    setSaving(true);
    try {
      await adminApi.savePuja({
        ...p,
        items: lines(text.items),
        suitableOccasions: lines(text.suitableOccasions),
        occasionTags: text.occasionTags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
        preparationSteps: lines(text.preparationSteps),
      });
      onSaved();
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-[var(--saffron)]" />
          <span className="font-heading font-bold text-lg">{p.id ? `Edit ${initial.name}` : 'Add New Puja Ritual'}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} className="font-bold">
            Cancel
          </Button>
          <Button loading={saving} onClick={save} className="font-bold shadow-sm">
            Save Puja Ritual
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Puja Name *" value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Shree Ganesh Puja" />
        <Input label="Category *" value={p.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Ganesh Puja" />
        <Input className="sm:col-span-2" label="Subtitle" value={p.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="Short ritual summary" />
        <Input label="Presiding Deity" value={p.deity} onChange={(e) => set('deity', e.target.value)} placeholder="e.g. Lord Ganesha" />
        <Input label="Duration (minutes) *" type="number" min={15} max={720} value={p.durationMinutes} onChange={(e) => set('durationMinutes', Number(e.target.value))} />
        <Input className="sm:col-span-2" label="Sacred Sanskrit Mantra" value={p.sanskritMantra} onChange={(e) => set('sanskritMantra', e.target.value)} placeholder="ॐ गं गणपतये नमः" />
        <div className="sm:col-span-2">
          <ImageField label="Puja Deity Banner / Image" hint="(recommended 16:9 banner)" value={p.imageUrl} onChange={(v) => set('imageUrl', v)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Ritual Modes Available *</Label>
          <div className="flex flex-wrap gap-4 mt-1.5">
            {(['ONLINE', 'AT_HOME', 'AT_TEMPLE'] as PujaMode[]).map((m) => (
              <Toggle key={m} checked={p.modes.includes(m)} onChange={() => toggleMode(m)} label={MODE_LABELS[m]} />
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <PackageEditor title="Package 1 — Pandit Ji Dakshina Only" value={p.packages.panditOnly} onChange={(v) => set('packages', { ...p.packages, panditOnly: v })} />
        </div>
        <div className="sm:col-span-2">
          <PackageEditor title="Package 2 — Pandit Ji Dakshina + Complete Samagri Kit" value={p.packages.withSamagri} onChange={(v) => set('packages', { ...p.packages, withSamagri: v })} />
        </div>
        <Textarea className="sm:col-span-2" label="Description" value={p.description} onChange={(e) => set('description', e.target.value)} />
        <Textarea className="sm:col-span-2" label="Spiritual Significance" value={p.significance} onChange={(e) => set('significance', e.target.value)} />
        <Textarea label="Vidhi Steps" hint="(one per line)" value={text.items} onChange={(e) => setText({ ...text, items: e.target.value })} />
        <Textarea label="Auspicious Occasions" hint="(one per line)" value={text.suitableOccasions} onChange={(e) => setText({ ...text, suitableOccasions: e.target.value })} />
        <Textarea label="Yajman Preparation Steps" hint="(one per line)" value={text.preparationSteps} onChange={(e) => setText({ ...text, preparationSteps: e.target.value })} />
        <Input label="Search Tags" hint="(comma separated)" value={text.occasionTags} onChange={(e) => setText({ ...text, occasionTags: e.target.value })} />
        <Input label="Pandit Services Included" value={p.whatIsIncluded.panditServices} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, panditServices: e.target.value })} />
        <Input label="Spiritual Guidance" value={p.whatIsIncluded.guidance} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, guidance: e.target.value })} />
        <Input label="Samagri Details Included" value={p.whatIsIncluded.samagriDetails} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, samagriDetails: e.target.value })} />
        <Input label="Instructions" value={p.whatIsIncluded.instructions} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, instructions: e.target.value })} />
        <Input label="Catalog Sort Order" type="number" value={p.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        <div className="flex items-end gap-6 sm:col-span-2">
          <Toggle checked={p.isActive} onChange={(v) => set('isActive', v)} label="Visible in Mobile App" />
          <Toggle checked={p.isPopular} onChange={(v) => set('isPopular', v)} label="Mark as Featured / Popular" />
        </div>
      </div>
    </Modal>
  );
}

function ProductEditor({ initial, onClose, onSaved, onError }: { initial: Product; onClose: () => void; onSaved: () => void; onError: (m: string) => void }) {
  const [p, setP] = useState<Product>(initial);
  const [items, setItems] = useState(joinLines(initial.itemsIncluded));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!p.name.trim()) return onError('Name is required');
    if (p.price <= 0) return onError('Price must be more than 0');
    setSaving(true);
    try {
      await adminApi.saveProduct({ ...p, itemsIncluded: lines(items) });
      onSaved();
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span className="font-heading font-bold text-lg">{p.id ? `Edit ${initial.name}` : 'Add New Product'}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} className="font-bold">
            Cancel
          </Button>
          <Button loading={saving} onClick={save} className="font-bold shadow-sm">
            Save Product
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input className="sm:col-span-2" label="Product Name *" value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Complete Ganesh Puja Kit" />
        <Input className="sm:col-span-2" label="Tagline" value={p.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. 32 pure organic samagri items" />
        <Select label="Category" value={p.category} onChange={(e) => set('category', e.target.value as ProductCategory)} options={PRODUCT_CATEGORIES} />
        <Input label="Badge / Ribbon" hint="(e.g. Bestseller, Pure)" value={p.badge} onChange={(e) => set('badge', e.target.value)} />
        <Input label="Selling Price (₹) *" type="number" min={0} value={p.price} onChange={(e) => set('price', Number(e.target.value))} />
        <Input label="MRP / Original Price (₹)" type="number" min={0} value={p.originalPrice} onChange={(e) => set('originalPrice', Number(e.target.value))} />
        <Input label="Stock Quantity in Warehouse *" type="number" min={0} value={p.stockQuantity} onChange={(e) => set('stockQuantity', Number(e.target.value))} />
        <Input label="Sort Order" type="number" value={p.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        <div className="sm:col-span-2">
          <ImageField label="Product Photo" hint="(square photo recommended)" aspect="aspect-square" value={p.imageUrl} onChange={(v) => set('imageUrl', v)} />
        </div>
        <Textarea className="sm:col-span-2" label="Description" value={p.description} onChange={(e) => set('description', e.target.value)} />
        <Textarea className="sm:col-span-2" label="Items Included in Package" hint="(one per line)" value={items} onChange={(e) => setItems(e.target.value)} />
        <div className="sm:col-span-2">
          <Toggle checked={p.isActive} onChange={(v) => set('isActive', v)} label="Visible in Mobile App Spiritual Store" />
        </div>
      </div>
    </Modal>
  );
}
