import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Star, ShieldCheck, Heart, MapPin, Quote } from 'lucide-react-native';
import { DEVOTEE_REVIEWS, DevoteeReview } from '../../data/spiritualData';

export const DevoteeTestimonials: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Heart size={15} color="#C65D24" />
          </View>
          <View>
            <Text style={styles.title}>यजमान अनुभव व विश्वास</Text>
            <Text style={styles.subtitle}>प्रमाणित वैदिक पूजा व संकल्प की संतुष्टि</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {DEVOTEE_REVIEWS.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            {/* Top Stars & Verified */}
            <View style={styles.cardTop}>
              <View style={styles.starsRow}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />
                ))}
              </View>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={11} color="#15803D" />
                <Text style={styles.verifiedText}>सत्यापित यजमान</Text>
              </View>
            </View>

            {/* Quote Text */}
            <Text style={styles.reviewText} numberOfLines={4}>
              "{r.reviewText}"
            </Text>

            {/* Devotee Info */}
            <View style={styles.devoteeFooter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{r.devoteeName.charAt(0)}</Text>
              </View>
              <View style={styles.devoteeMeta}>
                <Text style={styles.devoteeName}>{r.devoteeName}</Text>
                <Text style={styles.devoteeCity}>{r.city}</Text>
              </View>
            </View>

            {/* Puja Name Tag */}
            <View style={styles.pujaTag}>
              <MapPin size={10} color="#786B60" />
              <Text style={styles.pujaTagText} numberOfLines={1}>
                {r.pujaName} • {r.templeVenue}
              </Text>
            </View>
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
    fontWeight: '700',
    color: '#2A170F',
  },
  subtitle: {
    fontSize: 10.5,
    color: '#786B60',
    marginTop: 0.5,
  },
  railContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  reviewCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    padding: 14,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  reviewText: {
    fontSize: 11.5,
    color: '#4B3621',
    lineHeight: 17,
    fontStyle: 'italic',
  },
  devoteeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3EADB',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDEBDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C65D24',
  },
  devoteeMeta: {
    flex: 1,
  },
  devoteeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2A170F',
  },
  devoteeCity: {
    fontSize: 10,
    color: '#786B60',
  },
  pujaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pujaTagText: {
    fontSize: 10,
    color: '#786B60',
  },
});

