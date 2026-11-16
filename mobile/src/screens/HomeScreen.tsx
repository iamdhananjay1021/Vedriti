import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { AnnouncementStrip } from '../components/home/AnnouncementStrip';
import { BannerCarousel } from '../components/home/BannerCarousel';
import { QuickActions } from '../components/home/QuickActions';
import { NextBookingCard } from '../components/home/NextBookingCard';
import { PanchangCard } from '../components/home/PanchangCard';
import { GeetaSuvicharCard } from '../components/home/GeetaSuvicharCard';
import { VratFestivalTracker } from '../components/home/VratFestivalTracker';
import { DevoteeTestimonials } from '../components/home/DevoteeTestimonials';
import { PopularPujas } from '../components/home/PopularPujas';
import { KitRail } from '../components/home/KitRail';
import { PanditProfileSection } from '../components/home/PanditProfileSection';
import { SupportCard } from '../components/home/SupportCard';
import { ChatFloatingButton } from '../components/chat/ChatFloatingButton';
import { VirtualMandirModal } from '../components/mandir/VirtualMandirModal';
import { SmartJapaModal } from '../components/japa/SmartJapaModal';
import { DailyRashifalModal } from '../components/home/DailyRashifalModal';
import { AartiSangrahModal } from '../components/aarti/AartiSangrahModal';
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
  <Animated.View entering={FadeInDown.delay(60 + order * 70).duration(400)} style={styles.block}>
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
        {/* Priority 1: Flash Announcement Strip (if active) */}
        {home.announcement ? (
          <Block order={next()}>
            <AnnouncementStrip text={home.announcement} />
          </Block>
        ) : null}

        {/* Priority 2: Sacred Festival & Auspicious Occasions Banners */}
        <Block order={next()}>
          <BannerCarousel banners={home.banners} onPressBanner={openBanner} />
        </Block>

        {/* Priority 3: Today's Sacred Vedic Panchang & Muhurat */}
        {home.panchang ? (
          <Block order={next()}>
            <PanchangCard panchang={home.panchang} />
          </Block>
        ) : null}

        {/* Priority 4: 8-Action Sacred Shortcuts Grid */}
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

        {/* Priority 5: Active Booking Card (if devotee has an upcoming booking) */}
        <Block order={next()}>
          <NextBookingCard onPress={onOpenBookings} />
        </Block>

        {/* Priority 6: Verified Acharya Profile & Consultation (Prominently placed for encouragement) */}
        {sections.pandit ? (
          <Block order={next()}>
            <PanditProfileSection onBookAppointment={onBookAppointment} />
          </Block>
        ) : null}

        {/* Priority 7: Core Vedic Pujas Catalog */}
        {sections.popularPujas ? (
          <Block order={next()}>
            <PopularPujas onSelectPuja={onSelectPuja} onViewAllPress={() => onNavigateTab('pujas')} />
          </Block>
        ) : null}

        {/* Priority 8: Upcoming Vrats & Sacred Fasts Calendar */}
        <Block order={next()}>
          <VratFestivalTracker onSelectVratPuja={handleSelectVratPuja} />
        </Block>

        {/* Priority 9: Sacred Store & Puja Samagri Kits */}
        {sections.kits ? (
          <Block order={next()}>
            <KitRail onViewAll={() => onNavigateTab('store')} />
          </Block>
        ) : null}

        {/* Priority 10: Daily Shrimad Bhagavad Geeta Shloka & Wisdom */}
        <Block order={next()}>
          <GeetaSuvicharCard />
        </Block>

        {/* Priority 12: Devotee Testimonials & Verified Experience */}
        <Block order={next()}>
          <DevoteeTestimonials />
        </Block>

        {/* Priority 13: Devotee Support & Inquiries */}
        <Block order={next()}>
          <SupportCard />
        </Block>

        {/* Minimal Sacred Brand Signature */}
        <View style={styles.brandFooter}>
          <Text style={styles.brandFooterOm}>ॐ</Text>
          <Text style={styles.brandFooterText}>वेदरीति • VedRit Spiritual Services</Text>
          <Text style={styles.brandFooterSub}>Managed by Urbexon Software Solutions LLP</Text>
        </View>

        <View style={styles.footerSpacing} />
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

      {/* Feature 3: Daily Rashifal Modal */}
      <DailyRashifalModal
        visible={rashifalModalOpen}
        onClose={() => setRashifalModalOpen(false)}
      />

      {/* Feature 4: Aarti & Chalisa Sangrah Modal */}
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
  block: { marginTop: SPACE.lg },
  footerSpacing: { height: 48 },
  brandFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACE.xl,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
    marginHorizontal: SPACE.xl,
  },
  brandFooterOm: {
    fontSize: 24,
    color: THEME.colors.primarySaffron,
    opacity: 0.6,
    marginBottom: 4,
  },
  brandFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#786B60',
    letterSpacing: 0.2,
  },
  brandFooterSub: {
    fontSize: 10,
    color: '#A89A8D',
    marginTop: 2,
  },
});
