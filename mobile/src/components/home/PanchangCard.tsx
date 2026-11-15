import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Moon, Clock, Share2, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { RADIUS, SPACE, TYPE } from '../../constants/ui';
import type { HomePanchang } from '../../types/api';

const Cell: React.FC<{ label: string; value: string; danger?: boolean; highlight?: boolean }> = ({
  label,
  value,
  danger,
  highlight,
}) =>
  value ? (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, danger && styles.danger, highlight && styles.highlight]}>
        {value}
      </Text>
    </View>
  ) : null;

export const PanchangCard: React.FC<{ panchang: HomePanchang }> = ({ panchang }) => {
  const [expanded, setExpanded] = useState(false);
  const heading = [panchang.paksha, panchang.tithi].filter(Boolean).join(' • ');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `☀️ ॐ वेदरीति दैनिक पंचांग (${panchang.date || 'आज'}) ☀️\n\nतिथी: ${heading}\n🌟 नक्षत्र: ${panchang.nakshatra || 'रोहिणी'}\n✨ योग: ${panchang.yoga || 'सिद्धि योग'}\n\n🟢 अभिजीत मुहूर्त: ${panchang.abhijitMuhurat || '11:45 AM - 12:35 PM'} (सर्वश्रेष्ठ मुहूर्त)\n🔴 राहुकाल: ${panchang.rahuKaal || '04:15 PM - 05:40 PM'} (अशुभ काल)\n🌅 सूर्योदय: ${panchang.sunrise || '06:18 AM'} | 🌇 सूर्यास्त: ${panchang.sunset || '05:54 PM'}\n\nवेदरीति ऐप पर लाइव पंचांग व शुभ मुहूर्त देखें: https://vedriti.com`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#FFFBF0', '#FDF2DC']} style={styles.card}>
        {/* Header Row */}
        <View style={styles.head}>
          <View style={styles.sun}>
            <Sun size={20} color="#B7791F" />
          </View>
          <View style={styles.headText}>
            <View style={styles.headTopLine}>
              <Text style={styles.kicker}>दैनिक वैदिक पंचांग</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>सक्रिय</Text>
              </View>
            </View>
            <Text style={styles.heading} numberOfLines={2}>
              {heading || 'शुक्ल पक्ष • त्रयोदशी'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
            <Share2 size={15} color="#B7791F" />
          </TouchableOpacity>
        </View>

        {/* Shubh Muhurat Highlight Strips */}
        <View style={styles.muhuratRow}>
          {panchang.abhijitMuhurat ? (
            <View style={styles.muhuratBoxGreen}>
              <View style={styles.muhuratHead}>
                <Sparkles size={11} color="#15803D" />
                <Text style={styles.muhuratTitleGreen}>अभिजीत मुहूर्त (शुभ)</Text>
              </View>
              <Text style={styles.muhuratTimeGreen}>{panchang.abhijitMuhurat}</Text>
            </View>
          ) : null}

          {panchang.rahuKaal ? (
            <View style={styles.muhuratBoxRed}>
              <View style={styles.muhuratHead}>
                <AlertCircle size={11} color="#B91C1C" />
                <Text style={styles.muhuratTitleRed}>राहुकाल (त्याज्य)</Text>
              </View>
              <Text style={styles.muhuratTimeRed}>{panchang.rahuKaal}</Text>
            </View>
          ) : null}
        </View>

        {/* Core Panchang Grid */}
        <View style={styles.grid}>
          <Cell label="नक्षत्र (Nakshatra)" value={panchang.nakshatra} />
          <Cell label="योग (Yoga)" value={panchang.yoga} />
          <Cell label="सूर्योदय (Sunrise)" value={panchang.sunrise} />
          <Cell label="सूर्यास्त (Sunset)" value={panchang.sunset} />
        </View>

        {/* Expandable Choghadiya / Extra details */}
        {expanded && (
          <View style={styles.extraDetails}>
            <View style={styles.divider} />
            <Text style={styles.extraTitle}>आज का दिनमान चौघड़िया (Day Choghadiya)</Text>
            <View style={styles.choghadiyaGrid}>
              <View style={styles.choghadiyaItem}>
                <Text style={styles.choghadiyaNameGreen}>शुभ (Shubh)</Text>
                <Text style={styles.choghadiyaTime}>06:20 - 07:45</Text>
              </View>
              <View style={styles.choghadiyaItem}>
                <Text style={styles.choghadiyaNameGreen}>लाभ (Labh)</Text>
                <Text style={styles.choghadiyaTime}>09:10 - 10:35</Text>
              </View>
              <View style={styles.choghadiyaItem}>
                <Text style={styles.choghadiyaNameGreen}>अमृत (Amrit)</Text>
                <Text style={styles.choghadiyaTime}>10:35 - 12:00</Text>
              </View>
              <View style={styles.choghadiyaItem}>
                <Text style={styles.choghadiyaNameYellow}>चर (Char)</Text>
                <Text style={styles.choghadiyaTime}>01:25 - 02:50</Text>
              </View>
            </View>
          </View>
        )}

        {panchang.note ? <Text style={styles.note}>{panchang.note}</Text> : null}

        {/* Toggle Expand Button */}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.expandBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.expandText}>
            {expanded ? 'संक्षिप्त विवरण' : 'चौघड़िया व विस्तृत मुहूर्त देखें'}
          </Text>
          {expanded ? <ChevronUp size={14} color="#B7791F" /> : <ChevronDown size={14} color="#B7791F" />}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACE.lg },
  card: { borderRadius: RADIUS.lg, padding: SPACE.lg, borderWidth: 1, borderColor: '#F3DCB0' },
  head: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  sun: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B7791F',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headText: { flex: 1 },
  headTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { ...TYPE.label, color: '#B7791F' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#15803D',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  heading: { ...TYPE.cardTitle, fontSize: 16, marginTop: 2 },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE0CD',
  },
  muhuratRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACE.md,
  },
  muhuratBoxGreen: {
    flex: 1,
    backgroundColor: '#EBF7EE',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#C6E8CF',
  },
  muhuratHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  muhuratTitleGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  muhuratTimeGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    marginTop: 2,
  },
  muhuratBoxRed: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  muhuratTitleRed: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
  },
  muhuratTimeRed: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
    marginTop: 2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACE.md, rowGap: SPACE.md },
  cell: { width: '50%', paddingRight: SPACE.sm },
  cellLabel: TYPE.caption,
  cellValue: { fontSize: 13, fontWeight: '700', color: THEME.colors.heading, marginTop: 1 },
  danger: { color: '#B91C1C' },
  highlight: { color: '#15803D' },
  extraDetails: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE0CD',
    marginVertical: 10,
  },
  extraTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B7791F',
    marginBottom: 6,
  },
  choghadiyaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  choghadiyaItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#F1E3D3',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  choghadiyaNameGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  choghadiyaNameYellow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B7791F',
  },
  choghadiyaTime: {
    fontSize: 9,
    color: '#786B60',
    marginTop: 1,
  },
  note: { ...TYPE.body, fontSize: 12, marginTop: SPACE.md, fontStyle: 'italic', color: '#8C5A24' },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFE0CD',
  },
  expandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B7791F',
  },
});
