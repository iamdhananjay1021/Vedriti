import { z } from 'zod';
import mongoose from 'mongoose';
import { Media } from '../models/Media.js';
import { Banner, BANNER_TARGETS } from '../models/Banner.js';
import { getSettings } from '../models/Settings.js';
import { detectImageType, mediaUrl } from '../utils/media.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { DATE_REGEX, nowInIst } from '../utils/time.js';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export const uploadMedia = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!Buffer.isBuffer(body) || !body.length) throw new AppError('Send the image file as the request body (JPEG, PNG or WebP)', 400);
  if (body.length > MAX_IMAGE_BYTES) throw new AppError('Image is too large. Maximum size is 3 MB.', 413);
  const contentType = detectImageType(body);
  if (!contentType) throw new AppError('Only JPEG, PNG or WebP images are allowed', 415);
  const media = await Media.create({ data: body, contentType, size: body.length });
  res.status(201).json({ success: true, data: { id: media._id.toString(), url: mediaUrl(media._id) } });
});

export const serveMedia = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Image not found', 404);
  const media = await Media.findById(req.params.id).lean();
  if (!media) throw new AppError('Image not found', 404);
  res.set({
    'Content-Type': media.contentType,
    'Content-Length': String(media.size),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(media.data.buffer ? Buffer.from(media.data.buffer) : media.data);
});

const optionalDate = z.union([z.string().regex(DATE_REGEX), z.literal('')]).default('');

export const BannerSchema = z
  .object({
    title: z.string().trim().min(2, 'Title is required').max(80),
    subtitle: z.string().trim().max(160).default(''),
    imageUrl: z.union([z.string().trim().url(), z.literal('')]).default(''),
    ctaLabel: z.string().trim().max(30).default(''),
    targetType: z.enum(BANNER_TARGETS).default('NONE'),
    targetRef: z.string().trim().max(120).default(''),
    startsOn: optionalDate,
    endsOn: optionalDate,
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  })
  .refine((b) => b.targetType !== 'PUJA' || b.targetRef, { message: 'Select which puja to open', path: ['targetRef'] })
  .refine((b) => !b.startsOn || !b.endsOn || b.startsOn <= b.endsOn, { message: 'End date must be after start date', path: ['endsOn'] });

const requireId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Banner not found', 404);
};

export const listBanners = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Banner.find().sort({ sortOrder: 1, createdAt: -1 }) });
});

export const createBanner = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Banner.create(req.body) });
});

export const updateBanner = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new AppError('Banner not found', 404);
  banner.set(req.body);
  await banner.save();
  res.json({ success: true, data: banner });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  const result = await Banner.deleteOne({ _id: req.params.id });
  if (!result.deletedCount) throw new AppError('Banner not found', 404);
  res.json({ success: true });
});

export const getHome = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const today = nowInIst().date;
  const banners = await Banner.find({
    isActive: true,
    $and: [
      { $or: [{ startsOn: '' }, { startsOn: { $lte: today } }] },
      { $or: [{ endsOn: '' }, { endsOn: { $gte: today } }] },
    ],
  }).sort({ sortOrder: 1, createdAt: -1 });

  const home = settings.home;
  const panchang = home.panchang?.date === today && home.panchang.tithi ? home.panchang.toObject?.() ?? home.panchang : null;

  res.json({
    success: true,
    data: {
      banners,
      announcement: home.announcement?.enabled && home.announcement.text ? home.announcement.text : null,
      panchang,
      sections: home.sections?.toObject?.() ?? home.sections,
    },
  });
});
