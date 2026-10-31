import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config, isResendConfigured } from '../config/env.js';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { Booking } from '../models/Booking.js';
import { AppError } from '../middlewares/errorHandler.js';
import { normalizePhone } from '../utils/ids.js';
import { isSmsEnabled, sendOtpSms } from './smsService.js';
import { sendOtpEmail } from './emailService.js';
import { Media } from '../models/Media.js';
import { detectImageType, mediaIdFromUrl, mediaUrl } from '../utils/media.js';
import { releaseSlot } from './slotService.js';
import { ACTIVE_BOOKING_STATUS } from '../config/constants.js';

const REQUIRED_PROFILE_FIELDS = ['name', 'phone', 'gender', 'dateOfBirth', 'address', 'city', 'state', 'pinCode'];
const BLOCKED_MESSAGE = 'This account has been blocked. Please contact support.';

export const signUserToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: 'user' }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

export const signAdminToken = () =>
  jwt.sign({ sub: 'admin', role: 'admin' }, config.jwtSecret, { expiresIn: '7d' });

const hashOtp = (key, code) => crypto.createHmac('sha256', config.jwtSecret).update(`${key}:${code}`).digest('hex');
const randomCode = () => String(crypto.randomInt(0, 10 ** config.otpLength)).padStart(config.otpLength, '0');
const hashPassword = (password) => bcrypt.hash(password, 10);

const requirePhone = (input) => {
  const phone = normalizePhone(input);
  if (!phone) throw new AppError('Please enter a valid 10-digit Indian mobile number', 400);
  return phone;
};

const cleanEmail = (email) => String(email || '').trim().toLowerCase();

const isProfileComplete = (user) => REQUIRED_PROFILE_FIELDS.every((f) => String(user[f] || '').trim().length > 0);

const authResult = async (user, isNewUser) => {
  user.lastLoginAt = new Date();
  await user.save();
  return { token: signUserToken(user), user: user.toPublic(), isNewUser };
};

const channelReady = (channel) => (channel === 'sms' ? isSmsEnabled() : isResendConfigured());

const isReviewer = (channel, target) =>
  channel === 'sms' ? config.reviewerPhones.includes(target.slice(-10)) : config.reviewerEmails.includes(target);

const pickCode = (channel, target) => {
  if (config.staticOtp && isReviewer(channel, target)) return { code: config.staticOtp, send: false };
  if (channelReady(channel)) return { code: randomCode(), send: true };
  if (channel === 'sms' && config.staticOtp) return { code: config.staticOtp, send: false };
  return { code: randomCode(), send: true };
};

const otpKey = (channel, target, purpose) => `${purpose}:${channel}:${target}`;

const issueOtp = async ({ channel, target, purpose }) => {
  const key = otpKey(channel, target, purpose);
  const existing = await Otp.findOne({ key });
  if (existing) {
    const waited = (Date.now() - existing.lastSentAt.getTime()) / 1000;
    if (waited < config.otpResendSeconds) {
      throw new AppError(`Please wait ${Math.ceil(config.otpResendSeconds - waited)} seconds before requesting a new code`, 429);
    }
  }

  const { code, send } = pickCode(channel, target);
  if (send) {
    if (channel === 'sms') await sendOtpSms(target, code);
    else await sendOtpEmail(target, code, purpose);
  }

  const now = new Date();
  await Otp.findOneAndUpdate(
    { key },
    {
      key,
      channel,
      purpose,
      codeHash: hashOtp(key, code),
      attempts: 0,
      lastSentAt: now,
      expiresAt: new Date(now.getTime() + config.otpExpiryMinutes * 60000),
    },
    { upsert: true }
  );

  return {
    resendInSeconds: config.otpResendSeconds,
    expiresInMinutes: config.otpExpiryMinutes,
    devOtp: !config.isProduction && send && !channelReady(channel) ? code : undefined,
  };
};

const consumeOtp = async ({ channel, target, purpose, code }) => {
  const key = otpKey(channel, target, purpose);
  const record = await Otp.findOne({ key });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new AppError('This code has expired. Please request a new one.', 400);
  }
  if (record.attempts >= config.otpMaxAttempts) {
    await Otp.deleteOne({ _id: record._id });
    throw new AppError('Too many wrong attempts. Please request a new code.', 429);
  }
  const expected = Buffer.from(record.codeHash, 'hex');
  const actual = Buffer.from(hashOtp(key, String(code || '').trim()), 'hex');
  if (!crypto.timingSafeEqual(expected, actual)) {
    record.attempts += 1;
    await record.save();
    const left = config.otpMaxAttempts - record.attempts;
    throw new AppError(left > 0 ? `Incorrect code. ${left} attempt(s) left.` : 'Too many wrong attempts. Please request a new code.', 400);
  }
  await Otp.deleteOne({ _id: record._id });
};

