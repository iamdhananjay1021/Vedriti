import mongoose from 'mongoose';

const { Schema } = mongoose;

const PrasadTimelineSchema = new Schema(
  {
    stage: {
      type: String,
      enum: ['SANCTUM_CONSECRATION', 'BLESSED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const BookingSchema = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    user: { type: Schema.Types.Mixed, ref: 'User' },
    pujaId: { type: Schema.Types.Mixed, ref: 'Puja' },
    pujaName: { type: String, required: true },
    packageName: { type: String, required: true },
    devoteeName: { type: String, required: true, trim: true },
    gotra: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    familyMembers: [{ type: String }],
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    address: { type: String, required: true },
    pinCode: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    punyaDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    couponCode: { type: String },
    finalDakshina: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'NETBANKING', 'COD'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'POST_SANKALP_COD'],
      default: 'PENDING',
      index: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    sankalpStatus: {
      type: String,
      enum: ['REGISTERED', 'CONSECRATED_BY_ACHARYA', 'COMPLETED'],
      default: 'REGISTERED',
      index: true,
    },
    prasadTracking: {
      currentStage: {
        type: String,
        enum: ['SANCTUM_CONSECRATION', 'BLESSED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED'],
        default: 'SANCTUM_CONSECRATION',
      },
      courierPartner: { type: String, default: 'BlueDart Express (Holy Sealed)' },
      awbNumber: { type: String, default: 'BD-VR-10809923' },
      estimatedDelivery: { type: String, default: '3-4 Business Days' },
      timeline: { type: [PrasadTimelineSchema], default: [] },
    },
    sankalpPatraId: { type: String },
    whatsappVoucherSent: { type: Boolean, default: false },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
