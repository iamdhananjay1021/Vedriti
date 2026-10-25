import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface BookingBottomBarProps {
  price: number;
  packageName: string;
  onBookPress: () => void;
  disabled?: boolean;
}

export const BookingBottomBar: React.FC<BookingBottomBarProps> = ({
  price,
  packageName,
  onBookPress,
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 16),
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Left Side: Price & Selected Package Summary */}
        <View style={styles.priceColumn}>
          <Text style={styles.packageTag} numberOfLines={1}>
            {packageName}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.priceValue}>{price.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.availabilityNote}>Pending Pandit Ji verification</Text>
        </View>

        {/* Right Side: Primary CTA */}
        <TouchableOpacity
          onPress={onBookPress}
          disabled={disabled}
          activeOpacity={0.85}
          style={styles.bookButton}
          accessibilityRole="button"
          accessibilityLabel={`Book This Puja for ₹${price}`}
        >
          <Sparkles size={15} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.bookButtonText}>Book This Puja</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE5D9',
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceColumn: {
    flex: 1,
    marginRight: 12,
  },
  packageTag: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.mutedText,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginRight: 2,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.heading,
  },
  availabilityNote: {
    fontSize: 9.5,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 1,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    shadowColor: '#C65D24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
});
