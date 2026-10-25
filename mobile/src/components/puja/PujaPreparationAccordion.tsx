import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface PujaPreparationAccordionProps {
  steps: string[];
}

export const PujaPreparationAccordion: React.FC<PujaPreparationAccordionProps> = ({
  steps,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
        style={styles.headerButton}
        accessibilityRole="button"
        accessibilityLabel="How to Prepare Accordion"
      >
        <View style={styles.titleRow}>
          <Sparkles size={16} color={THEME.colors.primarySaffron} strokeWidth={2} />
          <Text style={styles.title}>How to Prepare for This Puja</Text>
        </View>

        <View style={styles.chevronCircle}>
          {isExpanded ? (
            <ChevronUp size={16} color="#625950" />
          ) : (
            <ChevronDown size={16} color="#625950" />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.contentBody}>
          <Text style={styles.introText}>
            Please follow these simple guidelines to ensure a sacred, uninterrupted Vedic ceremony:
          </Text>

          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FCFAF7',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: THEME.typography.serif,
    fontSize: 14.5,
    fontWeight: '700',
    color: THEME.colors.heading,
    marginLeft: 8,
  },
  chevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3ECE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBody: {
    padding: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
  },
  introText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: THEME.colors.mutedText,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16.5,
    color: THEME.colors.bodyText,
  },
});
