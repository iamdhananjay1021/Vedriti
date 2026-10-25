import { z } from 'zod';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { VEDIC_CONSTANTS } from '../config/constants.js';
import { AppError } from '../middlewares/errorHandler.js';
import { WhatsAppNotificationService } from '../services/whatsappService.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

export const CreateStoreOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ).min(1, 'कम से कम एक सामग्री चुनना आवश्यक है'),
  devoteeName: z.string().min(2, 'यजमान का नाम आवश्यक है'),
  phone: z.string().min(10, 'मान्य मोबाइल नंबर आवश्यक है'),
  address: z.string().min(5, 'वितरण पता आवश्यक है'),
  pinCode: z.string().min(6, 'पिन कोड आवश्यक है'),
  paymentMethod: z.enum(['UPI', 'CARD', 'COD']).default('UPI'),
});

/**
 * GET /api/v1/store/products
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    if (isDatabaseConnected()) {
      const filter = { inStock: true };

      if (category && typeof category === 'string' && category !== 'all') {
        filter.category = category;
      }

      if (search && typeof search === 'string') {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: searchRegex }, { tagline: searchRegex }, { description: searchRegex }];
      }

      const products = await Product.find(filter).sort({ rating: -1, reviewCount: -1 });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } else {
      let filtered = [...inMemoryStore.products];

      if (category && typeof category === 'string' && category !== 'all') {
        filtered = filtered.filter((p) => p.category === category);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/store/products/:slug
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isDatabaseConnected()) {
      const product = await Product.findOne({ slug });
      if (!product) {
        throw new AppError('सामग्री विवरण नहीं मिला (Product not found)', 404);
      }
      res.status(200).json({ success: true, data: product });
    } else {
      const product = inMemoryStore.products.find((p) => p.slug === slug);
      if (!product) {
        throw new AppError('सामग्री विवरण नहीं मिला (Product not found)', 404);
      }
      res.status(200).json({ success: true, data: product });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/store/orders
 */
export const createStoreOrder = async (req, res, next) => {
  try {
    const { items, devoteeName, phone, address, pinCode, paymentMethod } = req.body;

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      let product = null;
      if (isDatabaseConnected()) {
        product = await Product.findById(item.productId);
      } else {
        product = inMemoryStore.products.find(
          (p) => p._id === item.productId || p.slug === item.productId
        );
      }

      if (!product) {
        throw new AppError(`Product ID ${item.productId} not found`, 404);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    const orderId = `${VEDIC_CONSTANTS.PREFIX_STORE_ORDER}${Math.floor(1000 + Math.random() * 9000)}`;

    const order = new Order({
      orderId,
      user: req.userId ? req.userId : undefined,
      items: orderItems,
      devoteeName,
      phone,
      address,
      pinCode,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'COD' : 'PENDING',
      orderStatus: 'RECEIVED',
      awbNumber: `BD-VR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      courierPartner: 'BlueDart Holy Express',
    });

    if (isDatabaseConnected()) {
      await order.save();
    } else {
      inMemoryStore.orders.set(order.orderId, order);
    }

    // Trigger WhatsApp Voucher
    await WhatsAppNotificationService.sendOrderVoucher(order);

    res.status(201).json({
      success: true,
      message: 'दिव्य सामग्री ऑर्डर पंजीकृत किया गया! ॐ',
      data: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        awbNumber: order.awbNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/store/orders/:orderId
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    const orderId = String(req.params.orderId);
    let order = null;
    if (isDatabaseConnected()) {
      order = await Order.findOne({ orderId }).populate('items.productId');
    } else {
      order = inMemoryStore.orders.get(orderId);
    }

    if (!order) {
      throw new AppError('ऑर्डर संदर्भ नहीं मिला (Order not found)', 404);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
