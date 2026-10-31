import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE, TYPE } from '../../constants/ui';
import type { HomePanchang } from '../../types/api';

const Cell: React.FC<{ label: string; value: string; danger?: boolean }> = ({ label, value, danger }) =>
  value ? (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, danger && styles.danger]}>{value}</Text>
    </View>
  ) : null;

export const PanchangCard: React.FC<{ panchang: HomePanchang }> = ({ panchang }) => {
  const heading = [panchang.paksha, panchang.tithi].filter(Boolean).join(' • ');
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#FFF8E7', '#FCEBCB']} style={styles.card}>
        <View style={styles.head}>
          <View style={styles.sun}>
            <Sun size={20} color="#B7791F" />
          </View>
          <View style={styles.headText}>
            <Text style={styles.kicker}>Today&apos;s panchang</Text>
            <Text style={styles.heading} numberOfLines={2}>
              {heading}
            </Text>
          </View>
        </View>
        <View style={styles.grid}>
          <Cell label="Abhijit muhurat" value={panchang.abhijitMuhurat} />
          <Cell label="Rahu kaal" value={panchang.rahuKaal} danger />
          <Cell label="Nakshatra" value={panchang.nakshatra} />
          <Cell label="Yoga" value={panchang.yoga} />
          <Cell label="Sunrise" value={panchang.sunrise} />
          <Cell label="Sunset" value={panchang.sunset} />
        </View>
        {panchang.note ? <Text style={styles.note}>{panchang.note}</Text> : null}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACE.lg },
  card: { borderRadius: RADIUS.lg, padding: SPACE.lg, borderWidth: 1, borderColor: '#F3DCB0' },
  head: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  sun: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  headText: { flex: 1 },
  kicker: { ...TYPE.label, color: '#B7791F' },
  heading: { ...TYPE.cardTitle, fontSize: 16, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACE.md, rowGap: SPACE.md },
  cell: { width: '50%', paddingRight: SPACE.sm },
  cellLabel: TYPE.caption,
  cellValue: { fontSize: 14, fontWeight: '700', color: THEME.colors.heading, marginTop: 1 },
  danger: { color: '#B91C1C' },
  note: { ...TYPE.body, fontSize: 13, marginTop: SPACE.md, fontStyle: 'italic' },
});
