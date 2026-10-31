import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { THEME } from '../../constants/theme';
import { RADIUS, SHADOW, SPACE, TYPE } from '../../constants/ui';
import { useAppData } from '../../context/AppDataContext';
import { ProductImage } from '../common/ProductImage';
import { rupees } from '../../utils/format';
import { SectionHeader } from './SectionHeader';

const CARD_WIDTH = 150;

export const KitRail: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  const { kits } = useAppData();
  const list = kits.filter((k) => k.inStock).slice(0, 8);
  if (!list.length) return null;

  return (
    <View>
      <SectionHeader title="Puja kits & samagri" subtitle="Delivered to your home" actionLabel="See all" onAction={onViewAll} />
      <FlatList
        data={list}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(k) => k.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: SPACE.md }} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
            <TouchableOpacity activeOpacity={0.9} onPress={onViewAll} style={styles.card} accessibilityRole="button" accessibilityLabel={`${item.name}, ${rupees(item.price)}`}>
              <ProductImage source={item.image} categoryKey={item.categoryKey} style={styles.image} />
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.price}>{rupees(item.price)}</Text>
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
  image: { width: '100%', height: CARD_WIDTH },
  body: { padding: SPACE.md },
  name: { ...TYPE.cardTitle, fontSize: 13.5, minHeight: 38 },
  price: { ...TYPE.price, fontSize: 15, marginTop: 4 },
});
