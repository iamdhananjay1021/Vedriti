export type ThemeMode = 'light' | 'dark';

export type AdminTab = 'overview' | 'bookings' | 'orders' | 'catalog' | 'devotees' | 'settings';

export type BookingStatus = 'Pending Sankalp' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export type OrderStatus = 'Order Confirmed' | 'Consecrated' | 'Shipped' | 'Delivered';

export interface DevoteeFamilyMember {
  name: string;
  relation: string;
  gotra: string;
  rashi?: string;
  nakshatra?: string;
}

export interface AdminPujaBooking {
  id: string;
  referenceNo: string;
  pujaTitle: string;
  deity: string;
  devoteeName: string;
  devoteePhone: string;
  gotra: string;
  kuldevi: string;
  city: string;
  bookingDate: string;
  muhuratTime: string;
  packageType: 'Standard' | 'Vedic Vidhi' | 'Maha Anushthan';
  dakshinaAmount: number;
  paymentStatus: 'Paid (UPI)' | 'Paid (Card)' | 'Pending';
  status: BookingStatus;
  assignedAcharya?: string;
  specialSankalp?: string;
  familyMembers: DevoteeFamilyMember[];
  sankalpPatraGenerated: boolean;
}

export interface AdminStoreOrder {
  id: string;
  orderNumber: string;
  devoteeName: string;
  devoteePhone: string;
  shippingAddress: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  orderDate: string;
  awbNumber?: string;
  courier: string;
}

export interface AdminCatalogItem {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  certified: boolean;
  type: 'puja' | 'product';
  badge?: string;
}

export interface AdminDevotee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  signupMethod?: 'phone' | 'email';
  gotra: string;
  city: string;
  totalPujas: number;
  totalStoreOrders: number;
  punyaPoints: number;
  isVip: boolean;
  joinedDate: string;
}

export interface AcharyaPayout {
  id: string;
  acharyaName: string;
  vedicSpecialty: string;
  completedPujasCount: number;
  pendingDakshina: number;
  paidDakshina: number;
  bankAccount: string;
  status: 'Ready for Settlement' | 'Processed';
}
