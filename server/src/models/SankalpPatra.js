import mongoose from 'mongoose';

const { Schema } = mongoose;

const SankalpPatraSchema = new Schema(
  {
    patraId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    bookingId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    devoteeName: { type: String, required: true },
    gotra: { type: String, required: true },
    familyMembers: [{ type: String }],
    pujaName: { type: String, required: true },
    sanskritSankalpMantra: { type: String, required: true },
    acharyaName: { type: String, required: true },
    acharyaTitle: { type: String, required: true },
    acharyaVidyapeeth: { type: String, required: true },
    consecrationDate: { type: String, required: true },
    kshetra: { type: String, required: true },
    qrHash: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const SankalpPatra =
  mongoose.models.SankalpPatra || mongoose.model('SankalpPatra', SankalpPatraSchema);
