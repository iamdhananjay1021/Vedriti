'use client';

import React, { useCallback, useState } from 'react';
import { useLoader } from '../../lib/useLoader';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi, errorMessage } from '../../lib/api';
import type { Product, ProductCategory, Puja, PujaMode, PujaPackage } from '../../lib/types';
import { MODE_LABELS, rupees } from '../../lib/format';
import { ImageField } from '../ImageField';
import { Badge, Button, Card, Empty, ErrorBox, Input, Label, Modal, Select, Spinner, Textarea, Toggle, useToast } from '../ui';

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={section === 'pujas' ? 'primary' : 'outline'} onClick={() => setSection('pujas')}>
          Pujas ({pujas?.length ?? 0})
        </Button>
        <Button variant={section === 'products' ? 'primary' : 'outline'} onClick={() => setSection('products')}>
          Puja Kits & Products ({products?.length ?? 0})
        </Button>
        <Button
          variant="outline"
          className="ml-auto"
          onClick={() => (section === 'pujas' ? setEditingPuja(emptyPuja()) : setEditingProduct(emptyProduct()))}
        >
          <Plus className="h-4 w-4" /> Add {section === 'pujas' ? 'puja' : 'product'}
        </Button>
      </div>

      {error ? <ErrorBox message={error} onRetry={load} /> : null}
      {!pujas && !error ? <Spinner /> : null}

      {section === 'pujas' && pujas ? (
        pujas.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {pujas.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {p.category} • {p.durationMinutes} min • {p.modes.map((m) => MODE_LABELS[m]).join(', ')}
                    </p>
                    <p className="mt-1 text-sm">
                      {p.packages.panditOnly.enabled ? `${rupees(p.packages.panditOnly.price)} ` : ''}
                      {p.packages.withSamagri.enabled ? `/ ${rupees(p.packages.withSamagri.price)} with samagri` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="rounded p-1.5 hover:bg-[var(--bg-hover)]" onClick={() => setEditingPuja(p)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1.5 hover:bg-[var(--bg-hover)]" onClick={() => remove('puja', p.id!, p.name)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-[var(--red)]" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {p.isActive ? <Badge tone="green">Visible</Badge> : <Badge tone="red">Hidden</Badge>}
                  {p.isPopular ? <Badge tone="amber">Popular</Badge> : null}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty title="No pujas yet" subtitle="Add the pujas Pandit Ji performs." />
        )
      ) : null}

      {section === 'products' && products ? (
        products.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {products.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {PRODUCT_CATEGORIES.find((c) => c.value === p.category)?.label} • Stock {p.stockQuantity}
                    </p>
                    <p className="mt-1 text-sm">{rupees(p.price)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="rounded p-1.5 hover:bg-[var(--bg-hover)]" onClick={() => setEditingProduct(p)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1.5 hover:bg-[var(--bg-hover)]" onClick={() => remove('product', p.id!, p.name)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-[var(--red)]" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {p.isActive ? <Badge tone="green">Visible</Badge> : <Badge tone="red">Hidden</Badge>}
                  {p.stockQuantity === 0 ? <Badge tone="red">Out of stock</Badge> : p.stockQuantity <= 5 ? <Badge tone="amber">Low stock</Badge> : null}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty title="No products yet" subtitle="Add puja kits and samagri to sell." />
        )
      ) : null}

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
    <div className="rounded-lg border border-[var(--border-color)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <Toggle checked={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} label="Offer" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input label="Name" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        <Input label="Price (₹)" type="number" min={0} value={value.price} onChange={(e) => onChange({ ...value, price: Number(e.target.value) })} />
        <Input className="sm:col-span-2" label="Tagline" value={value.tagline} onChange={(e) => onChange({ ...value, tagline: e.target.value })} />
        <Textarea className="sm:col-span-2" label="Features" hint="(one per line)" value={joinLines(value.features)} onChange={(e) => onChange({ ...value, features: lines(e.target.value) })} />
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
      title={p.id ? `Edit ${initial.name}` : 'Add puja'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Name *" value={p.name} onChange={(e) => set('name', e.target.value)} />
        <Input label="Category *" value={p.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Ganesh Puja" />
        <Input className="sm:col-span-2" label="Subtitle" value={p.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
        <Input label="Deity" value={p.deity} onChange={(e) => set('deity', e.target.value)} />
        <Input label="Duration (minutes) *" type="number" min={15} max={720} value={p.durationMinutes} onChange={(e) => set('durationMinutes', Number(e.target.value))} />
        <Input className="sm:col-span-2" label="Mantra" value={p.sanskritMantra} onChange={(e) => set('sanskritMantra', e.target.value)} />
        <div className="sm:col-span-2">
          <ImageField label="Puja image" hint="(optional)" value={p.imageUrl} onChange={(v) => set('imageUrl', v)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Modes *</Label>
          <div className="flex flex-wrap gap-4">
            {(['ONLINE', 'AT_HOME', 'AT_TEMPLE'] as PujaMode[]).map((m) => (
              <Toggle key={m} checked={p.modes.includes(m)} onChange={() => toggleMode(m)} label={MODE_LABELS[m]} />
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <PackageEditor title="Package 1 — Pandit Ji only" value={p.packages.panditOnly} onChange={(v) => set('packages', { ...p.packages, panditOnly: v })} />
        </div>
        <div className="sm:col-span-2">
          <PackageEditor title="Package 2 — With samagri" value={p.packages.withSamagri} onChange={(v) => set('packages', { ...p.packages, withSamagri: v })} />
        </div>
        <Textarea className="sm:col-span-2" label="Description" value={p.description} onChange={(e) => set('description', e.target.value)} />
        <Textarea className="sm:col-span-2" label="Significance" value={p.significance} onChange={(e) => set('significance', e.target.value)} />
        <Textarea label="Vidhi steps" hint="(one per line)" value={text.items} onChange={(e) => setText({ ...text, items: e.target.value })} />
        <Textarea label="Suitable occasions" hint="(one per line)" value={text.suitableOccasions} onChange={(e) => setText({ ...text, suitableOccasions: e.target.value })} />
        <Textarea label="Preparation steps" hint="(one per line)" value={text.preparationSteps} onChange={(e) => setText({ ...text, preparationSteps: e.target.value })} />
        <Input label="Search tags" hint="(comma separated)" value={text.occasionTags} onChange={(e) => setText({ ...text, occasionTags: e.target.value })} />
        <Input label="Pandit services" value={p.whatIsIncluded.panditServices} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, panditServices: e.target.value })} />
        <Input label="Guidance" value={p.whatIsIncluded.guidance} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, guidance: e.target.value })} />
        <Input label="Samagri details" value={p.whatIsIncluded.samagriDetails} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, samagriDetails: e.target.value })} />
        <Input label="Instructions" value={p.whatIsIncluded.instructions} onChange={(e) => set('whatIsIncluded', { ...p.whatIsIncluded, instructions: e.target.value })} />
        <Input label="Sort order" type="number" value={p.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        <div className="flex items-end gap-4">
          <Toggle checked={p.isActive} onChange={(v) => set('isActive', v)} label="Visible in app" />
          <Toggle checked={p.isPopular} onChange={(v) => set('isPopular', v)} label="Popular" />
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
      title={p.id ? `Edit ${initial.name}` : 'Add product'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input className="sm:col-span-2" label="Name *" value={p.name} onChange={(e) => set('name', e.target.value)} />
        <Input className="sm:col-span-2" label="Tagline" value={p.tagline} onChange={(e) => set('tagline', e.target.value)} />
        <Select label="Category" value={p.category} onChange={(e) => set('category', e.target.value as ProductCategory)} options={PRODUCT_CATEGORIES} />
        <Input label="Badge" hint="(optional)" value={p.badge} onChange={(e) => set('badge', e.target.value)} />
        <Input label="Price (₹) *" type="number" min={0} value={p.price} onChange={(e) => set('price', Number(e.target.value))} />
        <Input label="MRP (₹)" type="number" min={0} value={p.originalPrice} onChange={(e) => set('originalPrice', Number(e.target.value))} />
        <Input label="Stock quantity *" type="number" min={0} value={p.stockQuantity} onChange={(e) => set('stockQuantity', Number(e.target.value))} />
        <Input label="Sort order" type="number" value={p.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        <div className="sm:col-span-2">
          <ImageField label="Product image" hint="(square photo works best)" aspect="aspect-square" value={p.imageUrl} onChange={(v) => set('imageUrl', v)} />
        </div>
        <Textarea className="sm:col-span-2" label="Description" value={p.description} onChange={(e) => set('description', e.target.value)} />
        <Textarea className="sm:col-span-2" label="Items included" hint="(one per line)" value={items} onChange={(e) => setItems(e.target.value)} />
        <Toggle checked={p.isActive} onChange={(v) => set('isActive', v)} label="Visible in app" />
      </div>
    </Modal>
  );
}
