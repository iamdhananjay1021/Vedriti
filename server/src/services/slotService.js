import { SlotHold } from '../models/SlotHold.js';
import { getSettings } from '../models/Settings.js';
import { AppError } from '../middlewares/errorHandler.js';
import { SLOT_BLOCK_MINUTES } from '../config/constants.js';
import {
  addDays,
  dayOfWeek,
  diffDays,
  formatLabel,
  fromMinutes,
  isValidDate,
  istDateTimeToEpoch,
  nowInIst,
  toMinutes,
} from '../utils/time.js';

const blocksFor = (startMinutes, totalMinutes) => {
  const first = Math.floor(startMinutes / SLOT_BLOCK_MINUTES) * SLOT_BLOCK_MINUTES;
  const end = startMinutes + totalMinutes;
  const blocks = [];
  for (let t = first; t < end && t < 24 * 60; t += SLOT_BLOCK_MINUTES) {
    blocks.push(fromMinutes(t));
  }
  return blocks;
};

export const getDayAvailabilityReason = (settings, date) => {
  if (!isValidDate(date)) return 'Invalid date';
  const today = nowInIst().date;
  const offset = diffDays(today, date);
  if (offset < 0) return 'Date is in the past';
  if (offset > settings.bookingWindowDays) return `Bookings open only ${settings.bookingWindowDays} days in advance`;
  if (settings.blockedDates.includes(date)) return 'Pandit Ji is not available on this date';
  const day = settings.schedule.find((s) => s.day === dayOfWeek(date));
  if (!day || !day.enabled) return 'Pandit Ji is not available on this day';
  return null;
};

export const getAvailableSlots = async (date, durationMinutes) => {
  const settings = await getSettings();
  const reason = getDayAvailabilityReason(settings, date);
  if (reason) return { date, available: false, reason, slots: [] };

  const day = settings.schedule.find((s) => s.day === dayOfWeek(date));
  const dayStart = toMinutes(day.start);
  const dayEnd = toMinutes(day.end);
  const holds = await SlotHold.find({ date }).select('block').lean();
  const taken = new Set(holds.map((h) => h.block));
  const earliestEpoch = Date.now() + settings.minLeadHours * 3600000;
  const footprint = durationMinutes + settings.bufferMinutes;

  const slots = [];
  for (let start = dayStart; start + durationMinutes <= dayEnd; start += settings.slotIntervalMinutes) {
    const startTime = fromMinutes(start);
    if (istDateTimeToEpoch(date, startTime) < earliestEpoch) continue;
    const free = blocksFor(start, footprint).every((b) => !taken.has(b));
    slots.push({
      startTime,
      endTime: fromMinutes(start + durationMinutes),
      label: `${formatLabel(startTime)} - ${formatLabel(fromMinutes(start + durationMinutes))}`,
      available: free,
    });
  }

  const anyFree = slots.some((s) => s.available);
  return {
    date,
    available: anyFree,
    reason: anyFree ? null : slots.length ? 'All slots are booked for this date' : 'No more slots left today',
    slots,
  };
};

export const getAvailabilityCalendar = async (durationMinutes, days) => {
  const settings = await getSettings();
  const today = nowInIst().date;
  const count = Math.min(days || settings.bookingWindowDays, settings.bookingWindowDays + 1);
  const results = [];
  for (let i = 0; i < count; i += 1) {
    const date = addDays(today, i);
    const result = await getAvailableSlots(date, durationMinutes);
    results.push({
      date,
      available: result.available,
      freeSlots: result.slots.filter((s) => s.available).length,
      reason: result.reason,
    });
  }
  return results;
};

export const reserveSlot = async ({ date, startTime, durationMinutes, bookingId }) => {
  const result = await getAvailableSlots(date, durationMinutes);
  if (!result.slots.length && result.reason) throw new AppError(result.reason, 409);
  const slot = result.slots.find((s) => s.startTime === startTime);
  if (!slot) throw new AppError('Selected time is not a valid slot for this date', 400);
  if (!slot.available) throw new AppError('This slot was just booked by someone else. Please choose another slot.', 409);

  const settings = await getSettings();
  const blocks = blocksFor(toMinutes(startTime), durationMinutes + settings.bufferMinutes);
  try {
    await SlotHold.insertMany(
      blocks.map((block) => ({ date, block, booking: bookingId })),
      { ordered: true }
    );
  } catch (error) {
    await SlotHold.deleteMany({ booking: bookingId });
    if (error.code === 11000) {
      throw new AppError('This slot was just booked by someone else. Please choose another slot.', 409);
    }
    throw error;
  }
  return slot;
};

export const releaseSlot = (bookingId) => SlotHold.deleteMany({ booking: bookingId });

export const restoreSlot = async ({ date, startTime, durationMinutes, bookingId }) => {
  const settings = await getSettings();
  const blocks = blocksFor(toMinutes(startTime), durationMinutes + settings.bufferMinutes);
  await SlotHold.insertMany(
    blocks.map((block) => ({ date, block, booking: bookingId })),
    { ordered: false }
  ).catch((error) => {
    if (error.code !== 11000) throw error;
  });
};

export const blockTimeRange = async ({ date, startTime, endTime, reason, group }) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end <= start) throw new AppError('End time must be after start time', 400);
  const blocks = blocksFor(start, end - start);
  const existing = await SlotHold.find({ date, block: { $in: blocks } }).select('block').lean();
  const existingSet = new Set(existing.map((e) => e.block));
  const fresh = blocks.filter((b) => !existingSet.has(b));
  if (fresh.length) {
    await SlotHold.insertMany(
      fresh.map((block) => ({ date, block, booking: null, blockGroup: group, reason })),
      { ordered: false }
    ).catch((error) => {
      if (error.code !== 11000) throw error;
    });
  }
  return { blocked: fresh.length, skipped: blocks.length - fresh.length };
};

export const unblockGroup = (group) => SlotHold.deleteMany({ blockGroup: group, booking: null });