const findOrCreate = async (filter, data) => {
  let user = await User.findOne(filter);
  let isNewUser = false;
  if (!user) {
    try {
      user = await User.create(data);
      isNewUser = true;
    } catch (error) {
      if (error.code !== 11000) throw error;
      user = await User.findOne(filter);
    }
  }
  if (user.isBlocked) throw new AppError(BLOCKED_MESSAGE, 403);
  return { user, isNewUser };
};

export const requestOtp = async (rawPhone) => {
  const phone = requirePhone(rawPhone);
  const existingUser = await User.findOne({ phone }).select('isBlocked');
  if (existingUser?.isBlocked) throw new AppError(BLOCKED_MESSAGE, 403);
  const result = await issueOtp({ channel: 'sms', target: phone, purpose: 'login' });
  return { phone, isNewUser: !existingUser, ...result };
};

export const verifyOtp = async (rawPhone, code) => {
  const phone = requirePhone(rawPhone);
  await consumeOtp({ channel: 'sms', target: phone, purpose: 'login', code });
  const { user, isNewUser } = await findOrCreate({ phone }, { phone, authProvider: 'phone' });
  return authResult(user, isNewUser);
};

export const requestEmailOtp = async (rawEmail) => {
  const email = cleanEmail(rawEmail);
  const existingUser = await User.findOne({ email }).select('isBlocked');
  if (existingUser?.isBlocked) throw new AppError(BLOCKED_MESSAGE, 403);
  const result = await issueOtp({ channel: 'email', target: email, purpose: 'login' });
  return { email, isNewUser: !existingUser, ...result };
};

export const verifyEmailOtp = async (rawEmail, code, name) => {
  const email = cleanEmail(rawEmail);
  await consumeOtp({ channel: 'email', target: email, purpose: 'login', code });
  const { user, isNewUser } = await findOrCreate({ email }, { email, authProvider: 'email', name: name?.trim() || '' });
  if (!user.emailVerified) user.emailVerified = true;
  return authResult(user, isNewUser);
};

export const signupWithEmail = async ({ email: rawEmail, password, name, otp }) => {
  const email = cleanEmail(rawEmail);
  if (await User.exists({ email })) {
    throw new AppError('This email is already registered. Please login instead.', 409);
  }
  await consumeOtp({ channel: 'email', target: email, purpose: 'login', code: otp });
  const { user, isNewUser } = await findOrCreate(
    { email },
    { email, authProvider: 'email', name: name?.trim() || '', password: await hashPassword(password), emailVerified: true }
  );
  return authResult(user, isNewUser);
};

export const loginWithEmail = async ({ email, password }) => {
  const user = await User.findOne({ email: cleanEmail(email) }).select('+password');
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }
  if (user.isBlocked) throw new AppError(BLOCKED_MESSAGE, 403);
  return authResult(user, false);
};

export const requestPasswordReset = async (rawEmail) => {
  const email = cleanEmail(rawEmail);
  const user = await User.findOne({ email }).select('isBlocked');
  if (!user) throw new AppError('No account found with this email. Please sign up.', 404);
  if (user.isBlocked) throw new AppError(BLOCKED_MESSAGE, 403);
  const result = await issueOtp({ channel: 'email', target: email, purpose: 'reset' });
  return { email, ...result };
};

export const resetPassword = async ({ email: rawEmail, otp, newPassword }) => {
  const email = cleanEmail(rawEmail);
  await consumeOtp({ channel: 'email', target: email, purpose: 'reset', code: otp });
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Account not found', 404);
  if (user.isBlocked) throw new AppError(BLOCKED_MESSAGE, 403);
  user.password = await hashPassword(newPassword);
  user.emailVerified = true;
  return authResult(user, false);
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('Account not found', 404);
  if (user.password && !(await bcrypt.compare(currentPassword || '', user.password))) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.password = await hashPassword(newPassword);
  await user.save();
};

