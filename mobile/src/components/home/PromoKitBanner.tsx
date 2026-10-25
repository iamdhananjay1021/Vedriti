import React from 'react';
import { ResponsiveBanner } from '../common/ResponsiveBanner';
import { THEME } from '../../constants/theme';

interface PromoKitBannerProps {
  onShopPress: () => void;
}

export const PromoKitBanner: React.FC<PromoKitBannerProps> = ({ onShopPress }) => {
  return (
    <ResponsiveBanner
      badge="Sacred Samagri Kits"
      title={'Puja Kits for\nEvery Occasion'}
      description="Get premium quality samagri kits delivered to your doorstep."
      ctaText="Shop Puja Kits"
      image={THEME.assets.bannerKit}
      onPress={onShopPress}
      backgroundColor="#FFFFFF"
      borderColor="#EFE7DD"
    />
  );
};
