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
import {
  Flame,
  Eye,
  Sparkles,
  Droplets,
  Leaf,
  Landmark,
  Gift,
  Heart,
  Volume2,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { MantraJapaWidget } from '../components/home/MantraJapaWidget';
import { THEME } from '../constants/theme';
import { LIVE_DARSHAN_TEMPLES, LiveTempleDarshan } from '../data/mockData';

interface DarshanScreenProps {
  onNotificationPress?: () => void;
  onBookPujaForTemple?: (temple: LiveTempleDarshan) => void;
}

export const DarshanScreen: React.FC<DarshanScreenProps> = ({
  onNotificationPress,
  onBookPujaForTemple,
}) => {
  const [activeTemple, setActiveTemple] = useState<LiveTempleDarshan>(LIVE_DARSHAN_TEMPLES[0]);
  const [selectedOffering, setSelectedOffering] = useState<string | null>(null);

  const handleOfferArpan = (offeringName: string, price: number) => {
    Alert.alert(
      'Virtual Offering Consecrated! 🙏',
      `Your sacred offering of ${offeringName} (₹${price}) has been offered at ${activeTemple.templeName}. Pandit Ji will recite your family Sankalp in the upcoming Aarti.`,
      [{ text: 'Har Har Mahadev' }]
    );
  };

  return (
    <AppBackground variant="golden">
      {/* Universal Luxury App Header */}
      <AppHeader
        title="Live Temple Darshan"
        subtitle="24x7 Garbhagriha Stream & Divine Japa"
        onNotificationPress={onNotificationPress}
      />

      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Temple Selector Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templeSelectorRow}
        >
          {LIVE_DARSHAN_TEMPLES.map((temple) => {
            const isSelected = activeTemple.id === temple.id;
            return (
              <TouchableOpacity
                key={temple.id}
                onPress={() => setActiveTemple(temple)}
                activeOpacity={0.8}
                style={[
                  styles.templeTabPill,
                  isSelected && styles.templeTabPillSelected,
                ]}
              >
                <Landmark
                  size={12}
                  color={isSelected ? '#FFF' : THEME.colors.primarySaffron}
                />
                <Text
                  style={[
                    styles.templeTabText,
                    isSelected && styles.templeTabTextSelected,
                  ]}
                >
                  {temple.city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2. Main Live Broadcast Hero Card */}
        <View style={styles.broadcastCard}>
          <LinearGradient
            colors={activeTemple.bgGradient}
            style={styles.broadcastGradient}
          >
            {/* Top Status Strip */}
            <View style={styles.broadcastTopBar}>
              <View style={styles.liveIndicator}>
                <View style={styles.redDotPulse} />
                <Text style={styles.liveLabel}>LIVE BROADCAST</Text>
              </View>

              <View style={styles.viewerBadge}>
                <Eye size={12} color="#DCFCE7" />
                <Text style={styles.viewerCount}>
                  {(activeTemple.liveViewers / 1000).toFixed(1)}k Watching Live
                </Text>
              </View>
            </View>

            {/* Temple Deity & Aarti Info */}
            <View style={styles.templeCenterCol}>
              <View style={styles.kalashAura}>
                <Flame size={32} color="#FBBF24" />
              </View>
              <Text style={styles.mainTempleName}>{activeTemple.templeName}</Text>
              <Text style={styles.mainDeityName}>{activeTemple.deity}</Text>
              <Text style={styles.mainTagline}>"{activeTemple.tagline}"</Text>

              {/* Live Aarti Banner */}
              <View style={styles.currentAartiBox}>
                <Clock size={13} color="#FBBF24" />
                <Text style={styles.currentAartiTitle}>
                  {activeTemple.currentAarti}
                </Text>
              </View>

              <Text style={styles.nextAartiText}>
                Upcoming: {activeTemple.nextAarti}
              </Text>
            </View>

            {/* Virtual Offering Section (E-Chadhawa) */}
            <View style={styles.arpanSection}>
              <Text style={styles.arpanTitle}>
                Instant Virtual Arpan (ई-चढ़ावा):
              </Text>
              <View style={styles.arpanGrid}>
                {activeTemple.availableOfferings.map((offering) => (
                  <TouchableOpacity
                    key={offering.id}
                    onPress={() => handleOfferArpan(offering.name, offering.price)}
                    activeOpacity={0.8}
                    style={styles.arpanCard}
                  >
                    <Sparkles size={12} color="#D4AF37" />
                    <Text style={styles.arpanCardName} numberOfLines={1}>
                      {offering.name}
                    </Text>
                    <Text style={styles.arpanCardPrice}>₹{offering.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sankalp CTA */}
            {onBookPujaForTemple && (
              <TouchableOpacity
                onPress={() => onBookPujaForTemple(activeTemple)}
                activeOpacity={0.85}
                style={styles.bookSanctumPujaBtn}
              >
                <Text style={styles.bookSanctumPujaText}>
                  Book Direct Garbhagriha Abhishek at {activeTemple.city} →
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* 3. Interactive Digital Japa Mala & Mantra Counter */}
        <MantraJapaWidget />

        {/* 4. Auspicious Spiritual Guidance Card */}
        <View style={styles.guidanceCard}>
          <View style={styles.guidanceHeader}>
            <ShieldCheck size={16} color="#C65D24" />
            <Text style={styles.guidanceTitle}>Significance of Virtual Darshan</Text>
          </View>
          <Text style={styles.guidanceBody}>
            According to the Shiva Purana and Skanda Purana, mentally visualizing the Jyotirlinga and reciting the sacred Gayatri or Mahamrityunjaya mantra during the morning or evening Sandhya grants equal punya to physical pilgrimage.
          </Text>
          <View style={styles.guidanceFooter}>
            <CheckCircle2 size={12} color="#16A34A" />
            <Text style={styles.guidanceFooterText}>
              Consecrated under Vedic guidance of Kashi Vishwanath Parishad
            </Text>
          </View>
        </View>
      </ScrollView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scrollList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  templeSelectorRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  templeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    marginRight: 8,
  },
  templeTabPillSelected: {
    backgroundColor: THEME.colors.primarySaffron,
    borderColor: '#D4AF37',
  },
  templeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
    marginLeft: 6,
  },
  templeTabTextSelected: {
    color: '#FFF',
  },
  broadcastCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    shadowColor: '#2B140B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  broadcastGradient: {
    padding: 18,
  },
  broadcastTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  redDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  liveLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  viewerCount: {
    color: '#DCFCE7',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  templeCenterCol: {
    alignItems: 'center',
    marginBottom: 18,
  },
  kalashAura: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mainTempleName: {
    fontFamily: THEME.typography.serif,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFDF9',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  mainDeityName: {
    fontSize: 13,
    color: '#F7E7B4',
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 4,
  },
  mainTagline: {
    fontSize: 10.5,
    color: '#D4C3B3',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  currentAartiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBBF24',
    marginBottom: 4,
  },
  currentAartiTitle: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  nextAartiText: {
    fontSize: 10,
    color: '#F7E7B4',
    marginTop: 2,
  },
  arpanSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 12,
    marginBottom: 14,
  },
  arpanTitle: {
    fontSize: 11,
    color: '#F7E7B4',
    fontWeight: '700',
    marginBottom: 8,
  },
  arpanGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arpanCard: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  arpanCardName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    marginBottom: 2,
    textAlign: 'center',
  },
  arpanCardPrice: {
    color: '#F7E7B4',
    fontSize: 11,
    fontWeight: '800',
  },
  bookSanctumPujaBtn: {
    backgroundColor: '#C65D24',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F7E7B4',
  },
  bookSanctumPujaText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  guidanceCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    padding: 16,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  guidanceTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 14.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 6,
  },
  guidanceBody: {
    fontSize: 11,
    lineHeight: 16,
    color: THEME.colors.bodyText,
    marginBottom: 10,
  },
  guidanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
  },
  guidanceFooterText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '600',
    marginLeft: 4,
  },
});
