import type { BookingStatus, KundliStatus, KundliType, OrderStatus, PaymentStatus } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const rupees = (v: number) => `₹${Math.round(v || 0).toLocaleString('en-IN')}`;

export const formatDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
};

export const formatTime = (hhmm: string) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const todayIst = () => {
  const now = new Date(Date.now() + 330 * 60000);
  return now.toISOString().slice(0, 10);
};

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const MODE_LABELS: Record<string, string> = {
  ONLINE: 'Online (Video)',
  AT_HOME: 'At Devotee Home',
  AT_TEMPLE: 'At Temple',
  AUDIO_CALL: 'Phone Call',
  VIDEO_CALL: 'Video Call',
  IN_PERSON: 'In Person',
};

export const BOOKING_STATUS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const KUNDLI_STATUS: Record<KundliStatus, string> = {
  SUBMITTED: 'New',
  IN_REVIEW: 'In Review',
  ANSWERED: 'Answered',
  CLOSED: 'Closed',
};

export const KUNDLI_TYPES: Record<KundliType, string> = {
  JANAM_KUNDLI: 'Janam Kundli',
  GUNA_MILAN: 'Guna Milan',
  DOSHA_NIVARAN: 'Dosha Nivaran',
  GENERAL_QUERY: 'General Question',
};

export const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  PENDING: 'Unpaid',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PAY_LATER: 'Pay Later',
};

export const TONE: Record<string, 'amber' | 'green' | 'blue' | 'gray' | 'red'> = {
  PENDING: 'amber',
  PLACED: 'amber',
  SUBMITTED: 'amber',
  PAY_LATER: 'amber',
  IN_REVIEW: 'blue',
  SHIPPED: 'blue',
  CONFIRMED: 'green',
  ANSWERED: 'green',
  PAID: 'green',
  COMPLETED: 'gray',
  DELIVERED: 'gray',
  CLOSED: 'gray',
  REFUNDED: 'gray',
  CANCELLED: 'red',
  FAILED: 'red',
};

export const telLink = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;
export const waLink = (phone: string, text = '') => `https://wa.me/${phone.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
