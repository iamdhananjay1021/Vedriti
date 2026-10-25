import mongoose from 'mongoose';

const { Schema } = mongoose;

const PujaPackageSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    priestCount: { type: Number, default: 1 },
    duration: { type: String, required: true },
    includedItems: [{ type: String }],
  },
  { _id: false }
);

const PujaSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sanskritName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    deity: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    occasionTags: [{ type: String, index: true }],
    kshetra: { type: String, required: true, default: 'Kashi Vishwanath (Varanasi)' },
    description: { type: String, required: true },
    sanskritSnippet: { type: String, required: true },
    mantraAudioUrl: { type: String },
    duration: { type: String, required: true },
    startingPrice: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 4.9, min: 1, max: 5 },
    reviewsCount: { type: Number, default: 108 },
    packages: { type: [PujaPackageSchema], default: [] },
    isPopular: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Puja = mongoose.models.Puja || mongoose.model('Puja', PujaSchema);
