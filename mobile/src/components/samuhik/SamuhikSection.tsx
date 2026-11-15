import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import {
  Flame,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  Video,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import type { ApiSamuhikPuja } from '../../types/api';
import { SamuhikBookingModal } from './SamuhikBookingModal';
import { THEME } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface Props {
  onSelectPuja?: (puja: ApiSamuhikPuja) => void;
  userProfile?: {
    name?: string;
    phone?: string;
    gotra?: string;
  };
}

export const SamuhikSection: React.FC<Props> = ({ userProfile }) => {
  const [pujas, setPujas] = useState<ApiSamuhikPuja[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePujaForBooking, setActivePujaForBooking] = useState<ApiSamuhikPuja | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPujas = async () => {
      setLoading(true);
      try {
        const list = await api.samuhikPujas();
        if (mounted && list && list.length > 0) {
          setPujas(list);
        }
      } catch (e) {
        console.warn('Samuhik pujas load warning:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPujas();
    return () => {
      mounted = false;
    };
  }, []);

  if (pujas.length === 0 && !loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.flameIconBox}>
            <Flame size={18} color="#C65D24" />
          </View>
          <View>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.title}>सामूहिक महापर्व अनुष्ठान</Text>
              <View style={styles.microDakshinaTag}>
                <Text style={styles.microDakshinaText}>₹101 सूक्ष्म दक्षिणा</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              तीर्थ धामों से आपके नाम व गोत्र से आहुति • लाइव वीडियो संकल्प
            </Text>
          </View>
        </View>
      </View>

      {/* PUJAS HORIZONTAL CARDS RAIL */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        decelerationRate="fast"
        snapToInterval={width * 0.88 + 14}
      >
        {pujas.map((p) => {
          const enrolled = p.enrolledCount || 0;
          const max = p.maxDevotees || 108;
          const pct = Math.min(100, Math.round((enrolled / max) * 100));
          const minPrice =
            p.tiers && p.tiers.length ? Math.min(...p.tiers.map((t) => t.dakshina)) : 101;
          const spotsLeft = Math.max(0, max - enrolled);

          const defaultImg =
            p.imageUrl ||
            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80';

          return (
            <View key={p.id || (p as any)._id} style={styles.cardContainer}>
              {/* Top Banner Image with Gradient Overlay */}
              <View style={styles.imageBox}>
                <Image source={{ uri: defaultImg }} style={styles.templeImage} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(28,12,4,0.95)']}
                  style={StyleSheet.absoluteFill}
                />

                {/* Badges on Top of Image */}
                <View style={styles.imageTopRow}>
                  <View style={styles.liveFestivalBadge}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveFestivalText}>महापर्व अनुष्ठान</Text>
                  </View>
                  <View style={styles.startingPricePill}>
                    <Text style={styles.startingPriceText}>₹{minPrice} से प्रारम्भ</Text>
                  </View>
                </View>

                {/* Venue Overlay on bottom of image */}
                <View style={styles.imageBottomRow}>
                  <MapPin size={13} color="#FDE68A" />
                  <Text style={styles.imageVenueText} numberOfLines={1}>
                    {p.templeVenue}
                  </Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                {/* Deity & Date Strip */}
                <View style={styles.deityDateRow}>
                  <View style={styles.deityPill}>
                    <Sparkles size={11} color="#C65D24" />
                    <Text style={styles.deityPillText}>{p.deity}</Text>
                  </View>
                  <View style={styles.datePill}>
                    <Calendar size={11} color="#786B60" />
                    <Text style={styles.datePillText}>
                      {new Date(p.eventDate).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Puja Title */}
                <Text style={styles.pujaTitle} numberOfLines={2}>
                  {p.title}
                </Text>
                {p.subtitle ? (
                  <Text style={styles.pujaSub} numberOfLines={2}>
                    {p.subtitle}
                  </Text>
                ) : null}

                {/* Muhurat Bar */}
                <View style={styles.muhuratStrip}>
                  <Clock size={12} color="#15803D" />
                  <Text style={styles.muhuratText} numberOfLines={1}>
                    मुहूर्त: {p.muhuratTime}
                  </Text>
                </View>

                {/* Devotees Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTop}>
                    <View style={styles.enrolledInfo}>
                      <Users size={12} color="#C65D24" />
                      <Text style={styles.enrolledText}>
                        <Text style={styles.enrolledBold}>{enrolled}</Text> / {max} भक्त पंजीकृत
                      </Text>
                    </View>
                    <View style={styles.spotsPill}>
                      <Text style={styles.spotsText}>
                        {spotsLeft > 0 ? `केवल ${spotsLeft} स्थान शेष` : 'पूर्ण (Full)'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <LinearGradient
                      colors={['#F59E0B', '#DC2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${pct}%` }]}
                    />
                  </View>
                </View>

                {/* Key Benefits Tags */}
                <View style={styles.benefitsRow}>
                  <View style={styles.benefitChip}>
                    <CheckCircle2 size={11} color="#15803D" />
                    <Text style={styles.benefitChipText}>नाम-गोत्र आहुति</Text>
                  </View>
                  <View style={styles.benefitChip}>
                    <Video size={11} color="#C65D24" />
                    <Text style={styles.benefitChipText}>संकल्प वीडियो</Text>
                  </View>
                  <View style={styles.benefitChip}>
                    <ShieldCheck size={11} color="#2563EB" />
                    <Text style={styles.benefitChipText}>प्रसाद वितरण</Text>
                  </View>
                </View>

                {/* Tiers Pricing Grid Preview */}
                <View style={styles.tiersPreviewRow}>
                  {(p.tiers || []).slice(0, 3).map((t) => (
                    <View key={t.id} style={styles.tierPreviewItem}>
                      <Text style={styles.tierPreviewName} numberOfLines={1}>
                        {t.name.split('(')[0]}
                      </Text>
                      <Text style={styles.tierPreviewPrice}>₹{t.dakshina}</Text>
                    </View>
                  ))}
                  {p.tiers && p.tiers.length > 3 ? (
                    <View style={styles.tierPreviewItem}>
                      <Text style={styles.tierPreviewName}>मुख्य यजमान</Text>
                      <Text style={styles.tierPreviewPrice}>₹{p.tiers[3].dakshina}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Action CTA Button */}
                <TouchableOpacity
                  onPress={() => setActivePujaForBooking(p)}
                  style={styles.bookCta}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#EA580C', '#C65D24']}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                  />
                  <Text style={styles.bookCtaText}>पावन संकल्प लें • ₹{minPrice} से प्रारम्भ</Text>
                  <ChevronRight size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* BOOKING MODAL */}
      <SamuhikBookingModal
        visible={!!activePujaForBooking}
        puja={activePujaForBooking}
        onClose={() => setActivePujaForBooking(null)}
        onSuccess={() => {
          // Refresh list to update devotee count
          api.samuhikPujas().then(setPujas).catch(() => {});
        }}
        initialUserName={userProfile?.name}
        initialUserPhone={userProfile?.phone}
        initialUserGotra={userProfile?.gotra}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  flameIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5DDC7',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A170F',
  },
  microDakshinaTag: {
    backgroundColor: '#C65D24',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  microDakshinaText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#786B60',
    marginTop: 1,
  },
  railContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  cardContainer: {
    width: width * 0.88,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE7DD',
    overflow: 'hidden',
    shadowColor: '#2A170F',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageBox: {
    width: '100%',
    height: 145,
    position: 'relative',
    justifyContent: 'space-between',
    padding: 12,
  },
  templeImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  imageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  liveFestivalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveFestivalText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  startingPricePill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  startingPriceText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  imageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    zIndex: 2,
  },
  imageVenueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FEF3C7',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBody: {
    padding: 15,
  },
  deityDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C65D24',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  datePillText: {
    fontSize: 11,
    color: '#786B60',
    fontWeight: '600',
  },
  pujaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A170F',
    lineHeight: 22,
  },
  pujaSub: {
    fontSize: 11.5,
    color: '#554A41',
    marginTop: 4,
    lineHeight: 16,
  },
  muhuratStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0E8DE',
  },
  muhuratText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  enrolledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enrolledText: {
    fontSize: 11,
    color: '#554A41',
  },
  enrolledBold: {
    fontWeight: '800',
    color: '#C65D24',
  },
  spotsPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  spotsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EFE7DD',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  benefitChipText: {
    fontSize: 10,
    color: '#554A41',
    fontWeight: '600',
  },
  tiersPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4ECE3',
    gap: 4,
  },
  tierPreviewItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E8DE',
  },
  tierPreviewName: {
    fontSize: 9.5,
    color: '#786B60',
    fontWeight: '600',
  },
  tierPreviewPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C65D24',
    marginTop: 1,
  },
  bookCta: {
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    overflow: 'hidden',
  },
  bookCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
