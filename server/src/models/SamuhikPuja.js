import mongoose from 'mongoose';

const { Schema } = mongoose;

const TierSchema = new Schema(
  {
    id: { type: String, required: true }, // 'SINGLE', 'COUPLE', 'FAMILY', 'MUKHYA'
    name: { type: String, required: true }, // e.g. 'Single Devotee Sankalp'
    dakshina: { type: Number, required: true }, // 101, 251, 501, 1100
    maxFamilyMembers: { type: Number, default: 1 },
    prasadIncluded: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const SamuhikPujaSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    deity: { type: String, required: true, trim: true }, // 'Lord Shiva', 'Lord Ganesha', etc.
    templeVenue: { type: String, required: true, trim: true }, // 'Kashi Vishwanath Mandir, Varanasi'
    eventDate: { type: String, required: true, trim: true }, // YYYY-MM-DD
    muhuratTime: { type: String, required: true, trim: true }, // e.g. '06:00 PM - 09:00 PM'
    imageUrl: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    benefits: { type: [String], default: [] },
    vidhiInclusions: { type: [String], default: [] },
    tiers: { type: [TierSchema], required: true },
    maxDevotees: { type: Number, default: 500 },
    enrolledCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    sankalpVideoUrl: { type: String, default: '' },
    sankalpPhotos: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SamuhikPuja = mongoose.models.SamuhikPuja || mongoose.model('SamuhikPuja', SamuhikPujaSchema);

