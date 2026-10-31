import { z } from 'zod';
import { Puja } from '../models/Puja.js';
import { getSettings } from '../models/Settings.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { getAvailabilityCalendar, getAvailableSlots } from '../services/slotService.js';
import { DATE_REGEX } from '../utils/time.js';

export const SlotQuerySchema = z.object({
  date: z.string().regex(DATE_REGEX, 'date must be YYYY-MM-DD').optional(),
  serviceType: z.enum(['PUJA', 'CONSULTATION']).default('PUJA'),
  pujaId: z.string().optional(),
  days: z.coerce.number().int().min(1).max(180).optional(),
});

const resolveDuration = async ({ serviceType, pujaId }) => {
  if (serviceType === 'CONSULTATION') {
    const settings = await getSettings();
    return settings.consultation.durationMinutes;
  }
  if (!pujaId) throw new AppError('pujaId is required', 400);
  const puja = await Puja.findOne({ _id: pujaId, isActive: true }).select('durationMinutes');
  if (!puja) throw new AppError('Puja not found', 404);
  return puja.durationMinutes;
};

export const getSlots = asyncHandler(async (req, res) => {
  const query = req.validatedQuery;
  if (!query.date) throw new AppError('date is required', 400);
  const duration = await resolveDuration(query);
  const data = await getAvailableSlots(query.date, duration);
  res.json({ success: true, data: { ...data, durationMinutes: duration } });
});

export const getCalendar = asyncHandler(async (req, res) => {
  const query = req.validatedQuery;
  const duration = await resolveDuration(query);
  const data = await getAvailabilityCalendar(duration, query.days);
  res.json({ success: true, data });
});
