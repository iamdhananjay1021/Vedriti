import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  CalendarClock,
  Landmark,
  Package,
  ScrollText,
  Flame,
  Sparkles,
  Compass,
  BookOpen,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE } from '../../constants/ui';

interface Props {
  onBookPujaPress: () => void;
  onAppointmentPress: () => void;
  onKundliPress: () => void;
  onStorePress: () => void;
  onMandirPress?: () => void;
  onJapaPress?: () => void;
  onRashifalPress?: () => void;
  onAartiPress?: () => void;
}

export const QuickActions: React.FC<Props> = ({
  onBookPujaPress,
  onAppointmentPress,
  onKundliPress,
  onStorePress,
  onMandirPress,
  onJapaPress,
  onRashifalPress,
  onAartiPress,
}) => {
  const actions = [
    {
      id: 'mandir',
      label: 'दैनिक मंदिर',
      sub: 'दीप प्रज्ज्वलन',
      icon: Flame,
      tint: '#FDF2E9',
      color: '#EA580C',
      onPress: onMandirPress || onBookPujaPress,
    },
    {
      id: 'japa',
      label: 'रुद्राक्ष माला',
      sub: '108 मन्त्र जप',
      icon: Sparkles,
      tint: '#FEF3C7',
      color: '#D97706',
      onPress: onJapaPress || onBookPujaPress,
    },
    {
      id: 'puja',
      label: 'पूजा बुकिंग',
      sub: 'ऑनलाइन / घर पर',
      icon: Landmark,
      tint: '#FDEBDD',
      color: THEME.colors.primarySaffron,
      onPress: onBookPujaPress,
    },
    {
      id: 'appointment',
      label: 'पंडित परामर्श',
      sub: 'फोन / वीडियो कॉल',
      icon: CalendarClock,
      tint: '#E6F4EA',
      color: '#15803D',
      onPress: onAppointmentPress,
    },
    {
      id: 'kundli',
      label: 'जन्म कुंडली',
      sub: 'दोष व उपाय',
      icon: ScrollText,
      tint: '#EEE9FB',
      color: '#6D4FD1',
      onPress: onKundliPress,
    },
    {
      id: 'rashifal',
      label: 'दैनिक राशिफल',
      sub: '12 राशियां',
      icon: Compass,
      tint: '#E0F2FE',
      color: '#0284C7',
      onPress: onRashifalPress || onKundliPress,
    },
    {
      id: 'aarti',
      label: 'आरती संग्रह',
      sub: 'चालीसा व स्तुति',
      icon: BookOpen,
      tint: '#FCE7F3',
      color: '#DB2777',
      onPress: onAartiPress || onBookPujaPress,
    },
    {
      id: 'store',
      label: 'पूजा सामग्री',
      sub: 'शुद्ध किट व हवन',
      icon: Package,
      tint: '#FFF1CC',
      color: '#B7791F',
      onPress: onStorePress,
    },
  ];

  return (
    <View style={styles.grid}>
      {actions.map(({ id, label, icon: Icon, tint, color, onPress }, i) => (
        <Animated.View
          key={id}
          entering={FadeInUp.delay(80 + i * 40).duration(380)}
          style={styles.cell}
        >
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.touch}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <View style={[styles.icon, { backgroundColor: tint }]}>
              <Icon size={22} color={color} strokeWidth={2.2} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    rowGap: 14,
  },
  cell: {
    width: '25%',
    alignItems: 'center',
  },
  touch: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2A170F',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.colors.heading,
    textAlign: 'center',
  },
});
