import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, ArrowRight, Star } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Puja } from '../../data/mockData';

interface PujaCardProps {
  puja: Puja;
  onPress: (puja: Puja) => void;
}

export const PujaCard: React.FC<PujaCardProps> = ({ puja, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(puja)}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${puja.name}, starting from ₹${puja.startingPrice}`}
    >
      {/* Devotional Puja Image with Floating Badges */}
      <View style={styles.imageWrapper}>
        <Image source={puja.image} style={styles.image} resizeMode="cover" />

        {/* Floating Category Pill */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{puja.category}</Text>
        </View>

        {/* Rating Pill */}
        <View style={styles.ratingBadge}>
          <Star size={10} color="#D4AF37" fill="#D4AF37" />
          <Text style={styles.ratingText}>{puja.rating || 4.98}</Text>
          <Text style={styles.reviewsText}>({puja.reviewsCount || 280}+)</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        {/* Title & Starting Dakshina */}
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {puja.name}
          </Text>
        </View>

        {/* Sanskrit Mantra Snippet */}
        {puja.sanskritMantra && (
          <View style={styles.mantraBox}>
            <Text style={styles.mantraText} numberOfLines={1}>
              {puja.sanskritMantra}
            </Text>
          </View>
        )}

        <Text style={styles.subtitle} numberOfLines={2}>
          {puja.subtitle}
        </Text>

        {/* Vedic Trust & Duration Bar */}
        <View style={styles.footerRow}>
          <View style={styles.priceDurationCol}>
            <View style={styles.durationPill}>
              <Clock size={11} color="#8A7D70" strokeWidth={2} />
              <Text style={styles.durationText}>{puja.duration}</Text>
            </View>
            <Text style={styles.startingPrice}>
              ₹{puja.startingPrice.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.actionButton}>
            <Text style={styles.actionText}>Book Vidhi</Text>
            <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.4} style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 155,
    borderRadius: 14,
    backgroundColor: '#F5ECE1',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(28, 16, 10, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  categoryText: {
    color: '#F7E7B4',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E8D5BF',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E120A',
    marginLeft: 3,
  },
  reviewsText: {
    fontSize: 9,
    color: '#8A7D70',
    marginLeft: 2,
  },
  body: {
    paddingTop: 12,
    paddingHorizontal: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: THEME.typography.serif,
    fontSize: 16.5,
    fontWeight: '800',
    color: '#1E120A',
    flex: 1,
    letterSpacing: -0.2,
  },
  mantraBox: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderLeftWidth: 2.5,
    borderLeftColor: '#D4AF37',
    marginBottom: 6,
  },
  mantraText: {
    fontFamily: THEME.typography.serif,
    fontSize: 10.5,
    color: '#5C4E43',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#6E5D4F',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE1',
  },
  priceDurationCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE2D3',
    marginRight: 10,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7D7063',
    marginLeft: 4,
  },
  startingPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E120A',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});
