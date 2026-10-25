import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { BottomTabBar, TabId } from './src/components/navigation/BottomTabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { PujasScreen } from './src/screens/PujasScreen';
import { PujaDetailScreen } from './src/screens/PujaDetailScreen';
import { StoreScreen } from './src/screens/StoreScreen';
import { KundliScreen } from './src/screens/KundliScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { VedicChatScreen } from './src/screens/VedicChatScreen';

import { AuthProvider } from './src/context/AuthContext';
import { AuthModal } from './src/components/modals/AuthModal';
import { CheckoutModal, CheckoutItem } from './src/components/modals/CheckoutModal';
import { PujaDetailModal } from './src/components/modals/PujaDetailModal';
import { ProductDetailModal } from './src/components/modals/ProductDetailModal';
import { KundliRequestModal } from './src/components/modals/KundliRequestModal';
import { SupportModal } from './src/components/modals/SupportModal';

import { Puja, PujaPackage, PujaKit, Occasion, TODAYS_PANCHANG } from './src/data/mockData';
import { whatsappService } from './src/services/whatsappService';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activePujaDetail, setActivePujaDetail] = useState<Puja | null>(null);
  const [selectedPuja, setSelectedPuja] = useState<Puja | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PujaPackage | null>(null);
  const [selectedKit, setSelectedKit] = useState<PujaKit | null>(null);
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);

  // Checkout State
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);

  const [isPujaModalVisible, setIsPujaModalVisible] = useState(false);
  const [isKitModalVisible, setIsKitModalVisible] = useState(false);
  const [isKundliModalVisible, setIsKundliModalVisible] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);

  // Navigate to Puja Details screen
  const handleSelectPuja = (puja: Puja) => {
    setActivePujaDetail(puja);
  };

  // Open Full Enterprise Checkout Modal from Puja Details screen
  const handleBookFromDetail = (puja: Puja, pkg: PujaPackage) => {
    setActivePujaDetail(null);
    setCheckoutItem({ type: 'puja', puja, package: pkg });
    setIsCheckoutModalVisible(true);
  };

  // Open Full Enterprise Checkout Modal for Sacred Kit
  const handleSelectKit = (kit: PujaKit) => {
    setCheckoutItem({ type: 'kit', kit });
    setIsCheckoutModalVisible(true);
  };

  const handleSelectOccasion = (occ: Occasion) => {
    setActivePujaDetail(null);
    setOccasionFilter(occ.filterTag);
    setActiveTab('pujas');
  };

  const handleCheckoutSuccess = (orderId: string) => {
    Alert.alert(
      'Vedic Sankalp Registered! 🙏',
      `Reference #${orderId} confirmed. Consecration initiated by the Kashi Vishwanath Parishad.`,
      [
        { text: 'WhatsApp Updates', onPress: () => whatsappService.chatWithAcharya(`Order #${orderId}`) },
        { text: 'View in Vault', onPress: () => setActiveTab('account') },
      ]
    );
  };

  const handleKundliSubmitted = (reportId: string) => {
    Alert.alert(
      'Kundli Consultation Initiated! 📜',
      `Reference #${reportId} registered. Our senior Jyotishacharya in Varanasi is analyzing your planetary Gochara transits.`,
      [{ text: 'View in Sankalp Vault', onPress: () => setActiveTab('account') }]
    );
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'VedRiti Auspicious Daily Panchang ॐ',
      `Today: ${TODAYS_PANCHANG.paksha} • ${TODAYS_PANCHANG.tithi}\nNakshatra: ${TODAYS_PANCHANG.nakshatra}\nAbhijit Muhurat: ${TODAYS_PANCHANG.abhijitMuhurat} (Active Now)\nRahu Kaal: ${TODAYS_PANCHANG.rahuKaal}\n\n${TODAYS_PANCHANG.auspiciousMessage}`,
      [
        { text: 'Consult on WhatsApp', onPress: () => whatsappService.chatWithAcharya('Panchang Muhurat Advice') },
        { text: 'Har Har Mahadev' },
      ]
    );
  };

  const handleTabChange = (tab: TabId) => {
    setActivePujaDetail(null);
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.contentContainer}>
        {/* Dynamic Puja Details Screen (when viewing a specific puja) */}
        {activePujaDetail ? (
          <PujaDetailScreen
            puja={activePujaDetail}
            onBackPress={() => setActivePujaDetail(null)}
            onBookPuja={handleBookFromDetail}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                onSelectPuja={handleSelectPuja}
                onNavigateTab={(tab) => handleTabChange(tab)}
                onSelectOccasion={handleSelectOccasion}
                onContactSupport={() => setIsSupportModalVisible(true)}
                onNotificationPress={handleNotificationPress}
                onChatPress={() => handleTabChange('chat')}
              />
            )}

            {activeTab === 'pujas' && (
              <PujasScreen
                onSelectPuja={handleSelectPuja}
                activeOccasionFilter={occasionFilter}
                onNotificationPress={handleNotificationPress}
                onBackPress={() => handleTabChange('home')}
              />
            )}

            {activeTab === 'store' && (
              <StoreScreen
                onSelectKit={handleSelectKit}
                onNotificationPress={handleNotificationPress}
              />
            )}

            {activeTab === 'kundli' && (
              <KundliScreen
                onRequestSuccess={handleKundliSubmitted}
                onNotificationPress={handleNotificationPress}
              />
            )}

            {activeTab === 'account' && (
              <AccountScreen
                onContactSupport={() => setIsSupportModalVisible(true)}
                onNotificationPress={handleNotificationPress}
              />
            )}

            {activeTab === 'chat' && (
              <VedicChatScreen
                onBackPress={() => handleTabChange('home')}
                onNavigateTab={(tab) => handleTabChange(tab as TabId)}
                onSelectPujaById={(pujaId) => {
                  handleTabChange('pujas');
                }}
              />
            )}
          </>
        )}
      </View>

      {/* Global Bottom Navigation Bar (Hidden when on PujaDetailScreen or VedicChatScreen) */}
      {!activePujaDetail && activeTab !== 'chat' ? (
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      ) : null}

      {/* Universal Vedic Sanctum Authentication Modal (Static OTP 1080) */}
      <AuthModal />

      {/* Full Enterprise Checkout Modal */}
      <CheckoutModal
        visible={isCheckoutModalVisible}
        item={checkoutItem}
        onClose={() => setIsCheckoutModalVisible(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Other Interactive Modals */}
      <PujaDetailModal
        puja={selectedPuja}
        selectedPackage={selectedPackage}
        initialStep="datetime"
        visible={isPujaModalVisible}
        onClose={() => setIsPujaModalVisible(false)}
        onBookingSuccess={handleCheckoutSuccess}
      />

      <ProductDetailModal
        kit={selectedKit}
        visible={isKitModalVisible}
        onClose={() => setIsKitModalVisible(false)}
        onOrderSuccess={handleCheckoutSuccess}
      />

      <KundliRequestModal
        visible={isKundliModalVisible}
        onClose={() => setIsKundliModalVisible(false)}
        onRequestSubmitted={handleKundliSubmitted}
      />

      <SupportModal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF6EE',
  },
  contentContainer: {
    flex: 1,
  },
});
