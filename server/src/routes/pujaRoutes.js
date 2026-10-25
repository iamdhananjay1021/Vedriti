import { Router } from 'express';
import { getAllPujas, getPujaBySlug, getPopularPujas } from '../controllers/pujaController.js';

const router = Router();

router.get('/', getAllPujas);
router.get('/popular', getPopularPujas);
router.get('/:slug', getPujaBySlug);

export default router;
