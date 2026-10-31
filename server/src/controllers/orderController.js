import { z } from 'zod';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { getSettings } from '../models/Settings.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { attachPaymentLink, refreshFromGateway } from '../services/paymentService.js';
import { generateReference, normalizePhone } from '../utils/ids.js';
import { ID_PREFIX } from '../config/constants.js';

export const CreateOrderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, 'Your cart is empty')
    .max(30),
  name: z.string().trim().min(2, 'Name is required').max(80),
  phone: z.string().trim().min(10).max(16),
  address: z.string().trim().min(5, 'Full address is required').max(300),
  city: z.string().trim().min(2, 'City is required').max(80),
  state: z.string().trim().min(2, 'State is required').max(80),
  pinCode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Valid 6-digit PIN code is required'),
  paymentMethod: z.enum(['ONLINE', 'COD']),
});

export const serializeOrder = (o) => ({
  id: o._id.toString(),
  orderId: o.orderId,
  items: o.items.map((i) => ({
    productId: i.product.toString(),
    name: i.name,
    imageUrl: i.imageUrl,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    totalPrice: i.totalPrice,
  })),
  name: o.name,
  phone: o.phone,
  address: o.address,
  city: o.city,
  state: o.state,
  pinCode: o.pinCode,
  subtotal: o.subtotal,
  deliveryCharge: o.deliveryCharge,
  totalAmount: o.totalAmount,
  paymentMethod: o.paymentMethod,
  paymentStatus: o.paymentStatus,
  paymentUrl: o.paymentStatus === 'PENDING' && o.status !== 'CANCELLED' ? o.paymentLinkUrl || null : null,
  status: o.status,
  courierPartner: o.courierPartner,
  trackingNumber: o.trackingNumber,
  adminNote: o.adminNote,
  cancelReason: o.cancelReason,
  createdAt: o.createdAt,
});

export const restock = async (order) => {
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stockQuantity: item.quantity } });
  }
};

export const createOrder = asyncHandler(async (req, res) => {
  const body = req.body;
  const settings = await getSettings();
  const phone = normalizePhone(body.phone);
  if (!phone) throw new AppError('Please enter a valid 10-digit mobile number', 400);
  if (body.paymentMethod === 'COD' && !settings.allowCod) throw new AppError('Cash on delivery is not available', 400);

  const merged = new Map();
  for (const item of body.items) {
    if (!mongoose.isValidObjectId(item.productId)) throw new AppError('One of the products is no longer available', 404);
    merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
  }

  const products = await Product.find({ _id: { $in: [...merged.keys()] }, isActive: true });
  if (products.length !== merged.size) throw new AppError('One of the products is no longer available', 404);

  const reserved = [];
  try {
    for (const product of products) {
      const quantity = merged.get(product._id.toString());
      const result = await Product.updateOne(
        { _id: product._id, stockQuantity: { $gte: quantity } },
        { $inc: { stockQuantity: -quantity } }
      );
      if (result.modifiedCount !== 1) {
        throw new AppError(
          product.stockQuantity > 0
            ? `Only ${product.stockQuantity} unit(s) of "${product.name}" left in stock`
            : `"${product.name}" is out of stock`,
          409
        );
      }
      reserved.push({ product: product._id, quantity });
    }
  } catch (error) {
    await restock({ items: reserved });
    throw error;
  }

  const items = products.map((p) => {
    const quantity = merged.get(p._id.toString());
    return { product: p._id, name: p.name, imageUrl: p.imageUrl, quantity, unitPrice: p.price, totalPrice: p.price * quantity };
  });
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const deliveryCharge = subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryCharge;

  const order = new Order({
    orderId: generateReference(ID_PREFIX.ORDER),
    user: req.userId,
    items,
    name: body.name,
    phone,
    address: body.address,
    city: body.city,
    state: body.state,
    pinCode: body.pinCode,
    subtotal,
    deliveryCharge,
    totalAmount: subtotal + deliveryCharge,
    paymentMethod: body.paymentMethod,
    paymentStatus: 'PENDING',
    status: 'PLACED',
  });

  try {
    await order.save();
    if (order.paymentMethod === 'ONLINE') {
      await attachPaymentLink('order', order, {
        amount: order.totalAmount,
        customer: { name: body.name, phone, email: req.user.email },
        description: `VedRit order ${order.orderId}`,
      });
    }
  } catch (error) {
    await restock({ items: reserved });
    if (!order.isNew) await Order.deleteOne({ _id: order._id });
    throw error;
  }

  res.status(201).json({ success: true, data: serializeOrder(order) });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: orders.map(serializeOrder) });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.userId });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: serializeOrder(await refreshFromGateway(order)) });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.userId });
  if (!order) throw new AppError('Order not found', 404);
  if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
    throw new AppError('This order has already been shipped and cannot be cancelled', 400);
  }
  order.status = 'CANCELLED';
  order.cancelReason = req.body?.reason || 'Cancelled by customer';
  await order.save();
  await restock(order);
  res.json({ success: true, data: serializeOrder(order) });
});
