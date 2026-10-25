import { z } from 'zod';
import { VedicAiService } from '../services/vedicAiService.js';

export const AskVedicAiSchema = z.object({
  query: z.string().min(2, 'कृपया अपना प्रश्न अथवा जिज्ञासा दर्ज करें'),
  sessionId: z.string().optional(),
  devoteeContext: z
    .object({
      name: z.string().optional(),
      gotra: z.string().optional(),
      rashi: z.string().optional(),
      nakshatra: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
  userPhone: z.string().optional(),
});

export const FeedbackSchema = z.object({
  messageId: z.string(),
  feedback: z.enum(['helpful', 'unhelpful']),
});

/**
 * POST /api/v1/ai/ask
 * Enterprise Vedic Consultation processor with multi-turn sessions
 */
export const askVedicAi = async (req, res, next) => {
  try {
    const { query, sessionId, devoteeContext, userPhone } = req.body;

    const result = await VedicAiService.processConversation({
      query,
      sessionId,
      devoteeContext,
      userPhone: userPhone || req.user?.phone || null,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ai/sessions/:sessionId
 * Fetch complete message history for a consultation session
 */
export const getSessionHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const history = await VedicAiService.getSessionHistory(sessionId);

    res.status(200).json({
      success: true,
      sessionId,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/ai/feedback
 * Record user feedback on an answer
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { messageId, feedback } = req.body;
    const result = await VedicAiService.recordFeedback(messageId, feedback);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
