import mongoose from 'mongoose';

const { Schema } = mongoose;

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FLAT'],
      default: 'FLAT',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0, // 0 = no limit for percentage
    },
    applicableTo: {
      type: String,
      enum: ['ALL', 'PUJA', 'STORE', 'KUNDLI'],
      default: 'ALL',
    },
    validFrom: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    validTill: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

