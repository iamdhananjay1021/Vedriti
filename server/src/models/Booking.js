import mongoose from 'mongoose';
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_TYPES,
  PUJA_MODES,
  CONSULTATION_MODES,
  PACKAGE_TYPES,
} from '../config/constants.js';

const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    serviceType: { type: String, enum: SERVICE_TYPES, required: true },
    puja: { type: Schema.Types.ObjectId, ref: 'Puja' },
    title: { type: String, required: true },
    packageType: { type: String, enum: [...PACKAGE_TYPES, ''], default: '' },
    packageName: { type: String, default: '' },
    mode: { type: String, enum: [...PUJA_MODES, ...CONSULTATION_MODES], required: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    devoteeName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gotra: { type: String, trim: true, default: '' },
    familyMembers: { type: [String], default: [] },
    sankalpNote: { type: String, trim: true, maxlength: 1000, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    pinCode: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['ONLINE', 'PAY_LATER'], required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'PENDING', index: true },
    paymentLinkId: { type: String },
    paymentLinkUrl: { type: String },
    paymentExpiresAt: { type: Date, index: true },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },
    status: { type: String, enum: BOOKING_STATUS, default: 'PENDING', index: true },
    meetingLink: { type: String, trim: true, default: '' },
    panditNote: { type: String, trim: true, default: '' },
    cancelReason: { type: String, trim: true, default: '' },
    cancelledBy: { type: String, enum: ['USER', 'ADMIN', 'SYSTEM', ''], default: '' },
  },
  { timestamps: true }
);

BookingSchema.index({ createdAt: -1 });
BookingSchema.set('toJSON', { versionKey: false });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
