import express, { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.post('/request-otp', authLimiter, validateBody(auth.RequestOtpSchema), auth.handleRequestOtp);
router.post('/verify-otp', authLimiter, validateBody(auth.VerifyOtpSchema), auth.handleVerifyOtp);
router.post('/signup-email', authLimiter, validateBody(auth.EmailSignupSchema), auth.handleEmailSignup);
router.post('/login-email', authLimiter, validateBody(auth.EmailLoginSchema), auth.handleEmailLogin);
router.post('/email/request-otp', authLimiter, validateBody(auth.EmailOtpRequestSchema), auth.handleEmailOtpRequest);
router.post('/email/verify-otp', authLimiter, validateBody(auth.EmailOtpVerifySchema), auth.handleEmailOtpVerify);
router.post('/password/forgot', authLimiter, validateBody(auth.EmailOtpRequestSchema), auth.handleForgotPassword);
router.post('/password/reset', authLimiter, validateBody(auth.PasswordResetSchema), auth.handleResetPassword);

router.get('/me', requireAuth, auth.handleGetMe);
router.patch('/me', requireAuth, validateBody(auth.UpdateProfileSchema), auth.handleUpdateMe);
router.delete('/me', requireAuth, auth.handleDeleteMe);
router.post('/me/avatar', requireAuth, express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '2mb' }), auth.handleSetAvatar);
router.delete('/me/avatar', requireAuth, auth.handleRemoveAvatar);
router.post('/me/password', requireAuth, validateBody(auth.ChangePasswordSchema), auth.handleChangePassword);

router.post('/me/family', requireAuth, validateBody(auth.FamilyMemberSchema), auth.handleAddFamilyMember);
router.put('/me/family/:id', requireAuth, validateBody(auth.FamilyMemberSchema), auth.handleUpdateFamilyMember);
router.delete('/me/family/:id', requireAuth, auth.handleRemoveFamilyMember);

export default router;
