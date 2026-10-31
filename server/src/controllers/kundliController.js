import { z } from 'zod';
import { KundliRequest } from '../models/KundliRequest.js';
import { getSettings } from '../models/Settings.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { attachPaymentLink, refreshFromGateway } from '../services/paymentService.js';
import { generateReference, normalizePhone } from '../utils/ids.js';
import { DATE_REGEX, TIME_REGEX } from '../utils/time.js';
import { ID_PREFIX, KUNDLI_TYPES } from '../config/constants.js';

const PersonSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name is required').max(80),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dateOfBirth: z.string().regex(DATE_REGEX, 'Date of birth is required'),
    timeOfBirth: z.union([z.string().regex(TIME_REGEX), z.literal('')]).optional().default(''),
    timeUnknown: z.boolean().optional().default(false),
    placeOfBirth: z.string().trim().min(2, 'Place of birth is required').max(120),
  })
  .refine((p) => p.timeUnknown || p.timeOfBirth, { message: 'Time of birth is required (or mark it unknown)', path: ['timeOfBirth'] })
  .refine((p) => new Date(`${p.dateOfBirth}T00:00:00Z`).getTime() <= Date.now(), {
    message: 'Date of birth cannot be in the future',
    path: ['dateOfBirth'],
  });

export const SubmitKundliSchema = z
  .object({
    type: z.enum(KUNDLI_TYPES),
    primaryPerson: PersonSchema,
    partnerPerson: PersonSchema.optional(),
    questions: z.string().trim().max(2000).optional().default(''),
    contactPhone: z.string().trim().min(10).max(16),
    preferredLanguage: z.enum(['HINDI', 'ENGLISH']).default('HINDI'),
    paymentMethod: z.enum(['ONLINE', 'PAY_LATER']),
  })
  .superRefine((v, ctx) => {
    if (v.type === 'GUNA_MILAN' && !v.partnerPerson) {
      ctx.addIssue({ code: 'custom', path: ['partnerPerson'], message: 'Partner details are required for Guna Milan' });
    }
    if (v.type === 'GENERAL_QUERY' && v.questions.length < 5) {
      ctx.addIssue({ code: 'custom', path: ['questions'], message: 'Please write your question for Pandit Ji' });
    }
  });

export const serializeKundli = (k) => ({
  id: k._id.toString(),
  requestId: k.requestId,
  type: k.type,
  primaryPerson: k.primaryPerson,
  partnerPerson: k.partnerPerson || null,
  questions: k.questions,
  contactPhone: k.contactPhone,
  preferredLanguage: k.preferredLanguage,
  amount: k.amount,
  paymentMethod: k.paymentMethod,
  paymentStatus: k.paymentStatus,
  paymentUrl: k.paymentStatus !== 'PAID' && k.status !== 'CLOSED' ? k.paymentLinkUrl || null : null,
  status: k.status,
  panditResponse: k.panditResponse,
  respondedAt: k.respondedAt,
  createdAt: k.createdAt,
});

export const submitKundliRequest = asyncHandler(async (req, res) => {
  const body = req.body;
  const settings = await getSettings();
  const contactPhone = normalizePhone(body.contactPhone);
  if (!contactPhone) throw new AppError('Please enter a valid 10-digit mobile number', 400);
  if (body.paymentMethod === 'PAY_LATER' && !settings.allowPayLater) {
    throw new AppError('Pay later is not available. Please pay online.', 400);
  }
  const open = await KundliRequest.countDocuments({ user: req.userId, status: 'SUBMITTED', paymentStatus: { $ne: 'PAID' } });
  if (open >= 5) throw new AppError('You already have several unpaid requests. Please complete payment for those first.', 429);

  const amount = settings.kundliFees?.[body.type] ?? 0;
  const request = new KundliRequest({
    requestId: generateReference(ID_PREFIX.KUNDLI),
    user: req.userId,
    type: body.type,
    primaryPerson: body.primaryPerson,
    partnerPerson: body.type === 'GUNA_MILAN' ? body.partnerPerson : undefined,
    questions: body.questions,
    contactPhone,
    preferredLanguage: body.preferredLanguage,
    amount,
    paymentMethod: amount === 0 ? 'PAY_LATER' : body.paymentMethod,
    paymentStatus: amount === 0 ? 'PAID' : body.paymentMethod === 'PAY_LATER' ? 'PAY_LATER' : 'PENDING',
  });
  await request.save();

  if (request.paymentMethod === 'ONLINE' && request.paymentStatus === 'PENDING') {
    try {
      await attachPaymentLink('kundli', request, {
        amount,
        customer: { name: body.primaryPerson.fullName, phone: contactPhone, email: req.user.email },
        description: `Kundli request ${request.requestId}`,
      });
    } catch (error) {
      await KundliRequest.deleteOne({ _id: request._id });
      throw error;
    }
  }

  res.status(201).json({ success: true, data: serializeKundli(request) });
});

export const listMyKundliRequests = asyncHandler(async (req, res) => {
  const requests = await KundliRequest.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: requests.map(serializeKundli) });
});

export const getMyKundliRequest = asyncHandler(async (req, res) => {
  const request = await KundliRequest.findOne({ requestId: req.params.requestId, user: req.userId });
  if (!request) throw new AppError('Request not found', 404);
  res.json({ success: true, data: serializeKundli(await refreshFromGateway(request)) });
});
