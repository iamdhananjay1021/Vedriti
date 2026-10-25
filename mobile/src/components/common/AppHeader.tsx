import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Bell,
  ChevronLeft,
  MapPin,
  ChevronDown,
  Sparkles,
  Music,
  Check,
  Flame,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { TODAYS_PANCHANG } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  isHome?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onJapaPress?: () => void;
  onChatPress?: () => void;
  onProfilePress?: () => void;
  selectedSanctum?: string;
  onSelectSanctum?: (city: string) => void;
}

const SANCTUMS = [
  { id: 'kashi', name: 'Kashi Vishwanath Sanctum', city: 'Varanasi', tag: 'Moksha Kshetra' },
  { id: 'ayodhya', name: 'Shri Ram Janmabhoomi', city: 'Ayodhya', tag: 'Dharma Kshetra' },
  { id: 'haridwar', name: 'Har Ki Pauri & Ganga Tirtha', city: 'Haridwar', tag: 'Tirtha Kshetra' },
  { id: 'ujjain', name: 'Mahakaleshwar Jyotirlinga', city: 'Ujjain', tag: 'Mahakaal Kshetra' },
  { id: 'tirupati', name: 'Sri Venkateswara Temple', city: 'Tirumala', tag: 'Kaliyuga Vaikuntha' },
  { id: 'delhi', name: 'Delhi-NCR Vedic Kendra', city: 'Noida/Gurgaon', tag: 'Home Sanctum' },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  isHome = false,
  showBack = false,
  onBackPress,
  onSearchPress,
  onNotificationPress,
  onJapaPress,
  onChatPress,
  onProfilePress,
  selectedSanctum = 'Kashi Vishwanath Sanctum',
  onSelectSanctum,
}) => {
  const { user, openAuthModal } = useAuth();
  const [sanctumModalVisible, setSanctumModalVisible] = useState(false);
  const [currentSanctum, setCurrentSanctum] = useState(selectedSanctum);

  // Pulse animation for the active Muhurat badge
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleSelectCity = (sanctumName: string) => {
    setCurrentSanctum(sanctumName);
    setSanctumModalVisible(false);
    if (onSelectSanctum) {
      onSelectSanctum(sanctumName);
    }
  };

  return (
    <View style={styles.headerWrapper}>
      {/* Main Luxury Header Surface */}
      <View style={styles.mainSurface}>
        {/* Left Column: Brand or Back Button + Title */}
        <View style={styles.leftCol}>
          {showBack && onBackPress ? (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              style={styles.backCircle}
              accessibilityLabel="Back"
            >
              <ChevronLeft size={20} color={THEME.colors.headingDeep} />
            </TouchableOpacity>
          ) : null}

          {isHome ? (
            <View style={styles.brandRow}>
              {/* Royal Gold Halo Lotus Crest */}
              <LinearGradient
                colors={THEME.gradients.royalGold}
                style={styles.logoHaloGradient}
              >
                <View style={styles.logoInnerPad}>
                  <Image
                    source={THEME.assets.logoLotus}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>

              {/* Brand Identity */}
              <View style={styles.brandTextCol}>
                <View style={styles.brandTitleRow}>
                  <Text style={styles.brandName}>{THEME.brand.name}</Text>
                  <View style={styles.royalCrownBadge}>
                    <Sparkles size={8} color="#D4AF37" />
                    <Text style={styles.royalCrownText}>Vedic</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.pageTitleCol}>
              <View style={styles.pageTitleRow}>
                <Text style={styles.pageTitle} numberOfLines={1}>
                  {title || THEME.brand.name}
                </Text>
                <View style={styles.titleShimmerDot} />
              </View>
              {subtitle ? (
                <Text style={styles.pageSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Right Column: Luxury Action Icons */}
        <View style={styles.actionsRow}>
          {/* Vedic AI & Acharya Chat Button (Hidden on Home since Floating Button exists) */}
          {!isHome && onChatPress && (
            <TouchableOpacity
              onPress={onChatPress}
              activeOpacity={0.75}
              style={[styles.iconCircle, styles.chatIconCircle]}
              accessibilityLabel="Ask Vedic AI Rishi"
            >
              <Sparkles size={15} color="#D4AF37" strokeWidth={2.4} />
            </TouchableOpacity>
          )}

          {/* Quick Japa Mantra Audio Player Button (Hidden on Home to prevent crowding) */}
          {!isHome && onJapaPress && (
            <TouchableOpacity
              onPress={onJapaPress}
              activeOpacity={0.75}
              style={[styles.iconCircle, styles.japaIconCircle]}
              accessibilityLabel="Daily Vedic Chants & Japa"
            >
              <Music size={15} color={THEME.colors.royalVermilion} strokeWidth={2.2} />
              <View style={styles.japaMiniBadge}>
                <Flame size={7} color="#FFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* Global Search */}
          {onSearchPress ? (
            <TouchableOpacity
              onPress={onSearchPress}
              activeOpacity={0.75}
              style={styles.iconCircle}
              accessibilityLabel="Search rituals and sacred samagri"
            >
              <Search size={16} color="#4A3428" strokeWidth={2.2} />
            </TouchableOpacity>
          ) : null}

          {/* Auspicious Notification Bell */}
          {onNotificationPress ? (
            <TouchableOpacity
              onPress={onNotificationPress}
              activeOpacity={0.75}
              style={[styles.iconCircle, styles.bellMargin]}
              accessibilityLabel="Daily Panchang & Notifications"
            >
              <Bell size={16} color="#4A3428" strokeWidth={2.2} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          ) : null}

          {/* Devotee Profile Avatar / Login Pill */}
          {user.isLoggedIn ? (
            <TouchableOpacity
              onPress={onProfilePress}
              activeOpacity={0.8}
              style={styles.profileAvatarCircle}
              accessibilityLabel="Devotee Sanctum Vault"
            >
              <Text style={styles.profileAvatarLetter}>
                {user.name ? user.name.charAt(0) : 'ॐ'}
              </Text>
              <View style={styles.profileCrownDot}>
                <Sparkles size={6} color="#D4AF37" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={openAuthModal}
              activeOpacity={0.8}
              style={styles.loginPill}
              accessibilityLabel="Login with Static OTP"
            >
              <Flame size={11} color="#FFF" />
              <Text style={styles.loginPillText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DD',
  },
  panchangStrip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  panchangContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panchangLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  omBadge: {
    fontSize: 12,
    color: '#F7E7B4',
    fontWeight: '700',
    marginRight: 6,
  },
  panchangTithiText: {
    fontSize: 10,
    color: '#FAF3E8',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  muhuratPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 128, 61, 0.45)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.5)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginRight: 5,
  },
  muhuratText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DCFCE7',
    letterSpacing: 0.1,
  },
  mainSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE2D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  logoHaloGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    flexShrink: 0,
  },
  logoInnerPad: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 25,
    height: 25,
  },
  brandTextCol: {
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  brandName: {
    fontFamily: THEME.typography.serif,
    fontSize: 22,
    fontWeight: '800',
    color: '#261209',
    letterSpacing: 0.5,
    lineHeight: 25,
  },
  royalCrownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF2E6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E8D5BF',
    flexShrink: 0,
  },
  royalCrownText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A4A1C',
    marginLeft: 2,
    letterSpacing: 0.3,
  },
  sanctumSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF2E6',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#EAD7BF',
    alignSelf: 'flex-start',
    maxWidth: 170,
  },
  sanctumPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginHorizontal: 3,
  },
  pageTitleCol: {
    justifyContent: 'center',
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    letterSpacing: -0.2,
  },
  titleShimmerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.colors.gold,
    marginLeft: 6,
  },
  pageSubtitle: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  chatIconCircle: {
    backgroundColor: '#FAF0E4',
    borderColor: '#E8D5B5',
  },
  japaIconCircle: {
    backgroundColor: '#FDF2E9',
    borderColor: '#F6DEC8',
  },
  japaMiniBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: THEME.colors.royalVermilion,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  bellMargin: {
    marginLeft: 7,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bottomGoldBorder: {
    height: 1.5,
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 16, 9, 0.65)',
    justifyContent: 'flex-end',
  },
  sanctumSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5D6C5',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: THEME.colors.mutedText,
    marginBottom: 14,
  },
  sanctumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE5D9',
    backgroundColor: '#FCFAF7',
    marginBottom: 8,
  },
  sanctumItemSelected: {
    borderColor: THEME.colors.gold,
    backgroundColor: '#FDF6EE',
  },
  sanctumIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sanctumInfoCol: {
    flex: 1,
  },
  sanctumNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
  },
  sanctumNameTextActive: {
    color: THEME.colors.royalVermilion,
  },
  sanctumTagText: {
    fontSize: 10,
    color: THEME.colors.mutedText,
    marginTop: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.primarySaffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  profileAvatarLetter: {
    fontFamily: THEME.typography.serif,
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.royalVermilion,
  },
  profileCrownDot: {
    position: 'absolute',
    top: -3,
    right: -2,
    backgroundColor: '#261209',
    borderRadius: 6,
    padding: 1.5,
    borderWidth: 0.8,
    borderColor: '#D4AF37',
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.royalVermilion,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 6,
  },
  loginPillText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: '800',
    marginLeft: 3,
  },
});
