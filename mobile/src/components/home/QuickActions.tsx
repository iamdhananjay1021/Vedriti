import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Landmark, ShoppingBag, Sparkles, UserCheck } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface QuickActionsProps {
  onBookPujaPress: () => void;
  onStorePress: () => void;
  onKundliPress: () => void;
  onAcharyaPress?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onBookPujaPress,
  onStorePress,
  onKundliPress,
  onAcharyaPress,
}) => {
  const actions = [
    {
      id: 'puja',
      title: 'Book Puja',
      sub: 'Sacred Vidhi',
      icon: Landmark,
      bg: '#FDF2E9',
      border: '#F6DEC8',
      iconColor: THEME.colors.primarySaffron,
      onPress: onBookPujaPress,
    },
    {
      id: 'store',
      title: 'Vedic Store',
      sub: '100% Shuddh',
      icon: ShoppingBag,
      bg: '#FEF3C7',
      border: '#FDE68A',
      iconColor: '#B45309',
      onPress: onStorePress,
    },
    {
      id: 'kundli',
      title: 'Kundali',
      sub: 'Kashi Jyotish',
      icon: Sparkles,
      bg: '#FAF0E4',
      border: '#EAD7BF',
      iconColor: '#996515',
      onPress: onKundliPress,
    },
    {
      id: 'acharya',
      title: 'Acharyas',
      sub: 'Consultation',
      icon: UserCheck,
      bg: '#F0FDF4',
      border: '#BBF7D0',
      iconColor: '#16A34A',
      onPress: onAcharyaPress || onKundliPress,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.gridRow}>
        {actions.map((item) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              activeOpacity={0.78}
              style={styles.actionChip}
              accessibilityLabel={item.title}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.bg, borderColor: item.border }]}>
                <IconComponent size={22} color={item.iconColor} strokeWidth={2.2} />
              </View>
              <Text style={styles.actionTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.actionSub} numberOfLines={1}>
                {item.sub}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actionChip: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },
  actionTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E120A',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  actionSub: {
    fontSize: 9.5,
    color: '#8A7D70',
    textAlign: 'center',
    marginTop: 1,
    fontWeight: '500',
  },
});
