import mongoose from 'mongoose';
import { CONSULTATION_MODES } from '../config/constants.js';

const { Schema } = mongoose;

const DayScheduleSchema = new Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true },
    enabled: { type: Boolean, default: true },
    start: { type: String, default: '06:00' },
    end: { type: String, default: '20:00' },
  },
  { _id: false }
);

const defaultSchedule = [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: true, start: '06:00', end: '20:00' }));

const SettingsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    panditName: { type: String, default: 'Pandit Ji' },
    panditTitle: { type: String, default: 'Vedic Acharya' },
    panditBio: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    templeAddress: { type: String, default: '' },
    supportPhone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    supportEmail: { type: String, default: 'support@vedrit.in' },
    schedule: { type: [DayScheduleSchema], default: defaultSchedule },
    slotIntervalMinutes: { type: Number, default: 30, enum: [30, 60] },
    bufferMinutes: { type: Number, default: 30, min: 0, max: 240 },
    bookingWindowDays: { type: Number, default: 30, min: 1, max: 180 },
    minLeadHours: { type: Number, default: 4, min: 0, max: 168 },
    blockedDates: { type: [String], default: [] },
    consultation: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Pandit Ji Consultation' },
      fee: { type: Number, default: 501, min: 0 },
      durationMinutes: { type: Number, default: 30, min: 15, max: 240 },
      modes: { type: [{ type: String, enum: CONSULTATION_MODES }], default: ['AUDIO_CALL', 'VIDEO_CALL', 'IN_PERSON'] },
    },
    kundliFees: {
      JANAM_KUNDLI: { type: Number, default: 1100, min: 0 },
      GUNA_MILAN: { type: Number, default: 1500, min: 0 },
      DOSHA_NIVARAN: { type: Number, default: 1100, min: 0 },
      GENERAL_QUERY: { type: Number, default: 501, min: 0 },
    },
    home: {
      announcement: {
        enabled: { type: Boolean, default: false },
        text: { type: String, trim: true, maxlength: 160, default: '' },
      },
      panchang: {
        date: { type: String, default: '' },
        paksha: { type: String, trim: true, default: '' },
        tithi: { type: String, trim: true, default: '' },
        nakshatra: { type: String, trim: true, default: '' },
        yoga: { type: String, trim: true, default: '' },
        abhijitMuhurat: { type: String, trim: true, default: '' },
        rahuKaal: { type: String, trim: true, default: '' },
        sunrise: { type: String, trim: true, default: '' },
        sunset: { type: String, trim: true, default: '' },
        note: { type: String, trim: true, maxlength: 200, default: '' },
      },
      sections: {
        popularPujas: { type: Boolean, default: true },
        kits: { type: Boolean, default: true },
        kundli: { type: Boolean, default: true },
        pandit: { type: Boolean, default: true },
        japa: { type: Boolean, default: true },
      },
    },
    deliveryCharge: { type: Number, default: 79, min: 0 },
    freeDeliveryAbove: { type: Number, default: 999, min: 0 },
    allowPayLater: { type: Boolean, default: true },
    allowCod: { type: Boolean, default: true },
    userCancelHours: { type: Number, default: 24, min: 0 },
  },
  { timestamps: true }
);

SettingsSchema.set('toJSON', { versionKey: false });

export const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export const getSettings = async () => {
  const existing = await Settings.findOne({ key: 'main' });
  if (existing) return existing;
  try {
    return await Settings.create({ key: 'main' });
  } catch (error) {
    if (error.code === 11000) return Settings.findOne({ key: 'main' });
    throw error;
  }
};
