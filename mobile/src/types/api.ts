export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PAY_LATER';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type KundliStatus = 'SUBMITTED' | 'IN_REVIEW' | 'ANSWERED' | 'CLOSED';
export type KundliType = 'JANAM_KUNDLI' | 'GUNA_MILAN' | 'DOSHA_NIVARAN' | 'GENERAL_QUERY';
export type ServiceType = 'PUJA' | 'CONSULTATION';
export type PujaMode = 'ONLINE' | 'AT_HOME' | 'AT_TEMPLE';
export type ConsultationMode = 'AUDIO_CALL' | 'VIDEO_CALL' | 'IN_PERSON';
export type BookingMode = PujaMode | ConsultationMode;
export type PackageType = 'PANDIT_ONLY' | 'WITH_SAMAGRI';
export type ProductCategory = 'PUJA_KIT' | 'RUDRAKSHA' | 'YANTRA' | 'SAMAGRI' | 'DHOOP' | 'OTHER';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  gotra: string;
  dateOfBirth: string;
  rashi: string;
  nakshatra: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  email: string;
  authProvider: 'phone' | 'email';
  emailVerified: boolean;
  avatarUrl: string;
  name: string;
  gender: Gender | '';
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
}

export interface AuthResult {
  token: string;
  user: UserProfile;
  isNewUser: boolean;
}

export interface OtpRequestResult {
  phone: string;
  resendInSeconds: number;
  expiresInMinutes: number;
  isNewUser: boolean;
  devOtp?: string;
}

export interface ApiPujaPackage {
  enabled: boolean;
  name: string;
  tagline: string;
  price: number;
  features: string[];
}

export interface ApiPuja {
  id: string;
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
  whatIsIncluded: {
    panditServices: string;
    guidance: string;
    samagriDetails: string;
    instructions: string;
  };
  packages: { panditOnly: ApiPujaPackage; withSamagri: ApiPujaPackage };
  modes: PujaMode[];
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  startingPrice: number;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  description: string;
  itemsIncluded: string[];
  stockQuantity: number;
  inStock: boolean;
  imageUrl: string;
  badge: string;
  rating: number;
  reviewsCount: number;
}

export interface PublicSettings {
  panditName: string;
  panditTitle: string;
  panditBio: string;
  experienceYears: number;
  templeAddress: string;
  supportPhone: string;
  whatsappNumber: string;
  supportEmail: string;
  consultation: {
    enabled: boolean;
    title: string;
    fee: number;
    durationMinutes: number;
    modes: ConsultationMode[];
  };
  kundliFees: Record<KundliType, number>;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  allowPayLater: boolean;
  allowCod: boolean;
  userCancelHours: number;
  bookingWindowDays: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
  label: string;
  available: boolean;
}

export interface DaySlots {
  date: string;
  available: boolean;
  reason: string | null;
  slots: Slot[];
  durationMinutes: number;
}

export interface CalendarDay {
  date: string;
  available: boolean;
  freeSlots: number;
  reason: string | null;
}

export interface Booking {
  id: string;
  bookingId: string;
  serviceType: ServiceType;
  pujaId: string | null;
  title: string;
  packageType: PackageType | '';
  packageName: string;
  mode: BookingMode;
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
  paymentUrl: string | null;
  status: BookingStatus;
  meetingLink: string;
  panditNote: string;
  cancelReason: string;
  cancelledBy: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
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
  paymentUrl: string | null;
  status: OrderStatus;
  courierPartner: string;
  trackingNumber: string;
  adminNote: string;
  cancelReason: string;
  createdAt: string;
}

export interface KundliPerson {
  fullName: string;
  gender: Gender;
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
  paymentUrl: string | null;
  status: KundliStatus;
  panditResponse: string;
  respondedAt: string | null;
  createdAt: string;
}

export type BannerTarget = 'NONE' | 'PUJAS' | 'PUJA' | 'STORE' | 'KUNDLI' | 'APPOINTMENT';

export interface ApiBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  targetType: BannerTarget;
  targetRef: string;
}

export interface HomePanchang {
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
}

export interface HomeContent {
  banners: ApiBanner[];
  announcement: string | null;
  panchang: HomePanchang | null;
  sections: { popularPujas: boolean; kits: boolean; kundli: boolean; pandit: boolean; japa: boolean };
}
