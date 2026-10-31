import { z } from 'zod';
import * as authService from '../services/authService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { DATE_REGEX, TIME_REGEX } from '../utils/time.js';

const trimmed = (max) => z.string().trim().max(max);

export const RequestOtpSchema = z.object({ phone: z.string().min(10).max(16) });

export const VerifyOtpSchema = z.object({
  phone: z.string().min(10).max(16),
  otp: z.string().trim().regex(/^\d{4,6}$/, 'OTP must be 4-6 digits'),
});

const emailField = z.string().trim().email('Please enter a valid email').max(120);
const otpField = z.string().trim().regex(/^\d{4,6}$/, 'Code must be 4-6 digits');
const passwordField = z.string().min(8, 'Password must be at least 8 characters').max(64);

export const EmailOtpRequestSchema = z.object({ email: emailField });

export const EmailOtpVerifySchema = z.object({ email: emailField, otp: otpField, name: trimmed(80).optional() });

export const EmailSignupSchema = z.object({
  email: emailField,
  password: passwordField,
  name: trimmed(80).optional(),
  otp: otpField,
});

export const PasswordResetSchema = z.object({ email: emailField, otp: otpField, newPassword: passwordField });

export const EmailLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required').max(64),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().max(64).optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(64),
});

export const UpdateProfileSchema = z
  .object({
    name: trimmed(80).min(2, 'Name is too short'),
    phone: z.string().trim().max(16),
    email: z.union([z.string().trim().email('Please enter a valid email'), z.literal('')]),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dateOfBirth: z.string().regex(DATE_REGEX, 'Date of birth must be YYYY-MM-DD'),
    timeOfBirth: z.union([z.string().regex(TIME_REGEX, 'Time of birth must be HH:mm'), z.literal('')]),
    placeOfBirth: trimmed(120),
    gotra: trimmed(60),
    rashi: trimmed(40),
    address: trimmed(300).min(5, 'Please enter your full address'),
    city: trimmed(80).min(2, 'City is required'),
    state: trimmed(80).min(2, 'State is required'),
    pinCode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Please enter a valid 6-digit PIN code'),
  })
  .partial()
  .refine(
    (v) => !v.dateOfBirth || new Date(`${v.dateOfBirth}T00:00:00Z`).getTime() <= Date.now(),
    { message: 'Date of birth cannot be in the future', path: ['dateOfBirth'] }
  );

export const FamilyMemberSchema = z.object({
  name: trimmed(80).min(2, 'Name is required'),
  relation: trimmed(40).min(2, 'Relation is required'),
  gotra: trimmed(60).optional().default(''),
  dateOfBirth: z.union([z.string().regex(DATE_REGEX), z.literal('')]).optional().default(''),
  rashi: trimmed(40).optional().default(''),
  nakshatra: trimmed(40).optional().default(''),
});

export const handleRequestOtp = asyncHandler(async (req, res) => {
  const data = await authService.requestOtp(req.body.phone);
  res.json({ success: true, data });
});

export const handleVerifyOtp = asyncHandler(async (req, res) => {
  const data = await authService.verifyOtp(req.body.phone, req.body.otp);
  res.json({ success: true, data });
});

export const handleEmailSignup = asyncHandler(async (req, res) => {
  const data = await authService.signupWithEmail(req.body);
  res.status(201).json({ success: true, data });
});

export const handleEmailLogin = asyncHandler(async (req, res) => {
  const data = await authService.loginWithEmail(req.body);
  res.json({ success: true, data });
});

export const handleEmailOtpRequest = asyncHandler(async (req, res) => {
  const data = await authService.requestEmailOtp(req.body.email);
  res.json({ success: true, data });
});

export const handleEmailOtpVerify = asyncHandler(async (req, res) => {
  const data = await authService.verifyEmailOtp(req.body.email, req.body.otp, req.body.name);
  res.json({ success: true, data });
});

export const handleForgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.requestPasswordReset(req.body.email);
  res.json({ success: true, data });
});

export const handleResetPassword = asyncHandler(async (req, res) => {
  const data = await authService.resetPassword(req.body);
  res.json({ success: true, data });
});

export const handleSetAvatar = asyncHandler(async (req, res) => {
  const data = await authService.setAvatar(req.userId, req.body);
  res.json({ success: true, data });
});

export const handleRemoveAvatar = asyncHandler(async (req, res) => {
  const data = await authService.removeAvatar(req.userId);
  res.json({ success: true, data });
});

export const handleGetMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toPublic() });
});

export const handleUpdateMe = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.userId, req.body);
  res.json({ success: true, data });
});

export const handleChangePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.userId, req.body);
  res.json({ success: true, message: 'Password updated' });
});

export const handleDeleteMe = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.userId);
  res.json({ success: true, message: 'Your account has been deleted' });
});

export const handleAddFamilyMember = asyncHandler(async (req, res) => {
  const data = await authService.addFamilyMember(req.userId, req.body);
  res.status(201).json({ success: true, data });
});

export const handleUpdateFamilyMember = asyncHandler(async (req, res) => {
  const data = await authService.updateFamilyMember(req.userId, req.params.id, req.body);
  res.json({ success: true, data });
});

export const handleRemoveFamilyMember = asyncHandler(async (req, res) => {
  const data = await authService.removeFamilyMember(req.userId, req.params.id);
  res.json({ success: true, data });
});
