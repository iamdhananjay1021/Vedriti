import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ScrollText } from 'lucide-react-native';
import { RADIUS, SPACE } from '../../constants/ui';

export const KundliPromo: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <View style={styles.wrap}>
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} accessibilityRole="button" accessibilityLabel="Send kundli details to Pandit Ji">
      <LinearGradient colors={['#4A2C8F', '#2E1A63']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.icon}>
          <ScrollText size={26} color="#EDE7FF" />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Get your kundli reviewed</Text>
          <Text style={styles.subtitle}>Send your birth details. Pandit Ji replies with analysis and remedies in the app.</Text>
        </View>
        <ArrowRight size={20} color="#EDE7FF" />
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACE.lg },
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md, borderRadius: RADIUS.lg, padding: SPACE.lg },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  subtitle: { color: 'rgba(237,231,255,0.85)', fontSize: 12.5, lineHeight: 17, marginTop: 3 },
});
