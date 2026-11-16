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
import { useLanguage } from '../../context/LanguageContext';

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
    meaning: 'हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ परमात्मा का ध्यान करते हैं।',
    recommendedTarget: 108,
  },
  {
    id: 'mrityunjaya',
    name: 'महामृत्युंजय मन्त्र',
    deity: 'त्र्यम्बकेश्वर महादेव',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaning: 'सुगंधित व पुष्टिदाता त्रिनेत्र शिव की हम वंदना करते हैं।',
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
    meaning: 'धन, धान्य, समृद्धि और सौभाग्य प्रदायिनी माँ लक्ष्मी को नमन।',
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
  const { language } = useLanguage();
  const isHi = language === 'hi';

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

  // Load lifetime japa count from storage
  useEffect(() => {
    SecureStore.getItemAsync('vedrit_lifetime_chants')
      .then((val) => {
        if (val) setTotalLifetimeChants(parseInt(val, 10) || 0);
      })
      .catch(() => {});
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS === 'web') return;
    const duration = hapticIntensity === 'SOFT' ? 15 : hapticIntensity === 'MEDIUM' ? 35 : 70;
    Vibration.vibrate(duration);
  };

  const handleBeadTap = () => {
    triggerHaptic();

    Animated.sequence([
      Animated.timing(beadScale, { toValue: 1.08, duration: 60, useNativeDriver: true }),
      Animated.timing(beadScale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();

    const nextCount = currentCount + 1;
    const nextLifetime = totalLifetimeChants + 1;

    setTotalLifetimeChants(nextLifetime);
    SecureStore.setItemAsync('vedrit_lifetime_chants', nextLifetime.toString()).catch(() => {});

    if (nextCount >= targetCount) {
      // Completed 1 full mala!
      const nextMalas = completedMalas + 1;
      setCompletedMalas(nextMalas);
      setCurrentCount(0);

      // Extra festive vibration
      if (Platform.OS !== 'web') Vibration.vibrate([0, 80, 50, 80]);

      // Sync sadhana streak to backend
      api.recordNityaPuja().catch(() => {});
    } else {
      setCurrentCount(nextCount);
    }
  };

  const handleReset = () => {
    setCurrentCount(0);
    triggerHaptic();
  };

  const progressPercent = Math.min(100, Math.round((currentCount / targetCount) * 100));

  // Render bead dots around circle (16 dots)
  const BEAD_COUNT = 16;
  const RADIUS = width * 0.38;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Serene Sandalwood & Ivory Canvas */}
        <LinearGradient
          colors={['#FFFDF9', '#FAF5EC', '#F4EDE2']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.8}>
            <X size={18} color="#2A170F" />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={styles.topTitle}>
              {isHi ? `${targetCount} मनके साधना` : `${targetCount} Sacred Beads Sadhana`}
            </Text>
            <Text style={styles.topSubtitle}>
              {isHi ? 'स्मार्ट रुद्राक्ष जप माला' : 'Smart Rudraksha Mala Counter'}
            </Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity onPress={handleReset} style={styles.iconBtn} activeOpacity={0.8}>
              <RotateCcw size={16} color="#786B60" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSoundEnabled(!soundEnabled)}
              style={styles.iconBtn}
              activeOpacity={0.8}
            >
              {soundEnabled ? <Volume2 size={16} color="#C65D24" /> : <VolumeX size={16} color="#786B60" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Mantra Selector Bar */}
        <TouchableOpacity
          onPress={() => setShowMantraPicker(true)}
          style={styles.mantraSelectBar}
          activeOpacity={0.85}
        >
          <View style={styles.mantraSelectLeft}>
            <View style={styles.mantraFlameIcon}>
              <Flame size={14} color="#C65D24" />
            </View>
            <View style={styles.mantraTextCol}>
              <Text style={styles.mantraSelectName} numberOfLines={1}>
                {selectedMantra.name}
              </Text>
              <Text style={styles.mantraSelectDeity} numberOfLines={1}>
                {selectedMantra.deity}
              </Text>
            </View>
          </View>
          <View style={styles.mantraChangeTag}>
            <Text style={styles.mantraChangeText}>{isHi ? 'मन्त्र बदलें' : 'Change'}</Text>
            <ChevronRight size={13} color="#C65D24" />
          </View>
        </TouchableOpacity>

        {/* Sanskrit Shloka Box */}
        <View style={styles.mantraTextBox}>
          <Text style={styles.sanskritText}>{selectedMantra.sanskrit}</Text>
          <Text style={styles.translitText}>{selectedMantra.transliteration}</Text>
        </View>

        {/* Target Presets Row (27, 54, 108, 1008) */}
        <View style={styles.targetRow}>
          {TARGET_PRESETS.map((p) => {
            const isSel = p === targetCount;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setTargetCount(p);
                  setCurrentCount(0);
                  triggerHaptic();
                }}
                style={[styles.targetChip, isSel && styles.targetChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.targetChipText, isSel && styles.targetChipTextActive]}>
                  {p === 27 ? (isHi ? 'त्वरित (27)' : 'Quick (27)') : p === 54 ? (isHi ? 'अर्ध (54)' : 'Half (54)') : p === 108 ? (isHi ? 'पूर्ण (108)' : 'Full (108)') : '1008'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Sacred Beads Tap Area */}
        <View style={styles.beadContainer}>
          {/* Circular Rudraksha Beads */}
          <View style={[styles.beadCircleTrack, { width: RADIUS * 2, height: RADIUS * 2 }]}>
            {Array.from({ length: BEAD_COUNT }).map((_, i) => {
              const angle = (i * 2 * Math.PI) / BEAD_COUNT - Math.PI / 2;
              const x = RADIUS + (RADIUS - 16) * Math.cos(angle) - 6;
              const y = RADIUS + (RADIUS - 16) * Math.sin(angle) - 6;
              const beadIndexProgress = Math.round((i / BEAD_COUNT) * targetCount);
              const isPassed = currentCount >= beadIndexProgress && currentCount > 0;

              return (
                <View
                  key={i}
                  style={[
                    styles.rudrakshaBead,
                    { left: x, top: y },
                    isPassed && styles.rudrakshaBeadActive,
                  ]}
                />
              );
            })}
          </View>

          {/* Interactive Center Touch Circle */}
          <TouchableOpacity
            onPress={handleBeadTap}
            activeOpacity={0.88}
            style={styles.touchArea}
          >
            <Animated.View style={[styles.mainDial, { transform: [{ scale: beadScale }] }]}>
              <LinearGradient
                colors={['#D96B27', '#B84E18', '#96390C']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.dialOm}>ॐ</Text>
              <Text style={styles.dialCount}>{currentCount}</Text>
              <Text style={styles.dialTarget}>
                {isHi ? `लक्ष्य: ${targetCount}` : `Target: ${targetCount}`}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.touchPrompt}>
            {isHi ? 'स्पर्श करें अथवा मनका आगे बढ़ाएं' : 'Tap dial or swipe bead to chant'}
          </Text>
        </View>

        {/* Mala Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {isHi ? 'वर्तमान माला प्रगति' : 'Current Mala Progress'}
            </Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Bottom Stats Footer */}
        <View style={styles.bottomStatsBar}>
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Award size={13} color="#C65D24" />
            </View>
            <Text style={styles.statVal}>{completedMalas}</Text>
            <Text style={styles.statSub}>{isHi ? 'संपूर्ण माला' : 'Malas Done'}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Sparkles size={13} color="#C65D24" />
            </View>
            <Text style={styles.statVal}>{totalLifetimeChants}</Text>
            <Text style={styles.statSub}>{isHi ? 'कुल पावन जप' : 'Total Japa'}</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Haptic Toggle */}
          <TouchableOpacity
            onPress={() => {
              const next =
                hapticIntensity === 'SOFT' ? 'MEDIUM' : hapticIntensity === 'MEDIUM' ? 'STRONG' : 'SOFT';
              setHapticIntensity(next);
              Vibration.vibrate(25);
            }}
            style={styles.statItem}
            activeOpacity={0.8}
          >
            <Text style={styles.hapticVal}>{hapticIntensity}</Text>
            <Text style={styles.statSub}>{isHi ? 'कंपन (Haptic)' : 'Haptic Feel'}</Text>
          </TouchableOpacity>
        </View>

        {/* MANTRA PICKER BOTTOM SHEET MODAL */}
        <Modal
          visible={showMantraPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowMantraPicker(false)}
        >
          <View style={styles.pickerBackdrop}>
            <View style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  {isHi ? 'पवित्र वैदिक मन्त्र चयन' : 'Select Sacred Mantra'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowMantraPicker(false)}
                  style={styles.pickerClose}
                  activeOpacity={0.8}
                >
                  <X size={18} color="#786B60" />
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
                        triggerHaptic();
                      }}
                      style={[styles.mantraOption, isCur && styles.mantraOptionActive]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.mantraOptLeft}>
                        <Text style={[styles.mantraOptName, isCur && styles.mantraOptNameActive]}>
                          {m.name}
                        </Text>
                        <Text style={styles.mantraOptDeity}>{m.deity}</Text>
                        <Text style={styles.mantraOptSanskrit} numberOfLines={1}>
                          {m.sanskrit}
                        </Text>
                      </View>
                      {isCur && <Check size={18} color="#C65D24" />}
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
    backgroundColor: '#FFFDF9',
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DD',
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5ED',
    borderWidth: 1,
    borderColor: '#EFE4D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleBox: {
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A170F',
  },
  topSubtitle: {
    fontSize: 11,
    color: '#786B60',
    marginTop: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mantraSelectBar: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EFE3D8',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  mantraSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  mantraFlameIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mantraTextCol: {
    flex: 1,
  },
  mantraSelectName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A170F',
  },
  mantraSelectDeity: {
    fontSize: 10.5,
    color: '#786B60',
    marginTop: 1,
  },
  mantraChangeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F5DDC7',
  },
  mantraChangeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#C65D24',
  },
  mantraTextBox: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE3D8',
    alignItems: 'center',
  },
  sanskritText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9A3412',
    textAlign: 'center',
    lineHeight: 22,
  },
  translitText: {
    fontSize: 11,
    color: '#786B60',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 3,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  targetChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE2D7',
  },
  targetChipActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  targetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#554A41',
  },
  targetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  beadContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  beadCircleTrack: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EADBCE',
    borderStyle: 'dashed',
  },
  rudrakshaBead: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1BFA8',
    borderWidth: 1,
    borderColor: '#BAA288',
  },
  rudrakshaBeadActive: {
    backgroundColor: '#C65D24',
    borderColor: '#9E3B09',
  },
  touchArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainDial: {
    width: width * 0.44,
    height: width * 0.44,
    borderRadius: (width * 0.44) / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FDEBDD',
    shadowColor: '#C65D24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  dialOm: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 28,
  },
  dialCount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  dialTarget: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 2,
  },
  touchPrompt: {
    fontSize: 11,
    color: '#8A7D70',
    marginTop: 18,
    fontWeight: '500',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 11,
    color: '#786B60',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 11,
    color: '#C65D24',
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EFE7DD',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C65D24',
    borderRadius: 2.5,
  },
  bottomStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE7DD',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBox: {
    marginBottom: 2,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A170F',
  },
  hapticVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C65D24',
  },
  statSub: {
    fontSize: 10,
    color: '#786B60',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EFE7DD',
  },

  // Picker Modal
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '75%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8DE',
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A170F',
  },
  pickerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5ED',
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E8DE',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  mantraOptionActive: {
    borderColor: '#C65D24',
    backgroundColor: '#FEF3EB',
  },
  mantraOptLeft: {
    flex: 1,
    paddingRight: 10,
  },
  mantraOptName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2A170F',
  },
  mantraOptNameActive: {
    color: '#C65D24',
    fontWeight: '700',
  },
  mantraOptDeity: {
    fontSize: 11,
    color: '#786B60',
    marginTop: 2,
  },
  mantraOptSanskrit: {
    fontSize: 12,
    color: '#9A3412',
    marginTop: 3,
  },
});
