import { Router } from 'express';
import * as catalog from '../controllers/catalogController.js';
import * as slots from '../controllers/slotController.js';
import * as content from '../controllers/contentController.js';
import * as samuhik from '../controllers/samuhikController.js';
import * as broadcast from '../controllers/broadcastController.js';
import { validateQuery } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/settings', catalog.getPublicSettings);
router.get('/home', content.getHome);
router.get('/media/:id', content.serveMedia);
router.get('/pujas', catalog.listPujas);
router.get('/pujas/categories', catalog.listPujaCategories);
router.get('/pujas/:idOrSlug', catalog.getPuja);

// Samuhik Mahapuja Public Endpoints
router.get('/samuhik-pujas', samuhik.listPublicSamuhikPujas);
router.get('/samuhik-pujas/:idOrSlug', samuhik.getPublicSamuhikPuja);

router.get('/products', catalog.listProducts);
router.get('/products/:idOrSlug', catalog.getProduct);
router.get('/slots', validateQuery(slots.SlotQuerySchema), slots.getSlots);
router.get('/slots/calendar', validateQuery(slots.SlotQuerySchema), slots.getCalendar);

router.get('/unsubscribe', broadcast.unsubscribe);
router.post('/unsubscribe', broadcast.unsubscribePost);

export default router;
