import mongoose from 'mongoose';
import { KUNDLI_STATUS, KUNDLI_TYPES, PAYMENT_STATUS } from '../config/constants.js';

const { Schema } = mongoose;

const PersonSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'MALE' },
    dateOfBirth: { type: String, required: true },
    timeOfBirth: { type: String, default: '' },
    timeUnknown: { type: Boolean, default: false },
    placeOfBirth: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const KundliRequestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: KUNDLI_TYPES, required: true, index: true },
    primaryPerson: { type: PersonSchema, required: true },
    partnerPerson: { type: PersonSchema },
    questions: { type: String, trim: true, maxlength: 2000, default: '' },
    contactPhone: { type: String, trim: true, required: true },
    preferredLanguage: { type: String, enum: ['HINDI', 'ENGLISH'], default: 'HINDI' },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['ONLINE', 'PAY_LATER'], required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'PENDING', index: true },
    paymentLinkId: { type: String },
    paymentLinkUrl: { type: String },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },
    status: { type: String, enum: KUNDLI_STATUS, default: 'SUBMITTED', index: true },
    panditResponse: { type: String, trim: true, default: '' },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

KundliRequestSchema.index({ createdAt: -1 });
KundliRequestSchema.set('toJSON', { versionKey: false });

export const KundliRequest =
  mongoose.models.KundliRequest || mongoose.model('KundliRequest', KundliRequestSchema);
