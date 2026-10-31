import type { PujaMode } from '../types/api';

export interface PujaPackage {
  id: 'pandit-only' | 'pandit-samagri';
  name: string;
  price: number;
  tagline: string;
  samagriIncluded: boolean;
  enabled: boolean;
  features: string[];
}

export interface Puja {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  sanskritMantra?: string;
  startingPrice: number;
  duration: string;
  durationMinutes: number;
  category: string;
  deity?: string;
  rating?: number;
  reviewsCount?: number;
  templeLocation?: string;
  suitableOccasions: string[];
  occasionTags: string[];
  modes: PujaMode[];
  isPopular: boolean;
  image: any;
  description: string;
  significance: string;
  items: string[];
  occasionTag?: string;
  whatIsIncluded: {
    panditServices: string;
    guidance: string;
    samagriDetails: string;
    instructions: string;
  };
  preparationSteps: string[];
  packages: {
    panditOnly: PujaPackage;
    panditWithSamagri: PujaPackage;
  };
}

export interface PujaKit {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category?: string;
  categoryKey: string;
  price: number;
  originalPrice: number;
  image: any;
  itemsCount: number;
  description: string;
  itemsIncluded: string[];
  inStock: boolean;
  stockQuantity: number;
  certified?: boolean;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
}

export interface Occasion {
  id: string;
  title: string;
  subtitle: string;
  filterTag: string;
  iconName: string;
}

export interface PanchangData {
  tithi: string;
  tithiEnd: string;
  paksha: string;
  nakshatra: string;
  nakshatraEnd: string;
  yoga: string;
  karana: string;
  abhijitMuhurat: string;
  isAbhijitActive: boolean;
  rahuKaal: string;
  brahmaMuhurat: string;
  sunrise: string;
  sunset: string;
  auspiciousMessage: string;
}

export interface VedicStotram {
  id: string;
  title: string;
  deity: string;
  sanskritLine: string;
  meaning: string;
  duration: string;
  recommendedCount: number;
}

export const TODAYS_PANCHANG: PanchangData = {
  tithi: 'Shukla Trayodashi',
  tithiEnd: 'Ends at 03:42 PM',
  paksha: 'Shukla Paksha (Kartik)',
  nakshatra: 'Rohini Nakshatra',
  nakshatraEnd: 'Until 06:15 PM',
  yoga: 'Harshana Yoga',
  karana: 'Kaulava',
  abhijitMuhurat: '11:45 AM – 12:35 PM',
  isAbhijitActive: true,
  rahuKaal: '04:15 PM – 05:40 PM',
  brahmaMuhurat: '04:22 AM – 05:10 AM',
  sunrise: '06:21 AM',
  sunset: '05:54 PM',
  auspiciousMessage: 'Highly auspicious day for Rudrabhishek, Griha Pravesh & Mahalakshmi Yajan.',
};

export const VEDIC_STOTRAMS: VedicStotram[] = [
  {
    id: 'mrityunjaya',
    title: 'Maha Mrityunjaya Mantra',
    deity: 'Bhagwan Shiva',
    sanskritLine: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
    meaning: 'We worship the Three-eyed Lord Shiva who is fragrant and nourishes all beings. May he liberate us from death and samsara.',
    duration: '3:45',
    recommendedCount: 108,
  },
  {
    id: 'gayatri',
    title: 'Gayatri Mahamantra',
    deity: 'Mata Savitri & Surya',
    sanskritLine: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    meaning: 'We meditate on the supreme transcendental radiance of the Divine Sun. May it illuminate and inspire our intellect.',
    duration: '2:50',
    recommendedCount: 108,
  },
  {
    id: 'shree-suktam',
    title: 'Rigvediya Shree Suktam',
    deity: 'Mata Maha Lakshmi',
    sanskritLine: 'ॐ हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्। चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥',
    meaning: 'O Agni, invoke for me the Golden-hued Goddess Lakshmi who brings eternal abundance, joy and auspicious fortune.',
    duration: '5:20',
    recommendedCount: 16,
  },
  {
    id: 'hanuman-chalisa',
    title: 'Shri Hanuman Chalisa',
    deity: 'Sankat Mochan Hanuman',
    sanskritLine: 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥',
    meaning: 'Purifying the mirror of my mind with the dust of the Guru’s lotus feet, I sing the unblemished glory of Lord Rama.',
    duration: '4:15',
    recommendedCount: 7,
  },
];

export const UPCOMING_OCCASIONS: Occasion[] = [
  { id: 'occ-griha', title: 'Griha Pravesh', subtitle: 'Vastu Shanti & Housewarming', filterTag: 'Griha Pravesh', iconName: 'Home' },
  { id: 'occ-new', title: 'New Beginnings', subtitle: 'Ganesh Puja for business & vehicle', filterTag: 'Ganesh Puja', iconName: 'Sparkles' },
  { id: 'occ-rudra', title: 'Somwar Rudrabhishek', subtitle: 'Health, peace & protection', filterTag: 'Rudrabhishek', iconName: 'Sparkles' },
  { id: 'occ-purnima', title: 'Purnima Katha', subtitle: 'Satyanarayan for family harmony', filterTag: 'Satyanarayan Katha', iconName: 'HeartHandshake' },
];
