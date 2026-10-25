import React from 'react';
import { ResponsiveBanner } from '../common/ResponsiveBanner';
import { THEME } from '../../constants/theme';

interface FeaturedPujaBannerProps {
  onExplorePress: () => void;
}

export const FeaturedPujaBanner: React.FC<FeaturedPujaBannerProps> = ({
  onExplorePress,
}) => {
  return (
    <ResponsiveBanner
      badge="Special Occasions"
      title="Puja for Your Special Occasion"
      description="Traditional rituals performed with care, purity and authentic Vedic devotion."
      ctaText="Explore Puja"
      image={THEME.assets.heroKalash}
      onPress={onExplorePress}
      backgroundColor="#FFFFFF"
      borderColor="#EFE7DD"
    />
  );
};
