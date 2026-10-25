import { Router } from 'express';
import {
  getAdminStats,
  getAdminBookings,
  updateAdminBooking,
  getAdminOrders,
  updateAdminOrder,
  getAdminPayouts,
  settleAdminPayout,
} from '../controllers/adminController.js';

const router = Router();

router.get('/stats', getAdminStats);
router.get('/bookings', getAdminBookings);
router.patch('/bookings/:id', updateAdminBooking);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id', updateAdminOrder);
router.get('/payouts', getAdminPayouts);
router.post('/payouts/:id/settle', settleAdminPayout);

export default router;
