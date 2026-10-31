import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pinCode: { type: String, required: true, trim: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['ONLINE', 'COD'], required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'PENDING', index: true },
    paymentLinkId: { type: String },
    paymentLinkUrl: { type: String },
    paymentExpiresAt: { type: Date, index: true },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },
    status: { type: String, enum: ORDER_STATUS, default: 'PLACED', index: true },
    courierPartner: { type: String, trim: true, default: '' },
    trackingNumber: { type: String, trim: true, default: '' },
    adminNote: { type: String, trim: true, default: '' },
    cancelReason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.set('toJSON', { versionKey: false });

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
