import { Router } from 'express';
import {
  submitKundliRequest,
  getMyKundliRequests,
  SubmitKundliSchema,
} from '../controllers/kundliController.js';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.post('/consultation', optionalAuth, validateBody(SubmitKundliSchema), submitKundliRequest);
router.get('/my-consultations', requireAuth, getMyKundliRequests);

export default router;
