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
import {
  X,
  Play,
  Pause,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import { AARTI_COLLECTION, AartiItem } from '../../data/spiritualData';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialAartiId?: string;
}

export const AartiSangrahModal: React.FC<Props> = ({ visible, onClose, initialAartiId }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [selectedAarti, setSelectedAarti] = useState<AartiItem>(
    AARTI_COLLECTION.find((a) => a.id === initialAartiId) || AARTI_COLLECTION[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CHALISA' | 'AARTI' | 'STOTRAM'>('ALL');
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState<number>(15);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🙏 ॐ वेदरीति आरती व चालीसा संग्रह 🙏\n\n${selectedAarti.title} (${selectedAarti.deity}):\n\n${selectedAarti.lyrics.slice(0, 10).join('\n')}\n...\n\nसम्पूर्ण पाठ वेदरीति ऐप पर सुनें: https://vedriti.com`,
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
          colors={['#FFFDF9', '#FAF5EC', '#F4EDE2']}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.8}>
            <X size={18} color="#2A170F" />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={styles.topTitle}>
              {isHi ? 'दैनिक आरती व चालीसा संग्रह' : 'Aarti & Chalisa Sangrah'}
            </Text>
            <Text style={styles.topSubtitle}>
              {isHi ? 'पावन स्तुति व भक्ति रस' : 'Sacred Prayers & Hymns'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.iconBtn} activeOpacity={0.8}>
            <Share2 size={17} color="#C65D24" />
          </TouchableOpacity>
        </View>

        {/* Categories Bar */}
        <View style={styles.categoryRow}>
          {(['ALL', 'CHALISA', 'AARTI', 'STOTRAM'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoryFilter(cat)}
              style={[styles.categoryTab, categoryFilter === cat && styles.categoryTabActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.categoryTabText, categoryFilter === cat && styles.categoryTabTextActive]}
              >
                {cat === 'ALL'
                  ? (isHi ? 'सभी' : 'All')
                  : cat === 'CHALISA'
                    ? (isHi ? 'चालीसा' : 'Chalisa')
                    : cat === 'AARTI'
                      ? (isHi ? 'आरती' : 'Aarti')
                      : (isHi ? 'स्तोत्रम्' : 'Stotram')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horizontal Aartis Picker */}
        <View style={styles.pickerStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aartiListContent}
          >
            {filteredAartis.map((a) => {
              const isCur = a.id === selectedAarti.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => {
                    setSelectedAarti(a);
                    setIsPlaying(false);
                  }}
                  style={[styles.aartiChip, isCur && styles.aartiChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.aartiChipTitle, isCur && styles.aartiChipTitleActive]}>
                    {a.title}
                  </Text>
                  <Text style={[styles.aartiChipDeity, isCur && styles.aartiChipDeityActive]}>
                    {a.deity}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Audio Player Control Bar */}
        <View style={styles.playerBar}>
          <View style={styles.playerLeft}>
            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playBtn}
              activeOpacity={0.85}
            >
              {isPlaying ? <Pause size={17} color="#FFF" /> : <Play size={17} color="#FFF" />}
            </TouchableOpacity>
            <View>
              <Text style={styles.playerTitle}>{selectedAarti.title}</Text>
              <Text style={styles.playerDuration}>
                {isHi ? `${selectedAarti.deity} • ऑडियो पाठ` : `${selectedAarti.deity} • Audio`}
              </Text>
            </View>
          </View>

          {/* Font Size Adjusters */}
          <View style={styles.fontControls}>
            <TouchableOpacity
              onPress={() => setFontSize(Math.max(13, fontSize - 1))}
              style={styles.fontBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.fontBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFontSize(Math.min(22, fontSize + 1))}
              style={styles.fontBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.fontBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lyrics Scroll View */}
        <ScrollView style={styles.lyricsScroll} contentContainerStyle={styles.lyricsContainer}>
          <View style={styles.lyricsCard}>
            <View style={styles.deityTag}>
              <Sparkles size={11} color="#C65D24" />
              <Text style={styles.deityTagText}>{selectedAarti.deity}</Text>
            </View>
            <Text style={styles.lyricsHeaderTitle}>{selectedAarti.title}</Text>
            <View style={styles.lyricsDivider} />

            {selectedAarti.lyrics.map((line, idx) => {
              const isHeading =
                line.startsWith('॥') ||
                line.startsWith('दोहा') ||
                line.startsWith('चौपाई') ||
                line.startsWith('॥ इति');
              return (
                <Text
                  key={idx}
                  style={[
                    styles.lyricLine,
                    { fontSize },
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
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFDF9',
  },
  categoryTab: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED2',
  },
  categoryTabActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  categoryTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#554A41',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pickerStrip: {
    paddingBottom: 8,
  },
  aartiListContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  aartiChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFD3',
    minWidth: 110,
  },
  aartiChipActive: {
    backgroundColor: '#FEF3EB',
    borderColor: '#C65D24',
  },
  aartiChipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A170F',
  },
  aartiChipTitleActive: {
    color: '#C65D24',
    fontWeight: '700',
  },
  aartiChipDeity: {
    fontSize: 10,
    color: '#786B60',
    marginTop: 2,
  },
  aartiChipDeityActive: {
    color: '#A04213',
  },
  playerBar: {
    marginHorizontal: 14,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBE3D8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C65D24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A170F',
  },
  playerDuration: {
    fontSize: 10.5,
    color: '#786B60',
    marginTop: 1,
  },
  fontControls: {
    flexDirection: 'row',
    gap: 6,
  },
  fontBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FAF5ED',
    borderWidth: 1,
    borderColor: '#F0E5D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C65D24',
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricsContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
  },
  lyricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EBE3D8',
    padding: 18,
    alignItems: 'center',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  deityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3EB',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F5DDC7',
  },
  deityTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#C65D24',
  },
  lyricsHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2A170F',
    marginTop: 8,
  },
  lyricsDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F3EADB',
    marginVertical: 12,
  },
  lyricLine: {
    color: '#3C2E24',
    textAlign: 'center',
    lineHeight: 26,
    marginVertical: 2,
    fontWeight: '400',
  },
  lyricHeading: {
    color: '#C65D24',
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
});
