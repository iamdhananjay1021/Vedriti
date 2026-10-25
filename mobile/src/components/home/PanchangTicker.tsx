import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Sparkles, ChevronDown, ChevronUp, AlertCircle, Compass, Clock } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { TODAYS_PANCHANG } from '../../data/mockData';

interface PanchangTickerProps {
  onExploreMuhuratPress?: () => void;
}

export const PanchangTicker: React.FC<PanchangTickerProps> = ({
  onExploreMuhuratPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.85}
        style={styles.cardSurface}
      >
        {/* Compact Glanceable Row */}
        <View style={styles.glanceRow}>
          <View style={styles.sunCircle}>
            <Sun size={17} color={THEME.colors.primarySaffron} strokeWidth={2.2} />
          </View>

          <View style={styles.tithiCol}>
            <View style={styles.tithiTitleRow}>
              <Text style={styles.tithiHeading} numberOfLines={1}>
                {TODAYS_PANCHANG.paksha} • {TODAYS_PANCHANG.tithi}
              </Text>
            </View>

            <View style={styles.muhuratSubRow}>
              <View style={styles.shubhDot} />
              <Text style={styles.muhuratQuickText} numberOfLines={1}>
                Abhijit Muhurat: {TODAYS_PANCHANG.abhijitMuhurat}
              </Text>
            </View>
          </View>

          <View style={styles.pillButton}>
            <Text style={styles.pillButtonText}>{isExpanded ? 'Close' : 'Panchang'}</Text>
            {isExpanded ? (
              <ChevronUp size={13} color={THEME.colors.primarySaffron} style={{ marginLeft: 2 }} />
            ) : (
              <ChevronDown size={13} color={THEME.colors.primarySaffron} style={{ marginLeft: 2 }} />
            )}
          </View>
        </View>

        {/* Expandable Shastric Vidhi Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.divider} />

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>Nakshatra</Text>
                <Text style={styles.itemValue}>{TODAYS_PANCHANG.nakshatra}</Text>
                <Text style={styles.itemSub}>{TODAYS_PANCHANG.nakshatraEnd}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>Surya Uday</Text>
                <Text style={styles.itemValue}>{TODAYS_PANCHANG.sunrise}</Text>
                <Text style={styles.itemSub}>Sunset: {TODAYS_PANCHANG.sunset}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={[styles.itemLabel, { color: '#B91C1C' }]}>Rahu Kaal</Text>
                <Text style={[styles.itemValue, { color: '#991B1B' }]}>{TODAYS_PANCHANG.rahuKaal}</Text>
                <Text style={styles.itemSub}>Inauspicious slot</Text>
              </View>
            </View>

            <View style={[styles.gridRow, { marginTop: 10 }]}>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>Yoga</Text>
                <Text style={styles.itemValue}>{TODAYS_PANCHANG.yoga}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>Karana</Text>
                <Text style={styles.itemValue}>{TODAYS_PANCHANG.karana}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>Brahma Muhurat</Text>
                <Text style={styles.itemValue}>{TODAYS_PANCHANG.brahmaMuhurat}</Text>
              </View>
            </View>

            <View style={styles.messageBox}>
              <Sparkles size={12} color="#C65D24" style={{ marginRight: 6 }} />
              <Text style={styles.messageText}>
                {TODAYS_PANCHANG.auspiciousMessage}
              </Text>
            </View>

            {onExploreMuhuratPress && (
              <TouchableOpacity
                onPress={onExploreMuhuratPress}
                activeOpacity={0.88}
                style={styles.bookMuhuratBtn}
              >
                <Text style={styles.bookMuhuratBtnText}>
                  Book Ritual for Today's Auspicious Muhurat →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 12,
  },
  cardSurface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  glanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sunCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tithiCol: {
    flex: 1,
    justifyContent: 'center',
  },
  tithiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tithiHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E120A',
    letterSpacing: -0.1,
  },
  muhuratSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  shubhDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },
  muhuratQuickText: {
    fontSize: 11,
    color: '#78695C',
    fontWeight: '500',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE2D3',
    marginLeft: 8,
  },
  pillButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primarySaffron,
  },
  expandedDetails: {
    marginTop: 10,
    paddingTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3ECE2',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 2,
  },
  itemLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#8A7D70',
    marginBottom: 1,
  },
  itemValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E120A',
  },
  itemSub: {
    fontSize: 9,
    color: '#A19588',
    marginTop: 1,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE2D3',
    marginTop: 12,
    marginBottom: 10,
  },
  messageText: {
    flex: 1,
    fontSize: 10.5,
    color: '#5C4E43',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  bookMuhuratBtn: {
    backgroundColor: THEME.colors.primarySaffron,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookMuhuratBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
