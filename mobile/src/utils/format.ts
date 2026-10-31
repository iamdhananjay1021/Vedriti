import type { BookingMode, BookingStatus, KundliStatus, KundliType, OrderStatus, PaymentStatus } from '../types/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const rupees = (value: number) => `₹${Math.round(value || 0).toLocaleString('en-IN')}`;

export const parseDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const formatDate = (iso: string) => {
  if (!iso) return '';
  const d = parseDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDay = (iso: string) => {
  const d = parseDate(iso);
  return { weekday: DAYS[d.getDay()], day: d.getDate(), month: MONTHS[d.getMonth()] };
};

export const formatTime = (hhmm: string) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const formatDuration = (minutes: number) => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  if (!m) return `${h} ${h === 1 ? 'Hour' : 'Hours'}`;
  return `${h}h ${m}m`;
};

export const formatDateTime = (value: string) => {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${formatTime(
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  )}`;
};

export const MODE_LABELS: Record<BookingMode, string> = {
  ONLINE: 'Online (Video)',
  AT_HOME: 'At My Home',
  AT_TEMPLE: 'At Temple',
  AUDIO_CALL: 'Phone Call',
  VIDEO_CALL: 'Video Call',
  IN_PERSON: 'In Person',
};

export const MODE_HINTS: Record<BookingMode, string> = {
  ONLINE: 'Join live on video. Meeting link is shared after confirmation.',
  AT_HOME: 'Pandit Ji will visit your address.',
  AT_TEMPLE: 'Puja is performed at the temple on your behalf.',
  AUDIO_CALL: 'Pandit Ji will call you on your number.',
  VIDEO_CALL: 'Video link is shared after confirmation.',
  IN_PERSON: 'Meet Pandit Ji at the temple address.',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Awaiting Confirmation',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const KUNDLI_STATUS_LABELS: Record<KundliStatus, string> = {
  SUBMITTED: 'Sent to Pandit Ji',
  IN_REVIEW: 'Pandit Ji is reviewing',
  ANSWERED: 'Answered',
  CLOSED: 'Closed',
};

export const KUNDLI_TYPE_LABELS: Record<KundliType, string> = {
  JANAM_KUNDLI: 'Janam Kundli Analysis',
  GUNA_MILAN: 'Kundli Milan (Marriage)',
  DOSHA_NIVARAN: 'Dosha Nivaran',
  GENERAL_QUERY: 'Ask a Question',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Payment Pending',
  PAID: 'Paid',
  FAILED: 'Payment Failed',
  REFUNDED: 'Refunded',
  PAY_LATER: 'Pay Later',
};

export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  PENDING: { bg: '#FEF3C7', fg: '#92400E' },
  PLACED: { bg: '#FEF3C7', fg: '#92400E' },
  SUBMITTED: { bg: '#FEF3C7', fg: '#92400E' },
  IN_REVIEW: { bg: '#E0E7FF', fg: '#3730A3' },
  CONFIRMED: { bg: '#DCFCE7', fg: '#166534' },
  SHIPPED: { bg: '#E0E7FF', fg: '#3730A3' },
  ANSWERED: { bg: '#DCFCE7', fg: '#166534' },
  COMPLETED: { bg: '#E5E7EB', fg: '#1F2937' },
  DELIVERED: { bg: '#E5E7EB', fg: '#1F2937' },
  CLOSED: { bg: '#E5E7EB', fg: '#1F2937' },
  CANCELLED: { bg: '#FEE2E2', fg: '#991B1B' },
};

export const isValidPhone = (value: string) => /^[6-9]\d{9}$/.test(value.replace(/\D/g, '').slice(-10));
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
export const isValidPin = (value: string) => /^[1-9]\d{5}$/.test(value.trim());
export const localPhone = (value: string) => value.replace(/\D/g, '').slice(-10);
