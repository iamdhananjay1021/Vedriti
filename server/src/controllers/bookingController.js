import { z } from 'zod';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Puja } from '../models/Puja.js';
import { getSettings } from '../models/Settings.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { reserveSlot, releaseSlot } from '../services/slotService.js';
import { attachPaymentLink, refreshFromGateway } from '../services/paymentService.js';
import { generateReference, normalizePhone } from '../utils/ids.js';
import { DATE_REGEX, TIME_REGEX, istDateTimeToEpoch } from '../utils/time.js';
import { CONSULTATION_MODES, ID_PREFIX, PUJA_MODES } from '../config/constants.js';

const MAX_UNPAID_ACTIVE = 5;
const VISIT_MODES = ['AT_HOME'];

export const CreateBookingSchema = z
  .object({
    serviceType: z.enum(['PUJA', 'CONSULTATION']),
    pujaId: z.string().optional(),
    packageType: z.enum(['PANDIT_ONLY', 'WITH_SAMAGRI']).optional(),
    mode: z.enum([...PUJA_MODES, ...CONSULTATION_MODES]),
    date: z.string().regex(DATE_REGEX, 'Please select a valid date'),
    startTime: z.string().regex(TIME_REGEX, 'Please select a valid slot'),
    devoteeName: z.string().trim().min(2, 'Devotee name is required').max(80),
    phone: z.string().trim().min(10).max(16),
    gotra: z.string().trim().max(60).optional().default(''),
    familyMembers: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
    sankalpNote: z.string().trim().max(1000).optional().default(''),
    address: z.string().trim().max(300).optional().default(''),
    city: z.string().trim().max(80).optional().default(''),
    pinCode: z.string().trim().optional().default(''),
    paymentMethod: z.enum(['ONLINE', 'PAY_LATER']),
  })
  .superRefine((v, ctx) => {
    if (v.serviceType === 'PUJA' && !v.pujaId) ctx.addIssue({ code: 'custom', path: ['pujaId'], message: 'Please select a puja' });
    if (v.serviceType === 'PUJA' && !v.packageType) ctx.addIssue({ code: 'custom', path: ['packageType'], message: 'Please select a package' });
    if (v.serviceType === 'PUJA' && !PUJA_MODES.includes(v.mode)) ctx.addIssue({ code: 'custom', path: ['mode'], message: 'Invalid puja mode' });
    if (v.serviceType === 'CONSULTATION' && !CONSULTATION_MODES.includes(v.mode)) ctx.addIssue({ code: 'custom', path: ['mode'], message: 'Invalid consultation mode' });
    if (VISIT_MODES.includes(v.mode)) {
      if (v.address.length < 5) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Full address is required for puja at home' });
      if (!/^[1-9]\d{5}$/.test(v.pinCode)) ctx.addIssue({ code: 'custom', path: ['pinCode'], message: 'Valid 6-digit PIN code is required' });
    }
  });

export const CancelSchema = z.object({ reason: z.string().trim().max(300).optional().default('') });

export const serializeBooking = (b) => ({
  id: b._id.toString(),
  bookingId: b.bookingId,
  serviceType: b.serviceType,
  pujaId: b.puja ? b.puja.toString() : null,
  title: b.title,
  packageType: b.packageType,
  packageName: b.packageName,
  mode: b.mode,
  date: b.date,
  startTime: b.startTime,
  endTime: b.endTime,
  durationMinutes: b.durationMinutes,
  devoteeName: b.devoteeName,
  phone: b.phone,
  gotra: b.gotra,
  familyMembers: b.familyMembers,
  sankalpNote: b.sankalpNote,
  address: b.address,
  city: b.city,
  pinCode: b.pinCode,
  amount: b.amount,
  paymentMethod: b.paymentMethod,
  paymentStatus: b.paymentStatus,
  paymentUrl: b.paymentStatus !== 'PAID' && b.status !== 'CANCELLED' ? b.paymentLinkUrl || null : null,
  status: b.status,
  meetingLink: b.status === 'CONFIRMED' ? b.meetingLink : '',
  panditNote: b.panditNote,
  cancelReason: b.cancelReason,
  cancelledBy: b.cancelledBy,
  createdAt: b.createdAt,
});

const findOwnBooking = async (req) => {
  const booking = await Booking.findOne({ bookingId: req.params.bookingId, user: req.userId });
  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
};

