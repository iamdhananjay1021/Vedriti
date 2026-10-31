import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { CheckCircle2, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, TYPE } from '../../constants/ui';
import { ProductImage } from '../common/ProductImage';
import { Button } from '../ui';
import type { PujaKit } from '../../data/mockData';
import { rupees } from '../../utils/format';

interface Props {
  kit: PujaKit | null;
  quantity: number;
  onClose: () => void;
  onAdd: (kit: PujaKit) => void;
  onOpenCart: () => void;
}

export const ProductSheet: React.FC<Props> = ({ kit, quantity, onClose, onAdd, onOpenCart }) => {
  const { width, height } = useWindowDimensions();
  if (!kit) return null;
  const discount = kit.originalPrice > kit.price ? Math.round(((kit.originalPrice - kit.price) / kit.originalPrice) * 100) : 0;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { maxHeight: height * 0.9 }]}>
          <TouchableOpacity style={styles.close} onPress={onClose} accessibilityLabel="Close">
            <X size={20} color={THEME.colors.heading} />
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <ProductImage source={kit.image} categoryKey={kit.categoryKey} style={[styles.image, { height: Math.min(width - 32, 360) }]} iconSize={56} />
            <Text style={styles.category}>{kit.category}</Text>
            <Text style={styles.name}>{kit.name}</Text>
            {kit.tagline ? <Text style={styles.tagline}>{kit.tagline}</Text> : null}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{rupees(kit.price)}</Text>
              {discount > 0 ? (
                <>
                  <Text style={styles.mrp}>{rupees(kit.originalPrice)}</Text>
                  <View style={styles.discount}>
                    <Text style={styles.discountText}>{discount}% OFF</Text>
                  </View>
                </>
              ) : null}
            </View>
            {kit.description ? <Text style={styles.description}>{kit.description}</Text> : null}
            {kit.itemsIncluded.length ? (
              <View style={styles.items}>
                <Text style={styles.itemsTitle}>What&apos;s included</Text>
                {kit.itemsIncluded.map((item) => (
                  <View key={item} style={styles.itemRow}>
                    <CheckCircle2 size={15} color={THEME.colors.bilvaGreen} style={styles.itemIcon} />
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
          <View style={styles.footer}>
            {quantity > 0 ? (
              <Button title={`View cart (${quantity})`} onPress={() => { onClose(); onOpenCart(); }} />
            ) : (
              <Button title={kit.inStock ? 'Add to cart' : 'Sold out'} disabled={!kit.inStock} onPress={() => { onAdd(kit); }} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(26,16,9,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: THEME.colors.primaryBg, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, overflow: 'hidden' },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, paddingTop: 16 },
  image: { width: '100%', borderRadius: RADIUS.lg },
  category: { ...TYPE.label, color: THEME.colors.primarySaffron, marginTop: 16 },
  name: { ...TYPE.title, fontSize: 22, marginTop: 4 },
  tagline: { ...TYPE.body, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  price: { fontSize: 24, fontWeight: '800', color: THEME.colors.heading },
  mrp: { fontSize: 14, color: THEME.colors.mutedText, textDecorationLine: 'line-through' },
  discount: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill },
  discountText: { color: '#B91C1C', fontSize: 11, fontWeight: '800' },
  description: { ...TYPE.body, marginTop: 14 },
  items: { marginTop: 18, backgroundColor: '#FFF', borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: THEME.colors.borderLight },
  itemsTitle: { ...TYPE.cardTitle, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  itemIcon: { marginTop: 2, marginRight: 8 },
  itemText: { ...TYPE.body, flex: 1 },
  footer: { padding: 16, paddingTop: 8, backgroundColor: THEME.colors.primaryBg },
});
