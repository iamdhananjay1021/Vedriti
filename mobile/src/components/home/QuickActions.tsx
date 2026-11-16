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
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

  const actions = [
    {
      id: 'mandir',
      label: t.qaMandir,
      sub: t.qaMandirSub,
      icon: Flame,
      tint: '#FDF2E9',
      color: '#EA580C',
      onPress: onMandirPress || onBookPujaPress,
    },
    {
      id: 'japa',
      label: t.qaJapa,
      sub: t.qaJapaSub,
      icon: Sparkles,
      tint: '#FEF3C7',
      color: '#D97706',
      onPress: onJapaPress || onBookPujaPress,
    },
    {
      id: 'puja',
      label: t.qaPuja,
      sub: t.qaPujaSub,
      icon: Landmark,
      tint: '#FDEBDD',
      color: THEME.colors.primarySaffron,
      onPress: onBookPujaPress,
    },
    {
      id: 'appointment',
      label: t.qaPandit,
      sub: t.qaPanditSub,
      icon: CalendarClock,
      tint: '#E6F4EA',
      color: '#15803D',
      onPress: onAppointmentPress,
    },
    {
      id: 'kundli',
      label: t.qaKundli,
      sub: t.qaKundliSub,
      icon: ScrollText,
      tint: '#EEE9FB',
      color: '#6D4FD1',
      onPress: onKundliPress,
    },
    {
      id: 'rashifal',
      label: t.qaRashifal,
      sub: t.qaRashifalSub,
      icon: Compass,
      tint: '#E0F2FE',
      color: '#0284C7',
      onPress: onRashifalPress || onKundliPress,
    },
    {
      id: 'aarti',
      label: t.qaAarti,
      sub: t.qaAartiSub,
      icon: BookOpen,
      tint: '#FCE7F3',
      color: '#DB2777',
      onPress: onAartiPress || onBookPujaPress,
    },
    {
      id: 'store',
      label: t.qaStore,
      sub: t.qaStoreSub,
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
          entering={FadeInUp.delay(60 + i * 35).duration(350)}
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
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.heading,
    textAlign: 'center',
  },
});
