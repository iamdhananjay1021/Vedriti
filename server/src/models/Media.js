import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);
