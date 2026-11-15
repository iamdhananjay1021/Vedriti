import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Vibration,
  Share,
  Platform,
} from 'react-native';
import {
  X,
  Flame,
  Bell,
  Sparkles,
  Share2,
  Calendar,
  CheckCircle,
  Wind,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { THEME } from '../../constants/theme';
import { api } from '../../services/api';

const { width, height } = Dimensions.get('window');

const DEITIES = [
  {
    id: 'shiva',
    name: 'भगवान शिव (महादेव)',
    title: 'काशी विश्वनाथ धाम',
    mantra: 'ॐ नमः शिवाय',
    shloka: 'कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्। सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥',
    meaning: 'कर्पूर के समान उज्ज्वल, करुणा के अवतार, भुजंगों के हार वाले शिव को भवानी सहित प्रणाम।',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=80',
    color: '#D97706',
  },
  {
    id: 'ganesha',
    name: 'श्री गणेश (विघ्नहर्ता)',
    title: 'सिद्धिविनायक धाम',
    mantra: 'ॐ गं गणपतये नमः',
    shloka: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    meaning: 'विशाल शरीर, कोटि सूर्यों के समान तेजस्वी प्रभु गणेश हमारे सभी कार्यों को निर्विघ्न करें।',
    image: 'https://images.unsplash.com/photo-1567591414240-e2b7e5c3e601?w=800&auto=format&fit=crop&q=80',
    color: '#DC2626',
  },
  {
    id: 'hanuman',
    name: 'संकटमोचन हनुमान',
    title: 'ताड़िया हनुमान मंदिर',
    mantra: 'ॐ हं हनुमते नमः',
    shloka: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्। वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥',
    meaning: 'मन के समान शीघ्रगामी, इन्द्रियजयी, पवनपुत्र श्रीरामदूत हनुमान जी की शरण ग्रहण करता हूँ।',
    image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800&auto=format&fit=crop&q=80',
    color: '#EA580C',
  },
  {
    id: 'lakshmi',
    name: 'माँ महालक्ष्मी',
    title: 'अष्टलक्ष्मी पावन धाम',
    mantra: 'ॐ श्रीं महालक्ष्म्यै नमः',
    shloka: 'नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥',
    meaning: 'श्रीपीठ पर स्थित, देवताओं द्वारा पूजित, शंख-चक्र-गदाधारिणी माता महालक्ष्मी को नमन।',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80',
    color: '#CA8A04',
  },
  {
    id: 'krishna',
    name: 'श्री बांके बिहारी (कृष्ण)',
    title: 'वृन्दावन धाम',
    mantra: 'ॐ नमो भगवते वासुदेवाय',
    shloka: 'कस्तूरीतिलकं ललाटपटले वक्षःस्थले कौस्तुभं नासाग्रे वरमौक्तिकं करतले वेणुं करे कङ्कणम्॥',
    meaning: 'माथे पर कस्तूरी तिलक, वक्ष पर कौस्तुभ मणि और करकमलों में वेणु धारण करने वाले कृष्ण को नमन।',
    image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=800&auto=format&fit=crop&q=80',
    color: '#2563EB',
  },
  {
    id: 'durga',
    name: 'माँ भगवती दुर्गा',
    title: 'शक्तिपीठ विन्ध्याचल',
    mantra: 'ॐ दुं दुर्गायै नमः',
    shloka: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
    meaning: 'सब मंगलों में मंगल, सब अर्थों को सिद्ध करने वाली, त्रिनेत्रा माँ नारायणी को सादर प्रणाम।',
    image: 'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=800&auto=format&fit=crop&q=80',
    color: '#B91C1C',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const VirtualMandirModal: React.FC<Props> = ({ visible, onClose }) => {
  const [selectedDeity, setSelectedDeity] = useState(DEITIES[0]);
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [isDhoopLit, setIsDhoopLit] = useState(false);
  const [isChanting, setIsChanting] = useState(true);
  const [streakDays, setStreakDays] = useState(1);
  const [totalDiyaCount, setTotalDiyaCount] = useState(1);
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false);
  const [flowersActive, setFlowersActive] = useState(false);

  // Animated values
  const bellRotation = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameOpacity = useRef(new Animated.Value(0)).current;
  const auraGlow = useRef(new Animated.Value(0)).current;
  const dhoopSmoke = useRef(new Animated.Value(0)).current;
  const flowerAnimations = useRef(
    Array.from({ length: 14 }).map(() => ({
      y: new Animated.Value(-50),
      x: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
  ).current;

  // Load streak state from local storage and sync with backend
  useEffect(() => {
    if (!visible) return;

    const loadLocalStreak = async () => {
      try {
        const lastDate = await SecureStore.getItemAsync('vedrit.mandir.lastDate');
        const streakStr = await SecureStore.getItemAsync('vedrit.mandir.streak');
        const countStr = await SecureStore.getItemAsync('vedrit.mandir.totalDiya');

        const todayStr = new Date().toISOString().slice(0, 10);
        if (streakStr) setStreakDays(parseInt(streakStr, 10) || 1);
        if (countStr) setTotalDiyaCount(parseInt(countStr, 10) || 1);

        if (lastDate === todayStr) {
          setAlreadyDoneToday(true);
          setIsDiyaLit(true);
          setIsDhoopLit(true);
          flameOpacity.setValue(1);
          auraGlow.setValue(1);
          dhoopSmoke.setValue(1);
        } else {
          setAlreadyDoneToday(false);
          setIsDiyaLit(false);
          flameOpacity.setValue(0);
          auraGlow.setValue(0);
        }
      } catch (err) {
        console.warn('Local streak load err:', err);
      }
    };

    loadLocalStreak();
  }, [visible]);

  // Continuous subtle flame flicker loop when diya is lit
  useEffect(() => {
    if (!isDiyaLit) return;
    const flickerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.12, duration: 250, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 0.94, duration: 220, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1.05, duration: 200, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1, duration: 240, useNativeDriver: true }),
      ])
    );
    flickerAnimation.start();
    return () => flickerAnimation.stop();
  }, [isDiyaLit]);

  // Ring the sacred bell with swing & haptics
  const ringBell = () => {
    Vibration.vibrate([0, 30, 40, 30]);

    Animated.sequence([
      Animated.timing(bellRotation, { toValue: -18, duration: 90, useNativeDriver: true }),
      Animated.timing(bellRotation, { toValue: 18, duration: 110, useNativeDriver: true }),
      Animated.timing(bellRotation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(bellRotation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(bellRotation, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  // Light Diya with sacred animation, streak increment, and backend sync
  const lightDiya = async () => {
    if (isDiyaLit && alreadyDoneToday) {
      // Re-trigger haptic prayer confirmation
      Vibration.vibrate(50);
      return;
    }

    Vibration.vibrate([0, 50, 70, 60]);
    setIsDiyaLit(true);

    Animated.parallel([
      Animated.timing(flameOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(auraGlow, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    // Trigger flower shower automatically on diya light!
    triggerPushparpan();

    const todayStr = new Date().toISOString().slice(0, 10);
    const newStreak = alreadyDoneToday ? streakDays : streakDays + 1;
    const newCount = totalDiyaCount + 1;

    setStreakDays(newStreak);
    setTotalDiyaCount(newCount);
    setAlreadyDoneToday(true);

    // Save locally
    try {
      await SecureStore.setItemAsync('vedrit.mandir.lastDate', todayStr);
      await SecureStore.setItemAsync('vedrit.mandir.streak', String(newStreak));
      await SecureStore.setItemAsync('vedrit.mandir.totalDiya', String(newCount));
    } catch {}

    // Sync with backend API
    try {
      const res = await api.recordNityaPuja(selectedDeity.name);
      if (res && res.streak) {
        setStreakDays(res.streak);
        if (res.totalDiyaLit) setTotalDiyaCount(res.totalDiyaLit);
      }
    } catch (err) {
      console.warn('Backend sync nitya-puja warning:', err);
    }
  };

  // Light Dhoop / Incense stick
  const lightDhoop = () => {
    Vibration.vibrate(40);
    setIsDhoopLit(true);
    Animated.timing(dhoopSmoke, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  // Pushparpan (Flower Shower)
  const triggerPushparpan = () => {
    setFlowersActive(true);
    Vibration.vibrate([0, 20, 30, 20]);

    flowerAnimations.forEach((f, i) => {
      f.y.setValue(-40 - Math.random() * 60);
      f.x.setValue((Math.random() - 0.5) * (width * 0.7));
      f.opacity.setValue(1);
      f.rotate.setValue(0);

      Animated.parallel([
        Animated.timing(f.y, {
          toValue: height * 0.55 + Math.random() * 40,
          duration: 1600 + i * 110,
          useNativeDriver: true,
        }),
        Animated.timing(f.rotate, {
          toValue: 360 * (i % 2 === 0 ? 1 : -1),
          duration: 1600 + i * 110,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1200 + i * 100),
          Animated.timing(f.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start(() => {
        if (i === flowerAnimations.length - 1) setFlowersActive(false);
      });
    });
  };

  // Share Mandir Darshan with friends/family
  const shareDarshan = async () => {
    try {
      await Share.share({
        message: `🙏 ॐ वेदरीति दैनिक डिजिटल मंदिर दर्शन 🙏\n\nमैंने आज ${selectedDeity.name} के समक्ष दीप प्रज्ज्वलित कर नित्य पूजा सम्पन्न की।\n\n"${selectedDeity.shloka}"\n\nअर्थ: ${selectedDeity.meaning}\n\nआप भी अपने घर में डिजिटल मंदिर दर्शन करें: https://vedriti.com`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const bellSpin = bellRotation.interpolate({
    inputRange: [-30, 30],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Divine Background Gradient */}
        <LinearGradient
          colors={['#1c0c04', '#2a1205', '#160802']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={20} color="#FDE68A" />
          </TouchableOpacity>

          <View style={styles.topCenterTitle}>
            <View style={styles.topOmRow}>
              <Text style={styles.topOmText}>ॐ</Text>
              <Text style={styles.topTitle}>दैनिक डिजिटल मंदिर</Text>
            </View>
            <Text style={styles.topSubtitle}>{selectedDeity.title}</Text>
          </View>

          <TouchableOpacity onPress={shareDarshan} style={styles.shareBtn} activeOpacity={0.8}>
            <Share2 size={18} color="#FDE68A" />
          </TouchableOpacity>
        </View>

        {/* Nitya Puja Streak Banner */}
        <View style={styles.streakStrip}>
          <View style={styles.streakLeft}>
            <Flame size={16} color="#F59E0B" />
            <Text style={styles.streakText}>
              <Text style={styles.streakBold}>{streakDays} दिन</Text> की अखंड नित्य साधना
            </Text>
          </View>
          <View style={styles.streakPill}>
            {alreadyDoneToday ? (
              <View style={styles.doneBadge}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.doneText}>आज का दीप प्रज्ज्वलित</Text>
              </View>
            ) : (
              <Text style={styles.pendingText}>दीप प्रज्ज्वलित करें</Text>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Deities Horizontal Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.deitiesRow}
          >
            {DEITIES.map((d) => {
              const isSelected = d.id === selectedDeity.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => {
                    setSelectedDeity(d);
                    Vibration.vibrate(25);
                  }}
                  activeOpacity={0.8}
                  style={[styles.deityPill, isSelected && styles.deityPillSelected]}
                >
                  <Text style={[styles.deityPillText, isSelected && styles.deityPillTextSelected]}>
                    {d.name.split('(')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SACRED SANCTUM SANCTORUM (गर्भगृह) */}
          <View style={styles.mandirFrame}>
            {/* Hanging Temple Bell (Interactive Tap) */}
            <TouchableOpacity onPress={ringBell} activeOpacity={0.7} style={styles.bellTouch}>
              <Animated.View style={{ transform: [{ rotate: bellSpin }] }}>
                <View style={styles.bellRope} />
                <View style={styles.bellDome}>
                  <Bell size={26} color="#F59E0B" />
                </View>
                <Text style={styles.bellHint}>घंटी बजाएं</Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Sacred Deity Darshan Idol / Murti */}
            <View style={styles.murtiContainer}>
              <Image source={{ uri: selectedDeity.image }} style={styles.murtiImage} />

              {/* Glowing Aura Ring around Idol when Diya is lit */}
              <Animated.View
                style={[
                  styles.auraRing,
                  {
                    opacity: auraGlow,
                    borderColor: selectedDeity.color,
                  },
                ]}
              />

              {/* Pushparpan (Flower Shower Overlay) */}
              {flowersActive &&
                flowerAnimations.map((f, idx) => {
                  const spin = f.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  });
                  return (
                    <Animated.View
                      key={idx}
                      style={[
                        styles.flowerPetal,
                        {
                          opacity: f.opacity,
                          transform: [{ translateY: f.y }, { translateX: f.x }, { rotate: spin }],
                        },
                      ]}
                    >
                      <Text style={styles.flowerEmoji}>{idx % 2 === 0 ? '🌼' : '🌹'}</Text>
                    </Animated.View>
                  );
                })}
            </View>

            {/* Deity Name Banner */}
            <View style={styles.deityTitleBadge}>
              <Sparkles size={14} color="#F59E0B" />
              <Text style={styles.deityNameText}>{selectedDeity.name}</Text>
            </View>
            <Text style={styles.deityMantraPill}>{selectedDeity.mantra}</Text>

            {/* SACRED ALTAR: Diya & Dhoop */}
            <View style={styles.altarRow}>
              {/* Left: Dhoop / Incense */}
              <TouchableOpacity onPress={lightDhoop} activeOpacity={0.8} style={styles.dhoopBox}>
                <Animated.View
                  style={[
                    styles.smokeContainer,
                    {
                      opacity: dhoopSmoke,
                    },
                  ]}
                >
                  <Wind size={16} color="#E2E8F0" />
                </Animated.View>
                <View style={styles.dhoopStand}>
                  <Text style={styles.dhoopStick}>{isDhoopLit ? '🔥' : '🥢'}</Text>
                </View>
                <Text style={styles.altarLabel}>{isDhoopLit ? 'धूप प्रज्वलित' : 'धूप लगाएं'}</Text>
              </TouchableOpacity>

              {/* Center: AARTI DIYA (दीपक) */}
              <TouchableOpacity onPress={lightDiya} activeOpacity={0.85} style={styles.diyaBox}>
                {/* Radiant Halo */}
                <Animated.View
                  style={[
                    styles.diyaHalo,
                    {
                      opacity: auraGlow,
                      transform: [{ scale: flameScale }],
                    },
                  ]}
                />

                {/* Animated Flickering Pure Flame */}
                <Animated.View
                  style={[
                    styles.flameContainer,
                    {
                      opacity: flameOpacity,
                      transform: [{ scale: flameScale }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#FEF08A', '#F59E0B', '#DC2626']}
                    style={styles.flameShape}
                  />
                </Animated.View>

                {/* Pure Brass Diya Bowl */}
                <View style={styles.brassDiya}>
                  <Text style={styles.diyaWick}>🪔</Text>
                </View>

                <Text style={[styles.altarLabel, isDiyaLit && styles.altarLabelLit]}>
                  {isDiyaLit ? 'दीप ज्योतिः परंब्रह्म' : 'दीप प्रज्ज्वलित करें'}
                </Text>
              </TouchableOpacity>

              {/* Right: Pushparpan (Flower Offering) Button */}
              <TouchableOpacity
                onPress={triggerPushparpan}
                activeOpacity={0.8}
                style={styles.flowerBox}
              >
                <View style={styles.flowerIconCircle}>
                  <Text style={styles.flowerOfferingEmoji}>🌸</Text>
                </View>
                <Text style={styles.altarLabel}>पुष्पार्पण</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SHLOKA & AARTI CARD */}
          <View style={styles.shlokaCard}>
            <View style={styles.shlokaHeader}>
              <View style={styles.shlokaTag}>
                <Sparkles size={13} color="#F59E0B" />
                <Text style={styles.shlokaTagText}>दैनिक पावन श्लोक</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsChanting(!isChanting)}
                style={styles.chantToggle}
                activeOpacity={0.8}
              >
                {isChanting ? <Volume2 size={16} color="#F59E0B" /> : <VolumeX size={16} color="#9CA3AF" />}
                <Text style={styles.chantToggleText}>{isChanting ? 'उच्चारण' : 'मूक'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.shlokaSanskrit}>{selectedDeity.shloka}</Text>
            <View style={styles.shlokaDivider} />
            <Text style={styles.shlokaMeaning}>
              <Text style={styles.meaningLabel}>भावार्थ: </Text>
              {selectedDeity.meaning}
            </Text>
          </View>

          {/* Devotee Nitya Puja Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{streakDays}</Text>
              <Text style={styles.statDesc}>दिवसीय अखंड संकल्प</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{totalDiyaCount}</Text>
              <Text style={styles.statDesc}>कुल प्रज्ज्वलित दीप</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>100%</Text>
              <Text style={styles.statDesc}>पुण्य संचय</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#160802',
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.15)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenterTitle: {
    alignItems: 'center',
  },
  topOmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topOmText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F59E0B',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FEF3C7',
    letterSpacing: 0.3,
  },
  topSubtitle: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 1,
  },
  streakStrip: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.1)',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: 12,
    color: '#FDE68A',
  },
  streakBold: {
    fontWeight: '800',
    color: '#F59E0B',
  },
  streakPill: {},
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  doneText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  deitiesRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  deityPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deityPillSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  deityPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  deityPillTextSelected: {
    color: '#1E1B4B',
    fontWeight: '800',
  },
  mandirFrame: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 24,
    backgroundColor: 'rgba(25, 10, 3, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bellTouch: {
    position: 'absolute',
    top: 12,
    right: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  bellRope: {
    width: 2,
    height: 18,
    backgroundColor: '#D97706',
    alignSelf: 'center',
  },
  bellDome: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  bellHint: {
    fontSize: 9,
    color: '#F59E0B',
    marginTop: 2,
    fontWeight: '600',
  },
  murtiContainer: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: (width * 0.72) / 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  murtiImage: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.72) / 2,
  },
  auraRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: (width * 0.72) / 2,
    borderWidth: 4,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  flowerPetal: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  flowerEmoji: {
    fontSize: 22,
  },
  deityTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  deityNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  deityMantraPill: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 2,
    fontStyle: 'italic',
  },
  altarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.15)',
  },
  dhoopBox: {
    alignItems: 'center',
    width: 80,
  },
  smokeContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dhoopStand: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dhoopStick: {
    fontSize: 24,
  },
  diyaBox: {
    alignItems: 'center',
    position: 'relative',
    width: 120,
  },
  diyaHalo: {
    position: 'absolute',
    top: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
    zIndex: 1,
  },
  flameContainer: {
    position: 'absolute',
    top: -12,
    zIndex: 2,
  },
  flameShape: {
    width: 18,
    height: 28,
    borderRadius: 9,
  },
  brassDiya: {
    zIndex: 3,
    marginTop: 4,
  },
  diyaWick: {
    fontSize: 42,
  },
  flowerBox: {
    alignItems: 'center',
    width: 80,
  },
  flowerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  flowerOfferingEmoji: {
    fontSize: 20,
  },
  altarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D1D5DB',
    marginTop: 6,
    textAlign: 'center',
  },
  altarLabelLit: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  shlokaCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: 16,
  },
  shlokaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shlokaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shlokaTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  chantToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  chantToggleText: {
    fontSize: 11,
    color: '#FDE68A',
    fontWeight: '600',
  },
  shlokaSanskrit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FEF3C7',
    lineHeight: 23,
    textAlign: 'center',
  },
  shlokaDivider: {
    height: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    marginVertical: 10,
  },
  shlokaMeaning: {
    fontSize: 12,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  meaningLabel: {
    fontWeight: '700',
    color: '#F59E0B',
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  statDesc: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
});
