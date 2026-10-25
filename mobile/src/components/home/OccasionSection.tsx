import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, HeartHandshake, Baby, ArrowRight, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { UPCOMING_OCCASIONS, Occasion } from '../../data/mockData';

interface OccasionSectionProps {
  onSelectOccasion: (occasion: Occasion) => void;
}

export const OccasionSection: React.FC<OccasionSectionProps> = ({
  onSelectOccasion,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return Home;
      case 'HeartHandshake':
        return HeartHandshake;
      case 'Sparkles':
        return Sparkles;
      case 'Baby':
        return Baby;
      default:
        return Home;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Sparkles size={11} color="#D4AF37" />
          <Text style={styles.badgeText}>Auspicious Milestones</Text>
        </View>
        <Text style={styles.sectionTitle}>Rituals for Sacred Occasions</Text>
        <Text style={styles.sectionSubtitle}>
          Tailored Vedic Vidhis for life's momentous sanskars
        </Text>
      </View>

      <View style={styles.cardsRow}>
        {UPCOMING_OCCASIONS.map((occ) => {
          const IconComponent = getIcon(occ.iconName);
          return (
            <TouchableOpacity
              key={occ.id}
              onPress={() => onSelectOccasion(occ)}
              activeOpacity={0.82}
              style={styles.card}
              accessibilityLabel={occ.title}
            >
              <View style={styles.cardSurface}>
                <View style={styles.iconCircle}>
                  <IconComponent size={15} color={THEME.colors.primarySaffron} strokeWidth={2.2} />
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {occ.title}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {occ.subtitle}
                </Text>

                <View style={styles.arrowRow}>
                  <Text style={styles.viewText}>Explore</Text>
                  <ArrowRight size={9} color={THEME.colors.primarySaffron} strokeWidth={2.4} />
                </View>
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
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerRow: {
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#996515',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 19,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 2,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    overflow: 'hidden',
  },
  cardSurface: {
    padding: 9,
    paddingVertical: 10,
    justifyContent: 'space-between',
    minHeight: 128,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F8DECA',
  },
  cardTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 9,
    lineHeight: 12,
    color: THEME.colors.mutedText,
    flex: 1,
    marginBottom: 4,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
  },
  viewText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.colors.primarySaffron,
  },
});
