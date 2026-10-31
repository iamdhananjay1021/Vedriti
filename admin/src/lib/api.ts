import type { Banner, Booking, DayView, Devotee, KundliRequest, Order, Paged, Product, Puja, Settings, Stats, UserDetail } from './types';

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.vedrit.in/api/v1').replace(/\/+$/, '');

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

  bookings: (params: ListParams) => request<Paged<Booking>>('GET', `/admin/bookings${qs(params)}`),
  updateBooking: (id: string, body: Partial<Booking>) => request<Booking>('PATCH', `/admin/bookings/${id}`, body),
  rescheduleBooking: (id: string, date: string, startTime: string) =>
    request<Booking>('POST', `/admin/bookings/${id}/reschedule`, { date, startTime }),

  orders: (params: ListParams) => request<Paged<Order>>('GET', `/admin/orders${qs(params)}`),
  updateOrder: (id: string, body: Partial<Order>) => request<Order>('PATCH', `/admin/orders/${id}`, body),

  kundli: (params: ListParams) => request<Paged<KundliRequest>>('GET', `/admin/kundli${qs(params)}`),
  updateKundli: (id: string, body: Partial<KundliRequest>) => request<KundliRequest>('PATCH', `/admin/kundli/${id}`, body),

  users: (params: ListParams) => request<Paged<Devotee>>('GET', `/admin/users${qs(params)}`),
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
};

const SERVER_FIELDS = ['id', '_id', 'createdAt', 'updatedAt', 'startingPrice', 'inStock'];

function strip<T extends object>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !SERVER_FIELDS.includes(key)));
}
