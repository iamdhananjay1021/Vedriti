import mongoose from 'mongoose';
import { z } from 'zod';
import { SamuhikPuja } from '../models/SamuhikPuja.js';
import { SamuhikBooking } from '../models/SamuhikBooking.js';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { generateReference } from '../utils/ids.js';

export const EnrollSchema = z.object({
  tierId: z.string().trim().min(1),
  sankalpWish: z.string().trim().max(300).optional().default(''),
  gotra: z.string().trim().max(60).optional(),
  rashi: z.string().trim().max(40).optional(),
  familyMembers: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        relation: z.string().trim().min(1),
      })
    )
    .optional()
    .default([]),
  paymentMethod: z.enum(['ONLINE', 'PAY_LATER']).default('ONLINE'),
});

export const SamuhikPujaInputSchema = z.object({
  slug: z.string().trim().min(3),
  title: z.string().trim().min(3),
  subtitle: z.string().trim().optional(),
  deity: z.string().trim().min(2),
  templeVenue: z.string().trim().min(3),
  eventDate: z.string().trim().min(10),
  muhuratTime: z.string().trim().min(3),
  imageUrl: z.string().trim().optional(),
  description: z.string().trim().optional(),
  benefits: z.array(z.string().trim()).optional().default([]),
  vidhiInclusions: z.array(z.string().trim()).optional().default([]),
  tiers: z.array(
    z.object({
      id: z.string().trim(),
      name: z.string().trim(),
      dakshina: z.number().int().min(1),
      maxFamilyMembers: z.number().int().min(1).default(1),
      prasadIncluded: z.boolean().default(false),
      description: z.string().optional().default(''),
    })
  ),
  maxDevotees: z.number().int().min(10).default(500),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  isFeatured: z.boolean().default(true),
});

// Devotee / Public APIs
export const listPublicSamuhikPujas = asyncHandler(async (req, res) => {
  const pujas = await SamuhikPuja.find({ status: { $in: ['UPCOMING', 'ACTIVE'] } }).sort({ eventDate: 1 });
  res.json({ success: true, data: pujas });
});

export const getPublicSamuhikPuja = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = mongoose.isValidObjectId(idOrSlug);
  const puja = await SamuhikPuja.findOne(isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug });
  if (!puja) throw new AppError('Samuhik festival puja not found', 404);
  res.json({ success: true, data: puja });
});

export const enrollInSamuhikPuja = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('Devotee account not found', 404);

  const puja = await SamuhikPuja.findById(id);
  if (!puja) throw new AppError('Samuhik festival puja not found', 404);
  if (puja.status !== 'ACTIVE' && puja.status !== 'UPCOMING') {
    throw new AppError('This festival puja is no longer accepting new sankalp bookings', 400);
  }

  const tier = puja.tiers.find((t) => t.id === req.body.tierId);
  if (!tier) throw new AppError('Invalid dakshina tier selected', 400);

  // Check if devotee has already enrolled
  const existing = await SamuhikBooking.findOne({ samuhikPujaId: puja._id, userId: user._id, status: { $ne: 'CANCELLED' } });
  if (existing) {
    throw new AppError('You have already enrolled your Sankalp in this Mahapuja!', 400);
  }

  const bookingId = generateReference('SP');
  const devoteeGotra = req.body.gotra || user.gotra || 'Kashyap (शिव गोत्र)';
  const devoteeRashi = req.body.rashi || user.rashi || '';

  const booking = await SamuhikBooking.create({
    bookingId,
    samuhikPujaId: puja._id,
    userId: user._id,
    devoteeName: user.name || 'Yajman Devotee',
    phone: user.phone || '',
    gotra: devoteeGotra,
    rashi: devoteeRashi,
    familyMembers: req.body.familyMembers || [],
    sankalpWish: req.body.sankalpWish || 'सुख, शांति, आरोग्य एवं समस्त मनोकामना पूर्ति हेतु',
    tierId: tier.id,
    tierName: tier.name,
    amount: tier.dakshina,
    paymentMethod: req.body.paymentMethod || 'ONLINE',
    paymentStatus: req.body.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
    status: 'CONFIRMED',
  });

  // Increment enrolled count
  puja.enrolledCount = (puja.enrolledCount || 0) + 1;
  await puja.save();

  res.status(201).json({
    success: true,
    data: {
      booking,
      pujaTitle: puja.title,
      templeVenue: puja.templeVenue,
      eventDate: puja.eventDate,
      message: `जय श्री राम! आपका ${puja.title} में ${tier.name} (₹${tier.dakshina}) का संकल्प सफलतापूर्वक दर्ज हो गया है।`,
    },
  });
});

export const listMySamuhikBookings = asyncHandler(async (req, res) => {
  const bookings = await SamuhikBooking.find({ userId: req.userId })
    .populate('samuhikPujaId', 'title subtitle deity templeVenue eventDate muhuratTime imageUrl status sankalpVideoUrl')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
});

// Admin APIs
export const adminListSamuhikPujas = asyncHandler(async (req, res) => {
  const pujas = await SamuhikPuja.find().sort({ eventDate: -1 });
  res.json({ success: true, data: pujas });
});

export const adminCreateSamuhikPuja = asyncHandler(async (req, res) => {
  const existing = await SamuhikPuja.findOne({ slug: req.body.slug });
  if (existing) throw new AppError('A puja with this URL slug already exists', 400);

  const puja = await SamuhikPuja.create(req.body);
  res.status(201).json({ success: true, data: puja });
});

export const adminUpdateSamuhikPuja = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const puja = await SamuhikPuja.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!puja) throw new AppError('Samuhik puja not found', 404);
  res.json({ success: true, data: puja });
});

export const adminGetSamuhikDevotees = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const puja = await SamuhikPuja.findById(id);
  if (!puja) throw new AppError('Samuhik puja not found', 404);

  const devotees = await SamuhikBooking.find({ samuhikPujaId: puja._id, status: { $ne: 'CANCELLED' } }).sort({ createdAt: 1 });

  res.json({
    success: true,
    data: {
      puja,
      totalDevotees: devotees.length,
      devotees,
    },
  });
});

export const adminUploadProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sankalpVideoUrl, sankalpPhotos, status } = req.body;
  const puja = await SamuhikPuja.findById(id);
  if (!puja) throw new AppError('Samuhik puja not found', 404);

  if (sankalpVideoUrl !== undefined) puja.sankalpVideoUrl = sankalpVideoUrl;
  if (sankalpPhotos !== undefined) puja.sankalpPhotos = sankalpPhotos;
  if (status) puja.status = status;

  await puja.save();
  res.json({ success: true, data: puja, message: 'Sankalp proof and photos uploaded successfully' });
});
