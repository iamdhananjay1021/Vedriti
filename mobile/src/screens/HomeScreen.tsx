import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { AnnouncementStrip } from '../components/home/AnnouncementStrip';
import { BannerCarousel } from '../components/home/BannerCarousel';
import { QuickActions } from '../components/home/QuickActions';
import { NextBookingCard } from '../components/home/NextBookingCard';
import { PanchangCard } from '../components/home/PanchangCard';
import { PopularPujas } from '../components/home/PopularPujas';
import { KitRail } from '../components/home/KitRail';
import { PanditProfileSection } from '../components/home/PanditProfileSection';
import { KundliPromo } from '../components/home/KundliPromo';
import { MantraJapaWidget } from '../components/home/MantraJapaWidget';
import { SupportCard } from '../components/home/SupportCard';
import { ChatFloatingButton } from '../components/chat/ChatFloatingButton';
import { SPACE } from '../constants/ui';
import { useAppData } from '../context/AppDataContext';
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

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectPuja, onNavigateTab, onBookAppointment, onOpenBookings, onChatPress }) => {
  const { home, pujas, loading, refresh } = useAppData();
  const { sections } = home;

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

  let order = 0;
  const next = () => (order += 1);

  return (
    <AppBackground variant="golden">
      <AppHeader isHome onSearchPress={() => onNavigateTab('pujas')} onNotificationPress={onOpenBookings} onProfilePress={() => onNavigateTab('account')} />
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

        <View style={styles.block}>
          <QuickActions
            onBookPujaPress={() => onNavigateTab('pujas')}
            onAppointmentPress={onBookAppointment}
            onKundliPress={() => onNavigateTab('kundli')}
            onStorePress={() => onNavigateTab('store')}
          />
        </View>

        <Block order={next()}>
          <NextBookingCard onPress={onOpenBookings} />
        </Block>

        {home.panchang ? (
          <Block order={next()}>
            <PanchangCard panchang={home.panchang} />
          </Block>
        ) : null}

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
            <MantraJapaWidget />
          </Block>
        ) : null}

        <Block order={next()}>
          <SupportCard />
        </Block>
        <View style={styles.footer} />
      </ScrollView>

      <ChatFloatingButton onPress={onChatPress || (() => onNavigateTab('chat'))} />
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 0, paddingBottom: SPACE.xxl },
  block: { marginTop: SPACE.xl },
  footer: { height: 64 },
});
