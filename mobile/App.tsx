import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';

import { BottomTabBar, TabId } from './src/components/navigation/BottomTabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { PujasScreen } from './src/screens/PujasScreen';
import { PujaDetailScreen } from './src/screens/PujaDetailScreen';
import { StoreScreen } from './src/screens/StoreScreen';
import { KundliScreen } from './src/screens/KundliScreen';
import { AccountScreen, AccountSection } from './src/screens/AccountScreen';
import { VedicChatScreen } from './src/screens/VedicChatScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileSetupScreen } from './src/screens/ProfileSetupScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppDataProvider, useAppData } from './src/context/AppDataContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { BookingModal, BookingRequest } from './src/components/booking/BookingModal';
import { CartModal } from './src/components/store/CartModal';
import { SupportModal } from './src/components/modals/SupportModal';
import { Button } from './src/components/ui';
import { THEME } from './src/constants/theme';

import { Puja, PujaPackage } from './src/data/mockData';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_SPLASH_MS = 1600;

function MainApp() {
  const { kits } = useAppData();
  const { syncWithCatalog } = useCart();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activePujaDetail, setActivePujaDetail] = useState<Puja | null>(null);
  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [accountSection, setAccountSection] = useState<AccountSection>('bookings');

  useEffect(() => {
    syncWithCatalog(kits);
  }, [kits, syncWithCatalog]);

  const handleTabChange = useCallback((tab: TabId) => {
    setActivePujaDetail(null);
    setActiveTab(tab);
  }, []);

  const openAccount = useCallback(
    (section: AccountSection) => {
      setAccountSection(section);
      handleTabChange('account');
    },
    [handleTabChange]
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activePujaDetail) {
        setActivePujaDetail(null);
        return true;
      }
      if (activeTab !== 'home') {
        handleTabChange('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [activePujaDetail, activeTab, handleTabChange]);

  const handleBookFromDetail = (puja: Puja, pkg: PujaPackage) => {
    setBookingRequest({
      serviceType: 'PUJA',
      puja,
      packageType: pkg.id === 'pandit-samagri' ? 'WITH_SAMAGRI' : 'PANDIT_ONLY',
    });
  };

  const bookAppointment = () => setBookingRequest({ serviceType: 'CONSULTATION' });
  const showBookings = () => openAccount('bookings');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.contentContainer}>
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
                onSelectPuja={setActivePujaDetail}
                onNavigateTab={handleTabChange}
                onBookAppointment={bookAppointment}
                onOpenBookings={showBookings}
                onChatPress={() => handleTabChange('chat')}
              />
            )}

            {activeTab === 'pujas' && (
              <PujasScreen
                onSelectPuja={setActivePujaDetail}
                onNotificationPress={showBookings}
              />
            )}

            {activeTab === 'store' && <StoreScreen onOpenCart={() => setCartVisible(true)} onNotificationPress={showBookings} />}

            {activeTab === 'kundli' && <KundliScreen onViewRequests={() => openAccount('kundli')} onNotificationPress={showBookings} />}

            {activeTab === 'account' && (
              <AccountScreen
                section={accountSection}
                onSectionChange={setAccountSection}
                onEditProfile={() => setEditingProfile(true)}
                onContactSupport={() => setSupportVisible(true)}
              />
            )}

            {activeTab === 'chat' && (
              <VedicChatScreen
                onBackPress={() => handleTabChange('home')}
                onNavigateTab={(tab) => handleTabChange(tab as TabId)}
                onSelectPujaById={() => handleTabChange('pujas')}
              />
            )}
          </>
        )}
      </View>

      {!activePujaDetail && activeTab !== 'chat' ? <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} /> : null}

      <BookingModal request={bookingRequest} onClose={() => setBookingRequest(null)} onViewBookings={showBookings} />
      <CartModal visible={cartVisible} onClose={() => setCartVisible(false)} onViewOrders={() => openAccount('orders')} />
      <SupportModal visible={supportVisible} onClose={() => setSupportVisible(false)} />
      <Modal visible={editingProfile} animationType="slide" onRequestClose={() => setEditingProfile(false)}>
        <ProfileSetupScreen mode="edit" onDone={() => setEditingProfile(false)} />
      </Modal>
    </SafeAreaView>
  );
}

function OfflineScreen() {
  const { retry, logout } = useAuth();
  return (
    <View style={styles.center}>
      <Text style={styles.om}>ॐ</Text>
      <Text style={styles.offlineTitle}>Can't reach VedRit</Text>
      <Text style={styles.offlineText}>Please check your internet connection and try again.</Text>
      <Button title="Try again" onPress={retry} style={styles.offlineBtn} />
      <Button title="Logout" variant="ghost" onPress={logout} />
    </View>
  );
}

function Root() {
  const { status, user } = useAuth();
  const [minSplashDone, setMinSplashDone] = useState(false);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => setMinSplashDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (status === 'loading' || !minSplashDone) return <SplashScreen />;
  if (status === 'offline') return <OfflineScreen />;
  if (status === 'signedOut' || !user) return <LoginScreen />;
  if (!user.profileCompleted) return <ProfileSetupScreen mode="setup" />;
  return <MainApp />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppDataProvider>
          <CartProvider>
            <Root />
          </CartProvider>
        </AppDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.primaryBg,
  },
  contentContainer: {
    flex: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: THEME.colors.primaryBg },
  om: { fontSize: 56, color: THEME.colors.primarySaffron },
  offlineTitle: { fontSize: 20, fontWeight: '800', color: THEME.colors.heading, marginTop: 8 },
  offlineText: { fontSize: 14, color: THEME.colors.bodyText, textAlign: 'center', marginTop: 6 },
  offlineBtn: { alignSelf: 'stretch', marginTop: 20 },
});
