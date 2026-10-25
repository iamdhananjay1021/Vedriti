import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Sparkles, CalendarClock, Frown, SlidersHorizontal } from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { PujaSearchBar } from '../components/puja/PujaSearchBar';
import { PujaCategoryChips } from '../components/puja/PujaCategoryChips';
import { FeaturedPujaBanner } from '../components/puja/FeaturedPujaBanner';
import { PujaCard } from '../components/puja/PujaCard';
import { THEME } from '../constants/theme';
import { ALL_PUJAS, Puja } from '../data/mockData';

interface PujasScreenProps {
  onSelectPuja: (puja: Puja) => void;
  activeOccasionFilter?: string | null;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
}

export const PujasScreen: React.FC<PujasScreenProps> = ({
  onSelectPuja,
  activeOccasionFilter,
  onNotificationPress,
  onBackPress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    activeOccasionFilter || 'All Pujas'
  );

  // Filter local mock data by category and search query
  const filteredPujas = useMemo(() => {
    return ALL_PUJAS.filter((puja) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'All Pujas' ||
        puja.category === selectedCategory ||
        puja.occasionTag === selectedCategory ||
        (selectedCategory === 'Ganesh Puja' && puja.id.includes('ganesh')) ||
        (selectedCategory === 'Griha Pravesh' && puja.id.includes('griha')) ||
        (selectedCategory === 'Maha Rudrabhishek' && puja.id.includes('rudra')) ||
        (selectedCategory === 'Satyanarayan Katha' && puja.id.includes('satyanarayan'));

      // Search filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        puja.name.toLowerCase().includes(query) ||
        puja.subtitle.toLowerCase().includes(query) ||
        puja.description.toLowerCase().includes(query) ||
        (puja.deity && puja.deity.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <AppBackground variant="golden">
      {/* Luxury App Header */}
      <AppHeader
        title="Explore Sacred Pujas"
        subtitle="Vedic Anushthan & Hawan by Kashi Acharyas"
        showBack={Boolean(onBackPress)}
        onBackPress={onBackPress}
        onNotificationPress={onNotificationPress}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <PujaSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search pujas, deities (Ganesh, Shiva)..."
        />

        {/* Category Filters */}
        <PujaCategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Featured Puja Banner (shown when not actively searching) */}
        {searchQuery.trim() === '' && selectedCategory === 'All Pujas' ? (
          <FeaturedPujaBanner
            onExplorePress={() => onSelectPuja(ALL_PUJAS[0])}
          />
        ) : null}

        {/* Auspicious Muhurat Availability Notice */}
        <View style={styles.availabilityNotice}>
          <CalendarClock size={14} color={THEME.colors.deepTerracotta} strokeWidth={2} />
          <Text style={styles.availabilityText}>
            Personalized Gotra Sankalp & Abhijit Muhurat verification included with every booking.
          </Text>
        </View>

        {/* Section Heading & Result Count */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>
            {selectedCategory === 'All Pujas' ? 'All Vedic Anushthans' : selectedCategory}
          </Text>
          <Text style={styles.resultCount}>
            {filteredPujas.length} {filteredPujas.length === 1 ? 'Ritual' : 'Rituals'} Available
          </Text>
        </View>

        {/* Puja Cards Listing */}
        {filteredPujas.length > 0 ? (
          filteredPujas.map((puja) => (
            <PujaCard key={puja.id} puja={puja} onPress={onSelectPuja} />
          ))
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Frown size={28} color="#8A8177" />
            </View>
            <Text style={styles.emptyTitle}>No matching rituals found</Text>
            <Text style={styles.emptySubtitle}>
              Try checking your spelling or selecting "All Pujas" from the filters above.
            </Text>
          </View>
        )}
      </ScrollView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  availabilityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F8DEC8',
    marginBottom: 14,
  },
  availabilityText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginLeft: 7,
    flex: 1,
    lineHeight: 14.5,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
  },
  resultCount: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.mutedText,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE2D3',
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: THEME.colors.mutedText,
    textAlign: 'center',
    lineHeight: 16,
  },
});
