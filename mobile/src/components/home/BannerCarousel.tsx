import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE } from '../../constants/ui';
import type { ApiBanner } from '../../types/api';

const GUTTER = SPACE.lg;
const GAP = SPACE.md;
const AUTO_MS = 5000;

export const DEFAULT_BANNERS: ApiBanner[] = [
  {
    id: 'default-puja',
    title: 'Book a puja with Pandit Ji',
    subtitle: 'Choose your puja, pick a time that suits you — online or at home.',
    imageUrl: '',
    ctaLabel: 'Book a puja',
    targetType: 'PUJAS',
    targetRef: '',
  },
  {
    id: 'default-appointment',
    title: 'Talk to Pandit Ji',
    subtitle: 'Book a call, video or in-person appointment for guidance and muhurat.',
    imageUrl: '',
    ctaLabel: 'Book appointment',
    targetType: 'APPOINTMENT',
    targetRef: '',
  },
];

interface Props {
  banners: ApiBanner[];
  onPressBanner: (banner: ApiBanner) => void;
}

const BannerItem: React.FC<{
  banner: ApiBanner;
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}> = ({ banner, index, width, scrollX, onPress }) => {
  const snap = width + GAP;
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scrollX.value, [(index - 1) * snap, index * snap, (index + 1) * snap], [0.94, 1, 0.94], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollX.value, [(index - 1) * snap, index * snap, (index + 1) * snap], [0.75, 1, 0.75], Extrapolation.CLAMP),
  }));
  const interactive = banner.targetType !== 'NONE';

  return (
    <Animated.View style={[{ width }, animated]}>
      <TouchableOpacity activeOpacity={interactive ? 0.92 : 1} onPress={interactive ? onPress : undefined} style={styles.card} accessibilityRole={interactive ? 'button' : undefined} accessibilityLabel={banner.title}>
        {banner.imageUrl ? (
          <>
            <Image source={{ uri: banner.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <LinearGradient colors={['rgba(26,16,9,0.05)', 'rgba(26,16,9,0.78)']} style={StyleSheet.absoluteFill} />
          </>
        ) : (
          <>
            <LinearGradient colors={['#D66628', '#A32F1A', '#6B1408']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.watermark}>ॐ</Text>
          </>
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {banner.title}
          </Text>
          {banner.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {banner.subtitle}
            </Text>
          ) : null}
          {banner.ctaLabel && interactive ? (
            <View style={styles.cta}>
              <Text style={styles.ctaText}>{banner.ctaLabel}</Text>
              <ArrowRight size={14} color={THEME.colors.primarySaffron} />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Dot: React.FC<{ index: number; snap: number; scrollX: SharedValue<number> }> = ({ index, snap, scrollX }) => {
  const style = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, [(index - 1) * snap, index * snap, (index + 1) * snap], [6, 20, 6], Extrapolation.CLAMP),
    opacity: interpolate(scrollX.value, [(index - 1) * snap, index * snap, (index + 1) * snap], [0.35, 1, 0.35], Extrapolation.CLAMP),
  }));
  return <Animated.View style={[styles.dot, style]} />;
};

export const BannerCarousel: React.FC<Props> = ({ banners, onPressBanner }) => {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = screenWidth - GUTTER * 2;
  const snap = itemWidth + GAP;
  const data = useMemo(() => (banners.length ? banners : DEFAULT_BANNERS), [banners]);

  const scrollX = useSharedValue(0);
  const list = useRef<FlatList<ApiBanner>>(null);
  const index = useRef(0);
  const [paused, setPaused] = useState(false);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      index.current = Math.round(e.nativeEvent.contentOffset.x / snap);
      setPaused(false);
    },
    [snap]
  );

  useEffect(() => {
    index.current = 0;
    list.current?.scrollToOffset({ offset: 0, animated: false });
  }, [data.length]);

  useEffect(() => {
    if (data.length < 2 || paused) return;
    const timer = setInterval(() => {
      const next = (index.current + 1) % data.length;
      index.current = next;
      list.current?.scrollToOffset({ offset: next * snap, animated: true });
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [data.length, paused, snap]);

  return (
    <View>
      <Animated.FlatList
        ref={list as never}
        data={data}
        keyExtractor={(b: ApiBanner) => b.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setPaused(true)}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item, index: i }: { item: ApiBanner; index: number }) => (
          <BannerItem banner={item} index={i} width={itemWidth} scrollX={scrollX} onPress={() => onPressBanner(item)} />
        )}
      />
      {data.length > 1 ? (
        <View style={styles.dots}>
          {data.map((b, i) => (
            <Dot key={b.id} index={i} snap={snap} scrollX={scrollX} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: GUTTER },
  card: { height: 188, borderRadius: RADIUS.xl, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#6B1408' },
  watermark: { position: 'absolute', right: -6, top: -18, fontSize: 150, color: 'rgba(255,248,231,0.16)', lineHeight: 190 },
  content: { padding: SPACE.lg + 2 },
  title: { fontFamily: THEME.typography.display, fontSize: 22, lineHeight: 28, fontWeight: '700', color: '#FFF8E7' },
  subtitle: { fontSize: 13, lineHeight: 18, color: 'rgba(255,248,231,0.88)', marginTop: 4 },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E7',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: SPACE.md,
  },
  ctaText: { color: THEME.colors.primarySaffron, fontWeight: '800', fontSize: 13 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: SPACE.md },
  dot: { height: 6, borderRadius: 3, backgroundColor: THEME.colors.primarySaffron },
});
