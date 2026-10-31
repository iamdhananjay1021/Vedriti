import mongoose from 'mongoose';
import { Puja } from '../models/Puja.js';
import { Product } from '../models/Product.js';
import { getSettings } from '../models/Settings.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { escapeRegex } from '../utils/ids.js';

const searchFilter = (search, fields) => {
  if (typeof search !== 'string' || !search.trim()) return null;
  const regex = new RegExp(escapeRegex(search.trim().slice(0, 60)), 'i');
  return fields.map((f) => ({ [f]: regex }));
};

const findByIdOrSlug = (model, value, extra = {}) => {
  const filter = mongoose.isValidObjectId(value) ? { _id: value } : { slug: String(value).toLowerCase() };
  return model.findOne({ ...filter, ...extra });
};

export const listPujas = asyncHandler(async (req, res) => {
  const { category, occasion, search, popular } = req.query;
  const filter = { isActive: true };
  if (typeof category === 'string' && category && category !== 'all') filter.category = category;
  if (typeof occasion === 'string' && occasion && occasion !== 'all') filter.occasionTags = occasion.toLowerCase();
  if (popular === 'true') filter.isPopular = true;
  const or = searchFilter(search, ['name', 'subtitle', 'deity', 'category', 'description']);
  if (or) filter.$or = or;
  const pujas = await Puja.find(filter).sort({ sortOrder: 1, isPopular: -1, createdAt: -1 });
  res.json({ success: true, data: pujas });
});

export const getPuja = asyncHandler(async (req, res) => {
  const puja = await findByIdOrSlug(Puja, req.params.idOrSlug, { isActive: true });
  if (!puja) throw new AppError('Puja not found', 404);
  res.json({ success: true, data: puja });
});

export const listPujaCategories = asyncHandler(async (req, res) => {
  const categories = await Puja.distinct('category', { isActive: true });
  res.json({ success: true, data: categories.sort() });
});

export const listProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = { isActive: true };
  if (typeof category === 'string' && category && category !== 'all') filter.category = category.toUpperCase();
  const or = searchFilter(search, ['name', 'tagline', 'description']);
  if (or) filter.$or = or;
  const products = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, data: products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await findByIdOrSlug(Product, req.params.idOrSlug, { isActive: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

export const getPublicSettings = asyncHandler(async (req, res) => {
  const s = await getSettings();
  res.json({
    success: true,
    data: {
      panditName: s.panditName,
      panditTitle: s.panditTitle,
      panditBio: s.panditBio,
      experienceYears: s.experienceYears,
      templeAddress: s.templeAddress,
      supportPhone: s.supportPhone,
      whatsappNumber: s.whatsappNumber,
      supportEmail: s.supportEmail,
      consultation: s.consultation,
      kundliFees: s.kundliFees,
      deliveryCharge: s.deliveryCharge,
      freeDeliveryAbove: s.freeDeliveryAbove,
      allowPayLater: s.allowPayLater,
      allowCod: s.allowCod,
      userCancelHours: s.userCancelHours,
      bookingWindowDays: s.bookingWindowDays,
    },
  });
});
