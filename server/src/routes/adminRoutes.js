import { Router } from 'express';
import express from 'express';
import * as admin from '../controllers/adminController.js';
import * as content from '../controllers/contentController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.post('/login', authLimiter, validateBody(admin.AdminLoginSchema), admin.adminLogin);

router.use(requireAdmin);

router.get('/me', admin.adminMe);
router.get('/stats', admin.getStats);

router.get('/bookings', admin.listBookings);
router.patch('/bookings/:id', validateBody(admin.UpdateBookingSchema), admin.updateBooking);
router.post('/bookings/:id/reschedule', validateBody(admin.RescheduleSchema), admin.rescheduleBooking);

router.get('/orders', admin.listOrders);
router.patch('/orders/:id', validateBody(admin.UpdateOrderSchema), admin.updateOrder);

router.get('/kundli', admin.listKundli);
router.patch('/kundli/:id', validateBody(admin.UpdateKundliSchema), admin.updateKundli);

router.get('/users', admin.listUsers);
router.get('/users/:id', admin.getUserDetail);
router.patch('/users/:id', admin.updateUser);

router.get('/pujas', admin.pujaCrud.list);
router.post('/pujas', validateBody(admin.PujaInputSchema), admin.pujaCrud.create);
router.put('/pujas/:id', validateBody(admin.PujaInputSchema), admin.pujaCrud.update);
router.delete('/pujas/:id', admin.pujaCrud.remove);

router.get('/products', admin.productCrud.list);
router.post('/products', validateBody(admin.ProductInputSchema), admin.productCrud.create);
router.put('/products/:id', validateBody(admin.ProductInputSchema), admin.productCrud.update);
router.delete('/products/:id', admin.productCrud.remove);

router.post('/media', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '3mb' }), content.uploadMedia);

router.get('/banners', content.listBanners);
router.post('/banners', validateBody(content.BannerSchema), content.createBanner);
router.put('/banners/:id', validateBody(content.BannerSchema), content.updateBanner);
router.delete('/banners/:id', content.deleteBanner);

router.get('/settings', admin.getAdminSettings);
router.put('/settings', validateBody(admin.SettingsSchema), admin.updateAdminSettings);

router.get('/schedule', admin.getDaySchedule);
router.post('/schedule/blocks', validateBody(admin.BlockSchema), admin.createBlock);
router.delete('/schedule/blocks/:group', admin.deleteBlock);

export default router;
