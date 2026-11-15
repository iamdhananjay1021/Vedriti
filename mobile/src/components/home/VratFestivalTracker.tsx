import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock, ChevronRight, Sparkles } from 'lucide-react-native';
import { UPCOMING_VRATS, VratFestival } from '../../data/spiritualData';

interface Props {
  onSelectVratPuja?: (pujaSlug: string) => void;
}

export const VratFestivalTracker: React.FC<Props> = ({ onSelectVratPuja }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Calendar size={16} color="#C65D24" />
          </View>
          <View>
            <Text style={styles.title}>आगामी पावन व्रत व त्योहार</Text>
            <Text style={styles.subtitle}>शुभ तिथियां, व्रत विधि व पुण्य फल</Text>
          </View>
        </View>
      </View>

      {/* Horizontal Rail of Vrats */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {UPCOMING_VRATS.map((v) => (
          <View key={v.id} style={styles.vratCard}>
            <View style={styles.vratTopRow}>
              <View style={styles.tithiPill}>
                <Sparkles size={11} color="#C65D24" />
                <Text style={styles.tithiText}>{v.tithi}</Text>
              </View>
              <View style={styles.countdownPill}>
                <Clock size={10} color="#15803D" />
                <Text style={styles.countdownText}>{v.daysLeft} दिन शेष</Text>
              </View>
            </View>

            <Text style={styles.vratName}>{v.hindiName}</Text>
            <Text style={styles.vratDate}>{v.date}</Text>

            <Text style={styles.vratSignificance} numberOfLines={2}>
              {v.significance}
            </Text>

            <View style={styles.vidhiBox}>
              <Text style={styles.vidhiText} numberOfLines={2}>
                <Text style={styles.vidhiBold}>व्रत विधि: </Text>
                {v.fastingVidhi}
              </Text>
            </View>

            {v.pujaSlug && onSelectVratPuja ? (
              <TouchableOpacity
                onPress={() => onSelectVratPuja(v.pujaSlug!)}
                style={styles.bookVratBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.bookVratText}>विशेष अनुष्ठान बुक करें</Text>
                <ChevronRight size={13} color="#C65D24" />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
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
  railContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  vratCard: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 14,
    shadowColor: '#2A170F',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  vratTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tithiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tithiText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C65D24',
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  vratName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A170F',
  },
  vratDate: {
    fontSize: 11,
    color: '#786B60',
    marginTop: 2,
  },
  vratSignificance: {
    fontSize: 11,
    color: '#554A41',
    lineHeight: 16,
    marginTop: 6,
  },
  vidhiBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0E8DE',
  },
  vidhiText: {
    fontSize: 10.5,
    color: '#66594E',
    lineHeight: 15,
  },
  vidhiBold: {
    fontWeight: '700',
    color: '#C65D24',
  },
  bookVratBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FDF2E9',
    borderRadius: 10,
    paddingVertical: 7,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F5DDC7',
  },
  bookVratText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C65D24',
  },
});

