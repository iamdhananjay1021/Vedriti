import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES } from '../config/constants.js';

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: '' },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true, default: '' },
    itemsIncluded: { type: [String], default: [] },
    stockQuantity: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, trim: true, default: '' },
    badge: { type: String, trim: true, default: '' },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.virtual('inStock').get(function inStock() {
  return this.stockQuantity > 0;
});

ProductSchema.set('toJSON', { virtuals: true, versionKey: false });

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
