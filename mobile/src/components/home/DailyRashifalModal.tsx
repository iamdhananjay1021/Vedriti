import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, Share2, Compass } from 'lucide-react-native';
import { RASHI_FORECASTS, RashiForecast } from '../../data/spiritualData';
import { THEME } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialRashiId?: string;
}

export const DailyRashifalModal: React.FC<Props> = ({ visible, onClose, initialRashiId }) => {
  const { language } = useLanguage();
  const [selectedRashi, setSelectedRashi] = useState<RashiForecast>(
    RASHI_FORECASTS.find((r) => r.id === initialRashiId) || RASHI_FORECASTS[0]
  );

  const isHi = language === 'hi';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🔮 ॐ वेदरीति दैनिक राशिफल (${selectedRashi.name} / ${selectedRashi.englishName}) 🔮\n\nआज का फल:\n${selectedRashi.prediction}\n\n🎨 शुभ रंग: ${selectedRashi.luckyColor}\n🔢 शुभ अंक: ${selectedRashi.luckyNumber}\n🪔 आज का उपाय: ${selectedRashi.remedy}\n\nअपनी जन्म कुंडली व दैनिक राशिफल देखें वेदरीति ऐप पर: https://vedriti.com`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Serene Sandalwood/Ivory Canvas */}
        <LinearGradient
          colors={['#FFFDF9', '#FAF5EC', '#F4EDE2']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.8}>
            <X size={18} color="#2A170F" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text style={styles.title}>{isHi ? 'दैनिक राशिफल' : 'Daily Horoscope'}</Text>
            <Text style={styles.subtitle}>
              {isHi ? '12 राशियों का वैदिक ज्योतिष फल' : 'Vedic astrology forecast for 12 Rashis'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.iconBtn} activeOpacity={0.8}>
            <Share2 size={17} color="#C65D24" />
          </TouchableOpacity>
        </View>

        {/* 12 Rashis Horizontal Scroll Selector */}
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
                  <Text style={[styles.rashiSymbol, isSel && styles.rashiSymbolActive]}>
                    {r.symbol}
                  </Text>
                  <Text style={[styles.rashiPillText, isSel && styles.rashiPillTextActive]}>
                    {isHi ? r.name : r.englishName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content Scroll View */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Rashi Forecast Card */}
          <View style={styles.card}>
            {/* Header: Symbol, Name & Element */}
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
                  <Compass size={11} color="#C65D24" />
                  <Text style={styles.elementText}>{selectedRashi.element}</Text>
                </View>
              </View>
            </View>

            {/* Daily Prediction Box */}
            <View style={styles.predictionBox}>
              <Text style={styles.predictionLabel}>
                {isHi ? 'आज का ग्रह गोचर व फल:' : "Today's Planetary Forecast:"}
              </Text>
              <Text style={styles.predictionText}>{selectedRashi.prediction}</Text>
            </View>

            {/* Lucky Color & Number Grid */}
            <View style={styles.luckyRow}>
              <View style={styles.luckyCard}>
                <Text style={styles.luckyCardLabel}>{isHi ? 'शुभ रंग' : 'Lucky Color'}</Text>
                <Text style={styles.luckyCardVal}>{selectedRashi.luckyColor}</Text>
              </View>
              <View style={styles.luckyCard}>
                <Text style={styles.luckyCardLabel}>{isHi ? 'शुभ अंक' : 'Lucky Number'}</Text>
                <Text style={styles.luckyCardVal}>{selectedRashi.luckyNumber}</Text>
              </View>
            </View>

            {/* Vedic Astro Remedy Box */}
            <View style={styles.remedyBox}>
              <View style={styles.remedyHeader}>
                <Sparkles size={14} color="#C65D24" />
                <Text style={styles.remedyTitle}>
                  {isHi ? 'आज का अचूक वैदिक उपाय' : 'Vedic Astro Remedy'}
                </Text>
              </View>
              <Text style={styles.remedyText}>{selectedRashi.remedy}</Text>
            </View>

            {/* Share CTA Button */}
            <TouchableOpacity onPress={handleShare} style={styles.shareCta} activeOpacity={0.85}>
              <Share2 size={15} color="#FFFFFF" />
              <Text style={styles.shareCtaText}>
                {isHi
                  ? `${selectedRashi.name} राशि का फल मित्रों से साझा करें`
                  : `Share ${selectedRashi.englishName} Forecast with Friends`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    paddingBottom: 14,
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
  titleBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A170F',
  },
  subtitle: {
    fontSize: 11,
    color: '#786B60',
    marginTop: 1,
  },
  rashiSelectorWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E7DD',
    backgroundColor: '#FFFDF9',
  },
  rashiScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  rashiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE2D7',
  },
  rashiPillActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  rashiSymbol: {
    fontSize: 14,
    color: '#C65D24',
  },
  rashiSymbolActive: {
    color: '#FFFFFF',
  },
  rashiPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#554A41',
  },
  rashiPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBE3D8',
    padding: 18,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EEE6',
  },
  rashiBigSymbolBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F5DCB5',
  },
  rashiBigSymbol: {
    fontSize: 24,
    color: '#C65D24',
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
    fontWeight: '700',
    color: '#2A170F',
  },
  rashiEngName: {
    fontSize: 13,
    color: '#786B60',
    fontWeight: '500',
  },
  elementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5ED',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0E5D4',
    marginTop: 4,
  },
  elementText: {
    fontSize: 11,
    color: '#8C5A24',
    fontWeight: '600',
  },
  predictionBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E8DE',
    marginBottom: 14,
  },
  predictionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C65D24',
    marginBottom: 6,
  },
  predictionText: {
    fontSize: 13,
    color: '#3C2E24',
    lineHeight: 20,
    fontWeight: '400',
  },
  luckyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  luckyCard: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E8DE',
  },
  luckyCardLabel: {
    fontSize: 10.5,
    color: '#786B60',
    fontWeight: '600',
  },
  luckyCardVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A170F',
    marginTop: 3,
  },
  remedyBox: {
    backgroundColor: '#FEF3EB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F5DDC7',
    marginBottom: 18,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  remedyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C65D24',
  },
  remedyText: {
    fontSize: 12.5,
    color: '#5C2D10',
    lineHeight: 18,
    fontWeight: '500',
  },
  shareCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#C65D24',
    borderRadius: 14,
    paddingVertical: 13,
  },
  shareCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 32,
  },
});
