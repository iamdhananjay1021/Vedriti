import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface HeroBannerProps {
  onBookPujaPress: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onBookPujaPress }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFDF9', '#FAF2E6', '#F5E6D0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardSurface}
      >
        {/* Subtle Decorative Ambient Background Kalash Image */}
        <View style={styles.ambientImageWrapper} pointerEvents="none">
          <Image
            source={THEME.assets.heroKalash}
            style={styles.ambientImage}
            resizeMode="contain"
          />
        </View>

        {/* Content Overlay */}
        <View style={styles.contentPad}>
          {/* Eyebrow Label */}
          <View style={styles.eyebrowPill}>
            <Sparkles size={11} color={THEME.colors.primarySaffron} />
            <Text style={styles.eyebrowText}>Sanatan Vedic Sanskar</Text>
          </View>

          {/* Main Editorial Headline */}
          <Text style={styles.heading}>
            Divine Vedic Grace,{'\n'}Right at Your Home
          </Text>

          {/* Value Proposition Description */}
          <Text style={styles.description}>
            Authentic Shastric pujas conducted by verified Kashi Acharyas with pure lab-tested samagri.
          </Text>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={onBookPujaPress}
              activeOpacity={0.88}
              style={styles.primaryButton}
              accessibilityLabel="Book a Sacred Puja"
            >
              <Flame size={13} color="#FFFFFF" />
              <Text style={styles.buttonText}>Book a Sacred Puja</Text>
              <ArrowRight size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <View style={styles.trustBadge}>
              <ShieldCheck size={12} color="#16A34A" />
              <Text style={styles.trustBadgeText}>Kashi Verified</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardSurface: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 185,
    justifyContent: 'center',
  },
  ambientImageWrapper: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    width: 155,
    height: 155,
    opacity: 0.88,
  },
  ambientImage: {
    width: '100%',
    height: '100%',
  },
  contentPad: {
    padding: 16,
    paddingRight: 100, // Leave breathing space for ambient Kalash image on the right
    zIndex: 2,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE2D3',
    marginBottom: 8,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  heading: {
    fontFamily: THEME.typography.serif,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: '#1E120A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  description: {
    fontSize: 11,
    lineHeight: 15.5,
    color: '#6E5D4F',
    marginBottom: 14,
    maxWidth: 240,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E2D5C7',
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 3,
  },
});
