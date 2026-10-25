import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Search, Bell } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface HomeHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onSearchPress,
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Identity */}
      <View style={styles.brandRow}>
        <Image
          source={THEME.assets.logoLotus}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.brandTextCol}>
          <Text style={styles.brandName}>{THEME.brand.name}</Text>
          <Text style={styles.brandTagline}>{THEME.brand.tagline}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onSearchPress}
          activeOpacity={0.7}
          style={styles.iconCircle}
          accessibilityLabel="Search pujas and kits"
        >
          <Search size={17} color="#4A3B32" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          style={[styles.iconCircle, styles.bellSpacing]}
          accessibilityLabel="Notifications"
        >
          <Bell size={17} color="#4A3B32" strokeWidth={2} />
          {/* Subtle notification indicator dot */}
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 9,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: THEME.typography.serif,
    fontSize: 21,
    fontWeight: '700',
    color: THEME.colors.heading,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  brandTagline: {
    fontSize: 10.5,
    color: THEME.colors.mutedText,
    marginTop: 1,
    letterSpacing: 0.1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE5D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bellSpacing: {
    marginLeft: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
