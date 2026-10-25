import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  createStoreOrder,
  getOrderDetails,
  CreateStoreOrderSchema,
} from '../controllers/storeController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/products', getAllProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/orders', optionalAuth, validateBody(CreateStoreOrderSchema), createStoreOrder);
router.get('/orders/:orderId', optionalAuth, getOrderDetails);

export default router;
