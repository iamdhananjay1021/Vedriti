import { Router } from 'express';
import {
  handleRequestOtp,
  handleVerifyOtp,
  handleEmailSignup,
  handleEmailLogin,
  handleGetProfile,
  handleUpdateProfile,
  handleAddFamilyMember,
  handleRemoveFamilyMember,
  RequestOtpSchema,
  VerifyOtpSchema,
  EmailSignupSchema,
  EmailLoginSchema,
  UpdateProfileSchema,
  FamilyMemberSchema,
} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.post('/request-otp', authLimiter, validateBody(RequestOtpSchema), handleRequestOtp);
router.post('/verify-otp', authLimiter, validateBody(VerifyOtpSchema), handleVerifyOtp);

router.post('/signup-email', authLimiter, validateBody(EmailSignupSchema), handleEmailSignup);
router.post('/login-email', authLimiter, validateBody(EmailLoginSchema), handleEmailLogin);

router.get('/profile', requireAuth, handleGetProfile);
router.patch('/profile', requireAuth, validateBody(UpdateProfileSchema), handleUpdateProfile);

router.post('/family', requireAuth, validateBody(FamilyMemberSchema), handleAddFamilyMember);
router.delete('/family/:id', requireAuth, handleRemoveFamilyMember);

export default router;
