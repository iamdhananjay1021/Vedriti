import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { PanchangTicker } from '../components/home/PanchangTicker';
import { HeroBanner } from '../components/home/HeroBanner';
import { QuickActions } from '../components/home/QuickActions';
import { PopularPujas } from '../components/home/PopularPujas';
import { MantraJapaWidget } from '../components/home/MantraJapaWidget';
import { CertifiedAcharyasSection } from '../components/home/CertifiedAcharyasSection';
import { PromoKitBanner } from '../components/home/PromoKitBanner';
import { PromoKundliBanner } from '../components/home/PromoKundliBanner';
import { TrustSection } from '../components/home/TrustSection';
import { OccasionSection } from '../components/home/OccasionSection';
import { SupportCard } from '../components/home/SupportCard';
import { ChatFloatingButton } from '../components/chat/ChatFloatingButton';
import { Puja, Occasion, CertifiedAcharya } from '../data/mockData';
import { TabId } from '../components/navigation/BottomTabBar';

interface HomeScreenProps {
  onSelectPuja: (puja: Puja) => void;
  onNavigateTab: (tab: TabId) => void;
  onSelectOccasion: (occ: Occasion) => void;
  onContactSupport: () => void;
  onNotificationPress: () => void;
  onChatPress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectPuja,
  onNavigateTab,
  onSelectOccasion,
  onContactSupport,
  onNotificationPress,
  onChatPress,
}) => {
  return (
    <AppBackground variant="golden">
      {/* Universal Luxury App Header */}
      <AppHeader
        isHome={true}
        onSearchPress={() => onNavigateTab('pujas')}
        onNotificationPress={onNotificationPress}
        onProfilePress={() => onNavigateTab('account')}
      />

      {/* Main Single Vertically Scrollable Container */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Daily Live Vedic Panchang & Muhurat Ticker */}
        <PanchangTicker onExploreMuhuratPress={() => onNavigateTab('pujas')} />

        {/* 2. Hero Section */}
        <HeroBanner onBookPujaPress={() => onNavigateTab('pujas')} />

        {/* 3. Quick Action Cards */}
        <QuickActions
          onBookPujaPress={() => onNavigateTab('pujas')}
          onStorePress={() => onNavigateTab('store')}
          onKundliPress={() => onNavigateTab('kundli')}
          onAcharyaPress={() => onNavigateTab('kundli')}
        />

        {/* 4. Popular Pujas (Horizontally scrollable) */}
        <PopularPujas
          onSelectPuja={onSelectPuja}
          onViewAllPress={() => onNavigateTab('pujas')}
        />

        {/* 6. Interactive Digital Japa Mala & Chants Counter */}
        <MantraJapaWidget />

        {/* 7. Council of Certified Vedic Acharyas */}
        <CertifiedAcharyasSection
          onConsultAcharyaPress={() => onNavigateTab('kundli')}
        />

        {/* 8. Consecrated Puja Samagri Kits Promotional Banner */}
        <PromoKitBanner onShopPress={() => onNavigateTab('store')} />

        {/* 9. Kundli Guidance Consultation Banner */}
        <PromoKundliBanner onCheckKundliPress={() => onNavigateTab('kundli')} />

        {/* 10. Vedic Authenticity & Trust Guarantees */}
        <TrustSection />

        {/* 11. Upcoming Occasion Milestones Section */}
        <OccasionSection onSelectOccasion={onSelectOccasion} />

        {/* 12. 24x7 Acharya Helpline & WhatsApp Concierge */}
        <SupportCard onContactPress={onContactSupport} />
      </ScrollView>

      {/* Floating Vedic AI & Acharya Chat FAB */}
      <ChatFloatingButton onPress={onChatPress || (() => onNavigateTab('chat'))} />
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
});
