import { Router } from 'express';
import authRoutes from './authRoutes.js';
import pujaRoutes from './pujaRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import storeRoutes from './storeRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import kundliRoutes from './kundliRoutes.js';
import aiRoutes from './aiRoutes.js';
import panchangRoutes from './panchangRoutes.js';
import adminRoutes from './adminRoutes.js';
import { getDatabaseStatus } from '../config/db.js';

const router = Router();

// Healthcheck endpoint
router.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.status(200).json({
    status: 'healthy',
    platform: 'VedRiti Vedic Sanctum API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount module sub-routers
router.use('/auth', authRoutes);
router.use('/pujas', pujaRoutes);
router.use('/bookings', bookingRoutes);
router.use('/store', storeRoutes);
router.use('/payments', paymentRoutes);
router.use('/kundli', kundliRoutes);
router.use('/ai', aiRoutes);
router.use('/panchang', panchangRoutes);
router.use('/admin', adminRoutes);

export default router;
