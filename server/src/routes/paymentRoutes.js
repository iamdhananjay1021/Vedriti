import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  CreatePaymentOrderSchema,
  VerifyPaymentSchema,
} from '../controllers/paymentController.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.post('/create-order', validateBody(CreatePaymentOrderSchema), createPaymentOrder);
router.post('/verify', validateBody(VerifyPaymentSchema), verifyPayment);

export default router;
