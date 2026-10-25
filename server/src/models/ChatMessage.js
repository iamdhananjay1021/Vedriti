import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatMessageSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'ai', 'acharya'],
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    sanskritVerse: {
      type: String,
      trim: true,
      default: null,
    },
    shastraReference: {
      type: String,
      trim: true,
      default: null,
    },
    remedy: {
      type: String,
      trim: true,
      default: null,
    },
    action: {
      type: {
        type: String,
        enum: ['puja', 'store', 'whatsapp', 'kundli', 'none'],
        default: 'none',
      },
      title: { type: String, default: null },
      targetId: { type: String, default: null },
      metadata: { type: Schema.Types.Mixed, default: null },
    },
    followUps: {
      type: [String],
      default: [],
    },
    userFeedback: {
      type: String,
      enum: ['helpful', 'unhelpful', null],
      default: null,
    },
    llmProvider: {
      type: String,
      default: 'vedic-rag-engine',
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast timeline retrieval
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
