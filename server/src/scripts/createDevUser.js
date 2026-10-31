import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { config } from '../config/env.js';
import { ensureDevUser } from '../services/authService.js';

const run = async () => {
  const passwordSet = Boolean((process.env.DEV_USER_PASSWORD || '').trim()) && !/^<.*>$/.test(process.env.DEV_USER_PASSWORD.trim());
  if (config.isProduction && !passwordSet) {
    throw new Error('Set DEV_USER_PASSWORD in the environment before creating the developer user in production');
  }
  await connectDatabase();
  const user = await ensureDevUser();
  console.log('[Dev user] ready');
  console.log(`  email:    ${user.email}`);
  console.log(`  password: ${passwordSet ? '(DEV_USER_PASSWORD from .env)' : config.devUser.password}`);
  console.log(`  phone:    ${user.phone}`);
  console.log(
    config.staticOtp
      ? `  phone/email OTP: ${config.staticOtp} (STATIC_OTP)`
      : '  phone/email OTP: set STATIC_OTP to use a fixed code; in development the code is printed in the server log'
  );
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('[Dev user] failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
