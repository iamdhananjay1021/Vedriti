import mongoose from 'mongoose';

const { Schema } = mongoose;

const FamilyParticipantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const SamuhikBookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    samuhikPujaId: { type: Schema.Types.ObjectId, ref: 'SamuhikPuja', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    devoteeName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gotra: { type: String, required: true, trim: true },
    rashi: { type: String, trim: true, default: '' },
    familyMembers: { type: [FamilyParticipantSchema], default: [] },
    sankalpWish: { type: String, trim: true, default: '' },
    tierId: { type: String, required: true }, // 'SINGLE', 'COUPLE', 'FAMILY', 'MUKHYA'
    tierName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['ONLINE', 'PAY_LATER'], default: 'ONLINE' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PAID', index: true },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    sankalpCertificateUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SamuhikBooking = mongoose.models.SamuhikBooking || mongoose.model('SamuhikBooking', SamuhikBookingSchema);

