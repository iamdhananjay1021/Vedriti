import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Landmark, ShoppingBag, Sparkles, User, Flame } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export type TabId = 'home' | 'pujas' | 'store' | 'kundli' | 'account' | 'chat';

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pujas', label: 'Pujas', icon: Landmark },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'kundli', label: 'Kundali', icon: Sparkles },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <View style={styles.tabBarWrapper}>
      {/* Hairline Border */}
      <View style={styles.topBorderLine} />

      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 14),
          },
        ]}
      >
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.7}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${tab.label} tab`}
              >
                {/* Active Pill or Inactive Icon */}
                {isActive ? (
                  <View style={styles.activePill}>
                    <IconComponent
                      size={20}
                      color={THEME.colors.primarySaffron}
                      strokeWidth={2.4}
                    />
                  </View>
                ) : (
                  <View style={styles.iconWrapper}>
                    <IconComponent
                      size={20}
                      color="#8A7D70"
                      strokeWidth={1.8}
                    />
                  </View>
                )}

                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    zIndex: 20,
    borderTopWidth: 1,
    borderTopColor: '#EFE7DD',
  },
  topBorderLine: {
    height: 1,
    backgroundColor: '#FAF0E4',
    width: '100%',
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    flex: 1,
    minHeight: 48,
  },
  activeTabButton: {},
  activePill: {
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: '#FDF2E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  activeTabLabel: {
    color: THEME.colors.primarySaffron,
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#7D7063',
    fontWeight: '500',
  },
});
