export type ThemeMode = 'light' | 'dark';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PAY_LATER';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type KundliStatus = 'SUBMITTED' | 'IN_REVIEW' | 'ANSWERED' | 'CLOSED';
export type KundliType = 'JANAM_KUNDLI' | 'GUNA_MILAN' | 'DOSHA_NIVARAN' | 'GENERAL_QUERY';
export type PujaMode = 'ONLINE' | 'AT_HOME' | 'AT_TEMPLE';
export type ConsultationMode = 'AUDIO_CALL' | 'VIDEO_CALL' | 'IN_PERSON';
export type ProductCategory = 'PUJA_KIT' | 'RUDRAKSHA' | 'YANTRA' | 'SAMAGRI' | 'DHOOP' | 'OTHER';

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Booking {
  id: string;
  bookingId: string;
  serviceType: 'PUJA' | 'CONSULTATION';
  title: string;
  packageName: string;
  mode: PujaMode | ConsultationMode;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  devoteeName: string;
  phone: string;
  gotra: string;
  familyMembers: string[];
  sankalpNote: string;
  address: string;
  city: string;
  pinCode: string;
  amount: number;
  paymentMethod: 'ONLINE' | 'PAY_LATER';
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  meetingLink: string;
  panditNote: string;
  cancelReason: string;
  cancelledBy: string;
  createdAt: string;
  user?: { id: string; name: string; phone: string; email: string } | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderId: string;
  items: OrderItem[];
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'ONLINE' | 'COD';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  courierPartner: string;
  trackingNumber: string;
  adminNote: string;
  cancelReason: string;
  createdAt: string;
}

export interface KundliPerson {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  timeUnknown: boolean;
  placeOfBirth: string;
}

export interface KundliRequest {
  id: string;
  requestId: string;
  type: KundliType;
  primaryPerson: KundliPerson;
  partnerPerson: KundliPerson | null;
  questions: string;
  contactPhone: string;
  preferredLanguage: 'HINDI' | 'ENGLISH';
  amount: number;
  paymentMethod: 'ONLINE' | 'PAY_LATER';
  paymentStatus: PaymentStatus;
  status: KundliStatus;
  panditResponse: string;
  respondedAt: string | null;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  gotra: string;
}

export interface Devotee {
  id: string;
  phone: string;
  email: string;
  authProvider: 'phone' | 'email';
  avatarUrl?: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  gotra: string;
  rashi: string;
  city: string;
  state: string;
  address: string;
  pinCode: string;
  profileCompleted: boolean;
  familyMembers: FamilyMember[];
  createdAt: string;
  isBlocked: boolean;
  lastLoginAt?: string;
  bookingsCount?: number;
}

export interface PujaPackage {
  enabled: boolean;
  name: string;
  tagline: string;
  price: number;
  features: string[];
}

export interface Puja {
  id?: string;
  slug: string;
  name: string;
  subtitle: string;
  sanskritMantra: string;
  category: string;
  deity: string;
  durationMinutes: number;
  description: string;
  significance: string;
  items: string[];
  suitableOccasions: string[];
  occasionTags: string[];
  preparationSteps: string[];
  whatIsIncluded: { panditServices: string; guidance: string; samagriDetails: string; instructions: string };
  packages: { panditOnly: PujaPackage; withSamagri: PujaPackage };
  modes: PujaMode[];
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  description: string;
  itemsIncluded: string[];
  stockQuantity: number;
  imageUrl: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  sortOrder: number;
}

export interface DaySchedule {
  day: number;
  enabled: boolean;
  start: string;
  end: string;
}

export interface Settings {
  panditName: string;
  panditTitle: string;
  panditBio: string;
  experienceYears: number;
  templeAddress: string;
  supportPhone: string;
  whatsappNumber: string;
  supportEmail: string;
  schedule: DaySchedule[];
  slotIntervalMinutes: 30 | 60;
  bufferMinutes: number;
  bookingWindowDays: number;
  minLeadHours: number;
  blockedDates: string[];
  consultation: { enabled: boolean; title: string; fee: number; durationMinutes: number; modes: ConsultationMode[] };
  kundliFees: Record<KundliType, number>;
  home: HomeSettings;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  allowPayLater: boolean;
  allowCod: boolean;
  userCancelHours: number;
}

export interface HomeSettings {
  announcement: { enabled: boolean; text: string };
  panchang: {
    date: string;
    paksha: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    abhijitMuhurat: string;
    rahuKaal: string;
    sunrise: string;
    sunset: string;
    note: string;
  };
  sections: { popularPujas: boolean; kits: boolean; kundli: boolean; pandit: boolean; japa: boolean };
}

export type BannerTarget = 'NONE' | 'PUJAS' | 'PUJA' | 'STORE' | 'KUNDLI' | 'APPOINTMENT';

export interface Banner {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  targetType: BannerTarget;
  targetRef: string;
  startsOn: string;
  endsOn: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Stats {
  today: string;
  todaysBookings: number;
  pendingBookings: number;
  upcomingBookings: number;
  openOrders: number;
  openKundli: number;
  totalUsers: number;
  newUsersThisMonth: number;
  revenue: { total: number; month: number; bookings: number; orders: number; kundli: number };
  nextBookings: Booking[];
  lowStock: { _id: string; name: string; stockQuantity: number }[];
}

export interface DayView {
  date: string;
  isBlockedDate: boolean;
  dayAvailability: string | null;
  bookings: Booking[];
  blocks: { group: string; reason: string; blocks: string[] }[];
  slots: { startTime: string; endTime: string; label: string; available: boolean }[];
}

export interface UserDetail {
  user: Devotee;
  bookings: Booking[];
  orders: Order[];
  kundli: KundliRequest[];
}
