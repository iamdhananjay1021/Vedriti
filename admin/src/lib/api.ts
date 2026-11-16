import type {
  AudiencePreview,
  BroadcastAudience,
  BroadcastInput,
  BroadcastItem,
  BroadcastStatusInfo,
  BroadcastTemplate,
  AnnouncementItem,
  Banner,
  Booking,
  ChatMessageItem,
  ChatSessionItem,
  CouponItem,
  DayView,
  Devotee,
  DevoteesListResponse,
  KundliRequest,
  Order,
  Paged,
  PanchangData,
  Product,
  Puja,
  Settings,
  StaffMember,
  Stats,
  SamuhikBookingItem,
  SamuhikPujaItem,
  UserDetail,
} from './types';

const defaultApiBase =
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api/v1'
    : 'https://api.vedrit.in/api/v1';

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApiBase).replace(/\/+$/, '');

const TOKEN_KEY = 'vedrit.admin.token';

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet connection.', 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && path !== '/admin/login') onUnauthorized?.();
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status);
  }
  return (json?.data ?? json) as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const s = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== 'ALL')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return s ? `?${s}` : '';
};

export type ListParams = Record<string, string | number | undefined>;

export const adminApi = {
  login: (email: string, password: string) => request<{ token: string; email: string }>('POST', '/admin/login', { email, password }),
  me: () => request<{ email: string }>('GET', '/admin/me'),
  stats: () => request<Stats>('GET', '/admin/stats'),
  panchang: () => request<PanchangData>('GET', '/panchang/today'),

  bookings: (params: ListParams) => request<Paged<Booking>>('GET', `/admin/bookings${qs(params)}`),
  updateBooking: (id: string, body: Partial<Booking>) => request<Booking>('PATCH', `/admin/bookings/${id}`, body),
  rescheduleBooking: (id: string, date: string, startTime: string) =>
    request<Booking>('POST', `/admin/bookings/${id}/reschedule`, { date, startTime }),

  orders: (params: ListParams) => request<Paged<Order>>('GET', `/admin/orders${qs(params)}`),
  updateOrder: (id: string, body: Partial<Order>) => request<Order>('PATCH', `/admin/orders/${id}`, body),

  kundli: (params: ListParams) => request<Paged<KundliRequest>>('GET', `/admin/kundli${qs(params)}`),
  updateKundli: (id: string, body: Partial<KundliRequest>) => request<KundliRequest>('PATCH', `/admin/kundli/${id}`, body),

  users: (params: ListParams) => request<DevoteesListResponse>('GET', `/admin/users${qs(params)}`),
  user: (id: string) => request<UserDetail>('GET', `/admin/users/${id}`),
  updateUser: (id: string, isBlocked: boolean) => request<Devotee>('PATCH', `/admin/users/${id}`, { isBlocked }),

  pujas: () => request<Puja[]>('GET', '/admin/pujas'),
  savePuja: (puja: Puja) => (puja.id ? request<Puja>('PUT', `/admin/pujas/${puja.id}`, strip(puja)) : request<Puja>('POST', '/admin/pujas', strip(puja))),
  deletePuja: (id: string) => request<{ message?: string }>('DELETE', `/admin/pujas/${id}`),

  products: () => request<Product[]>('GET', '/admin/products'),
  saveProduct: (p: Product) => (p.id ? request<Product>('PUT', `/admin/products/${p.id}`, strip(p)) : request<Product>('POST', '/admin/products', strip(p))),
  deleteProduct: (id: string) => request<{ message?: string }>('DELETE', `/admin/products/${id}`),

  banners: () => request<Banner[]>('GET', '/admin/banners'),
  saveBanner: (b: Banner) => (b.id ? request<Banner>('PUT', `/admin/banners/${b.id}`, strip(b)) : request<Banner>('POST', '/admin/banners', strip(b))),
  deleteBanner: (id: string) => request<unknown>('DELETE', `/admin/banners/${id}`),
  uploadImage: async (blob: Blob) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/admin/media`, {
        method: 'POST',
        headers: { 'Content-Type': blob.type, Authorization: `Bearer ${tokenStore.get() ?? ''}` },
        body: blob,
      });
    } catch {
      throw new ApiError('Cannot reach the server. Check your internet connection.', 0);
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(json?.message || 'Upload failed', res.status);
    return json.data as { id: string; url: string };
  },

  settings: () => request<Settings>('GET', '/admin/settings'),
  saveSettings: (s: Partial<Settings>) => request<Settings>('PUT', '/admin/settings', s),

  day: (date: string, duration?: number) => request<DayView>('GET', `/admin/schedule${qs({ date, duration })}`),
  block: (body: { date: string; startTime: string; endTime: string; reason: string }) =>
    request<{ group: string }>('POST', '/admin/schedule/blocks', body),
  unblock: (group: string) => request<unknown>('DELETE', `/admin/schedule/blocks/${group}`),

  // Media / PDF upload
  uploadMedia: async (file: Blob | File) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/admin/media`, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream', Authorization: `Bearer ${tokenStore.get() ?? ''}` },
        body: file,
      });
    } catch {
      throw new ApiError('Cannot reach the server. Check your internet connection.', 0);
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(json?.message || 'Upload failed', res.status);
    return json.data as { id: string; url: string };
  },

  // Vedic AI Chat Inquiries
  chatSessions: (params: { category?: string; search?: string; page?: number; limit?: number }) =>
    request<Paged<ChatSessionItem>>('GET', `/admin/chat-sessions${qs(params)}`),
  chatSessionDetail: (sessionId: string) =>
    request<{ session: ChatSessionItem; messages: ChatMessageItem[] }>('GET', `/admin/chat-sessions/${sessionId}`),

  // Staff & Sub-Admins
  staff: () => request<StaffMember[]>('GET', '/admin/staff'),
  createStaff: (body: Partial<StaffMember> & { password?: string }) => request<StaffMember>('POST', '/admin/staff', body),
  updateStaff: (id: string, body: Partial<StaffMember> & { password?: string }) =>
    request<StaffMember>('PATCH', `/admin/staff/${id}`, body),
  deleteStaff: (id: string) => request<{ message: string }>('DELETE', `/admin/staff/${id}`),

  // Coupons & Festival Discounts
  coupons: () => request<CouponItem[]>('GET', '/admin/coupons'),
  saveCoupon: (c: Partial<CouponItem>) =>
    c._id || c.id ? request<CouponItem>('PUT', `/admin/coupons/${c._id || c.id}`, strip(c)) : request<CouponItem>('POST', '/admin/coupons', strip(c)),
  deleteCoupon: (id: string) => request<{ message: string }>('DELETE', `/admin/coupons/${id}`),

  // Announcements & Temple Broadcasts
  announcements: () => request<AnnouncementItem[]>('GET', '/admin/announcements'),
  saveAnnouncement: (a: Partial<AnnouncementItem>) =>
    a._id || a.id
      ? request<AnnouncementItem>('PUT', `/admin/announcements/${a._id || a.id}`, strip(a))
      : request<AnnouncementItem>('POST', '/admin/announcements', strip(a)),
  deleteAnnouncement: (id: string) => request<{ message: string }>('DELETE', `/admin/announcements/${id}`),

  // Samuhik Mahapujas (₹101 / ₹251 Micro-Dakshina)
  samuhikPujas: () => request<SamuhikPujaItem[]>('GET', '/admin/samuhik-pujas'),
  saveSamuhikPuja: (p: Partial<SamuhikPujaItem>) =>
    p._id || p.id
      ? request<SamuhikPujaItem>('PATCH', `/admin/samuhik-pujas/${p._id || p.id}`, strip(p))
      : request<SamuhikPujaItem>('POST', '/admin/samuhik-pujas', strip(p)),
  samuhikDevotees: (id: string) =>
    request<{ puja: SamuhikPujaItem; totalDevotees: number; devotees: SamuhikBookingItem[] }>(
      'GET',
      `/admin/samuhik-pujas/${id}/devotees`
    ),
  uploadSamuhikProof: (id: string, body: { sankalpVideoUrl?: string; sankalpPhotos?: string[]; status?: string }) =>
    request<{ message: string }>('POST', `/admin/samuhik-pujas/${id}/proof`, body),

  // Broadcast messaging (super admin only)
  broadcastStatus: () => request<BroadcastStatusInfo>('GET', '/admin/broadcasts/status'),
  broadcasts: (params: ListParams) => request<{ items: BroadcastItem[]; total: number; page: number; pages: number }>('GET', `/admin/broadcasts${qs(params)}`),
  broadcast: (id: string) => request<BroadcastItem>('GET', `/admin/broadcasts/${id}`),
  createBroadcast: (body: BroadcastInput) => request<BroadcastItem>('POST', '/admin/broadcasts', body),
  updateBroadcast: (id: string, body: BroadcastInput) => request<BroadcastItem>('PUT', `/admin/broadcasts/${id}`, body),
  sendBroadcast: (id: string) => request<{ message: string }>('POST', `/admin/broadcasts/${id}/send`),
  cancelBroadcast: (id: string) => request<{ id: string; status: string }>('POST', `/admin/broadcasts/${id}/cancel`),
  retryBroadcast: (id: string) => request<{ message: string }>('POST', `/admin/broadcasts/${id}/retry`),
  sendPendingSms: (id: string) => request<{ sent: number; failed: number }>('POST', `/admin/broadcasts/${id}/sms`),
  deleteBroadcast: (id: string) => request<{ message: string }>('DELETE', `/admin/broadcasts/${id}`),
  previewBroadcast: (body: Omit<BroadcastInput, 'schedule'>) =>
    request<{ email: { subject: string; html: string; text: string }; sms: string; inApp: { title: string; body: string } }>('POST', '/admin/broadcasts/preview', body),
  testBroadcast: (body: Omit<BroadcastInput, 'schedule'>) => request<{ message: string }>('POST', '/admin/broadcasts/test', body),
  audiencePreview: (audience: BroadcastAudience, type: string) => request<AudiencePreview>('POST', '/admin/broadcasts/audience', { audience, type }),
  broadcastTemplates: () => request<BroadcastTemplate[]>('GET', '/admin/broadcasts/templates'),
  saveBroadcastTemplate: (t: Partial<BroadcastTemplate>) =>
    t.id ? request<BroadcastTemplate>('PUT', `/admin/broadcasts/templates/${t.id}`, strip(t)) : request<BroadcastTemplate>('POST', '/admin/broadcasts/templates', strip(t)),
  deleteBroadcastTemplate: (id: string) => request<{ message: string }>('DELETE', `/admin/broadcasts/templates/${id}`),
};

const SERVER_FIELDS = ['id', '_id', 'createdAt', 'updatedAt', 'startingPrice', 'inStock'];

function strip<T extends object>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !SERVER_FIELDS.includes(key)));
}
