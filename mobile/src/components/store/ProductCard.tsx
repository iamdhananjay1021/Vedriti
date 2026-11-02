import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS } from '../../constants/ui';
import { ProductImage } from '../common/ProductImage';
import type { PujaKit } from '../../data/mockData';
import { rupees } from '../../utils/format';

interface Props {
  kit: PujaKit;
  width: number;
  index: number;
  quantity: number;
  onOpen: (kit: PujaKit) => void;
  onAdd: (kit: PujaKit) => void;
  onChangeQuantity: (kit: PujaKit, quantity: number) => void;
}

export const ProductCard: React.FC<Props> = ({ kit, width, quantity, onOpen, onAdd, onChangeQuantity }) => {
  const discount = kit.originalPrice > kit.price ? Math.round(((kit.originalPrice - kit.price) / kit.originalPrice) * 100) : 0;
  const maxQty = Math.min(20, kit.stockQuantity);
  const imageHeight = Math.round(width * 0.78);

  return (
    <View style={[styles.card, { width }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onOpen(kit)} accessibilityRole="button" accessibilityLabel={`${kit.name}, ${rupees(kit.price)}`}>
        <View style={{ height: imageHeight }}>
          <ProductImage source={kit.image} categoryKey={kit.categoryKey} style={styles.image} iconSize={28} />
          {kit.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {kit.badge}
              </Text>
            </View>
          ) : null}
          {!kit.inStock ? (
            <View style={styles.soldOut}>
              <Text style={styles.soldOutText}>Sold out</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {kit.name}
        </Text>
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>{rupees(kit.price)}</Text>
            {discount > 0 ? (
              <Text style={styles.mrp}>
                <Text style={styles.strike}>{rupees(kit.originalPrice)}</Text>
                <Text style={styles.off}>  {discount}% off</Text>
              </Text>
            ) : null}
          </View>

          {quantity > 0 ? (
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => onChangeQuantity(kit, quantity - 1)} accessibilityLabel="Decrease quantity" hitSlop={6}>
                <Minus size={14} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.qty}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.stepBtn, quantity >= maxQty && styles.disabled]}
                disabled={quantity >= maxQty}
                onPress={() => onChangeQuantity(kit, quantity + 1)}
                accessibilityLabel="Increase quantity"
                hitSlop={6}
              >
                <Plus size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addBtn, !kit.inStock && styles.disabled]}
              disabled={!kit.inStock}
              onPress={() => onAdd(kit)}
              activeOpacity={0.85}
              accessibilityLabel={`Add ${kit.name} to cart`}
            >
              <Plus size={18} color="#FFF" strokeWidth={2.6} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    maxWidth: '80%',
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  badgeText: { color: '#FFF', fontSize: 9.5, fontWeight: '800' },
  soldOut: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center' },
  soldOutText: { color: THEME.colors.heading, fontWeight: '800', fontSize: 12 },
  body: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  name: { fontSize: 13, lineHeight: 17, fontWeight: '700', color: THEME.colors.heading },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  priceCol: { flex: 1, paddingRight: 6 },
  price: { fontSize: 15, fontWeight: '800', color: THEME.colors.heading },
  mrp: { fontSize: 11, marginTop: 1 },
  strike: { color: THEME.colors.mutedText, textDecorationLine: 'line-through' },
  off: { color: THEME.colors.bilvaGreen, fontWeight: '700' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.colors.primarySaffron, alignItems: 'center', justifyContent: 'center' },
  stepper: {
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primarySaffron,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
    gap: 6,
  },
  stepBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  qty: { color: '#FFF', fontSize: 14, fontWeight: '800', minWidth: 14, textAlign: 'center' },
  disabled: { opacity: 0.4 },
});
