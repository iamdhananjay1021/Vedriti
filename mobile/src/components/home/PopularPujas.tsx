import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ArrowRight, Star, Clock, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { POPULAR_PUJAS, Puja } from '../../data/mockData';

interface PopularPujasProps {
  onSelectPuja: (puja: Puja) => void;
  onViewAllPress: () => void;
}

export const PopularPujas: React.FC<PopularPujasProps> = ({
  onSelectPuja,
  onViewAllPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.taglineRow}>
            <Sparkles size={11} color="#D4AF37" />
            <Text style={styles.taglineText}>Vedic Anushthan & Hawan</Text>
          </View>
          <Text style={styles.sectionTitle}>Popular Sacred Pujas</Text>
        </View>

        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          style={styles.viewAllButton}
          accessibilityLabel="View all pujas"
        >
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Large 16:9 Cards Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {POPULAR_PUJAS.map((puja) => (
          <TouchableOpacity
            key={puja.id}
            onPress={() => onSelectPuja(puja)}
            activeOpacity={0.88}
            style={styles.card}
            accessibilityLabel={`${puja.name}, starting from ₹${puja.startingPrice}`}
          >
            {/* Puja Visual Image with Overlay Badge */}
            <View style={styles.imageContainer}>
              <Image source={puja.image} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.ratingBadge}>
                <Star size={10} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.ratingText}>{puja.rating || 4.98}</Text>
              </View>
            </View>

            {/* Puja Body */}
            <View style={styles.cardBody}>
              <Text style={styles.cardCategory}>{puja.category}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {puja.name}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {puja.subtitle}
              </Text>

              {/* Duration & Starting Price / Book CTA */}
              <View style={styles.bottomRow}>
                <View>
                  <View style={styles.durationRow}>
                    <Clock size={10} color="#8A7D70" />
                    <Text style={styles.durationText}>{puja.duration}</Text>
                  </View>
                  <Text style={styles.priceTag}>
                    ₹{puja.startingPrice.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.bookPill}>
                  <Text style={styles.bookPillText}>Book</Text>
                  <ArrowRight size={10} color="#FFF" style={{ marginLeft: 2 }} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#996515',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 19,
    fontWeight: '800',
    color: '#1E120A',
    letterSpacing: -0.2,
  },
  viewAllButton: {
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primarySaffron,
  },
  scrollList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  card: {
    width: 245,
    marginRight: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    backgroundColor: '#FFFFFF',
    padding: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 135,
    borderRadius: 12,
    backgroundColor: '#F5ECE1',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#E8D5BF',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E120A',
    marginLeft: 3,
  },
  cardBody: {
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  cardCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.royalVermilion,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  cardTitle: {
    fontFamily: THEME.typography.serif,
    fontSize: 15,
    fontWeight: '800',
    color: '#1E120A',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    color: '#7D7063',
    marginBottom: 10,
    minHeight: 30,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  durationText: {
    fontSize: 9.5,
    color: '#8A7D70',
    fontWeight: '600',
    marginLeft: 3,
  },
  priceTag: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E120A',
  },
  bookPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bookPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
