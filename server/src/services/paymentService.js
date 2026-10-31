import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config, isRazorpayConfigured } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Booking } from '../models/Booking.js';
import { Order } from '../models/Order.js';
import { KundliRequest } from '../models/KundliRequest.js';
import { reserveSlot } from './slotService.js';

const LINK_EXPIRY_MINUTES = 20;
export const PAYMENT_WINDOW_MINUTES = 30;

let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({ key_id: config.razorpayKeyId, key_secret: config.razorpayKeySecret });
  }
  return razorpay;
};

export const REFERENCE_MODELS = {
  booking: { model: Booking, idField: 'bookingId' },
  order: { model: Order, idField: 'orderId' },
  kundli: { model: KundliRequest, idField: 'requestId' },
};

export const callbackUrl = () => `${config.publicApiUrl}${config.apiPrefix}/payments/callback`;

export const createPaymentLink = async ({ type, doc, amount, customer, description }) => {
  const referenceId = `${type}:${doc[REFERENCE_MODELS[type].idField]}:${Date.now().toString(36)}`;

  if (!isRazorpayConfigured()) {
    if (config.isProduction) throw new AppError('Online payment is not available right now. Please choose pay later.', 503);
    const id = `plink_mock_${crypto.randomBytes(6).toString('hex')}`;
    return { id, url: `${config.publicApiUrl}${config.apiPrefix}/payments/mock/${id}` };
  }

  try {
    const link = await getRazorpay().paymentLink.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      accept_partial: false,
      reference_id: referenceId.slice(0, 40),
      description: description.slice(0, 2048),
      expire_by: Math.floor(Date.now() / 1000) + LINK_EXPIRY_MINUTES * 60,
      customer: {
        name: customer.name || undefined,
        contact: customer.phone || undefined,
        email: customer.email || undefined,
      },
      notify: { sms: false, email: false },
      reminder_enable: false,
      callback_url: callbackUrl(),
      callback_method: 'get',
      notes: { type, reference: doc[REFERENCE_MODELS[type].idField] },
    });
    return { id: link.id, url: link.short_url };
  } catch (error) {
    console.error('[Razorpay] payment link error', error?.error || error);
    throw new AppError('Could not start online payment. Please try again.', 502);
  }
};

export const attachPaymentLink = async (type, doc, { amount, customer, description }) => {
  const link = await createPaymentLink({ type, doc, amount, customer, description });
  doc.paymentLinkId = link.id;
  doc.paymentLinkUrl = link.url;
  if ('paymentExpiresAt' in doc.schema.paths) {
    doc.paymentExpiresAt = new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60000);
  }
  await doc.save();
  return link;
};

const findByLinkId = async (linkId) => {
  for (const [type, { model }] of Object.entries(REFERENCE_MODELS)) {
    const doc = await model.findOne({ paymentLinkId: linkId });
    if (doc) return { type, doc };
  }
  return null;
};

export const markPaid = async (linkId, paymentId) => {
  const found = await findByLinkId(linkId);
  if (!found) return null;
  const { type, doc } = found;
  if (doc.paymentStatus === 'PAID') return found;

  doc.paymentStatus = 'PAID';
  doc.paidAt = new Date();
  doc.razorpayPaymentId = paymentId || doc.razorpayPaymentId;

  if (type === 'booking') {
    if (doc.status === 'CANCELLED' && doc.cancelledBy === 'SYSTEM') {
      try {
        await reserveSlot({ date: doc.date, startTime: doc.startTime, durationMinutes: doc.durationMinutes, bookingId: doc._id });
        doc.status = 'CONFIRMED';
        doc.cancelReason = '';
        doc.cancelledBy = '';
      } catch {
        doc.cancelReason = 'Payment received after slot expired. Refund due.';
      }
    } else if (doc.status === 'PENDING') {
      doc.status = 'CONFIRMED';
    }
  }
  if (type === 'order' && doc.status === 'PLACED') doc.status = 'CONFIRMED';
  await doc.save();
  return found;
};

export const refreshFromGateway = async (doc) => {
  if (doc.paymentStatus === 'PAID' || !doc.paymentLinkId || !isRazorpayConfigured()) return doc;
  if (doc.paymentLinkId.startsWith('plink_mock_')) return doc;
  try {
    const link = await getRazorpay().paymentLink.fetch(doc.paymentLinkId);
    if (link.status === 'paid') {
      const paymentId = link.payments?.find((p) => p.status === 'captured')?.payment_id;
      const result = await markPaid(doc.paymentLinkId, paymentId);
      return result?.doc || doc;
    }
  } catch (error) {
    console.error('[Razorpay] fetch link error', error?.error || error);
  }
  return doc;
};

export const verifyCallbackSignature = ({ linkId, referenceId, status, paymentId, signature }) => {
  if (!isRazorpayConfigured() || !signature) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(`${linkId}|${referenceId}|${status}|${paymentId}`)
    .digest('hex');
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

export const verifyWebhookSignature = (rawBody, signature) => {
  if (!config.razorpayWebhookSecret || !signature || !rawBody) return false;
  const expected = crypto.createHmac('sha256', config.razorpayWebhookSecret).update(rawBody).digest('hex');
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};
