import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Eye, Sparkles, Droplets, Leaf, Landmark, Gift, ChevronRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { LIVE_DARSHAN_TEMPLES, LiveTempleDarshan } from '../../data/mockData';

interface LiveDarshanSectionProps {
  onViewAllDarshanPress?: () => void;
  onBookAbhishekPress?: (temple: LiveTempleDarshan) => void;
}

export const LiveDarshanSection: React.FC<LiveDarshanSectionProps> = ({
  onViewAllDarshanPress,
  onBookAbhishekPress,
}) => {
  const [selectedOffering, setSelectedOffering] = useState<string | null>(null);

  const handleOffer = (templeName: string, offeringName: string, price: number) => {
    Alert.alert(
      'Virtual Divine Arpan Confirmed! 🙏',
      `Your sacred offering of ${offeringName} (₹${price}) has been offered at ${templeName} during the ongoing Live Aarti. May the Divine bestow auspicious blessings upon your family.`,
      [{ text: 'Har Har Mahadev' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.sectionTitle}>24x7 Live Temple Darshan</Text>
            <View style={styles.liveIndicatorBadge}>
              <View style={styles.liveRedDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Direct garbhagriha stream & virtual offering (E-Chadhawa)
          </Text>
        </View>

        {onViewAllDarshanPress && (
          <TouchableOpacity
            onPress={onViewAllDarshanPress}
            activeOpacity={0.7}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>All Temples →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Carousel of Live Temples */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {LIVE_DARSHAN_TEMPLES.map((temple) => (
          <View key={temple.id} style={styles.templeCard}>
            {/* Dark Sanctum LinearGradient Background */}
            <LinearGradient
              colors={temple.bgGradient}
              style={styles.cardGradientSurface}
            >
              {/* Top Banner Row: City & Viewers */}
              <View style={styles.cardTopRow}>
                <View style={styles.cityPill}>
                  <Landmark size={10} color="#F7E7B4" />
                  <Text style={styles.cityPillText}>{temple.city}</Text>
                </View>

                <View style={styles.viewersPill}>
                  <Eye size={10} color="#DCFCE7" />
                  <Text style={styles.viewersText}>
                    {(temple.liveViewers / 1000).toFixed(1)}k Devotees
                  </Text>
                </View>
              </View>

              {/* Temple Title & Aarti Info */}
              <View style={styles.cardInfoSection}>
                <Text style={styles.templeName} numberOfLines={1}>
                  {temple.templeName}
                </Text>
                <Text style={styles.deityName}>{temple.deity}</Text>

                {/* Current Ongoing Aarti Live Bar */}
                <View style={styles.aartiLiveBar}>
                  <Flame size={12} color="#FBBF24" />
                  <Text style={styles.aartiLiveText} numberOfLines={1}>
                    {temple.currentAarti}
                  </Text>
                </View>

                <Text style={styles.taglineText} numberOfLines={1}>
                  {temple.tagline}
                </Text>
              </View>

              {/* Offerings Row */}
              <View style={styles.offeringsSection}>
                <Text style={styles.offeringHeading}>Offer Sacred Arpan (ई-चढ़ावा):</Text>
                <View style={styles.offeringButtonsRow}>
                  {temple.availableOfferings.slice(0, 2).map((offering) => (
                    <TouchableOpacity
                      key={offering.id}
                      onPress={() => handleOffer(temple.templeName, offering.name, offering.price)}
                      activeOpacity={0.8}
                      style={styles.offeringBtn}
                    >
                      <Sparkles size={10} color="#D4AF37" />
                      <Text style={styles.offeringBtnText}>
                        {offering.name} (₹{offering.price})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Direct Booking CTA */}
              {onBookAbhishekPress && (
                <TouchableOpacity
                  onPress={() => onBookAbhishekPress(temple)}
                  activeOpacity={0.85}
                  style={styles.bookAbhishekBtn}
                >
                  <Text style={styles.bookAbhishekText}>
                    Book Garbhagriha Abhishek →
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleCol: {
    flex: 1,
    marginRight: 8,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 19,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    letterSpacing: -0.2,
  },
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  liveRedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    marginRight: 3,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 2,
  },
  viewAllBtn: {
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primarySaffron,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
  templeCard: {
    width: 295,
    marginRight: 12,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    shadowColor: '#2B140B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardGradientSurface: {
    padding: 14,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  cityPillText: {
    color: '#F7E7B4',
    fontSize: 9.5,
    fontWeight: '700',
    marginLeft: 4,
  },
  viewersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  viewersText: {
    color: '#DCFCE7',
    fontSize: 9.5,
    fontWeight: '700',
    marginLeft: 4,
  },
  cardInfoSection: {
    marginBottom: 12,
  },
  templeName: {
    fontFamily: THEME.typography.serif,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFDF9',
    letterSpacing: -0.2,
  },
  deityName: {
    fontSize: 11.5,
    color: '#F7E7B4',
    fontWeight: '600',
    marginTop: 2,
  },
  aartiLiveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  aartiLiveText: {
    color: '#FEF3C7',
    fontSize: 10.5,
    fontWeight: '700',
    marginLeft: 6,
    flex: 1,
  },
  taglineText: {
    fontSize: 9.5,
    color: '#D4C3B3',
    marginTop: 6,
    fontStyle: 'italic',
  },
  offeringsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    marginBottom: 10,
  },
  offeringHeading: {
    fontSize: 9.5,
    color: '#F7E7B4',
    fontWeight: '700',
    marginBottom: 6,
  },
  offeringButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offeringBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginRight: 6,
    flex: 1,
    justifyContent: 'center',
  },
  offeringBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  bookAbhishekBtn: {
    backgroundColor: '#C65D24',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F7E7B4',
  },
  bookAbhishekText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
