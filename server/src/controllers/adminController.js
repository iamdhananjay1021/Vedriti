import crypto from 'crypto';
import { z } from 'zod';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Booking } from '../models/Booking.js';
import { Order } from '../models/Order.js';
import { KundliRequest } from '../models/KundliRequest.js';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';
import { Puja } from '../models/Puja.js';
import { Product } from '../models/Product.js';
import { SlotHold } from '../models/SlotHold.js';
import { ChatSession } from '../models/ChatSession.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { Coupon } from '../models/Coupon.js';
import { Announcement } from '../models/Announcement.js';
import { getSettings } from '../models/Settings.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { signAdminToken } from '../services/authService.js';
import { blockTimeRange, getAvailableSlots, releaseSlot, reserveSlot, restoreSlot, unblockGroup } from '../services/slotService.js';
import { serializeBooking } from './bookingController.js';
import { restock, serializeOrder } from './orderController.js';
import { serializeKundli } from './kundliController.js';
import { escapeRegex, sanitizeSlug } from '../utils/ids.js';
import { DATE_REGEX, TIME_REGEX, nowInIst } from '../utils/time.js';
import {
  BOOKING_STATUS,
  CONSULTATION_MODES,
  KUNDLI_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRODUCT_CATEGORIES,
  PUJA_MODES,
} from '../config/constants.js';

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 25));
  return { page, limit, skip: (page - 1) * limit };
};

const searchRegex = (value) =>
  typeof value === 'string' && value.trim() ? new RegExp(escapeRegex(value.trim().slice(0, 60)), 'i') : null;

const requireObjectId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError(`${label} not found`, 404);
};

export const AdminLoginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

export const adminLogin = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = (req.body.password || '').trim();

  let admin = await Admin.findOne({ email, isActive: true });
  // Also check if admin exists under the alias email (adminved7084 vs admin7084)
  if (!admin) {
    if (email === 'admin7084@gmail.com') {
      admin = await Admin.findOne({ email: 'adminved7084@gmail.com', isActive: true });
    } else if (email === 'adminved7084@gmail.com') {
      admin = await Admin.findOne({ email: 'admin7084@gmail.com', isActive: true });
    }
  }

  let ok = false;
  if (admin) {
    ok = await bcrypt.compare(password, admin.password);
  }

  if (!admin || !ok) throw new AppError('Invalid admin email or password', 401);
  res.json({ success: true, data: { token: signAdminToken(admin.email), email: admin.email, role: admin.role } });
});

export const adminMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { email: req.adminEmail || '' } });
});

