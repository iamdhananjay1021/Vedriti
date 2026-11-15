import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, Share2, Compass, Award } from 'lucide-react-native';
import { RASHI_FORECASTS, RashiForecast } from '../../data/spiritualData';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  initialRashiId?: string;
}

export const DailyRashifalModal: React.FC<Props> = ({ visible, onClose, initialRashiId }) => {
  const [selectedRashi, setSelectedRashi] = useState<RashiForecast>(
    RASHI_FORECASTS.find((r) => r.id === initialRashiId) || RASHI_FORECASTS[0]
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🔮 ॐ वेदरीति दैनिक राशिफल (${selectedRashi.name} / ${selectedRashi.englishName}) 🔮\n\nआज का फल:\n${selectedRashi.prediction}\n\n🎨 शुभ रंग: ${selectedRashi.luckyColor}\n🔢 शुभ अंक: ${selectedRashi.luckyNumber}\n🪔 आज का उपाय: ${selectedRashi.remedy}\n\nअपनी कुंडली व दैनिक राशिफल देखें वेदरीति ऐप पर: https://vedriti.com`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#170b04', '#2b1206', '#120501']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={20} color="#FDE68A" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text style={styles.title}>दैनिक राशिफल</Text>
            <Text style={styles.subtitle}>12 राशियों का वैदिक ज्योतिष फल</Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
            <Share2 size={18} color="#FDE68A" />
          </TouchableOpacity>
        </View>

        {/* 12 Rashis Horizontal Selector */}
        <View style={styles.rashiSelectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rashiScroll}
          >
            {RASHI_FORECASTS.map((r) => {
              const isSel = r.id === selectedRashi.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelectedRashi(r)}
                  style={[styles.rashiPill, isSel && styles.rashiPillActive]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rashiSymbol}>{r.symbol}</Text>
                  <Text style={[styles.rashiPillText, isSel && styles.rashiPillTextActive]}>
                    {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Rashi Card */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.rashiBigSymbolBox}>
                <Text style={styles.rashiBigSymbol}>{selectedRashi.symbol}</Text>
              </View>
              <View style={styles.rashiHeadInfo}>
                <View style={styles.rashiNameRow}>
                  <Text style={styles.rashiName}>{selectedRashi.name}</Text>
                  <Text style={styles.rashiEngName}>({selectedRashi.englishName})</Text>
                </View>
                <View style={styles.elementPill}>
                  <Compass size={11} color="#F59E0B" />
                  <Text style={styles.elementText}>{selectedRashi.element}</Text>
                </View>
              </View>
            </View>

            {/* Prediction */}
            <View style={styles.predictionBox}>
              <Text style={styles.predictionLabel}>आज का ग्रह गोचर व फल:</Text>
              <Text style={styles.predictionText}>{selectedRashi.prediction}</Text>
            </View>

            {/* Lucky Color & Number */}
            <View style={styles.luckyRow}>
              <View style={styles.luckyCard}>
                <Text style={styles.luckyCardLabel}>शुभ रंग</Text>
                <Text style={styles.luckyCardVal}>{selectedRashi.luckyColor}</Text>
              </View>
              <View style={styles.luckyCard}>
                <Text style={styles.luckyCardLabel}>शुभ अंक</Text>
                <Text style={styles.luckyCardVal}>{selectedRashi.luckyNumber}</Text>
              </View>
            </View>

            {/* Vedic Astro Remedy */}
            <View style={styles.remedyBox}>
              <View style={styles.remedyHeader}>
                <Sparkles size={14} color="#F59E0B" />
                <Text style={styles.remedyTitle}>आज का अचूक वैदिक उपाय</Text>
              </View>
              <Text style={styles.remedyText}>{selectedRashi.remedy}</Text>
            </View>

            {/* Share CTA */}
            <TouchableOpacity onPress={handleShare} style={styles.shareCta} activeOpacity={0.85}>
              <Share2 size={16} color="#1E1B4B" />
              <Text style={styles.shareCtaText}>
                {selectedRashi.name} राशि का फल मित्रों से साझा करें
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120501',
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
  titleBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  subtitle: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 1,
  },
  rashiSelectorWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  rashiScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  rashiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rashiPillActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  rashiSymbol: {
    fontSize: 14,
  },
  rashiPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  rashiPillTextActive: {
    color: '#1E1B4B',
    fontWeight: '800',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.28)',
    padding: 18,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.15)',
  },
  rashiBigSymbolBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rashiBigSymbol: {
    fontSize: 28,
  },
  rashiHeadInfo: {
    flex: 1,
  },
  rashiNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  rashiName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FEF3C7',
  },
  rashiEngName: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  elementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  elementText: {
    fontSize: 10,
    color: '#FDE68A',
    fontWeight: '600',
  },
  predictionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  predictionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 6,
  },
  predictionText: {
    fontSize: 14,
    color: '#FEF3C7',
    lineHeight: 22,
  },
  luckyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  luckyCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  luckyCardLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  luckyCardVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FEF3C7',
    marginTop: 2,
  },
  remedyBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    padding: 14,
    marginBottom: 16,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  remedyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  remedyText: {
    fontSize: 12,
    color: '#FDE68A',
    lineHeight: 18,
  },
  shareCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 14,
  },
  shareCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
  },
});

