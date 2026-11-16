import mongoose from 'mongoose';

const { Schema } = mongoose;

export const BROADCAST_TYPES = ['ANNOUNCEMENT', 'OFFER', 'FESTIVAL', 'REMINDER', 'NOTICE'];
export const BROADCAST_CHANNELS = ['EMAIL', 'SMS', 'INAPP'];
export const BROADCAST_STATUSES = ['DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'CANCELLED'];
export const MARKETING_TYPES = ['ANNOUNCEMENT', 'OFFER', 'FESTIVAL'];

const TriState = { type: String, enum: ['any', 'yes', 'no'], default: 'any' };

const AudienceSchema = new Schema(
  {
    mode: { type: String, enum: ['ALL', 'SEGMENT', 'CUSTOM'], default: 'ALL' },
    cities: { type: [String], default: [] },
    states: { type: [String], default: [] },
    gender: { type: String, enum: ['any', 'MALE', 'FEMALE', 'OTHER'], default: 'any' },
    profileCompleted: TriState,
    hasBooking: TriState,
    hasOrder: TriState,
    joinedWithinDays: { type: Number, default: 0 },
    inactiveForDays: { type: Number, default: 0 },
    emails: { type: [String], default: [] },
    phones: { type: [String], default: [] },
  },
  { _id: false }
);

const BroadcastSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: BROADCAST_TYPES, default: 'ANNOUNCEMENT' },
    channels: { type: [{ type: String, enum: BROADCAST_CHANNELS }], default: ['EMAIL'] },
    subject: { type: String, trim: true, maxlength: 150, default: '' },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    smsText: { type: String, trim: true, maxlength: 320, default: '' },
    ctaLabel: { type: String, trim: true, maxlength: 40, default: '' },
    ctaUrl: { type: String, trim: true, maxlength: 400, default: '' },
    audience: { type: AudienceSchema, default: () => ({}) },
    status: { type: String, enum: BROADCAST_STATUSES, default: 'DRAFT', index: true },
    scheduledAt: { type: Date, default: null, index: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    pausedReason: { type: String, default: '' },
    recipientCount: { type: Number, default: 0 },
    createdBy: { type: String, default: '' },
  },
  { timestamps: true }
);

const BroadcastDeliverySchema = new Schema(
  {
    broadcast: { type: Schema.Types.ObjectId, ref: 'Broadcast', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    channel: { type: String, enum: BROADCAST_CHANNELS, required: true },
    to: { type: String, required: true },
    name: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'SENT', 'FAILED', 'SKIPPED'], default: 'PENDING', index: true },
    error: { type: String, default: '' },
    providerId: { type: String, default: '' },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);
BroadcastDeliverySchema.index({ broadcast: 1, channel: 1, to: 1 }, { unique: true });
BroadcastDeliverySchema.index({ channel: 1, status: 1, sentAt: -1 });

const BroadcastTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: BROADCAST_TYPES, default: 'ANNOUNCEMENT' },
    subject: { type: String, trim: true, maxlength: 150, default: '' },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    smsText: { type: String, trim: true, maxlength: 320, default: '' },
    ctaLabel: { type: String, trim: true, maxlength: 40, default: '' },
    ctaUrl: { type: String, trim: true, maxlength: 400, default: '' },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    broadcast: { type: Schema.Types.ObjectId, ref: 'Broadcast', default: null },
    type: { type: String, enum: BROADCAST_TYPES, default: 'ANNOUNCEMENT' },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    ctaLabel: { type: String, default: '' },
    ctaUrl: { type: String, default: '' },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ broadcast: 1, user: 1 }, { unique: true, partialFilterExpression: { broadcast: { $type: 'objectId' } } });

export const Broadcast = mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
export const BroadcastDelivery = mongoose.models.BroadcastDelivery || mongoose.model('BroadcastDelivery', BroadcastDeliverySchema);
export const BroadcastTemplate = mongoose.models.BroadcastTemplate || mongoose.model('BroadcastTemplate', BroadcastTemplateSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
