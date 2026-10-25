import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    userPhone: {
      type: String,
      trim: true,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'वैदिक ज्योतिष व मुहूर्त परामर्श',
    },
    category: {
      type: String,
      enum: ['Festival', 'Panchang', 'Kundali', 'Remedy', 'Puja', 'Gotra', 'General'],
      default: 'General',
    },
    devoteeContext: {
      name: { type: String, trim: true },
      gotra: { type: String, trim: true },
      rashi: { type: String, trim: true },
      nakshatra: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatSession =
  mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
