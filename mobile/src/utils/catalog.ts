import type { ApiProduct, ApiPuja, ProductCategory } from '../types/api';
import type { Puja, PujaKit } from '../data/mockData';
import { formatDuration } from './format';

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  PUJA_KIT: 'Puja Kits',
  RUDRAKSHA: 'Rudraksha',
  YANTRA: 'Yantras',
  SAMAGRI: 'Samagri',
  DHOOP: 'Dhoop & Diya',
  OTHER: 'Others',
};

const pujaImage = (p: ApiPuja) => (p.imageUrl ? { uri: p.imageUrl } : null);

export const toUiPuja = (p: ApiPuja): Puja => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  subtitle: p.subtitle,
  sanskritMantra: p.sanskritMantra || undefined,
  startingPrice: p.startingPrice,
  duration: formatDuration(p.durationMinutes),
  durationMinutes: p.durationMinutes,
  category: p.category,
  deity: p.deity,
  rating: p.rating,
  reviewsCount: p.reviewsCount,
  templeLocation: p.modes.includes('AT_HOME') ? 'At your home or online' : 'Online / At temple',
  suitableOccasions: p.suitableOccasions,
  occasionTags: p.occasionTags,
  modes: p.modes,
  isPopular: p.isPopular,
  image: pujaImage(p),
  description: p.description,
  significance: p.significance,
  items: p.items,
  occasionTag: p.category,
  whatIsIncluded: p.whatIsIncluded,
  preparationSteps: p.preparationSteps,
  packages: {
    panditOnly: {
      id: 'pandit-only',
      name: p.packages.panditOnly.name,
      price: p.packages.panditOnly.price,
      tagline: p.packages.panditOnly.tagline,
      samagriIncluded: false,
      enabled: p.packages.panditOnly.enabled,
      features: p.packages.panditOnly.features,
    },
    panditWithSamagri: {
      id: 'pandit-samagri',
      name: p.packages.withSamagri.name,
      price: p.packages.withSamagri.price,
      tagline: p.packages.withSamagri.tagline,
      samagriIncluded: true,
      enabled: p.packages.withSamagri.enabled,
      features: p.packages.withSamagri.features,
    },
  },
});

export const toUiKit = (p: ApiProduct): PujaKit => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  tagline: p.tagline,
  category: PRODUCT_CATEGORY_LABELS[p.category] ?? 'Others',
  categoryKey: p.category,
  price: p.price,
  originalPrice: p.originalPrice > p.price ? p.originalPrice : p.price,
  image: p.imageUrl ? { uri: p.imageUrl } : null,
  itemsCount: p.itemsIncluded.length,
  description: p.description,
  itemsIncluded: p.itemsIncluded,
  inStock: p.inStock,
  stockQuantity: p.stockQuantity,
  certified: true,
  rating: p.rating,
  reviewsCount: p.reviewsCount,
  badge: p.badge || undefined,
});

export const matchesPujaFilter = (puja: Puja, filter: string) => {
  if (!filter || filter === 'All Pujas') return true;
  const f = filter.toLowerCase();
  return (
    puja.category.toLowerCase() === f ||
    puja.occasionTags.some((t) => t.toLowerCase() === f) ||
    puja.suitableOccasions.some((o) => o.toLowerCase().includes(f))
  );
};
