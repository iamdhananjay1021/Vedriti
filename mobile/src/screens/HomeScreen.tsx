import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Flame, Sparkles, ChevronRight, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { AnnouncementStrip } from '../components/home/AnnouncementStrip';
import { BannerCarousel } from '../components/home/BannerCarousel';
import { QuickActions } from '../components/home/QuickActions';
import { NextBookingCard } from '../components/home/NextBookingCard';
import { PanchangCard } from '../components/home/PanchangCard';
import { GeetaSuvicharCard } from '../components/home/GeetaSuvicharCard';
import { RashifalWidget } from '../components/home/RashifalWidget';
import { VratFestivalTracker } from '../components/home/VratFestivalTracker';
import { DevoteeTestimonials } from '../components/home/DevoteeTestimonials';
import { PopularPujas } from '../components/home/PopularPujas';
import { KitRail } from '../components/home/KitRail';
import { PanditProfileSection } from '../components/home/PanditProfileSection';
import { KundliPromo } from '../components/home/KundliPromo';
import { MantraJapaWidget } from '../components/home/MantraJapaWidget';
import { SupportCard } from '../components/home/SupportCard';
import { ChatFloatingButton } from '../components/chat/ChatFloatingButton';
import { VirtualMandirModal } from '../components/mandir/VirtualMandirModal';
import { SmartJapaModal } from '../components/japa/SmartJapaModal';
import { DailyRashifalModal } from '../components/home/DailyRashifalModal';
import { AartiSangrahModal } from '../components/aarti/AartiSangrahModal';
import { SamuhikSection } from '../components/samuhik/SamuhikSection';
import { SPACE } from '../constants/ui';
import { THEME } from '../constants/theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import type { Puja } from '../data/mockData';
import type { ApiBanner } from '../types/api';
import type { TabId } from '../components/navigation/BottomTabBar';

interface HomeScreenProps {
  onSelectPuja: (puja: Puja) => void;
  onNavigateTab: (tab: TabId) => void;
  onBookAppointment: () => void;
  onOpenBookings: () => void;
  onChatPress?: () => void;
}

