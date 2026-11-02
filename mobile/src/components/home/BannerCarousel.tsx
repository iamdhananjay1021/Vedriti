import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE } from '../../constants/ui';
import type { ApiBanner } from '../../types/api';

const AUTO_MS = 5000;
const GUTTER = SPACE.lg;
const DEFAULT_RATIO = 2;
const MIN_RATIO = 1.4;
const MAX_RATIO = 3;

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
  width: number;
  height: number;
  onPress: () => void;
}> = ({ banner, width, height, onPress }) => {
  const interactive = banner.targetType !== 'NONE';

  return (
    <View style={{ width: width + GUTTER * 2, paddingHorizontal: GUTTER }}>
    <TouchableOpacity
      activeOpacity={interactive ? 0.92 : 1}
      onPress={interactive ? onPress : undefined}
      style={{ width, height, borderRadius: RADIUS.lg, overflow: 'hidden' }}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={banner.title}
    >
      {banner.imageUrl ? (
        <Image source={{ uri: banner.imageUrl }} style={{ width, height }} resizeMode="cover" />
      ) : (
        <View style={[styles.fallback, { width, height }]}>
          <LinearGradient colors={['#F59A45', '#E4702B', '#CF5A22']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Text style={styles.watermark}>ॐ</Text>
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
        </View>
      )}
    </TouchableOpacity>
    </View>
  );
};

export const BannerCarousel: React.FC<Props> = ({ banners, onPressBanner }) => {
  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth - GUTTER * 2;
  const page = screenWidth;
  const data = useMemo(() => (banners.length ? banners : DEFAULT_BANNERS), [banners]);
  const firstImage = data.find((b) => b.imageUrl)?.imageUrl || '';
  const [ratio, setRatio] = useState(DEFAULT_RATIO);

  useEffect(() => {
    if (!firstImage) {
      setRatio(DEFAULT_RATIO);
      return;
    }
    let live = true;
    Image.getSize(
      firstImage,
      (w, h) => {
        if (live && w > 0 && h > 0) setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, w / h)));
      },
      () => undefined
    );
    return () => {
      live = false;
    };
  }, [firstImage]);

  const height = Math.round(width / ratio);
  const list = useRef<FlatList<ApiBanner>>(null);
  const index = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / page);
      index.current = i;
      setActive(i);
      setPaused(false);
    },
    [page]
  );

  useEffect(() => {
    index.current = 0;
    setActive(0);
    list.current?.scrollToOffset({ offset: 0, animated: false });
  }, [data.length]);

  useEffect(() => {
    if (data.length < 2 || paused) return;
    const timer = setInterval(() => {
      const next = (index.current + 1) % data.length;
      index.current = next;
      setActive(next);
      list.current?.scrollToOffset({ offset: next * page, animated: true });
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [data.length, paused, page]);

  return (
    <View>
      <FlatList
        ref={list}
        data={data}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: page, offset: page * i, index: i })}
        onScrollBeginDrag={() => setPaused(true)}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => <BannerItem banner={item} width={width} height={height} onPress={() => onPressBanner(item)} />}
      />
      {data.length > 1 ? (
        <View style={styles.dots}>
          {data.map((b, i) => (
            <View key={b.id} style={[styles.dot, i === active && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { justifyContent: 'flex-end', overflow: 'hidden' },
  watermark: { position: 'absolute', right: -6, top: -18, fontSize: 150, color: 'rgba(255,255,255,0.18)', lineHeight: 190 },
  content: { padding: SPACE.lg + 2 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.92)', marginTop: 4 },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: SPACE.md,
  },
  ctaText: { color: THEME.colors.primarySaffron, fontWeight: '800', fontSize: 13 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: SPACE.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.colors.border },
  dotActive: { width: 18, backgroundColor: THEME.colors.primarySaffron },
});
