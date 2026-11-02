import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';

interface Props {
  size?: number;
  showWordmark?: boolean;
  light?: boolean;
}

export const BrandMark: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <LinearGradient
    colors={['#EE7D32', '#C65D24', '#8E2F12']}
    start={{ x: 0.2, y: 0 }}
    end={{ x: 0.8, y: 1 }}
    style={[styles.mark, { width: size, height: size, borderRadius: size / 2, borderWidth: Math.max(1.5, size * 0.04) }]}
  >
    <Text style={[styles.om, { fontSize: size * 0.58, lineHeight: size * 0.86 }]} accessibilityLabel="Om">
      ॐ
    </Text>
  </LinearGradient>
);

export const BrandLogo: React.FC<Props> = ({ size = 40, showWordmark = true, light = false }) => (
  <View style={styles.row} accessibilityRole="image" accessibilityLabel="VedRit">
    <BrandMark size={size} />
    {showWordmark ? (
      <Text style={[styles.wordmark, { fontSize: size * 0.62 }]}>
        <Text style={{ color: light ? '#FFF8E7' : THEME.colors.heading }}>Ved</Text>
        <Text style={{ color: light ? '#F7D58B' : THEME.colors.primarySaffron }}>Rit</Text>
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { alignItems: 'center', justifyContent: 'center', borderColor: '#F3D27A' },
  om: { color: '#FFF4D2', textAlign: 'center', includeFontPadding: false },
  wordmark: { fontWeight: '800', letterSpacing: 0.2 },
});
