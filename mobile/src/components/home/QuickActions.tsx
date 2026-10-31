import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { CalendarClock, Landmark, Package, ScrollText } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE } from '../../constants/ui';

interface Props {
  onBookPujaPress: () => void;
  onAppointmentPress: () => void;
  onKundliPress: () => void;
  onStorePress: () => void;
}

export const QuickActions: React.FC<Props> = ({ onBookPujaPress, onAppointmentPress, onKundliPress, onStorePress }) => {
  const actions = [
    { id: 'puja', label: 'Book Puja', icon: Landmark, tint: '#FDEBDD', color: THEME.colors.primarySaffron, onPress: onBookPujaPress },
    { id: 'appointment', label: 'Appointment', icon: CalendarClock, tint: '#E6F4EA', color: '#15803D', onPress: onAppointmentPress },
    { id: 'kundli', label: 'Kundli', icon: ScrollText, tint: '#EEE9FB', color: '#6D4FD1', onPress: onKundliPress },
    { id: 'store', label: 'Puja Kits', icon: Package, tint: '#FFF1CC', color: '#B7791F', onPress: onStorePress },
  ];

  return (
    <View style={styles.row}>
      {actions.map(({ id, label, icon: Icon, tint, color, onPress }, i) => (
        <Animated.View key={id} entering={FadeInUp.delay(120 + i * 70).duration(420)} style={styles.cell}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touch} accessibilityRole="button" accessibilityLabel={label}>
            <View style={[styles.icon, { backgroundColor: tint }]}>
              <Icon size={24} color={color} strokeWidth={2} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: SPACE.lg, gap: SPACE.sm },
  cell: { flex: 1 },
  touch: { alignItems: 'center', gap: SPACE.sm, paddingVertical: SPACE.xs },
  icon: { width: 58, height: 58, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12.5, fontWeight: '700', color: THEME.colors.heading },
});
