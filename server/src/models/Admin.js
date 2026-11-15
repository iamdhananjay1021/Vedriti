import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Admin = mongoose.model('Admin', AdminSchema);
