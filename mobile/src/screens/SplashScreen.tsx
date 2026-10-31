import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';

export const SplashScreen: React.FC = () => {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, scale, glow]);

  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });

  return (
    <LinearGradient colors={['#FFF8EC', '#FBE7C6', '#F4D29C']} style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
        <Animated.View style={[styles.circle, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.om} accessibilityLabel="Om">
            ॐ
          </Text>
        </Animated.View>
        <Animated.Text style={[styles.brand, { opacity }]}>VedRit</Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity }]}>Pandit Ji • Puja • Kundli</Animated.Text>
      </View>
      <Animated.Text style={[styles.footer, { opacity }]}>श्रद्धा • संकल्प • सिद्धि</Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center' },
  glow: {
    position: 'absolute',
    top: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: THEME.colors.gold,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: THEME.colors.primarySaffron,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: THEME.colors.goldLight,
    ...THEME.shadows.goldGlow,
  },
  om: { fontSize: 92, color: '#FFF8E7', lineHeight: 120, includeFontPadding: false },
  brand: {
    marginTop: 28,
    fontSize: 38,
    fontWeight: '800',
    color: THEME.colors.royalCrimson,
    fontFamily: THEME.typography.serif,
    letterSpacing: 1,
  },
  tagline: { marginTop: 6, fontSize: 14, color: THEME.colors.deepTerracotta, letterSpacing: 1 },
  footer: { position: 'absolute', bottom: 48, fontSize: 14, color: THEME.colors.goldDark },
});
