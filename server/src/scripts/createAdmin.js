import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

const run = async () => {
  const email = String(process.argv[2] || process.env.NEW_ADMIN_EMAIL || 'adminved7084@gmail.com').trim().toLowerCase();
  const password = String(process.argv[3] || process.env.NEW_ADMIN_PASSWORD || 'admin8485@#');
  const role = process.argv[4] === 'admin' ? 'admin' : 'super_admin';
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Usage: npm run admin:create -- <email> <password> [super]');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
  await connectDatabase();
  const hash = await bcrypt.hash(password, 10);
  const admin = await Admin.findOneAndUpdate({ email }, { email, password: hash, role, isActive: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log(`[Admin] ready: ${admin.email} (${admin.role})`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('[Admin] failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