const Block: React.FC<{ order: number; children: React.ReactNode }> = ({ order, children }) => (
  <Animated.View entering={FadeInDown.delay(80 + order * 90).duration(450)} style={styles.block}>
    {children}
  </Animated.View>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectPuja,
  onNavigateTab,
  onBookAppointment,
  onOpenBookings,
  onChatPress,
}) => {
  const { home, pujas, loading, refresh } = useAppData();
  const { user } = useAuth();
  const { sections } = home;

  const [mandirModalOpen, setMandirModalOpen] = useState(false);
  const [japaModalOpen, setJapaModalOpen] = useState(false);
  const [rashifalModalOpen, setRashifalModalOpen] = useState(false);
  const [aartiModalOpen, setAartiModalOpen] = useState(false);

  const openBanner = useCallback(
    (banner: ApiBanner) => {
      switch (banner.targetType) {
        case 'PUJAS':
          return onNavigateTab('pujas');
        case 'PUJA': {
          const puja = pujas.find((p) => p.slug === banner.targetRef);
          return puja ? onSelectPuja(puja) : onNavigateTab('pujas');
        }
        case 'STORE':
          return onNavigateTab('store');
        case 'KUNDLI':
          return onNavigateTab('kundli');
        case 'APPOINTMENT':
          return onBookAppointment();
        default:
          return undefined;
      }
    },
    [pujas, onNavigateTab, onSelectPuja, onBookAppointment]
  );

  const handleSelectVratPuja = (pujaSlug: string) => {
    const puja = pujas.find((p) => p.slug === pujaSlug);
    if (puja) {
      onSelectPuja(puja);
    } else {
      onNavigateTab('pujas');
    }
  };

  let order = 0;
  const next = () => (order += 1);

  return (
    <AppBackground variant="golden">
      <AppHeader
        isHome
        onSearchPress={() => onNavigateTab('pujas')}
        onNotificationPress={onOpenBookings}
        onProfilePress={() => onNavigateTab('account')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {home.announcement ? (
          <Block order={next()}>
            <AnnouncementStrip text={home.announcement} />
          </Block>
        ) : null}

        <Block order={next()}>
          <BannerCarousel banners={home.banners} onPressBanner={openBanner} />
        </Block>

        {/* 8-Action Expansive Spiritual Quick Grid */}
        <View style={styles.block}>
          <QuickActions
            onBookPujaPress={() => onNavigateTab('pujas')}
            onAppointmentPress={onBookAppointment}
            onKundliPress={() => onNavigateTab('kundli')}
            onStorePress={() => onNavigateTab('store')}
            onMandirPress={() => setMandirModalOpen(true)}
            onJapaPress={() => setJapaModalOpen(true)}
            onRashifalPress={() => setRashifalModalOpen(true)}
            onAartiPress={() => setAartiModalOpen(true)}
          />
        </View>

        {/* SACRED SPIRITUAL SADHANA BAR: Virtual Mandir & Smart Japa */}
        <View style={styles.sadhanaStrip}>
          {/* Card 1: Virtual Mandir & Diya Lighting */}
          <TouchableOpacity
            onPress={() => setMandirModalOpen(true)}
            style={styles.sadhanaCard}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7C2D12', '#431407']}
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
            />
            <View style={styles.sadhanaCardContent}>
              <View style={styles.sadhanaIconRow}>
                <View style={styles.sadhanaIconBadgeOrange}>
                  <Flame size={16} color="#FEF3C7" />
                </View>
                <View style={styles.streakBadgePill}>
                  <Text style={styles.streakBadgeText}>
                    {user?.dailyPujaStreak ? `${user.dailyPujaStreak} दिन 🔥` : 'नित्य दीप'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sadhanaTitle}>दैनिक मंदिर</Text>
              <Text style={styles.sadhanaSubtitle}>दीप प्रज्ज्वलन व दर्शन</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Smart Rudraksha Japa Mala (108 Beads) */}
          <TouchableOpacity
            onPress={() => setJapaModalOpen(true)}
            style={styles.sadhanaCard}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#78350F', '#451A03']}
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
            />
            <View style={styles.sadhanaCardContent}>
              <View style={styles.sadhanaIconRow}>
                <View style={styles.sadhanaIconBadgeAmber}>
                  <Sparkles size={16} color="#FEF3C7" />
                </View>
                <View style={styles.malaCountPill}>
                  <Text style={styles.malaCountText}>108 मनके</Text>
                </View>
              </View>
              <Text style={styles.sadhanaTitle}>रुद्राक्ष माला</Text>
              <Text style={styles.sadhanaSubtitle}>स्मार्ट मन्त्र जप काउंटर</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Block order={next()}>
          <NextBookingCard onPress={onOpenBookings} />
        </Block>

        {/* Feature 3: SAMUHIK FESTIVAL PUJAS SECTION */}
        <Block order={next()}>
          <SamuhikSection
            userProfile={{
              name: user?.name,
              phone: user?.phone,
              gotra: user?.gotra,
            }}
          />
        </Block>

        {/* DAILY GEETA SHLOKA & SUVICHAR (1-Tap WhatsApp Share) */}
        <Block order={next()}>
          <GeetaSuvicharCard />
        </Block>

        {/* LIVE VEDIC PANCHANG & CHOGHADIYA CARD */}
        {home.panchang ? (
          <Block order={next()}>
            <PanchangCard panchang={home.panchang} />
          </Block>
        ) : null}

        {/* DAILY RASHIFAL (12 Rashis Widget) */}
        <Block order={next()}>
          <RashifalWidget />
        </Block>

        {/* UPCOMING VRATS & FESTIVALS CALENDAR */}
        <Block order={next()}>
          <VratFestivalTracker onSelectVratPuja={handleSelectVratPuja} />
        </Block>

        {sections.popularPujas ? (
          <Block order={next()}>
            <PopularPujas onSelectPuja={onSelectPuja} onViewAllPress={() => onNavigateTab('pujas')} />
          </Block>
        ) : null}

        {sections.kits ? (
          <Block order={next()}>
            <KitRail onViewAll={() => onNavigateTab('store')} />
          </Block>
        ) : null}

        {sections.pandit ? (
          <Block order={next()}>
            <PanditProfileSection onBookAppointment={onBookAppointment} />
          </Block>
        ) : null}

        {sections.kundli ? (
          <Block order={next()}>
            <KundliPromo onPress={() => onNavigateTab('kundli')} />
          </Block>
        ) : null}

        {sections.japa ? (
          <Block order={next()}>
            <MantraJapaWidget onOpenFullMala={() => setJapaModalOpen(true)} />
          </Block>
        ) : null}

        {/* AUTHENTIC DEVOTEE REVIEWS & LIVE PUJA PROOFS */}
        <Block order={next()}>
          <DevoteeTestimonials />
        </Block>

        <Block order={next()}>
          <SupportCard />
        </Block>
        <View style={styles.footer} />
      </ScrollView>

      {/* Feature 1: Virtual Mandir Modal */}
      <VirtualMandirModal
        visible={mandirModalOpen}
        onClose={() => setMandirModalOpen(false)}
      />

      {/* Feature 2: Smart Japa Mala Modal */}
      <SmartJapaModal
        visible={japaModalOpen}
        onClose={() => setJapaModalOpen(false)}
      />

      {/* Feature 4: Daily Rashifal Modal */}
      <DailyRashifalModal
        visible={rashifalModalOpen}
        onClose={() => setRashifalModalOpen(false)}
      />

      {/* Feature 5: Aarti & Chalisa Sangrah Modal */}
      <AartiSangrahModal
        visible={aartiModalOpen}
        onClose={() => setAartiModalOpen(false)}
      />

      <ChatFloatingButton onPress={onChatPress || (() => onNavigateTab('chat'))} />
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 0, paddingBottom: SPACE.xxl },
  block: { marginTop: SPACE.xl },
  footer: { height: 64 },
  sadhanaStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  sadhanaCard: {
    flex: 1,
    height: 98,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  sadhanaCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  sadhanaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sadhanaIconBadgeOrange: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sadhanaIconBadgeAmber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE68A',
  },
  malaCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  malaCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  sadhanaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FEF3C7',
    marginTop: 4,
  },
  sadhanaSubtitle: {
    fontSize: 11,
    color: '#FDE68A',
    fontWeight: '500',
  },
});
