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
  imageUrl?: string;
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
  reportUrl?: string;
  reportName?: string;
  attachments?: { url: string; name?: string; contentType?: string }[];
  respondedAt: string | null;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  gotra: string;
  dateOfBirth?: string;
  rashi?: string;
  nakshatra?: string;
}

export interface Devotee {
  id: string;
  phone: string;
  email: string;
  authProvider: 'phone' | 'email';
  emailVerified?: boolean;
  avatarUrl?: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  gotra: string;
  rashi: string;
  nakshatra?: string;
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
  ordersCount?: number;
  kundliCount?: number;
  totalSpent?: number;
  familyCount?: number;
}

export interface DevoteesSummary {
  total: number;
  active: number;
  incomplete: number;
  blocked: number;
}

export interface DevoteesListResponse extends Paged<Devotee> {
  summary?: DevoteesSummary;
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
  auth?: { emailLogin: boolean; smsLogin: boolean; passwordLogin: boolean };
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

export interface PanchangData {
  date: string;
  vikramSamvat: string;
  shakaSamvat: string;
  month: string;
  paksha: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  abhijitMuhurat: string;
  isAbhijitActiveNow: boolean;
  rahuKaal: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  auspiciousMessage: string;
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
  activeUsers?: number;
  totalPujas?: number;
  totalProducts?: number;
  revenue: {
    total: number;
    month: number;
    today?: number;
    bookings: number;
    orders: number;
    kundli: number;
    bookingsMonth?: number;
    ordersMonth?: number;
    kundliMonth?: number;
    bookingsToday?: number;
    ordersToday?: number;
    kundliToday?: number;
  };
  nextBookings: Booking[];
  todaysSchedule?: Booking[];
  pendingKundlis?: KundliRequest[];
  recentOrders?: Order[];
  lowStock: { _id: string; name: string; stockQuantity: number; price?: number }[];
}

export interface DayView {
  date: string;
  isBlockedDate: boolean;
  dayAvailability: string | null;
  bookings: Booking[];
  blocks: { group: string; reason: string; blocks: string[] }[];
  slots: { startTime: string; endTime: string; label: string; available: boolean }[];
}

export interface DevoteeStats {
  totalSpent: number;
  bookingsCount: number;
  completedBookings: number;
  activeBookings: number;
  ordersCount: number;
  kundliCount: number;
  familyCount: number;
}

export interface UserDetail {
  user: Devotee;
  stats?: DevoteeStats;
  bookings: Booking[];
  orders: Order[];
  kundli: KundliRequest[];
}

export interface ChatSessionItem {
  id: string;
  sessionId: string;
  userPhone: string;
  title: string;
  category: string;
  devoteeContext: {
    name?: string;
    gotra?: string;
    rashi?: string;
    nakshatra?: string;
    city?: string;
  };
  messageCount: number;
  lastInteractionAt: string;
  createdAt: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai' | 'acharya';
  text: string;
  sanskritVerse?: string;
  shastraReference?: string;
  remedy?: string;
  action?: { type: string; title?: string; targetId?: string };
  followUps?: string[];
  createdAt: string;
}

export interface StaffMember {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'astrologer' | 'store_manager';
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface CouponItem {
  _id?: string;
  id?: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  applicableTo: 'ALL' | 'PUJA' | 'STORE' | 'KUNDLI';
  validFrom: string;
  validTill: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AnnouncementItem {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  category: 'FESTIVAL' | 'PUJA_ALERT' | 'MUHURAT' | 'TEMPLE_NOTICE';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  actionType: 'PUJAS' | 'STORE' | 'KUNDLI' | 'NONE';
  actionRef: string;
  actionLabel: string;
  startsOn: string;
  endsOn: string;
  isActive: boolean;
  createdAt?: string;
}

export interface SamuhikPujaTier {
  id: string;
  name: string;
  dakshina: number;
  maxFamilyMembers: number;
  prasadIncluded: boolean;
  description?: string;
}

export interface SamuhikPujaItem {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  deity: string;
  templeVenue: string;
  eventDate: string;
  muhuratTime: string;
  imageUrl?: string;
  description?: string;
  benefits?: string[];
  vidhiInclusions?: string[];
  tiers: SamuhikPujaTier[];
  maxDevotees: number;
  enrolledCount: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  sankalpVideoUrl?: string;
  sankalpPhotos?: string[];
  isFeatured: boolean;
  createdAt?: string;
}

export interface SamuhikBookingItem {
  _id?: string;
  id?: string;
  bookingId: string;
  samuhikPujaId: string;
  userId: string;
  devoteeName: string;
  phone: string;
  gotra: string;
  rashi?: string;
  familyMembers?: { name: string; relation: string }[];
  sankalpWish?: string;
  tierId: string;
  tierName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export type BroadcastType = 'ANNOUNCEMENT' | 'OFFER' | 'FESTIVAL' | 'REMINDER' | 'NOTICE';
export type BroadcastChannel = 'EMAIL' | 'SMS' | 'INAPP';
export type BroadcastStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'CANCELLED';
export type TriState = 'any' | 'yes' | 'no';

export interface BroadcastAudience {
  mode: 'ALL' | 'SEGMENT' | 'CUSTOM';
  cities: string[];
  states: string[];
  gender: 'any' | 'MALE' | 'FEMALE' | 'OTHER';
  profileCompleted: TriState;
  hasBooking: TriState;
  hasOrder: TriState;
  joinedWithinDays: number;
  inactiveForDays: number;
  emails: string[];
  phones: string[];
}

export interface DeliveryCounts {
  PENDING: number;
  SENT: number;
  FAILED: number;
  SKIPPED: number;
}

export interface BroadcastItem {
  id: string;
  name: string;
  type: BroadcastType;
  channels: BroadcastChannel[];
  subject: string;
  body: string;
  smsText: string;
  ctaLabel: string;
  ctaUrl: string;
  audience: BroadcastAudience;
  status: BroadcastStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  pausedReason: string;
  recipientCount: number;
  createdBy: string;
  createdAt: string;
  stats: Partial<Record<BroadcastChannel, DeliveryCounts>>;
  problems?: { channel: BroadcastChannel; to: string; name: string; status: 'FAILED' | 'SKIPPED'; error: string }[];
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  type: BroadcastType;
  subject: string;
  body: string;
  smsText: string;
  ctaLabel: string;
  ctaUrl: string;
  isSystem: boolean;
}

export interface BroadcastStatusInfo {
  email: { enabled: boolean; dailyLimit: number; note: string };
  sms: { enabled: boolean; note: string };
  variables: string[];
}

export interface AudiencePreview {
  total: number;
  emailReachable: number;
  smsReachable: number;
  inAppReachable: number;
  optedOut: number;
  sample: { name: string; email: string; phone: string }[];
}

export interface BroadcastInput {
  name: string;
  type: BroadcastType;
  channels: BroadcastChannel[];
  subject: string;
  body: string;
  smsText: string;
  ctaLabel: string;
  ctaUrl: string;
  audience: BroadcastAudience;
  schedule: { mode: 'draft' | 'now' | 'later'; at?: string };
}

export interface AuthStatus {
  email: { enabled: boolean; from: string };
  sms: { enabled: boolean; provider: string; balance: { credits?: number; error?: string } | null };
}
