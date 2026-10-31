import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Gem, Package, Sparkles, Triangle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

const ICONS: Record<string, React.ElementType> = {
  PUJA_KIT: Package,
  RUDRAKSHA: Gem,
  YANTRA: Triangle,
  SAMAGRI: Flame,
  DHOOP: Flame,
  OTHER: Sparkles,
};

const PALETTES: readonly [string, string][] = [
  ['#FBE9D0', '#F3CFA3'],
  ['#FDE8E0', '#F4C5B4'],
  ['#FFF1CC', '#F5DC93'],
  ['#EDE7FA', '#D3C6F2'],
];

const paletteFor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
};

interface Props {
  source?: any;
  categoryKey?: string;
  seed?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  iconSize?: number;
}

export const ProductImage: React.FC<Props> = ({ source, categoryKey = 'OTHER', seed = '', style, imageStyle, iconSize = 34 }) => {
  const isPuja = categoryKey === 'PUJA';
  const Icon = ICONS[categoryKey] ?? Sparkles;
  const colors = isPuja ? paletteFor(seed) : PALETTES[0];

  return (
    <View style={[styles.box, style]}>
      {source ? (
        <Image source={source} style={[StyleSheet.absoluteFill, imageStyle]} resizeMode="cover" />
      ) : (
        <LinearGradient colors={colors} style={styles.placeholder}>
          {isPuja ? (
            <Text style={[styles.om, { fontSize: iconSize * 1.6, lineHeight: iconSize * 2.1 }]}>ॐ</Text>
          ) : (
            <Icon size={iconSize} color={THEME.colors.deepTerracotta} strokeWidth={1.6} />
          )}
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: { overflow: 'hidden', backgroundColor: '#F6EBDD' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  om: { color: THEME.colors.deepTerracotta, opacity: 0.85, includeFontPadding: false },
});
