import mongoose from 'mongoose';

const { Schema } = mongoose;

const OtpSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    channel: { type: String, enum: ['sms', 'email'], required: true },
    purpose: { type: String, enum: ['login', 'reset'], required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
