import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, CheckCircle2, Circle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { PujaPackage } from '../../data/mockData';

interface PujaPackageSelectorProps {
  packages: {
    panditOnly: PujaPackage;
    panditWithSamagri: PujaPackage;
  };
  selectedPackageId: 'pandit-only' | 'pandit-samagri';
  onSelectPackage: (pkg: PujaPackage) => void;
}

export const PujaPackageSelector: React.FC<PujaPackageSelectorProps> = ({
  packages,
  selectedPackageId,
  onSelectPackage,
}) => {
  const options = [packages.panditOnly, packages.panditWithSamagri].filter((p) => p.enabled);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choose Service Package</Text>
      <Text style={styles.sectionSubtitle}>
        Select whether you want Pandit Ji’s dakshina only or complete samagri included.
      </Text>

      <View style={styles.optionsList}>
        {options.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;

          return (
            <TouchableOpacity
              key={pkg.id}
              onPress={() => onSelectPackage(pkg)}
              activeOpacity={0.85}
              style={[
                styles.packageCard,
                isSelected ? styles.activeCard : styles.inactiveCard,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${pkg.name}, ₹${pkg.price}`}
            >
              <View style={styles.cardHeader}>
                <View style={styles.radioRow}>
                  {isSelected ? (
                    <CheckCircle2 size={18} color={THEME.colors.primarySaffron} strokeWidth={2.2} />
                  ) : (
                    <Circle size={18} color="#A8A29E" strokeWidth={1.8} />
                  )}
                  <Text style={[styles.packageName, isSelected && styles.activePackageName]}>
                    {pkg.name}
                  </Text>
                </View>

                <Text style={styles.packagePrice}>
                  ₹{pkg.price.toLocaleString('en-IN')}
                </Text>
              </View>

              <Text style={styles.packageTagline}>{pkg.tagline}</Text>

              <View style={styles.featuresList}>
                {pkg.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={12} color={isSelected ? THEME.colors.primarySaffron : '#16A34A'} strokeWidth={2.2} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  sectionTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginBottom: 12,
  },
  optionsList: {},
  packageCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  activeCard: {
    borderColor: THEME.colors.primarySaffron,
    backgroundColor: '#FDF7F1',
  },
  inactiveCard: {
    borderColor: '#EFE5D9',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  packageName: {
    fontFamily: THEME.typography.serif,
    fontSize: 14.5,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginLeft: 8,
  },
  activePackageName: {
    color: THEME.colors.deepTerracotta,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
  },
  packageTagline: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginBottom: 10,
    marginLeft: 26,
  },
  featuresList: {
    marginLeft: 26,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F4ECE3',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    color: THEME.colors.bodyText,
    marginLeft: 6,
  },
});
