import React from 'react';
import { ResponsiveBanner } from '../common/ResponsiveBanner';
import { THEME } from '../../constants/theme';

interface PromoKundliBannerProps {
  onCheckKundliPress: () => void;
}

export const PromoKundliBanner: React.FC<PromoKundliBannerProps> = ({
  onCheckKundliPress,
}) => {
  return (
    <ResponsiveBanner
      badge="Vedic Astrology"
      title="Kundli Consultation"
      description="Share birth details or kundli document for expert guidance from Pandit Ji."
      ctaText="Check My Kundli"
      image={THEME.assets.bannerKundli}
      onPress={onCheckKundliPress}
      backgroundColor="#FFFFFF"
      borderColor="#EFE7DD"
    />
  );
};
