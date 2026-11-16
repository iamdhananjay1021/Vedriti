import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Share2, Sparkles } from 'lucide-react-native';
import { TODAY_GEETA_SHLOKA } from '../../data/spiritualData';

export const GeetaSuvicharCard: React.FC = () => {
  const shloka = TODAY_GEETA_SHLOKA;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🙏 ॐ वेदरीति दैनिक गीता अमृत 🙏\n\nश्रीमद्भगवद्गीता - अध्याय ${shloka.chapter}, श्लोक ${shloka.verse}:\n\n"${shloka.sanskrit}"\n\nभावार्थ:\n${shloka.hindi}\n\n${shloka.lesson}\n\nसुप्रभात! आपका दिन मंगलमय हो। 🌸\nवेदरीति ऐप डाउनलोड करें: https://vedriti.com`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FAF5EC']}
        style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
      />
      <View style={styles.borderBox}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <BookOpen size={15} color="#C65D24" />
            </View>
            <View>
              <Text style={styles.title}>आज का गीता श्लोक व सुविचार</Text>
              <Text style={styles.subtitle}>
                श्रीमद्भगवद्गीता • अध्याय {shloka.chapter}, श्लोक {shloka.verse}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
            <Share2 size={14} color="#C65D24" />
            <Text style={styles.shareText}>शेयर</Text>
          </TouchableOpacity>
        </View>

        {/* Sanskrit Box */}
        <View style={styles.sanskritBox}>
          <Text style={styles.sanskritText}>{shloka.sanskrit}</Text>
        </View>

        {/* Hindi Meaning */}
        <Text style={styles.hindiMeaning}>
          <Text style={styles.meaningPrefix}>भावार्थ: </Text>
          {shloka.hindi}
        </Text>

        {/* Life Lesson / Jeevan Sutra */}
        <View style={styles.lessonStrip}>
          <Sparkles size={13} color="#C65D24" />
          <Text style={styles.lessonText}>{shloka.lesson}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  borderBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE1CE',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDEBDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A170F',
  },
  subtitle: {
    fontSize: 10.5,
    color: '#8C5A24',
    marginTop: 0.5,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE2CE',
  },
  shareText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C65D24',
  },
  sanskritBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3E5D0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  sanskritText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
    lineHeight: 22,
    textAlign: 'center',
  },
  hindiMeaning: {
    fontSize: 12,
    color: '#4B3621',
    lineHeight: 18,
    marginTop: 10,
  },
  meaningPrefix: {
    fontWeight: '700',
    color: '#C65D24',
  },
  lessonStrip: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(198, 93, 36, 0.08)',
    padding: 8,
    borderRadius: 10,
  },
  lessonText: {
    fontSize: 11,
    color: '#8C4616',
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
});

