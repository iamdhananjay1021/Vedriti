import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Share2,
  Clock,
  Sparkles,
  CheckCircle2,
  CalendarClock,
  Tag,
  ShieldCheck,
  Star,
  Flame,
  Volume2,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { PujaPackageSelector } from '../components/puja/PujaPackageSelector';
import { PujaPreparationAccordion } from '../components/puja/PujaPreparationAccordion';
import { BookingBottomBar } from '../components/puja/BookingBottomBar';
import { THEME } from '../constants/theme';
import { Puja, PujaPackage } from '../data/mockData';

interface PujaDetailScreenProps {
  puja: Puja;
  onBackPress: () => void;
  onBookPuja: (puja: Puja, selectedPackage: PujaPackage) => void;
}

export const PujaDetailScreen: React.FC<PujaDetailScreenProps> = ({
  puja,
  onBackPress,
  onBookPuja,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<PujaPackage>(
    puja.packages.panditWithSamagri
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Book ${puja.name} on VedRiti: ${puja.subtitle}. Authentic Vedic Vidhi by Kashi Acharyas. Starting at ₹${puja.startingPrice}.`,
        title: puja.name,
      });
    } catch {
      Alert.alert('VedRiti', `Share ${puja.name} with your family.`);
    }
  };

  const toggleMantraAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
    Alert.alert(
      'Vedic Mantra Recitation ॐ',
      `Chanting ${puja.sanskritMantra || 'Vedic Gayatri Mantra'} by Kashi Vishwanath Acharya Parishad.`,
      [{ text: 'Om Shanti' }]
    );
  };

  return (
    <View style={styles.container}>
      <AppBackground variant="golden">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* A. Hero Image Section */}
          <View style={styles.heroWrapper}>
            <Image
              source={puja.image}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Gradient Overlay for luxury readability */}
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.3)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Floating Buttons */}
            <View style={styles.topActionsRow}>
              <TouchableOpacity
                onPress={onBackPress}
                activeOpacity={0.75}
                style={styles.actionCircle}
                accessibilityLabel="Go back"
              >
                <ChevronLeft size={22} color={THEME.colors.headingDeep} strokeWidth={2.2} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.75}
                style={styles.actionCircle}
                accessibilityLabel="Share puja details"
              >
                <Share2 size={18} color={THEME.colors.headingDeep} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Floating Kshetra Badge */}
            <View style={styles.heroFloatingBadge}>
              <Sparkles size={11} color="#D4AF37" />
              <Text style={styles.heroBadgeText}>
                {puja.templeLocation || 'Kashi Kshetra Sanctum'}
              </Text>
            </View>
          </View>

          {/* B. Puja Information Card */}
          <View style={styles.infoSection}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{puja.category}</Text>
              </View>

              <View style={styles.durationPill}>
                <Clock size={11} color="#C65D24" strokeWidth={2} />
                <Text style={styles.durationPillText}>{puja.duration}</Text>
              </View>

              <View style={styles.ratingPill}>
                <Star size={10} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.ratingPillText}>{puja.rating || 4.98}</Text>
              </View>
            </View>

            <Text style={styles.pujaName}>{puja.name}</Text>
            <Text style={styles.pujaSubtitle}>{puja.subtitle}</Text>

            {/* Sanskrit Mantra Box with Audio Chanting Button */}
            {puja.sanskritMantra && (
              <View style={styles.mantraContainer}>
                <LinearGradient
                  colors={['#2B140A', '#1C0E07']}
                  style={styles.mantraGradient}
                >
                  <View style={styles.mantraTopRow}>
                    <View style={styles.mantraTag}>
                      <Flame size={10} color="#FBBF24" />
                      <Text style={styles.mantraTagText}>MUKHYA VEDIC MANTRA</Text>
                    </View>

                    <TouchableOpacity
                      onPress={toggleMantraAudio}
                      activeOpacity={0.8}
                      style={styles.audioListenBtn}
                    >
                      <Volume2 size={12} color="#F7E7B4" />
                      <Text style={styles.audioListenText}>
                        {isAudioPlaying ? 'Playing' : 'Listen Chants'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sanskritMantraText}>
                    {puja.sanskritMantra}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Verified Acharya Promise Note */}
            <View style={styles.panditNote}>
              <ShieldCheck size={16} color="#A7471B" strokeWidth={2} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.panditNoteTitle}>Authentic Vedic Anushthan</Text>
                <Text style={styles.panditNoteText}>
                  Personally conducted by {THEME.brand.singlePanditTitle}. Strictly conforms to Shukla Yajurveda & Grihya Sutras.
                </Text>
              </View>
            </View>

            {/* Suitable Occasions */}
            {puja.suitableOccasions && puja.suitableOccasions.length > 0 ? (
              <View style={styles.occasionsContainer}>
                <Text style={styles.subHeading}>Suitable Sacred Occasions</Text>
                <View style={styles.occasionChipsRow}>
                  {puja.suitableOccasions.map((occ, idx) => (
                    <View key={idx} style={styles.occasionChip}>
                      <Tag size={10} color={THEME.colors.deepTerracotta} />
                      <Text style={styles.occasionChipText}>{occ}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Ritual Overview */}
            <View style={styles.descSection}>
              <Text style={styles.subHeading}>Ritual Overview & Vidhi</Text>
              <Text style={styles.descText}>{puja.description}</Text>
            </View>

            {/* Spiritual Significance */}
            {puja.significance ? (
              <View style={styles.descSection}>
                <Text style={styles.subHeading}>Spiritual Significance & Fruits (Phalashruti)</Text>
                <Text style={styles.descText}>{puja.significance}</Text>
              </View>
            ) : null}

            {/* C. What's Included */}
            <View style={styles.includedCard}>
              <Text style={styles.includedTitle}>What’s Included in This Ritual</Text>

              <View style={styles.includedRow}>
                <CheckCircle2 size={14} color="#16A34A" style={styles.includedIcon} />
                <View style={styles.includedTextCol}>
                  <Text style={styles.includedLabel}>Acharya Ji’s Puja Services</Text>
                  <Text style={styles.includedSub}>{puja.whatIsIncluded.panditServices}</Text>
                </View>
              </View>

              <View style={styles.includedRow}>
                <CheckCircle2 size={14} color="#16A34A" style={styles.includedIcon} />
                <View style={styles.includedTextCol}>
                  <Text style={styles.includedLabel}>Abhijit Muhurat & Sankalp Guidance</Text>
                  <Text style={styles.includedSub}>{puja.whatIsIncluded.guidance}</Text>
                </View>
              </View>

              <View style={styles.includedRow}>
                <CheckCircle2
                  size={14}
                  color={selectedPackage.samagriIncluded ? '#16A34A' : '#C65D24'}
                  style={styles.includedIcon}
                />
                <View style={styles.includedTextCol}>
                  <Text style={styles.includedLabel}>
                    Puja Samagri ({selectedPackage.samagriIncluded ? '100% Pure Included' : 'Arranged by Devotee'})
                  </Text>
                  <Text style={styles.includedSub}>
                    {selectedPackage.samagriIncluded
                      ? 'Pure Cow Ghee, Kashi Gangajal, Hawan Samidha, Kalash, Janeu & Bhimseni Kapur.'
                      : 'You will arrange the samagri. A comprehensive Vedic checklist is sent on WhatsApp.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* D. Package Selection */}
            <PujaPackageSelector
              packages={puja.packages}
              selectedPackageId={selectedPackage.id}
              onSelectPackage={setSelectedPackage}
            />

            {/* E. How to Prepare Accordion */}
            <PujaPreparationAccordion steps={puja.preparationSteps} />

            {/* F. Availability Notice */}
            <View style={styles.availabilityNotice}>
              <CalendarClock size={14} color={THEME.colors.deepTerracotta} strokeWidth={2} />
              <Text style={styles.availabilityNoticeText}>
                Exact Muhurat is finalized in consultation with you based on your Janam Rashi & Gotra.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* G. Sticky Bottom Booking Bar */}
        <BookingBottomBar
          price={selectedPackage.price}
          packageName={selectedPackage.name}
          onBookPress={() => onBookPuja(puja, selectedPackage)}
        />
      </AppBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroWrapper: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: '#F5ECE1',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topActionsRow: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE5D9',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroFloatingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 16, 10, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  heroBadgeText: {
    color: '#F7E7B4',
    fontSize: 10.5,
    fontWeight: '800',
    marginLeft: 5,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8DECA',
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE5D9',
    marginRight: 6,
  },
  durationPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primarySaffron,
    marginLeft: 4,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8D5BF',
  },
  ratingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 3,
  },
  pujaName: {
    fontFamily: THEME.typography.serif,
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  pujaSubtitle: {
    fontSize: 12,
    lineHeight: 16.5,
    color: THEME.colors.mutedText,
    marginBottom: 12,
  },
  mantraContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    marginBottom: 14,
  },
  mantraGradient: {
    padding: 12,
  },
  mantraTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mantraTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mantraTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F7E7B4',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  audioListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  audioListenText: {
    color: '#F7E7B4',
    fontSize: 9.5,
    fontWeight: '700',
    marginLeft: 4,
  },
  sanskritMantraText: {
    fontFamily: THEME.typography.serif,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#FFFDF9',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  panditNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FDF6EE',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F6DEC8',
    marginBottom: 14,
  },
  panditNoteTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 2,
  },
  panditNoteText: {
    fontSize: 10.5,
    lineHeight: 14.5,
    color: THEME.colors.bodyText,
  },
  occasionsContainer: {
    marginBottom: 14,
  },
  subHeading: {
    fontFamily: THEME.typography.serif,
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 6,
  },
  occasionChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE5D9',
    marginRight: 6,
    marginBottom: 6,
  },
  occasionChipText: {
    fontSize: 10.5,
    color: THEME.colors.bodyText,
    marginLeft: 4,
    fontWeight: '600',
  },
  descSection: {
    marginBottom: 14,
  },
  descText: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: THEME.colors.bodyText,
  },
  includedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE0D0',
    padding: 14,
    marginBottom: 14,
  },
  includedTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 14.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 10,
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  includedIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  includedTextCol: {
    flex: 1,
  },
  includedLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 1,
  },
  includedSub: {
    fontSize: 10.5,
    lineHeight: 14,
    color: THEME.colors.mutedText,
  },
  availabilityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F8DEC8',
    marginBottom: 16,
  },
  availabilityNoticeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginLeft: 7,
    flex: 1,
  },
});
