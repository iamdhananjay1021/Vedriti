import { Router } from 'express';
import {
  askVedicAi,
  getSessionHistory,
  submitFeedback,
  AskVedicAiSchema,
  FeedbackSchema,
} from '../controllers/aiController.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

// Ask Vedic AI Consultation (with multi-turn session tracking & devotee context)
router.post('/ask', validateBody(AskVedicAiSchema), askVedicAi);

// Get Session Message History
router.get('/sessions/:sessionId', getSessionHistory);

// Submit Devotee Feedback on AI Response
router.post('/feedback', validateBody(FeedbackSchema), submitFeedback);

export default router;
