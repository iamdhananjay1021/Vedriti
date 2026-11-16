import { Router } from 'express';
import * as bookings from '../controllers/bookingController.js';
import * as orders from '../controllers/orderController.js';
import * as kundli from '../controllers/kundliController.js';
import * as payments from '../controllers/paymentController.js';
import * as devotee from '../controllers/devoteeController.js';
import * as samuhik from '../controllers/samuhikController.js';
import * as broadcast from '../controllers/broadcastController.js';
import { requireAuth, requireCompleteProfile } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.use(requireAuth);

// Nitya Puja Virtual Mandir & Japa Tracker
router.post('/nitya-puja', validateBody(devotee.NityaPujaSchema), devotee.recordNityaPuja);
router.post('/japa', validateBody(devotee.JapaSchema), devotee.recordJapa);

// Samuhik Mahapuja (₹101 / ₹251 Micro-Dakshina Group Pujas)
router.post('/samuhik-pujas/:id/join', validateBody(samuhik.EnrollSchema), samuhik.enrollInSamuhikPuja);
router.get('/samuhik-bookings', samuhik.listMySamuhikBookings);

router.post('/bookings', requireCompleteProfile, validateBody(bookings.CreateBookingSchema), bookings.createBooking);
router.get('/notifications', broadcast.listMyNotifications);
router.post('/notifications/read', broadcast.markNotificationsRead);

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
