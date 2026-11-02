import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

const run = async () => {
  const email = String(process.argv[2] || process.env.NEW_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.argv[3] || process.env.NEW_ADMIN_PASSWORD || '');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Usage: npm run admin:create -- <email> <password>');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
  await connectDatabase();
  const hash = await bcrypt.hash(password, 10);
  const admin = await Admin.findOneAndUpdate({ email }, { email, password: hash, isActive: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log(`[Admin] ready: ${admin.email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('[Admin] failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
