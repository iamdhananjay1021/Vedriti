import mongoose from 'mongoose';

const { Schema } = mongoose;

const SlotHoldSchema = new Schema(
  {
    date: { type: String, required: true },
    block: { type: String, required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
    blockGroup: { type: String, default: '', index: true },
    reason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

SlotHoldSchema.index({ date: 1, block: 1 }, { unique: true });

export const SlotHold = mongoose.models.SlotHold || mongoose.model('SlotHold', SlotHoldSchema);
