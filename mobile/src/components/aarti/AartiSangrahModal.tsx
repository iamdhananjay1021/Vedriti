import React, { useState, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Share2,
  BookOpen,
  Music,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { AARTI_COLLECTION, AartiItem } from '../../data/spiritualData';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  initialAartiId?: string;
}

export const AartiSangrahModal: React.FC<Props> = ({ visible, onClose, initialAartiId }) => {
  const [selectedAarti, setSelectedAarti] = useState<AartiItem>(
    AARTI_COLLECTION.find((a) => a.id === initialAartiId) || AARTI_COLLECTION[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CHALISA' | 'AARTI' | 'STOTRAM'>('ALL');
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState<number>(15);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🙏 ॐ वेदरीति आरती व चालीसा संग्रह 🙏\n\n${selectedAarti.title} (${selectedAarti.deity}):\n\n${selectedAarti.lyrics.slice(0, 10).join('\n')}\n...\n\nसम्पूर्ण आरती व चालीसा पाठ वेदरीति ऐप पर सुनें: https://vedriti.com`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const filteredAartis = AARTI_COLLECTION.filter((a) => {
    if (categoryFilter === 'ALL') return true;
    return a.category === categoryFilter;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#170b04', '#260e04', '#120501']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.8}>
            <X size={20} color="#FDE68A" />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={styles.topTitle}>दैनिक आरती व चालीसा संग्रह</Text>
            <Text style={styles.topSubtitle}>पावन स्तुति व भक्ति रस</Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.iconBtn} activeOpacity={0.8}>
            <Share2 size={18} color="#FDE68A" />
          </TouchableOpacity>
        </View>

        {/* Categories Bar */}
        <View style={styles.categoryRow}>
          {(['ALL', 'CHALISA', 'AARTI', 'STOTRAM'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoryFilter(cat)}
              style={[styles.categoryTab, categoryFilter === cat && styles.categoryTabActive]}
            >
              <Text
                style={[styles.categoryTabText, categoryFilter === cat && styles.categoryTabTextActive]}
              >
                {cat === 'ALL'
                  ? 'सभी'
                  : cat === 'CHALISA'
                    ? 'चालीसा'
                    : cat === 'AARTI'
                      ? 'आरती'
                      : 'स्तोत्रम्'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horizontal Aartis Picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.aartiPickerScroll}
        >
          {filteredAartis.map((a) => {
            const isSel = a.id === selectedAarti.id;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => {
                  setSelectedAarti(a);
                  setIsPlaying(false);
                }}
                style={[styles.aartiChip, isSel && styles.aartiChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.aartiChipTitle, isSel && styles.aartiChipTitleActive]}>
                  {a.title}
                </Text>
                <Text style={styles.aartiChipDeity}>{a.deity}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Audio Player Strip */}
        <View style={styles.playerStrip}>
          <View style={styles.playerLeft}>
            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playBtn}
              activeOpacity={0.85}
            >
              {isPlaying ? <Pause size={18} color="#1E1B4B" /> : <Play size={18} color="#1E1B4B" style={{ marginLeft: 2 }} />}
            </TouchableOpacity>
            <View>
              <Text style={styles.playerTitle}>{selectedAarti.title}</Text>
              <Text style={styles.playerDuration}>
                {isPlaying ? 'ध्वनि प्रवाह सक्रिय • ' : 'ऑडियो सुनें • '} {selectedAarti.duration}
              </Text>
            </View>
          </View>

          {/* Font Size Adjusters */}
          <View style={styles.fontControls}>
            <TouchableOpacity
              onPress={() => setFontSize(Math.max(12, fontSize - 1))}
              style={styles.fontBtn}
            >
              <Text style={styles.fontBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFontSize(Math.min(22, fontSize + 1))}
              style={styles.fontBtn}
            >
              <Text style={styles.fontBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Lyrics Container */}
        <ScrollView
          style={styles.lyricsScroll}
          contentContainerStyle={styles.lyricsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.lyricsCard}>
            <View style={styles.deityTag}>
              <Sparkles size={13} color="#F59E0B" />
              <Text style={styles.deityTagText}>{selectedAarti.deity}</Text>
            </View>

            <Text style={styles.lyricsHeaderTitle}>{selectedAarti.title}</Text>
            <View style={styles.lyricsDivider} />

            {selectedAarti.lyrics.map((line, index) => {
              const isHeading = line.startsWith('॥');
              return (
                <Text
                  key={index}
                  style={[
                    styles.lyricLine,
                    { fontSize: isHeading ? fontSize + 1 : fontSize },
                    isHeading && styles.lyricHeading,
                  ]}
                >
                  {line}
                </Text>
              );
            })}
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
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryTabActive: {
    backgroundColor: '#F59E0B',
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  categoryTabTextActive: {
    color: '#1E1B4B',
    fontWeight: '800',
  },
  aartiPickerScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  aartiChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aartiChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: '#F59E0B',
  },
  aartiChipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  aartiChipTitleActive: {
    color: '#FEF3C7',
    fontWeight: '800',
  },
  aartiChipDeity: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 2,
  },
  playerStrip: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FEF3C7',
  },
  playerDuration: {
    fontSize: 10,
    color: '#FDE68A',
    marginTop: 1,
  },
  fontControls: {
    flexDirection: 'row',
    gap: 6,
  },
  fontBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  lyricsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.18)',
    padding: 18,
    alignItems: 'center',
  },
  deityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deityTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  lyricsHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FEF3C7',
    marginTop: 8,
  },
  lyricsDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    marginVertical: 14,
  },
  lyricLine: {
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 28,
    marginVertical: 2,
    fontWeight: '500',
  },
  lyricHeading: {
    color: '#F59E0B',
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
});