export const ensureDevUser = async () => {
  const { name, phone: local, email, password } = config.devUser;
  const phone = normalizePhone(local);
  let user = await User.findOne({ $or: [{ email }, { phone }] });
  if (!user) user = new User({ authProvider: 'email' });
  user.set({
    email,
    phone,
    name: user.name || name,
    password: await hashPassword(password),
    emailVerified: true,
    gender: user.gender || 'MALE',
    dateOfBirth: user.dateOfBirth || '1990-01-01',
    timeOfBirth: user.timeOfBirth || '06:00',
    placeOfBirth: user.placeOfBirth || 'Varanasi, Uttar Pradesh',
    gotra: user.gotra || 'Kashyap',
    address: user.address || 'VedRit Test Address, Assi Ghat',
    city: user.city || 'Varanasi',
    state: user.state || 'Uttar Pradesh',
    pinCode: user.pinCode || '221005',
    isBlocked: false,
  });
  user.profileCompleted = isProfileComplete(user);
  await user.save();
  return user;
};

export const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404);

  if (updates.phone !== undefined) {
    const phone = updates.phone ? requirePhone(updates.phone) : '';
    if (user.authProvider === 'phone' && phone !== user.phone) {
      throw new AppError('Login mobile number cannot be changed', 400);
    }
    if (phone && phone !== user.phone && (await User.exists({ phone, _id: { $ne: user._id } }))) {
      throw new AppError('This mobile number is already linked to another account', 409);
    }
    user.phone = phone || undefined;
    delete updates.phone;
  }

  if (updates.email !== undefined) {
    const email = updates.email.trim().toLowerCase();
    if (user.authProvider === 'email' && email !== user.email) {
      throw new AppError('Login email cannot be changed', 400);
    }
    if (email && email !== user.email && (await User.exists({ email, _id: { $ne: user._id } }))) {
      throw new AppError('This email is already linked to another account', 409);
    }
    if (email !== user.email) user.emailVerified = false;
    user.email = email || undefined;
    delete updates.email;
  }

  Object.assign(user, updates);
  user.profileCompleted = isProfileComplete(user);
  await user.save();
  return user.toPublic();
};

export const addFamilyMember = async (userId, member) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404);
  if (user.familyMembers.length >= 20) throw new AppError('You can save up to 20 family members', 400);
  user.familyMembers.push(member);
  await user.save();
  return user.toPublic();
};

export const updateFamilyMember = async (userId, memberId, member) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404);
  const existing = user.familyMembers.id(memberId);
  if (!existing) throw new AppError('Family member not found', 404);
  Object.assign(existing, member);
  await user.save();
  return user.toPublic();
};

export const removeFamilyMember = async (userId, memberId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404);
  const existing = user.familyMembers.id(memberId);
  if (!existing) throw new AppError('Family member not found', 404);
  existing.deleteOne();
  await user.save();
  return user.toPublic();
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const dropAvatarMedia = async (url) => {
  const id = mediaIdFromUrl(url);
  if (id) await Media.deleteOne({ _id: id });
};

export const setAvatar = async (userId, buffer) => {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new AppError('Please choose a photo to upload', 400);
  if (buffer.length > MAX_AVATAR_BYTES) throw new AppError('Photo is too large. Maximum size is 2 MB.', 413);
  const contentType = detectImageType(buffer);
  if (!contentType) throw new AppError('Only JPEG, PNG or WebP photos are allowed', 415);
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404);
  const media = await Media.create({ data: buffer, contentType, size: buffer.length });
  const previous = user.avatarUrl;
  user.avatarUrl = mediaUrl(media._id);
  await user.save();
  await dropAvatarMedia(previous);
  return user.toPublic();
};

export const removeAvatar = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404);
  const previous = user.avatarUrl;
  user.avatarUrl = '';
  await user.save();
  await dropAvatarMedia(previous);
  return user.toPublic();
};

export const deleteAccount = async (userId) => {
  const active = await Booking.find({ user: userId, status: { $in: ACTIVE_BOOKING_STATUS } });
  for (const booking of active) {
    booking.status = 'CANCELLED';
    booking.cancelledBy = 'USER';
    booking.cancelReason = 'Account deleted by user';
    await booking.save();
    await releaseSlot(booking._id);
  }
  const user = await User.findById(userId).select('avatarUrl');
  await dropAvatarMedia(user?.avatarUrl);
  await User.deleteOne({ _id: userId });
};
