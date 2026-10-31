import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductImage } from '../common/ProductImage';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Clock } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SHADOW, SPACE, TYPE } from '../../constants/ui';
import { useAppData } from '../../context/AppDataContext';
import type { Puja } from '../../data/mockData';
import { rupees } from '../../utils/format';
import { SectionHeader } from './SectionHeader';

interface Props {
  onSelectPuja: (puja: Puja) => void;
  onViewAllPress: () => void;
}

const CARD_WIDTH = 236;

export const PopularPujas: React.FC<Props> = ({ onSelectPuja, onViewAllPress }) => {
  const { pujas } = useAppData();
  const list = useMemo(() => {
    const popular = pujas.filter((p) => p.isPopular);
    return (popular.length ? popular : pujas).slice(0, 8);
  }, [pujas]);

  if (!list.length) return null;

  return (
    <View>
      <SectionHeader title="Popular pujas" subtitle="Performed by Pandit Ji" actionLabel="See all" onAction={onViewAllPress} />
      <FlatList
        data={list}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: SPACE.md }} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => onSelectPuja(item)} style={styles.card} accessibilityRole="button" accessibilityLabel={`${item.name}, from ${rupees(item.startingPrice)}`}>
              <ProductImage source={item.image} categoryKey="PUJA" seed={item.category} style={styles.image} iconSize={36} />
              <View style={styles.body}>
                <Text style={styles.category} numberOfLines={1}>
                  {item.category}
                </Text>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.meta}>
                  <View style={styles.duration}>
                    <Clock size={12} color={THEME.colors.mutedText} />
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                  <Text style={styles.price}>From {rupees(item.startingPrice)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: SPACE.lg, paddingBottom: SPACE.sm },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    overflow: 'hidden',
    ...SHADOW,
  },
  image: { width: '100%', height: 132 },
  body: { padding: SPACE.md },
  category: { ...TYPE.label, fontSize: 10, color: THEME.colors.primarySaffron },
  name: { ...TYPE.cardTitle, minHeight: 40, marginTop: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACE.sm },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: TYPE.caption,
  price: { fontSize: 13, fontWeight: '800', color: THEME.colors.heading },
});
