import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface ResponsiveBannerProps {
  title: string;
  description: string;
  ctaText: string;
  image: ImageSourcePropType;
  badge?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
}

export const ResponsiveBanner: React.FC<ResponsiveBannerProps> = ({
  title,
  description,
  ctaText,
  image,
  badge,
  onPress,
  style,
  backgroundColor = '#FDF6EE',
  borderColor = '#EEDDC9',
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={[styles.card, { backgroundColor, borderColor }]}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${ctaText}`}
      >
        {/* Left Editorial Content */}
        <View style={styles.textColumn}>
          {badge ? (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}

          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>{ctaText}</Text>
            <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.2} style={{ marginLeft: 4 }} />
          </View>
        </View>

        {/* Right Adaptive Image Showcase - 100% Uncut Guarantee */}
        <View style={styles.imageColumn}>
          <View style={styles.imageShowcasePad}>
            <Image
              source={image}
              style={styles.responsiveImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 135,
  },
  textColumn: {
    flex: 1.25,
    paddingRight: 8,
    justifyContent: 'center',
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8E8D6',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#E8D5BF',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.colors.deepTerracotta,
  },
  title: {
    fontFamily: THEME.typography.serif,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: THEME.colors.heading,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    lineHeight: 14.5,
    color: THEME.colors.bodyText,
    marginBottom: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primarySaffron,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  imageColumn: {
    flex: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageShowcasePad: {
    width: '100%',
    height: 116,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  responsiveImage: {
    width: '100%',
    height: '100%',
  },
});
