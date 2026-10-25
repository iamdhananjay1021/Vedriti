import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
  });
} catch (error) {
  console.warn('⚠️ [Razorpay] SDK initialization in mock/sandbox mode.');
}

/**
 * Generate a Razorpay order for online payment
 * @param {number} amountInRupees
 * @param {string} receiptId
 * @param {Record<string, string>} [notes]
 */
export const createRazorpayOrder = async (amountInRupees, receiptId, notes = {}) => {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (!razorpayInstance || config.razorpayKeyId.includes('test_VedicSanctum')) {
    // Graceful test mock order when keys are in default test sandbox
    return {
      orderId: `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: amountInPaise,
      currency: 'INR',
      keyId: config.razorpayKeyId,
    };
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        platform: 'VedRiti Sanctum',
        ...notes,
      },
    });

    return {
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      keyId: config.razorpayKeyId,
    };
  } catch (error) {
    throw new AppError(`Razorpay Order creation failed: ${error.message}`, 500);
  }
};

/**
 * Cryptographically verify Razorpay Webhook or Client Signature
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} signature
 * @returns {boolean}
 */
export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  // Allow mock test bypass in development
  if (config.nodeEnv !== 'production' && razorpayOrderId.startsWith('order_mock_')) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};
