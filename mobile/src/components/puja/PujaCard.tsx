import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductImage } from '../common/ProductImage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight, Clock, Star } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SHADOW, SPACE, TYPE } from '../../constants/ui';
import type { Puja } from '../../data/mockData';
import { rupees } from '../../utils/format';

const CARD_HEIGHT = 136;
const MODE_SHORT: Record<string, string> = { ONLINE: 'Online', AT_HOME: 'At home', AT_TEMPLE: 'Temple' };

interface Props {
  puja: Puja;
  index?: number;
  onPress: (puja: Puja) => void;
}

export const PujaCard: React.FC<Props> = ({ puja, index = 0, onPress }) => {
  const hasReviews = (puja.reviewsCount ?? 0) > 0;
  const modes = puja.modes.map((m) => MODE_SHORT[m] ?? m).join(' • ');

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(380)} style={styles.wrap}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(puja)} style={styles.card} accessibilityRole="button" accessibilityLabel={`${puja.name}, from ${rupees(puja.startingPrice)}`}>
        <View style={styles.imageBox}>
          <ProductImage source={puja.image} categoryKey="PUJA" seed={puja.category} style={StyleSheet.absoluteFill} iconSize={30} />
        </View>
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.category} numberOfLines={1}>
              {puja.category}
            </Text>
            {hasReviews ? (
              <View style={styles.rating}>
                <Star size={11} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.ratingText}>{puja.rating}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {puja.name}
          </Text>
          <View style={styles.meta}>
            <Clock size={12} color={THEME.colors.mutedText} />
            <Text style={styles.metaText} numberOfLines={1}>
              {puja.duration}
              {modes ? ` • ${modes}` : ''}
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.price}>From {rupees(puja.startingPrice)}</Text>
            <View style={styles.go}>
              <ChevronRight size={16} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACE.lg, marginBottom: SPACE.md },
  card: {
    flexDirection: 'row',
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    overflow: 'hidden',
    ...SHADOW,
  },
  imageBox: { width: 104, height: 104, borderRadius: RADIUS.md, overflow: 'hidden', alignSelf: 'center', marginLeft: SPACE.md, backgroundColor: '#F6EBDD' },
  body: { flex: 1, padding: SPACE.md, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.sm },
  category: { ...TYPE.label, fontSize: 10, color: THEME.colors.primarySaffron, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: THEME.colors.heading },
  name: { ...TYPE.cardTitle, marginTop: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  metaText: { ...TYPE.caption, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACE.sm },
  price: { fontSize: 14, fontWeight: '800', color: THEME.colors.heading },
  go: { width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.colors.primarySaffron, alignItems: 'center', justifyContent: 'center' },
});
