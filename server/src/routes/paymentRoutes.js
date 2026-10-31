import { Router } from 'express';
import express from 'express';
import * as payments from '../controllers/paymentController.js';

const router = Router();

router.get('/callback', payments.paymentCallback);
router.post('/webhook', payments.paymentWebhook);
router.get('/mock/:linkId', payments.mockPaymentPage);
router.post('/mock/:linkId/pay', express.urlencoded({ extended: false }), payments.mockPaymentPay);

export default router;
