import { Router } from 'express';
import authRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';
import userRoutes from './userRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import adminRoutes from './adminRoutes.js';
import aiRoutes from './aiRoutes.js';
import panchangRoutes from './panchangRoutes.js';
import { getDatabaseStatus } from '../config/db.js';

const router = Router();

router.get('/health', (req, res) => {
  const database = getDatabaseStatus();
  res.status(database.connected ? 200 : 503).json({
    status: database.connected ? 'healthy' : 'degraded',
    platform: 'VedRit API',
    timestamp: new Date().toISOString(),
    database,
  });
});

router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/panchang', panchangRoutes);
router.use('/', publicRoutes);
router.use('/me', userRoutes);

export default router;
