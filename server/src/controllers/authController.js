import { z } from 'zod';
import * as authService from '../services/authService.js';

export const RequestOtpSchema = z.object({
  phone: z.string().min(10, 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें'),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().min(10, 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें'),
  otp: z.string().min(4, 'कृपया 4 अंकों का वैदिक OTP कोड दर्ज करें'),
  name: z.string().optional(),
  gotra: z.string().optional(),
});

export const EmailSignupSchema = z.object({
  email: z.string().email('कृपया मान्य ईमेल पता दर्ज करें (Valid email required)'),
  password: z.string().min(6, 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'),
  name: z.string().optional(),
  gotra: z.string().optional(),
  phone: z.string().optional(),
});

export const EmailLoginSchema = z.object({
  email: z.string().email('कृपया मान्य ईमेल पता दर्ज करें'),
  password: z.string().min(1, 'पासवर्ड आवश्यक है'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  gotra: z.string().min(2).optional(),
  kuldevi: z.string().optional(),
  city: z.string().optional(),
});

export const FamilyMemberSchema = z.object({
  name: z.string().min(2, 'सदस्य का नाम आवश्यक है'),
  relation: z.string().min(2, 'संबंध आवश्यक है'),
  gotra: z.string().min(2, 'गोत्र आवश्यक है'),
  rashi: z.string().optional(),
  nakshatra: z.string().optional(),
});

/**
 * POST /api/v1/auth/request-otp
 */
export const handleRequestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.requestOtp(phone);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/verify-otp
 * Authenticates user via static OTP (1080) or active DB OTP
 */
export const handleVerifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, name, gotra } = req.body;
    const result = await authService.verifyOtp(phone, otp, name, gotra);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/signup-email
 * Direct email registration with password, gotra, name
 */
export const handleEmailSignup = async (req, res, next) => {
  try {
    const { email, password, name, gotra, phone } = req.body;
    const result = await authService.signupWithEmail(email, password, name, gotra, phone);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login-email
 * Direct email authentication with password
 */
export const handleEmailLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginWithEmail(email, password);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/profile
 */
export const handleGetProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.userId);
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        gotra: user.gotra,
        kuldevi: user.kuldevi,
        city: user.city,
        punyaPoints: user.punyaPoints,
        isVip: user.isVip,
        familyMembers: user.familyMembers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/auth/profile
 */
export const handleUpdateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateUserProfile(req.userId, req.body);
    res.status(200).json({
      success: true,
      message: 'प्रोफ़ाइल सफलतापूर्वक अद्यतन की गई (Profile updated)',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/family
 */
export const handleAddFamilyMember = async (req, res, next) => {
  try {
    const familyMembers = await authService.addFamilyMember(req.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'पारिवारिक संकल्प में नया सदस्य नामांकित किया गया (Family member added)',
      data: familyMembers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/auth/family/:id
 */
export const handleRemoveFamilyMember = async (req, res, next) => {
  try {
    const memberId = String(req.params.id);
    const familyMembers = await authService.removeFamilyMember(req.userId, memberId);
    res.status(200).json({
      success: true,
      message: 'सदस्य हटाया गया (Family member removed)',
      data: familyMembers,
    });
  } catch (error) {
    next(error);
  }
};
