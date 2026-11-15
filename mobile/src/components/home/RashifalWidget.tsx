import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Compass, Sparkles, ChevronRight } from 'lucide-react-native';
import { RASHI_FORECASTS, RashiForecast } from '../../data/spiritualData';
import { DailyRashifalModal } from './DailyRashifalModal';

export const RashifalWidget: React.FC = () => {
  const [selectedRashi, setSelectedRashi] = useState<RashiForecast>(RASHI_FORECASTS[0]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.headRow}>
          <View style={styles.headLeft}>
            <View style={styles.iconCircle}>
              <Compass size={16} color="#C65D24" />
            </View>
            <View>
              <Text style={styles.title}>आज का राशिफल</Text>
              <Text style={styles.subtitle}>दैनिक ग्रह गोचर व शुभाशुभ फल</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>विस्तार से</Text>
            <ChevronRight size={13} color="#C65D24" />
          </TouchableOpacity>
        </View>

        {/* Rashis Horizontal Strip */}
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
                style={[styles.rashiChip, isSel && styles.rashiChipActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.rashiIcon}>{r.symbol}</Text>
                <Text style={[styles.rashiText, isSel && styles.rashiTextActive]}>{r.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Rashi Highlight Box */}
        <TouchableOpacity
          onPress={() => setModalOpen(true)}
          style={styles.detailBox}
          activeOpacity={0.85}
        >
          <View style={styles.detailTop}>
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailRashiSymbol}>{selectedRashi.symbol}</Text>
              <Text style={styles.detailRashiName}>
                {selectedRashi.name} ({selectedRashi.englishName})
              </Text>
            </View>
            <View style={styles.luckyBadge}>
              <Text style={styles.luckyBadgeText}>शुभ रंग: {selectedRashi.luckyColor.split(' ')[0]}</Text>
            </View>
          </View>

          <Text style={styles.predictionText} numberOfLines={2}>
            {selectedRashi.prediction}
          </Text>

          <View style={styles.remedyRow}>
            <Sparkles size={11} color="#C65D24" />
            <Text style={styles.remedyText} numberOfLines={1}>
              उपाय: {selectedRashi.remedy}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <DailyRashifalModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        initialRashiId={selectedRashi.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 16,
    shadowColor: '#2A170F',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A170F',
  },
  subtitle: {
    fontSize: 10,
    color: '#786B60',
    marginTop: 0.5,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C65D24',
  },
  rashiScroll: {
    gap: 6,
    paddingBottom: 10,
  },
  rashiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  rashiChipActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  rashiIcon: {
    fontSize: 12,
  },
  rashiText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#786B60',
  },
  rashiTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  detailBox: {
    backgroundColor: '#FDFCFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1E9DF',
    padding: 12,
    marginTop: 4,
  },
  detailTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailRashiSymbol: {
    fontSize: 16,
  },
  detailRashiName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A170F',
  },
  luckyBadge: {
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  luckyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C65D24',
  },
  predictionText: {
    fontSize: 12,
    color: '#554A41',
    lineHeight: 18,
  },
  remedyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F4ECE3',
  },
  remedyText: {
    fontSize: 11,
    color: '#C65D24',
    fontWeight: '600',
    flex: 1,
  },
});

