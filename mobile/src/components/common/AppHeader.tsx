import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarCheck, ChevronLeft, Search } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { SPACE } from '../../constants/ui';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from './Avatar';
import { BrandLogo } from './BrandLogo';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  isHome?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  rightActions?: React.ReactNode;
}

export const HeaderIconButton: React.FC<{ onPress: () => void; label: string; children: React.ReactNode }> = ({ onPress, label, children }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.iconButton} accessibilityRole="button" accessibilityLabel={label}>
    {children}
  </TouchableOpacity>
);

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  isHome = false,
  showBack = false,
  onBackPress,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  rightActions,
}) => {
  const { user } = useAuth();
  const heading = title || 'VedRit';

  return (
    <View style={styles.row}>
      {showBack && onBackPress ? (
        <HeaderIconButton onPress={onBackPress} label="Back">
          <ChevronLeft size={22} color={THEME.colors.heading} />
        </HeaderIconButton>
      ) : null}

      {isHome ? (
        <View style={styles.brand}>
          <BrandLogo size={38} />
        </View>
      ) : (
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {heading}
        </Text>
      )}

      <View style={styles.actions}>
        {onSearchPress ? (
          <HeaderIconButton onPress={onSearchPress} label="Search pujas">
            <Search size={18} color={THEME.colors.heading} />
          </HeaderIconButton>
        ) : null}
        {onNotificationPress ? (
          <HeaderIconButton onPress={onNotificationPress} label="My bookings">
            <CalendarCheck size={18} color={THEME.colors.heading} />
          </HeaderIconButton>
        ) : null}
        {rightActions}
        {onProfilePress ? (
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="My account">
            <Avatar uri={user?.avatarUrl} name={user?.name} size={38} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    height: 56,
    paddingHorizontal: SPACE.lg,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: THEME.colors.heading,
  },
  brand: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.primarySaffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
