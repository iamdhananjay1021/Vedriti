import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, CalendarCheck, ChevronLeft, Search, Languages } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { SPACE } from '../../constants/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useInbox } from '../../context/InboxContext';
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
  const { language, toggleLanguage, t } = useLanguage();
  const { unreadCount, open: openInbox } = useInbox();
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
        {/* Global Language Toggle */}
        <TouchableOpacity
          onPress={toggleLanguage}
          activeOpacity={0.8}
          style={styles.langPill}
          accessibilityRole="button"
          accessibilityLabel="Switch language"
        >
          <Languages size={13} color="#C65D24" />
          <Text style={styles.langText}>{language === 'hi' ? 'EN' : 'हिन्दी'}</Text>
        </TouchableOpacity>

        {onSearchPress ? (
          <HeaderIconButton onPress={onSearchPress} label={t.searchPlaceholder}>
            <Search size={18} color={THEME.colors.heading} />
          </HeaderIconButton>
        ) : null}
        {onNotificationPress ? (
          <HeaderIconButton onPress={onNotificationPress} label={t.myBookings}>
            <CalendarCheck size={18} color={THEME.colors.heading} />
          </HeaderIconButton>
        ) : null}
        <View>
          <HeaderIconButton onPress={openInbox} label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
            <Bell size={18} color={THEME.colors.heading} />
          </HeaderIconButton>
          {unreadCount > 0 ? (
            <View style={styles.badge} pointerEvents="none">
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </View>
        {rightActions}
        {onProfilePress ? (
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={t.yourProfile}>
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
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FAF6EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5ED',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E5D4',
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C65D24',
  },
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
