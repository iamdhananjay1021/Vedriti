import { Router } from 'express';
import * as bookings from '../controllers/bookingController.js';
import * as orders from '../controllers/orderController.js';
import * as kundli from '../controllers/kundliController.js';
import * as payments from '../controllers/paymentController.js';
import { requireAuth, requireCompleteProfile } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.use(requireAuth);

router.post('/bookings', requireCompleteProfile, validateBody(bookings.CreateBookingSchema), bookings.createBooking);
router.get('/bookings', bookings.listMyBookings);
router.get('/bookings/:bookingId', bookings.getMyBooking);
router.post('/bookings/:bookingId/cancel', validateBody(bookings.CancelSchema), bookings.cancelMyBooking);

router.post('/orders', requireCompleteProfile, validateBody(orders.CreateOrderSchema), orders.createOrder);
router.get('/orders', orders.listMyOrders);
router.get('/orders/:orderId', orders.getMyOrder);
router.post('/orders/:orderId/cancel', validateBody(bookings.CancelSchema), orders.cancelMyOrder);

router.post('/kundli', requireCompleteProfile, validateBody(kundli.SubmitKundliSchema), kundli.submitKundliRequest);
router.get('/kundli', kundli.listMyKundliRequests);
router.get('/kundli/:requestId', kundli.getMyKundliRequest);

router.post('/payments/pay-now', validateBody(payments.PayNowSchema), payments.payNow);
router.get('/payments/status/:type/:reference', payments.getPaymentStatus);

export default router;
