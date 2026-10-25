import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.Mixed, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    user: { type: Schema.Types.Mixed, ref: 'User' },
    items: { type: [OrderItemSchema], required: true },
    devoteeName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true },
    pinCode: { type: String, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'UPI' },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'COD'],
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['RECEIVED', 'CONSECRATING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
      default: 'RECEIVED',
      index: true,
    },
    awbNumber: { type: String, default: 'BD-VR-STORE-5012' },
    courierPartner: { type: String, default: 'BlueDart Holy Parcel' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
