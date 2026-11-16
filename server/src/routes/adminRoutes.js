import { Router } from 'express';
import express from 'express';
import * as admin from '../controllers/adminController.js';
import * as content from '../controllers/contentController.js';
import * as samuhik from '../controllers/samuhikController.js';
import broadcastRoutes from './broadcastRoutes.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.post('/login', authLimiter, validateBody(admin.AdminLoginSchema), admin.adminLogin);

router.use(requireAdmin);

router.get('/me', admin.adminMe);
router.get('/stats', admin.getStats);
router.get('/auth-status', admin.getAuthStatus);

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

router.post('/media', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], limit: '10mb' }), content.uploadMedia);

router.get('/banners', content.listBanners);
router.post('/banners', validateBody(content.BannerSchema), content.createBanner);
router.put('/banners/:id', validateBody(content.BannerSchema), content.updateBanner);
router.delete('/banners/:id', content.deleteBanner);

router.get('/settings', admin.getAdminSettings);
router.put('/settings', validateBody(admin.SettingsSchema), admin.updateAdminSettings);

router.get('/schedule', admin.getDaySchedule);
router.post('/schedule/blocks', validateBody(admin.BlockSchema), admin.createBlock);
router.delete('/schedule/blocks/:group', admin.deleteBlock);

// Vedic AI Inquiries & Devotee Consultation Sessions
router.get('/chat-sessions', admin.listChatSessions);
router.get('/chat-sessions/:sessionId', admin.getChatSessionDetail);

// Admin Staff & Sub-Admins
router.get('/staff', admin.listStaff);
router.post('/staff', validateBody(admin.StaffInputSchema), admin.createStaff);
router.patch('/staff/:id', admin.updateStaff);
router.delete('/staff/:id', admin.deleteStaff);

// Coupons & Festival Discounts
router.get('/coupons', admin.listCoupons);
router.post('/coupons', validateBody(admin.CouponSchema), admin.createCoupon);
router.put('/coupons/:id', validateBody(admin.CouponSchema), admin.updateCoupon);
router.delete('/coupons/:id', admin.deleteCoupon);

// Temple Announcements & Broadcasts
router.get('/announcements', admin.listAnnouncements);
router.post('/announcements', validateBody(admin.AnnouncementSchema), admin.createAnnouncement);
router.put('/announcements/:id', validateBody(admin.AnnouncementSchema), admin.updateAnnouncement);
router.delete('/announcements/:id', admin.deleteAnnouncement);

// Samuhik Mahapujas Management
router.get('/samuhik-pujas', samuhik.adminListSamuhikPujas);
router.post('/samuhik-pujas', validateBody(samuhik.SamuhikPujaInputSchema), samuhik.adminCreateSamuhikPuja);
router.patch('/samuhik-pujas/:id', samuhik.adminUpdateSamuhikPuja);
router.get('/samuhik-pujas/:id/devotees', samuhik.adminGetSamuhikDevotees);
router.post('/samuhik-pujas/:id/proof', samuhik.adminUploadProof);

// Broadcast messaging (super admin only)
router.use('/broadcasts', broadcastRoutes);

export default router;