export const getStats = asyncHandler(async (req, res) => {
  const today = nowInIst().date;
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00+05:30`);
  const todayStart = new Date(`${today}T00:00:00+05:30`);

  const sumPaid = async (model, field, since) => {
    const match = { paymentStatus: 'PAID' };
    if (since) match.paidAt = { $gte: since };
    const [row] = await model.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: `$${field}` } } }]);
    return row?.total || 0;
  };

  const [
    todaysBookings,
    pendingBookings,
    upcomingBookings,
    openOrders,
    openKundli,
    totalUsers,
    newUsersThisMonth,
    activeUsers,
    bookingRevenue,
    orderRevenue,
    kundliRevenue,
    bookingRevenueMonth,
    orderRevenueMonth,
    kundliRevenueMonth,
    bookingRevenueToday,
    orderRevenueToday,
    kundliRevenueToday,
    nextBookings,
    todaysSchedule,
    pendingKundlis,
    recentOrders,
    lowStock,
    totalPujas,
    totalProducts,
  ] = await Promise.all([
    Booking.countDocuments({ date: today, status: { $in: ['PENDING', 'CONFIRMED'] } }),
    Booking.countDocuments({ status: 'PENDING' }),
    Booking.countDocuments({ date: { $gte: today }, status: { $in: ['PENDING', 'CONFIRMED'] } }),
    Order.countDocuments({ status: { $in: ['PLACED', 'CONFIRMED'] } }),
    KundliRequest.countDocuments({ status: { $in: ['SUBMITTED', 'IN_REVIEW'] } }),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: monthStart } }),
    User.countDocuments({ profileCompleted: true, isBlocked: false }),
    sumPaid(Booking, 'amount'),
    sumPaid(Order, 'totalAmount'),
    sumPaid(KundliRequest, 'amount'),
    sumPaid(Booking, 'amount', monthStart),
    sumPaid(Order, 'totalAmount', monthStart),
    sumPaid(KundliRequest, 'amount', monthStart),
    sumPaid(Booking, 'amount', todayStart),
    sumPaid(Order, 'totalAmount', todayStart),
    sumPaid(KundliRequest, 'amount', todayStart),
    Booking.find({ date: { $gte: today }, status: { $in: ['PENDING', 'CONFIRMED'] } })
      .sort({ date: 1, startTime: 1 })
      .limit(6),
    Booking.find({ date: today, status: { $ne: 'CANCELLED' } })
      .sort({ startTime: 1 })
      .limit(10),
    KundliRequest.find({ status: { $in: ['SUBMITTED', 'IN_REVIEW'] } })
      .sort({ createdAt: -1 })
      .limit(5),
    Order.find({ status: { $in: ['PLACED', 'CONFIRMED'] } })
      .sort({ createdAt: -1 })
      .limit(5),
    Product.find({ isActive: true, stockQuantity: { $lte: 5 } }).select('name stockQuantity price').limit(10),
    Puja.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true }),
  ]);

  res.json({
    success: true,
    data: {
      today,
      todaysBookings,
      pendingBookings,
      upcomingBookings,
      openOrders,
      openKundli,
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      totalPujas,
      totalProducts,
      revenue: {
        total: bookingRevenue + orderRevenue + kundliRevenue,
        month: bookingRevenueMonth + orderRevenueMonth + kundliRevenueMonth,
        today: bookingRevenueToday + orderRevenueToday + kundliRevenueToday,
        bookings: bookingRevenue,
        orders: orderRevenue,
        kundli: kundliRevenue,
        bookingsMonth: bookingRevenueMonth,
        ordersMonth: orderRevenueMonth,
        kundliMonth: kundliRevenueMonth,
        bookingsToday: bookingRevenueToday,
        ordersToday: orderRevenueToday,
        kundliToday: kundliRevenueToday,
      },
      nextBookings: nextBookings.map(serializeBooking),
      todaysSchedule: todaysSchedule.map(serializeBooking),
      pendingKundlis: pendingKundlis.map(serializeKundli),
      recentOrders: recentOrders.map(serializeOrder),
      lowStock,
    },
  });
});

export const listBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (BOOKING_STATUS.includes(req.query.status)) filter.status = req.query.status;
  if (PAYMENT_STATUS.includes(req.query.paymentStatus)) filter.paymentStatus = req.query.paymentStatus;
  if (['PUJA', 'CONSULTATION'].includes(req.query.serviceType)) filter.serviceType = req.query.serviceType;
  if (DATE_REGEX.test(req.query.from || '')) filter.date = { ...(filter.date || {}), $gte: req.query.from };
  if (DATE_REGEX.test(req.query.to || '')) filter.date = { ...(filter.date || {}), $lte: req.query.to };
  const regex = searchRegex(req.query.search);
  if (regex) filter.$or = [{ bookingId: regex }, { devoteeName: regex }, { phone: regex }, { title: regex }];
  const sort = req.query.sort === 'created' ? { createdAt: -1 } : { date: req.query.from ? 1 : -1, startTime: 1 };
  const [items, total] = await Promise.all([
    Booking.find(filter).sort(sort).skip(skip).limit(limit).populate('user', 'name phone email'),
    Booking.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      items: items.map((b) => ({
        ...serializeBooking(b),
        meetingLink: b.meetingLink,
        user: b.user ? { id: b.user._id, name: b.user.name, phone: b.user.phone, email: b.user.email } : null,
      })),
      total,
      page,
      limit,
    },
  });
});

export const UpdateBookingSchema = z.object({
  status: z.enum(BOOKING_STATUS).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS).optional(),
  meetingLink: z.union([z.string().trim().url('Meeting link must be a valid URL'), z.literal('')]).optional(),
  panditNote: z.string().trim().max(1000).optional(),
  cancelReason: z.string().trim().max(300).optional(),
});

const findBooking = async (id) => {
  requireObjectId(id, 'Booking');
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
};

export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await findBooking(req.params.id);
  const { status, ...rest } = req.body;
  const wasActive = ['PENDING', 'CONFIRMED'].includes(booking.status);

  if (status && status !== booking.status) {
    const willBeActive = ['PENDING', 'CONFIRMED'].includes(status);
    if (wasActive && !willBeActive && status === 'CANCELLED') {
      await releaseSlot(booking._id);
      booking.cancelledBy = 'ADMIN';
      booking.cancelReason = rest.cancelReason || booking.cancelReason || 'Cancelled by Pandit Ji';
    }
    if (!wasActive && willBeActive) {
      await reserveSlot({ date: booking.date, startTime: booking.startTime, durationMinutes: booking.durationMinutes, bookingId: booking._id });
      booking.cancelledBy = '';
      booking.cancelReason = '';
    }
    booking.status = status;
  }
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) booking[key] = value;
  }
  if (rest.paymentStatus === 'PAID' && !booking.paidAt) booking.paidAt = new Date();
  await booking.save();
  res.json({ success: true, data: { ...serializeBooking(booking), meetingLink: booking.meetingLink } });
});

export const RescheduleSchema = z.object({
  date: z.string().regex(DATE_REGEX),
  startTime: z.string().regex(TIME_REGEX),
});

export const rescheduleBooking = asyncHandler(async (req, res) => {
  const booking = await findBooking(req.params.id);
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) throw new AppError('Only active bookings can be rescheduled', 400);
  const previous = { date: booking.date, startTime: booking.startTime };
  await releaseSlot(booking._id);
  let slot;
  try {
    slot = await reserveSlot({ ...req.body, durationMinutes: booking.durationMinutes, bookingId: booking._id });
  } catch (error) {
    await restoreSlot({ ...previous, durationMinutes: booking.durationMinutes, bookingId: booking._id });
    throw error;
  }
  booking.date = req.body.date;
  booking.startTime = slot.startTime;
  booking.endTime = slot.endTime;
  await booking.save();
  res.json({ success: true, data: serializeBooking(booking) });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (ORDER_STATUS.includes(req.query.status)) filter.status = req.query.status;
  if (PAYMENT_STATUS.includes(req.query.paymentStatus)) filter.paymentStatus = req.query.paymentStatus;
  const regex = searchRegex(req.query.search);
  if (regex) filter.$or = [{ orderId: regex }, { name: regex }, { phone: regex }, { 'items.name': regex }];
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items: items.map(serializeOrder), total, page, limit } });
});

export const UpdateOrderSchema = z.object({
  status: z.enum(ORDER_STATUS).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS).optional(),
  courierPartner: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  adminNote: z.string().trim().max(500).optional(),
  cancelReason: z.string().trim().max(300).optional(),
});

export const updateOrder = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Order');
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  const { status, ...rest } = req.body;
  if (status && status !== order.status) {
    if (order.status === 'CANCELLED') throw new AppError('Cancelled orders cannot be reopened', 400);
    if (status === 'CANCELLED') {
      await restock(order);
      order.cancelReason = rest.cancelReason || 'Cancelled by store';
    }
    order.status = status;
  }
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) order[key] = value;
  }
  if (rest.paymentStatus === 'PAID' && !order.paidAt) order.paidAt = new Date();
  if (order.status === 'DELIVERED' && order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING') {
    order.paymentStatus = 'PAID';
    order.paidAt = new Date();
  }
  await order.save();
  res.json({ success: true, data: serializeOrder(order) });
});

export const listKundli = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (KUNDLI_STATUS.includes(req.query.status)) filter.status = req.query.status;
  const regex = searchRegex(req.query.search);
  if (regex) filter.$or = [{ requestId: regex }, { 'primaryPerson.fullName': regex }, { contactPhone: regex }];
  const [items, total] = await Promise.all([
    KundliRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    KundliRequest.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items: items.map(serializeKundli), total, page, limit } });
});

export const UpdateKundliSchema = z.object({
  status: z.enum(KUNDLI_STATUS).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS).optional(),
  panditResponse: z.string().trim().max(10000).optional(),
  reportUrl: z.string().trim().optional(),
  reportName: z.string().trim().optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().trim(),
        name: z.string().trim().optional(),
        contentType: z.string().trim().optional(),
      })
    )
    .optional(),
});

export const updateKundli = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Request');
  const request = await KundliRequest.findById(req.params.id);
  if (!request) throw new AppError('Request not found', 404);
  Object.entries(req.body).forEach(([key, value]) => {
    if (value !== undefined) request[key] = value;
  });
  if (req.body.panditResponse) {
    request.respondedAt = new Date();
    if (!req.body.status && ['SUBMITTED', 'IN_REVIEW'].includes(request.status)) request.status = 'ANSWERED';
  }
  if (req.body.paymentStatus === 'PAID' && !request.paidAt) request.paidAt = new Date();
  await request.save();
  res.json({ success: true, data: serializeKundli(request) });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  const regex = searchRegex(req.query.search);
  if (regex) {
    filter.$or = [
      { name: regex },
      { phone: regex },
      { email: regex },
      { city: regex },
      { state: regex },
      { gotra: regex },
      { rashi: regex },
      { pinCode: regex },
    ];
  }

  const status = (req.query.status || '').toLowerCase();
  if (status === 'blocked') filter.isBlocked = true;
  else if (status === 'active') {
    filter.isBlocked = false;
    filter.profileCompleted = true;
  } else if (status === 'incomplete') {
    filter.isBlocked = false;
    filter.profileCompleted = false;
  }

  let sortOption = { createdAt: -1 };
  const sortParam = (req.query.sort || '').toLowerCase();
  if (sortParam === 'oldest') sortOption = { createdAt: 1 };
  else if (sortParam === 'name_asc') sortOption = { name: 1 };
  else if (sortParam === 'name_desc') sortOption = { name: -1 };
  else if (sortParam === 'recent_login') sortOption = { lastLoginAt: -1 };

  const [users, total, totalAll, totalActive, totalIncomplete, totalBlocked] = await Promise.all([
    User.find(filter).sort(sortOption).skip(skip).limit(limit),
    User.countDocuments(filter),
    User.countDocuments({}),
    User.countDocuments({ profileCompleted: true, isBlocked: false }),
    User.countDocuments({ profileCompleted: false, isBlocked: false }),
    User.countDocuments({ isBlocked: true }),
  ]);

  const ids = users.map((u) => u._id);

  const [bookingCounts, orderCounts, kundliCounts, bookingSpent, orderSpent, kundliSpent] = await Promise.all([
    Booking.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
    KundliRequest.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $match: { user: { $in: ids }, paymentStatus: 'PAID' } }, { $group: { _id: '$user', total: { $sum: '$amount' } } }]),
    Order.aggregate([{ $match: { user: { $in: ids }, paymentStatus: 'PAID' } }, { $group: { _id: '$user', total: { $sum: '$totalAmount' } } }]),
    KundliRequest.aggregate([{ $match: { user: { $in: ids }, paymentStatus: 'PAID' } }, { $group: { _id: '$user', total: { $sum: '$amount' } } }]),
  ]);

  const bookingCountMap = new Map(bookingCounts.map((c) => [c._id.toString(), c.count]));
  const orderCountMap = new Map(orderCounts.map((c) => [c._id.toString(), c.count]));
  const kundliCountMap = new Map(kundliCounts.map((c) => [c._id.toString(), c.count]));

  const spentMap = new Map();
  bookingSpent.forEach((b) => spentMap.set(b._id.toString(), (spentMap.get(b._id.toString()) || 0) + b.total));
  orderSpent.forEach((o) => spentMap.set(o._id.toString(), (spentMap.get(o._id.toString()) || 0) + o.total));
  kundliSpent.forEach((k) => spentMap.set(k._id.toString(), (spentMap.get(k._id.toString()) || 0) + k.total));

  res.json({
    success: true,
    data: {
      items: users.map((u) => {
        const idStr = u._id.toString();
        return {
          ...u.toPublic(),
          isBlocked: u.isBlocked,
          lastLoginAt: u.lastLoginAt,
          bookingsCount: bookingCountMap.get(idStr) || 0,
          ordersCount: orderCountMap.get(idStr) || 0,
          kundliCount: kundliCountMap.get(idStr) || 0,
          totalSpent: spentMap.get(idStr) || 0,
          familyCount: u.familyMembers?.length || 0,
        };
      }),
      summary: {
        total: totalAll,
        active: totalActive,
        incomplete: totalIncomplete,
        blocked: totalBlocked,
      },
      total,
      page,
      limit,
    },
  });
});

export const getUserDetail = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'User');
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  const [bookings, orders, kundli] = await Promise.all([
    Booking.find({ user: user._id }).sort({ createdAt: -1 }).limit(100),
    Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(100),
    KundliRequest.find({ user: user._id }).sort({ createdAt: -1 }).limit(100),
  ]);

  const totalSpent =
    bookings.filter((b) => b.paymentStatus === 'PAID').reduce((sum, b) => sum + (b.amount || 0), 0) +
    orders.filter((o) => o.paymentStatus === 'PAID').reduce((sum, o) => sum + (o.totalAmount || 0), 0) +
    kundli.filter((k) => k.paymentStatus === 'PAID').reduce((sum, k) => sum + (k.amount || 0), 0);

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
  const activeBookings = bookings.filter((b) => ['PENDING', 'CONFIRMED'].includes(b.status)).length;

  res.json({
    success: true,
    data: {
      user: {
        ...user.toPublic(),
        isBlocked: user.isBlocked,
        lastLoginAt: user.lastLoginAt,
      },
      stats: {
        totalSpent,
        bookingsCount: bookings.length,
        completedBookings,
        activeBookings,
        ordersCount: orders.length,
        kundliCount: kundli.length,
        familyCount: user.familyMembers?.length || 0,
      },
      bookings: bookings.map(serializeBooking),
      orders: orders.map(serializeOrder),
      kundli: kundli.map(serializeKundli),
    },
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'User');
  const { isBlocked } = z.object({ isBlocked: z.boolean() }).parse(req.body);
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: { ...user.toPublic(), isBlocked: user.isBlocked } });
});

const stringList = z.array(z.string().trim().min(1).max(300)).max(40).default([]);

const PackageInput = z.object({
  enabled: z.boolean().default(true),
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200).default(''),
  price: z.number().min(0).max(1000000),
  features: stringList,
});

export const PujaInputSchema = z
  .object({
    slug: z.string().trim().max(80).optional(),
    name: z.string().trim().min(2, 'Name is required').max(150),
    subtitle: z.string().trim().max(300).default(''),
    sanskritMantra: z.string().trim().max(300).default(''),
    category: z.string().trim().min(2, 'Category is required').max(60),
    deity: z.string().trim().max(80).default(''),
    durationMinutes: z.number().int().min(15).max(720),
    description: z.string().trim().max(3000).default(''),
    significance: z.string().trim().max(2000).default(''),
    items: stringList,
    suitableOccasions: stringList,
    occasionTags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(20).default([]),
    preparationSteps: stringList,
    whatIsIncluded: z
      .object({
        panditServices: z.string().trim().max(1000).default(''),
        guidance: z.string().trim().max(1000).default(''),
        samagriDetails: z.string().trim().max(1000).default(''),
        instructions: z.string().trim().max(1000).default(''),
      })
      .default({}),
    packages: z.object({ panditOnly: PackageInput, withSamagri: PackageInput }),
    modes: z.array(z.enum(PUJA_MODES)).min(1, 'Select at least one mode'),
    imageUrl: z.union([z.string().trim().url(), z.literal('')]).default(''),
    rating: z.number().min(0).max(5).default(5),
    reviewsCount: z.number().int().min(0).default(0),
    isPopular: z.boolean().default(false),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  })
  .refine((p) => p.packages.panditOnly.enabled || p.packages.withSamagri.enabled, {
    message: 'At least one package must be enabled',
    path: ['packages'],
  });

export const ProductInputSchema = z.object({
  slug: z.string().trim().max(80).optional(),
  name: z.string().trim().min(2, 'Name is required').max(150),
  tagline: z.string().trim().max(200).default(''),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().min(0).max(1000000),
  originalPrice: z.number().min(0).max(1000000).default(0),
  description: z.string().trim().max(3000).default(''),
  itemsIncluded: stringList,
  stockQuantity: z.number().int().min(0).max(100000),
  imageUrl: z.union([z.string().trim().url(), z.literal('')]).default(''),
  badge: z.string().trim().max(30).default(''),
  rating: z.number().min(0).max(5).default(5),
  reviewsCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const crud = (Model, label, activeRefCheck) => ({
  list: asyncHandler(async (req, res) => {
    const items = await Model.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: items });
  }),
  create: asyncHandler(async (req, res) => {
    const slug = sanitizeSlug(req.body.slug || req.body.name) || `${label.toLowerCase()}-${Date.now()}`;
    if (await Model.exists({ slug })) throw new AppError(`A ${label.toLowerCase()} with slug "${slug}" already exists`, 409);
    const item = await Model.create({ ...req.body, slug });
    res.status(201).json({ success: true, data: item });
  }),
  update: asyncHandler(async (req, res) => {
    requireObjectId(req.params.id, label);
    const item = await Model.findById(req.params.id);
    if (!item) throw new AppError(`${label} not found`, 404);
    const slug = sanitizeSlug(req.body.slug || item.slug);
    if (slug !== item.slug && (await Model.exists({ slug }))) throw new AppError(`Slug "${slug}" is already used`, 409);
    item.set({ ...req.body, slug });
    await item.save();
    res.json({ success: true, data: item });
  }),
  remove: asyncHandler(async (req, res) => {
    requireObjectId(req.params.id, label);
    const item = await Model.findById(req.params.id);
    if (!item) throw new AppError(`${label} not found`, 404);
    if (await activeRefCheck(item._id)) {
      item.isActive = false;
      await item.save();
      return res.json({ success: true, data: item, message: `${label} has history, so it was hidden instead of deleted` });
    }
    await item.deleteOne();
    res.json({ success: true, message: `${label} deleted` });
  }),
});

export const pujaCrud = crud(Puja, 'Puja', (id) => Booking.exists({ puja: id }));
export const productCrud = crud(Product, 'Product', (id) => Order.exists({ 'items.product': id }));

const DaySchema = z.object({
  day: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  start: z.string().regex(TIME_REGEX),
  end: z.string().regex(TIME_REGEX),
});

export const SettingsSchema = z
  .object({
    panditName: z.string().trim().min(2).max(100),
    panditTitle: z.string().trim().max(150),
    panditBio: z.string().trim().max(2000),
    experienceYears: z.number().int().min(0).max(100),
    templeAddress: z.string().trim().max(300),
    supportPhone: z.string().trim().max(20),
    whatsappNumber: z.string().trim().max(20),
    supportEmail: z.union([z.string().trim().email(), z.literal('')]),
    schedule: z.array(DaySchema).length(7),
    slotIntervalMinutes: z.union([z.literal(30), z.literal(60)]),
    bufferMinutes: z.number().int().min(0).max(240),
    bookingWindowDays: z.number().int().min(1).max(180),
    minLeadHours: z.number().int().min(0).max(168),
    blockedDates: z.array(z.string().regex(DATE_REGEX)).max(400),
    consultation: z.object({
      enabled: z.boolean(),
      title: z.string().trim().min(2).max(100),
      fee: z.number().min(0).max(100000),
      durationMinutes: z.number().int().min(15).max(240),
      modes: z.array(z.enum(CONSULTATION_MODES)).min(1),
    }),
    kundliFees: z.object({
      JANAM_KUNDLI: z.number().min(0),
      GUNA_MILAN: z.number().min(0),
      DOSHA_NIVARAN: z.number().min(0),
      GENERAL_QUERY: z.number().min(0),
    }),
    deliveryCharge: z.number().min(0).max(10000),
    freeDeliveryAbove: z.number().min(0).max(1000000),
    allowPayLater: z.boolean(),
    allowCod: z.boolean(),
    userCancelHours: z.number().int().min(0).max(168),
    home: z.object({
      announcement: z.object({ enabled: z.boolean(), text: z.string().trim().max(160) }),
      panchang: z.object({
        date: z.union([z.string().regex(DATE_REGEX), z.literal('')]),
        paksha: z.string().trim().max(60),
        tithi: z.string().trim().max(60),
        nakshatra: z.string().trim().max(60),
        yoga: z.string().trim().max(60),
        abhijitMuhurat: z.string().trim().max(60),
        rahuKaal: z.string().trim().max(60),
        sunrise: z.string().trim().max(20),
        sunset: z.string().trim().max(20),
        note: z.string().trim().max(200),
      }),
      sections: z.object({
        popularPujas: z.boolean(),
        kits: z.boolean(),
        kundli: z.boolean(),
        pandit: z.boolean(),
        japa: z.boolean(),
      }),
    }),
  })
  .partial()
  .refine((s) => !s.schedule || s.schedule.every((d) => !d.enabled || d.start < d.end), {
    message: 'Each working day must end after it starts',
    path: ['schedule'],
  });

export const getAdminSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getSettings() });
});

export const updateAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  if (req.body.schedule) req.body.schedule = [...req.body.schedule].sort((a, b) => a.day - b.day);
  if (req.body.blockedDates) req.body.blockedDates = [...new Set(req.body.blockedDates)].sort();
  settings.set(req.body);
  await settings.save();
  res.json({ success: true, data: settings });
});

export const getDaySchedule = asyncHandler(async (req, res) => {
  const date = String(req.query.date || '');
  if (!DATE_REGEX.test(date)) throw new AppError('date must be YYYY-MM-DD', 400);
  const settings = await getSettings();
  const requested = parseInt(req.query.duration, 10);
  const duration = requested >= 15 && requested <= 720 ? requested : settings.consultation.durationMinutes;
  const [bookings, holds, slots] = await Promise.all([
    Booking.find({ date, status: { $ne: 'CANCELLED' } }).sort({ startTime: 1 }),
    SlotHold.find({ date, booking: null }).sort({ block: 1 }).lean(),
    getAvailableSlots(date, duration),
  ]);
  const groups = new Map();
  for (const hold of holds) {
    const key = hold.blockGroup || hold._id.toString();
    if (!groups.has(key)) groups.set(key, { group: key, reason: hold.reason, blocks: [] });
    groups.get(key).blocks.push(hold.block);
  }
  res.json({
    success: true,
    data: {
      date,
      isBlockedDate: settings.blockedDates.includes(date),
      dayAvailability: slots.reason,
      bookings: bookings.map(serializeBooking),
      blocks: [...groups.values()],
      slots: slots.slots,
    },
  });
});

export const BlockSchema = z.object({
  date: z.string().regex(DATE_REGEX),
  startTime: z.string().regex(TIME_REGEX),
  endTime: z.string().regex(TIME_REGEX),
  reason: z.string().trim().max(200).default(''),
});

export const createBlock = asyncHandler(async (req, res) => {
  const group = `blk_${crypto.randomBytes(5).toString('hex')}`;
  const result = await blockTimeRange({ ...req.body, group });
  res.status(201).json({ success: true, data: { group, ...result } });
});

export const deleteBlock = asyncHandler(async (req, res) => {
  const result = await unblockGroup(req.params.group);
  if (!result.deletedCount) {
    if (mongoose.isValidObjectId(req.params.group)) {
      await SlotHold.deleteOne({ _id: req.params.group, booking: null });
    }
  }
  res.json({ success: true });
});

// ==========================================
// VEDIC AI INQUIRIES & CHAT SESSIONS
// ==========================================
export const listChatSessions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.category && req.query.category !== 'ALL') {
    filter.category = req.query.category;
  }
  const regex = searchRegex(req.query.search);
  if (regex) {
    filter.$or = [
      { userPhone: regex },
      { title: regex },
      { 'devoteeContext.name': regex },
      { 'devoteeContext.gotra': regex },
      { 'devoteeContext.rashi': regex },
    ];
  }

  const [items, total] = await Promise.all([
    ChatSession.find(filter).sort({ lastInteractionAt: -1 }).skip(skip).limit(limit),
    ChatSession.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      items: items.map((s) => ({
        id: s._id.toString(),
        sessionId: s.sessionId,
        userPhone: s.userPhone || '',
        title: s.title,
        category: s.category,
        devoteeContext: s.devoteeContext || {},
        messageCount: s.messageCount,
        lastInteractionAt: s.lastInteractionAt,
        createdAt: s.createdAt,
      })),
      total,
      page,
      limit,
    },
  });
});

export const getChatSessionDetail = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await ChatSession.findOne({ sessionId });
  if (!session) throw new AppError('Chat session not found', 404);

  const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });

  res.json({
    success: true,
    data: {
      session: {
        id: session._id.toString(),
        sessionId: session.sessionId,
        userPhone: session.userPhone || '',
        title: session.title,
        category: session.category,
        devoteeContext: session.devoteeContext || {},
        messageCount: session.messageCount,
        lastInteractionAt: session.lastInteractionAt,
      },
      messages: messages.map((m) => ({
        id: m._id.toString(),
        sender: m.sender,
        text: m.text,
        sanskritVerse: m.sanskritVerse || '',
        shastraReference: m.shastraReference || '',
        remedy: m.remedy || '',
        action: m.action || null,
        followUps: m.followUps || [],
        createdAt: m.createdAt,
      })),
    },
  });
});

// ==========================================
// ADMIN STAFF & SUB-ADMINS
// ==========================================
export const StaffInputSchema = z.object({
  name: z.string().trim().max(80).default(''),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).default(''),
  password: z.string().min(6).optional(),
  role: z.enum(['super_admin', 'admin', 'astrologer', 'store_manager']).default('admin'),
  isActive: z.boolean().default(true),
});

export const listStaff = asyncHandler(async (req, res) => {
  const staff = await Admin.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: staff });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, isActive } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  const existing = await Admin.findOne({ email: cleanEmail });
  if (existing) throw new AppError('An admin account with this email already exists', 409);
  if (!password || password.length < 6) throw new AppError('Password must be at least 6 characters', 400);

  const hashedPassword = await bcrypt.hash(password, 10);
  const created = await Admin.create({
    name,
    email: cleanEmail,
    phone,
    password: hashedPassword,
    role,
    isActive,
  });

  res.status(201).json({
    success: true,
    data: {
      id: created._id.toString(),
      name: created.name,
      email: created.email,
      phone: created.phone,
      role: created.role,
      isActive: created.isActive,
      createdAt: created.createdAt,
    },
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Staff');
  const staff = await Admin.findById(req.params.id);
  if (!staff) throw new AppError('Staff member not found', 404);

  const { name, phone, role, isActive, password } = req.body;
  if (name !== undefined) staff.name = name;
  if (phone !== undefined) staff.phone = phone;
  if (role !== undefined) staff.role = role;
  if (isActive !== undefined) staff.isActive = isActive;
  if (password && password.length >= 6) {
    staff.password = await bcrypt.hash(password, 10);
  }

  await staff.save();
  res.json({
    success: true,
    data: {
      id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      isActive: staff.isActive,
    },
  });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Staff');
  const staff = await Admin.findById(req.params.id);
  if (!staff) throw new AppError('Staff member not found', 404);
  if (staff.email === req.adminEmail) {
    throw new AppError('You cannot delete your own admin account', 400);
  }
  await Admin.deleteOne({ _id: staff._id });
  res.json({ success: true, message: 'Staff member removed' });
});

// ==========================================
// COUPONS & FESTIVAL DISCOUNTS
// ==========================================
export const CouponSchema = z.object({
  code: z.string().trim().min(2).max(20).toUpperCase(),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).default(''),
  discountType: z.enum(['PERCENTAGE', 'FLAT']).default('FLAT'),
  discountValue: z.number().min(1),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).default(0),
  applicableTo: z.enum(['ALL', 'PUJA', 'STORE', 'KUNDLI']).default('ALL'),
  validFrom: z.string().default(''),
  validTill: z.string().default(''),
  usageLimit: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const code = req.body.code.toUpperCase().trim();
  const existing = await Coupon.findOne({ code });
  if (existing) throw new AppError(`Coupon code "${code}" already exists`, 409);

  const coupon = await Coupon.create({ ...req.body, code });
  res.status(201).json({ success: true, data: coupon });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Coupon');
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json({ success: true, data: coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Coupon');
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

// ==========================================
// ANNOUNCEMENTS & FESTIVAL BROADCASTS
// ==========================================
export const AnnouncementSchema = z.object({
  title: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5).max(1000),
  category: z.enum(['FESTIVAL', 'PUJA_ALERT', 'MUHURAT', 'TEMPLE_NOTICE']).default('FESTIVAL'),
  priority: z.enum(['NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  actionType: z.enum(['PUJAS', 'STORE', 'KUNDLI', 'NONE']).default('NONE'),
  actionRef: z.string().default(''),
  actionLabel: z.string().default('View Details'),
  startsOn: z.string().default(''),
  endsOn: z.string().default(''),
  isActive: z.boolean().default(true),
});

export const listAnnouncements = asyncHandler(async (req, res) => {
  const list = await Announcement.find().sort({ createdAt: -1 });
  res.json({ success: true, data: list });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create(req.body);
  res.status(201).json({ success: true, data: announcement });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Announcement');
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!announcement) throw new AppError('Announcement not found', 404);
  res.json({ success: true, data: announcement });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'Announcement');
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Announcement deleted' });
});