export const createBooking = asyncHandler(async (req, res) => {
  const body = req.body;
  const settings = await getSettings();
  const phone = normalizePhone(body.phone);
  if (!phone) throw new AppError('Please enter a valid 10-digit mobile number', 400);

  if (body.paymentMethod === 'PAY_LATER' && !settings.allowPayLater) {
    throw new AppError('Pay later is not available. Please pay online.', 400);
  }

  const unpaidActive = await Booking.countDocuments({
    user: req.userId,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    paymentStatus: { $ne: 'PAID' },
  });
  if (unpaidActive >= MAX_UNPAID_ACTIVE) {
    throw new AppError('You have too many unpaid bookings. Please pay or cancel an existing booking first.', 429);
  }

  let title;
  let amount;
  let durationMinutes;
  let packageName = '';
  let pujaRef;

  if (body.serviceType === 'PUJA') {
    if (!mongoose.isValidObjectId(body.pujaId)) throw new AppError('Puja not found', 404);
    const puja = await Puja.findOne({ _id: body.pujaId, isActive: true });
    if (!puja) throw new AppError('This puja is no longer available', 404);
    if (!puja.modes.includes(body.mode)) throw new AppError('This puja is not available in the selected mode', 400);
    const pkg = body.packageType === 'WITH_SAMAGRI' ? puja.packages.withSamagri : puja.packages.panditOnly;
    if (!pkg?.enabled) throw new AppError('Selected package is not available', 400);
    title = puja.name;
    amount = pkg.price;
    durationMinutes = puja.durationMinutes;
    packageName = pkg.name;
    pujaRef = puja._id;
  } else {
    if (!settings.consultation.enabled) throw new AppError('Consultations are currently unavailable', 400);
    if (!settings.consultation.modes.includes(body.mode)) throw new AppError('Selected consultation mode is unavailable', 400);
    title = settings.consultation.title;
    amount = settings.consultation.fee;
    durationMinutes = settings.consultation.durationMinutes;
  }

  const booking = new Booking({
    bookingId: generateReference(ID_PREFIX.BOOKING),
    user: req.userId,
    serviceType: body.serviceType,
    puja: pujaRef,
    title,
    packageType: body.serviceType === 'PUJA' ? body.packageType : '',
    packageName,
    mode: body.mode,
    date: body.date,
    startTime: body.startTime,
    endTime: body.startTime,
    durationMinutes,
    devoteeName: body.devoteeName,
    phone,
    gotra: body.gotra,
    familyMembers: [...new Set(body.familyMembers)],
    sankalpNote: body.sankalpNote,
    address: VISIT_MODES.includes(body.mode) || body.mode === 'IN_PERSON' ? body.address : '',
    city: body.city,
    pinCode: VISIT_MODES.includes(body.mode) ? body.pinCode : '',
    amount,
    paymentMethod: amount === 0 ? 'PAY_LATER' : body.paymentMethod,
    paymentStatus: amount === 0 ? 'PAID' : body.paymentMethod === 'PAY_LATER' ? 'PAY_LATER' : 'PENDING',
    status: 'PENDING',
  });

  const slot = await reserveSlot({ date: body.date, startTime: body.startTime, durationMinutes, bookingId: booking._id });
  booking.endTime = slot.endTime;

  try {
    await booking.save();
    if (booking.paymentMethod === 'ONLINE' && booking.paymentStatus === 'PENDING') {
      await attachPaymentLink('booking', booking, {
        amount,
        customer: { name: body.devoteeName, phone, email: req.user.email },
        description: `${title} - ${body.date} ${body.startTime}`,
      });
    }
  } catch (error) {
    await releaseSlot(booking._id);
    if (!booking.isNew) await Booking.deleteOne({ _id: booking._id });
    throw error;
  }

  res.status(201).json({ success: true, data: serializeBooking(booking) });
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.scope === 'upcoming') filter.status = { $in: ['PENDING', 'CONFIRMED'] };
  if (req.query.scope === 'past') filter.status = { $in: ['COMPLETED', 'CANCELLED'] };
  const bookings = await Booking.find(filter).sort({ date: -1, startTime: -1 }).limit(100);
  res.json({ success: true, data: bookings.map(serializeBooking) });
});

export const getMyBooking = asyncHandler(async (req, res) => {
  const booking = await refreshFromGateway(await findOwnBooking(req));
  res.json({ success: true, data: serializeBooking(booking) });
});

export const cancelMyBooking = asyncHandler(async (req, res) => {
  const booking = await findOwnBooking(req);
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw new AppError('This booking can no longer be cancelled', 400);
  }
  const settings = await getSettings();
  const hoursLeft = (istDateTimeToEpoch(booking.date, booking.startTime) - Date.now()) / 3600000;
  if (booking.paymentStatus === 'PAID' && hoursLeft < settings.userCancelHours) {
    throw new AppError(`Paid bookings can be cancelled only ${settings.userCancelHours} hours before the start time. Please contact Pandit Ji.`, 400);
  }
  booking.status = 'CANCELLED';
  booking.cancelledBy = 'USER';
  booking.cancelReason = req.body.reason || 'Cancelled by devotee';
  await booking.save();
  await releaseSlot(booking._id);
  res.json({ success: true, data: serializeBooking(booking) });
});
