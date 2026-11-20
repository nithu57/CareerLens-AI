import mongoose from 'mongoose';

const CitationSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    url: { type: String, default: '' },
    sourceType: { type: String, default: 'documentation' },
  },
  { _id: false }
);

const ChatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messageId: {
      type: String,
      default: () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    citations: {
      type: [CitationSchema],
      default: [],
    },
    suggestedFollowUps: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
