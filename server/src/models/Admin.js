import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin', 'astrologer', 'store_manager'], default: 'admin' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const Admin = mongoose.model('Admin', AdminSchema);
