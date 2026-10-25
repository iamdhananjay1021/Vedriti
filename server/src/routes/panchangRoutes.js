import { Router } from 'express';
import { getTodaysPanchang } from '../controllers/panchangController.js';

const router = Router();

router.get('/today', getTodaysPanchang);

export default router;
