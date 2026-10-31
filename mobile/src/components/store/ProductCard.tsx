import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Minus, Plus } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SHADOW, TYPE } from '../../constants/ui';
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

export const ProductCard: React.FC<Props> = ({ kit, width, index, quantity, onOpen, onAdd, onChangeQuantity }) => {
  const discount = kit.originalPrice > kit.price ? Math.round(((kit.originalPrice - kit.price) / kit.originalPrice) * 100) : 0;
  const maxQty = Math.min(20, kit.stockQuantity);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(380)} style={[styles.card, { width }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onOpen(kit)} accessibilityLabel={`${kit.name}, ${rupees(kit.price)}`}>
        <View style={[styles.imageWrap, { height: width }]}>
          <ProductImage source={kit.image} categoryKey={kit.categoryKey} style={styles.image} />
          {kit.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {kit.badge}
              </Text>
            </View>
          ) : null}
          {discount > 0 ? (
            <View style={styles.discount}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          ) : null}
          {!kit.inStock ? (
            <View style={styles.soldOut}>
              <Text style={styles.soldOutText}>Sold out</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.category} numberOfLines={1}>
            {kit.category}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {kit.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{rupees(kit.price)}</Text>
            {discount > 0 ? <Text style={styles.mrp}>{rupees(kit.originalPrice)}</Text> : null}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        {quantity > 0 ? (
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => onChangeQuantity(kit, quantity - 1)} accessibilityLabel="Decrease quantity">
              <Minus size={16} color={THEME.colors.primarySaffron} />
            </TouchableOpacity>
            <Text style={styles.qty}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.stepBtn, quantity >= maxQty && styles.disabled]}
              disabled={quantity >= maxQty}
              onPress={() => onChangeQuantity(kit, quantity + 1)}
              accessibilityLabel="Increase quantity"
            >
              <Plus size={16} color={THEME.colors.primarySaffron} />
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
            <Text style={styles.addText}>{kit.inStock ? 'Add to cart' : 'Unavailable'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    overflow: 'hidden',
    marginBottom: 12,
    ...SHADOW,
  },
  imageWrap: { width: '100%' },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: '70%',
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  discount: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  discountText: { color: '#B91C1C', fontSize: 10, fontWeight: '800' },
  soldOut: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  soldOutText: { color: THEME.colors.heading, fontWeight: '800', fontSize: 13 },
  body: { paddingHorizontal: 12, paddingTop: 10 },
  category: { ...TYPE.caption, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 },
  name: { ...TYPE.cardTitle, fontSize: 14, minHeight: 40, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  price: TYPE.price,
  mrp: { fontSize: 12, color: THEME.colors.mutedText, textDecorationLine: 'line-through' },
  actionRow: { padding: 12, paddingTop: 10 },
  addBtn: {
    height: 38,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: THEME.colors.primarySaffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: THEME.colors.primarySaffron, fontWeight: '800', fontSize: 13 },
  stepper: {
    height: 38,
    borderRadius: RADIUS.pill,
    backgroundColor: THEME.colors.softSaffronBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 15, fontWeight: '800', color: THEME.colors.heading },
  disabled: { opacity: 0.4 },
});
