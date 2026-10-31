import mongoose from 'mongoose';

export const BANNER_TARGETS = ['NONE', 'PUJAS', 'PUJA', 'STORE', 'KUNDLI', 'APPOINTMENT'];

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    subtitle: { type: String, trim: true, maxlength: 160, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    ctaLabel: { type: String, trim: true, maxlength: 30, default: '' },
    targetType: { type: String, enum: BANNER_TARGETS, default: 'NONE' },
    targetRef: { type: String, trim: true, default: '' },
    startsOn: { type: String, default: '' },
    endsOn: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BannerSchema.virtual('id').get(function id() {
  return this._id.toString();
});
BannerSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret._id; return ret; } });

export const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
