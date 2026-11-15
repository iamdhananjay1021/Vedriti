import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import {
  X,
  RotateCcw,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  Check,
  ChevronRight,
  Flame,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

interface MantraItem {
  id: string;
  name: string;
  deity: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  recommendedTarget: number;
}

const MANTRAS: MantraItem[] = [
  {
    id: 'shiva-panchakshari',
    name: 'शिव पञ्चाक्षरी मन्त्र',
    deity: 'भगवान शिव',
    sanskrit: 'ॐ नमः शिवाय',
    transliteration: 'Om Namah Shivaya',
    meaning: 'मैं परम चेतना, कल्याणकारी भगवान शिव को सादर नमन करता हूँ।',
    recommendedTarget: 108,
  },
  {
    id: 'gayatri',
    name: 'गायत्री महामन्त्र',
    deity: 'माता सविता व सूर्यदेव',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    transliteration: 'Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat',
    meaning: 'हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा का ध्यान करते हैं।',
    recommendedTarget: 108,
  },
  {
    id: 'mrityunjaya',
    name: 'महामृत्युंजय मन्त्र',
    deity: 'त्र्यम्बकेश्वर महादेव',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaning: 'सुगंधित व पुष्टिदाता त्रिनेत्र शिव की हम वंदना करते हैं। हमें संसार-मृत्यु के बंधनों से मुक्त करें।',
    recommendedTarget: 108,
  },
  {
    id: 'ganesh-mool',
    name: 'गणेश बीज मन्त्र',
    deity: 'विघ्नहर्ता गणपति',
    sanskrit: 'ॐ गं गणपतये नमः',
    transliteration: 'Om Gam Ganapataye Namaha',
    meaning: 'समस्त विघ्नों का नाश करने वाले देव गणपति को प्रणाम।',
    recommendedTarget: 108,
  },
  {
    id: 'hanuman-beej',
    name: 'हनुमान बीज मन्त्र',
    deity: 'संकटमोचन हनुमान',
    sanskrit: 'ॐ हं हनुमते नमः',
    transliteration: 'Om Ham Hanumate Namaha',
    meaning: 'शत्रु-भय, संकट व रोग नाशक पवनपुत्र हनुमान जी को नमन।',
    recommendedTarget: 108,
  },
  {
    id: 'lakshmi-beej',
    name: 'महालक्ष्मी मन्त्र',
    deity: 'माता महालक्ष्मी',
    sanskrit: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः',
    transliteration: 'Om Shreem Hreem Kleem Mahalakshmaye Namaha',
    meaning: 'धन, धान्य, समृद्धि और सौभाग्य प्रदायिनी माँ लक्ष्मी को सादर नमन।',
    recommendedTarget: 108,
  },
  {
    id: 'krishna-dwadasakshari',
    name: 'द्वादशाक्षर मन्त्र',
    deity: 'भगवान श्रीकृष्ण',
    sanskrit: 'ॐ नमो भगवते वासुदेवाय',
    transliteration: 'Om Namo Bhagavate Vasudevaya',
    meaning: 'सर्वव्यापी, परम दयालु भगवान वासुदेव श्रीकृष्ण को नमन।',
    recommendedTarget: 108,
  },
  {
    id: 'hare-krishna',
    name: 'महामन्त्र (हरे कृष्ण)',
    deity: 'श्री राधा-कृष्ण',
    sanskrit: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥',
    transliteration: 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare | Hare Rama Hare Rama Rama Rama Hare Hare',
    meaning: 'कलियुग में भवसागर पार कराने वाला पावन तारक महामंत्र।',
    recommendedTarget: 108,
  },
];

const TARGET_PRESETS = [27, 54, 108, 1008];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SmartJapaModal: React.FC<Props> = ({ visible, onClose }) => {
  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS[0]);
  const [targetCount, setTargetCount] = useState<number>(108);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [completedMalas, setCompletedMalas] = useState<number>(0);
  const [totalLifetimeChants, setTotalLifetimeChants] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticIntensity, setHapticIntensity] = useState<'SOFT' | 'MEDIUM' | 'STRONG'>('MEDIUM');
  const [showMantraPicker, setShowMantraPicker] = useState<boolean>(false);

  // Animation values
  const beadScale = useRef(new Animated.Value(1)).current;
  const beadElevation = useRef(new Animated.Value(0)).current;
  const malaGlow = useRef(new Animated.Value(0)).current;

  // Load lifetime japa count from storage
  useEffect(() => {
    if (!visible) return;
    const loadJapaStats = async () => {
      try {
        const storedLifetime = await SecureStore.getItemAsync('vedrit.japa.lifetime');
        const storedMalas = await SecureStore.getItemAsync('vedrit.japa.malas');
        if (storedLifetime) setTotalLifetimeChants(parseInt(storedLifetime, 10) || 0);
        if (storedMalas) setCompletedMalas(parseInt(storedMalas, 10) || 0);
      } catch (e) {
        console.warn('Japa stats load warning:', e);
      }
    };
    loadJapaStats();
  }, [visible]);

  // Handle single bead click / tap
  const handleBeadTap = () => {
    // Tactile vibration
    if (hapticIntensity === 'SOFT') {
      Vibration.vibrate(15);
    } else if (hapticIntensity === 'STRONG') {
      Vibration.vibrate(45);
    } else {
      Vibration.vibrate(25);
    }

    // Bead physics animation (bounce + glow)
    Animated.sequence([
      Animated.timing(beadScale, { toValue: 1.14, duration: 70, useNativeDriver: true }),
      Animated.timing(beadScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    const nextCount = currentCount + 1;
    const nextLifetime = totalLifetimeChants + 1;

    setTotalLifetimeChants(nextLifetime);

    if (nextCount >= targetCount) {
      // Mala completed celebration!
      Vibration.vibrate([0, 100, 80, 120]);
      const nextMalas = completedMalas + 1;
      setCompletedMalas(nextMalas);
      setCurrentCount(0);

      Animated.sequence([
        Animated.timing(malaGlow, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(malaGlow, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();

      // Persist and sync with backend
      syncBackend(nextCount, nextMalas);
    } else {
      setCurrentCount(nextCount);
      // Periodically sync every 27 chants
      if (nextCount % 27 === 0) {
        syncBackend(nextCount, completedMalas);
      }
    }
  };

  const syncBackend = async (chants: number, malas: number) => {
    try {
      await SecureStore.setItemAsync('vedrit.japa.lifetime', String(totalLifetimeChants + 1));
      await SecureStore.setItemAsync('vedrit.japa.malas', String(malas));
    } catch {}

    try {
      await api.recordJapa({
        count: chants,
        malasCompleted: malas,
        mantraId: selectedMantra.id,
      });
    } catch (e) {
      console.warn('Backend recordJapa warning:', e);
    }
  };

  // Reset current mala with edge case confirmation
  const handleReset = () => {
    if (currentCount === 0) return;
    Alert.alert(
      'माला पुनः आरम्भ करें?',
      'वर्तमान जप संख्या शून्य (0) हो जाएगी। क्या आप पुनः आरम्भ करना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'हाँ, रीसेट करें',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate(40);
            setCurrentCount(0);
          },
        },
      ]
    );
  };

  const progressPercent = Math.min(100, Math.round((currentCount / targetCount) * 100));

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#180a02', '#261004', '#120601']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.8}>
            <X size={20} color="#FDE68A" />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={styles.topTitle}>डिजिटल रुद्राक्ष माला</Text>
            <Text style={styles.topSubtitle}>108 Sacred Beads Sadhana</Text>
          </View>

          <TouchableOpacity onPress={handleReset} style={styles.iconBtn} activeOpacity={0.8}>
            <RotateCcw size={18} color="#FDE68A" />
          </TouchableOpacity>
        </View>

        {/* Mantra Switcher Pill */}
        <TouchableOpacity
          onPress={() => setShowMantraPicker(true)}
          style={styles.mantraSelectBar}
          activeOpacity={0.85}
        >
          <View style={styles.mantraSelectLeft}>
            <Sparkles size={14} color="#F59E0B" />
            <View>
              <Text style={styles.mantraSelectName}>{selectedMantra.name}</Text>
              <Text style={styles.mantraSelectDeity}>{selectedMantra.deity}</Text>
            </View>
          </View>
          <View style={styles.mantraChangeTag}>
            <Text style={styles.mantraChangeText}>मन्त्र बदलें</Text>
            <ChevronRight size={14} color="#F59E0B" />
          </View>
        </TouchableOpacity>

        {/* Mantra Sanskrit Banner */}
        <View style={styles.mantraTextBox}>
          <Text style={styles.mantraSanskrit} numberOfLines={2}>
            {selectedMantra.sanskrit}
          </Text>
          <Text style={styles.mantraTranslit} numberOfLines={1}>
            {selectedMantra.transliteration}
          </Text>
        </View>

        {/* Target Presets Selector */}
        <View style={styles.targetsRow}>
          {TARGET_PRESETS.map((t) => {
            const isSel = targetCount === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  Vibration.vibrate(20);
                  setTargetCount(t);
                  if (currentCount > t) setCurrentCount(0);
                }}
                activeOpacity={0.8}
                style={[styles.targetChip, isSel && styles.targetChipActive]}
              >
                <Text style={[styles.targetChipText, isSel && styles.targetChipTextActive]}>
                  {t === 108 ? 'पूर्ण (108)' : t === 27 ? 'त्वरित (27)' : t === 54 ? 'अर्ध (54)' : '1008'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* MAIN RUDRAKSHA JAPA DISC */}
        <View style={styles.centerBeadArea}>
          {/* Circular Track Ring */}
          <View style={styles.beadTrackCircle}>
            {/* Visual small beads around the circle */}
            {Array.from({ length: 16 }).map((_, idx) => {
              const angle = (idx * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const r = width * 0.38;
              const cx = r * Math.cos(rad);
              const cy = r * Math.sin(rad);

              const beadFilled = idx / 16 <= currentCount / targetCount;

              return (
                <View
                  key={idx}
                  style={[
                    styles.miniBead,
                    {
                      transform: [{ translateX: cx }, { translateY: cy }],
                      backgroundColor: beadFilled ? '#F59E0B' : '#78350F',
                    },
                  ]}
                />
              );
            })}

            {/* Glowing Celebration Aura on 108 */}
            <Animated.View
              style={[
                styles.glowAura,
                {
                  opacity: malaGlow,
                },
              ]}
            />

            {/* BIG CENTER TACTILE JAPA BUTTON */}
            <TouchableOpacity
              onPress={handleBeadTap}
              activeOpacity={0.85}
              style={styles.bigBeadTouch}
            >
              <Animated.View style={[styles.bigBeadBody, { transform: [{ scale: beadScale }] }]}>
                <LinearGradient
                  colors={['#9A3412', '#7C2D12', '#431407']}
                  style={styles.bigBeadGradient}
                >
                  <Text style={styles.sumeruSymbol}>ॐ</Text>
                  <Text style={styles.counterNumber}>{currentCount}</Text>
                  <Text style={styles.targetLabel}>लक्ष्य: {targetCount}</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Text style={styles.tapInstruction}>
            स्पर्श करें अथवा माला मनका आगे बढ़ाएं
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>वर्तमान माला प्रगति</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Sadhana Statistics Row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Award size={18} color="#F59E0B" />
            <Text style={styles.statVal}>{completedMalas}</Text>
            <Text style={styles.statSub}>संपूर्ण माला</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Flame size={18} color="#EA580C" />
            <Text style={styles.statVal}>{totalLifetimeChants}</Text>
            <Text style={styles.statSub}>कुल पावन जप</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Haptic Toggle */}
          <TouchableOpacity
            onPress={() => {
              const next =
                hapticIntensity === 'SOFT' ? 'MEDIUM' : hapticIntensity === 'MEDIUM' ? 'STRONG' : 'SOFT';
              setHapticIntensity(next);
              Vibration.vibrate(30);
            }}
            style={styles.statItem}
          >
            <Text style={styles.statVal}>{hapticIntensity}</Text>
            <Text style={styles.statSub}>कंपन (Haptic)</Text>
          </TouchableOpacity>
        </View>

        {/* MANTRA PICKER MODAL */}
        <Modal
          visible={showMantraPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowMantraPicker(false)}
        >
          <View style={styles.pickerBackdrop}>
            <View style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>पवित्र वैदिक मन्त्र चयन</Text>
                <TouchableOpacity onPress={() => setShowMantraPicker(false)} style={styles.pickerClose}>
                  <X size={18} color="#D1D5DB" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                {MANTRAS.map((m) => {
                  const isCur = m.id === selectedMantra.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => {
                        setSelectedMantra(m);
                        setShowMantraPicker(false);
                        Vibration.vibrate(30);
                      }}
                      style={[styles.mantraOption, isCur && styles.mantraOptionActive]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.mantraOptLeft}>
                        <Text style={styles.mantraOptName}>{m.name}</Text>
                        <Text style={styles.mantraOptDeity}>{m.deity}</Text>
                        <Text style={styles.mantraOptSanskrit} numberOfLines={1}>
                          {m.sanskrit}
                        </Text>
                      </View>
                      {isCur && <Check size={18} color="#F59E0B" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120601',
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.15)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleBox: {
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  topSubtitle: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 1,
  },
  mantraSelectBar: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  mantraSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  mantraSelectName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  mantraSelectDeity: {
    fontSize: 11,
    color: '#F59E0B',
  },
  mantraChangeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  mantraChangeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  mantraTextBox: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    alignItems: 'center',
  },
  mantraSanskrit: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FDE68A',
    textAlign: 'center',
    lineHeight: 22,
  },
  mantraTranslit: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  targetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  targetChipActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  targetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  targetChipTextActive: {
    color: '#1E1B4B',
    fontWeight: '800',
  },
  centerBeadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flex: 1,
  },
  beadTrackCircle: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: (width * 0.72) / 2,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniBead: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  glowAura: {
    ...StyleSheet.absoluteFill,
    borderRadius: (width * 0.72) / 2,
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
  },
  bigBeadTouch: {
    width: width * 0.44,
    height: width * 0.44,
    borderRadius: (width * 0.44) / 2,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  bigBeadBody: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.44) / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#D97706',
  },
  bigBeadGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sumeruSymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FEF3C7',
  },
  counterNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FEF3C7',
    marginTop: -4,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDE68A',
  },
  tapInstruction: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 14,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FEF3C7',
    marginTop: 4,
  },
  statSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#1E120A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.3)',
    maxHeight: '75%',
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  pickerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerScroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  mantraOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mantraOptionActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  mantraOptLeft: {
    flex: 1,
    marginRight: 10,
  },
  mantraOptName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  mantraOptDeity: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 1,
  },
  mantraOptSanskrit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },
});
