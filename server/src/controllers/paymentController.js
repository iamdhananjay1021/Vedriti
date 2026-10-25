import { z } from 'zod';
import * as razorpayService from '../services/razorpayService.js';
import { Booking } from '../models/Booking.js';
import { Order } from '../models/Order.js';
import { AppError } from '../middlewares/errorHandler.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

export const CreatePaymentOrderSchema = z.object({
  referenceId: z.string().min(1, 'Reference ID (Booking or Order ID) is required'),
  referenceType: z.enum(['puja', 'order']),
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

export const VerifyPaymentSchema = z.object({
  referenceId: z.string().min(1),
  referenceType: z.enum(['puja', 'order']),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

/**
 * POST /api/v1/payments/create-order
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { referenceId, referenceType, amount } = req.body;

    const razorpayOrder = await razorpayService.createRazorpayOrder(
      amount,
      referenceId,
      { referenceType, referenceId }
    );

    // Save razorpayOrderId to target entity
    if (isDatabaseConnected()) {
      if (referenceType === 'puja') {
        await Booking.findOneAndUpdate(
          { bookingId: referenceId },
          { razorpayOrderId: razorpayOrder.orderId }
        );
      } else {
        await Order.findOneAndUpdate(
          { orderId: referenceId },
          { razorpayOrderId: razorpayOrder.orderId }
        );
      }
    } else {
      if (referenceType === 'puja') {
        const b = inMemoryStore.bookings.get(referenceId);
        if (b) b.razorpayOrderId = razorpayOrder.orderId;
      } else {
        const o = inMemoryStore.orders.get(referenceId);
        if (o) o.razorpayOrderId = razorpayOrder.orderId;
      }
    }

    res.status(200).json({
      success: true,
      data: razorpayOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { referenceId, referenceType, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = razorpayService.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new AppError('Payment signature verification failed. Possible tampering.', 400);
    }

    // Mark as PAID
    if (isDatabaseConnected()) {
      if (referenceType === 'puja') {
        const booking = await Booking.findOneAndUpdate(
          { bookingId: referenceId },
          {
            paymentStatus: 'PAID',
            razorpayPaymentId,
            sankalpStatus: 'CONSECRATED_BY_ACHARYA',
          },
          { new: true }
        );
        if (!booking) throw new AppError('Booking reference not found', 404);
      } else {
        const order = await Order.findOneAndUpdate(
          { orderId: referenceId },
          {
            paymentStatus: 'PAID',
            razorpayPaymentId,
            orderStatus: 'CONSECRATING',
          },
          { new: true }
        );
        if (!order) throw new AppError('Order reference not found', 404);
      }
    } else {
      if (referenceType === 'puja') {
        const b = inMemoryStore.bookings.get(referenceId);
        if (b) {
          b.paymentStatus = 'PAID';
          b.razorpayPaymentId = razorpayPaymentId;
          b.sankalpStatus = 'CONSECRATED_BY_ACHARYA';
        }
      } else {
        const o = inMemoryStore.orders.get(referenceId);
        if (o) {
          o.paymentStatus = 'PAID';
          o.razorpayPaymentId = razorpayPaymentId;
          o.orderStatus = 'CONSECRATING';
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and consecration registered successfully! ॐ',
      referenceId,
      paymentStatus: 'PAID',
    });
  } catch (error) {
    next(error);
  }
};
