import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ArrowRight, ShoppingBag, Truck } from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { PujaSearchBar } from '../components/puja/PujaSearchBar';
import { PujaCategoryChips } from '../components/puja/PujaCategoryChips';
import { ProductCard } from '../components/store/ProductCard';
import { ProductSheet } from '../components/store/ProductSheet';
import { Button, EmptyState } from '../components/ui';
import { THEME } from '../constants/theme';
import { RADIUS, SPACE, TYPE } from '../constants/ui';
import { useAppData } from '../context/AppDataContext';
import { useCart, MAX_QTY_PER_ITEM } from '../context/CartContext';
import type { PujaKit } from '../data/mockData';
import { rupees } from '../utils/format';

interface StoreScreenProps {
  onOpenCart: () => void;
  onNotificationPress?: () => void;
}

const GUTTER = SPACE.lg;
const GAP = SPACE.md;

export const StoreScreen: React.FC<StoreScreenProps> = ({ onOpenCart, onNotificationPress }) => {
  const { kits, loading, error, refresh, settings } = useAppData();
  const cart = useCart();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState('All Items');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PujaKit | null>(null);

  const columns = width >= 700 ? 3 : 2;
  const cardWidth = Math.floor((width - GUTTER * 2 - GAP * (columns - 1)) / columns);

  const categories = useMemo(
    () => ['All Items', ...Array.from(new Set(kits.map((k) => k.category).filter((c): c is string => Boolean(c))))],
    [kits]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return kits.filter((k) => {
      if (category !== 'All Items' && k.category !== category) return false;
      if (!q) return true;
      return [k.name, k.tagline, k.category, k.description].some((v) => v?.toLowerCase().includes(q));
    });
  }, [kits, category, query]);

  const quantityOf = (id: string) => cart.lines.find((l) => l.kit.id === id)?.quantity ?? 0;

  const add = (kit: PujaKit) => {
    if (!cart.add(kit)) Alert.alert('Limit reached', `You can order up to ${Math.min(MAX_QTY_PER_ITEM, kit.stockQuantity)} of this item.`);
  };

  const changeQuantity = (kit: PujaKit, quantity: number) => cart.setQuantity(kit.id, quantity);

  const deliveryNote = settings
    ? settings.deliveryCharge === 0
      ? 'Free delivery on all orders'
      : `Free delivery above ${rupees(settings.freeDeliveryAbove)}`
    : 'Delivered to your home';

  const header = (
    <View>
      <View style={styles.bleed}>
        <PujaSearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} placeholder="Search kits, rudraksha, yantras" />
        <PujaCategoryChips categories={categories} selectedCategory={category} onSelectCategory={setCategory} />
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.count}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </Text>
        <View style={styles.delivery}>
          <Truck size={13} color={THEME.colors.bilvaGreen} />
          <Text style={styles.deliveryText}>{deliveryNote}</Text>
        </View>
      </View>
    </View>
  );

  const empty = loading && !kits.length ? (
    <ActivityIndicator color={THEME.colors.primarySaffron} style={styles.loader} />
  ) : error && !kits.length ? (
    <EmptyState title="Could not load the store" subtitle={error} action={<Button title="Retry" onPress={refresh} />} />
  ) : (
    <EmptyState title="No items found" subtitle="Try another search or category." />
  );

  return (
    <AppBackground variant="golden">
      <AppHeader title="Puja Kits & Samagri" subtitle="Everything for your puja, delivered home" onNotificationPress={onNotificationPress} />
      <FlatList
        key={columns}
        data={filtered}
        keyExtractor={(k) => k.id}
        numColumns={columns}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[styles.list, cart.count > 0 && styles.listWithCart]}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading && kits.length > 0} onRefresh={refresh} />}
        renderItem={({ item, index }) => (
          <ProductCard
            kit={item}
            index={index}
            width={cardWidth}
            quantity={quantityOf(item.id)}
            onOpen={setSelected}
            onAdd={add}
            onChangeQuantity={changeQuantity}
          />
        )}
      />

      {cart.count > 0 ? (
        <TouchableOpacity style={styles.cartBar} activeOpacity={0.9} onPress={onOpenCart} accessibilityLabel="View cart">
          <View style={styles.cartIcon}>
            <ShoppingBag size={18} color="#FFFFFF" />
          </View>
          <View style={styles.cartText}>
            <Text style={styles.cartCount}>
              {cart.count} {cart.count === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.cartTotal}>{rupees(cart.subtotal)}</Text>
          </View>
          <Text style={styles.cartCta}>View cart</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      <ProductSheet
        kit={selected}
        quantity={selected ? quantityOf(selected.id) : 0}
        onClose={() => setSelected(null)}
        onAdd={add}
        onOpenCart={onOpenCart}
      />
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: GUTTER, paddingBottom: SPACE.xxl },
  listWithCart: { paddingBottom: 96 },
  column: { gap: GAP },
  bleed: { marginHorizontal: -GUTTER },
  loader: { marginTop: 48 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACE.md, marginTop: SPACE.xs },
  count: TYPE.caption,
  delivery: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  deliveryText: { fontSize: 12, fontWeight: '600', color: THEME.colors.bilvaGreen },
  cartBar: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    bottom: 12,
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.colors.primarySaffron,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cartIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  cartText: { flex: 1 },
  cartCount: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  cartTotal: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  cartCta: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
