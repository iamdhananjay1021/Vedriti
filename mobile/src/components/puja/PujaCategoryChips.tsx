import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { THEME } from '../../constants/theme';

interface PujaCategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const PujaCategoryChips: React.FC<PujaCategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => onSelectCategory(category)}
              activeOpacity={0.75}
              style={[
                styles.chip,
                isSelected ? styles.activeChip : styles.inactiveChip,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${category} filter`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.activeChipText : styles.inactiveChipText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: THEME.colors.primarySaffron,
    borderColor: THEME.colors.primarySaffron,
  },
  inactiveChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE7DD',
  },
  chipText: {
    fontSize: 11.5,
    letterSpacing: 0.1,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inactiveChipText: {
    color: THEME.colors.heading,
    fontWeight: '600',
  },
});
