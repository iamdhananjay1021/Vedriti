import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import {
  Sparkles,
  CheckCircle2,
  Compass,
  HeartHandshake,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { THEME } from '../constants/theme';

interface KundliScreenProps {
  onRequestSuccess: (reportId: string) => void;
  onNotificationPress?: () => void;
}

type KundliTab = 'janam' | 'milan' | 'dosha';

export const KundliScreen: React.FC<KundliScreenProps> = ({
  onRequestSuccess,
  onNotificationPress,
}) => {
  const [activeTab, setActiveTab] = useState<KundliTab>('janam');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [pob, setPob] = useState('');
  const [query, setQuery] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Kundli Milan state
  const [boyName, setBoyName] = useState('');
  const [girlName, setGirlName] = useState('');
  const [milanResult, setMilanResult] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter Devotee Full Name.');
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onRequestSuccess('VR-KUNDLI-' + Math.floor(100 + Math.random() * 900));
    }, 1800);
  };

  const calculateMilan = () => {
    if (!boyName || !girlName) {
      Alert.alert('Details Required', 'Please enter both Bride & Groom names.');
      return;
    }
    setMilanResult(28); // 28/36 Gunas - Highly Auspicious
  };

  return (
    <AppBackground variant="golden">
      {/* Luxury App Header */}
      <AppHeader
        title="Vedic Jyotish & Kundli"
        subtitle="Detailed Horoscope & Dosha Analysis by Kashi Scholars"
        onNotificationPress={onNotificationPress}
      />

      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3-Way Tab Selector */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('janam')}
            activeOpacity={0.85}
            style={[styles.tabButton, activeTab === 'janam' && styles.tabButtonActive]}
          >
            <Compass size={13} color={activeTab === 'janam' ? '#FFFFFF' : '#7E7266'} />
            <Text style={[styles.tabText, activeTab === 'janam' && styles.tabTextActive]}>
              Janam Kundli
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('milan')}
            activeOpacity={0.85}
            style={[styles.tabButton, activeTab === 'milan' && styles.tabButtonActive]}
          >
            <HeartHandshake size={13} color={activeTab === 'milan' ? '#FFFFFF' : '#7E7266'} />
            <Text style={[styles.tabText, activeTab === 'milan' && styles.tabTextActive]}>
              Kundli Milan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('dosha')}
            activeOpacity={0.85}
            style={[styles.tabButton, activeTab === 'dosha' && styles.tabButtonActive]}
          >
            <AlertTriangle size={13} color={activeTab === 'dosha' ? '#FFFFFF' : '#7E7266'} />
            <Text style={[styles.tabText, activeTab === 'dosha' && styles.tabTextActive]}>
              Dosha Nivaran
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content 1: Janam Kundli */}
        {activeTab === 'janam' && (
          <View>
            {isSubmitted ? (
              <View style={styles.successCard}>
                <View style={styles.iconCircle}>
                  <CheckCircle2 size={36} color="#15803D" />
                </View>
                <Text style={styles.successTitle}>Kundli Consultation Initiated!</Text>
                <Text style={styles.successDesc}>
                  Our senior Jyotishacharya in Varanasi has received your birth chart data. The complete Lagna chart, Gochara transits, and remedy guidelines will appear in your Sankalp Vault within 24 hours.
                </Text>
              </View>
            ) : (
              <View style={styles.formCard}>
                {/* Visual Banner Header */}
                <View style={styles.bannerRow}>
                  <View style={styles.chartThumbContainer}>
                    <Image
                      source={THEME.assets.bannerKundli}
                      style={styles.chartThumb}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.bannerCol}>
                    <Text style={styles.bannerTitle}>Accurate Vedic Birth Chart</Text>
                    <Text style={styles.bannerSubtitle}>
                      Lagna chart, Gochara transits, Mahadasha cycles & gemstone remedies by Kashi scholars.
                    </Text>
                  </View>
                </View>

                {/* Form Fields */}
                <Text style={styles.fieldLabel}>Devotee Full Name *</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Anand Sharma"
                  style={styles.input}
                  placeholderTextColor="#A89E94"
                />

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.fieldLabel}>Date of Birth *</Text>
                    <TextInput
                      value={dob}
                      onChangeText={setDob}
                      placeholder="DD / MM / YYYY"
                      style={styles.input}
                      placeholderTextColor="#A89E94"
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.fieldLabel}>Time of Birth *</Text>
                    <TextInput
                      value={tob}
                      onChangeText={setTob}
                      placeholder="e.g. 06:45 AM"
                      style={styles.input}
                      placeholderTextColor="#A89E94"
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Place of Birth *</Text>
                <TextInput
                  value={pob}
                  onChangeText={setPob}
                  placeholder="City, State, Country"
                  style={styles.input}
                  placeholderTextColor="#A89E94"
                />

                <Text style={styles.fieldLabel}>Specific Life Guidance / Query</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="e.g. Career growth, marriage timing, foreign travel, business shubh muhurat..."
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#A89E94"
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.88}
                  style={styles.submitButton}
                >
                  <Sparkles size={13} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit for Acharya Consultation</Text>
                  <ArrowRight size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Tab Content 2: Kundli Milan (Matchmaking) */}
        {activeTab === 'milan' && (
          <View style={styles.formCard}>
            <Text style={styles.milanHeading}>Ashtakoot Guna Milan (36 Points)</Text>
            <Text style={styles.milanDesc}>
              Calculate Vedic compatibility for marriage: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot & Nadi.
            </Text>

            <Text style={styles.fieldLabel}>Groom’s Name & Birth Place</Text>
            <TextInput
              value={boyName}
              onChangeText={setBoyName}
              placeholder="Groom Name (e.g. Rahul Sharma, Delhi)"
              style={styles.input}
              placeholderTextColor="#A89E94"
            />

            <Text style={styles.fieldLabel}>Bride’s Name & Birth Place</Text>
            <TextInput
              value={girlName}
              onChangeText={setGirlName}
              placeholder="Bride Name (e.g. Priya Mishra, Varanasi)"
              style={styles.input}
              placeholderTextColor="#A89E94"
            />

            <TouchableOpacity
              onPress={calculateMilan}
              activeOpacity={0.88}
              style={styles.submitButton}
            >
              <HeartHandshake size={14} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Calculate 36 Guna Milan Score</Text>
              <ArrowRight size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {milanResult !== null && (
              <View style={styles.milanScoreBox}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreNumber}>{milanResult}</Text>
                  <Text style={styles.scoreDenom}>/ 36</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.scoreStatus}>Uttam (Highly Auspicious Match)</Text>
                  <Text style={styles.scoreDetails}>
                    Nadi Dosha: Shanta • Bhakoot: Auspicious • Graha Maitri: High Harmony.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tab Content 3: Dosha Nivaran */}
        {activeTab === 'dosha' && (
          <View>
            {/* Kaal Sarp Dosha */}
            <View style={styles.doshaCard}>
              <View style={styles.doshaHeader}>
                <AlertTriangle size={15} color="#9E2A1A" />
                <Text style={styles.doshaTitle}>Kaal Sarp Dosha Nivaran</Text>
              </View>
              <Text style={styles.doshaDesc}>
                Occurs when all seven planets are positioned between Rahu and Ketu. Can cause sudden hurdles and mental stress.
              </Text>
              <View style={styles.remedyBox}>
                <Text style={styles.remedyTitle}>🌿 Shastric Remedy:</Text>
                <Text style={styles.remedyText}>
                  Perform Kashi Vishwanath Maha Rudrabhishek and silver Naag-Nagin ritual on Nag Panchami or Shukla Trayodashi.
                </Text>
              </View>
            </View>

            {/* Mangal Dosha */}
            <View style={styles.doshaCard}>
              <View style={styles.doshaHeader}>
                <AlertTriangle size={15} color="#C65D24" />
                <Text style={styles.doshaTitle}>Mangal (Manglik) Dosha</Text>
              </View>
              <Text style={styles.doshaDesc}>
                Influenced by Mars in the 1st, 4th, 7th, 8th or 12th house of natal horoscope.
              </Text>
              <View style={styles.remedyBox}>
                <Text style={styles.remedyTitle}>🌿 Shastric Remedy:</Text>
                <Text style={styles.remedyText}>
                  Hanuman Chalisa 108 recitation, Coral (Moonga) gemstone, or Kumbh Vivah before solemnizing marriage.
                </Text>
              </View>
            </View>

            {/* Shani Sade Sati */}
            <View style={styles.doshaCard}>
              <View style={styles.doshaHeader}>
                <AlertTriangle size={15} color="#1E293B" />
                <Text style={styles.doshaTitle}>Shani Sade Sati & Dhaiya</Text>
              </View>
              <Text style={styles.doshaDesc}>
                7.5-year planetary transit of Saturn over natal moon. Tests endurance, resilience and past karma.
              </Text>
              <View style={styles.remedyBox}>
                <Text style={styles.remedyTitle}>🌿 Shastric Remedy:</Text>
                <Text style={styles.remedyText}>
                  Mustard oil lamp under Peepal tree on Saturdays, Shani Shanti Hawan, and Blue Sapphire/Amethyst remedy.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scrollList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: '#C65D24',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E7266',
    marginLeft: 5,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 16,
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginBottom: 14,
  },
  chartThumbContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  chartThumb: {
    width: 34,
    height: 34,
  },
  bannerCol: {
    flex: 1,
    marginLeft: 10,
  },
  bannerTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  bannerSubtitle: {
    fontSize: 10.5,
    color: THEME.colors.mutedText,
    marginTop: 2,
    lineHeight: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.headingDeep,
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: THEME.colors.headingDeep,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCol: {
    width: '48%',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C65D24',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 14,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    color: THEME.colors.bodyText,
    textAlign: 'center',
  },
  milanHeading: {
    fontFamily: THEME.typography.serif,
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 2,
  },
  milanDesc: {
    fontSize: 11,
    color: THEME.colors.mutedText,
    marginBottom: 12,
    lineHeight: 15,
  },
  milanScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF6EE',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F6DEC8',
    marginTop: 14,
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C65D24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 20,
  },
  scoreDenom: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#F7E7B4',
  },
  scoreStatus: {
    fontSize: 12.5,
    fontWeight: '800',
    color: THEME.colors.deepTerracotta,
  },
  scoreDetails: {
    fontSize: 10,
    color: THEME.colors.bodyText,
    marginTop: 2,
    lineHeight: 14,
  },
  doshaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 14,
    marginBottom: 12,
  },
  doshaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  doshaTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginLeft: 6,
  },
  doshaDesc: {
    fontSize: 11,
    color: THEME.colors.bodyText,
    lineHeight: 15,
    marginBottom: 8,
  },
  remedyBox: {
    backgroundColor: '#FCFAF7',
    padding: 9,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#C65D24',
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  remedyTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C65D24',
    marginBottom: 2,
  },
  remedyText: {
    fontSize: 10.5,
    color: THEME.colors.bodyText,
    lineHeight: 14.5,
  },
});
