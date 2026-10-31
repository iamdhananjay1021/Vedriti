import { API_BASE_URL } from '../config/api';
import { session } from './session';
import type {
  ApiProduct,
  ApiPuja,
  AuthResult,
  Booking,
  CalendarDay,
  HomeContent,
  DaySlots,
  FamilyMember,
  KundliRequest,
  Order,
  OtpRequestResult,
  PublicSettings,
  ServiceType,
  UserProfile,
} from '../types/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Listener = () => void;
let unauthorizedListener: Listener | null = null;
export const onUnauthorized = (listener: Listener | null) => {
  unauthorizedListener = listener;
};

const REQUEST_TIMEOUT_MS = 20000;

async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = session.get();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error: any) {
    throw new ApiError(
      error?.name === 'AbortError'
        ? 'Server is taking too long to respond. Please try again.'
        : 'No internet connection. Please check your network and try again.',
      0
    );
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth && token) unauthorizedListener?.();
    throw new ApiError(json?.message || 'Something went wrong. Please try again.', res.status);
  }
  return (json?.data ?? json) as T;
}

const qs = (params: Record<string, string | number | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

export type ProfileUpdate = Partial<Omit<UserProfile, 'id' | 'authProvider' | 'profileCompleted' | 'familyMembers' | 'createdAt'>>;
export type FamilyMemberInput = Omit<FamilyMember, 'id'>;

export interface CreateBookingInput {
  serviceType: ServiceType;
  pujaId?: string;
  packageType?: 'PANDIT_ONLY' | 'WITH_SAMAGRI';
  mode: string;
  date: string;
  startTime: string;
  devoteeName: string;
  phone: string;
  gotra?: string;
  familyMembers?: string[];
  sankalpNote?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  paymentMethod: 'ONLINE' | 'PAY_LATER';
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  paymentMethod: 'ONLINE' | 'COD';
}

export interface CreateKundliInput {
  type: KundliRequest['type'];
  primaryPerson: KundliRequest['primaryPerson'];
  partnerPerson?: KundliRequest['primaryPerson'];
  questions: string;
  contactPhone: string;
  preferredLanguage: 'HINDI' | 'ENGLISH';
  paymentMethod: 'ONLINE' | 'PAY_LATER';
}

export type PaymentRefType = 'booking' | 'order' | 'kundli';

export interface EmailOtpResult {
  email: string;
  isNewUser?: boolean;
  resendInSeconds: number;
  expiresInMinutes: number;
  devOtp?: string;
}

export const api = {
  requestOtp: (phone: string) => request<OtpRequestResult>('POST', '/auth/request-otp', { phone }, false),
  verifyOtp: (phone: string, otp: string) => request<AuthResult>('POST', '/auth/verify-otp', { phone, otp }, false),
  requestEmailOtp: (email: string) => request<EmailOtpResult>('POST', '/auth/email/request-otp', { email }, false),
  verifyEmailOtp: (email: string, otp: string) => request<AuthResult>('POST', '/auth/email/verify-otp', { email, otp }, false),
  signupEmail: (email: string, password: string, otp: string, name?: string) =>
    request<AuthResult>('POST', '/auth/signup-email', { email, password, otp, name }, false),
  forgotPassword: (email: string) => request<EmailOtpResult>('POST', '/auth/password/forgot', { email }, false),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    request<AuthResult>('POST', '/auth/password/reset', { email, otp, newPassword }, false),
  loginEmail: (email: string, password: string) => request<AuthResult>('POST', '/auth/login-email', { email, password }, false),
  me: () => request<UserProfile>('GET', '/auth/me'),
  updateMe: (updates: ProfileUpdate) => request<UserProfile>('PATCH', '/auth/me', updates),
  uploadAvatar: async (blob: Blob): Promise<UserProfile> => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/auth/me/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'image/jpeg', Authorization: `Bearer ${session.get() ?? ''}` },
        body: blob,
      });
    } catch {
      throw new ApiError('No internet connection. Please check your network and try again.', 0);
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(json?.message || 'Could not upload the photo. Please try again.', res.status);
    return json.data as UserProfile;
  },
  removeAvatar: () => request<UserProfile>('DELETE', '/auth/me/avatar'),
  deleteMe: () => request<{ message: string }>('DELETE', '/auth/me'),
  addFamilyMember: (member: FamilyMemberInput) => request<UserProfile>('POST', '/auth/me/family', member),
  updateFamilyMember: (id: string, member: FamilyMemberInput) => request<UserProfile>('PUT', `/auth/me/family/${id}`, member),
  removeFamilyMember: (id: string) => request<UserProfile>('DELETE', `/auth/me/family/${id}`),

  settings: () => request<PublicSettings>('GET', '/settings', undefined, false),
  home: () => request<HomeContent>('GET', '/home', undefined, false),
  pujas: () => request<ApiPuja[]>('GET', '/pujas', undefined, false),
  products: () => request<ApiProduct[]>('GET', '/products', undefined, false),
  slots: (params: { serviceType: ServiceType; pujaId?: string; date: string }) =>
    request<DaySlots>('GET', `/slots?${qs(params)}`, undefined, false),
  calendar: (params: { serviceType: ServiceType; pujaId?: string; days?: number }) =>
    request<CalendarDay[]>('GET', `/slots/calendar?${qs(params)}`, undefined, false),

  createBooking: (input: CreateBookingInput) => request<Booking>('POST', '/me/bookings', input),
  myBookings: () => request<Booking[]>('GET', '/me/bookings'),
  booking: (bookingId: string) => request<Booking>('GET', `/me/bookings/${bookingId}`),
  cancelBooking: (bookingId: string, reason?: string) => request<Booking>('POST', `/me/bookings/${bookingId}/cancel`, { reason }),

  createOrder: (input: CreateOrderInput) => request<Order>('POST', '/me/orders', input),
  myOrders: () => request<Order[]>('GET', '/me/orders'),
  cancelOrder: (orderId: string) => request<Order>('POST', `/me/orders/${orderId}/cancel`, {}),

  submitKundli: (input: CreateKundliInput) => request<KundliRequest>('POST', '/me/kundli', input),
  myKundli: () => request<KundliRequest[]>('GET', '/me/kundli'),

  payNow: (type: PaymentRefType, reference: string) =>
    request<{ paymentUrl: string }>('POST', '/me/payments/pay-now', { type, reference }),
  paymentStatus: (type: PaymentRefType, reference: string) =>
    request<{ paymentStatus: string; status: string }>('GET', `/me/payments/status/${type}/${reference}`),
};
