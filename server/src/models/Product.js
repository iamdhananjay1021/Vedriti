import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['rudraksha', 'yantra', 'samagri_kit', 'dhoop_fragrance', 'gangajal'],
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0 },
    rating: { type: Number, default: 4.9, min: 1, max: 5 },
    reviewCount: { type: Number, default: 108 },
    description: { type: String, required: true },
    shastraReference: { type: String },
    consecrationDetails: { type: String, required: true },
    inStock: { type: Boolean, default: true, index: true },
    stockQuantity: { type: Number, default: 50 },
    features: [{ type: String }],
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
