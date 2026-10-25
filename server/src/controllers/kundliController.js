import { z } from 'zod';
import { KundliRequest } from '../models/KundliRequest.js';
import { VEDIC_CONSTANTS } from '../config/constants.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

const BirthDetailsZodSchema = z.object({
  fullName: z.string().min(2, 'पूरा नाम आवश्यक है'),
  gender: z.string().default('Male'),
  dateOfBirth: z.string().min(4, 'जन्म तिथि आवश्यक है'),
  timeOfBirth: z.string().min(2, 'जन्म समय आवश्यक है'),
  placeOfBirth: z.string().min(2, 'जन्म स्थान आवश्यक है'),
  gotra: z.string().default('Kashyap'),
});

export const SubmitKundliSchema = z.object({
  type: z.enum(['JANAM_KUNDLI', 'GUNA_MILAN', 'DOSHA_NIVARAN']),
  primaryPerson: BirthDetailsZodSchema,
  partnerPerson: BirthDetailsZodSchema.optional(),
  selectedDosha: z.string().optional(),
  specificConcerns: z.string().optional(),
});

/**
 * POST /api/v1/kundli/consultation
 */
export const submitKundliRequest = async (req, res, next) => {
  try {
    const { type, primaryPerson, partnerPerson, selectedDosha, specificConcerns } = req.body;

    const requestId = `${VEDIC_CONSTANTS.PREFIX_KUNDLI}${Math.floor(1000 + Math.random() * 9000)}`;

    const consultation = new KundliRequest({
      requestId,
      user: req.userId ? req.userId : undefined,
      type,
      primaryPerson,
      partnerPerson,
      selectedDosha,
      specificConcerns,
      assignedAcharya: 'Pt. Vidyadhar Shastri (Sampurnanand Sanskrit Vishwavidyalaya, Kashi)',
      status: 'SUBMITTED',
      analysisSummary: 'वरिष्ठ ज्योतिषाचार्य द्वारा ग्रह गोचर, दशा एवं वर्ग कुंडलियों का विश्लेषण प्रगति पर है।',
    });

    if (isDatabaseConnected()) {
      await consultation.save();
    } else {
      inMemoryStore.kundliRequests.set(requestId, consultation);
    }

    res.status(201).json({
      success: true,
      message: 'कुंडली परामर्श सफलतापूर्वक पंजीकृत किया गया! 📜',
      data: {
        requestId: consultation.requestId,
        type: consultation.type,
        assignedAcharya: consultation.assignedAcharya,
        status: consultation.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/kundli/my-consultations
 */
export const getMyKundliRequests = async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const requests = await KundliRequest.find({ user: req.userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
      });
    } else {
      const requests = Array.from(inMemoryStore.kundliRequests.values());
      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
      });
    }
  } catch (error) {
    next(error);
  }
};
