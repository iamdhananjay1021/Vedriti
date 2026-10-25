export type TabType = 'home' | 'pujas' | 'shop' | 'bookings' | 'profile';

export interface PujaItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'dosha' | 'peace' | 'wealth' | 'health' | 'graha';
  duration: string;
  priestsCount: number;
  originalPrice: number;
  price: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  image: string;
  description: string;
  benefits: string[];
  samagriIncluded: boolean;
}

export interface ProductItem {
  id: string;
  title: string;
  category: 'rudraksha' | 'yantra' | 'samagri' | 'gemstone' | 'dhoop';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  image: string;
  certified: boolean;
  inStock: boolean;
  shortDesc: string;
}

export interface BookingRecord {
  id: string;
  pujaTitle: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'in-progress' | 'completed';
  panditName: string;
  sankalpName: string;
  gotra: string;
  amount: number;
  liveLinkAvailable: boolean;
}

export interface PanchangInfo {
  tithi: string;
  nakshatra: string;
  shubhMuhurat: string;
  rahukaal: string;
  day: string;
  date: string;
}
