import { Router } from 'express';
import {
  createBooking,
  getBookingDetails,
  getUserBookings,
  getDigitalSankalpPatra,
  verifySankalpQr,
  CreateBookingSchema,
} from '../controllers/bookingController.js';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.post('/', optionalAuth, validateBody(CreateBookingSchema), createBooking);
router.get('/my-bookings', requireAuth, getUserBookings);
router.get('/verify-patra/:qrHash', verifySankalpQr);
router.get('/:bookingId', optionalAuth, getBookingDetails);
router.get('/:bookingId/sankalp-patra', optionalAuth, getDigitalSankalpPatra);

export default router;
