import mongoose from 'mongoose';
import { PUJA_MODES } from '../config/constants.js';

const { Schema } = mongoose;

const PackageSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    features: { type: [String], default: [] },
  },
  { _id: false }
);

const PujaSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    sanskritMantra: { type: String, trim: true, default: '' },
    category: { type: String, required: true, trim: true, index: true },
    deity: { type: String, trim: true, default: '' },
    durationMinutes: { type: Number, required: true, min: 15, max: 720 },
    description: { type: String, trim: true, default: '' },
    significance: { type: String, trim: true, default: '' },
    items: { type: [String], default: [] },
    suitableOccasions: { type: [String], default: [] },
    occasionTags: { type: [String], default: [], index: true },
    preparationSteps: { type: [String], default: [] },
    whatIsIncluded: {
      panditServices: { type: String, default: '' },
      guidance: { type: String, default: '' },
      samagriDetails: { type: String, default: '' },
      instructions: { type: String, default: '' },
    },
    packages: {
      panditOnly: { type: PackageSchema, required: true },
      withSamagri: { type: PackageSchema, required: true },
    },
    modes: { type: [{ type: String, enum: PUJA_MODES }], default: ['ONLINE', 'AT_HOME'] },
    imageUrl: { type: String, trim: true, default: '' },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    isPopular: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PujaSchema.virtual('startingPrice').get(function startingPrice() {
  const prices = [this.packages?.panditOnly, this.packages?.withSamagri]
    .filter((p) => p && p.enabled)
    .map((p) => p.price);
  return prices.length ? Math.min(...prices) : 0;
});

PujaSchema.set('toJSON', { virtuals: true, versionKey: false });

export const Puja = mongoose.models.Puja || mongoose.model('Puja', PujaSchema);
