import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { RotateCcw, Play, Pause, Flame, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { VEDIC_STOTRAMS, VedicStotram } from '../../data/mockData';

export const MantraJapaWidget: React.FC = () => {
  const [selectedStotram, setSelectedStotram] = useState<VedicStotram>(VEDIC_STOTRAMS[0]);
  const [chantCount, setChantCount] = useState(27);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animated bead bounce
  const beadScale = useRef(new Animated.Value(1)).current;

  const handleBeadClick = () => {
    Animated.sequence([
      Animated.timing(beadScale, { toValue: 1.15, duration: 80, useNativeDriver: true }),
      Animated.timing(beadScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    if (chantCount >= 108) {
      setChantCount(1);
    } else {
      setChantCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setChantCount(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const progressPercent = Math.min(100, Math.round((chantCount / 108) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.topRow}>
          <View style={styles.titleBadge}>
            <View style={styles.flameIconBox}>
              <Flame size={14} color="#C65D24" />
            </View>
            <div>
              <Text style={styles.titleText}>Digital Japa Mala & Chants</Text>
              <Text style={styles.subtitleText}>108 Sacred Beads Daily Sadhana</Text>
            </div>
          </View>
          <View style={styles.targetPill}>
            <Text style={styles.targetText}>Target: 108</Text>
          </View>
        </View>

        {/* Stotram Selector Tabs */}
        <View style={styles.stotramSelector}>
          {VEDIC_STOTRAMS.slice(0, 3).map((stotram) => {
            const isSelected = selectedStotram.id === stotram.id;
            return (
              <TouchableOpacity
                key={stotram.id}
                onPress={() => {
                  setSelectedStotram(stotram);
                  setChantCount(0);
                }}
                activeOpacity={0.8}
                style={[
                  styles.stotramTab,
                  isSelected && styles.stotramTabSelected,
                ]}
              >
                <Text
                  style={[
                    styles.stotramTabText,
                    isSelected && styles.stotramTabTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {stotram.title.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sanskrit Shloka Box */}
        <View style={styles.shlokaBox}>
          <View style={styles.deityRow}>
            <Sparkles size={11} color="#C65D24" />
            <Text style={styles.shlokaDeity}>{selectedStotram.deity} Invocation</Text>
          </View>
          <Text style={styles.sanskritLine}>
            {selectedStotram.sanskritLine}
          </Text>
          <Text style={styles.shlokaMeaning} numberOfLines={2}>
            "{selectedStotram.meaning}"
          </Text>
        </View>

        {/* Interactive Digital Mala & Bead Section */}
        <View style={styles.counterRow}>
          {/* Left: Bead Counter Circle */}
          <TouchableOpacity
            onPress={handleBeadClick}
            activeOpacity={0.85}
            style={styles.beadTapArea}
          >
            <Animated.View style={[styles.beadRing, { transform: [{ scale: beadScale }] }]}>
              <View style={styles.beadCircle}>
                <Text style={styles.beadCountNumber}>{chantCount}</Text>
                <Text style={styles.beadCountLabel}>/ 108</Text>
              </View>
            </Animated.View>
            <Text style={styles.tapTip}>Tap to Chant</Text>
          </TouchableOpacity>

          {/* Right: Controls & Progress */}
          <View style={styles.controlsCol}>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressTitle}>Mala Progress</Text>
                <Text style={styles.progressVal}>{progressPercent}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={togglePlay}
                activeOpacity={0.85}
                style={styles.playBtn}
              >
                {isPlaying ? (
                  <Pause size={13} color="#FFFFFF" />
                ) : (
                  <Play size={13} color="#FFFFFF" style={{ marginLeft: 2 }} />
                )}
                <Text style={styles.playBtnText}>
                  {isPlaying ? 'Pause Audio' : 'Listen Chants'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.7}
                style={styles.resetBtn}
                accessibilityLabel="Reset mala counter"
              >
                <RotateCcw size={13} color="#786B60" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flameIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: THEME.typography.serif,
    fontSize: 15,
    fontWeight: '800',
    color: '#2A170F',
  },
  subtitleText: {
    fontSize: 10,
    color: '#786B60',
    marginTop: 0.5,
  },
  targetPill: {
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  targetText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C65D24',
  },
  stotramSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
  },
  stotramTab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  stotramTabSelected: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  stotramTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#786B60',
  },
  stotramTabTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  shlokaBox: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginBottom: 14,
  },
  deityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  shlokaDeity: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C65D24',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sanskritLine: {
    fontFamily: THEME.typography.serif,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#2A170F',
    fontWeight: '700',
    marginBottom: 4,
  },
  shlokaMeaning: {
    fontSize: 10.5,
    color: '#786B60',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  beadTapArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  beadRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FDF2E9',
    borderWidth: 1.5,
    borderColor: '#EFE7DD',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beadCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#C65D24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beadCountNumber: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 21,
  },
  beadCountLabel: {
    fontSize: 9,
    color: '#FDF2E9',
    fontWeight: '700',
  },
  tapTip: {
    fontSize: 9.5,
    color: '#C65D24',
    marginTop: 4,
    fontWeight: '700',
  },
  controlsCol: {
    flex: 1,
  },
  progressBarWrapper: {
    marginBottom: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 10,
    color: '#786B60',
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#C65D24',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#C65D24',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C65D24',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
    gap: 6,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
});
