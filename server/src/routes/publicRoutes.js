import { Router } from 'express';
import * as catalog from '../controllers/catalogController.js';
import * as slots from '../controllers/slotController.js';
import * as content from '../controllers/contentController.js';
import { validateQuery } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/settings', catalog.getPublicSettings);
router.get('/home', content.getHome);
router.get('/media/:id', content.serveMedia);
router.get('/pujas', catalog.listPujas);
router.get('/pujas/categories', catalog.listPujaCategories);
router.get('/pujas/:idOrSlug', catalog.getPuja);
router.get('/products', catalog.listProducts);
router.get('/products/:idOrSlug', catalog.getProduct);
router.get('/slots', validateQuery(slots.SlotQuerySchema), slots.getSlots);
router.get('/slots/calendar', validateQuery(slots.SlotQuerySchema), slots.getCalendar);

export default router;
